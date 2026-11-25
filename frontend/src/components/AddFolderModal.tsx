import { useState, useEffect, useRef, type FormEvent, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { FolderPlus, X } from 'lucide-react';
import styles from './AddFolderModal.module.css';

export interface AddFolderModalProps {
  isOpen: boolean;
  existingFolders: string[];
  onClose: () => void;
  onCreateFolder: (folderName: string) => void;
}

export default function AddFolderModal({
  isOpen,
  existingFolders,
  onClose,
  onCreateFolder,
}: AddFolderModalProps) {
  const [folderInput, setFolderInput] = useState('');
  const [errorText, setErrorText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFolderInput('');
      setErrorText('');
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const normalizeFolder = (raw: string) =>
    raw.trim().toLowerCase().replace(/^#+/, '').replace(/\s+/g, '-');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const normalized = normalizeFolder(folderInput);

    if (!normalized) {
      setErrorText('Please enter a folder name.');
      return;
    }
    if (!/^[a-z0-9_-]+$/.test(normalized)) {
      setErrorText('Use only letters, numbers, hyphens, or underscores.');
      return;
    }
    if (existingFolders.includes(normalized)) {
      setErrorText(`Folder "#${normalized}" already exists.`);
      return;
    }

    onCreateFolder(normalized);
    onClose();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  };

  return createPortal(
    <div className={styles.overlay} onClick={onClose} onKeyDown={handleKeyDown}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-folder-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <FolderPlus size={18} className={styles.titleIcon} />
            <h3 id="add-folder-title" className={styles.title}>New Folder</h3>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label htmlFor="folder-name-input" className={styles.label}>
            Folder name
          </label>
          <div className={styles.inputWrap}>
            <span className={styles.hashPrefix}>#</span>
            <input
              id="folder-name-input"
              ref={inputRef}
              type="text"
              className={styles.input}
              placeholder="e.g. work, reading-list"
              value={folderInput}
              onChange={(e) => {
                setFolderInput(e.target.value);
                if (errorText) setErrorText('');
              }}
            />
          </div>

          {errorText && (
            <p className={styles.errorText} role="alert">
              {errorText}
            </p>
          )}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn}>
              Create Folder
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
