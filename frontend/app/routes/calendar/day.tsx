import { useCalendar } from "~/hooks/useCalendar";
import type { Route } from './+types/day';
import { useNavigate, useParams } from "react-router";
import AddLogDialog from "~/components/calendar/AddLogDialog";
import { useEffect, useState } from "react";
import { formatDateTime } from "~/utils/date";
import deleteIcon from "~/assets/icons/ui/trash.svg";
import { useLanguage } from "~/context/LanguageContext";
import { useAuth } from "~/hooks/useAuth";
import { useUserTournamentHistory } from "~/hooks/useUserTournamentHistory";
import { getLocalDateKey, getPlaceLabel, getTournamentPlace } from "~/utils/tournamentHistory";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Daily Sushi Log - Sushi Counter" },
        { name: "description", content: "View and manage your sushi logs for a specific day. See session times and your total sushi count." },
        { name: "robots", content: "noindex, nofollow" },
    ];
}

export default function Day() {
    const { day = "" } = useParams();
    const navigate = useNavigate();
    const { t, language } = useLanguage();
    const { user } = useAuth();

    const parts = day.split("-");
    const [dayPart, monthPart, yearPart] = parts;

    const { logs, error, upsertLog, deleteLog, fetchLogsByDay } = useCalendar();
    const [showAddLogDialog, setShowAddLogDialog] = useState(false);
    const tournaments = useUserTournamentHistory();
    const dayDateKey = `${yearPart}-${String(Number(monthPart)).padStart(2, '0')}-${String(Number(dayPart)).padStart(2, '0')}`;
    const tournamentsForDay = tournaments.filter((tournament) => getLocalDateKey(tournament.createdAt) === dayDateKey);

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
        // If it's the one in localStorage, set it to zero
        const sushiCounter = localStorage.getItem("sushiCounter");
        if (sushiCounter) {
            const parsed = JSON.parse(sushiCounter);
            // Ensure we handle the date string format correctly
            const formattedCreatedAt = createdAt.includes(' ') ? createdAt.replace(' ', 'T') : createdAt;
            const createdAtDate = Math.trunc((new Date(formattedCreatedAt).getTime()) / 10000);
            const parsedCreatedAtDate = Math.trunc((new Date(parsed.createdAt).getTime()) / 10000);

            if (parsedCreatedAtDate === createdAtDate) {
                parsed.count = 0;
                localStorage.setItem("sushiCounter", JSON.stringify(parsed));
            }
        }
    };

    return (
        <main className="min-h-0 w-full flex-1 overflow-y-auto">
          <div className="page-shell max-w-[760px]!">
            <AddLogDialog open={showAddLogDialog} setShowAddLogDialog={setShowAddLogDialog} day={day} upsertLog={upsertLog} />
            <span className="eyebrow">{t('Calendar')}</span>
            <h1 className="page-heading mt-3 capitalize">{dayPart} {new Intl.DateTimeFormat(language === 'es' ? 'es-ES' : 'en-US', { month: 'long' }).format(new Date(Number(yearPart), Number(monthPart) - 1, 1))}</h1>
            <p className="muted-copy mb-7 mt-2">{yearPart} · {t('A little history of your sushi.')}</p>
            <div className="flex flex-col gap-3">
                {logs.length === 0 && <p className="surface-card p-8 text-center text-[#aaa69e]">{t('No sushi eaten this day.')}</p>}
                {
                    [...logs].sort((a, b) => a.createdAt.localeCompare(b.createdAt)).map((log) => (
                        <article key={log.id}
                            className="surface-card flex items-center gap-3 p-4 sm:p-5"
                        >
                            <span className="min-w-0 flex-1 truncate font-semibold text-[#f6f0e7]">
                                {formatDateTime(log.createdAt)}</span>
                            <span className="whitespace-nowrap text-lg font-bold text-[#fb715a]">
                                {log.sushiCount} 🍣
                            </span>
                            <button type="button" onClick={() => handleDeleteLog(log.id, log.createdAt)} aria-label="Delete log" className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-white/10"><img src={deleteIcon} alt="" className="h-5 w-5 invert opacity-70" /></button>
                        </article>
                    ))
                }
                {tournamentsForDay.map((tournament) => {
                    const place = getTournamentPlace(tournament, user?.id);
                    const medal = place === 1 ? '🥇' : place === 2 ? '🥈' : place === 3 ? '🥉' : '🏆';
                    return (
                        <article key={tournament.id} className="surface-card flex items-center gap-4 p-4 sm:p-5">
                            <span className="text-2xl" aria-hidden="true">{medal}</span>
                            <div className="min-w-0 flex-1">
                                <h2 className="font-bold text-[#f6f0e7]">{t('Tournament')}</h2>
                                <p className="muted-copy mt-1 text-sm">
                                    {place !== null ? getPlaceLabel(place, language) : language === 'es' ? 'Participaste' : 'Participated'}
                                    {' · '}{tournament.participants.length} {t('Participants').toLowerCase()}
                                </p>
                            </div>
                        </article>
                    );
                })}
                <button onClick={() => setShowAddLogDialog(true)}
                    className="primary-button mt-4 self-start"
                >
                    + {t('Add Sushi')}
                </button>
            </div>
          </div>
        </main>
    );
}
