import { render, screen, fireEvent } from '@testing-library/react';
import NoteCard, { type NoteCardProps } from '../components/NoteCard';

describe('NoteCard Component', () => {
  const sampleNote: NoteCardProps['note'] = {
    id: 'note-123',
    userId: 'user-1',
    title: 'Design System Discussion',
    content: '<p>Discussing <strong>typography</strong> and colors.</p>',
    isPinned: false,
    tags: ['design', 'ui'],
    color: 'teal',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('renders title, plain text preview, and tags correctly', () => {
    render(<NoteCard note={sampleNote} onSelect={() => {}} onTogglePin={() => {}} onDelete={() => {}} />);

    expect(screen.getByText('Design System Discussion')).toBeInTheDocument();
    expect(screen.getByText(/Discussing typography and colors/i)).toBeInTheDocument();
    expect(screen.getByText('#design')).toBeInTheDocument();
    expect(screen.getByText('#ui')).toBeInTheDocument();
  });

  it('invokes onSelect when card is clicked', () => {
    let selectedNote: NoteCardProps['note'] | null = null;
    render(
      <NoteCard
        note={sampleNote}
        onSelect={(n) => {
          selectedNote = n;
        }}
        onTogglePin={() => {}}
        onDelete={() => {}}
      />
    );

    fireEvent.click(screen.getByText('Design System Discussion'));
    expect(selectedNote).toBe(sampleNote);
  });

  it('invokes onTogglePin with inverted pin status when pin button is clicked', () => {
    let toggledPinStatus: boolean | null = null;
    render(
      <NoteCard
        note={sampleNote}
        onSelect={() => {}}
        onTogglePin={(_id, status) => {
          toggledPinStatus = status;
        }}
        onDelete={() => {}}
      />
    );

    fireEvent.click(screen.getByLabelText(/Pin note/i));
    expect(toggledPinStatus).toBe(true);
  });

  it('shows confirmation prompt and confirms deletion', () => {
    let deletedId: string | null = null;
    render(
      <NoteCard
        note={sampleNote}
        onSelect={() => {}}
        onTogglePin={() => {}}
        onDelete={(id) => {
          deletedId = id;
        }}
      />
    );

    fireEvent.click(screen.getByLabelText(/Delete note/i));
    expect(screen.getByText(/Delete this note\?/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText('Delete'));
    expect(deletedId).toBe('note-123');
  });
});
