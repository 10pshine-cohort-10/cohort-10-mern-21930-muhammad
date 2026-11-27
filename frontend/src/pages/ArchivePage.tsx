import { useState } from 'react';
import { Archive, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import ArchiveNoteCard from '../components/ArchiveNoteCard';
import { useNotes } from '../hooks/useNotes';
import type { Note } from '../types';
import styles from './ArchivePage.module.css';

export default function ArchivePage() {
  const { notes, isLoading, errorMessage, fetchNotes, updateNote, deleteNote } = useNotes();
  const [isConfirmingEmpty, setIsConfirmingEmpty] = useState(false);
  const [isEmptying, setIsEmptying] = useState(false);
  const [actionError, setActionError] = useState('');

  const archivedNotes = notes.filter(
    (singleNote: Note) => Array.isArray(singleNote.tags) && singleNote.tags.includes('archive')
  );

  const handleRestoreNote = async (noteToRestore: Note) => {
    setActionError('');
    try {
      const updatedTags = (noteToRestore.tags || []).filter((tag) => tag !== 'archive');
      await updateNote(noteToRestore.id, { tags: updatedTags });
    } catch (err) {
      console.error('Failed to restore archived note:', err);
      setActionError(`Could not restore "${noteToRestore.title || 'Untitled'}". Please try again.`);
    }
  };

  const handleDeletePermanent = async (noteId: string) => {
    setActionError('');
    try {
      await deleteNote(noteId);
    } catch (err) {
      console.error('Failed to permanently delete archived note:', err);
      setActionError('Could not permanently delete this note. Please try again.');
    }
  };

  const handleEmptyArchive = async () => {
    setIsEmptying(true);
    setActionError('');
    try {
      await Promise.all(archivedNotes.map((singleNote) => deleteNote(singleNote.id)));
      setIsConfirmingEmpty(false);
    } catch (err) {
      console.error('Failed to empty archive:', err);
      setActionError('Could not delete all archived notes. Please try again.');
    } finally {
      setIsEmptying(false);
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <div className={styles.titleGroup}>
            <h1 className={styles.title}>Archive</h1>
            <p className={styles.subtitle}>
              Restore notes to your workspace or delete them permanently.
            </p>
          </div>

          {archivedNotes.length > 0 && !isConfirmingEmpty && (
            <button
              type="button"
              className={styles.emptyAllBtn}
              onClick={() => setIsConfirmingEmpty(true)}
            >
              <Trash2 size={15} />
              <span>Empty Archive ({archivedNotes.length})</span>
            </button>
          )}
        </div>

        {isConfirmingEmpty && archivedNotes.length > 0 && (
          <div className={styles.confirmBar} role="region" aria-label="Confirm empty archive">
            <span>
              Delete all {archivedNotes.length} archived {archivedNotes.length === 1 ? 'note' : 'notes'} permanently?
            </span>
            <div className={styles.confirmBarActions}>
              <button
                type="button"
                className={styles.confirmDangerBtn}
                onClick={handleEmptyArchive}
                disabled={isEmptying}
              >
                {isEmptying ? 'Deleting...' : 'Delete all forever'}
              </button>
              <button
                type="button"
                className={styles.confirmCancelBtn}
                onClick={() => setIsConfirmingEmpty(false)}
                disabled={isEmptying}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {actionError && (
          <div className={styles.confirmBar} role="alert">
            <span>{actionError}</span>
          </div>
        )}

        {errorMessage && (
          <div className={styles.confirmBar} role="alert">
            <span>{errorMessage}</span>
            <button type="button" className={styles.confirmCancelBtn} onClick={() => fetchNotes()}>
              Retry
            </button>
          </div>
        )}

        {isLoading ? (
          <p className={styles.emptySubtitle}>Loading archived notes...</p>
        ) : archivedNotes.length === 0 ? (
          <div className={styles.emptyState}>
            <Archive size={40} color="var(--text-subtle)" />
            <h2 className={styles.emptyTitle}>Archive is clear</h2>
            <p className={styles.emptySubtitle}>
              Notes you archive will appear here until you restore or delete them.
            </p>
          </div>
        ) : (
          <div className={styles.notesGrid}>
            {archivedNotes.map((singleNote) => (
              <ArchiveNoteCard
                key={singleNote.id}
                note={singleNote}
                onRestore={handleRestoreNote}
                onDeletePermanent={handleDeletePermanent}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
