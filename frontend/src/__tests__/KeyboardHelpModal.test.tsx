import { render, screen, fireEvent } from '@testing-library/react';
import KeyboardHelpModal from '../components/KeyboardHelpModal';

describe('KeyboardHelpModal Component', () => {
  it('returns null when isOpen is false', () => {
    const { container } = render(<KeyboardHelpModal isOpen={false} onClose={jest.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders shortcut cheat list when isOpen is true', () => {
    render(<KeyboardHelpModal isOpen={true} onClose={jest.fn()} />);

    expect(screen.getByText('Desk Keyboard Shortcuts')).toBeInTheDocument();
    expect(screen.getByText('Next note on desk')).toBeInTheDocument();
    expect(screen.getByText('Focus Quick-Tack bar')).toBeInTheDocument();
    expect(screen.getByText('Undo delete')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = jest.fn();
    render(<KeyboardHelpModal isOpen={true} onClose={handleClose} />);

    fireEvent.click(screen.getByLabelText('Close shortcuts modal'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
