import type { DailyActivityPoint } from '../utils/noteMetrics';
import styles from '../pages/InsightsPage.module.css';

export interface ActivityBarChartProps {
  series: DailyActivityPoint[];
  days: 7 | 30;
  activeDays: number;
}

export default function ActivityBarChart({ series, days, activeDays }: ActivityBarChartProps) {
  const maxCount = Math.max(1, ...series.map((d) => d.count));
  const chartHeight = 140;

  return (
    <section className={styles.chartCard} aria-label="Note consistency chart">
      <div className={styles.cardHeader}>
        <div>
          <h2 className={styles.cardTitle}>Consistency</h2>
          <p className={styles.cardSubtitle}>
            Active {activeDays} of the last {days} days
          </p>
        </div>
        <span className={styles.blueBadge}>{days}d</span>
      </div>

      <div className={styles.barChartContainer}>
        <svg
          viewBox={`0 0 ${series.length * 24} ${chartHeight + 24}`}
          className={styles.barSvg}
          style={{ minWidth: `${Math.max(240, series.length * 16)}px` }}
          role="img"
          aria-label={`Daily note updates over the last ${days} days`}
        >
          {series.map((point, idx) => {
            const barHeight = point.count > 0 ? Math.max(12, Math.round((point.count / maxCount) * chartHeight)) : 6;
            const x = idx * 24 + 4;
            const y = chartHeight - barHeight;
            const isCompact = days === 30;
            const showLabel = !isCompact || idx % 5 === 0 || idx === series.length - 1;

            return (
              <g key={point.dateKey}>
                <title>{`${point.label}: ${point.count} ${point.count === 1 ? 'note' : 'notes'} updated`}</title>
                <rect
                  x={x}
                  y={y}
                  width={16}
                  height={barHeight}
                  rx={5}
                  fill={point.count > 0 ? 'var(--accent-blue)' : 'var(--bg-muted)'}
                />
                {showLabel && (
                  <text
                    x={x + 8}
                    y={chartHeight + 16}
                    textAnchor="middle"
                    className={styles.axisLabel}
                  >
                    {point.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}
