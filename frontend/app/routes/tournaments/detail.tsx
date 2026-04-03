import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useUserTournaments } from '~/hooks/useUserTournaments';
import type { Tournament } from '~/types/tournamentType';
import { formatDateTime } from '~/utils/date';
import trash from "~/assets/icons/ui/trash.svg"
import check from "~/assets/icons/ui/check.svg"
import redo from "~/assets/icons/ui/rotate-right.svg"
import { useAuth } from '~/hooks/useAuth';
import linkIcon from "~/assets/icons/ui/link.svg"
import loadingIcon from "~/assets/icons/ui/rotate.svg"
import type { Route } from './+types/detail';

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Tournament - Sushi Counter" },
    { name: "description", content: "Compete in how many sushi dou you eat!" },
  ];
}


function Tournament() {
  // Access the 'id' parameter from the URL
  const { id } = useParams();
  const { loading, assignCurrentTournament, currentTournament, updateStatus, isOwner, deleteTournament, leaveTournament } = useUserTournaments();
  const navigate = useNavigate()

  useEffect(() => {
    if (loading || !id) return;
    assignCurrentTournament(id)
  }, [loading, id])

  const handleDeleteTournament = () => {
    if (!currentTournament || !currentTournament.id) return
    deleteTournament(currentTournament.id)
  }

  const handleExitTournament = () => {
    if (!currentTournament || !currentTournament.id) return
    leaveTournament(currentTournament.id)
  }

  const handleChangeStatus = () => {
    if (!currentTournament) return;
    const newStatus = currentTournament?.status == 'open' ? 'closed' : 'open'
    updateStatus(currentTournament.id, newStatus);
  }

  const handleCopyInviteLink = async (id: string) => {
    const hostname = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : ''; // Check if port exists and add it
    const url = `${hostname}${port}/tournament/join/${id}`;
    console.log(id)
    try {
      // Copy the link to clipboard
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    } catch (error) {
      console.error('Error during copy to clipboard:', error);
      alert('Error during copy to clipboard: ' + error);
    }
  }

  if (loading) {
    return (
      <>
        <h2 className='font-bold text-4xl p-2 text-center'>Loading tournament...</h2>
        <img src={loadingIcon} alt="loading" className='animate-spin w-24 h-auto p-4' />
      </>
    );
  }

  return (
    <main className="flex-1 w-full max-w-[400px] mx-auto flex flex-col gap-4 p-4 items-center">
      <h1 className="text-center m-0 text-6xl font-bold my-8 mb-1">
        Tournament
      </h1>
      <h2 className='font-bold text-3xl my-8 spacing-1 mt-0 mb-3 text-center'>
        {currentTournament && formatDateTime(currentTournament?.createdAt)}
      </h2>
      <menu className='grid grid-cols-2 gap-4 p-3 '>
        <span className='font-semibold justify-self-center'>Owner: {currentTournament?.ownerName} </span>
        <span className='flex flex-row items-center gap-2 font-semibold justify-self-center cursor-pointer' onClick={() => handleCopyInviteLink(currentTournament?.id || '')}>
          <img src={linkIcon} alt="Invite" className='invert h-auto w-6' /> Invite
        </span>
        <span className="font-semibold justify-self-center">{currentTournament?.status === 'open' ? '🟢 Active' : '🟠 Finished'}</span>
        <span className='font-semibold justify-self-center cursor-pointer' onClick={handleExitTournament}>Exit tournament</span>
        {isOwner() &&
          // Horizontal line for these elements
          <>
            {/* <hr className='border border-white/10 col-span-2' /> */}
            <span className='text-white/60 justify-self-center cursor-pointer col-span-2' onClick={handleChangeStatus}>
              {currentTournament?.status === 'open' ? '🏁 End tournament' : '↺ Restart tournament'}
            </span>

          </>
        }

      </menu>
      <h3 className='font-semibold text-2xl p-2'>Participants:</h3>
      <article className="flex flex-col gap-4 w-full overflow-y-auto p-2">
        {
          currentTournament?.participants.sort((a, b) => b.sushiCount - a.sushiCount).map((participant, index) => (
            <article
              key={participant.userId}
              className="grid grid-cols-[1fr_7fr_3fr] gap-2 p-4 px-12 border border-white/10 rounded-xl bg-white/5 items-center"
            >
              {/* Column 1: medal if applicable */}
              <span className="text-xl font-bold justify-self-center">
                {currentTournament.participants.length > 3 ? (index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '') : index === 0 ? '👑' : ''}
              </span>

              {/* Column 2: name */}
              <span className={`text-xl font-medium justify-self-start ${participant.status === 'left' ? 'opacity-50 italic' : ''}`}>
                {participant.userName} {participant.status === 'left' && '(Left)'}
              </span>

              {/* Column 3: sushi */}
              <span className="text-xl font-bold justify-self-start">
                {participant.sushiCount} 🍣
              </span>
            </article>

          ))
        }
      </article>
    </main>
  );
}

export default Tournament;
