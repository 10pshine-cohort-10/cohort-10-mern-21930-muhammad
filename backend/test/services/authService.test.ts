import { expect } from 'chai';
import jwt from 'jsonwebtoken';
import User from '../../src/models/User';
import AppError from '../../src/utils/appError';
import { registerUser, loginUser } from '../../src/services/authService';

describe('Auth Service', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('registerUser', () => {
    it('creates a user, hashes password, and returns a valid JWT token', async () => {
      const result = await registerUser('Alice Doe', 'alice@example.com', 'SecurePassword123');

      expect(result).to.have.property('token');
      expect(result).to.have.property('user');
      expect(result.user.name).to.equal('Alice Doe');
      expect(result.user.email).to.equal('alice@example.com');
      expect(result.user).to.not.have.property('passwordHash');

      const decoded = jwt.verify(result.token, process.env.JWT_SECRET as string);
      expect(decoded).to.be.an('object');
      const payload = decoded as { email: string; userId: string };
      expect(payload.email).to.equal('alice@example.com');

      const savedUser = await User.findOne({ email: 'alice@example.com' });
      expect(savedUser).to.not.be.null;
      expect(savedUser!.passwordHash).to.not.equal('SecurePassword123');
    });

    it('throws a 409 conflict error when email is already registered', async () => {
      await registerUser('First User', 'duplicate@example.com', 'Password123');

      try {
        await registerUser('Second User', 'duplicate@example.com', 'Password123');
        expect.fail('Should have thrown an error');
      } catch (err: unknown) {
        expect(err).to.be.instanceOf(AppError);
        const appError = err as AppError;
        expect(appError.status).to.equal(409);
        expect(appError.message).to.equal('Email is already registered');
      }
    });

    it('throws a 400 bad request error when password is under 8 characters', async () => {
      try {
        await registerUser('Short Pass', 'short@example.com', 'pass');
        expect.fail('Should have thrown an error');
      } catch (err: unknown) {
        expect(err).to.be.instanceOf(AppError);
        const appError = err as AppError;
        expect(appError.status).to.equal(400);
        expect(appError.message).to.equal('Password must be at least 8 characters long');
      }
    });

    it('throws a 400 bad request error when password exceeds 72 bytes', async () => {
      const longPassword = 'A'.repeat(73);
      try {
        await registerUser('Long Pass', 'long@example.com', longPassword);
        expect.fail('Should have thrown an error');
      } catch (err: unknown) {
        expect(err).to.be.instanceOf(AppError);
        const appError = err as AppError;
        expect(appError.status).to.equal(400);
        expect(appError.message).to.equal('Password cannot exceed 72 bytes');
      }
    });
  });

  describe('loginUser', () => {
    beforeEach(async () => {
      await registerUser('Login Test User', 'logintest@example.com', 'ValidPassword123');
    });

    it('authenticates user with correct credentials and returns JWT token', async () => {
      const result = await loginUser('logintest@example.com', 'ValidPassword123');

      expect(result).to.have.property('token');
      expect(result.user.email).to.equal('logintest@example.com');
    });

    it('throws 401 error when password is incorrect', async () => {
      try {
        await loginUser('logintest@example.com', 'WrongPassword456');
        expect.fail('Should have thrown an error');
      } catch (err: unknown) {
        expect(err).to.be.instanceOf(AppError);
        const appError = err as AppError;
        expect(appError.status).to.equal(401);
        expect(appError.message).to.equal('Invalid email or password');
      }
    });

    it('throws 401 error when email is not registered', async () => {
      try {
        await loginUser('nonexistent@example.com', 'Password123');
        expect.fail('Should have thrown an error');
      } catch (err: unknown) {
        expect(err).to.be.instanceOf(AppError);
        const appError = err as AppError;
        expect(appError.status).to.equal(401);
        expect(appError.message).to.equal('Invalid email or password');
      }
    });

    it('throws 400 error when email is whitespace or empty after normalization', async () => {
      try {
        await loginUser('   ', 'Password123');
        expect.fail('Should have thrown an error');
      } catch (err: unknown) {
        expect(err).to.be.instanceOf(AppError);
        const appError = err as AppError;
        expect(appError.status).to.equal(400);
        expect(appError.message).to.equal('Email is required');
      }
    });
  });
});
