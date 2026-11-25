import { StrictMode } from 'react';
import { render, screen } from '@testing-library/react';
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
});
