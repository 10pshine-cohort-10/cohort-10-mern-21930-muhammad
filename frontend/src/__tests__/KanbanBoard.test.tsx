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
  it('renders board notes in columns and excludes untracked notes from columns', () => {
    render(
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
  });

  it('moves note status when clicking quick-move button', () => {
    const onMoveStatus = jest.fn().mockResolvedValue(undefined);
    render(
      <KanbanBoard
        notes={sampleNotes}
        onOpenNote={jest.fn()}
        onMoveStatus={onMoveStatus}
        onCreateInColumn={jest.fn()}
      />
    );

    fireEvent.click(screen.getByTitle('Move to In Progress'));
    expect(onMoveStatus).toHaveBeenCalledWith('n1', 'in_progress');
  });
});
