import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { Plus, LayoutTemplate, ChevronDown } from 'lucide-react';
import type { NoteInput } from '../types';
import styles from '../pages/ScratchpadPage.module.css';

const SCRATCHPAD_TEMPLATES: Array<{ label: string; note: NoteInput }> = [
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

export interface ScratchpadQuickJotProps {
  onQuickSave: (title: string) => Promise<void>;
  onSelectTemplate?: (template: NoteInput) => void;
}

export default function ScratchpadQuickJot({ onQuickSave, onSelectTemplate }: ScratchpadQuickJotProps) {
  const [text, setText] = useState('');
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const templateMenuRef = useRef<HTMLDivElement>(null);
  const templateBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isTemplateOpen) return;
    const handleOutside = (event: MouseEvent) => {
      if (templateMenuRef.current && !templateMenuRef.current.contains(event.target as Node)) {
        setIsTemplateOpen(false);
      }
    };
    window.addEventListener('mousedown', handleOutside);
    return () => window.removeEventListener('mousedown', handleOutside);
  }, [isTemplateOpen]);

  const handleKeyDown = async (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && text.trim()) {
      event.preventDefault();
      const value = text.trim();
      setText('');
      await onQuickSave(value);
    }
  };

  return (
    <div className={styles.captureRow}>
      <div className={styles.quickJotBar}>
        <Plus size={16} />
        <input
          type="text"
          className={styles.quickJotInput}
          placeholder="Jot a fast thought... (press Enter)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Quick jot input"
        />
        <kbd className={styles.quickJotHint}>ENTER</kbd>
      </div>

      {onSelectTemplate && (
        <div className={styles.templateMenuWrap} ref={templateMenuRef}>
          <button
            ref={templateBtnRef}
            type="button"
            className={styles.templateBtn}
            onClick={() => setIsTemplateOpen((prev) => !prev)}
            aria-haspopup="menu"
            aria-expanded={isTemplateOpen}
          >
            <LayoutTemplate size={14} />
            <span>From template</span>
            <ChevronDown size={13} />
          </button>

          {isTemplateOpen && (
            <div
              className={styles.templatePopover}
              role="menu"
              aria-label="Draft templates"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.stopPropagation();
                  setIsTemplateOpen(false);
                  templateBtnRef.current?.focus();
                }
              }}
            >
              {SCRATCHPAD_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.label}
                  type="button"
                  role="menuitem"
                  className={styles.templateItem}
                  onClick={() => {
                    setIsTemplateOpen(false);
                    onSelectTemplate(tpl.note);
                  }}
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
