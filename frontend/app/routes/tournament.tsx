import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useUserTournaments } from '~/hooks/useUserTournaments';
import type { Tournament } from '~/types/tournamentType';
import { formatDateTime } from '~/utils/formatDateTime';
import "~/styles/tournaments.css"
import trash from "~/assets/trash.svg"
import check from "~/assets/check.svg"
import redo from "~/assets/rotate-right.svg"
import { useAuth } from '~/hooks/useAuth';

function Tournament() {
  // Accede al parámetro 'id' desde la URL
  const { id } = useParams();
  const { tournaments, getTournamentById, updateStatus} = useUserTournaments();
  const [tournament, setTournament] = useState<Tournament | null>(null);

  useEffect(() => {
    if (tournaments.length <= 0 || !id) return;
    const newTournament = getTournamentById(id);
    console.log(newTournament)
    setTournament(newTournament || null)
  }, [tournaments, id])

  const handleDeleteTournament = () => {

  }

  const handleChangueFinished = () => {
    if (!tournament) return;
    const newStatus = tournament?.status == 'open' ? 'closed' : 'open'
    updateStatus(tournament.id, newStatus);
  }

  return (
    <main>
      <h1>Tournament</h1>
      <h3>{tournament && formatDateTime(tournament?.createdAt)}</h3>
      <article>
        {
          tournament?.participants.map((participant, index) => (
            <article key={index} className='participant'>
              <h2>{participant.name}</h2>
              <h2>{participant.sushiCount}</h2>
            </article>

          ))
        }
      </article>
      <section className='buttons'>
        <button onClick={handleChangueFinished}>
          <img src={tournament?.status == 'open' ? check : redo} alt="" />
        </button>
        <button onClick={handleDeleteTournament}>
          <img src={trash} alt="Delete tournament" />
        </button>
      </section>
    </main>
  );
}

export default Tournament;
