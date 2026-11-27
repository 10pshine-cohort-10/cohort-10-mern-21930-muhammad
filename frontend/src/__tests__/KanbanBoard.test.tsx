import { render, screen, fireEvent } from '@testing-library/react';
import KanbanBoard from '../components/KanbanBoard';
import type { Note } from '../types';

const sampleNotes: Note[] = [
  {
    id: 'n1',
    userId: 'u1',
    title: 'Draft API Spec',
    content: '<p>Endpoints</p>',
    color: 'sand',
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
  it('renders pin indicator only on pinned cards and excludes untracked notes', () => {
    const notesWithPin: Note[] = [
      { ...sampleNotes[0], isPinned: true },
      { ...sampleNotes[1], status: 'in_progress', isPinned: false },
    ];
    const { container } = render(
      <KanbanBoard
        notes={notesWithPin}
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
    expect(container.querySelector('.colorSand')).toBeInTheDocument();
  });

  it('keeps all stage columns rendered with hint when board has no staged notes yet', () => {
    render(
      <KanbanBoard
        notes={[sampleNotes[1]]}
        onOpenNote={jest.fn()}
        onMoveStatus={jest.fn()}
        onCreateInColumn={jest.fn()}
      />
    );

    expect(screen.getByText(/Your plan board is clear/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'To Do' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'In Progress' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Done' })).toBeInTheDocument();
  });

  it('moves note status via the Move to menu and sets swing state', () => {
    const onMoveStatus = jest.fn().mockResolvedValue(undefined);
    const { container } = render(
      <KanbanBoard
        notes={sampleNotes}
        onOpenNote={jest.fn()}
        onMoveStatus={onMoveStatus}
        onCreateInColumn={jest.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Move to column' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'In Progress' }));
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

  it('opens column + popover, filters existing notes, promotes to column, and restores focus on Escape', () => {
    const onMoveStatus = jest.fn().mockResolvedValue(undefined);
    render(
      <KanbanBoard
        notes={sampleNotes}
        onOpenNote={jest.fn()}
        onMoveStatus={onMoveStatus}
        onCreateInColumn={jest.fn()}
      />
    );

    const addBtn = screen.getByRole('button', { name: 'Add note to In Progress' });
    fireEvent.click(addBtn);

    expect(screen.getByRole('dialog', { name: 'Add note to In Progress' })).toBeInTheDocument();
    expect(screen.getByText('Reference Note')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(addBtn).toHaveFocus();

    fireEvent.click(addBtn);
    fireEvent.click(screen.getByText('Reference Note'));
    expect(onMoveStatus).toHaveBeenCalledWith('n2', 'in_progress');
  });

  it('moves note via the Move to menu fallback and restores focus on Escape', () => {
    const onMoveStatus = jest.fn().mockResolvedValue(undefined);
    render(
      <KanbanBoard
        notes={sampleNotes}
        onOpenNote={jest.fn()}
        onMoveStatus={onMoveStatus}
        onCreateInColumn={jest.fn()}
      />
    );

    const moveTrigger = screen.getByRole('button', { name: 'Move to column' });
    fireEvent.click(moveTrigger);
    const menu = screen.getByRole('menu', { name: 'Move note to column' });
    fireEvent.keyDown(menu, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(moveTrigger).toHaveFocus();

    fireEvent.click(moveTrigger);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Done' }));
    expect(onMoveStatus).toHaveBeenCalledWith('n1', 'done');
  });
});
