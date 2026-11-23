import { render, screen, fireEvent, act } from '@testing-library/react';
import UndoToast from '../components/UndoToast';

describe('UndoToast Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders note title and countdown badge', () => {
    render(
      <UndoToast
        noteTitle="Meeting Prep"
        onUndo={jest.fn()}
        onDismiss={jest.fn()}
        durationMs={5000}
      />
    );

    expect(screen.getByText('Meeting Prep')).toBeInTheDocument();
    expect(screen.getByText('5s')).toBeInTheDocument();
  });

  it('calls onUndo when Undo button is clicked', () => {
    const handleUndo = jest.fn();
    render(
      <UndoToast
        noteTitle="Architecture Notes"
        onUndo={handleUndo}
        onDismiss={jest.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /undo/i }));
    expect(handleUndo).toHaveBeenCalledTimes(1);
  });

  it('calls onDismiss when close button is clicked', () => {
    const handleDismiss = jest.fn();
    render(
      <UndoToast
        noteTitle="Temporary Note"
        onUndo={jest.fn()}
        onDismiss={handleDismiss}
      />
    );

    fireEvent.click(screen.getByLabelText('Dismiss toast'));
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  it('automatically triggers onDismiss when countdown expires', () => {
    const handleDismiss = jest.fn();
    render(
      <UndoToast
        noteTitle="Expiring Note"
        onUndo={jest.fn()}
        onDismiss={handleDismiss}
        durationMs={3000}
      />
    );

    act(() => {
      jest.advanceTimersByTime(3100);
    });

    expect(handleDismiss).toHaveBeenCalled();
  });
});
