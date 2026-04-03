import { useState, useEffect, useMemo } from 'react';
import type { Route } from './+types/statistics';
import { CalendarService } from '~/services/calendarService';
import type { Log } from '~/types/calendarType';

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Statistics - Sushi Counter" },
    { name: "description", content: "Your sushi eating habits at a glance" },
  ];
}

// ─── helpers ──────────────────────────────────────────────────────────────────

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function parseDate(str: string): Date {
  // Handle "YYYY-MM-DD HH:mm:ss" or ISO strings
  return new Date(str.replace(' ', 'T'));
}

function getQuarter(month: number): number {
  return Math.floor(month / 3) + 1; // 0-indexed month
}

function getCurrentQuarterMonths(): number[] {
  const m = new Date().getMonth();
  const q = getQuarter(m);
  return [(q - 1) * 3, (q - 1) * 3 + 1, (q - 1) * 3 + 2];
}

function getCurrentStreak(logs: Log[]): number {
  // Count consecutive days with logs going backwards from today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const logDays = new Set(
    logs.map(l => {
      const d = parseDate(l.createdAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );
  let streak = 0;
  const cur = new Date(today);
  // if today has no log, start checking from yesterday
  if (!logDays.has(cur.getTime())) cur.setDate(cur.getDate() - 1);
  while (logDays.has(cur.getTime())) {
    streak++;
    cur.setDate(cur.getDate() - 1);
  }
  return streak;
}

function computeStats(logs: Log[]) {
  if (logs.length === 0) return null;

  const now = new Date();
  const thisYear = now.getFullYear();
  const thisMonth = now.getMonth();

  // ── totals ──────────────────────────────────────────────────────────────────
  const totalAllTime = logs.reduce((s, l) => s + l.sushiCount, 0);

  const logsThisYear = logs.filter(l => parseDate(l.createdAt).getFullYear() === thisYear);
  const totalThisYear = logsThisYear.reduce((s, l) => s + l.sushiCount, 0);

  const logsThisMonth = logs.filter(l => {
    const d = parseDate(l.createdAt);
    return d.getFullYear() === thisYear && d.getMonth() === thisMonth;
  });
  const totalThisMonth = logsThisMonth.reduce((s, l) => s + l.sushiCount, 0);

  const prevMonth = thisMonth === 0 ? 11 : thisMonth - 1;
  const prevMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
  const logsLastMonth = logs.filter(l => {
    const d = parseDate(l.createdAt);
    return d.getFullYear() === prevMonthYear && d.getMonth() === prevMonth;
  });
  const totalLastMonth = logsLastMonth.reduce((s, l) => s + l.sushiCount, 0);

  const quarterMonths = getCurrentQuarterMonths();
  const logsThisQuarter = logsThisYear.filter(l => quarterMonths.includes(parseDate(l.createdAt).getMonth()));
  const totalThisQuarter = logsThisQuarter.reduce((s, l) => s + l.sushiCount, 0);

  // ── best day ────────────────────────────────────────────────────────────────
  const byDay: Record<string, number> = {};
  logs.forEach(l => {
    const key = parseDate(l.createdAt).toISOString().split('T')[0];
    byDay[key] = (byDay[key] || 0) + l.sushiCount;
  });
  const bestDayEntry = Object.entries(byDay).sort((a, b) => b[1] - a[1])[0];
  const bestDayCount = bestDayEntry ? bestDayEntry[1] : 0;
  const bestDayDate = bestDayEntry ? new Date(bestDayEntry[0] + 'T12:00:00') : null;

  // ── best month ──────────────────────────────────────────────────────────────
  const byMonth: Record<string, number> = {};
  logs.forEach(l => {
    const d = parseDate(l.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    byMonth[key] = (byMonth[key] || 0) + l.sushiCount;
  });
  const bestMonthEntry = Object.entries(byMonth).sort((a, b) => b[1] - a[1])[0];
  const bestMonthCount = bestMonthEntry ? bestMonthEntry[1] : 0;
  const bestMonthLabel = bestMonthEntry
    ? (() => {
        const [y, m] = bestMonthEntry[0].split('-');
        return `${MONTHS_LONG[parseInt(m) - 1]} ${y}`;
      })()
    : '';
  const isThisMonthBest = bestMonthEntry
    ? bestMonthEntry[0] === `${thisYear}-${String(thisMonth + 1).padStart(2, '0')}`
    : false;

  // ── weekday affinity ─────────────────────────────────────────────────────────
  const byWeekday: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  logs.forEach(l => {
    const wd = parseDate(l.createdAt).getDay();
    byWeekday[wd] = (byWeekday[wd] || 0) + l.sushiCount;
  });
  const topWeekdayEntry = Object.entries(byWeekday).sort((a, b) => b[1] - a[1])[0];
  const topWeekday = topWeekdayEntry ? parseInt(topWeekdayEntry[0]) : -1;
  const topWeekdayTotal = topWeekdayEntry ? topWeekdayEntry[1] : 0;

  // ── averages ─────────────────────────────────────────────────────────────────
  const avgPerSession = totalAllTime / logs.length;
  const uniqueMonths = new Set(logs.map(l => {
    const d = parseDate(l.createdAt);
    return `${d.getFullYear()}-${d.getMonth()}`;
  })).size;
  const avgSessionsPerMonth = logs.length / uniqueMonths;

  // ── streak ───────────────────────────────────────────────────────────────────
  const streak = getCurrentStreak(logs);

  // ── last 12 months chart data ─────────────────────────────────────────────────
  const chartData: { label: string; value: number; isCurrent: boolean }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(thisYear, thisMonth - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    const key = `${y}-${String(m + 1).padStart(2, '0')}`;
    chartData.push({
      label: MONTHS_SHORT[m],
      value: byMonth[key] || 0,
      isCurrent: y === thisYear && m === thisMonth,
    });
  }

  // ── month vs last month ───────────────────────────────────────────────────────
  const monthChangePercent = totalLastMonth > 0
    ? Math.round(((totalThisMonth - totalLastMonth) / totalLastMonth) * 100)
    : null;

  return {
    totalAllTime,
    totalThisYear,
    totalThisMonth,
    totalLastMonth,
    totalThisQuarter,
    bestDayCount,
    bestDayDate,
    bestMonthCount,
    bestMonthLabel,
    isThisMonthBest,
    topWeekday,
    topWeekdayTotal,
    avgPerSession,
    avgSessionsPerMonth,
    streak,
    chartData,
    monthChangePercent,
    hasYearData: logsThisYear.length > 0,
    hasMonthData: logsThisMonth.length > 0,
    hasQuarterData: logsThisQuarter.length > 0,
    totalSessions: logs.length,
    uniqueMonths,
  };
}

// ─── sub-components ───────────────────────────────────────────────────────────

function StatCard({
  emoji,
  label,
  value,
  sub,
  badge,
  highlight,
}: {
  emoji: string;
  label: string;
  value: string | number;
  sub?: string;
  badge?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-1 p-5 rounded-2xl border transition-all ${
        highlight
          ? 'bg-white/10 border-white/20 shadow-lg shadow-white/5'
          : 'bg-white/5 border-white/10'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xl">{emoji}</span>
        {badge && (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/20 whitespace-nowrap">
            {badge}
          </span>
        )}
      </div>
      <span className="text-2xl font-bold leading-tight mt-1">{value}</span>
      <span className="text-sm text-white/40">{label}</span>
      {sub && <span className="text-xs text-white/30 mt-0.5">{sub}</span>}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center">
      <span className="text-7xl animate-bounce">🍣</span>
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold">No sushi yet!</h2>
        <p className="text-white/40 text-sm max-w-[260px] mx-auto leading-relaxed">
          Head to the main counter and start logging your sushi. Your stats will show up here.
        </p>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3 p-5 rounded-2xl border border-white/10 bg-white/5 animate-pulse">
      <div className="w-6 h-6 rounded-full bg-white/10" />
      <div className="w-16 h-7 rounded bg-white/10" />
      <div className="w-24 h-4 rounded bg-white/10" />
    </div>
  );
}

function BarChart({ data }: { data: { label: string; value: number; isCurrent: boolean }[] }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-28 w-full">
      {data.map((d, i) => {
        const pct = d.value / max;
        const height = Math.max(pct * 100, d.value > 0 ? 4 : 0);
        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <span className="text-[9px] text-white/30 leading-none">
              {d.value > 0 ? d.value : ''}
            </span>
            <div className="w-full flex items-end" style={{ height: '80px' }}>
              <div
                className={`w-full rounded-t-sm transition-all duration-500 ${
                  d.isCurrent
                    ? 'bg-white/80'
                    : d.value > 0
                    ? 'bg-white/20'
                    : 'bg-white/5'
                }`}
                style={{ height: `${height}%` }}
              />
            </div>
            <span
              className={`text-[9px] leading-none ${
                d.isCurrent ? 'text-white font-bold' : 'text-white/30'
              }`}
            >
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────

export default function Statistics() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const service = new CalendarService();
    service.getLogs().then(res => {
      if (res.success && res.logs) {
        setLogs(res.logs);
      } else {
        setError(res.errorMessage || 'Could not load your stats.');
      }
      setLoading(false);
    });
  }, []);

  const stats = useMemo(() => computeStats(logs), [logs]);

  const now = new Date();
  const currentQuarter = getQuarter(now.getMonth());

  return (
    <main className="flex-1 w-full max-w-[400px] mx-auto flex flex-col gap-6 p-4 pb-10">
      <h1 className="text-center m-0 text-6xl font-bold my-8">Statistics</h1>

      {/* ── loading ── */}
      {loading && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      )}

      {/* ── error ── */}
      {!loading && error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-center text-sm">
          {error}
        </div>
      )}

      {/* ── empty ── */}
      {!loading && !error && logs.length === 0 && <EmptyState />}

      {/* ── stats ── */}
      {!loading && !error && stats && (
        <div className="flex flex-col gap-6">

          {/* Hero — all time */}
          <section className="flex flex-col gap-2 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm text-center">
            <span className="text-5xl">🍣</span>
            <span className="text-5xl font-bold tracking-tight">{stats.totalAllTime.toLocaleString()}</span>
            <span className="text-white/40 text-sm">sushi eaten all time</span>
            <span className="text-white/25 text-xs mt-1">{stats.totalSessions} sessions · {stats.uniqueMonths} active months</span>
          </section>

          {/* Period grid */}
          <div className="grid grid-cols-2 gap-3">
            {stats.hasYearData ? (
              <StatCard
                emoji="📅"
                label={`This year (${now.getFullYear()})`}
                value={stats.totalThisYear}
                sub={`${stats.totalThisYear} pieces so far`}
              />
            ) : (
              <StatCard
                emoji="📅"
                label={`This year (${now.getFullYear()})`}
                value="—"
                sub="Nothing logged yet this year"
              />
            )}

            {stats.hasMonthData ? (
              <StatCard
                emoji="🗓️"
                label={`This month`}
                value={stats.totalThisMonth}
                highlight={stats.isThisMonthBest}
                badge={stats.isThisMonthBest ? '🏆 Best ever' : undefined}
                sub={
                  stats.monthChangePercent !== null
                    ? stats.monthChangePercent >= 0
                      ? `+${stats.monthChangePercent}% vs last month`
                      : `${stats.monthChangePercent}% vs last month`
                    : stats.totalLastMonth === 0
                    ? 'First time this month!'
                    : undefined
                }
              />
            ) : (
              <StatCard
                emoji="🗓️"
                label="This month"
                value="—"
                sub={`Nothing yet in ${MONTHS_LONG[now.getMonth()]}`}
              />
            )}

            {stats.hasQuarterData ? (
              <StatCard
                emoji="📊"
                label={`Q${currentQuarter} ${now.getFullYear()}`}
                value={stats.totalThisQuarter}
                sub="This quarter"
              />
            ) : (
              <StatCard
                emoji="📊"
                label={`Q${currentQuarter} ${now.getFullYear()}`}
                value="—"
                sub="No logs this quarter yet"
              />
            )}

            {stats.streak > 0 ? (
              <StatCard
                emoji="🔥"
                label="Current streak"
                value={`${stats.streak}d`}
                highlight={stats.streak >= 3}
                badge={stats.streak >= 7 ? '🎉 On fire!' : stats.streak >= 3 ? 'Going strong' : undefined}
                sub={stats.streak === 1 ? 'Ate sushi today!' : `${stats.streak} days in a row`}
              />
            ) : (
              <StatCard
                emoji="💤"
                label="Current streak"
                value="0d"
                sub="Eat sushi today to start one!"
              />
            )}
          </div>

          {/* Records */}
          {(stats.bestDayCount > 0 || stats.bestMonthCount > 0) && (
            <section className="flex flex-col gap-3 p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
              <h2 className="text-xs font-bold uppercase tracking-widest text-white/30 m-0">Personal Records</h2>
              <div className="grid grid-cols-2 gap-3">
                {stats.bestDayCount > 0 && (
                  <div className="flex flex-col gap-1 p-4 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-xl">🥇</span>
                    <span className="text-2xl font-bold">{stats.bestDayCount}</span>
                    <span className="text-xs text-white/40">Best single day</span>
                    {stats.bestDayDate && (
                      <span className="text-[10px] text-white/25">
                        {stats.bestDayDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                )}
                {stats.bestMonthCount > 0 && (
                  <div className="flex flex-col gap-1 p-4 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-xl">🏅</span>
                    <span className="text-2xl font-bold">{stats.bestMonthCount}</span>
                    <span className="text-xs text-white/40">Best month</span>
                    <span className="text-[10px] text-white/25">{stats.bestMonthLabel}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Insights */}
          <section className="flex flex-col gap-3 p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/30 m-0">Insights</h2>
            <div className="flex flex-col gap-2">

              {/* Weekday */}
              {stats.topWeekdayTotal > 0 ? (
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">📆</span>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Favourite day</span>
                      <span className="text-xs text-white/30">You eat sushi most on {WEEKDAYS[stats.topWeekday]}s</span>
                    </div>
                  </div>
                  <span className="font-bold text-sm">{WEEKDAYS[stats.topWeekday].slice(0, 3)}</span>
                </div>
              ) : null}

              {/* Avg per session */}
              {stats.avgPerSession > 0 && (
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🍱</span>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Avg per session</span>
                      <span className="text-xs text-white/30">Each sitting on average</span>
                    </div>
                  </div>
                  <span className="font-bold text-sm">{stats.avgPerSession.toFixed(1)}</span>
                </div>
              )}

              {/* Avg sessions per month */}
              {stats.uniqueMonths > 1 && (
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">📈</span>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Sessions / month</span>
                      <span className="text-xs text-white/30">How often you log sushi</span>
                    </div>
                  </div>
                  <span className="font-bold text-sm">{stats.avgSessionsPerMonth.toFixed(1)}×</span>
                </div>
              )}
            </div>
          </section>

          {/* Chart — only show if at least 2 months have data */}
          {stats.chartData.filter(d => d.value > 0).length >= 2 && (
            <section className="flex flex-col gap-3 p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
              <h2 className="text-xs font-bold uppercase tracking-widest text-white/30 m-0">Last 12 months</h2>
              <BarChart data={stats.chartData} />
            </section>
          )}

        </div>
      )}
    </main>
  );
}
