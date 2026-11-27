import { Schema, model } from 'mongoose';
import { INote } from '../types';

const noteSchema = new Schema<INote>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      default: 'Untitled',
      trim: true,
      maxlength: [255, 'Title cannot exceed 255 characters'],
    },
    content: {
      type: String,
      default: '',
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
    color: {
      type: String,
      enum: ['slate', 'sage', 'teal', 'sand', 'lavender', 'rose'],
      default: 'slate',
    },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'done'],
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

noteSchema.index({ userId: 1, isPinned: -1, createdAt: -1 });
noteSchema.index({ title: 'text', content: 'text', tags: 'text' });

export const Note = model<INote>('Note', noteSchema);
export default Note;
