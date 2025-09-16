import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useUserTournaments } from '~/hooks/useUserTournaments';
import type { Tournament } from '~/types/tournamentType';
import { formatDateTime } from '~/utils/formatDateTime';
import "~/styles/tournaments.css"
import trash from "~/assets/trash.svg"
import check from "~/assets/check.svg"
import redo from "~/assets/rotate-right.svg"
import { useAuth } from '~/hooks/useAuth';
import type { Route } from './+types';

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Tournament - Sushi Counter" },
    { name: "description", content: "Compete in how many sushi dou you eat!" },
  ];
}


function Tournament() {
  // Accede al parámetro 'id' desde la URL
  const { id } = useParams();
  const { loading, assignCurrentTournament, currentTournament, updateStatus, isOwner, deleteTournament} = useUserTournaments();
  const navigate = useNavigate()

  useEffect(() => {
    if (loading || !id) return;
    assignCurrentTournament(id)
  }, [loading, id])

  const handleDeleteTournament = () => {
    if (!currentTournament || !currentTournament.id) return
    deleteTournament(currentTournament.id)
  }

  const handleChangueFinished = () => {
    if (!currentTournament) return;
    const newStatus = currentTournament?.status == 'open' ? 'closed' : 'open'
    updateStatus(currentTournament.id, newStatus);
  }

  return (
    <main>
      <h1>Tournament</h1>
      <h3>{currentTournament && formatDateTime(currentTournament?.createdAt)}</h3>
      <article>
        {
          currentTournament?.participants.sort((a, b) => b.sushiCount - a.sushiCount).map((participant) => (
            <article key={participant.userId} className='participant'>
              <h2>{participant.userName}</h2>
              <h2>{participant.sushiCount}</h2>
            </article>

          ))
        }
      </article>
      <section className='buttons'>
        <button onClick={handleChangueFinished}>
          <img src={currentTournament?.status == 'open' ? check : redo} alt={currentTournament?.status == 'open' ? "End tournament" : "Reopen tournament"} />
        </button>
        <button onClick={() => {handleDeleteTournament()}} disabled={currentTournament?.status !== 'open' || !isOwner()}>
          <img src={trash} alt="Delete tournament" />
        </button>
      </section>
    </main>
  );
}

export default Tournament;
