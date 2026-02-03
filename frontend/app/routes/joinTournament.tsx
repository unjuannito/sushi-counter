import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useUserTournaments } from "~/hooks/useUserTournaments";
import { useAuth } from "~/hooks/useAuth";
import type { Route } from './+types';
import loadingIcon from "~/assets/icons/ui/rotate.svg"

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Joining tournament - Sushi Counter" },
    { name: "description", content: "Compete in how many sushi dou you eat!" },
  ];
}


const JoinTournamentRoute = () => {
  const { id } = useParams(); // Obtenemos el ID del torneo desde la URL
    const { joinTournament, error, loading, setError } = useUserTournaments();
    const { user } = useAuth()
    const navigate = useNavigate();

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
      <div className="w-full max-w-[400px] p-4 flex flex-col items-center justify-center">
      {error ?
      <>
        <h2 className='text-red-500 text-xl font-bold text-center'>{error}</h2>
        <img src={loadingIcon} alt="relaoding" className='animate-spin w-24 h-auto p-4 opacity-50' />
      </>
      :
      <>
        <h2 className='font-bold text-4xl p-2 text-center'>Joining tournament...</h2>
        <img src={loadingIcon} alt="relaoding" className='animate-spin w-24 h-auto p-4' />
      </>
      }
    </div>
  );
};

export default JoinTournamentRoute;
