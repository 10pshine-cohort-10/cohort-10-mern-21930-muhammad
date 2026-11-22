import type { Editor } from '@tiptap/react';
import type { ReactNode } from 'react';

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

export interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string, isPinned: boolean) => void;
}

export interface NoteEditorProps {
  note: Note | NoteInput | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (noteData: NoteInput) => Promise<void>;
}

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export interface EditorToolbarProps {
  editor: Editor | null;
}

export interface NoteMetaRowProps {
  isPinned: boolean;
  selectedColor: NoteColor;
  onTogglePin: () => void;
  onColorSelect: (color: NoteColor) => void;
}

export interface NoteTagListProps {
  tags: string[];
  tagInput: string;
  onTagInputChange: (value: string) => void;
  onTagInputKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
}

export interface TagFilterBarProps {
  tags: string[];
  selectedTag: string;
  onSelectTag: (tag: string) => void;
}

export interface ExportImportActionsProps {
  onExport: (format: 'json' | 'markdown') => void;
  onImport: (file: File) => void;
}

export interface NotesEmptyStateProps {
  hasFilters: boolean;
  onCreateNote: () => void;
  onResetFilters: () => void;
}

export interface ProtectedRouteProps {
  children: ReactNode;
}

export interface LayoutProps {
  children: ReactNode;
}
