import React, { useEffect } from 'react';
import { useParams } from 'react-router';
import { useUserTournaments } from "~/hooks/useUserTournaments";
import { useAuth } from "~/hooks/useAuth";
import type { Route } from './+types';
import loadingIcon from "~/assets/rotate.svg"
import "~/styles/tournaments.css"

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Joining tournament - Sushi Counter" },
    { name: "description", content: "Compete in how many sushi dou you eat!" },
  ];
}


const JoinTournament = () => {
  const { id } = useParams(); // Obtenemos el ID del torneo desde la URL
    const { joinTournament, error, loading } = useUserTournaments();
    const { user } = useAuth()
  useEffect(() => {
    if (!user || !id || loading) return
    // if (loading) return
    joinTournament(id as string);
  }, [id, user]);

  return (
    <main className='join'>
      {error ?
      <>
        <h2 className='error'>{error}</h2>
        <img src={loadingIcon} alt="relaoding" className='loading' />
      </>
      :
      <>
        <h2>Joining tournament...</h2>
        <img src={loadingIcon} alt="relaoding" className='loading' />
      </>
      }
    </main>
  );
};

export default JoinTournament;
