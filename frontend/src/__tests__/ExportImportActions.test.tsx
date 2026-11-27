import { render, screen, fireEvent } from '@testing-library/react';
import ExportImportActions from '../components/ExportImportActions';

describe('ExportImportActions', () => {
  it('renders a single overflow menu button with Export and Import inside', () => {
    render(
      <ExportImportActions
        onExport={jest.fn()}
        onImportFile={jest.fn()}
        onOpenCommandPalette={jest.fn()}
        totalCount={5}
      />
    );

    const moreBtn = screen.getByRole('button', { name: /more actions/i });
    expect(moreBtn).toBeInTheDocument();
    fireEvent.click(moreBtn);

    expect(screen.getByRole('menuitem', { name: /commands/i })).toBeInTheDocument();
    expect(screen.getByText('Export: All notes (5)')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /Export as JSON/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /Export as Markdown/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /Import JSON/i })).toBeInTheDocument();
  });

  it('hides Select button in Board view and defaults Export scope to folder or all', () => {
    const onExport = jest.fn().mockResolvedValue(undefined);
    render(
      <ExportImportActions
        onExport={onExport}
        onImportFile={jest.fn()}
        selectedCount={2}
        activeFolder="work"
        folderCount={4}
        totalCount={10}
        isBoardView
        onToggleSelectionMode={jest.fn()}
      />
    );

    expect(screen.queryByRole('button', { name: /select/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /more actions/i }));
    expect(screen.getByText('Export: #work (4)')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('menuitem', { name: 'Export as Markdown (.md)' }));
    expect(onExport).toHaveBeenCalledWith('markdown', 'folder');
  });

  it('closes menu on Escape and returns focus to trigger', () => {
    render(<ExportImportActions onExport={jest.fn()} onImportFile={jest.fn()} totalCount={3} />);

    const trigger = screen.getByRole('button', { name: /more actions/i });
    fireEvent.click(trigger);
    const menu = screen.getByRole('menu');
    fireEvent.keyDown(menu, { key: 'Escape' });

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
