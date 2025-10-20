import { useCalendar } from "~/hooks/useCalendar";
import type { Route } from "./+types";
import { MONTHS } from "~/utils/constants";
import "../styles/calendar.css";
import { useNavigate, useParams } from "react-router";
import AddLogDialog from "~/components/AddLogDialog";
import { use, useEffect, useState } from "react";
import { formatDateTime } from "~/utils/formatDateTime";
import type { Logs } from "~/types/calendarType";
import deleteIcon from "~/assets/trash.svg";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Calendar - Sushi Counter" },
        { name: "description", content: "Your sushi eating history" },
    ];
}

export default function Day() {
    const { logs, error, upsertLog } = useCalendar();
    const { day = "" } = useParams();
    const [currentLogs, setCurrentLogs] = useState<Logs>([]);
    const [showAddLogDialog, setShowAddLogDialog] = useState(false);
    const [dayPart, monthPart, yearPart] = day.split("-");
    const navigate = useNavigate();

    useEffect(() => {
        const filteredLogs = logs.filter(log => {
            const logDate = new Date(log.createdAt);
            return (
                logDate.getDate() === Number(dayPart) &&
                (logDate.getMonth() + 1) === Number(monthPart) &&
                logDate.getFullYear() === Number(yearPart)
            );
        });
        console.log(currentLogs)
        setCurrentLogs(filteredLogs);
    }, [logs]);

    const handleDeleteLog = (createdAt: string) => {
        upsertLog(0, new Date(createdAt), new Date(createdAt));
        //si es el q esta en localstorage, ponerlo a cero
        const sushiCounter = localStorage.getItem("sushiCounter");
        if (sushiCounter) {
            const parsed = JSON.parse(sushiCounter);
            const createdAtDate = Math.trunc((new Date(createdAt).getTime())/10000);
            const parsedCreatedAtDate = Math.trunc((new Date(parsed.createdAt).getTime())/10000);

            console.log("Comparing dates", parsedCreatedAtDate, createdAtDate);
            if (parsedCreatedAtDate === createdAtDate) {
                console.log("Resetting local sushi counter to 0");
                parsed.count = 0;
                localStorage.setItem("sushiCounter", JSON.stringify(parsed));
            }
        }
    };

    return (
        <>
            <AddLogDialog open={showAddLogDialog} setShowAddLogDialog={setShowAddLogDialog} day={day} upsertLog={upsertLog} />
            <main>
                <h1>{dayPart}<br />{MONTHS[Number(monthPart) - 1]}<br />{yearPart}</h1>
                <article className="log-list">
                    {currentLogs.length === 0 && <p>No sushi eaten this day.</p>}
                    {
                        currentLogs.sort((a, b) => a.createdAt.localeCompare(b.createdAt)).map((log) => (
                            <article key={log.id} className="log-entry">
                                <span>{log.sushiCount} sushi eaten</span>
                                <span>{formatDateTime(log.createdAt)}</span>
                                <img src={deleteIcon} alt="Delete log" onClick={() => handleDeleteLog(log.createdAt)} />
                            </article>
                        ))
                    }
                </article>
                <button onClick={() => setShowAddLogDialog(true)}>Add Log</button>
            </main>
        </>
    );
}
