import { Columns3, BarChart2, Command, Pin, HelpCircle } from 'lucide-react';
import styles from '../../pages/LandingPage.module.css';

export function BoardVisual({ compact = false }: { compact?: boolean }) {
  return (
    <div className={styles.boardPreviewGrid} aria-hidden="true">
      <div className={styles.boardPreviewCol}>
        <div className={styles.boardPreviewHeader}>
          <span className={styles.boardDotTodo} />
          <span>To Do</span>
        </div>
        <div className={`${styles.boardPreviewCard} ${styles.boardCardSand}`}>
          <span className={styles.miniPushpin} />
          <span>Outline release checklist</span>
        </div>
        {!compact && (
          <div className={`${styles.boardPreviewCard} ${styles.boardCardLavender}`}>
            <span>Write API docs</span>
          </div>
        )}
      </div>

      <div className={styles.boardPreviewCol}>
        <div className={styles.boardPreviewHeader}>
          <span className={styles.boardDotProgress} />
          <span>In Progress</span>
        </div>
        <div className={`${styles.boardPreviewCard} ${styles.boardCardSage}`}>
          <span className={styles.miniPushpin} />
          <span>Ship v1 roadmap</span>
        </div>
      </div>

      <div className={styles.boardPreviewCol}>
        <div className={styles.boardPreviewHeader}>
          <span className={styles.boardDotDone} />
          <span>Done</span>
        </div>
        <div className={`${styles.boardPreviewCard} ${styles.boardCardTeal}`}>
          <span className={styles.miniPushpin} />
          <span>Draft onboarding notes</span>
        </div>
        {!compact && (
          <div className={`${styles.boardPreviewCard} ${styles.boardCardRose}`}>
            <span>Set up CI pipeline</span>
          </div>
        )}
      </div>
    </div>
  );
}

const CONSISTENCY_BARS = [
  { heightPct: 42, isMuted: false },
  { heightPct: 14, isMuted: true },
  { heightPct: 68, isMuted: false },
  { heightPct: 54, isMuted: false },
  { heightPct: 85, isMuted: false },
  { heightPct: 14, isMuted: true },
  { heightPct: 72, isMuted: false },
];

export function ProgressVisual() {
  return (
    <div className={styles.progressPreviewGrid} aria-hidden="true">
      <div className={styles.progressPreviewCard}>
        <div className={styles.boardPreviewHeader}>
          <span>Consistency</span>
          <span className={styles.activityRangeTag}>7d</span>
        </div>
        <div className={styles.miniBarsRow}>
          {CONSISTENCY_BARS.map((bar, idx) => (
            <div
              key={idx}
              className={`${styles.miniBar} ${bar.isMuted ? styles.miniBarMuted : ''}`}
              style={{ height: `${bar.heightPct}%` }}
            />
          ))}
        </div>
        <span className={styles.mutedMetaNote}>Active 5 of the last 7 days</span>
      </div>

      <div className={styles.progressPreviewCard}>
        <div className={styles.boardPreviewHeader}>
          <span>Plan Growth</span>
          <span className={styles.plansSummaryTag}>1 Done · 2 Active</span>
        </div>
        <div className={styles.miniRingRow}>
          <svg width="68" height="68" viewBox="0 0 68 68">
            <circle cx="34" cy="34" r="26" fill="none" stroke="var(--bg-muted)" strokeWidth="7" />
            <circle
              cx="34"
              cy="34"
              r="26"
              fill="none"
              stroke="var(--accent-blue)"
              strokeWidth="7"
              strokeDasharray="108 164"
              strokeLinecap="round"
              transform="rotate(-90 34 34)"
            />
            <circle
              cx="34"
              cy="34"
              r="26"
              fill="none"
              stroke="var(--accent-orange)"
              strokeWidth="7"
              strokeDasharray="54 164"
              strokeLinecap="round"
              transform="rotate(-90 34 34)"
            />
          </svg>
          <div className={styles.ringLegendCol}>
            <span>To Do: 1</span>
            <span>In Progress: 1</span>
            <span className={styles.doneLegendItem}>Done: 1</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CommandsVisual() {
  const commandItems = [
    { icon: <Columns3 size={13} />, label: 'Switch to Board view', hint: '' },
    { icon: <BarChart2 size={13} />, label: 'Open Progress', hint: '' },
    { icon: <Pin size={13} />, label: 'Toggle pinned notes filter', hint: 'P' },
    { icon: <HelpCircle size={13} />, label: 'Open keyboard shortcuts', hint: '?' },
  ];

  return (
    <div className={styles.commandsPreview} aria-hidden="true">
      <div className={styles.commandsSearchRow}>
        <Command size={14} className={styles.cmdIcon} />
        <span className={styles.commandsPlaceholder}>Search notes, switch views, run commands…</span>
        <kbd className={styles.kbdBadge}>⌘K</kbd>
      </div>
      <div className={styles.commandsResultList}>
        {commandItems.map(({ icon, label, hint }) => (
          <div key={label} className={styles.commandsResultRow}>
            <span className={styles.commandsResultIcon}>{icon}</span>
            <span className={styles.commandsResultLabel}>{label}</span>
            {hint && <kbd className={styles.kbdBadge}>{hint}</kbd>}
          </div>
        ))}
      </div>
    </div>
  );
}
