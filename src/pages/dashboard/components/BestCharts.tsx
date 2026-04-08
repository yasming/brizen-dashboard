import {useMemo} from 'react';
import {PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, type TooltipProps} from 'recharts';
import type {ValueType, NameType} from 'recharts/types/component/DefaultTooltipContent';

interface Bet {
  ID?: number;
  id?: number;
  Date?: string;
  date?: string;
  League?: string;
  Match?: string;
  Bet?: string;
  bet?: string;
  Result?: number;
  result?: number;
  SportName?: string;
}

const getDate = (b: Bet) => b.Date ?? b.date ?? '';
const getResult = (b: Bet) => b.Result ?? b.result ?? -1;

interface BestChartsProps {
  allBets: Bet[];
  dayBets: Bet[];
  currentDate: string;
}

const COLORS = {
  win: '#16a34a',
  loss: '#dc2626',
  pending: '#9ca3af',
  reset: '#f59e0b',
};

function computeStats(bets: Bet[]) {
  let wins = 0;
  let losses = 0;
  let pending = 0;
  let resets = 0;
  for (const bet of bets) {
    if (getResult(bet) === 1) wins++;
    else if (getResult(bet) === 0) losses++;
    else if (getResult(bet) === 2) resets++;
    else pending++;
  }
  return {wins, losses, pending, resets, total: bets.length};
}

function buildChartData(stats: {wins: number; losses: number; pending: number; resets: number}) {
  const data = [];
  if (stats.wins > 0) data.push({name: 'Vitória', value: stats.wins, color: COLORS.win});
  if (stats.losses > 0) data.push({name: 'Derrota', value: stats.losses, color: COLORS.loss});
  if (stats.resets > 0) data.push({name: 'Reembolso', value: stats.resets, color: COLORS.reset});
  if (stats.pending > 0) data.push({name: 'Pendente', value: stats.pending, color: COLORS.pending});
  return data;
}

