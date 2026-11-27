import { render, screen, fireEvent } from '@testing-library/react';
import KeyboardHelpModal from '../components/KeyboardHelpModal';

describe('KeyboardHelpModal Component', () => {
  it('returns null when isOpen is false', () => {
    const { container } = render(<KeyboardHelpModal isOpen={false} onClose={jest.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders shortcut cheat list when isOpen is true', () => {
    render(<KeyboardHelpModal isOpen={true} onClose={jest.fn()} />);

    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
    expect(screen.getByText('Next note')).toBeInTheDocument();
    expect(screen.getByText('Quick add note')).toBeInTheDocument();
    expect(screen.getByText('Delete or undo')).toBeInTheDocument();
  });

  it('calls onClose when close button or Escape is pressed', () => {
    const handleClose = jest.fn();
    render(<KeyboardHelpModal isOpen={true} onClose={handleClose} />);

    fireEvent.click(screen.getByLabelText('Close shortcuts modal'));
    expect(handleClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});
