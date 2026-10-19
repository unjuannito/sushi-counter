import { useUserTournaments } from "~/hooks/useUserTournaments";
import { formatDateTime } from "~/utils/date";
import { Link } from "react-router";
import type { Route } from './+types/list';
import TournamentShare from "~/components/tournaments/TournamentShare";
import { useLanguage } from "~/context/LanguageContext";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Sushi Tournaments - Sushi Counter" },
        { name: "description", content: "Join or create sushi eating tournaments. Compete with friends in real-time to see who can eat the most sushi!" },
        { property: "og:title", content: "Sushi Tournaments - Sushi Counter" },
        { property: "og:description", content: "Compete with friends in sushi eating tournaments. Track scores in real-time!" },
        { name: "robots", content: "noindex, nofollow" },
    ];
}


export default function Tournaments() {
    const { tournaments, loading, error, createTournament, setError } = useUserTournaments();
    const { t } = useLanguage();
    const handleCreateTournament = () => {
        createTournament();
    };

    const handleClearError = () => {
        if (setError) setError(null);
    };

    return (
        <main className="w-full min-h-0 flex-1 overflow-y-auto">
          <div className="page-shell tournaments-page-shell max-w-[820px]!">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
              <div>
                <span className="eyebrow">{t('Eat. Count. Compete.')}</span>
                <h1 className="page-heading mt-3">{t('Your tournaments')}</h1>
                <p className="muted-copy mt-3">{t('Compete with friends, one piece at a time.')}</p>
              </div>
              <button onClick={handleCreateTournament} className="primary-button hidden sm:inline-flex">+ {t('Create Tournament')}</button>
            </div>
            <div className="tournaments-create-bar" aria-label={t('Create Tournament')}>
              <button type="button" onClick={handleCreateTournament} className="primary-button">+ {t('Create Tournament')}</button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                {loading && <p className="muted-copy">{t('Loading...')}</p>}
                {error && (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
                        <p>Error: {error}</p>
                        <button onClick={handleClearError} className="secondary-button mt-2">{t('Clear')}</button>
                    </div>
                )}
                {!loading && tournaments.length > 0 ? (
                    [...tournaments]
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((tournament) => (
                            <article
                              key={tournament.id}
                              className="surface-card relative flex min-h-[245px] flex-col p-6 transition-colors hover:border-[#776e61]"
                            >
                              <Link to={`/tournament/${tournament.id}`} aria-label={`${t('View tournament')}: ${formatDateTime(tournament.createdAt)}, ${t('Hosted by')} ${tournament.ownerName}`} className="absolute inset-0 z-0 rounded-[inherit] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#fb715a]" />
                              <div className="pointer-events-none relative z-10 flex flex-1 flex-col">
                              <div className="flex items-start justify-between gap-3">
                                <span className="eyebrow">{t('Tournament')}</span>
                                <span className={`rounded-full px-3 py-1 text-xs font-bold ${tournament.status === 'open' ? 'bg-[#9eae7729] text-[#b9ce8b]' : 'bg-[#fb715a24] text-[#ff9a86]'}`}>{t(tournament.status === 'open' ? 'In play' : 'Finished')}</span>
                              </div>
                              <h2 className="mb-0 mt-6 text-2xl font-bold tracking-tight">{formatDateTime(tournament.createdAt)}</h2>
                              <p className="muted-copy mt-2 text-sm">{t('Hosted by')} <strong className="text-[#f6f0e7]">{tournament.ownerName}</strong> · {tournament.participants.length} {t('Participants').toLowerCase()}</p>
                              </div>
                              <div className="pointer-events-none relative z-20 mt-auto flex flex-wrap items-center gap-3 pt-6">
                                <span className="muted-copy text-sm">{t('View tournament')} →</span>
                                <TournamentShare tournamentId={tournament.id} tournamentName={formatDateTime(tournament.createdAt)} />
                              </div>
                            </article>
                        ))
                ) : !loading && (
                    <div className="surface-card col-span-full flex flex-col items-center px-6 py-14 text-center">
                      <span className="text-6xl" aria-hidden="true">🍣</span>
                      <h2 className="mt-5 text-2xl font-bold">{t('No tournaments yet')}</h2>
                      <p className="muted-copy mt-2">{t('Start one and invite your friends to join.')}</p>
                    </div>
                )}
            </div>
          </div>
        </main>
    );
}
