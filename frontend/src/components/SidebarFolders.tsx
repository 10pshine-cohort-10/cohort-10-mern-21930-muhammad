import { useState } from 'react';
import { ChevronDown, ChevronRight, Folder, FolderPlus } from 'lucide-react';
import AddFolderModal from './AddFolderModal';
import styles from './Layout.module.css';

export interface SidebarFoldersProps {
  folders: string[];
  selectedFolder?: string;
  onSelectFolder: (tag: string) => void;
  onAddFolder?: (tag: string) => void;
}

export default function SidebarFolders({
  folders,
  selectedFolder = '',
  onSelectFolder,
  onAddFolder,
}: SidebarFoldersProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className={styles.folderTree}>
      <div className={styles.folderTreeHeader}>
        <button
          type="button"
          className={styles.folderToggle}
          onClick={() => setIsExpanded((prev) => !prev)}
          aria-expanded={isExpanded}
        >
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <span>Folders</span>
          <span className={styles.folderCount}>{folders.length}</span>
        </button>

        {onAddFolder && (
          <button
            type="button"
            className={styles.folderInlineAdd}
            onClick={() => setIsModalOpen(true)}
            title="New Folder"
            aria-label="New Folder"
          >
            <FolderPlus size={14} />
          </button>
        )}
      </div>

      {isExpanded && (
        <div className={styles.folderList}>
          {folders.map((folder) => {
            const isActive = selectedFolder === folder;
            return (
              <button
                key={folder}
                type="button"
                className={`${styles.folderItem} ${isActive ? styles.folderItemActive : ''}`}
                onClick={() => onSelectFolder(isActive ? '' : folder)}
              >
                <Folder size={14} />
                <span className={styles.folderName}>#{folder}</span>
              </button>
            );
          })}
        </div>
      )}

      {onAddFolder && (
        <AddFolderModal
          isOpen={isModalOpen}
          existingFolders={folders}
          onClose={() => setIsModalOpen(false)}
          onCreateFolder={onAddFolder}
        />
      )}
    </div>
  );
}
