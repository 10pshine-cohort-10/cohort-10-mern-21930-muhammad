import { expect } from 'chai';
import mongoose from 'mongoose';
import Note from '../../src/models/Note';
import * as noteService from '../../src/services/noteService';

describe('Note Service', () => {
  const userIdA = new mongoose.Types.ObjectId();
  const userIdB = new mongoose.Types.ObjectId();

  beforeEach(async () => {
    await Note.deleteMany({});
  });

  describe('createNote', () => {
    it('creates a note with sanitized content and default title when title is omitted', async () => {
      const createdNote = await noteService.createNote(userIdA, {
        content: '<p>Safe text</p><script>alert("xss")</script>',
        tags: ['work', 'urgent'],
        color: 'teal',
      });

      expect(createdNote).to.have.property('id');
      expect(createdNote.title).to.equal('Untitled');
      expect(createdNote.content).to.equal('<p>Safe text</p>');
      expect(createdNote.tags).to.deep.equal(['work', 'urgent']);
      expect(createdNote.color).to.equal('teal');
    });

    it('strips inline javascript event handlers from content', async () => {
      const createdNote = await noteService.createNote(userIdA, {
        title: 'Security Test',
        content: '<img src="x" onerror="stealCookies()">Clean content',
      });

      expect(createdNote.content).to.not.include('onerror');
      expect(createdNote.content).to.include('Clean content');
    });

    it('strips tags not in the editor allowlist including slash-separated attributes', async () => {
      const createdNote = await noteService.createNote(userIdA, {
        title: 'XSS Bypass Test',
        content: '<p>Safe</p><img/onerror=alert(1) src=x><svg onload=alert(2)><iframe src="evil"></iframe>',
      });

      expect(createdNote.content).to.equal('<p>Safe</p>');
      expect(createdNote.content).to.not.include('img');
      expect(createdNote.content).to.not.include('svg');
      expect(createdNote.content).to.not.include('iframe');
    });

    it('throws 400 when note content exceeds processing budget', async () => {
      const oversizedContent = 'a'.repeat(noteService.MAX_CONTENT_LENGTH + 1);
      try {
        await noteService.createNote(userIdA, { content: oversizedContent });
        expect.fail('Should have thrown an error');
      } catch (err: any) {
        expect(err.status).to.equal(400);
        expect(err.message).to.equal('Note content exceeds processing budget');
      }
    });
  });

  describe('getNotes', () => {
    beforeEach(async () => {
      await noteService.createNote(userIdA, { title: 'Note 1', isPinned: false });
      await noteService.createNote(userIdA, { title: 'Pinned Note', isPinned: true });
      await noteService.createNote(userIdB, { title: 'Other User Note', isPinned: true });
    });

    it('returns only notes belonging to the requesting user with pinned notes first', async () => {
      const notes = await noteService.getNotes(userIdA);

      expect(notes).to.have.lengthOf(2);
      expect(notes[0].title).to.equal('Pinned Note');
      expect(notes[1].title).to.equal('Note 1');
    });

    it('filters notes by tag when tag option is supplied', async () => {
      await noteService.createNote(userIdA, { title: 'Tagged', tags: ['research'] });

      const filteredNotes = await noteService.getNotes(userIdA, { tag: 'research' });
      expect(filteredNotes).to.have.lengthOf(1);
      expect(filteredNotes[0].title).to.equal('Tagged');
    });
  });

  describe('getNoteById', () => {
    it('throws 404 when note belongs to another user', async () => {
      const noteA = await noteService.createNote(userIdA, { title: 'Private A' });

      try {
        await noteService.getNoteById(noteA.id, userIdB);
        expect.fail('Should have thrown an error');
      } catch (err: any) {
        expect(err.status).to.equal(404);
        expect(err.message).to.equal('Note not found');
      }
    });
  });

  describe('updateNote', () => {
    it('updates title, sanitized content, and pin status', async () => {
      const initial = await noteService.createNote(userIdA, { title: 'Original', isPinned: false });

      const updated = await noteService.updateNote(initial.id, userIdA, {
        title: 'Updated Title',
        content: 'New content',
        isPinned: true,
      });

      expect(updated.title).to.equal('Updated Title');
      expect(updated.content).to.equal('New content');
      expect(updated.isPinned).to.be.true;
    });

    it('throws 404 when attempting to update another user note', async () => {
      const noteA = await noteService.createNote(userIdA, { title: 'Owned by A' });

      try {
        await noteService.updateNote(noteA.id, userIdB, { title: 'Hacked' });
        expect.fail('Should have thrown an error');
      } catch (err: any) {
        expect(err.status).to.equal(404);
        expect(err.message).to.equal('Note not found');
      }
    });
  });

  describe('deleteNote', () => {
    it('deletes the specified note and returns its ID', async () => {
      const note = await noteService.createNote(userIdA, { title: 'To Delete' });
      const result = await noteService.deleteNote(note.id, userIdA);

      expect(result.id).to.equal(note.id);
      const remaining = await Note.findById(note.id);
      expect(remaining).to.be.null;
    });

    it('throws 404 when attempting to delete another user note', async () => {
      const noteA = await noteService.createNote(userIdA, { title: 'Owned by A' });

      try {
        await noteService.deleteNote(noteA.id, userIdB);
        expect.fail('Should have thrown an error');
      } catch (err: any) {
        expect(err.status).to.equal(404);
        expect(err.message).to.equal('Note not found');
      }
    });
  });

  describe('searchNotes', () => {
    beforeEach(async () => {
      await noteService.createNote(userIdA, { title: 'Meeting notes with client', content: 'Discuss project' });
      await noteService.createNote(userIdA, { title: 'Shopping List', content: 'Apples, oranges' });
      await noteService.createNote(userIdB, { title: 'Meeting notes from competitor', content: 'Secret' });
    });

    it('returns matching notes belonging strictly to the requesting user', async () => {
      const searchResults = await noteService.searchNotes(userIdA, 'Meeting');

      expect(searchResults).to.have.lengthOf(1);
      expect(searchResults[0].title).to.equal('Meeting notes with client');
    });

    it('returns all notes when search query is empty', async () => {
      const searchResults = await noteService.searchNotes(userIdA, '   ');
      expect(searchResults).to.have.lengthOf(2);
    });

    it('safely handles special regex characters in search query without injection', async () => {
      const searchResults = await noteService.searchNotes(userIdA, '.*');
      expect(searchResults).to.have.lengthOf(0);
    });
  });

  describe('exportNotes & importNotes', () => {
    beforeEach(async () => {
      await noteService.createNote(userIdA, {
        title: 'Export Test',
        content: '<p>HTML body</p>',
        tags: ['test'],
      });
    });

    it('exports notes as valid JSON string', async () => {
      const exportData = await noteService.exportNotes(userIdA, 'json');

      expect(exportData.contentType).to.include('application/json');
      const parsed = JSON.parse(exportData.content);
      expect(parsed).to.be.an('array').with.lengthOf(1);
      expect(parsed[0].title).to.equal('Export Test');
    });

    it('exports notes formatted as Markdown document', async () => {
      const exportData = await noteService.exportNotes(userIdA, 'markdown');

      expect(exportData.contentType).to.include('text/markdown');
      expect(exportData.content).to.include('# Export Test');
      expect(exportData.content).to.include('HTML body');
    });

    it('imports an array of notes for the user', async () => {
      const importPayload = [
        { title: 'Imported Note 1', content: 'Imported body 1', tags: ['imported'] },
        { title: 'Imported Note 2', content: 'Imported body 2', isPinned: true },
      ];

      const importResult = await noteService.importNotes(userIdB, importPayload);
      expect(importResult.count).to.equal(2);

      const notesForB = await noteService.getNotes(userIdB);
      expect(notesForB).to.have.lengthOf(2);
    });

    it('throws 400 when import payload is not an array', async () => {
      try {
        await noteService.importNotes(userIdA, null);
        expect.fail('Should have thrown an error');
      } catch (err: any) {
        expect(err.status).to.equal(400);
        expect(err.message).to.include('expected an array');
      }
    });

    it('throws 400 when imported note content exceeds processing budget', async () => {
      const oversizedPayload = [
        { title: 'Oversized Note', content: 'b'.repeat(noteService.MAX_CONTENT_LENGTH + 1) },
      ];

      try {
        await noteService.importNotes(userIdA, oversizedPayload);
        expect.fail('Should have thrown an error');
      } catch (err: any) {
        expect(err.status).to.equal(400);
        expect(err.message).to.include('processing budget');
      }
    });
  });
});
