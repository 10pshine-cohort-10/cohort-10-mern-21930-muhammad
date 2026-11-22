import { Request } from 'express';
import { Types, Document } from 'mongoose';

export type NoteColor = 'slate' | 'sage' | 'teal' | 'sand' | 'lavender' | 'rose';

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export type UserDocument = Document<unknown, object, IUser> & IUser;

export interface INote {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  content: string;
  color: NoteColor;
  isPinned: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type NoteDocument = Document<unknown, object, INote> & INote;

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export interface AuthRequest extends Request {
  userId?: string;
}

export interface SerializedUser {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NoteCreateInput {
  title?: string;
  content?: string;
  color?: string;
  isPinned?: boolean;
  tags?: string[];
}

export interface NoteUpdateInput {
  title?: string;
  content?: string;
  color?: string;
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
  user: SerializedUser;
}
