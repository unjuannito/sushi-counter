import { useState, useEffect, useCallback } from "react";
import type { Tournament } from '~/types/tournamentType';
import { TournamentService } from "~/services/tournamentService";
import { useAuth } from "./useAuth";
import { useNavigate } from "react-router";
import { ApiService } from '~/services/apiService'; // Importa ApiService

export function useUserTournaments() {
    const { user } = useAuth();
    const service = new TournamentService();
    const navigate = useNavigate();

    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState(true);
    const [reloading, setReloading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        
        // Conectamos el WebSocket para escuchar las notificaciones de actualización
        const apiService = new ApiService();
        apiService.connectWebSocket();

        // Escuchar eventos del WebSocket
        apiService.socket?.on('update', (message: string) => {
            // Aquí recibimos el mensaje y ponemos reloading a true
            setReloading(true);
            console.log('Mensaje WebSocket recibido:', message);

            // Puedes manejar la lógica de recarga si lo deseas
            // Por ejemplo, volver a cargar los torneos después de un tiempo
            setTimeout(() => {
                setReloading(false);
            }, 2000);  // Puedes ajustar el tiempo de recarga

        });

        return () => {
            // Desconectamos el WebSocket cuando el componente se desmonta
            apiService.disconnectWebSocket();
        };

    }, [user]);  // Esta dependencia solo ejecutará el useEffect cuando el `user` cambie

    useEffect(() => {
        if (!user) return;

        setLoading(true);
        service.getUserTournaments(user.userCode)
            .then((response) => {
                console.log(response);
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
    }, [user, reloading]);  // Usamos `reloading` para que se recarguen los torneos cuando cambie

    const createTournament = () => {
        setReloading(true);
        setError(null);
        if (!user) return { success: false, errorMessage: "User not authenticated" };
        service.createTournament(user.userCode)
            .then((response) => {
                if (!response.success) {
                    setError(response.errorMessage || 'Error creating tournament');
                    setReloading(false);
                } else {
                    setReloading(false);
                    navigate(`/tournament/${response.tournamentId}`);
                }

            });
        return;
    };

    const joinTournament = (tournamentId: string) => {
        setReloading(true);
        setError(null);
        if (!user) return { success: false, errorMessage: "User not authenticated" };
        service.joinTournament(tournamentId, user.userCode)
            .then((response) => {
                if (!response.success) {
                    setError(response.errorMessage || 'Error joining tournament');
                    setReloading(false);
                } else {
                    setReloading(false);
                    navigate(`/tournament/${response.tournamentId}`);
                }

            });
        return;
    };

    const getTournamentById = (id: string) => {
        return tournaments.find(t => t.id === id);
    };

    const updateSushiCount = (newCounter: number) => {
        if (!user) return { success: false, errorMessage: "User not authenticated" };
        service.updateSushiCount(user.userCode, newCounter);
    };

    const isAnyTournamentActive = () => {
        return true
        // return tournaments.some(tournament => tournament.status === "active");
    };

    return { tournaments, loading, error, createTournament, joinTournament, getTournamentById, updateSushiCount, isAnyTournamentActive, reloading };
}
