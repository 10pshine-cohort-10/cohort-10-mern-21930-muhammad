import { render, screen, fireEvent } from '@testing-library/react';
import ExportImportActions from '../components/ExportImportActions';

describe('ExportImportActions', () => {
  it('renders a single Export dropdown and separate Import button', () => {
    render(
      <ExportImportActions
        onExport={jest.fn()}
        onImportFile={jest.fn()}
        totalCount={5}
      />
    );

    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /import/i })).toBeInTheDocument();
    expect(screen.queryByText('Export JSON')).not.toBeInTheDocument();
  });

  it('shows All notes count when no folder or selection is active and omits txt', () => {
    render(
      <ExportImportActions
        onExport={jest.fn()}
        onImportFile={jest.fn()}
        totalCount={12}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /export/i }));
    expect(screen.getByText('All notes (12)')).toBeInTheDocument();
    expect(screen.queryByText(/Plain Text/i)).not.toBeInTheDocument();
  });

  it('opens menu, switches scope with counts without closing, and triggers format export', () => {
    const onExport = jest.fn().mockResolvedValue(undefined);
    render(
      <ExportImportActions
        onExport={onExport}
        onImportFile={jest.fn()}
        selectedCount={2}
        activeFolder="work"
        folderCount={4}
        totalCount={10}
      />
    );

    const trigger = screen.getByRole('button', { name: /export/i });
    fireEvent.click(trigger);

    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('menuitemradio', { name: '#work (4)' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('menuitem', { name: 'Export as Markdown (.md)' }));
    expect(onExport).toHaveBeenCalledWith('markdown', 'folder');
  });

  it('closes menu on Escape and returns focus to trigger', () => {
    render(<ExportImportActions onExport={jest.fn()} onImportFile={jest.fn()} totalCount={3} />);

    const trigger = screen.getByRole('button', { name: /export/i });
    fireEvent.click(trigger);
    const menu = screen.getByRole('menu');
    fireEvent.keyDown(menu, { key: 'Escape' });

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
