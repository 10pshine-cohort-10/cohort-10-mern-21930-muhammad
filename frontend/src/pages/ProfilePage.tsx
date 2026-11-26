import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useNotes } from '../hooks/useNotes';
import { formatDate } from '../utils/formatters';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { notes, allTags } = useNotes();
  const [hasCopiedId, setHasCopiedId] = useState(false);

  const safeNotes = Array.isArray(notes) ? notes.filter(Boolean) : [];
  const activeNotes = safeNotes.filter((n) => !Array.isArray(n.tags) || !n.tags.includes('archive'));
  const safeTags = (Array.isArray(allTags) ? allTags : []).filter((t) => t !== 'archive');
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  const pinnedCount = activeNotes.filter((n) => n.isPinned).length;
  const memberSince = formatDate(user?.createdAt);

  const handleCopyId = async () => {
    if (!user?.id || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(user.id);
      setHasCopiedId(true);
      setTimeout(() => setHasCopiedId(false), 2000);
    } catch (err) {
      console.error('Failed to copy user ID:', err);
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.profileCard}>
          <div className={styles.headerSection}>
            <div className={styles.avatarLarge}>{userInitial}</div>
            <div className={styles.titleSection}>
              <h2 className={styles.name}>{user?.name}</h2>
              <span className={styles.email}>{user?.email}</span>
            </div>
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.statBox}>
              <span className={styles.statValue}>{activeNotes.length}</span>
              <span className={styles.statLabel}>Total Notes</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statValue}>{pinnedCount}</span>
              <span className={styles.statLabel}>Pinned Notes</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statValue}>{safeTags.length}</span>
              <span className={styles.statLabel}>Unique Tags</span>
            </div>
          </div>

          <div className={styles.metaSection}>
            <div className={styles.metaRow}>
              <span className={styles.metaKey}>User ID</span>
              <span className={styles.metaValueWithAction}>
                <code className={styles.monoId}>{user?.id}</code>
                {user?.id && (
                  <button
                    type="button"
                    className={styles.copyBtn}
                    onClick={handleCopyId}
                    aria-label="Copy user ID"
                    title="Copy user ID"
                  >
                    {hasCopiedId ? <Check size={13} /> : <Copy size={13} />}
                  </button>
                )}
              </span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaKey}>Member Since</span>
              <span className={styles.metaValue}>{memberSince}</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaKey}>Account Status</span>
              <span className={styles.metaValue}>Active</span>
            </div>
          </div>

          <button
            type="button"
            className={styles.logoutBtn}
            onClick={logout}
          >
            Log Out of Session
          </button>
        </div>
      </div>
    </Layout>
  );
}
