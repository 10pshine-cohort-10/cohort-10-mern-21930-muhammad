const request = require('supertest');
const { expect } = require('chai');
const app = require('../../src/app');
const User = require('../../src/models/User');

describe('Auth & User Controller Endpoints', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('returns 201 with token and user details on valid registration', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'StrongPassword123',
        });

      expect(response.status).to.equal(201);
      expect(response.body.success).to.be.true;
      expect(response.body.data).to.have.property('token');
      expect(response.body.data.user.email).to.equal('jane@example.com');
      expect(response.body.data.user).to.not.have.property('passwordHash');
    });

    it('returns 400 when name is missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'noname@example.com',
          password: 'StrongPassword123',
        });

      expect(response.status).to.equal(400);
      expect(response.body.success).to.be.false;
      expect(response.body.error).to.equal('Name is required');
    });

    it('returns 409 when registering with an existing email', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Existing User',
          email: 'existing@example.com',
          password: 'StrongPassword123',
        });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate Attempt',
          email: 'existing@example.com',
          password: 'AnotherPassword123',
        });

      expect(response.status).to.equal(409);
      expect(response.body.success).to.be.false;
      expect(response.body.error).to.equal('Email is already registered');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Login User',
          email: 'loginuser@example.com',
          password: 'CorrectPassword123',
        });
    });

    it('returns 200 with token upon successful credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'loginuser@example.com',
          password: 'CorrectPassword123',
        });

      expect(response.status).to.equal(200);
      expect(response.body.success).to.be.true;
      expect(response.body.data).to.have.property('token');
      expect(response.body.data.user.email).to.equal('loginuser@example.com');
    });

    it('returns 401 when password does not match', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'loginuser@example.com',
          password: 'IncorrectPassword999',
        });

      expect(response.status).to.equal(401);
      expect(response.body.success).to.be.false;
      expect(response.body.error).to.equal('Invalid email or password');
    });
  });

  describe('GET /api/users/me', () => {
    let authToken;

    beforeEach(async () => {
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Current Profile User',
          email: 'profile@example.com',
          password: 'ProfilePassword123',
        });
      authToken = registerResponse.body.data.token;
    });

    it('returns 200 with user profile when authenticated', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.body.success).to.be.true;
      expect(response.body.data.email).to.equal('profile@example.com');
      expect(response.body.data.name).to.equal('Current Profile User');
    });

    it('returns 401 when no token is provided', async () => {
      const response = await request(app).get('/api/users/me');

      expect(response.status).to.equal(401);
      expect(response.body.success).to.be.false;
      expect(response.body.error).to.equal('No token provided');
    });
  });
});
