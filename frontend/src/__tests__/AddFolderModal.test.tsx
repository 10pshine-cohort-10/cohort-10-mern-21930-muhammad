import { render, screen, fireEvent } from '@testing-library/react';
import AddFolderModal from '../components/AddFolderModal';

describe('AddFolderModal', () => {
  it('validates empty and duplicate folder names and submits normalized names', () => {
    const handleCreate = jest.fn();
    const handleClose = jest.fn();

    render(
      <AddFolderModal
        isOpen={true}
        existingFolders={['yea', 'work']}
        onClose={handleClose}
        onCreateFolder={handleCreate}
      />
    );

    const submitBtn = screen.getByRole('button', { name: 'Create Folder' });
    const input = screen.getByLabelText('Folder name');

    fireEvent.click(submitBtn);
    expect(screen.getByRole('alert')).toHaveTextContent('Please enter a folder name.');

    fireEvent.change(input, { target: { value: '#yea' } });
    fireEvent.click(submitBtn);
    expect(screen.getByRole('alert')).toHaveTextContent('Folder "#yea" already exists.');

    fireEvent.change(input, { target: { value: 'New Folder' } });
    fireEvent.click(submitBtn);

    expect(handleCreate).toHaveBeenCalledWith('new-folder');
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
