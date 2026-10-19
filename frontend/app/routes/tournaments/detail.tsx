import { useEffect } from 'react';
import { useParams } from 'react-router';
import { useUserTournaments } from '~/hooks/useUserTournaments';
import { formatDateTime } from '~/utils/date';
import TournamentShare from "~/components/tournaments/TournamentShare";
import loadingIcon from "~/assets/icons/ui/rotate.svg"
import type { Route } from './+types/detail';
import { loadTournamentShare, tournamentMeta } from '~/utils/tournamentShare';
import { useLanguage } from '~/context/LanguageContext';

export async function loader({ request, params }: Route.LoaderArgs) {
  return loadTournamentShare(request, params.id);
}

export function meta({ data, params }: Route.MetaArgs) {
  return tournamentMeta(data, params.id);
}


function Tournament() {
  // Access the 'id' parameter from the URL
  const { id } = useParams();
  const { loading, assignCurrentTournament, currentTournament, updateStatus, isOwner, leaveTournament } = useUserTournaments();
  const { t } = useLanguage();

  useEffect(() => {
    if (loading || !id) return;
    assignCurrentTournament(id)
  }, [loading, id])

  const handleExitTournament = () => {
    if (!currentTournament || !currentTournament.id) return
    leaveTournament(currentTournament.id)
  }

  const handleChangeStatus = () => {
    if (!currentTournament) return;
    const newStatus = currentTournament?.status == 'open' ? 'closed' : 'open'
    updateStatus(currentTournament.id, newStatus);
  }

  if (loading) {
    return (
      <>
        <h2 className='p-8 text-center text-2xl font-bold'>{t('Loading tournament...')}</h2>
        <img src={loadingIcon} alt="loading" className='animate-spin w-24 h-auto p-4' />
      </>
    );
  }

  return (
    <main className="min-h-0 w-full flex-1 overflow-y-auto">
      <div className="page-shell max-w-[820px]!">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="eyebrow">{t('Tournament')}</span>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-[#f6f0e7]">{currentTournament && formatDateTime(currentTournament.createdAt)}</h1>
          </div>
          <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${currentTournament?.status === 'open' ? 'bg-[#9eae7729] text-[#b9ce8b]' : 'bg-[#fb715a24] text-[#ff9a86]'}`}>{t(currentTournament?.status === 'open' ? 'In play' : 'Finished')}</span>
        </div>

        <section className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="m-0 text-2xl font-bold tracking-tight">{t('Leaderboard')}</h2>
            <span className="text-sm text-[#aaa69e]">{currentTournament?.participants.length || 0} {t('Participants').toLowerCase()}</span>
          </div>
          <div className="flex flex-col gap-3">
            {currentTournament?.participants.length === 0 && <p className="surface-card p-7 text-center text-[#aaa69e]">{t('No participants yet')}</p>}
            {[...(currentTournament?.participants || [])].sort((a, b) => b.sushiCount - a.sushiCount).map((participant, index) => (
              <article key={participant.userId} className="surface-card flex items-center gap-4 px-5 py-4">
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-lg font-bold ${index === 0 ? 'bg-[#fb715a] text-[#171717]' : 'bg-[#575249] text-[#f6f0e7]'}`}>{index + 1}</span>
                <span className={`min-w-0 flex-1 truncate font-semibold ${participant.status === 'left' ? 'italic opacity-50' : ''}`}>{participant.userName}{participant.status === 'left' && ' (Left)'}</span>
                <span className="whitespace-nowrap text-xl font-bold text-[#fb715a]">{participant.sushiCount} <span aria-hidden="true">🍣</span></span>
              </article>
            ))}
          </div>
        </section>

        <details className="surface-card mt-6 overflow-hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-semibold text-[#f6f0e7] marker:hidden [&::-webkit-details-marker]:hidden">
            <span>{t('Tournament details')}</span>
            <span aria-hidden="true" className="text-[#aaa69e]">⌄</span>
          </summary>
          <div className="border-t border-[#49443c] px-5 pb-5 pt-4">
            <p className="muted-copy m-0">{t('Hosted by')} <strong className="text-[#f6f0e7]">{currentTournament?.ownerName}</strong></p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {currentTournament && <TournamentShare tournamentId={currentTournament.id} tournamentName={formatDateTime(currentTournament.createdAt)} />}
              {isOwner() && <button type="button" className="secondary-button text-sm" onClick={handleChangeStatus}>{t(currentTournament?.status === 'open' ? 'End tournament' : 'Restart tournament')}</button>}
              <button type="button" className="ml-auto text-sm font-semibold text-[#aaa69e] hover:text-[#fb715a]" onClick={handleExitTournament}>{t('Exit tournament')}</button>
            </div>
          </div>
        </details>
      </div>
    </main>
  );
}

export default Tournament;
