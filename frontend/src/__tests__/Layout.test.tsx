import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

jest.mock('../context/AuthContext');

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('Layout collapsible sidebar', () => {
  beforeEach(() => {
    localStorage.clear();
    mockedUseAuth.mockReturnValue({
      user: { id: 'u1', name: 'Test User', email: 'test@example.com' },
      token: 'token',
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
    });
  });

  it('keeps collapse toggle inside sidebar, consolidates profile in footer, and persists folder tree', () => {
    const { unmount } = render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Layout folders={['work']} selectedFolder="" onSelectFolder={jest.fn()}>
          <div>Workspace body</div>
        </Layout>
      </MemoryRouter>
    );

    const aside = document.querySelector('aside');
    const collapseBtn = screen.getByRole('button', { name: /collapse sidebar/i });
    expect(aside).toContainElement(collapseBtn);

    expect(screen.getAllByRole('link', { name: /test user/i })).toHaveLength(1);
    expect(screen.getByText('#work')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /folders/i }));
    expect(screen.queryByText('#work')).not.toBeInTheDocument();
    expect(localStorage.getItem('notes_folders_expanded')).toBe('false');

    fireEvent.click(collapseBtn);
    expect(screen.queryByText('Notes Workspace')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument();
    expect(localStorage.getItem('notes_sidebar_collapsed')).toBe('true');

    unmount();

    render(
      <MemoryRouter initialEntries={['/scratchpad']}>
        <Layout>
          <div>Scratchpad body</div>
        </Layout>
      </MemoryRouter>
    );

    const expandBtn = screen.getByRole('button', { name: /expand sidebar$/i });
    fireEvent.click(expandBtn);
    expect(screen.getByText('Notes Workspace')).toBeInTheDocument();
    expect(localStorage.getItem('notes_folders_expanded')).toBe('false');
  });
});
