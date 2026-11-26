import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Columns3, BarChart2, PenLine, Command, Pin, Folder, Check } from 'lucide-react';
import styles from '../../pages/LandingPage.module.css';

type TabId = 'board' | 'progress' | 'scratchpad' | 'commands';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  heading: string;
  body: string;
  visual: React.ReactNode;
}

function BoardVisual() {
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
        <div className={`${styles.boardPreviewCard} ${styles.boardCardLavender}`}>
          <span>Write API docs</span>
        </div>
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
        <div className={`${styles.boardPreviewCard} ${styles.boardCardRose}`}>
          <span>Set up CI pipeline</span>
        </div>
      </div>
    </div>
  );
}

function ProgressVisual() {
  return (
    <div className={styles.progressPreviewGrid} aria-hidden="true">
      <div className={styles.progressPreviewCard}>
        <div className={styles.boardPreviewHeader}>
          <span>Activity</span>
          <span style={{ marginLeft: 'auto', color: 'var(--accent-blue-text)', fontSize: '12px' }}>7d</span>
        </div>
        <div className={styles.miniBarsRow}>
          <div className={styles.miniBar} style={{ height: '42%' }} />
          <div className={`${styles.miniBar} ${styles.miniBarMuted}`} style={{ height: '14%' }} />
          <div className={styles.miniBar} style={{ height: '68%' }} />
          <div className={styles.miniBar} style={{ height: '54%' }} />
          <div className={styles.miniBar} style={{ height: '85%' }} />
          <div className={`${styles.miniBar} ${styles.miniBarMuted}`} style={{ height: '14%' }} />
          <div className={styles.miniBar} style={{ height: '72%' }} />
        </div>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Active 5 of the last 7 days</span>
      </div>

      <div className={styles.progressPreviewCard}>
        <div className={styles.boardPreviewHeader}>
          <span>Plans</span>
          <span style={{ marginLeft: 'auto', color: 'var(--accent-orange-text)', fontSize: '12px' }}>1 Done · 2 Active</span>
        </div>
        <div className={styles.miniRingRow}>
          <svg width="68" height="68" viewBox="0 0 68 68">
            <circle cx="34" cy="34" r="26" fill="none" stroke="var(--bg-muted)" strokeWidth="7" />
            <circle cx="34" cy="34" r="26" fill="none" stroke="var(--accent-blue)" strokeWidth="7"
              strokeDasharray="108 164" strokeLinecap="round" transform="rotate(-90 34 34)" />
            <circle cx="34" cy="34" r="26" fill="none" stroke="var(--accent-orange)" strokeWidth="7"
              strokeDasharray="54 164" strokeLinecap="round" transform="rotate(-90 34 34)" />
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span>To Do: 1</span>
            <span>In Progress: 1</span>
            <span style={{ color: 'var(--accent-orange-text)', fontWeight: 700 }}>Done: 1</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScratchpadVisual() {
  const [draftText, setDraftText] = useState('');
  const [savedDraft, setSavedDraft] = useState('Ship v1 roadmap');
  const [isTacked, setIsTacked] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && draftText.trim()) {
      e.preventDefault();
      setSavedDraft(draftText.trim());
      setDraftText('');
      setIsTacked(false);
    }
  };

  return (
    <div className={styles.visualStage} style={{ minHeight: 'auto', maxHeight: 'none' }}>
      <div className={styles.miniInputRow}>
        <PenLine size={15} />
        <input
          type="text"
          className={styles.miniInput}
          placeholder="Type a quick draft and press Enter…"
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Interactive scratchpad preview"
        />
        <kbd className={styles.kbdBadge}>ENTER</kbd>
      </div>

      {isTacked ? (
        <motion.div
          className={styles.pinnedSnapCard}
          initial={{ scale: 0.96, rotate: 0 }}
          animate={{ scale: 1, rotate: -1.2 }}
          transition={{ type: 'spring', stiffness: 420, damping: 22 }}
        >
          <motion.span
            className={styles.pinDot}
            initial={{ y: -14, scale: 1.3 }}
            animate={{ y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 460, damping: 20 }}
          />
          <span style={{ fontWeight: 600 }}>{savedDraft}</span>
          <button type="button" className={styles.miniTackBtn} onClick={() => setIsTacked(false)}>
            <Check size={13} />
            <span>Tacked to notes</span>
          </button>
        </motion.div>
      ) : (
        <div className={styles.miniDraftRow}>
          <span>{savedDraft}</span>
          <button type="button" className={styles.miniTackBtn} onClick={() => setIsTacked(true)}>
            <Pin size={13} />
            <span>Tack to notes</span>
          </button>
        </div>
      )}
    </div>
  );
}

function CommandsVisual() {
  return (
    <div className={styles.commandsPreview} aria-hidden="true">
      <div className={styles.commandsSearchRow}>
        <Command size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <span className={styles.commandsPlaceholder}>Search notes, switch views, run commands…</span>
        <kbd className={styles.kbdBadge}>⌘K</kbd>
      </div>
      <div className={styles.commandsResultList}>
        {[
          { icon: <Pin size={13} />, label: 'Pin selected note', hint: 'P' },
          { icon: <Folder size={13} />, label: 'Move to #work', hint: '' },
          { icon: <Columns3 size={13} />, label: 'Switch to Board view', hint: '' },
          { icon: <BarChart2 size={13} />, label: 'Open Progress', hint: '' },
        ].map(({ icon, label, hint }) => (
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

export default function LandingFeatureTabs() {
  const [activeTab, setActiveTab] = useState<TabId>('board');
  const shouldReduceMotion = useReducedMotion();

  const tabs: Tab[] = [
    {
      id: 'board',
      label: 'Board',
      icon: <Columns3 size={15} />,
      heading: 'Move plans forward at your own pace.',
      body: 'Three clear columns—To Do, In Progress, Done—with color-matched cards that settle softly when moved.',
      visual: <BoardVisual />,
    },
    {
      id: 'progress',
      label: 'Progress',
      icon: <BarChart2 size={15} />,
      heading: 'See how far you have come—never a streak to break.',
      body: 'Factual activity bars, a plan completion ring, and recent updates—no red arrows, no missed-day guilt.',
      visual: <ProgressVisual />,
    },
    {
      id: 'scratchpad',
      label: 'Scratchpad',
      icon: <PenLine size={15} />,
      heading: "Capture first. Organize when you're ready.",
      body: 'Local drafts stay on your device until you click Tack to notes. No account needed to start.',
      visual: <ScratchpadVisual />,
    },
    {
      id: 'commands',
      label: 'Commands',
      icon: <Command size={15} />,
      heading: '⌘K reaches everything without leaving the keyboard.',
      body: 'Search notes, switch views, pin, move to a folder, or open Progress—one keystroke away.',
      visual: <CommandsVisual />,
    },
  ];

  const active = tabs.find((t) => t.id === activeTab)!;

  return (
    <section id="features" className={styles.tabsSection} data-thread-anchor="features">
      <div className={styles.tabsInner} data-thread-anchor="features-inner">
        <div className={styles.tabsBar} role="tablist" aria-label="Feature tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
              className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div
          id={`tabpanel-${active.id}`}
          role="tabpanel"
          aria-label={active.label}
          className={styles.tabPanel}
        >
          <AnimatePresence mode="sync">
            <motion.div
              key={activeTab}
              className={styles.tabPanelInner}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={styles.tabCopy}>
                <h2 className={styles.sectionHeading}>{active.heading}</h2>
                <p className={styles.sectionLead}>{active.body}</p>
              </div>
              <div className={styles.tabVisual}>{active.visual}</div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
