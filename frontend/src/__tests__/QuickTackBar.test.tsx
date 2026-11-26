import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import QuickTackBar from '../components/QuickTackBar';

describe('QuickTackBar Component', () => {
  it('starts collapsed as a pill and expands on click', () => {
    render(<QuickTackBar activeTag="" onQuickCreate={jest.fn()} />);
    const pill = screen.getByRole('button', { name: /Quick tack a note/i });
    expect(pill).toBeInTheDocument();

    fireEvent.click(pill);
    expect(screen.getByPlaceholderText(/Quick tack a note to board/i)).toBeInTheDocument();
  });

  it('ignores q shortcut when focus is inside an input', () => {
    render(
      <div>
        <input aria-label="Other input" />
        <QuickTackBar activeTag="" onQuickCreate={jest.fn()} />
      </div>
    );

    const otherInput = screen.getByLabelText('Other input');
    otherInput.focus();
    fireEvent.keyDown(window, { key: 'q' });

    expect(screen.queryByLabelText('Quick note input')).not.toBeInTheDocument();
  });

  it('submits on Enter key and clears input field', async () => {
    const handleCreateMock = jest.fn().mockResolvedValue(undefined);
    render(<QuickTackBar activeTag="work" onQuickCreate={handleCreateMock} />);

    fireEvent.click(screen.getByRole('button', { name: /Quick tack a note/i }));
    const input = screen.getByLabelText('Quick note input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Buy more coffee' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(handleCreateMock).toHaveBeenCalledWith('Buy more coffee', 'work');
      expect(input.value).toBe('');
    });
  });

  it('preserves input and shows alert when quick create fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const handleCreateMock = jest.fn().mockRejectedValue(new Error('Network error'));
    render(<QuickTackBar activeTag="" onQuickCreate={handleCreateMock} />);

    fireEvent.click(screen.getByRole('button', { name: /Quick tack a note/i }));
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
