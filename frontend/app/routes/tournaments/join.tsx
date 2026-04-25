import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useUserTournaments } from "~/hooks/useUserTournaments";
import { useAuth } from "~/hooks/useAuth";
import type { Route } from './+types/join';
import loadingIcon from "~/assets/icons/ui/rotate.svg"

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Joining Sushi Tournament - Sushi Counter" },
    { name: "description", content: "You are being redirected to join a sushi eating tournament." },
    { name: "robots", content: "noindex, nofollow" },
  ];
}


const JoinTournamentRoute = () => {
  const { id } = useParams(); // Get the tournament ID from the URL
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
    <main className="flex-1 w-full max-w-[400px] mx-auto flex flex-col gap-4 p-4 items-center">
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
    </main>
  );
};

export default JoinTournamentRoute;
