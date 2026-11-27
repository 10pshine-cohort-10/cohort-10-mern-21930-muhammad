import { LayoutGrid, List, Columns3 } from 'lucide-react';
import styles from './ViewModeToggle.module.css';

export type ViewMode = 'grid' | 'stream' | 'board';

export interface ViewModeToggleProps {
  currentMode: ViewMode;
  onChangeMode: (mode: ViewMode) => void;
}

export default function ViewModeToggle({ currentMode, onChangeMode }: ViewModeToggleProps) {
  const pillClass =
    currentMode === 'stream'
      ? styles.slidingPillStream
      : currentMode === 'board'
        ? styles.slidingPillBoard
        : '';

  return (
    <div className={styles.toggleContainer} role="radiogroup" aria-label="Layout view mode">
      <span aria-hidden="true" className={`${styles.slidingPill} ${pillClass}`} />
      <button
        type="button"
        role="radio"
        aria-checked={currentMode === 'grid'}
        className={`${styles.toggleBtn} ${currentMode === 'grid' ? styles.toggleBtnActive : ''}`}
        onClick={() => onChangeMode('grid')}
        title="Cardboard grid view"
      >
        <LayoutGrid size={15} />
        <span>Grid</span>
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={currentMode === 'stream'}
        className={`${styles.toggleBtn} ${currentMode === 'stream' ? styles.toggleBtnActive : ''}`}
        onClick={() => onChangeMode('stream')}
        title="Compact stream view"
      >
        <List size={15} />
        <span>Stream</span>
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={currentMode === 'board'}
        className={`${styles.toggleBtn} ${currentMode === 'board' ? styles.toggleBtnActive : ''}`}
        onClick={() => onChangeMode('board')}
        title="Kanban board view"
      >
        <Columns3 size={15} />
        <span>Board</span>
      </button>
    </div>
  );
}
