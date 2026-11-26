import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ActivityBarChart from '../components/ActivityBarChart';
import PlanProgressRing from '../components/PlanProgressRing';
import RecentUpdatesList from '../components/RecentUpdatesList';
import { useNotes } from '../hooks/useNotes';
import { getActivitySeries, getLastUpdatedSummary, getPlanBreakdown } from '../utils/noteMetrics';
import styles from './InsightsPage.module.css';

export default function InsightsPage() {
  const navigate = useNavigate();
  const { notes, allTags, isLoading } = useNotes();
  const [days, setDays] = useState<7 | 30>(7);

  const safeNotes = Array.isArray(notes) ? notes : [];
  const lastUpdated = getLastUpdatedSummary(safeNotes);
  const activity = getActivitySeries(safeNotes, days);
  const breakdown = getPlanBreakdown(safeNotes);

  return (
    <Layout folders={Array.isArray(allTags) ? allTags : []}>
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.pageTitle}>Your Progress</h1>
            <p className={styles.pageSubtitle}>{lastUpdated.encouragement}</p>
          </div>

          <div className={styles.durationToggle} role="radiogroup" aria-label="Timeframe">
            <button
              type="button"
              role="radio"
              aria-checked={days === 7}
              className={`${styles.durationBtn} ${days === 7 ? styles.durationBtnActive : ''}`}
              onClick={() => setDays(7)}
            >
              7 days
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={days === 30}
              className={`${styles.durationBtn} ${days === 30 ? styles.durationBtnActive : ''}`}
              onClick={() => setDays(30)}
            >
              30 days
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className={styles.loadingState} aria-busy="true">Loading progress…</div>
        ) : (
          <>
            <div className={styles.chartsGrid}>
              <ActivityBarChart series={activity.series} days={days} activeDays={activity.activeDays} />
              <PlanProgressRing breakdown={breakdown} />
            </div>
            <RecentUpdatesList notes={safeNotes} onOpenDashboard={() => navigate('/dashboard')} />
          </>
        )}
      </div>
    </Layout>
  );
}
