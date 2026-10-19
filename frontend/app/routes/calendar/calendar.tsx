import { useCalendar } from "~/hooks/useCalendar";
import type { Route } from './+types/calendar';
import { useNavigate, useParams } from "react-router";
import ChangeMonth from "~/components/calendar/ChangeMonth";
import { useState, useEffect } from "react";
import { useUserTournamentHistory } from "~/hooks/useUserTournamentHistory";
import { useAuth } from "~/hooks/useAuth";
import { useLanguage } from "~/context/LanguageContext";
import { getLocalDateKey, getPlaceLabel, getTournamentPlace } from "~/utils/tournamentHistory";
export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Sushi Calendar - Sushi Counter" },
    { name: "description", content: "Browse your sushi eating calendar month by month. See daily totals, tournament medals, and track your sushi consumption history." },
    { property: "og:title", content: "Sushi Calendar - Sushi Counter" },
    { property: "og:description", content: "Browse your sushi eating calendar and track daily consumption history." },
    { name: "robots", content: "noindex, nofollow" },
  ];
}
export default function Calendar() {
  const navigate = useNavigate();
  const { month } = useParams();
  const now = new Date();
  const maxMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // Parse month param YYYY-MM
  const getInitialMonth = () => {
    if (!month) return undefined;
    const parts = month.split("-");
    if (parts.length !== 2) return undefined;
    const year = Number(parts[0]);
    const monthNum = Number(parts[1]);
    if (isNaN(year) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) return undefined;
    if (`${year}-${String(monthNum).padStart(2, '0')}` > maxMonth) return undefined;
    return { year, month: monthNum };
  };

  const initialMonth = getInitialMonth();
  const { currentMonth, logs, changeMonth, fetchLogsByMonth } = useCalendar(initialMonth);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const tournaments = useUserTournamentHistory();
  const { user } = useAuth();
  const { t, language } = useLanguage();

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchLogsByMonth(currentMonth.year, currentMonth.month);
    }
  }, [user, fetchLogsByMonth, currentMonth.year, currentMonth.month]);

  // Sync currentMonth with URL param if it changes
  useEffect(() => {
    if (month) {
      const parts = month.split("-");
      if (parts.length !== 2) {
        navigate("/calendar");
        return;
      }
      const [yearPart, monthPart] = parts;
      const yearNum = Number(yearPart);
      const monthNum = Number(monthPart);

      if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        navigate("/calendar");
        return;
      }

      const requestedMonth = `${yearNum}-${String(monthNum).padStart(2, '0')}`;
      const today = new Date();
      const latestAllowedMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      if (requestedMonth > latestAllowedMonth) {
        navigate(`/calendar/${latestAllowedMonth}`, { replace: true });
        return;
      }

      if (monthNum !== currentMonth.month || yearNum !== currentMonth.year) {
        changeMonth(month);
      }
    } else {
      const now = new Date();
      const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      if (currentMonth.month !== now.getMonth() + 1 || currentMonth.year !== now.getFullYear()) {
        changeMonth(monthStr);
      }
    }
  }, [month, changeMonth, currentMonth.month, currentMonth.year, navigate]);

  const daysInMonth = new Date(currentMonth.year, currentMonth.month, 0).getDate();
  const firstWeekday = (new Date(currentMonth.year, currentMonth.month - 1, 1).getDay() + 6) % 7;
  const weekRows = Math.ceil((firstWeekday + daysInMonth) / 7);
  const monthLabel = new Intl.DateTimeFormat(language === 'es' ? 'es-ES' : 'en-US', { month: 'long' }).format(new Date(currentMonth.year, currentMonth.month - 1, 1));
  const selectedMonth = `${currentMonth.year}-${String(currentMonth.month).padStart(2, '0')}`;

  const handlePrevMonth = () => {
    let newMonth = currentMonth.month - 1;
    let newYear = currentMonth.year;
    if (newMonth === 0) {
      newMonth = 12;
      newYear--;
    }
    navigate(`/calendar/${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    if (selectedMonth >= maxMonth) return;
    let newMonth = currentMonth.month + 1;
    let newYear = currentMonth.year;
    if (newMonth === 13) {
      newMonth = 1;
      newYear++;
    }
    navigate(`/calendar/${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  return (
    <main className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto">
      <div className={`page-shell calendar-page-shell ${weekRows === 6 ? 'max-w-[720px]!' : 'max-w-[820px]!'}`}>
      <ChangeMonth open={isDialogOpen} maxMonth={maxMonth} changeMonth={(m: string) => navigate(`/calendar/${m > maxMonth ? maxMonth : m}`)} setIsDialogOpen={setIsDialogOpen} />
      <span className="eyebrow">{t('A little history of your sushi.')}</span>
      <div className="mb-8 mt-3 flex items-end justify-between gap-4">
        <div>
          <h1 className="page-heading capitalize">{monthLabel}</h1>
          <button type="button" className="muted-copy mt-2 text-sm hover:text-[#fb715a]" onClick={() => setIsDialogOpen(true)} aria-label="Change month">{currentMonth.year} · {t('Change Month')} ▾</button>
        </div>
        <div className="flex gap-2">
          <button type="button" aria-label="Previous month" className="secondary-button h-11 w-11 p-0! text-xl" onClick={handlePrevMonth}>‹</button>
          <button type="button" aria-label="Next month" disabled={selectedMonth >= maxMonth} className="secondary-button h-11 w-11 p-0! text-xl disabled:cursor-not-allowed disabled:opacity-35" onClick={handleNextMonth}>›</button>
        </div>
      </div>

      <div className="surface-card p-3 sm:p-6">
      <div className="mb-3 grid grid-cols-7 gap-1 text-center text-[11px] font-bold uppercase tracking-widest text-[#a9a49a] sm:gap-2">
        {(language === 'es' ? ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'] : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']).map((dayName, i) => <span key={i}>{dayName}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {Array.from({ length: firstWeekday }, (_, i) => <span key={`blank-${i}`} aria-hidden="true" />)}
        {[...Array(daysInMonth)].map((_, index) => {
          const actualLogs = logs.filter(log => {
            // Ensure we handle the date string format "YYYY-MM-DD HH:mm:ss" correctly
            // by replacing the space with 'T' for better browser compatibility if needed,
            // or just parsing as is. Most browsers handle "YYYY-MM-DD HH:mm:ss" as local.
            const dateStr = log.createdAt.includes(' ') ? log.createdAt.replace(' ', 'T') : log.createdAt;
            const logDate = new Date(dateStr);
            return logDate.getDate() === index + 1 && logDate.getMonth() === currentMonth.month - 1 && logDate.getFullYear() === currentMonth.year;
          });
          const totalSushi = actualLogs.reduce((sum, log) => sum + log.sushiCount, 0);

          const calendarDate = `${currentMonth.year}-${String(currentMonth.month).padStart(2, '0')}-${String(index + 1).padStart(2, '0')}`;
          const tournamentsInThisDay = tournaments.filter(tournament => getLocalDateKey(tournament.createdAt) === calendarDate);

          let bestPosition = 0;
          tournamentsInThisDay.forEach(tournament => {
            const place = getTournamentPlace(tournament, user?.id);
            if (place !== null) bestPosition = bestPosition === 0 ? place : Math.min(bestPosition, place);
          });
          const placeLabel = bestPosition > 0 ? getPlaceLabel(bestPosition, language) : '';
          return (
            <button type="button" key={index} onClick={() => navigate(`/calendar/day/${String(index + 1).padStart(2, '0')}-${String(currentMonth.month).padStart(2, '0')}-${currentMonth.year}`)} aria-label={`${index + 1} ${monthLabel}: ${totalSushi} ${t('Pieces of sushi')}${placeLabel ? `, ${placeLabel}` : ''}`} className={`flex aspect-square min-w-0 flex-col items-center justify-between overflow-hidden rounded-xl border p-1 sm:p-3 ${currentMonth.month === new Date().getMonth() + 1 && index + 1 === new Date().getDate() && currentMonth.year === new Date().getFullYear() ? 'border-[#fb715a] bg-[#fb715a24]' : 'border-[#49443c] bg-[#ffffff08] hover:bg-[#ffffff14]'}`}>
              <span className="self-start text-[10px] font-semibold leading-none text-[#aaa69e] sm:text-[11px]">{index + 1}</span>
              <span className="flex w-full min-w-0 items-center justify-between gap-0.5 leading-none">
                <span className={`text-xs font-bold sm:text-xl ${totalSushi > 0 ? 'text-[#fb715a]' : 'text-[#6f6a61]'}`}>{totalSushi > 0 ? totalSushi : '·'}</span>
                {bestPosition > 0 && <span aria-hidden="true" className="shrink-0 text-[11px] leading-none sm:text-base">{bestPosition === 1 ? '🥇' : bestPosition === 2 ? '🥈' : bestPosition === 3 ? '🥉' : '🏆'}</span>}
              </span>
            </button>)
        })}
      </div>
      </div>

      </div>
    </main>

  );
}
