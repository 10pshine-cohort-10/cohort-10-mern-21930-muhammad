import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProfilePage from '../pages/ProfilePage';
import { useAuth } from '../context/AuthContext';
import { useNotes } from '../hooks/useNotes';

jest.mock('../context/AuthContext');
jest.mock('../hooks/useNotes');

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockedUseNotes = useNotes as jest.MockedFunction<typeof useNotes>;

describe('ProfilePage', () => {
  it('excludes archived notes and archive tag from active profile stats', () => {
    mockedUseAuth.mockReturnValue({
      user: { id: 'user-abc-123', name: 'Awais', email: 'awais@example.com' },
      token: 'token',
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
    });

    mockedUseNotes.mockReturnValue({
      notes: [
        {
          id: 'n1',
          userId: 'user-abc-123',
          title: 'Active Note',
          content: '',
          color: 'slate',
          isPinned: true,
          tags: ['work'],
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
        {
          id: 'n2',
          userId: 'user-abc-123',
          title: 'Archived Note',
          content: '',
          color: 'slate',
          isPinned: true,
          tags: ['archive'],
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ],
      isLoading: false,
      searchQuery: '',
      setSearchQuery: jest.fn(),
      selectedTag: '',
      setSelectedTag: jest.fn(),
      errorMessage: '',
      allTags: ['work', 'archive'],
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
      <MemoryRouter initialEntries={['/profile']}>
        <ProfilePage />
      </MemoryRouter>
    );

    const ones = screen.getAllByText('1');
    expect(ones).toHaveLength(3);
    expect(screen.getByText('user-abc-123')).toBeInTheDocument();
  });
});
