const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let inMemoryMongoServer = null;

exports.mochaGlobalSetup = async function () {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_jwt_secret_key_minimum_length_requirement_sample';
  process.env.JWT_EXPIRES_IN = '1d';
  process.env.LOG_LEVEL = 'silent';

  inMemoryMongoServer = await MongoMemoryServer.create({
    spawn: {
      timeout: 120000,
    },
  });
  const uri = inMemoryMongoServer.getUri();
  process.env.MONGODB_URI = uri;

  await mongoose.connect(uri);
};

exports.mochaGlobalTeardown = async function () {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (inMemoryMongoServer) {
    await inMemoryMongoServer.stop();
  }
};
