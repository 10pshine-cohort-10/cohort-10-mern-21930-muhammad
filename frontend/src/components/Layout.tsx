import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BookOpen, FileText, Edit3, Archive, User as UserIcon,
  LogOut, Plus, PanelLeftClose, PanelLeftOpen, Folder,
} from 'lucide-react';
import MobileNavDock from './MobileNavDock';
import SidebarFolders from './SidebarFolders';
import { useAuth } from '../context/AuthContext';
import styles from './Layout.module.css';

const SIDEBAR_STORAGE_KEY = 'notes_sidebar_collapsed';

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'All Notes',
  '/scratchpad': 'Scratchpad',
  '/archive': 'Archive',
  '/profile': 'My Profile',
};

export interface LayoutProps {
  children: ReactNode;
  onNewNoteClick?: () => void;
  folders?: string[];
  selectedFolder?: string;
  onSelectFolder?: (tag: string) => void;
  onAddFolder?: (tag: string) => void;
}

export default function Layout({
  children,
  onNewNoteClick,
  folders = [],
  selectedFolder = '',
  onSelectFolder,
  onAddFolder,
}: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {
        // Ignore storage errors in restricted environments
      }
      return next;
    });
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  const headerTitle = selectedFolder
    ? `#${selectedFolder}`
    : ROUTE_TITLES[location.pathname] || 'Notes Workspace';

  return (
    <div className={`${styles.layout} ${isCollapsed ? styles.layoutCollapsed : ''}`}>
      <aside className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logoIcon}>
            <BookOpen size={18} />
          </div>
          {!isCollapsed && <span className={styles.appName}>Notes Workspace</span>}
        </div>

        <nav className={styles.navigation}>
          <Link
            to="/dashboard"
            onClick={() => onSelectFolder?.('')}
            title="All Notes"
            className={`${styles.navItem} ${location.pathname === '/dashboard' && !selectedFolder ? styles.navItemActive : ''}`}
          >
            <FileText size={18} />
            {!isCollapsed && <span>All Notes</span>}
          </Link>

          {onSelectFolder && !isCollapsed && (
            <SidebarFolders
              folders={folders}
              selectedFolder={selectedFolder}
              onSelectFolder={onSelectFolder}
              onAddFolder={onAddFolder}
            />
          )}

          {onSelectFolder && isCollapsed && (
            <button
              type="button"
              className={`${styles.navItem} ${selectedFolder ? styles.navItemActive : ''}`}
              onClick={toggleSidebar}
              title={`Folders (${folders.length})`}
              aria-label="Expand sidebar to view folders"
            >
              <Folder size={18} />
            </button>
          )}

          <Link
            to="/scratchpad"
            title="Scratchpad"
            className={`${styles.navItem} ${location.pathname === '/scratchpad' ? styles.navItemActive : ''}`}
          >
            <Edit3 size={18} />
            {!isCollapsed && <span>Scratchpad</span>}
          </Link>

          <Link
            to="/archive"
            title="Archive"
            className={`${styles.navItem} ${location.pathname === '/archive' ? styles.navItemActive : ''}`}
          >
            <Archive size={18} />
            {!isCollapsed && <span>Archive</span>}
          </Link>

          <Link
            to="/profile"
            title="My Profile"
            className={`${styles.navItem} ${location.pathname === '/profile' ? styles.navItemActive : ''}`}
          >
            <UserIcon size={18} />
            {!isCollapsed && <span>My Profile</span>}
          </Link>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.avatar} title={user?.name}>{userInitial}</div>
            {!isCollapsed && (
              <div className={styles.userDetails}>
                <span className={styles.userName}>{user?.name}</span>
                <span className={styles.userEmail}>{user?.email}</span>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              type="button"
              className={styles.logoutButton}
              onClick={logout}
              title="Log out"
              aria-label="Log out"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </aside>

      <div className={styles.mainContent}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button
              type="button"
              className={styles.collapseBtn}
              onClick={toggleSidebar}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
            <span className={styles.topbarTitle}>{headerTitle}</span>
          </div>

          <div className={styles.mobileBrand}>
            <div className={styles.logoIcon}>
              <BookOpen size={18} />
            </div>
            <span className={styles.mobileAppName}>Notes</span>
          </div>

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
            <div className={styles.mobileAvatar} title={user?.name}>
              {userInitial}
            </div>
          </div>
        </header>

        <main className={styles.pageBody}>{children}</main>
      </div>

      <MobileNavDock onQuickAddClick={onNewNoteClick} />
    </div>
  );
}
