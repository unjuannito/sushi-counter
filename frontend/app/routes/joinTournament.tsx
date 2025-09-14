import React, { useEffect } from 'react';
import { useParams } from 'react-router';
import { useUserTournaments } from "~/hooks/useUserTournaments";
import { useAuth } from "~/hooks/useAuth";


const JoinTournament = () => {
  const { id } = useParams(); // Obtenemos el ID del torneo desde la URL
    const { joinTournament, error } = useUserTournaments();
    const { user } = useAuth()
  useEffect(() => {
    if (!user) return
    console.log(joinTournament(id as string))
    console.log("asd")
  }, [id, user]);

  return (
    <main>
      <h2>Joining tournament...</h2>
      <p>{error}</p>
    </main>
  );
};

export default JoinTournament;
