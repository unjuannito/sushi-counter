import { useState, useEffect } from "react";
import type { Tournament } from '~/types/tournamentType';
import { TournamentService } from "~/services/tournamentService";
import { useAuth } from "./useAuth";
import { useNavigate } from "react-router";
import WebSocketService from '~/services/webSocketService'; // Import your WebSocket service

export function useUserTournaments() {
    const { user } = useAuth();
    const service = new TournamentService();
    const navigate = useNavigate();

    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [currentTournament, setCurrentTournament] = useState<Tournament | null>(null);
    const [loading, setLoading] = useState(true);
    const [reloading, setReloading] = useState(0);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        setLoading(true);
        service.getActiveUserTournaments()
            .then((response) => {
                if (!response.success) {
                    console.log('Error response:', response);
                    setError(response.errorMessage || 'Error fetching tournaments');
                    setLoading(false);
                    return;
                }
                console.log('Fetched tournaments:', response.tournaments);
                setTournaments(response.tournaments || []);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message || 'Error fetching tournaments');
                setLoading(false);
            });
    }, [user, reloading]);

    // ** Effect to keep currentTournament updated when the tournament list changes **
    useEffect(() => {
        if (currentTournament) {
            const updated = tournaments.find(t => t.id === currentTournament.id);
            if (updated) {
                console.log(`[WS Hook] Updating currentTournament (ID: ${currentTournament.id}) after tournaments change`);
                setCurrentTournament(updated);
            }
        }
    }, [tournaments]);

    // ** New useEffect for WebSocket **
    useEffect(() => {
        if (!user) return;

        const webSocketService = WebSocketService.getInstance();

        // Connect (if not connected)
        webSocketService.connect();

        // Listener for the 'update' event (or the event sent by the WS)
        const handleUpdateMessage = (event: string, message: any) => {
            console.log(`[WS Hook] Event "${event}" received. Data:`, message);
            console.log('[WS Hook] Forcing tournament reload...');
            setReloading(prev => prev + 1);
        };

        const onUpdate = (data: any) => handleUpdateMessage('update', data);
        const onJoin = (data: any) => handleUpdateMessage('join', data);
        const onDelete = (data: any) => handleUpdateMessage('delete', data);

        console.log('[WS Hook] Registering listeners for "update", "join", "delete"');
        webSocketService.listenToEvent('update', onUpdate);
        webSocketService.listenToEvent('join', onJoin);
        webSocketService.listenToEvent('delete', onDelete);

        // Cleanup: remove listener on unmount
        return () => {
            console.log('[WS Hook] Cleaning up listeners');
            webSocketService.stopListening('update', onUpdate);
            webSocketService.stopListening('join', onJoin);
            webSocketService.stopListening('delete', onDelete);
        };
    }, [user]);

    const createTournament = () => {
        setReloading(1);
        setError(null);
        if (!user) return { success: false, errorMessage: "User not authenticated" };
        service.createTournament()
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
        setLoading(true);
        setError(null);
        if (!user) return { success: false, errorMessage: "User not authenticated" };
        service.joinTournament(tournamentId)
            .then((response) => {
                if (!response.success) {
                    setError(response.errorMessage || 'Error joining tournament');
                    setLoading(false);
                    setTimeout(() => {
                        navigate(`/tournaments`);
                    }, 700);
                } else {
                    setLoading(false);
                    setTimeout(() => {
                        navigate(`/tournament/${response.tournamentId}`);
                    }, 700);
                }
            });
    };

    const assignCurrentTournament = (id: string) => {
        const newTournament = tournaments.find(t => (t.id == id));
        if (newTournament) {
            setCurrentTournament(newTournament);
        } else {
            navigate("/tournaments");
        }
    }

    const getTournamentById = (id: string) => {
        return tournaments.find(t => t.id === id);
    };

    const updateSushiCount = (newCounter: number) => {
        if (!user) return { success: false, errorMessage: "User not authenticated" };
        service.updateSushiCount(newCounter)
        // .then((response) => {
        //     console.log(response)
        // })
    };

    const isAnyTournamentActive = () => {
        return true
    };

    const updateStatus = (tournamentId: string, status: string) => {
        if (!user) return { success: false, errorMessage: "User not authenticated" };
        service.updateStatus(tournamentId, status);
    };

    const isOwner = () => {
        if (currentTournament?.ownerId == user?.id) return true
        else return false
    }

    const deleteTournament = (tournamentId: string) => {
        if (!user) return
        service.deleteTournament(tournamentId)
            .then(response => {
                if (response.success) {
                    navigate("/tournaments/")
                } else {
                    setError(response.errorMessage || 'Error when deleting tournament')
                }
            })
    }

    const leaveTournament = (tournamentId: string) => {
        if (!user) return
        service.leaveTournament(tournamentId)
            .then(response => {
                if (response.success) {
                    navigate("/tournaments")
                } else {
                    setError(response.errorMessage || 'Error when leaving tournament')
                }
            })
    }

    return {
        tournaments,
        loading,
        error,
        reloading,
        currentTournament,
        createTournament,
        joinTournament,
        assignCurrentTournament,
        getTournamentById,
        updateSushiCount,
        isAnyTournamentActive,
        updateStatus,
        isOwner,
        deleteTournament,
        leaveTournament,
        setError
    };
}
