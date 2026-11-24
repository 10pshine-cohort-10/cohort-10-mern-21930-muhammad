import { Archive, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import ArchiveNoteCard from '../components/ArchiveNoteCard';
import { useNotes } from '../hooks/useNotes';
import type { Note } from '../types';
import styles from './ArchivePage.module.css';

export default function ArchivePage() {
  const { notes, isLoading, updateNote, deleteNote } = useNotes();

  const safeNotes = Array.isArray(notes) ? notes : [];
  const archivedNotes = safeNotes.filter(
    (singleNote: Note) => Boolean(singleNote) && Array.isArray(singleNote.tags) && singleNote.tags.includes('archive')
  );

  const handleRestoreNote = async (noteToRestore: Note) => {
    const updatedTags = (noteToRestore.tags || []).filter((tag) => tag !== 'archive');
    await updateNote(noteToRestore.id, { tags: updatedTags });
  };

  const handleDeletePermanent = async (noteId: string) => {
    await deleteNote(noteId);
  };

  const handleEmptyArchive = async () => {
    await Promise.all(archivedNotes.map((singleNote) => deleteNote(singleNote.id)));
  };

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <div className={styles.titleGroup}>
            <h2 className={styles.title}>Archive & Soft Trash</h2>
            <p className={styles.subtitle}>
              Resting place for cleared thoughts. Restore items to your active desk or delete them forever.
            </p>
          </div>

          {archivedNotes.length > 0 && (
            <button
              type="button"
              className={styles.emptyAllBtn}
              onClick={handleEmptyArchive}
            >
              <Trash2 size={15} />
              <span>Empty Archive ({archivedNotes.length})</span>
            </button>
          )}
        </div>

        {isLoading ? (
          <p className={styles.emptySubtitle}>Loading archive items...</p>
        ) : archivedNotes.length === 0 ? (
          <div className={styles.emptyState}>
            <Archive size={40} color="var(--text-subtle)" />
            <h4 className={styles.emptyTitle}>Archive is clear</h4>
            <p className={styles.emptySubtitle}>
              Notes marked as archived or moved to trash will appear here.
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
