import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useNotes } from '../hooks/useNotes';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { notes, allTags } = useNotes();

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  const pinnedCount = notes.filter((n) => n.isPinned).length;
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Recent';

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
              <span className={styles.statValue}>{notes.length}</span>
              <span className={styles.statLabel}>Total Notes</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statValue}>{pinnedCount}</span>
              <span className={styles.statLabel}>Pinned Notes</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statValue}>{allTags.length}</span>
              <span className={styles.statLabel}>Unique Tags</span>
            </div>
          </div>

          <div className={styles.metaSection}>
            <div className={styles.metaRow}>
              <span className={styles.metaKey}>User ID</span>
              <span className={styles.metaValue}>{user?.id}</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaKey}>Member Since</span>
              <span className={styles.metaValue}>{memberSince}</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaKey}>Account Status</span>
              <span className={styles.metaValue} style={{ color: 'var(--teal-primary)' }}>
                Active
              </span>
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
