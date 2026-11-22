import dns from 'dns';
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let inMemoryMongoServer: MongoMemoryServer | null = null;

export async function mochaGlobalSetup(): Promise<void> {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_jwt_secret_key_minimum_length_requirement_sample';
  process.env.JWT_EXPIRES_IN = '1d';
  process.env.LOG_LEVEL = 'silent';

  inMemoryMongoServer = await MongoMemoryServer.create({
    binary: {
      version: '7.0.14',
    },
    spawn: {
      timeout: 180000,
    },
  });
  const uri = inMemoryMongoServer.getUri();
  process.env.MONGODB_URI = uri;

  await mongoose.connect(uri);
}

export async function mochaGlobalTeardown(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (inMemoryMongoServer) {
    await inMemoryMongoServer.stop();
  }
}
