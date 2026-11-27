import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PageTransitionProvider, TransitionLink } from '../context/PageTransitionContext';
import FogTransitionOverlay from '../components/FogTransitionOverlay';

function renderWithTransition(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <PageTransitionProvider>
        <Routes>
          <Route
            path="/"
            element={
              <div>
                <TransitionLink to="/signup">Get started</TransitionLink>
                <TransitionLink to="/login">Log in</TransitionLink>
              </div>
            }
          />
          <Route path="/signup" element={<main><h1 tabIndex={-1}>Create your account</h1></main>} />
          <Route path="/login" element={<main><h1 tabIndex={-1}>Welcome back</h1></main>} />
        </Routes>
        <FogTransitionOverlay />
      </PageTransitionProvider>
    </MemoryRouter>
  );
}

describe('PageTransition (Landing to Auth Fog)', () => {
  it('starts fog transition on plain left click, swaps route, and updates document.title', async () => {
    renderWithTransition('/');
    expect(document.title).toBe('Pinnate');

    const overlay = screen.getByTestId('fog-transition-overlay');
    expect(overlay).toHaveAttribute('aria-hidden', 'true');
    expect(overlay).toHaveAttribute('data-phase', 'idle');

    fireEvent.click(screen.getByRole('link', { name: 'Get started' }));

    await waitFor(
      () => {
        expect(screen.getByRole('heading', { name: 'Create your account' })).toBeInTheDocument();
      },
      { timeout: 1500 }
    );

    expect(document.title).toBe('Create account · Pinnate');
    await waitFor(
      () => {
        expect(overlay).toHaveAttribute('data-phase', 'idle');
      },
      { timeout: 1500 }
    );
  });

  it('does not intercept Ctrl+click or middle-click so new-tab navigation works natively', () => {
    renderWithTransition('/');
    const link = screen.getByRole('link', { name: 'Get started' });
    const overlay = screen.getByTestId('fog-transition-overlay');

    fireEvent.click(link, { ctrlKey: true, button: 0 });
    expect(overlay).toHaveAttribute('data-phase', 'idle');

    fireEvent.click(link, { button: 1 });
    expect(overlay).toHaveAttribute('data-phase', 'idle');
  });
});
