export interface UserDocument {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  comparePassword: (candidatePassword: string) => Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

export type NoteColor = 'slate' | 'sage' | 'teal' | 'sand' | 'lavender' | 'rose';

export interface NoteDocument {
  id: string;
  userId: string;
  title: string;
  content: string;
  color: NoteColor;
  isPinned: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface NoteCreateInput {
  title?: string;
  content?: string;
  color?: NoteColor;
  isPinned?: boolean;
  tags?: string[];
}

export interface NoteUpdateInput {
  title?: string;
  content?: string;
  color?: NoteColor;
  isPinned?: boolean;
  tags?: string[];
}

export interface ExportResult {
  contentType: string;
  filename: string;
  content: string;
}

export interface AuthSuccessPayload {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface AppError extends Error {
  status: number;
}

declare global {
  interface Error {
    status?: number;
  }
}
