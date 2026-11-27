import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import { useAuth } from '../context/AuthContext';

jest.mock('../context/AuthContext');

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

beforeAll(() => {
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  });

  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    value: class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  });
});

describe('LandingPage', () => {
  it('renders feature tabs, CTAs, and interactive scratchpad', () => {
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

    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <LandingPage />
      </MemoryRouter>
    );

    // Nav + hero CTA
    const getStartedLinks = screen.getAllByRole('link', { name: /get started/i });
    expect(getStartedLinks.length).toBeGreaterThanOrEqual(2);
    expect(getStartedLinks[0]).toHaveAttribute('href', '/signup');

    const loginLinks = screen.getAllByRole('link', { name: /log in/i });
    expect(loginLinks.length).toBeGreaterThanOrEqual(1);
    expect(loginLinks[0]).toHaveAttribute('href', '/login');

    // Board tab is active by default and its heading is visible
    expect(screen.getByText('Move plans forward at your own pace')).toBeInTheDocument();

    // Tab buttons exist
    expect(screen.getByRole('tab', { name: /board/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /progress/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /scratchpad/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /commands/i })).toBeInTheDocument();

    // Switching to Scratchpad tab shows the interactive preview
    fireEvent.click(screen.getByRole('tab', { name: /scratchpad/i }));
    // The interactive input becomes available after the tab switch
    const miniInput = screen.getByLabelText('Interactive scratchpad preview');
    fireEvent.change(miniInput, { target: { value: 'Ship landing page' } });
    fireEvent.keyDown(miniInput, { key: 'Enter' });
    expect(screen.getByText('Ship landing page')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /add to notes/i }));
    expect(screen.getByRole('button', { name: /added to notes/i })).toBeInTheDocument();

    // Brand pronunciation cue and Pinnate tagline are visible
    expect(screen.getAllByText(/PIN-ayt/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Start writing in a place that stays out of your way.')).toBeInTheDocument();

    // Decorative scroll thread SVG mounts cleanly inside the canvas wrapper
    const threadSvg = container.querySelector('svg[aria-hidden="true"]');
    expect(threadSvg).toBeInTheDocument();

    // No Cloud Desk, Desk, or Tack branding
    expect(screen.queryByText(/Cloud Desk/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\bDesk\b/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\bTack\b/i)).not.toBeInTheDocument();
  });
});
