import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ArchivePage from '../pages/ArchivePage';
import { useNotes } from '../hooks/useNotes';
import { useAuth } from '../context/AuthContext';
import type { Note } from '../types';

jest.mock('../hooks/useNotes');
jest.mock('../context/AuthContext');

const mockedUseNotes = useNotes as jest.MockedFunction<typeof useNotes>;
const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('ArchivePage Component', () => {
  const sampleArchivedNote: Note = {
    id: 'archived-1',
    userId: 'u1',
    title: 'Archived Meeting Notes',
    content: '<p>Old discussion</p>',
    color: 'slate',
    isPinned: false,
    tags: ['archive'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    mockedUseAuth.mockReturnValue({
      user: { id: 'u1', name: 'Tester', email: 'tester@example.com' },
      token: 'fake-token',
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
    });
  });

  it('renders empty state when there are no archived notes', () => {
    mockedUseNotes.mockReturnValue({
      notes: [],
      isLoading: false,
      searchQuery: '',
      setSearchQuery: jest.fn(),
      selectedTag: '',
      setSelectedTag: jest.fn(),
      errorMessage: '',
      allTags: [],
      addCustomFolder: jest.fn(),
      fetchNotes: jest.fn(),
      createNote: jest.fn(),
      updateNote: jest.fn(),
      deleteNote: jest.fn(),
      togglePin: jest.fn(),
      exportNotes: jest.fn(),
      importNotes: jest.fn(),
      removeNoteLocally: jest.fn(),
      restoreNoteLocally: jest.fn(),
    });

    render(
      <MemoryRouter>
        <ArchivePage />
      </MemoryRouter>
    );

    expect(screen.getByText('Archive is clear')).toBeInTheDocument();
  });

  it('renders archived note cards and triggers restore', () => {
    const mockUpdate = jest.fn();
    mockedUseNotes.mockReturnValue({
      notes: [sampleArchivedNote],
      isLoading: false,
      searchQuery: '',
      setSearchQuery: jest.fn(),
      selectedTag: '',
      setSelectedTag: jest.fn(),
      errorMessage: '',
      allTags: ['archive'],
      addCustomFolder: jest.fn(),
      fetchNotes: jest.fn(),
      createNote: jest.fn(),
      updateNote: mockUpdate,
      deleteNote: jest.fn(),
      togglePin: jest.fn(),
      exportNotes: jest.fn(),
      importNotes: jest.fn(),
      removeNoteLocally: jest.fn(),
      restoreNoteLocally: jest.fn(),
    });

    render(
      <MemoryRouter>
        <ArchivePage />
      </MemoryRouter>
    );

    expect(screen.getByText('Archived Meeting Notes')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /restore/i }));
    expect(mockUpdate).toHaveBeenCalledWith('archived-1', { tags: [] });
  });
});
