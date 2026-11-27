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
      addCustomFolder: jest.fn(),
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

  it('renders guest scratchpad with sync banner when unauthenticated', async () => {
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

    expect(screen.getByText('Working in Scratchpad. Your notes are saved on this device only.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /create account to sync/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Scratchpad' })).toBeInTheDocument();
    expect(screen.getByText('Saved on this device only')).toBeInTheDocument();
    expect(screen.getByText('Your scratchpad is clear')).toBeInTheDocument();
    expect(screen.queryByText('Local')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /from template/i })).toBeInTheDocument();

    mockedGuestStorage.createGuestNote.mockReturnValue({
      id: 'guest-jot',
      userId: 'guest',
      title: 'Fast idea',
      content: '',
      color: 'slate',
      isPinned: false,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const quickJot = screen.getByLabelText('Quick jot input');
    fireEvent.change(quickJot, { target: { value: 'Fast idea' } });
    fireEvent.keyDown(quickJot, { key: 'Enter' });

    await waitFor(() => {
      expect(mockedGuestStorage.createGuestNote).toHaveBeenCalledWith({
        title: 'Fast idea',
        content: '',
        color: 'slate',
        tags: [],
        isPinned: false,
      });
    });
  });

  it('renders Scratchpad and promotes drafts to notes or straight to Board when authenticated', async () => {
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

    expect(screen.queryByText('Personal Draft Blotter — Fast, unfiled thoughts stored locally.')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Scratchpad' })).toBeInTheDocument();

    const addButton = screen.getByRole('button', { name: /add to notes/i });
    expect(addButton).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /move to board/i })).toBeInTheDocument();

    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockCreateNote).toHaveBeenCalledWith({
        title: 'Quick Brainstorm',
        content: '<p>A spontaneous idea</p>',
        color: 'sage',
        tags: ['ideas'],
        isPinned: false,
      });
      expect(mockedGuestStorage.deleteGuestNote).toHaveBeenCalledWith('guest-1');
      expect(screen.getByRole('status')).toHaveTextContent('Added "Quick Brainstorm" to notes');
    });
  });

  it('moves draft straight to Board To Do stage when Move to Board is clicked', async () => {
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
        id: 'guest-3',
        userId: 'u1',
        title: 'Plan Release',
        content: '<p>Ship notes</p>',
        color: 'teal',
        isPinned: true,
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);

    mockCreateNote.mockResolvedValue({ id: 'cloud-3', title: 'Plan Release' });

    render(
      <MemoryRouter>
        <ScratchpadPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /move to board/i }));

    await waitFor(() => {
      expect(mockCreateNote).toHaveBeenCalledWith({
        title: 'Plan Release',
        content: '<p>Ship notes</p>',
        color: 'teal',
        tags: ['scratch'],
        isPinned: true,
        status: 'todo',
      });
      expect(screen.getByRole('status')).toHaveTextContent('Added "Plan Release" to Board (To Do)');
    });
  });

  it('clears all local drafts when Clear Scratchpad is clicked', () => {
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

    mockedGuestStorage.getGuestNotes.mockReturnValue([
      {
        id: 'guest-2',
        userId: 'guest',
        title: 'Temp note',
        content: '',
        color: 'slate',
        isPinned: false,
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);

    render(
      <MemoryRouter>
        <ScratchpadPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /clear scratchpad/i }));
    expect(mockedGuestStorage.clearGuestNotes).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Your scratchpad is clear')).toBeInTheDocument();
  });
});
