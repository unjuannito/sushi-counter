import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useUserTournaments } from '~/hooks/useUserTournaments';
import type { Tournament } from '~/types/tournamentType';
import { formatDateTime } from '~/utils/formatDateTime';
import "~/styles/tournaments.css"
function Tournament() {
  // Accede al parámetro 'id' desde la URL
  const { id } = useParams();
  const { tournaments, getTournamentById } = useUserTournaments();

  const [tournament, setTournament] = useState<Tournament | null>(null);

  useEffect(() => {
    if (tournaments.length <= 0 || !id) return;
    console.log("Sad")
    const newTournament = getTournamentById(id);
    console.log(newTournament)
    setTournament(newTournament || null)
  }, [tournaments, id])

  return (
    <main>
      <h1>Tournament</h1>
      <h3>{ tournament && formatDateTime(tournament?.createdAt)}</h3>
      <article>
        {
          tournament?.participants.map( (participant, index) => (
            <article key={index} className='participant'>
              <h4>{participant.name}</h4>
              <h4>{participant.sushiCount}</h4>
            </article>

          ))
        }
      </article>
      {/* Aquí podrías hacer una llamada a la API o cargar información del torneo */}
    </main>
  );
}

export default Tournament;
