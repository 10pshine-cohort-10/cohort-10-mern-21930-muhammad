import PropTypes from 'prop-types';
import { Pin } from 'lucide-react';
import styles from './NoteEditor.module.css';

const AVAILABLE_COLORS = [
  { key: 'slate', className: styles.colorSlate, label: 'Slate' },
  { key: 'sage', className: styles.colorSage, label: 'Sage' },
  { key: 'teal', className: styles.colorTeal, label: 'Teal' },
  { key: 'sand', className: styles.colorSand, label: 'Sand' },
  { key: 'lavender', className: styles.colorLavender, label: 'Lavender' },
  { key: 'rose', className: styles.colorRose, label: 'Rose' },
];

/**
 * Color selector and pin toggle row for note editor.
 * @param {{
 *   color: string,
 *   isPinned: boolean,
 *   onColorChange: (color: string) => void,
 *   onTogglePin: () => void
 * }} props
 */
export default function NoteMetaRow({ color, isPinned, onColorChange, onTogglePin }) {
  return (
    <div className={styles.optionsRow}>
      <div className={styles.colorPicker} title="Note color theme">
        {AVAILABLE_COLORS.map((c) => (
          <button
            key={c.key}
            type="button"
            className={`${styles.colorDot} ${c.className} ${color === c.key ? styles.colorDotActive : ''}`}
            onClick={() => onColorChange(c.key)}
            aria-label={`Color ${c.label}`}
          />
        ))}
      </div>

      <button
        type="button"
        className={`${styles.pinToggle} ${isPinned ? styles.pinActive : ''}`}
        onClick={onTogglePin}
      >
        <Pin size={14} fill={isPinned ? 'currentColor' : 'none'} />
        <span>{isPinned ? 'Pinned' : 'Pin note'}</span>
      </button>
    </div>
  );
}

NoteMetaRow.propTypes = {
  color: PropTypes.string.isRequired,
  isPinned: PropTypes.bool.isRequired,
  onColorChange: PropTypes.func.isRequired,
  onTogglePin: PropTypes.func.isRequired,
};
