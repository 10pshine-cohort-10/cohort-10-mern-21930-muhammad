import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AuthSplitLayout from '../pages/AuthSplitLayout';
import { useAuth } from '../context/AuthContext';

jest.mock('../context/AuthContext');

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

function renderAuthRoute(initialEntry: '/login' | '/signup') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route element={<AuthSplitLayout />}>
          <Route path="/login" element={null} />
          <Route path="/signup" element={null} />
        </Route>
        <Route path="/dashboard" element={<div>Dashboard Target</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('AuthSplitLayout (Phase 2)', () => {
  beforeEach(() => {
    mockedUseAuth.mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
    });
  });

  it('renders login copy, unique attributes, and validates empty fields', async () => {
    renderAuthRoute('/login');

    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
    expect(screen.getByText('Your notes are where you left them.')).toBeInTheDocument();
    expect(screen.getByText('Pick up where you left off.')).toBeInTheDocument();
    expect(screen.getByLabelText('Email', { selector: '#login-email' })).toHaveAttribute(
      'autocomplete',
      'username'
    );
    expect(screen.queryByText(/forgot password/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\btack\b/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));
    expect(await screen.findByText('Enter your email.')).toBeInTheDocument();
    expect(screen.getByText('Enter your password.')).toBeInTheDocument();
  });

  it('keeps both forms mounted, sets inert on hidden form, and blocks Tab from reaching it', async () => {
    const user = userEvent.setup();
    renderAuthRoute('/login');

    const loginPanel = screen.getByTestId('login-panel');
    const signupPanel = screen.getByTestId('signup-panel');

    expect(loginPanel).not.toHaveAttribute('inert');
    expect(loginPanel).toHaveAttribute('aria-hidden', 'false');
    expect(signupPanel).toHaveAttribute('inert');
    expect(signupPanel).toHaveAttribute('aria-hidden', 'true');

    // Tab through all focusable controls on login; focus must never enter signupPanel
    for (let step = 0; step < 6; step += 1) {
      await user.tab();
      expect(signupPanel.contains(document.activeElement)).toBe(false);
    }
  });

  it('carries email across when switching routes and focuses the new heading', async () => {
    renderAuthRoute('/login');

    const loginEmail = screen.getByLabelText('Email', { selector: '#login-email' }) as HTMLInputElement;
    fireEvent.change(loginEmail, { target: { value: 'carry@example.com' } });

    fireEvent.click(screen.getByRole('link', { name: 'Create an account' }));

    const signupPanel = screen.getByTestId('signup-panel');
    const loginPanel = screen.getByTestId('login-panel');

    expect(signupPanel).not.toHaveAttribute('inert');
    expect(loginPanel).toHaveAttribute('inert');

    const signupEmail = screen.getByLabelText('Email', { selector: '#signup-email' }) as HTMLInputElement;
    expect(signupEmail.value).toBe('carry@example.com');

    await waitFor(
      () => {
        expect(document.activeElement).toBe(
          screen.getByRole('heading', { name: 'Create your account' })
        );
      },
      { timeout: 1500 }
    );
  });

  it('renders signup copy, password helper, and disables submit while loading', async () => {
    let resolveSignup: () => void = () => {};
    const registerMock = jest.fn(
      () =>
        new Promise<{ id: string; name: string; email: string; createdAt: string; updatedAt: string }>(
          (resolve) => {
            resolveSignup = () =>
              resolve({ id: '1', name: 'Alice', email: 'a@b.com', createdAt: '', updatedAt: '' });
          }
        )
    );

    mockedUseAuth.mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      login: jest.fn(),
      register: registerMock,
      logout: jest.fn(),
      refreshUser: jest.fn(),
    });

    renderAuthRoute('/signup');

    expect(screen.getByRole('heading', { name: 'Create your account' })).toBeInTheDocument();
    expect(screen.getByText('At least 8 characters.')).toBeInTheDocument();
    expect(screen.getByText('Start small. Watch plans grow.')).toBeInTheDocument();
    expect(screen.getByLabelText('Password', { selector: '#signup-password' })).toHaveAttribute(
      'autocomplete',
      'new-password'
    );

    fireEvent.change(screen.getByLabelText('Name', { selector: '#signup-name' }), {
      target: { value: 'Alice' },
    });
    fireEvent.change(screen.getByLabelText('Email', { selector: '#signup-email' }), {
      target: { value: 'alice@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password', { selector: '#signup-password' }), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    const loadingBtn = await screen.findByRole('button', { name: 'Creating account…' });
    expect(loadingBtn).toBeDisabled();

    resolveSignup();
    expect(await screen.findByText('Dashboard Target')).toBeInTheDocument();
  });

  it('preserves input values on login error and redirects when already authenticated', async () => {
    const loginMock = jest.fn().mockRejectedValue({ response: { status: 401 } });
    mockedUseAuth.mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      login: loginMock,
      register: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
    });

    renderAuthRoute('/login');

    const emailInput = screen.getByLabelText('Email', { selector: '#login-email' }) as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password', {
      selector: '#login-password',
    }) as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'alice@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));

    await waitFor(() => {
      expect(
        screen.getByText("That email and password don't match. Check them and try again.")
      ).toBeInTheDocument();
    });
    expect(emailInput.value).toBe('alice@example.com');
    expect(passwordInput.value).toBe('wrongpass');

    mockedUseAuth.mockReturnValue({
      user: { id: '1', name: 'Alice', email: 'alice@example.com', createdAt: '', updatedAt: '' },
      token: 'jwt',
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
    });

    renderAuthRoute('/login');
    expect(screen.getByText('Dashboard Target')).toBeInTheDocument();
  });

  it('uses mobile clip-path frames when viewport is <= 767px', () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = jest.fn().mockImplementation((query: string) => ({
      matches: query === '(max-width: 767px)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    const { container } = renderAuthRoute('/login');
    const clipPathEl = container.querySelector('clipPath path');
    expect(clipPathEl?.getAttribute('d')).toContain('1 0.34');

    window.matchMedia = originalMatchMedia;
  });

  it('focuses heading cleanly when prefers-reduced-motion is active', async () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = jest.fn().mockImplementation((query: string) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    renderAuthRoute('/login');
    fireEvent.click(screen.getByRole('link', { name: 'Create an account' }));

    await waitFor(
      () => {
        expect(document.activeElement).toBe(
          screen.getByRole('heading', { name: 'Create your account' })
        );
      },
      { timeout: 1500 }
    );

    window.matchMedia = originalMatchMedia;
  });
});
