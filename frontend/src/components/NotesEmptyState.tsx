import { FileText, Sparkles } from 'lucide-react';
import styles from '../pages/DashboardPage.module.css';
import type { NoteInput } from '../types';

export interface NotesEmptyStateProps {
  searchQuery: string;
  activeFolder?: string;
  emptyTitle?: string;
  emptySubtitle?: string;
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
  activeFolder = '',
  emptyTitle,
  emptySubtitle,
  onCreateNote,
  onApplyTemplate,
}: NotesEmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <FileText size={40} color="var(--text-subtle)" />
      <h4 className={styles.emptyTitle}>
        {searchQuery
          ? 'No notes matched your search'
          : emptyTitle || (activeFolder ? `No notes in #${activeFolder} yet` : 'No notes here yet')}
      </h4>
      <p className={styles.emptySubtitle}>
        {searchQuery
          ? 'Try searching with different keywords or clear the active folder filter.'
          : emptySubtitle || 'Start by creating a note or pick a quick starter template below.'}
      </p>

      {!searchQuery && (
        <>
          <button type="button" className={styles.primaryButton} onClick={onCreateNote}>
            {activeFolder ? `Add Note to #${activeFolder}` : 'Create First Note'}
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
