import { useAuth } from "~/hooks/useAuth";
import { useUserTournaments } from "~/hooks/useUserTournaments";
import { formatDateTime } from "~/utils/formatDateTime";
import "../styles/tournaments.css"
import { useNavigate } from "react-router";
import type { Route } from "./+types";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Tournaments - Sushi Counter" },
        { name: "description", content: "Compete in how many sushi dou you eat!" },
    ];
}


export default function Tournaments() {
    const { tournaments, loading, error, createTournament } = useUserTournaments();
    const navigate = useNavigate()
    const handleCreateTournament = () => {
        createTournament();
    };

    const handleCopy = async (id: string) => {
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
        <main>
            <h1>Tournaments</h1>
            <article>
                {loading && <p>Loading...</p>}
                {error && (
                    <div>
                        <p>Error: {error}</p>
                        <button >Clear</button>
                    </div>
                )}
                {tournaments.length > 0 ? (
                    [...tournaments]
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((tournament) => (
                            <article key={tournament.id} onClick={() => { navigate(`/tournament/${tournament.id}`) }}>
                            <h2>{formatDateTime(tournament.createdAt)}</h2>
                            <span>Owner: {tournament.ownerName}</span>
                            <button onClick={(ev) => { ev.stopPropagation(); handleCopy(tournament.id) }}>Copy link</button>
                        </article>
                    ))
                ) : (
                    <p>You've never participated in a tournament.</p>
                )}
            </article>
            <button onClick={handleCreateTournament}>Create Tournament</button>
        </main>
    );
}
