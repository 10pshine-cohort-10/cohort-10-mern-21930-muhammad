export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export type NoteColor = 'slate' | 'sage' | 'teal' | 'sand' | 'lavender' | 'rose';

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  color: NoteColor;
  isPinned: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NoteInput {
  id?: string;
  title?: string;
  content?: string;
  color?: NoteColor;
  isPinned?: boolean;
  tags?: string[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AuthResponseData {
  token: string;
  user: User;
}

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export interface UseNotesResult {
  notes: Note[];
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTag: string;
  setSelectedTag: (tag: string) => void;
  allTags: string[];
  createNote: (noteData: NoteInput) => Promise<Note>;
  updateNote: (id: string, noteData: NoteInput) => Promise<Note>;
  deleteNote: (id: string) => Promise<void>;
  togglePin: (id: string, isPinned: boolean) => Promise<Note>;
  exportNotes: (format?: 'json' | 'markdown') => Promise<void>;
  importNotes: (file: File) => Promise<Note[]>;
  fetchNotes: () => Promise<void>;
}
