import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useUserTournaments } from "~/hooks/useUserTournaments";
import { useAuth } from "~/hooks/useAuth";
import type { Route } from './+types/join';
import loadingIcon from "~/assets/icons/ui/rotate.svg"
import { loadTournamentShare, tournamentMeta } from "~/utils/tournamentShare";
import { useLanguage } from "~/context/LanguageContext";

export async function loader({ request, params }: Route.LoaderArgs) {
  return loadTournamentShare(request, params.id);
}

export function meta({ data, params }: Route.MetaArgs) {
  return tournamentMeta(data, params.id);
}


const JoinTournamentRoute = () => {
  const { id } = useParams(); // Get the tournament ID from the URL
  const { joinTournament, error, loading, setError } = useUserTournaments();
  const { user } = useAuth()
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    if (!user) return
    if (!id) {
      setError("Invalid tournament link");
      setTimeout(() => {
        navigate("/tournaments");
      }, 2000);
      return
    }
    joinTournament(id as string);
  }, [id, user]);

  return (
    <main className="app-page flex flex-1 flex-col items-center justify-center">
      <div className="surface-card flex flex-col items-center gap-5 p-9 text-center">
      <span className="text-6xl" aria-hidden="true">🍣</span>
      {error ?
        <>
          <h2 className='text-red-500 text-xl font-bold text-center'>{error}</h2>
          <img src={loadingIcon} alt="" className='h-16 w-16 animate-spin p-4 opacity-50' />
        </>
        :
        <>
          <h2 className='p-2 text-center text-2xl font-bold'>{t('Joining tournament...')}</h2>
          <img src={loadingIcon} alt="" className='h-16 w-16 animate-spin p-4' />
        </>
      }
      </div>
    </main>
  );
};

export default JoinTournamentRoute;
