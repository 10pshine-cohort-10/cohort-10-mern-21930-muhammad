import type { PlanBreakdown } from '../utils/noteMetrics';
import styles from '../pages/InsightsPage.module.css';

export interface PlanProgressRingProps {
  breakdown: PlanBreakdown;
}

export default function PlanProgressRing({ breakdown }: PlanProgressRingProps) {
  const { todo, inProgress, done, totalTracked, completionRate } = breakdown;
  const radius = 50;
  const circumference = 2 * Math.PI * radius;

  const doneDash = totalTracked > 0 ? (done / totalTracked) * circumference : 0;
  const inProgressDash = totalTracked > 0 ? (inProgress / totalTracked) * circumference : 0;

  return (
    <section className={styles.chartCard} aria-label="Plan growth chart">
      <div className={styles.cardHeader}>
        <div>
          <h2 className={styles.cardTitle}>Plan Growth</h2>
          <p className={styles.cardSubtitle}>
            {totalTracked > 0 ? `${done} of ${totalTracked} plans completed` : 'Add notes to your Board to track plans'}
          </p>
        </div>
        <span className={styles.orangeBadge}>{completionRate}%</span>
      </div>

      <div className={styles.ringLayout}>
        <svg width="132" height="132" viewBox="0 0 132 132" role="img" aria-label={`Plan completion ${completionRate}%`}>
          <circle cx="66" cy="66" r={radius} fill="none" stroke="var(--bg-muted)" strokeWidth="12" />
          {inProgressDash > 0 && (
            <circle
              cx="66"
              cy="66"
              r={radius}
              fill="none"
              stroke="var(--accent-blue)"
              strokeWidth="12"
              strokeDasharray={`${doneDash + inProgressDash} ${circumference}`}
              strokeLinecap="round"
              transform="rotate(-90 66 66)"
            />
          )}
          {doneDash > 0 && (
            <circle
              cx="66"
              cy="66"
              r={radius}
              fill="none"
              stroke="var(--accent-orange)"
              strokeWidth="12"
              strokeDasharray={`${doneDash} ${circumference}`}
              strokeLinecap="round"
              transform="rotate(-90 66 66)"
            />
          )}
          <text x="66" y="64" textAnchor="middle" className={styles.ringValue}>
            {completionRate}%
          </text>
          <text x="66" y="81" textAnchor="middle" className={styles.ringLabel}>
            Done
          </text>
        </svg>

        <ul className={styles.legendList}>
          <li className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.legendDone}`} />
            <span>Done</span>
            <strong>{done}</strong>
          </li>
          <li className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.legendInProgress}`} />
            <span>In Progress</span>
            <strong>{inProgress}</strong>
          </li>
          <li className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.legendTodo}`} />
            <span>To Do</span>
            <strong>{todo}</strong>
          </li>
        </ul>
      </div>
    </section>
  );
}
