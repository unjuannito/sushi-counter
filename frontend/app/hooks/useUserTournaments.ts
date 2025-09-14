import { useState, useEffect } from "react";
import type { Tournament } from '~/types/tournamentType';
import { TournamentService } from "~/services/tournamentService";
import { useAuth } from "./useAuth";
import { useNavigate } from "react-router";
import WebSocketService from '~/services/webSocketService'; // Importa tu servicio WebSocket

export function useUserTournaments() {
    const { user } = useAuth();
    const service = new TournamentService();
    const navigate = useNavigate();

    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState(true);
    const [reloading, setReloading] = useState(0);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;

        setLoading(true);
        service.getUserTournaments(user.userCode)
            .then((response) => {
                if (!response.success) {
                    setError(response.errorMessage || 'Error fetching tournaments');
                    setLoading(false);
                    return;
                }
                setTournaments(response.tournaments || []);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message || 'Error fetching tournaments');
                setLoading(false);
            });
        if(reloading > 0) setReloading(reloading-1);
    }, [user, reloading]);

    // ** Nuevo useEffect para WebSocket **
    useEffect(() => {
        if (!user) return;

        const webSocketService = WebSocketService.getInstance();

        // Conectamos (si no está conectado)
        webSocketService.connect();

        // Listener para el evento 'update' (o el evento que mande el WS)
        const handleUpdateMessage = (message: any) => {
            console.log('Mensaje WS recibido:', message);
            setReloading(reloading+1);
        };

        webSocketService.listenToEvent('update', handleUpdateMessage);

        // Cleanup: quitar el listener al desmontar
        return () => {
            webSocketService.disconnect();
        };
    }, [user]);

    const createTournament = () => {
        setReloading(1);
        setError(null);
        if (!user) return { success: false, errorMessage: "User not authenticated" };
        service.createTournament(user.userCode)
            .then((response) => {
                if (!response.success) {
                    setError(response.errorMessage || 'Error creating tournament');
                    setReloading(0);
                } else {
                    setReloading(0);
                    navigate(`/tournament/${response.tournamentId}`);
                }
            });
    };

    const joinTournament = (tournamentId: string) => {
        setReloading(0);
        setError(null);
        if (!user) return { success: false, errorMessage: "User not authenticated" };
        service.joinTournament(tournamentId, user.userCode)
            .then((response) => {
                if (!response.success) {
                    setError(response.errorMessage || 'Error joining tournament');
                    setReloading(0);
                } else {
                    setReloading(0);
                    navigate(`/tournament/${response.tournamentId}`);
                }
            });
    };

    const getTournamentById = (id: string) => {
        return tournaments.find(t => t.id === id);
    };

    const updateSushiCount = (newCounter: number) => {
        console.log("sd")
        if (!user) return { success: false, errorMessage: "User not authenticated" };
        service.updateSushiCount(user.userCode, newCounter)
        .then((response) => {
            console.log(response)
        })
    };

    const isAnyTournamentActive = () => {
        return true
    };

    const updateStatus = (id: string, status: string) => {
        if (!user) return { success: false, errorMessage: "User not authenticated" };
        service.updateStatus(id, status);
    };

    return {
        tournaments,
        loading,
        error,
        createTournament,
        joinTournament,
        getTournamentById,
        updateSushiCount,
        isAnyTournamentActive,
        reloading,
        updateStatus
    };
}
