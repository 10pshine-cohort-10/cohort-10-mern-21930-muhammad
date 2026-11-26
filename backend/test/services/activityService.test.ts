import request from 'supertest';
import { expect } from 'chai';
import app from '../../src/app';
import User from '../../src/models/User';
import Note from '../../src/models/Note';
import NoteActivity from '../../src/models/NoteActivity';
import * as noteService from '../../src/services/noteService';
import * as userService from '../../src/services/userService';
import * as activityService from '../../src/services/activityService';

describe('Activity Service & /api/notes/activity', () => {
  let user1Token: string;
  let user2Token: string;
  let user1Id: string;
  let user2Id: string;

  beforeEach(async () => {
    await NoteActivity.deleteMany({});
    await Note.deleteMany({});
    await User.deleteMany({});

    const r1 = await request(app)
      .post('/api/auth/register')
      .send({ name: 'User One', email: 'act1@example.com', password: 'Password123' });
    user1Token = r1.body.data.token;
    user1Id = r1.body.data.user.id;

    const r2 = await request(app)
      .post('/api/auth/register')
      .send({ name: 'User Two', email: 'act2@example.com', password: 'Password123' });
    user2Token = r2.body.data.token;
    user2Id = r2.body.data.user.id;
  });

  it('records created, coalesces edited within 15m, and records moved status transitions', async () => {
    const created = await noteService.createNote(user1Id, { title: 'Roadmap', status: 'todo' });

    await noteService.updateNote(created.id, user1Id, { content: '<p>Edit 1</p>' });
    await noteService.updateNote(created.id, user1Id, { content: '<p>Edit 2</p>' });
    await noteService.updateNote(created.id, user1Id, { status: 'in_progress' });

    const events = await NoteActivity.find({ userId: user1Id }).sort({ createdAt: 1 });
    expect(events.map((e) => e.type)).to.deep.equal(['created', 'edited', 'moved']);
    expect(events[2].fromStatus).to.equal('todo');
    expect(events[2].toStatus).to.equal('in_progress');
  });

  it('does not fail note creation if NoteActivity write throws', async () => {
    const originalCreate = NoteActivity.create.bind(NoteActivity);
    (NoteActivity as any).create = async () => {
      throw new Error('Simulated DB failure');
    };

    try {
      const note = await noteService.createNote(user1Id, { title: 'Resilient Note' });
      expect(note.title).to.equal('Resilient Note');
    } finally {
      (NoteActivity as any).create = originalCreate;
    }
  });

  it('deletes note activity on note deletion and all user activity on account deletion', async () => {
    const n1 = await noteService.createNote(user1Id, { title: 'Note A' });
    const n2 = await noteService.createNote(user1Id, { title: 'Note B' });

    await noteService.deleteNote(n1.id, user1Id);
    const afterNoteDelete = await NoteActivity.find({ userId: user1Id });
    expect(afterNoteDelete).to.have.lengthOf(1);
    expect(String(afterNoteDelete[0].noteId)).to.equal(String(n2.id));

    await userService.deleteUserAccount(user1Id);
    const afterAccountDelete = await NoteActivity.find({ userId: user1Id });
    expect(afterAccountDelete).to.have.lengthOf(0);
  });

  it('seeds missing created events idempotently via migration', async () => {
    const rawNote = await Note.create({ userId: user1Id, title: 'Legacy Note', status: 'done' });
    await NoteActivity.deleteMany({});

    const firstRun = await activityService.seedCreatedActivityMigration();
    expect(firstRun.insertedCount).to.equal(1);

    const secondRun = await activityService.seedCreatedActivityMigration();
    expect(secondRun.insertedCount).to.equal(0);

    const seeded = await NoteActivity.findOne({ noteId: rawNote._id, type: 'created' });
    expect(seeded).to.not.be.null;
    expect(seeded!.toStatus).to.equal('done');
  });

  it('isolates GET /api/notes/activity per user and caps limit/days', async () => {
    await noteService.createNote(user1Id, { title: 'U1 Secret' });
    await noteService.createNote(user2Id, { title: 'U2 Note' });

    const res1 = await request(app)
      .get('/api/notes/activity?days=999&limit=9999')
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res1.status).to.equal(200);
    expect(res1.body.data).to.have.lengthOf(1);
    expect(res1.body.data[0].noteTitle).to.equal('U1 Secret');

    const res2 = await request(app)
      .get('/api/notes/activity')
      .set('Authorization', `Bearer ${user2Token}`);

    expect(res2.status).to.equal(200);
    expect(res2.body.data).to.have.lengthOf(1);
    expect(res2.body.data[0].noteTitle).to.equal('U2 Note');
  });
});
