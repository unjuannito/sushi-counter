import { useCalendar } from "~/hooks/useCalendar";
import type { Route } from './+types/calendar';
import { APP_CONSTANTS } from "~/utils/constants";
import { useNavigate, useParams } from "react-router";
import ChangeMonth from "~/components/calendar/ChangeMonth";
import { useState, useEffect } from "react";
import { useUserTournaments } from "~/hooks/useUserTournaments";
import { useAuth } from "~/hooks/useAuth";
export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Sushi Calendar - Sushi Counter" },
    { name: "description", content: "Browse your sushi eating calendar month by month. See daily totals, tournament medals, and track your sushi consumption history." },
    { property: "og:title", content: "Sushi Calendar - Sushi Counter" },
    { property: "og:description", content: "Browse your sushi eating calendar and track daily consumption history." },
  ];
}
export default function Calendar() {
  const navigate = useNavigate();
  const { month } = useParams();

  // Parse month param YYYY-MM
  const getInitialMonth = () => {
    if (!month) return undefined;
    const parts = month.split("-");
    if (parts.length !== 2) return undefined;
    const year = Number(parts[0]);
    const monthNum = Number(parts[1]);
    if (isNaN(year) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) return undefined;
    return { year, month: monthNum };
  };

  const initialMonth = getInitialMonth();
  const { currentMonth, logs, changeMonth, fetchLogsByMonth } = useCalendar(initialMonth);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { tournaments } = useUserTournaments();
  const { user } = useAuth();

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
    let newMonth = currentMonth.month + 1;
    let newYear = currentMonth.year;
    if (newMonth === 13) {
      newMonth = 1;
      newYear++;
    }
    navigate(`/calendar/${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  return (
    <main className="flex-1 w-full max-w-[400px] mx-auto flex flex-col gap-4 p-4">
      <ChangeMonth open={isDialogOpen} changeMonth={(m: string) => navigate(`/calendar/${m}`)} setIsDialogOpen={setIsDialogOpen} />
      <div className="flex items-center justify-between my-8">
        <button type="button" aria-label="Previous month" className="bg-none border-none text-[2rem] cursor-pointer px-4 text-white hover:text-[#646cff]" onClick={handlePrevMonth}>◀</button>
        <span></span>
        <h1 className="text-center m-0 font-bold cursor-pointer" onClick={() => setIsDialogOpen(true)} aria-label="Change month">
          {APP_CONSTANTS.MONTHS[currentMonth.month - 1]}<br />
          {currentMonth.year}
          <span className="p-2 text-[2rem] cursor-pointer" aria-hidden="true">▼</span>
        </h1>
        <button type="button" aria-label="Next month" className="bg-none border-none text-[2rem] cursor-pointer px-4 text-white hover:text-[#646cff]" onClick={handleNextMonth} >▶</button>
      </div>

      <article className="grid grid-cols-7 gap-2 flex-1">
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

          // Get all tournaments to check if the user ranked top 3 on this day
          // Show 🥇, 🥈, or 🥉 if ranked. Show 🏆 if participated.
          // Checked via useUserTournaments hook.

          // Check if there was any tournament on this day
          const tournamentsInThisDay = tournaments.filter(tournament => {
            const tournamentDate = new Date(tournament.createdAt);
            return tournamentDate.getDate() === index + 1 && tournamentDate.getMonth() === currentMonth.month - 1 && tournamentDate.getFullYear() === currentMonth.year;
          });

          let bestPosition = 0;
          if (tournamentsInThisDay.length > 0) {
            tournamentsInThisDay.forEach(tournament => {
              const orderedParticipants = tournament.participants.sort((a, b) => b.sushiCount - a.sushiCount);
              // Find the user's position relative to others
              const userPosition = orderedParticipants.findIndex(player => player.userId === user?.id) + 1;
              if (userPosition > 0) {
                bestPosition = bestPosition === 0 ? userPosition : Math.min(bestPosition, userPosition);
              }
            });
          }
          return (
            <article key={index} onClick={() => navigate(`/calendar/day/${String(index + 1).padStart(2, '0')}-${String(currentMonth.month).padStart(2, '0')}-${currentMonth.year}`)} className={`border border-[#ccc] p-[5px] text-center flex flex-col flex-grow items-center overflow-hidden ${currentMonth.month === new Date().getMonth() + 1 && index + 1 === new Date().getDate() && currentMonth.year === new Date().getFullYear() ? 'bg-[#007bff] text-white' : ''}`}>
              <span className="self-start text-[0.7rem] text-[#999]">{index + 1}</span>
              <span className={`p-[5px] mt-[5px] text-[1rem] w-full overflow-hidden text-ellipsis text-[#ccc] font-light ${totalSushi > 0 ? 'font-bold text-white' : ''}`}>{totalSushi}</span>
              <span> {bestPosition > 0 ? bestPosition === 1 ? '🥇' : bestPosition === 2 ? '🥈' : bestPosition === 3 ? '🥉' : '🏆' : ''}</span>
            </article>)
        })}
      </article>
    </main>

  );
}
