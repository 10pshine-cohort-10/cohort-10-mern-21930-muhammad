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
});

describe('LandingPage', () => {
  it('renders 3 consolidated Acts, CTAs, and interactive pushpin snap surprise', () => {
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

    render(
      <MemoryRouter initialEntries={['/']}>
        <LandingPage />
      </MemoryRouter>
    );

    const getStartedLinks = screen.getAllByRole('link', { name: /get started/i });
    expect(getStartedLinks.length).toBeGreaterThanOrEqual(2);
    expect(getStartedLinks[0]).toHaveAttribute('href', '/register');

    const loginLinks = screen.getAllByRole('link', { name: /log in/i });
    expect(loginLinks.length).toBeGreaterThanOrEqual(2);
    expect(loginLinks[0]).toHaveAttribute('href', '/login');

    const scratchpadLinks = screen.getAllByRole('link', { name: /try scratchpad/i });
    expect(scratchpadLinks).toHaveLength(2);
    expect(scratchpadLinks[0]).toHaveAttribute('href', '/scratchpad');

    expect(screen.getByText('Capture messy drafts. Tack finished notes.')).toBeInTheDocument();
    expect(screen.getByText('Pin priorities. Keep #folders one click away.')).toBeInTheDocument();
    expect(screen.getByText('Stay on the keyboard. Own every byte.')).toBeInTheDocument();

    const miniInput = screen.getByLabelText('Interactive scratchpad preview');
    fireEvent.change(miniInput, { target: { value: 'Ship landing page' } });
    fireEvent.keyDown(miniInput, { key: 'Enter' });
    expect(screen.getByText('Ship landing page')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /tack to desk/i }));
    expect(screen.getByRole('button', { name: /tacked to desk/i })).toBeInTheDocument();
  });
});
