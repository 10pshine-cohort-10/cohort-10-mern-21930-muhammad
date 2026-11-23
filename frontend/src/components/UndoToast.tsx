import { useEffect, useState } from 'react';
import { RotateCcw, X } from 'lucide-react';
import styles from './UndoToast.module.css';

export interface UndoToastProps {
  noteTitle: string;
  onUndo: () => void;
  onDismiss: () => void;
  durationMs?: number;
}

export default function UndoToast({
  noteTitle,
  onUndo,
  onDismiss,
  durationMs = 5000,
}: UndoToastProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(Math.round(durationMs / 1000));

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((previous) => {
        if (previous <= 1) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onDismiss]);

  return (
    <div className={styles.toastContainer} role="alert">
      <span className={styles.message}>
        Deleted <strong>{noteTitle || 'Untitled'}</strong>
        <span className={styles.countdownBadge}>{secondsRemaining}s</span>
      </span>
      <button
        type="button"
        className={styles.undoBtn}
        onClick={onUndo}
        title="Undo deletion (press Z)"
      >
        <RotateCcw size={14} />
        <span>Undo</span>
      </button>
      <button
        type="button"
        className={styles.closeBtn}
        onClick={onDismiss}
        aria-label="Dismiss toast"
      >
        <X size={15} />
      </button>
    </div>
  );
}
