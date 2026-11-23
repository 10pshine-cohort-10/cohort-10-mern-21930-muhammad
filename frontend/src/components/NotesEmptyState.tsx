import { FileText, Sparkles } from 'lucide-react';
import styles from '../pages/DashboardPage.module.css';
import type { NoteInput } from '../types';

export interface NotesEmptyStateProps {
  searchQuery: string;
  onCreateNote: () => void;
  onApplyTemplate?: (template: NoteInput) => void;
}

const TEMPLATES: Array<{ label: string; note: NoteInput }> = [
  {
    label: 'Daily Brain Dump',
    note: {
      title: 'Daily Brain Dump',
      content: '<p><strong>Top Priorities:</strong></p><ul><li></li><li></li></ul><p><strong>Quick Notes:</strong></p>',
      tags: ['journal'],
      color: 'sand',
      isPinned: false,
    },
  },
  {
    label: 'Sprint Checklist',
    note: {
      title: 'Sprint Checklist',
      content: '<p><strong>To Do:</strong></p><ul><li></li></ul><p><strong>Decisions:</strong></p>',
      tags: ['work'],
      color: 'teal',
      isPinned: false,
    },
  },
  {
    label: 'Meeting Recap',
    note: {
      title: 'Meeting Recap',
      content: '<p><strong>Attendees:</strong></p><p><strong>Action Items:</strong></p><ul><li></li></ul>',
      tags: ['meeting'],
      color: 'lavender',
      isPinned: false,
    },
  },
];

export default function NotesEmptyState({
  searchQuery,
  onCreateNote,
  onApplyTemplate,
}: NotesEmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <FileText size={40} color="var(--text-subtle)" />
      <h4 className={styles.emptyTitle}>
        {searchQuery ? 'No notes matched your search' : 'No notes on the desk yet'}
      </h4>
      <p className={styles.emptySubtitle}>
        {searchQuery
          ? 'Try searching with different keywords or clear the active folder filter.'
          : 'Start by creating a note or pick a quick starter blueprint below.'}
      </p>

      {!searchQuery && (
        <>
          <button type="button" className={styles.primaryButton} onClick={onCreateNote}>
            Create First Note
          </button>

          {onApplyTemplate && (
            <div className={styles.starterTemplatesGrid}>
              {TEMPLATES.map((tpl) => (
                <button
                  key={tpl.label}
                  type="button"
                  className={styles.templateBtn}
                  onClick={() => onApplyTemplate(tpl.note)}
                >
                  <Sparkles size={14} />
                  <span>{tpl.label}</span>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
