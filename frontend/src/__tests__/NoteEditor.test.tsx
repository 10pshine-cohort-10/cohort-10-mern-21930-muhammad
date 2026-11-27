import { StrictMode } from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import NoteEditor from '../components/NoteEditor';
import { useEditor } from '@tiptap/react';

jest.mock('@tiptap/react', () => ({
  useEditor: jest.fn(),
  EditorContent: () => <div data-testid="editor-content" />,
}));

jest.mock('@tiptap/starter-kit', () => ({
  __esModule: true,
  default: {},
}));

const mockedUseEditor = useEditor as jest.Mock;

describe('NoteEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not initialize TipTap when closed', () => {
    const { container } = render(
      <NoteEditor note={null} isOpen={false} onClose={jest.fn()} onSave={jest.fn()} />
    );

    expect(container.firstChild).toBeNull();
    expect(mockedUseEditor).not.toHaveBeenCalled();
  });

  it('does not throw when editor is destroyed in StrictMode', () => {
    const setContentMock = jest.fn(() => {
      throw new TypeError("Cannot read properties of null (reading 'commands')");
    });

    mockedUseEditor.mockReturnValue({
      isDestroyed: true,
      getHTML: () => '<p></p>',
      isActive: () => false,
      commands: { setContent: setContentMock },
      chain: () => ({ focus: () => ({ run: jest.fn() }) }),
    });

    expect(() =>
      render(
        <StrictMode>
          <NoteEditor note={null} isOpen={true} onClose={jest.fn()} onSave={jest.fn()} />
        </StrictMode>
      )
    ).not.toThrow();

    expect(setContentMock).not.toHaveBeenCalled();
    expect(screen.getByPlaceholderText('Note title...')).toBeInTheDocument();
  });

  it('displays save error banner and stays open when manual save fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const onSaveFail = jest.fn().mockRejectedValue(new Error('Network down'));
    const onClose = jest.fn();

    mockedUseEditor.mockReturnValue({
      isDestroyed: false,
      getHTML: () => '<p>Body</p>',
      isActive: () => false,
      commands: { setContent: jest.fn() },
      chain: () => ({ focus: () => ({ run: jest.fn() }) }),
    });

    render(<NoteEditor note={null} isOpen={true} onClose={onClose} onSave={onSaveFail} />);
    fireEvent.click(screen.getByRole('button', { name: 'Save Note' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Failed to save note. Check your connection and try again.'
      );
    });
    expect(onClose).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('asks confirmation before discarding an unsaved non-empty new draft and preserves autosave stability', () => {
    const onClose = jest.fn();
    mockedUseEditor.mockReturnValue({
      isDestroyed: false,
      getHTML: () => '<p>Important thought</p>',
      isActive: () => false,
      commands: { setContent: jest.fn() },
      chain: () => ({ focus: () => ({ run: jest.fn() }) }),
    });

    const { rerender } = render(
      <NoteEditor note={null} isOpen={true} onClose={onClose} onSave={jest.fn()} />
    );

    const titleInput = screen.getByPlaceholderText('Note title...');
    fireEvent.change(titleInput, { target: { value: 'Draft Plan' } });
    fireEvent.keyDown(window, { key: 'Escape' });

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByText('Discard unsaved draft?')).toBeInTheDocument();

    rerender(<NoteEditor note={null} isOpen={true} onClose={onClose} onSave={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Discard' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('triggers debounced autosave on body onUpdate without looping when parent re-renders new onSave', async () => {
    jest.useFakeTimers();
    let capturedOnUpdate: (() => void) | undefined;
    const stableEditor = {
      isDestroyed: false,
      getHTML: () => '<p>Updated body</p>',
      isActive: () => false,
      commands: { setContent: jest.fn() },
      chain: () => ({ focus: () => ({ run: jest.fn() }) }),
    };
    mockedUseEditor.mockImplementation((opts: { onUpdate?: () => void }) => {
      capturedOnUpdate = opts.onUpdate;
      return stableEditor;
    });

    const firstSave = jest.fn().mockResolvedValue(undefined);
    const secondSave = jest.fn().mockResolvedValue(undefined);
    const existingNote = {
      id: 'n1',
      userId: 'u1',
      title: 'Existing Note',
      content: '<p>Initial</p>',
      color: 'slate' as const,
      isPinned: false,
      tags: [],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };

    const { rerender } = render(
      <NoteEditor note={existingNote} isOpen={true} onClose={jest.fn()} onSave={firstSave} />
    );

    act(() => {
      capturedOnUpdate?.();
    });
    await act(async () => {
      jest.advanceTimersByTime(1600);
      await Promise.resolve();
    });
    expect(firstSave).toHaveBeenCalledTimes(1);

    rerender(
      <NoteEditor note={existingNote} isOpen={true} onClose={jest.fn()} onSave={secondSave} />
    );
    await act(async () => {
      jest.advanceTimersByTime(3200);
      await Promise.resolve();
    });
    expect(secondSave).not.toHaveBeenCalled();

    jest.useRealTimers();
  });

  it('does not show draft stamp or fire autosave immediately after opening an existing note', async () => {
    jest.useFakeTimers();
    const existingSave = jest.fn().mockResolvedValue(undefined);
    mockedUseEditor.mockReturnValue({
      isDestroyed: false,
      getHTML: () => '<p>Saved body</p>',
      isActive: () => false,
      commands: { setContent: jest.fn() },
      chain: () => ({ focus: () => ({ run: jest.fn() }) }),
    });

    const existingNote = {
      id: 'n-existing',
      userId: 'u1',
      title: 'Saved Title',
      content: '<p>Saved body</p>',
      color: 'teal' as const,
      status: 'in_progress' as const,
      isPinned: true,
      tags: ['work'],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };

    render(
      <NoteEditor note={existingNote} isOpen={true} onClose={jest.fn()} onSave={existingSave} />
    );

    expect(screen.queryByText('[ DRAFT ]')).not.toBeInTheDocument();
    await act(async () => {
      jest.advanceTimersByTime(2000);
      await Promise.resolve();
    });
    expect(existingSave).not.toHaveBeenCalled();

    jest.useRealTimers();
  });
});
