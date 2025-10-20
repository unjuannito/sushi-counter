import { useCalendar } from "~/hooks/useCalendar";
import type { Route } from "./+types";
import { MONTHS } from "~/utils/constants";
import "../styles/calendar.css";
import { useNavigate } from "react-router";
import ChangeMonth from "~/components/ChangueMonth";
import { useState } from "react";
export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Calendar - Sushi Counter" },
    { name: "description", content: "Your sushi eating history" },
  ];
}
export default function Calendar() {
  const navigate = useNavigate();
  const { currentMonth, logs, changeMonth } = useCalendar();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const daysInMonth = new Date(currentMonth.year, currentMonth.month, 0).getDate();
  return (
    <>
      <ChangeMonth open={isDialogOpen} changeMonth={changeMonth} setIsDialogOpen={setIsDialogOpen} />
      <main>
        <h1 onClick={() => setIsDialogOpen(true)}>{MONTHS[currentMonth.month - 1]}<br />{currentMonth.year}<span>▼</span></h1>
        <article className="month">
          {[...Array(daysInMonth)].map((_, index) => {
            const actualLogs = logs.filter(log => {
              const logDate = new Date(log.createdAt);
              return logDate.getDate() === index + 1 && logDate.getMonth() === currentMonth.month - 1 && logDate.getFullYear() === currentMonth.year;
            });
            const totalSushi = actualLogs.reduce((sum, log) => sum + log.sushiCount, 0);
            return (
              <article key={index} onClick={() => navigate(`${String(index + 1).padStart(2, '0')}-${currentMonth.month}-${currentMonth.year}`)} className={`day ${currentMonth.month === new Date().getMonth() + 1 && index + 1 === new Date().getDate() && currentMonth.year === new Date().getFullYear() ? 'today' : ''}`}>
                <span className="date-number">{index + 1}</span>
                <span className={`sushi-count ${totalSushi > 0 ? 'has-sushi' : ''}`}>{totalSushi}</span>
              </article>)
          })}
        </article>
      </main>
    </>

  );
}
