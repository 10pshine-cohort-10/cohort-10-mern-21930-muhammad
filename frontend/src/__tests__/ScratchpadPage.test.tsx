import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ScratchpadPage from '../pages/ScratchpadPage';
import { useAuth } from '../context/AuthContext';
import { useNotes } from '../hooks/useNotes';
import * as guestStorage from '../utils/guestStorage';

jest.mock('../context/AuthContext');
jest.mock('../hooks/useNotes');
jest.mock('../utils/guestStorage');

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockedUseNotes = useNotes as jest.MockedFunction<typeof useNotes>;
const mockedGuestStorage = guestStorage as jest.Mocked<typeof guestStorage>;

describe('ScratchpadPage', () => {
  const mockCreateNote = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseNotes.mockReturnValue({
      notes: [],
      isLoading: false,
      searchQuery: '',
      setSearchQuery: jest.fn(),
      selectedTag: '',
      setSelectedTag: jest.fn(),
      errorMessage: '',
      allTags: [],
      fetchNotes: jest.fn(),
      createNote: mockCreateNote,
      updateNote: jest.fn(),
      deleteNote: jest.fn(),
      togglePin: jest.fn(),
      exportNotes: jest.fn(),
      importNotes: jest.fn(),
      removeNoteLocally: jest.fn(),
      restoreNoteLocally: jest.fn(),
    });
  });

  it('renders guest scratchpad with sync banner when unauthenticated', () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
    });

    mockedGuestStorage.getGuestNotes.mockReturnValue([]);

    render(
      <MemoryRouter>
        <ScratchpadPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Working in Guest Scratchpad. Your notes are saved locally in this browser.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /create account to sync/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Notes Scratchpad' })).toBeInTheDocument();
  });

  it('renders Draft Blotter and allows tacking note to desk when authenticated', async () => {
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

    mockedGuestStorage.getGuestNotes.mockReturnValue([
      {
        id: 'guest-1',
        userId: 'u1',
        title: 'Quick Brainstorm',
        content: '<p>A spontaneous idea</p>',
        color: 'sage',
        isPinned: false,
        tags: ['ideas'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);

    mockCreateNote.mockResolvedValue({ id: 'cloud-1', title: 'Quick Brainstorm' });

    render(
      <MemoryRouter>
        <ScratchpadPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Personal Draft Blotter — Fast, unfiled thoughts stored locally.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Draft Blotter' })).toBeInTheDocument();

    const tackButton = screen.getByRole('button', { name: /tack to desk/i });
    expect(tackButton).toBeInTheDocument();

    fireEvent.click(tackButton);

    await waitFor(() => {
      expect(mockCreateNote).toHaveBeenCalledWith({
        title: 'Quick Brainstorm',
        content: '<p>A spontaneous idea</p>',
        color: 'sage',
        tags: ['ideas'],
        isPinned: false,
      });
      expect(mockedGuestStorage.deleteGuestNote).toHaveBeenCalledWith('guest-1');
    });
  });
});
