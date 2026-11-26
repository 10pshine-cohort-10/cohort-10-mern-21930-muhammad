import { render, screen } from '@testing-library/react';
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
  it('renders Get started and Log in CTAs and core product sections for visitors', () => {
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

    expect(screen.getByText('Pinning & Quick Capture')).toBeInTheDocument();
    expect(screen.getByText('Collapsible #Folders')).toBeInTheDocument();
    expect(screen.getByText('Grid & Stream Views')).toBeInTheDocument();
    expect(screen.getByText('Guest Scratchpad')).toBeInTheDocument();
    expect(screen.getByText('Draft Blotter & Real-Time Sync')).toBeInTheDocument();
  });
});
