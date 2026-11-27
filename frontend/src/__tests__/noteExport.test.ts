import {
  buildExportFilename,
  serializeNotesToJson,
  serializeNotesToMarkdown,
  serializeNotesToText,
} from '../utils/noteExport';
import type { Note } from '../types';

const sampleNote: Note = {
  id: 'n1',
  userId: 'u1',
  title: 'Architecture Notes',
  content: '<p>Keep modules small.</p>',
  color: 'teal',
  status: 'in_progress',
  isPinned: true,
  tags: ['work', 'arch'],
  createdAt: '2026-11-26T08:00:00.000Z',
  updatedAt: '2026-11-26T10:00:00.000Z',
};

describe('noteExport', () => {
  it('serializes JSON cleanly with status and fields preserved for re-import', () => {
    const parsed = JSON.parse(serializeNotesToJson([sampleNote]));
    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toMatchObject({
      title: 'Architecture Notes',
      content: '<p>Keep modules small.</p>',
      color: 'teal',
      status: 'in_progress',
      isPinned: true,
      tags: ['work', 'arch'],
    });
    expect(parsed[0]._id).toBeUndefined();
  });

  it('serializes combined Markdown with dividers and tags', () => {
    const md = serializeNotesToMarkdown([sampleNote, { ...sampleNote, id: 'n2', title: 'Second' }]);
    expect(md).toContain('# Architecture Notes');
    expect(md).toContain('Tags: work, arch');
    expect(md).toContain('# Second');
    expect(md).toContain('---');
  });

  it('serializes plain text and builds scoped filenames', () => {
    const txt = serializeNotesToText([sampleNote]);
    expect(txt).toContain('Architecture Notes');
    expect(txt).toContain('Keep modules small.');

    expect(buildExportFilename('single', 'markdown', 'My Note')).toMatch(/^my-note-\d{4}-\d{2}-\d{2}\.md$/);
    expect(buildExportFilename('folder', 'json', 'Work')).toMatch(/^notes-work-\d{4}-\d{2}-\d{2}\.json$/);
    expect(buildExportFilename('selected', 'txt')).toMatch(/^notes-selected-\d{4}-\d{2}-\d{2}\.txt$/);
  });
});
