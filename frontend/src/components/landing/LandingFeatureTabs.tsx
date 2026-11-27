import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Columns3, BarChart2, PenLine, Command } from 'lucide-react';
import { EASE_TACTILE } from '../../brand/motion';
import { BoardVisual, ProgressVisual, CommandsVisual } from './LandingVisuals';
import LandingInteractiveScratchpad from './LandingInteractiveScratchpad';
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

export default function LandingFeatureTabs() {
  const [activeTab, setActiveTab] = useState<TabId>('board');
  const shouldReduceMotion = useReducedMotion();

  const tabs: Tab[] = [
    {
      id: 'board',
      label: 'Board',
      icon: <Columns3 size={15} />,
      heading: 'Move plans forward at your own pace',
      body: 'Three calm stages—To Do, In Progress, Done—with color-matched cards that settle softly when moved.',
      visual: <BoardVisual />,
    },
    {
      id: 'progress',
      label: 'Progress',
      icon: <BarChart2 size={15} />,
      heading: 'See how far you have come—no streak to break',
      body: 'Factual activity bars, a plan completion ring, and recent updates without missed-day guilt.',
      visual: <ProgressVisual />,
    },
    {
      id: 'scratchpad',
      label: 'Scratchpad',
      icon: <PenLine size={15} />,
      heading: 'Capture first. Organize when ready.',
      body: 'Local drafts stay on your device until you click Add to notes. No account needed to start.',
      visual: <LandingInteractiveScratchpad compact />,
    },
    {
      id: 'commands',
      label: 'Commands',
      icon: <Command size={15} />,
      heading: '⌘K reaches every view from your keyboard',
      body: 'Search notes, switch between Board and Grid, open Progress, or inspect shortcuts in one keystroke.',
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
              transition={{ duration: 0.28, ease: EASE_TACTILE }}
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
