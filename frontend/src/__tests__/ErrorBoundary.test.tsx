import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../components/ErrorBoundary';

function ProblematicChild({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test explosion');
  }
  return <div>Desk is clean</div>;
}

describe('ErrorBoundary', () => {
  const originalError = console.error;

  beforeEach(() => {
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ProblematicChild shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Desk is clean')).toBeInTheDocument();
  });

  it('renders tactile fallback card with error details when a child throws', () => {
    render(
      <ErrorBoundary>
        <ProblematicChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong on your desk')).toBeInTheDocument();
    expect(screen.getByText('Test explosion')).toBeInTheDocument();
    expect(screen.getByText('Reload Workspace')).toBeInTheDocument();
    expect(screen.getByText('Return to Desk')).toBeInTheDocument();
  });

  it('triggers reload callback when reload button is clicked', () => {
    const handleReload = jest.fn();

    render(
      <ErrorBoundary onReload={handleReload}>
        <ProblematicChild shouldThrow={true} />
      </ErrorBoundary>
    );

    const reloadButton = screen.getByRole('button', { name: /reload workspace/i });
    fireEvent.click(reloadButton);

    expect(handleReload).toHaveBeenCalledTimes(1);
  });

  it('triggers navigate home callback when return to desk button is clicked', () => {
    const handleHome = jest.fn();

    render(
      <ErrorBoundary onNavigateHome={handleHome}>
        <ProblematicChild shouldThrow={true} />
      </ErrorBoundary>
    );

    const deskButton = screen.getByRole('button', { name: /return to desk/i });
    fireEvent.click(deskButton);

    expect(handleHome).toHaveBeenCalledTimes(1);
  });
});
