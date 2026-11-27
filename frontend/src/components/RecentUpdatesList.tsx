import { Clock } from 'lucide-react';
import { formatRelativeTime } from '../utils/formatters';
import type { Note } from '../types';
import styles from '../pages/InsightsPage.module.css';

export interface RecentUpdatesListProps {
  notes: Note[];
  onOpenDashboard: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

export default function RecentUpdatesList({ notes, onOpenDashboard }: RecentUpdatesListProps) {
  const recent = [...notes]
    .filter((n) => !(Array.isArray(n.tags) && n.tags.includes('archive')))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <section className={styles.recentCard} aria-label="Recently updated notes">
      <div className={styles.cardHeader}>
        <div>
          <h2 className={styles.cardTitle}>Recent Activity</h2>
          <p className={styles.cardSubtitle}>Last time your notes were updated</p>
        </div>
        <button type="button" className={styles.linkBtn} onClick={onOpenDashboard}>
          Open Notes
        </button>
      </div>

      {recent.length === 0 ? (
        <p className={styles.emptyRecent}>No notes updated yet.</p>
      ) : (
        <ul className={styles.recentList}>
          {recent.map((note) => (
            <li key={note.id} className={styles.recentItem}>
              <div className={styles.recentMain}>
                <span className={styles.recentTitle}>{note.title || 'Untitled'}</span>
                {note.status && (
                  <span className={`${styles.statusTag} ${styles[`status_${note.status}`]}`}>
                    {STATUS_LABELS[note.status]}
                  </span>
                )}
              </div>
              <span className={styles.recentTime}>
                <Clock size={12} />
                <span>{formatRelativeTime(note.updatedAt)}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
