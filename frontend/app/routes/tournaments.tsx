import { useAuth } from "~/hooks/useAuth";
import { useUserTournaments } from "~/hooks/useUserTournaments";
import { formatDateTime } from "~/utils/formatDateTime";
import { useNavigate } from "react-router";
import type { Route } from "./+types";
import linkIcon from "~/assets/icons/ui/link.svg"

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Tournaments - Sushi Counter" },
        { name: "description", content: "Compete in how many sushi dou you eat!" },
    ];
}


export default function Tournaments() {
    const { tournaments, loading, error, createTournament, setError } = useUserTournaments();
    const navigate = useNavigate()
    const handleCreateTournament = () => {
        createTournament();
    };

    const handleClearError = () => {
        if (setError) setError(null);
    };

    const handleCopyInviteLink = async (id: string) => {
        const hostname = window.location.hostname;
        const port = window.location.port ? `:${window.location.port}` : ''; // Verifica si hay puerto y lo agrega
        const url = `${hostname}${port}/tournament/join/${id}`;

        try {
            // Copia el enlace al portapapeles
            await navigator.clipboard.writeText(url);
            alert('Link copied to clipboard!');
        } catch (error) {
            console.error('Error during copy to clipboard:', error);
            alert('Error during copy to clipboard: ' + error);
        }
    }

    return (
        <div className="w-full max-w-[400px] p-4 flex flex-col items-center">
            <h1 className="text-center m-0 text-[55px] font-bold my-8 mb-1">
                Tournaments
            </h1>
            <article className="flex flex-col gap-4 w-full p-3 overflow-y-auto">
                {loading && <p>Loading...</p>}
                {error && (
                    <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20 text-red-500">
                        <p>Error: {error}</p>
                        <button onClick={handleClearError} className="mt-2 bg-red-500 text-white hover:bg-red-600 transition-colors">Clear</button>
                    </div>
                )}
                {tournaments.length > 0 ? (
                    [...tournaments]
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((tournament) => (
                            <article key={tournament.id} onClick={() => { navigate(`/tournament/${tournament.id}`) }}
                                className="flex flex-col gap-3 w-full p-8 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm"
                            >
                                <h2 className="text-xl font-bold px-4">{formatDateTime(tournament.createdAt)}</h2>
                                <span className="text-[5.9xl] font-bold px-4">{tournament.status === 'open' ? '🟢 Active' : '🟠 Finished'}</span>
                                <menu className='grid grid-cols-2 gap-4 px-3 '>
                                    <span className='font-semibold justify-self-center'>Owner: {tournament.ownerName} </span>
                                    <span className='flex flex-row items-center gap-2 font-semibold justify-self-center cursor-pointer' onClick={(event) => {event.stopPropagation(); handleCopyInviteLink(tournament?.id || '')}}>
                                        <img src={linkIcon} alt="Invite" className='invert h-auto w-6' /> Invite
                                    </span>
                                </menu>
                            </article>
                        ))
                ) : (
                    <p className="text-center text-[#aaa]">You've never participated in a tournament.</p>
                )}
            </article>
            <button onClick={handleCreateTournament} className="w-full max-w-[300px] p-2 border border-white text-white hover:bg-white/5 transition-colors rounded-md">Create Tournament</button>
        </div>
    );
}
