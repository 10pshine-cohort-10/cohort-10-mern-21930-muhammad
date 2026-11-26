import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import QuickTackBar from '../components/QuickTackBar';

describe('QuickTackBar Component', () => {
  it('renders input with default placeholder when activeTag is empty', () => {
    render(<QuickTackBar activeTag="" onQuickCreate={jest.fn()} />);
    expect(screen.getByPlaceholderText(/Quick tack a note to board/i)).toBeInTheDocument();
  });

  it('renders input with folder tag in placeholder when activeTag is set', () => {
    render(<QuickTackBar activeTag="ideas" onQuickCreate={jest.fn()} />);
    expect(screen.getByPlaceholderText(/Quick tack a note to #ideas/i)).toBeInTheDocument();
  });

  it('submits on Enter key and clears input field', async () => {
    const handleCreateMock = jest.fn().mockResolvedValue(undefined);
    render(<QuickTackBar activeTag="work" onQuickCreate={handleCreateMock} />);

    const input = screen.getByLabelText('Quick note input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Buy more coffee' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(handleCreateMock).toHaveBeenCalledWith('Buy more coffee', 'work');
      expect(input.value).toBe('');
    });
  });

  it('does not submit when Enter is pressed on empty input', () => {
    const handleCreateMock = jest.fn();
    render(<QuickTackBar activeTag="" onQuickCreate={handleCreateMock} />);

    const input = screen.getByLabelText('Quick note input');
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(handleCreateMock).not.toHaveBeenCalled();
  });

  it('preserves input and shows alert when quick create fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const handleCreateMock = jest.fn().mockRejectedValue(new Error('Network error'));
    render(<QuickTackBar activeTag="" onQuickCreate={handleCreateMock} />);

    const input = screen.getByLabelText('Quick note input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Unsaved idea' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to save note. Try again.');
      expect(input.value).toBe('Unsaved idea');
    });

    consoleSpy.mockRestore();
  });
});
