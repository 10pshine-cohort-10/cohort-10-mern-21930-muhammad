import { useState, useEffect, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FileText, PenLine, Archive, BarChart3, HelpCircle,
  LogOut, Plus, ChevronsLeft, ChevronsRight, Folder, FolderOpen,
} from 'lucide-react';
import MobileNavDock from './MobileNavDock';
import SidebarFolders from './SidebarFolders';
import KeyboardHelpModal from './KeyboardHelpModal';
import CommandPalette from './CommandPalette';
import PinnateBrand from './brand/PinnateBrand';
import { useAuth } from '../context/AuthContext';
import { getCachedFolders } from '../hooks/useNotes';
import { usePaletteShortcut } from '../hooks/usePaletteShortcut';
import styles from './Layout.module.css';

const SIDEBAR_STORAGE_KEY = 'notes_sidebar_collapsed';
const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'All Notes',
  '/insights': 'Progress',
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
  onOpenHelp?: () => void;
  hasCustomPalette?: boolean;
}

export default function Layout({
  children, onNewNoteClick, folders, selectedFolder = '', onSelectFolder, onAddFolder, onOpenHelp, hasCustomPalette = false,
}: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isDefaultHelpOpen, setIsDefaultHelpOpen] = useState(false);
  const [isLayoutPaletteOpen, setIsLayoutPaletteOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true'; } catch { return false; }
  });

  usePaletteShortcut(() => {
    if (!hasCustomPalette) setIsLayoutPaletteOpen(true);
  });

  useEffect(() => {
    if (onOpenHelp) return;
    const handleHelpShortcut = (event: KeyboardEvent) => {
      if (event.key !== '?' || event.metaKey || event.ctrlKey || event.altKey) return;
      const activeEl = document.activeElement;
      const isEditing =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        activeEl instanceof HTMLSelectElement ||
        (activeEl instanceof HTMLElement && activeEl.isContentEditable);
      if (isEditing) return;
      event.preventDefault();
      setIsDefaultHelpOpen((prev) => !prev);
    };
    window.addEventListener('keydown', handleHelpShortcut);
    return () => window.removeEventListener('keydown', handleHelpShortcut);
  }, [onOpenHelp]);

  const triggerHelp = onOpenHelp || (() => setIsDefaultHelpOpen(true));

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next)); } catch { /* ignore */ }
      return next;
    });
  };

  const resolvedFolders = Array.isArray(folders) ? folders : getCachedFolders?.() || [];
  const handleFolderClick = (tag: string) => {
    if (onSelectFolder) {
      onSelectFolder(tag);
    } else {
      navigate(tag ? `/dashboard?tag=${encodeURIComponent(tag)}` : '/dashboard');
    }
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  const headerTitle = selectedFolder ? `#${selectedFolder}` : ROUTE_TITLES[location.pathname] || 'Pinnate';

  return (
    <div className={`${styles.layout} ${isCollapsed ? styles.layoutCollapsed : ''}`}>
      <aside className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          {!isCollapsed && (
            <Link to="/dashboard" className={styles.brandGroup} aria-label="Pinnate workspace">
              <PinnateBrand markSize={32} />
            </Link>
          )}
          <button
            type="button" className={styles.collapseBtn} onClick={toggleSidebar}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronsRight size={17} /> : <ChevronsLeft size={17} />}
          </button>
        </div>

        <nav className={styles.navigation}>
          <Link
            to="/dashboard" onClick={() => onSelectFolder?.('')} title="All Notes" aria-label="All Notes"
            className={`${styles.navItem} ${location.pathname === '/dashboard' && !selectedFolder ? styles.navItemActive : ''}`}
          >
            <FileText size={18} />{!isCollapsed && <span>All Notes</span>}
          </Link>

          {!isCollapsed ? (
            <SidebarFolders
              folders={resolvedFolders} selectedFolder={selectedFolder}
              onSelectFolder={handleFolderClick} onAddFolder={onAddFolder}
            />
          ) : (
            <button
              type="button" className={`${styles.navItem} ${selectedFolder ? styles.navItemActive : ''}`}
              onClick={toggleSidebar} title={`Folders (${resolvedFolders.length})`}
              aria-label="Expand sidebar to view folders"
            >
              {selectedFolder ? <FolderOpen size={18} /> : <Folder size={18} />}
            </button>
          )}

          <Link
            to="/scratchpad" title="Scratchpad" aria-label="Scratchpad"
            className={`${styles.navItem} ${location.pathname === '/scratchpad' ? styles.navItemActive : ''}`}
          >
            <PenLine size={18} />{!isCollapsed && <span>Scratchpad</span>}
          </Link>

          <Link
            to="/insights" title="Progress" aria-label="Progress"
            className={`${styles.navItem} ${location.pathname === '/insights' ? styles.navItemActive : ''}`}
          >
            <BarChart3 size={18} />{!isCollapsed && <span>Progress</span>}
          </Link>

          <Link
            to="/archive" title="Archive" aria-label="Archive"
            className={`${styles.navItem} ${location.pathname === '/archive' ? styles.navItemActive : ''}`}
          >
            <Archive size={18} />{!isCollapsed && <span>Archive</span>}
          </Link>
        </nav>

        <div className={styles.sidebarFooter}>
          <Link
            to="/profile" title="My Profile" aria-label={user?.name ? `${user.name} profile` : 'My Profile'}
            className={`${styles.userInfo} ${location.pathname === '/profile' ? styles.userInfoActive : ''}`}
          >
            <div className={styles.avatar}>{userInitial}</div>
            {!isCollapsed && (
              <div className={styles.userDetails}>
                <span className={styles.userName}>{user?.name}</span>
                <span className={styles.userEmail}>{user?.email}</span>
              </div>
            )}
          </Link>
          <div className={styles.footerActions}>
            <button
              type="button"
              className={styles.helpButton}
              onClick={triggerHelp}
              title="Keyboard shortcuts (?)"
              aria-label="Keyboard shortcuts"
            >
              <HelpCircle size={16} />
            </button>
            <button type="button" className={styles.logoutButton} onClick={logout} title="Log out" aria-label="Log out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <div className={styles.mainContent}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <span className={styles.topbarTitle}>{headerTitle}</span>
          </div>
          <div className={styles.topbarActions}>
            <button
              type="button"
              className={`${styles.helpButton} ${styles.mobileHelpBtn}`}
              onClick={triggerHelp}
              title="Keyboard shortcuts (?)"
              aria-label="Keyboard shortcuts"
            >
              <HelpCircle size={16} />
            </button>
            {onNewNoteClick && (
              <button type="button" className={styles.newNoteButton} onClick={onNewNoteClick}>
                <Plus size={16} /><span>New Note</span>
              </button>
            )}
            <Link to="/profile" className={styles.mobileAvatar} title={user?.name} aria-label="My Profile">
              <span className={styles.mobileAvatarCircle}>{userInitial}</span>
            </Link>
          </div>
        </header>
        <main className={styles.pageBody}>{children}</main>
      </div>

      <MobileNavDock onQuickAddClick={onNewNoteClick} />
      {!hasCustomPalette && (
        <CommandPalette
          isOpen={isLayoutPaletteOpen}
          onClose={() => setIsLayoutPaletteOpen(false)}
          notes={[]}
          onSelectNote={() => navigate('/dashboard')}
          onCreateNote={() => navigate('/dashboard')}
          onTogglePinnedFilter={() => navigate('/dashboard')}
          onOpenHelp={triggerHelp}
          onLogout={logout}
        />
      )}
      {!onOpenHelp && (
        <KeyboardHelpModal isOpen={isDefaultHelpOpen} onClose={() => setIsDefaultHelpOpen(false)} />
      )}
    </div>
  );
}
