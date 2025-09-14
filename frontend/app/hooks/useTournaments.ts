import { useState, useCallback } from "react";
import { TournamentService } from "~/services/tournamentService";
import type { Tournament } from "~/types/tournamentType";

export function useTournaments() {
  const service = new TournamentService();

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener torneo por id
  const fetchTournament = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.getTournament(id);
      if (result.success && result.tournament) {
        setTournament(result.tournament);
      } else {
        setError(result.errorMessage ?? "No se pudo cargar el torneo");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Crear nuevo torneo
  const createTournament = useCallback(async (userCode: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.createTournament(userCode);
      if (result.success && result.tournamentId) {
        // Podrías cargar el torneo recién creado si querés
        await fetchTournament(result.tournamentId);
        return { success: true, tournamentId: result.tournamentId };
      } else {
        setError(result.errorMessage ?? "Error al crear torneo");
        return { success: false, errorMessage: result.errorMessage };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError(message);
      return { success: false, errorMessage: message };
    } finally {
      setLoading(false);
    }
  }, [service, fetchTournament]);

  // Unirse a torneo
  const joinTournament = useCallback(async (tournamentId: string, userCode: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.joinTournament(tournamentId, userCode);
      if (result.success) {
        // Opcional: refrescar datos del torneo luego de unirse
        await fetchTournament(tournamentId);
        return { success: true };
      } else {
        setError(result.errorMessage ?? "Error al unirse al torneo");
        return { success: false, errorMessage: result.errorMessage };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError(message);
      return { success: false, errorMessage: message };
    } finally {
      setLoading(false);
    }
  }, [service, fetchTournament]);

  // Limpiar estado de error (útil para UI)
  const clearError = () => setError(null);

  return {
    tournament,
    loading,
    error,
    fetchTournament,
    createTournament,
    joinTournament,
    clearError,
  };
}
