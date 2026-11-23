import { X } from 'lucide-react';
import styles from './KeyboardHelpModal.module.css';

export interface KeyboardHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUT_ROWS = [
  { label: 'Next note on desk', keys: ['J', '↓'] },
  { label: 'Previous note on desk', keys: ['K', '↑'] },
  { label: 'Open focused note', keys: ['Enter'] },
  { label: 'Toggle pin on focused note', keys: ['P'] },
  { label: 'Delete focused note', keys: ['D'] },
  { label: 'Undo delete', keys: ['Z'] },
  { label: 'Focus Quick-Tack bar', keys: ['T'] },
  { label: 'Create new note', keys: ['N'] },
  { label: 'Focus search', keys: ['/'] },
  { label: 'Command palette', keys: ['Cmd', 'K'] },
  { label: 'Toggle keyboard help', keys: ['?'] },
  { label: 'Close overlay / modal', keys: ['Esc'] },
];

export default function KeyboardHelpModal({ isOpen, onClose }: KeyboardHelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Desk Keyboard Shortcuts</h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close shortcuts modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.shortcutGrid}>
          {SHORTCUT_ROWS.map((row) => (
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
      </div>
    </div>
  );
}
