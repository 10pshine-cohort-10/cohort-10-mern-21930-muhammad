import mongoose, { Schema, Types, Document } from 'mongoose';
import type { NoteStatus } from '../types';

export type NoteActivityType = 'created' | 'edited' | 'moved';

export interface INoteActivity {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  noteId: Types.ObjectId;
  noteTitle: string;
  type: NoteActivityType;
  fromStatus: NoteStatus | null;
  toStatus: NoteStatus | null;
  createdAt: Date;
}

export type NoteActivityDocument = Document<unknown, object, INoteActivity> & INoteActivity;

const noteActivitySchema = new Schema<INoteActivity>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    noteId: {
      type: Schema.Types.ObjectId,
      ref: 'Note',
      required: true,
    },
    noteTitle: {
      type: String,
      required: true,
      trim: true,
      default: 'Untitled',
    },
    type: {
      type: String,
      enum: ['created', 'edited', 'moved'],
      required: true,
    },
    fromStatus: {
      type: String,
      enum: ['todo', 'in_progress', 'done'],
      default: null,
    },
    toStatus: {
      type: String,
      enum: ['todo', 'in_progress', 'done'],
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = ret._id ? String(ret._id) : undefined;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

noteActivitySchema.index({ userId: 1, createdAt: -1 });
noteActivitySchema.index({ userId: 1, noteId: 1, type: 1, createdAt: -1 });

const NoteActivity = mongoose.model<INoteActivity>('NoteActivity', noteActivitySchema);

export default NoteActivity;
