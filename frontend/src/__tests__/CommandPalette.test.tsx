import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CommandPalette, { type CommandPaletteProps } from '../components/CommandPalette';
import type { Note } from '../types';

describe('CommandPalette Component', () => {
  const sampleNotes: Note[] = [
    {
      id: 'note-1',
      userId: 'user-1',
      title: 'Sprint Planning',
      content: 'Review roadmap and goals',
      tags: ['planning'],
      color: 'slate',
      isPinned: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'note-2',
      userId: 'user-1',
      title: 'Book Recommendations',
      content: 'Reading list for the year',
      tags: ['books'],
      color: 'teal',
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const defaultProps: CommandPaletteProps = {
    isOpen: true,
    onClose: jest.fn(),
    notes: sampleNotes,
    onSelectNote: jest.fn(),
    onCreateNote: jest.fn(),
    onTogglePinnedFilter: jest.fn(),
    onExportNotes: jest.fn(),
  };

  const renderComponent = (props: Partial<CommandPaletteProps> = {}) => {
    return render(
      <BrowserRouter>
        <CommandPalette {...defaultProps} {...props} />
      </BrowserRouter>
    );
  };

  it('renders nothing when isOpen is false', () => {
    const { container } = renderComponent({ isOpen: false });
    expect(container).toBeEmptyDOMElement();
  });

  it('renders actions and note suggestions when open', () => {
    renderComponent();
    expect(screen.getByPlaceholderText(/Type a command or search notes/i)).toBeInTheDocument();
    expect(screen.getByText('Create new note')).toBeInTheDocument();
    expect(screen.getByText('Sprint Planning')).toBeInTheDocument();
  });

  it('filters actions and notes when user types a search query', () => {
    renderComponent();
    const input = screen.getByPlaceholderText(/Type a command or search notes/i);

    fireEvent.change(input, { target: { value: 'Book' } });

    expect(screen.getByText('Book Recommendations')).toBeInTheDocument();
    expect(screen.queryByText('Sprint Planning')).not.toBeInTheDocument();
  });

  it('invokes onCreateNote when create action is clicked', () => {
    const onCreateNote = jest.fn();
    const onClose = jest.fn();
    renderComponent({ onCreateNote, onClose });

    fireEvent.click(screen.getByText('Create new note'));

    expect(onCreateNote).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('invokes onSelectNote when a matching note is clicked', () => {
    const onSelectNote = jest.fn();
    const onClose = jest.fn();
    renderComponent({ onSelectNote, onClose });

    fireEvent.click(screen.getByText('Sprint Planning'));

    expect(onSelectNote).toHaveBeenCalledWith(sampleNotes[0]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes when Escape is pressed', () => {
    const onClose = jest.fn();
    renderComponent({ onClose });

    const input = screen.getByPlaceholderText(/Type a command or search notes/i);
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('switches view mode and opens keyboard help via commands', () => {
    const onChangeViewMode = jest.fn();
    const onOpenHelp = jest.fn();
    const onClose = jest.fn();
    renderComponent({ onChangeViewMode, onOpenHelp, onClose });

    fireEvent.click(screen.getByText('Switch to Board view'));
    expect(onChangeViewMode).toHaveBeenCalledWith('board');
    expect(onClose).toHaveBeenCalledTimes(1);

    const input = screen.getByPlaceholderText(/Type a command or search notes/i);
    fireEvent.change(input, { target: { value: 'Keyboard' } });
    fireEvent.click(screen.getByText('Keyboard shortcuts'));
    expect(onOpenHelp).toHaveBeenCalledTimes(1);
  });
});