export default function BestCharts({allBets, dayBets, currentDate}: BestChartsProps) {
  const allTimeStats = useMemo(() => computeStats(allBets), [allBets]);
  const dayStats = useMemo(() => computeStats(dayBets), [dayBets]);

  const now = new Date();
  const currentMonth = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Fortaleza',
    year: 'numeric',
    month: '2-digit',
  }).format(now);

  const monthBets = useMemo(() => {
    return allBets.filter(bet => getDate(bet).startsWith(currentMonth));
  }, [allBets, currentMonth]);

  const monthStats = useMemo(() => computeStats(monthBets), [monthBets]);
  const monthData = useMemo(() => buildChartData(monthStats), [monthStats]);
  const monthResolved = monthStats.wins + monthStats.losses;
  const monthRate = monthResolved > 0 ? ((monthStats.wins / monthResolved) * 100).toFixed(1) : '—';

  const monthLabel = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Fortaleza',
    month: 'long',
    year: 'numeric',
  }).format(now);
  const capitalizedMonthLabel = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  const allTimeData = useMemo(() => buildChartData(allTimeStats), [allTimeStats]);
  const dayData = useMemo(() => buildChartData(dayStats), [dayStats]);

  const formattedDate = currentDate
    ? new Date(currentDate + 'T12:00:00').toLocaleDateString('pt-BR')
    : '';

  const allTimeResolved = allTimeStats.wins + allTimeStats.losses;
  const dayResolved = dayStats.wins + dayStats.losses;
  const allTimeRate = allTimeResolved > 0 ? ((allTimeStats.wins / allTimeResolved) * 100).toFixed(1) : '—';
  const dayRate = dayResolved > 0 ? ((dayStats.wins / dayResolved) * 100).toFixed(1) : '—';

  return (
    <div style={styles.container}>
      <div style={styles.chartCard}>
        <h3 style={styles.chartTitle}>Todos os Tempos</h3>
        <p style={styles.chartSubtitle}>{allTimeStats.total} apostas</p>
        {allTimeData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={allTimeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {allTimeData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={((value: ValueType) => [`${value} apostas`, '']) as TooltipProps<ValueType, NameType>['formatter']}
                  contentStyle={styles.tooltip}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{fontSize: '0.8rem'}}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={styles.rateBox}>
              <span style={styles.rateValue}>{allTimeRate}%</span>
              <span style={styles.rateLabel}>taxa de acerto</span>
            </div>
            <div style={styles.statsRow}>
              <span style={{...styles.statBadge, backgroundColor: '#dcfce7', color: '#16a34a'}}>
                {allTimeStats.wins}V
              </span>
              <span style={{...styles.statBadge, backgroundColor: '#fee2e2', color: '#dc2626'}}>
                {allTimeStats.losses}D
              </span>
              {allTimeStats.resets > 0 && (
                <span style={{...styles.statBadge, backgroundColor: '#fef3c7', color: '#d97706'}}>
                  {allTimeStats.resets}R
                </span>
              )}
              {allTimeStats.pending > 0 && (
                <span style={{...styles.statBadge, backgroundColor: '#f3f4f6', color: '#6b7280'}}>
                  {allTimeStats.pending}P
                </span>
              )}
            </div>
          </>
        ) : (
          <p style={styles.empty}>Sem dados</p>
        )}
      </div>

      <div style={styles.chartCard}>
        <h3 style={styles.chartTitle}>{capitalizedMonthLabel}</h3>
        <p style={styles.chartSubtitle}>{monthStats.total} apostas</p>
        {monthData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={monthData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {monthData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={((value: ValueType) => [`${value} apostas`, '']) as TooltipProps<ValueType, NameType>['formatter']}
                  contentStyle={styles.tooltip}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{fontSize: '0.8rem'}}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={styles.rateBox}>
              <span style={styles.rateValue}>{monthRate}%</span>
              <span style={styles.rateLabel}>taxa de acerto</span>
            </div>
            <div style={styles.statsRow}>
              <span style={{...styles.statBadge, backgroundColor: '#dcfce7', color: '#16a34a'}}>
                {monthStats.wins}V
              </span>
              <span style={{...styles.statBadge, backgroundColor: '#fee2e2', color: '#dc2626'}}>
                {monthStats.losses}D
              </span>
              {monthStats.resets > 0 && (
                <span style={{...styles.statBadge, backgroundColor: '#fef3c7', color: '#d97706'}}>
                  {monthStats.resets}R
                </span>
              )}
              {monthStats.pending > 0 && (
                <span style={{...styles.statBadge, backgroundColor: '#f3f4f6', color: '#6b7280'}}>
                  {monthStats.pending}P
                </span>
              )}
            </div>
          </>
        ) : (
          <p style={styles.empty}>Sem dados para este m&#234;s</p>
        )}
      </div>

      <div style={styles.chartCard}>
        <h3 style={styles.chartTitle}>{formattedDate || 'Dia Atual'}</h3>
        <p style={styles.chartSubtitle}>{dayStats.total} apostas</p>
        {dayData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={dayData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {dayData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={((value: ValueType) => [`${value} apostas`, '']) as TooltipProps<ValueType, NameType>['formatter']}
                  contentStyle={styles.tooltip}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{fontSize: '0.8rem'}}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={styles.rateBox}>
              <span style={styles.rateValue}>{dayRate}%</span>
              <span style={styles.rateLabel}>taxa de acerto</span>
            </div>
            <div style={styles.statsRow}>
              <span style={{...styles.statBadge, backgroundColor: '#dcfce7', color: '#16a34a'}}>
                {dayStats.wins}V
              </span>
              <span style={{...styles.statBadge, backgroundColor: '#fee2e2', color: '#dc2626'}}>
                {dayStats.losses}D
              </span>
              {dayStats.resets > 0 && (
                <span style={{...styles.statBadge, backgroundColor: '#fef3c7', color: '#d97706'}}>
                  {dayStats.resets}R
                </span>
              )}
              {dayStats.pending > 0 && (
                <span style={{...styles.statBadge, backgroundColor: '#f3f4f6', color: '#6b7280'}}>
                  {dayStats.pending}P
                </span>
              )}
            </div>
          </>
        ) : (
          <p style={styles.empty}>Sem dados para este dia</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    gap: '1.5rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap' as const,
  },
  chartCard: {
    flex: '1 1 300px',
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
    padding: '1.5rem',
    textAlign: 'center' as const,
  },
  chartTitle: {
    fontSize: '1rem',
    fontWeight: '600' as const,
    color: '#09090b',
    margin: 0,
  },
  chartSubtitle: {
    fontSize: '0.8rem',
    color: '#71717a',
    margin: '0.25rem 0 1rem 0',
  },
  tooltip: {
    borderRadius: '0.375rem',
    fontSize: '0.8rem',
    border: '1px solid #e4e4e7',
  },
  rateBox: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    marginTop: '0.75rem',
  },
  rateValue: {
    fontSize: '1.5rem',
    fontWeight: '700' as const,
    color: '#09090b',
  },
  rateLabel: {
    fontSize: '0.75rem',
    color: '#71717a',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  statsRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
    marginTop: '0.75rem',
  },
  statBadge: {
    padding: '0.25rem 0.625rem',
    borderRadius: '9999px',
    fontSize: '0.8rem',
    fontWeight: '600' as const,
  },
  empty: {
    color: '#9ca3af',
    fontSize: '0.875rem',
    padding: '3rem 0',
  },
  winRate: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    marginTop: '0.75rem',
  },
  winRateValue: {
    fontSize: '1.5rem',
    fontWeight: '700' as const,
    color: '#09090b',
  },
  winRateLabel: {
    fontSize: '0.75rem',
    color: '#71717a',
    textTransform: 'uppercase' as const,
  },
};
