import { render, screen } from '@testing-library/react';
import PinnateMark from '../components/brand/PinnateMark';
import PinnateBrand from '../components/brand/PinnateBrand';
import { BRAND_COLOR_TOKENS } from '../brand/leafGeometry';

describe('PinnateMark & PinnateBrand', () => {
  it('switches between compact 2-pair and full 3-pair leaf geometry by size threshold', () => {
    const { rerender } = render(<PinnateMark size={16} />);
    const compactSvg = screen.getByTestId('pinnate-mark');
    expect(compactSvg).toHaveAttribute('data-variant', 'compact-2-pair');
    expect(compactSvg.querySelectorAll('g')).toHaveLength(2);
    expect(compactSvg.querySelectorAll('circle')).toHaveLength(0);

    rerender(<PinnateMark size={32} />);
    const fullSvg = screen.getByTestId('pinnate-mark');
    expect(fullSvg).toHaveAttribute('data-variant', 'full-3-pair');
    expect(fullSvg.querySelectorAll('g')).toHaveLength(3);
  });

  it('uses terminal orange in color mode and drops orange in mono mode', () => {
    const { rerender } = render(<PinnateMark size={32} tone="color" surface="dark" />);
    const colorPaths = screen.getByTestId('pinnate-mark').querySelectorAll('path');
    const colorLastLeaf = colorPaths[colorPaths.length - 1];
    expect(colorLastLeaf).toHaveAttribute('fill', BRAND_COLOR_TOKENS.orange);
    expect(screen.getByTestId('pinnate-mark').outerHTML).not.toContain('#ef4444');

    rerender(<PinnateMark size={32} tone="mono" surface="dark" />);
    const monoPaths = screen.getByTestId('pinnate-mark').querySelectorAll('path');
    const monoLastLeaf = monoPaths[monoPaths.length - 1];
    expect(monoLastLeaf).toHaveAttribute('fill', BRAND_COLOR_TOKENS.paper);
  });

  it('renders Pinnate wordmark and optional pronunciation cue', () => {
    render(<PinnateBrand markSize={32} showPronunciation />);
    expect(screen.getByText('Pinnate')).toBeInTheDocument();
    expect(screen.getByText('PIN-ayt')).toBeInTheDocument();
  });
});
