import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, FileText, Edit3, Archive, User as UserIcon, LogOut, Plus } from 'lucide-react';
import MobileNavDock from './MobileNavDock';
import { useAuth } from '../context/AuthContext';
import styles from './Layout.module.css';

export interface LayoutProps {
  children: ReactNode;
  onNewNoteClick?: () => void;
}

export default function Layout({ children, onNewNoteClick }: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logoIcon}>
            <BookOpen size={18} />
          </div>
          <span className={styles.appName}>Notes Workspace</span>
        </div>

        <nav className={styles.navigation}>
          <Link
            to="/dashboard"
            className={`${styles.navItem} ${location.pathname === '/dashboard' ? styles.navItemActive : ''}`}
          >
            <FileText size={18} />
            <span>All Notes</span>
          </Link>

          <Link
            to="/scratchpad"
            className={`${styles.navItem} ${location.pathname === '/scratchpad' ? styles.navItemActive : ''}`}
          >
            <Edit3 size={18} />
            <span>Scratchpad</span>
          </Link>

          <Link
            to="/archive"
            className={`${styles.navItem} ${location.pathname === '/archive' ? styles.navItemActive : ''}`}
          >
            <Archive size={18} />
            <span>Archive</span>
          </Link>

          <Link
            to="/profile"
            className={`${styles.navItem} ${location.pathname === '/profile' ? styles.navItemActive : ''}`}
          >
            <UserIcon size={18} />
            <span>My Profile</span>
          </Link>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>{userInitial}</div>
            <div className={styles.userDetails}>
              <span className={styles.userName}>{user?.name}</span>
              <span className={styles.userEmail}>{user?.email}</span>
            </div>
          </div>

          <button
            type="button"
            className={styles.logoutButton}
            onClick={logout}
            title="Log out"
            aria-label="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <div className={styles.mainContent}>
        <header className={styles.topbar}>
          <div className={styles.topbarActions}>
            {onNewNoteClick && (
              <button
                type="button"
                className={styles.newNoteButton}
                onClick={onNewNoteClick}
              >
                <Plus size={16} />
                <span>New Note</span>
              </button>
            )}
          </div>
        </header>

        <main className={styles.pageBody}>{children}</main>
      </div>

      <MobileNavDock onQuickAddClick={onNewNoteClick} />
    </div>
  );
}
