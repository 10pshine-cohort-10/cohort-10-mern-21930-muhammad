const request = require('supertest');
const { expect } = require('chai');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Note = require('../../src/models/Note');

describe('Note Controller Endpoints', () => {
  let authToken;
  let otherUserToken;

  beforeEach(async () => {
    await User.deleteMany({});
    await Note.deleteMany({});

    const registerRes1 = await request(app)
      .post('/api/auth/register')
      .send({ name: 'User One', email: 'user1@example.com', password: 'Password123' });
    authToken = registerRes1.body.data.token;

    const registerRes2 = await request(app)
      .post('/api/auth/register')
      .send({ name: 'User Two', email: 'user2@example.com', password: 'Password123' });
    otherUserToken = registerRes2.body.data.token;
  });

  describe('POST /api/notes & GET /api/notes', () => {
    it('creates a new note and retrieves the user list of notes', async () => {
      const createRes = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'My Project Plan',
          content: '<p>Tasks to complete</p>',
          isPinned: true,
          tags: ['cohort', 'project'],
          color: 'sage',
        });

      expect(createRes.status).to.equal(201);
      expect(createRes.body.success).to.be.true;
      expect(createRes.body.data.title).to.equal('My Project Plan');
      expect(createRes.body.data.isPinned).to.be.true;
      expect(createRes.body.data.color).to.equal('sage');

      const getRes = await request(app)
        .get('/api/notes')
        .set('Authorization', `Bearer ${authToken}`);

      expect(getRes.status).to.equal(200);
      expect(getRes.body.data).to.have.lengthOf(1);
      expect(getRes.body.data[0].title).to.equal('My Project Plan');
    });

    it('returns 401 when accessing notes without authentication', async () => {
      const response = await request(app).get('/api/notes');
      expect(response.status).to.equal(401);
    });
  });

  describe('GET /api/notes/:id, PUT /api/notes/:id, DELETE /api/notes/:id', () => {
    let createdNoteId;

    beforeEach(async () => {
      const createRes = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Target Note', content: 'Original content' });
      createdNoteId = createRes.body.data.id;
    });

    it('retrieves a note by ID for the note owner', async () => {
      const response = await request(app)
        .get(`/api/notes/${createdNoteId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.body.data.title).to.equal('Target Note');
    });

    it('returns 404 when another user requests the note by ID', async () => {
      const response = await request(app)
        .get(`/api/notes/${createdNoteId}`)
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(response.status).to.equal(404);
      expect(response.body.error).to.equal('Note not found');
    });

    it('updates note fields successfully', async () => {
      const updateRes = await request(app)
        .put(`/api/notes/${createdNoteId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Revised Note', isPinned: true });

      expect(updateRes.status).to.equal(200);
      expect(updateRes.body.data.title).to.equal('Revised Note');
      expect(updateRes.body.data.isPinned).to.be.true;
    });

    it('deletes note successfully', async () => {
      const deleteRes = await request(app)
        .delete(`/api/notes/${createdNoteId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteRes.status).to.equal(200);
      expect(deleteRes.body.data.id).to.equal(createdNoteId);

      const verifyRes = await request(app)
        .get(`/api/notes/${createdNoteId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(verifyRes.status).to.equal(404);
    });
  });

  describe('GET /api/notes/search', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Quarterly Financials', content: 'Revenue and expenses' });

      await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Grocery Run', content: 'Milk and bread' });
    });

    it('returns search matches based on query parameter', async () => {
      const response = await request(app)
        .get('/api/notes/search?q=Financials')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.body.data).to.have.lengthOf(1);
      expect(response.body.data[0].title).to.equal('Quarterly Financials');
    });
  });

  describe('GET /api/notes/export & POST /api/notes/import', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Export Item', content: 'Export Content', tags: ['backup'] });
    });

    it('exports notes as downloadable JSON file', async () => {
      const response = await request(app)
        .get('/api/notes/export?format=json')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.headers['content-type']).to.include('application/json');
      const parsed = JSON.parse(response.text);
      expect(parsed).to.be.an('array').with.lengthOf(1);
    });

    it('exports notes as Markdown file', async () => {
      const response = await request(app)
        .get('/api/notes/export?format=markdown')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.headers['content-type']).to.include('text/markdown');
      expect(response.text).to.include('# Export Item');
    });

    it('imports notes from a JSON payload', async () => {
      const importPayload = [
        { title: 'Imported A', content: 'Content A' },
        { title: 'Imported B', content: 'Content B' },
      ];

      const response = await request(app)
        .post('/api/notes/import')
        .set('Authorization', `Bearer ${authToken}`)
        .send(importPayload);

      expect(response.status).to.equal(201);
      expect(response.body.data.count).to.equal(2);
    });
  });
});
