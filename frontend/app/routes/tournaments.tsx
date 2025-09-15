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
        console.log("Handle create tournament");
        createTournament();
    };

    const handleCopy = async (id: string) => {
        const hostname = window.location.hostname;
        const port = window.location.port ? `:${window.location.port}` : ''; // Verifica si hay puerto y lo agrega
        const url = `${hostname}${port}/sushi-counter/tournament/join/${id}`;
        console.log(url); // Para ver cómo se construye la URL

        try {
            // Copia el enlace al portapapeles
            await navigator.clipboard.writeText(url);
            alert('¡Enlace copiado al portapapeles!');
        } catch (error) {
            console.error('Error al copiar al portapapeles:', error);
            alert('No se pudo copiar el enlace. Intenta nuevamente.');
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
                    tournaments.map((tournament) => (
                        <article key={tournament.id} onClick={() => { navigate(`/tournament/${tournament.id}`) }}>
                            <h2>{formatDateTime(tournament.createdAt)}</h2>
                            <span>Owner: {tournament.creator}</span>
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
