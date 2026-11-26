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

  it('toggles sidebar collapsed state and persists preference', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Layout folders={['work']} selectedFolder="" onSelectFolder={jest.fn()}>
          <div>Workspace body</div>
        </Layout>
      </MemoryRouter>
    );

    expect(screen.getByText('Notes Workspace')).toBeInTheDocument();
    const collapseBtn = screen.getByRole('button', { name: /collapse sidebar/i });
    fireEvent.click(collapseBtn);

    expect(screen.queryByText('Notes Workspace')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument();
    expect(localStorage.getItem('notes_sidebar_collapsed')).toBe('true');

    const expandBtn = screen.getByRole('button', { name: /expand sidebar$/i });
    fireEvent.click(expandBtn);

    expect(screen.getByText('Notes Workspace')).toBeInTheDocument();
    expect(localStorage.getItem('notes_sidebar_collapsed')).toBe('false');
  });
});
