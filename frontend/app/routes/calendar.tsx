import { useCalendar } from "~/hooks/useCalendar";
import type { Route } from "./+types";
import { MONTHS } from "~/utils/constants";
import "../styles/calendar.css";
import { useNavigate, useParams } from "react-router";
import ChangeMonth from "~/components/ChangueMonth";
import { useState, useEffect } from "react";
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
  const initialMonth = month ? {
    year: Number(month.split("-")[0]),
    month: Number(month.split("-")[1])
  } : undefined;

  const { currentMonth, logs, changeMonth } = useCalendar(initialMonth);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Sync currentMonth with URL param if it changes
  useEffect(() => {
    if (month) {
      const [yearPart, monthPart] = month.split("-");
      if (Number(monthPart) !== currentMonth.month || Number(yearPart) !== currentMonth.year) {
        changeMonth(month);
      }
    } else {
      const now = new Date();
      const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      if (currentMonth.month !== now.getMonth() + 1 || currentMonth.year !== now.getFullYear()) {
        changeMonth(monthStr);
      }
    }
  }, [month, changeMonth, currentMonth.month, currentMonth.year]);

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
      <main>
        <div className="calendar-controls">
          <span className="nav-button" onClick={handlePrevMonth}>◀</span>
          <span></span>
          <h1 onClick={() => setIsDialogOpen(true)}>
            {MONTHS[currentMonth.month - 1]}<br />
            {currentMonth.year}
            <span>▼</span>
          </h1>
          <span className="nav-button" onClick={handleNextMonth} >▶</span>
        </div>
        <article className="month">
          {[...Array(daysInMonth)].map((_, index) => {
            const actualLogs = logs.filter(log => {
              const logDate = new Date(log.createdAt);
              return logDate.getDate() === index + 1 && logDate.getMonth() === currentMonth.month - 1 && logDate.getFullYear() === currentMonth.year;
            });
            const totalSushi = actualLogs.reduce((sum, log) => sum + log.sushiCount, 0);
            return (
              <article key={index} onClick={() => navigate(`/calendar/day/${String(index + 1).padStart(2, '0')}-${String(currentMonth.month).padStart(2, '0')}-${currentMonth.year}`)} className={`day ${currentMonth.month === new Date().getMonth() + 1 && index + 1 === new Date().getDate() && currentMonth.year === new Date().getFullYear() ? 'today' : ''}`}>
                <span className="date-number">{index + 1}</span>
                <span className={`sushi-count ${totalSushi > 0 ? 'has-sushi' : ''}`}>{totalSushi}</span>
              </article>)
          })}
        </article>
      </main>
    </>

  );
}
