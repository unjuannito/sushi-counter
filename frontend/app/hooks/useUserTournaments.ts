import { useState, useEffect, useCallback, use } from "react";
import type { Tournament } from '~/types/tournamentType';
import { TournamentService } from "~/services/tournamentService";
import { useAuth } from "./useAuth";
import { useNavigate } from "react-router";

export function useUserTournaments() {
    const { user } = useAuth();
    const service = new TournamentService();
    const navigate = useNavigate()

    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState(true);
    const [reloading, setReloading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
    }, [user, reloading]);

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
                    navigate(`/tournament/${response.tournamentId}`)
                }

            });
        return;
    }

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
                    console.log("llega")
                    navigate(`/tournament/${response.tournamentId}`)
                }

            });
        return;

    }

    const getTournamentById = (id: string) => {
        return tournaments.find(t => t.id = id);
    }

    const updateSushiCount = ( newCounter : number) => {
        if (!user) return { success: false, errorMessage: "User not authenticated" };
        service.updateSushiCount(user.userCode, newCounter )
    }

    const isAnyTournamentActive = () => {
        return true
    }

    return { tournaments, loading, error, createTournament, joinTournament, getTournamentById, updateSushiCount, isAnyTournamentActive };
}
