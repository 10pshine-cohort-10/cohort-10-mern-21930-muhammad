import { useState, useEffect, useRef, type KeyboardEvent, type RefObject } from 'react';
import { Plus, X, Columns3 } from 'lucide-react';
import type { NoteStatus } from '../types';
import styles from './QuickTackBar.module.css';

export interface QuickTackBarProps {
  activeTag: string;
  onQuickCreate: (title: string, tag: string, status?: NoteStatus) => Promise<void>;
  inputRef?: RefObject<HTMLInputElement | null>;
  expandSignal?: number;
}

export default function QuickTackBar({
  activeTag,
  onQuickCreate,
  inputRef,
  expandSignal = 0,
}: QuickTackBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [addToBoard, setAddToBoard] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState('');
  const localInputRef = useRef<HTMLInputElement>(null);
  const resolvedRef = inputRef || localInputRef;

  useEffect(() => {
    const handleGlobalKeyDown = (event: globalThis.KeyboardEvent) => {
      const pressedKey = event.key.toLowerCase();
      if ((pressedKey !== 'q' && pressedKey !== 't') || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      const activeEl = document.activeElement;
      const isEditingText =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        activeEl instanceof HTMLSelectElement ||
        (activeEl instanceof HTMLElement && activeEl.isContentEditable);
      if (isEditingText) return;

      event.preventDefault();
      setIsExpanded(true);
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    if (expandSignal > 0) {
      setIsExpanded(true);
    }
  }, [expandSignal]);

  useEffect(() => {
    if (isExpanded) {
      resolvedRef.current?.focus();
    }
  }, [isExpanded, resolvedRef]);

  const handleKeyDown = async (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      setIsExpanded(false);
      return;
    }

    if (event.key === 'Enter' && content.trim() && !isSubmitting) {
      event.preventDefault();
      const textToSave = content.trim();
      setIsSubmitting(true);
      setErrorText('');
      try {
        if (addToBoard) {
          await onQuickCreate(textToSave, activeTag, 'todo');
        } else {
          await onQuickCreate(textToSave, activeTag);
        }
        setContent('');
      } catch (err) {
        console.error('Quick add failed:', err);
        setErrorText('Failed to save note. Try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const placeholderText = activeTag
    ? `Quick add a note to #${activeTag}... (press Enter)`
    : 'Quick add a note... (press Enter)';

  if (!isExpanded) {
    return (
      <div className={styles.pillWrapper}>
        <button
          type="button"
          className={styles.collapsedPill}
          onClick={() => setIsExpanded(true)}
          aria-label="Quick add a note"
          title="Quick add a note (Q)"
        >
          <Plus size={16} />
          <span>Quick add</span>
          <kbd className={styles.pillKbd}>Q</kbd>
        </button>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {errorText && (
        <div className={styles.errorBanner} role="alert">
          {errorText}
        </div>
      )}
      <div className={styles.container}>
        <span className={styles.pinIcon} aria-hidden="true">
          <Plus size={18} />
        </span>
        <input
          ref={resolvedRef}
          type="text"
          className={styles.input}
          placeholder={placeholderText}
          value={content}
          disabled={isSubmitting}
          onChange={(event) => {
            setContent(event.target.value);
            if (errorText) setErrorText('');
          }}
          onKeyDown={handleKeyDown}
          aria-label="Quick note input"
        />
        <button
          type="button"
          className={`${styles.stageChipBtn} ${addToBoard ? styles.stageChipActive : ''}`}
          onClick={() => setAddToBoard((prev) => !prev)}
          aria-pressed={addToBoard}
          title="Add straight to Board (To Do)"
        >
          <Columns3 size={12} />
          <span>{addToBoard ? 'Board: To Do' : 'Add to Board'}</span>
        </button>
        <kbd className={styles.hintKey}>{isSubmitting ? 'SAVING' : 'ENTER'}</kbd>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={() => setIsExpanded(false)}
          aria-label="Collapse quick add"
          title="Collapse (Esc)"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
