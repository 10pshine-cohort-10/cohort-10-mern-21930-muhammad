import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from '../pages/DashboardPage';
import { useAuth } from '../context/AuthContext';
import { useNotes } from '../hooks/useNotes';

jest.mock('../context/AuthContext');
jest.mock('../hooks/useNotes');
jest.mock('../components/NoteEditor', () => () => null);

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockedUseNotes = useNotes as jest.MockedFunction<typeof useNotes>;

describe('DashboardPage folder and All Notes state sync', () => {
  beforeEach(() => {
    localStorage.clear();
    mockedUseAuth.mockReturnValue({
      user: { id: 'u1', name: 'Tester', email: 'tester@example.com' },
      token: 'token',
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
    });

    mockedUseNotes.mockImplementation((opts = {}) => {
      const [selectedTag, setSelectedTag] = useState(opts.initialTag || '');
      const allNotes = [
        {
          id: 'n1',
          userId: 'u1',
          title: 'Yea Note',
          content: '',
          color: 'sage' as const,
          isPinned: false,
          tags: ['yea'],
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
        {
          id: 'n2',
          userId: 'u1',
          title: 'General Note',
          content: '',
          color: 'slate' as const,
          isPinned: false,
          tags: ['work'],
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ];
      return {
        notes: selectedTag ? allNotes.filter((n) => n.tags.includes(selectedTag)) : allNotes,
        isLoading: false,
        searchQuery: '',
        setSearchQuery: jest.fn(),
        selectedTag,
        setSelectedTag,
        errorMessage: '',
        allTags: ['work', 'yea'],
        addCustomFolder: jest.fn((t) => t),
        fetchNotes: jest.fn(),
        createNote: jest.fn(),
        updateNote: jest.fn(),
        deleteNote: jest.fn(),
        togglePin: jest.fn(),
        exportNotes: jest.fn(),
        importNotes: jest.fn(),
        removeNoteLocally: jest.fn(),
        restoreNoteLocally: jest.fn(),
      };
    });
  });

  it('clears folder filter on single click of All Notes and toggles subfolder deterministically', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard?tag=yea']}>
        <DashboardPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Yea Note')).toBeInTheDocument();
    expect(screen.queryByText('General Note')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: /all notes/i }));
    expect(screen.getByText('General Note')).toBeInTheDocument();

    const yeaFolderBtn = screen.getByRole('button', { name: '#yea' });
    fireEvent.click(yeaFolderBtn);
    expect(screen.queryByText('General Note')).not.toBeInTheDocument();

    fireEvent.click(yeaFolderBtn);
    expect(screen.getByText('General Note')).toBeInTheDocument();

    fireEvent.click(yeaFolderBtn);
    expect(screen.queryByText('General Note')).not.toBeInTheDocument();
  });
});
