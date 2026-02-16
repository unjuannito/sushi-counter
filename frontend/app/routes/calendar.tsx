import { useCalendar } from "~/hooks/useCalendar";
import type { Route } from "./+types";
import { MONTHS } from "~/utils/constants";
import { useNavigate, useParams } from "react-router";
import ChangeMonth from "~/components/ChangueMonth";
import { useState, useEffect, use } from "react";
import { useUserTournaments } from "~/hooks/useUserTournaments";
import user from "./user";
import { useAuth } from "~/hooks/useAuth";
export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Calendar - Sushi Counter" },
    { name: "description", content: "Your sushi eating history" },
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
    <>
      <ChangeMonth open={isDialogOpen} changeMonth={(m) => navigate(`/calendar/${m}`)} setIsDialogOpen={setIsDialogOpen} />
      <div className="w-full max-w-[400px] p-4 flex flex-col">
        <div className="flex items-center justify-between my-8">
          <span className="bg-none border-none text-[2rem] cursor-pointer px-4 text-white hover:text-[#646cff]" onClick={handlePrevMonth}>◀</span>
          <span></span>
          <h1 className="text-center m-0 font-bold cursor-pointer" onClick={() => setIsDialogOpen(true)}>
            {MONTHS[currentMonth.month - 1]}<br />
            {currentMonth.year}
            <span className="p-2 text-[2rem] cursor-pointer">▼</span>
          </h1>
          <span className="bg-none border-none text-[2rem] cursor-pointer px-4 text-white hover:text-[#646cff]" onClick={handleNextMonth} >▶</span>
        </div>

        <article className="grid grid-cols-7 gap-2 flex-1 px-[5px]">
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
                {/* sacar todos los torneos si he quedado en top 3 en este dia poner 🥇 o 🥈 o 🥉 si he participado poner 🏆 */}
                {/* se saca a traves del useUserTournaments */}
              // ver si este dia tengo algun torneo 
              const tournamentsInThisDay = tournaments.filter(tournament => {
                const tournamentDate = new Date(tournament.createdAt);
                return tournamentDate.getDate() === index + 1 && tournamentDate.getMonth() === currentMonth.month - 1 && tournamentDate.getFullYear() === currentMonth.year;
              });
              // sort de todos los torneos tournamentsInThisDay?.participants.sort((a, b) => b.sushiCount - a.sushiCount).map((participant, index) => (
              let bestPosition = 0;
              if (tournamentsInThisDay.length > 0) {
                tournamentsInThisDay.forEach(tournament => {
                  const ordertournament = tournament.participants.sort((a, b) => b.sushiCount - a.sushiCount);
                  // encontrar la posicion con respecto al index del usuario
                  const userPosition = ordertournament.findIndex(player => player.userId === user?.id) + 1;
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
      </div>
    </>

  );
}
