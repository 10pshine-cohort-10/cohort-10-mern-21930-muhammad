import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import InsightsPage from '../pages/InsightsPage';

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u1', name: 'Alex', email: 'alex@example.com' },
    logout: jest.fn(),
  }),
}));

jest.mock('../hooks/useNotes', () => ({
  getCachedFolders: () => [],
  useNotes: () => ({
    isLoading: false,
    allTags: [],
    notes: [
      {
        id: '1',
        userId: 'u1',
        title: 'Sprint Plan',
        content: '<p>Plan</p>',
        color: 'slate',
        status: 'done',
        isPinned: false,
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  }),
}));

describe('InsightsPage', () => {
  it('renders consistency chart, plan growth ring, and timeframe toggle', () => {
    render(
      <MemoryRouter>
        <InsightsPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Your Progress')).toBeInTheDocument();
    expect(screen.getByText('Consistency')).toBeInTheDocument();
    expect(screen.getByText('Plan Growth')).toBeInTheDocument();
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', { name: '30 days' }));
    expect(screen.getByText('30d')).toBeInTheDocument();
  });
});
