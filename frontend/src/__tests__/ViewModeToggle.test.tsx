import { render, screen, fireEvent } from '@testing-library/react';
import ViewModeToggle from '../components/ViewModeToggle';

describe('ViewModeToggle Component', () => {
  it('highlights grid mode when currentMode is grid', () => {
    render(<ViewModeToggle currentMode="grid" onChangeMode={jest.fn()} />);
    const gridBtn = screen.getByRole('radio', { name: /grid/i });
    const streamBtn = screen.getByRole('radio', { name: /stream/i });

    expect(gridBtn).toHaveAttribute('aria-checked', 'true');
    expect(streamBtn).toHaveAttribute('aria-checked', 'false');
  });

  it('triggers onChangeMode when opposite mode is clicked', () => {
    const handleChange = jest.fn();
    render(<ViewModeToggle currentMode="grid" onChangeMode={handleChange} />);

    fireEvent.click(screen.getByRole('radio', { name: /stream/i }));
    expect(handleChange).toHaveBeenCalledWith('stream');
  });
});
