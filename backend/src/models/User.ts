import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, SerializedUser } from '../types';

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email format is invalid'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Partial<IUser & { id?: string; __v?: number }>): SerializedUser {
        return {
          id: String(ret._id),
          name: ret.name || '',
          email: ret.email || '',
          createdAt: ret.createdAt || new Date(),
          updatedAt: ret.updatedAt || new Date(),
        };
      },
    },
  }
);

userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) {
    return;
  }
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
});

userSchema.methods.comparePassword = function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User = model<IUser>('User', userSchema);
export default User;
