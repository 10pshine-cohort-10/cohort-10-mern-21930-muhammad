import mongoose from 'mongoose';
import logger from '../utils/logger';

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  if (!uri || (!uri.startsWith('mongodb+srv://') && !uri.startsWith('mongodb://'))) {
    logger.fatal(
      'MONGODB_URI is required in environment variables. Example format:\n' +
      'MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/notes_app?retryWrites=true&w=majority'
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    logger.info({ uri: uri.replace(/\/\/.*@/, '//<credentials>@') }, 'MongoDB Atlas connected successfully');
  } catch (err) {
    logger.fatal({ err }, 'MongoDB connection failed');
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    logger.error({ err }, 'MongoDB connection error');
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });
}

export default connectDB;
