import { motion } from 'framer-motion';
import {
  Pin, Folder, LayoutGrid, Search, Download, Terminal, FileText,
} from 'lucide-react';
import styles from '../../pages/LandingPage.module.css';

const REVEAL_VIEWPORT = { once: true, amount: 0.2 } as const;

export default function LandingFeatureSections() {
  return (
    <>
      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Built for capture, pinning, and tidy folders.</h2>
        <p className={styles.sectionLead}>
          Switch between tactile Grid cards and compact Stream lists while keeping important notes pinned at the top.
        </p>

        <div className={styles.bentoGrid}>
          <motion.article
            className={`${styles.bentoCard} ${styles.bentoMint}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={REVEAL_VIEWPORT}
            transition={{ duration: 0.35 }}
          >
            <Pin size={20} />
            <h3 className={styles.cardTitle}>Pinning & Quick Capture</h3>
            <p className={styles.cardCopy}>
              Press Enter in the floating Quick-Tack dock to save immediately, and pin key notes into a dedicated Pinned row.
            </p>
            <div className={styles.mockupBox}>
              <span>Quick tack to board</span>
              <kbd className={styles.kbdBadge}>t</kbd>
            </div>
          </motion.article>

          <motion.article
            className={styles.bentoCard}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={REVEAL_VIEWPORT}
            transition={{ duration: 0.35, delay: 0.08 }}
          >
            <Folder size={20} />
            <h3 className={styles.cardTitle}>Collapsible #Folders</h3>
            <p className={styles.cardCopy}>
              Create custom folders, filter notes across routes, and keep your sidebar rail expanded or collapsed.
            </p>
            <div className={styles.mockupBox}>
              <span>#work · #ideas · #reading</span>
              <span>+ Folder</span>
            </div>
          </motion.article>

          <motion.article
            className={styles.bentoCard}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={REVEAL_VIEWPORT}
            transition={{ duration: 0.35, delay: 0.16 }}
          >
            <LayoutGrid size={20} />
            <h3 className={styles.cardTitle}>Grid & Stream Views</h3>
            <p className={styles.cardCopy}>
              Toggle between a cardboard desk grid and a dense stream list with a single click—persisted per device.
            </p>
            <div className={styles.mockupBox}>
              <span>Grid | Stream</span>
              <kbd className={styles.kbdBadge}>Saved</kbd>
            </div>
          </motion.article>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Start in Scratchpad. Promote to your Cloud Desk.</h2>
        <p className={styles.sectionLead}>
          Separate messy local thoughts from your synced workspace until they are ready to keep.
        </p>

        <div className={styles.storyGrid}>
          <motion.div
            className={styles.storyCard}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={REVEAL_VIEWPORT}
            transition={{ duration: 0.35 }}
          >
            <h3 className={styles.cardTitle}>Guest Scratchpad</h3>
            <p className={styles.cardCopy}>
              Write right away in browser storage with zero signup. When you create an account or log in, local drafts sync automatically.
            </p>
            <div className={styles.mockupBox}>
              <span>Local browser drafts</span>
              <span>Auto-sync on sign in</span>
            </div>
          </motion.div>

          <motion.div
            className={styles.storyCard}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={REVEAL_VIEWPORT}
            transition={{ duration: 0.35, delay: 0.08 }}
          >
            <h3 className={styles.cardTitle}>Draft Blotter & Real-Time Sync</h3>
            <p className={styles.cardCopy}>
              Stage unfiled thoughts locally while signed in, then click Tack to Desk to promote them with live Socket.IO updates.
            </p>
            <div className={styles.mockupBox}>
              <span>Tack to Desk</span>
              <span>Synced via Socket.IO</span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Everything else stays fast and yours.</h2>
        <div className={styles.powerGrid}>
          {[
            {
              icon: FileText,
              title: 'Rich-Text Editor & Color Themes',
              copy: 'TipTap formatting, Focus Mode, debounced autosave, and 6 tactile card colors.',
            },
            {
              icon: Terminal,
              title: 'Command Palette & Keyboard Nav',
              copy: 'Open Ctrl+K anywhere, navigate cards with j/k, and recover deletes with UndoToast.',
            },
            {
              icon: Search,
              title: 'Full-Text Search & Archive',
              copy: 'Search titles, content, and tags instantly, or tuck finished notes into Archive.',
            },
            {
              icon: Download,
              title: 'Export & Import Anytime',
              copy: 'Back up your workspace to JSON or Markdown and re-import JSON backups in one click.',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                className={styles.powerCard}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={REVEAL_VIEWPORT}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon size={18} />
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                </div>
                <p className={styles.cardCopy}>{item.copy}</p>
              </motion.div>
            );
          })}
        </div>
      </section>
    </>
  );
}
