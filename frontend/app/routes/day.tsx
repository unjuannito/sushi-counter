import { useCalendar } from "~/hooks/useCalendar";
import type { Route } from "./+types";
import { MONTHS } from "~/utils/constants";
import { useNavigate, useParams } from "react-router";
import AddLogDialog from "~/components/AddLogDialog";
import { use, useEffect, useState } from "react";
import { formatDateTime } from "~/utils/formatDateTime";
import type { Logs } from "~/types/calendarType";
import deleteIcon from "~/assets/icons/ui/trash.svg";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Calendar - Sushi Counter" },
        { name: "description", content: "Your sushi eating history" },
    ];
}

export default function Day() {
    const { day = "" } = useParams();
    const navigate = useNavigate();

    const parts = day.split("-");
    const [dayPart, monthPart, yearPart] = parts;

    const { logs, error, upsertLog, deleteLog, fetchLogsByDay } = useCalendar();
    const [showAddLogDialog, setShowAddLogDialog] = useState(false);

    useEffect(() => {
        if (parts.length !== 3) {
            navigate("/calendar");
            return;
        }

        const d = Number(dayPart);
        const m = Number(monthPart);
        const y = Number(yearPart);

        if (isNaN(d) || isNaN(m) || isNaN(y) || m < 1 || m > 12 || d < 1 || d > 31) {
            navigate("/calendar");
            return;
        }

        // Basic date validation (could be improved to check days in specific month)
        const date = new Date(y, m - 1, d);
        if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
            navigate("/calendar");
            return;
        }

        const dateStr = `${yearPart}-${monthPart.padStart(2, '0')}-${dayPart.padStart(2, '0')}`;
        fetchLogsByDay(dateStr);
    }, [day, navigate, fetchLogsByDay]);

    const handleDeleteLog = (logId: string, createdAt: string) => {
        deleteLog(logId);
        //si es el q esta en localstorage, ponerlo a cero
        const sushiCounter = localStorage.getItem("sushiCounter");
        if (sushiCounter) {
            const parsed = JSON.parse(sushiCounter);
            const createdAtDate = Math.trunc((new Date(createdAt).getTime()) / 10000);
            const parsedCreatedAtDate = Math.trunc((new Date(parsed.createdAt).getTime()) / 10000);

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
            <div className="w-full max-w-[400px] p-4 flex flex-col gap-3">
                <h1 className="text-center m-0 text-6xl font-bold my-8 mb-1">
                    {dayPart}<br />
                    {MONTHS[Number(monthPart) - 1]}
                    <br />
                    {yearPart}
                </h1>
                <article className="flex flex-col gap-4 w-full overflow-y-auto p-2">
                    {logs.length === 0 && <p className="text-center text-xl font-medium text-white/50">No sushi eaten this day.</p>}
                    {
                        logs.sort((a, b) => a.createdAt.localeCompare(b.createdAt)).map((log) => (
                            <article key={log.id}
                                className="grid grid-cols-[10fr_4fr_1fr] gap-2 p-4 border border-white/10 rounded-xl bg-white/5 items-center"
                            >
                                <span className="text-xl font-bold text-left justify-self-start">
                                    {formatDateTime(log.createdAt)}                                </span>
                                {/* Columna 2: nombre */}
                                <span className="text-xl font-medium text-center">
                                    {log.sushiCount} 🍣
                                </span>

                                {/* <span className="m-0 col-start-1 justify-self-start">{formatDateTime(log.createdAt)}</span>
                                <span className="m-0 col-start-1 justify-self-start">{log.sushiCount} 🍣</span> */}
                                <img src={deleteIcon} alt="Delete log" onClick={() => handleDeleteLog(log.id, log.createdAt)}
                                    className=" h-full w-auto"
                                // className="w-[2rem] h-auto cursor-pointer justify-self-end row-span-2 col-start-2" 
                                />
                            </article>
                        ))
                    }
                    <button onClick={() => setShowAddLogDialog(true)}
                        className="p-2 border border-white/10 rounded-xl bg-white/5 text-center text-xl font-bold text-white"
                    >
                        Add Log
                    </button>

                </article>
            </div>
        </>
    );
}
