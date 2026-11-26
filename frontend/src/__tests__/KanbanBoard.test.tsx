import { render, screen, fireEvent } from '@testing-library/react';
import KanbanBoard from '../components/KanbanBoard';
import type { Note } from '../types';

const sampleNotes: Note[] = [
  {
    id: 'n1',
    userId: 'u1',
    title: 'Draft API Spec',
    content: '<p>Endpoints</p>',
    color: 'slate',
    status: 'todo',
    isPinned: false,
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'n2',
    userId: 'u1',
    title: 'Reference Note',
    content: '<p>Unassigned</p>',
    color: 'sage',
    status: null,
    isPinned: false,
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe('KanbanBoard', () => {
  it('renders board notes in columns with pushpin and excludes untracked notes', () => {
    const { container } = render(
      <KanbanBoard
        notes={sampleNotes}
        onOpenNote={jest.fn()}
        onMoveStatus={jest.fn()}
        onCreateInColumn={jest.fn()}
      />
    );

    expect(screen.getByText('Draft API Spec')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'To Do' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'In Progress' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Done' })).toBeInTheDocument();
    expect(container.querySelectorAll('.pinIndicator')).toHaveLength(1);
  });

  it('moves note status when clicking quick-move button and sets swing state', () => {
    const onMoveStatus = jest.fn().mockResolvedValue(undefined);
    const { container } = render(
      <KanbanBoard
        notes={sampleNotes}
        onOpenNote={jest.fn()}
        onMoveStatus={onMoveStatus}
        onCreateInColumn={jest.fn()}
      />
    );

    fireEvent.click(screen.getByTitle('Move to In Progress'));
    expect(onMoveStatus).toHaveBeenCalledWith('n1', 'in_progress');
    expect(container.querySelector('.kanbanCardSwinging')).toBeInTheDocument();
  });

  it('does not trigger swing or move when dropped into the same column', () => {
    const onMoveStatus = jest.fn().mockResolvedValue(undefined);
    const { container } = render(
      <KanbanBoard
        notes={sampleNotes}
        onOpenNote={jest.fn()}
        onMoveStatus={onMoveStatus}
        onCreateInColumn={jest.fn()}
      />
    );

    const card = screen.getByText('Draft API Spec').closest('[draggable="true"]') as HTMLElement;
    const todoHeading = screen.getByRole('heading', { name: 'To Do' });
    const todoColumn = todoHeading.closest('.column') as HTMLElement;

    const dataTransfer = {
      data: {} as Record<string, string>,
      setData(key: string, val: string) { this.data[key] = val; },
      getData(key: string) { return this.data[key] || ''; },
      effectAllowed: 'move',
    };

    fireEvent.dragStart(card, { dataTransfer });
    fireEvent.drop(todoColumn, { dataTransfer });

    expect(onMoveStatus).not.toHaveBeenCalled();
    expect(container.querySelector('.kanbanCardSwinging')).not.toBeInTheDocument();
  });
});
