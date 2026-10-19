import { useEffect, useState } from "react";
import { TournamentService } from "~/services/tournamentService";
import type { Tournament } from "~/types/tournamentType";
import { useAuth } from "./useAuth";

export function useUserTournamentHistory() {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    if (!user?.id) {
      setTournaments([]);
      return;
    }

    let cancelled = false;
    new TournamentService().getUserTournaments()
      .then((response) => {
        if (!cancelled) setTournaments(response.success ? response.tournaments ?? [] : []);
      })
      .catch(() => {
        if (!cancelled) setTournaments([]);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return tournaments;
}
