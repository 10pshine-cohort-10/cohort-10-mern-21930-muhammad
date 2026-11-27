import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { seedCreatedActivityMigration } from '../services/activityService';

dotenv.config();

async function run(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/notes-app';
  await mongoose.connect(mongoUri);
  try {
    const result = await seedCreatedActivityMigration();
    console.log(`Seeded ${result.insertedCount} created activity row(s).`);
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
