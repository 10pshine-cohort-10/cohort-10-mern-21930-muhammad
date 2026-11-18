import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from '../components/SearchBar';

describe('SearchBar Component', () => {
  it('renders input with placeholder and fires onChange event', () => {
    let currentVal = '';
    const handleChange = (val) => {
      currentVal = val;
    };

    render(<SearchBar value="" onChange={handleChange} onClear={() => {}} placeholder="Search test" />);

    const input = screen.getByPlaceholderText('Search test');
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'Project' } });
    expect(currentVal).toBe('Project');
  });

  it('renders clear button when value is present and triggers onClear', () => {
    let cleared = false;
    const handleClear = () => {
      cleared = true;
    };

    render(<SearchBar value="Query" onChange={() => {}} onClear={handleClear} />);

    const clearButton = screen.getByLabelText(/Clear search/i);
    expect(clearButton).toBeInTheDocument();

    fireEvent.click(clearButton);
    expect(cleared).toBe(true);
  });
});
