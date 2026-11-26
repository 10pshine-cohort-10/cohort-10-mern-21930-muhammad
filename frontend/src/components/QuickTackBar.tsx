import { useState, useEffect, useRef, type KeyboardEvent, type RefObject } from 'react';
import { Plus, X } from 'lucide-react';
import styles from './QuickTackBar.module.css';

export interface QuickTackBarProps {
  activeTag: string;
  onQuickCreate: (title: string, tag: string) => Promise<void>;
  inputRef?: RefObject<HTMLInputElement | null>;
}

export default function QuickTackBar({ activeTag, onQuickCreate, inputRef }: QuickTackBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState('');
  const localInputRef = useRef<HTMLInputElement>(null);
  const resolvedRef = inputRef || localInputRef;

  useEffect(() => {
    const handleGlobalKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'q' || event.metaKey || event.ctrlKey || event.altKey) return;
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
        await onQuickCreate(textToSave, activeTag);
        setContent('');
      } catch (err) {
        console.error('Quick tack failed:', err);
        setErrorText('Failed to save note. Try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const placeholderText = activeTag
    ? `Quick tack a note to #${activeTag}... (press Enter)`
    : 'Quick tack a note to board... (press Enter)';

  if (!isExpanded) {
    return (
      <div className={styles.pillWrapper}>
        <button
          type="button"
          className={styles.collapsedPill}
          onClick={() => setIsExpanded(true)}
          aria-label="Quick tack a note"
          title="Quick tack a note (Q)"
        >
          <Plus size={16} />
          <span>Quick tack</span>
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
        <kbd className={styles.hintKey}>{isSubmitting ? 'SAVING' : 'ENTER'}</kbd>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={() => setIsExpanded(false)}
          aria-label="Collapse quick tack"
          title="Collapse (Esc)"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
