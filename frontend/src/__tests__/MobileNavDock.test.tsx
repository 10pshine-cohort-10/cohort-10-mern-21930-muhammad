import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MobileNavDock from '../components/MobileNavDock';

describe('MobileNavDock Component', () => {
  it('renders all primary navigation links', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <MobileNavDock onQuickAddClick={jest.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByTitle('Notes')).toBeInTheDocument();
    expect(screen.getByTitle('Scratchpad')).toBeInTheDocument();
    expect(screen.getByTitle('Progress')).toBeInTheDocument();
    expect(screen.getByTitle('Archive')).toBeInTheDocument();
    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByText('Scratch')).toBeInTheDocument();
    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('Archive')).toBeInTheDocument();
  });

  it('triggers onQuickAddClick when center plus button is clicked', () => {
    const handleAdd = jest.fn();
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <MobileNavDock onQuickAddClick={handleAdd} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByLabelText('Create new note'));
    expect(handleAdd).toHaveBeenCalledTimes(1);
  });
});
