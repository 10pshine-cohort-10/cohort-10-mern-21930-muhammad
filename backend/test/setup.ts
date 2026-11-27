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

  try {
    inMemoryMongoServer = await MongoMemoryServer.create({
      binary: {
        version: '7.0.14',
      },
      instance: {
        launchTimeout: 180000,
      },
    });
    const uri = inMemoryMongoServer.getUri();
    process.env.MONGODB_URI = uri;

    await mongoose.connect(uri);
  } catch (err) {
    if (inMemoryMongoServer) {
      await inMemoryMongoServer.stop();
      inMemoryMongoServer = null;
    }
    throw err;
  }
}

export async function mochaGlobalTeardown(): Promise<void> {
  let disconnectError: unknown = null;
  let stopError: unknown = null;

  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  } catch (err) {
    disconnectError = err;
  }

  try {
    if (inMemoryMongoServer) {
      await inMemoryMongoServer.stop();
      inMemoryMongoServer = null;
    }
  } catch (err) {
    stopError = err;
  }

  if (disconnectError && stopError) {
    const combined = new Error(
      `Teardown failed: [Disconnect Error]: ${disconnectError instanceof Error ? disconnectError.message : String(disconnectError)}; [Stop Error]: ${stopError instanceof Error ? stopError.message : String(stopError)}`
    );
    throw combined;
  }
  if (disconnectError) {
    throw disconnectError;
  }
  if (stopError) {
    throw stopError;
  }
}
