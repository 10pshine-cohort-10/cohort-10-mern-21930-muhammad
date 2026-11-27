import { useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './KeyboardHelpModal.module.css';

export interface KeyboardHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUT_GROUPS = [
  {
    title: 'Navigation',
    rows: [
      { label: 'Next note', keys: ['J', '↓'] },
      { label: 'Previous note', keys: ['K', '↑'] },
      { label: 'Open focused note', keys: ['Enter'] },
      { label: 'Focus search', keys: ['/'] },
    ],
  },
  {
    title: 'Note Actions',
    rows: [
      { label: 'Quick add note', keys: ['Q'] },
      { label: 'Create new note', keys: ['N'] },
      { label: 'Toggle pin on focused note', keys: ['P'] },
      { label: 'Delete or undo', keys: ['D', 'Z'] },
    ],
  },
  {
    title: 'Workspace',
    rows: [
      { label: 'Command palette', keys: ['Cmd', 'K'] },
      { label: 'Toggle keyboard help', keys: ['?'] },
      { label: 'Close overlay / modal', keys: ['Esc'] },
    ],
  },
];

export default function KeyboardHelpModal({ isOpen, onClose }: KeyboardHelpModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-label="Keyboard Shortcuts">
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Keyboard Shortcuts</h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close shortcuts modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.groupsStack}>
          {SHORTCUT_GROUPS.map((group) => (
            <section key={group.title} className={styles.groupSection}>
              <h3 className={styles.groupTitle}>{group.title}</h3>
              <div className={styles.shortcutGrid}>
                {group.rows.map((row) => (
                  <div key={row.label} className={styles.shortcutRow}>
                    <span className={styles.shortcutLabel}>{row.label}</span>
                    <div className={styles.keyBadges}>
                      {row.keys.map((k) => (
                        <kbd key={k} className={styles.keyBadge}>
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
