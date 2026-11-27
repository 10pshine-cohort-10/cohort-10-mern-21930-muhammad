import { render, screen, fireEvent } from '@testing-library/react';
import TagFilterBar from '../components/TagFilterBar';

describe('TagFilterBar Component', () => {
  const sampleTags = ['design', 'work'];
  const tagCounts = { design: 5, work: 2 };

  it('renders total, pinned, and individual tag counts', () => {
    render(
      <TagFilterBar
        filterMode="all"
        selectedTag=""
        allTags={sampleTags}
        totalCount={10}
        pinnedCount={3}
        tagCounts={tagCounts}
        onSelectFilterMode={jest.fn()}
        onSelectTag={jest.fn()}
      />
    );

    expect(screen.getByText('All Notes (10)')).toBeInTheDocument();
    expect(screen.getByText('Pinned (3)')).toBeInTheDocument();
    expect(screen.getByText('#design (5)')).toBeInTheDocument();
    expect(screen.getByText('#work (2)')).toBeInTheDocument();
  });

  it('calls onSelectTag when a tag chip is clicked', () => {
    const handleSelectTag = jest.fn();
    render(
      <TagFilterBar
        filterMode="all"
        selectedTag=""
        allTags={sampleTags}
        onSelectFilterMode={jest.fn()}
        onSelectTag={handleSelectTag}
      />
    );

    fireEvent.click(screen.getByText(/#design/));
    expect(handleSelectTag).toHaveBeenCalledWith('design');
  });
});
