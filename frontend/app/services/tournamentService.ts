import { ApiService } from './apiService';
import type { Tournament } from '~/types/tournamentType';
import type { Response } from '~/types/responseType';

export class TournamentService extends ApiService {
  public async createTournament(userCode: string): Promise<{ success: boolean; tournamentId?: string; errorMessage?: string }> {
    try {
      const response: Response = await this.post(`/tournaments/create`, { userCode });
      if (response.success) {
        return { success: true, tournamentId: response.tournamentId as string };
      } else {
        return { success: false, errorMessage: response.errorMessage };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido al crear torneo';
      return { success: false, errorMessage };
    }
  }

  public async joinTournament(tournamentId: string, userCode: string): Promise<{ success: boolean; tournamentId?: string; errorMessage?: string; }> {
    try {
      const response: Response = await this.post(`/tournaments/join`, {
        tournamentId,
        userCode,
      });
      if (response.success) {
        return { success: true, tournamentId: response.tournamentId as string };
      } else {
        return { success: false, errorMessage: response.errorMessage };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido al unirse al torneo';
      return { success: false, errorMessage };
    }
  }

  public async getTournament(id: string): Promise<{ success: boolean; tournament?: Tournament; errorMessage?: string }> {
    try {
      const response: Response = await this.get(`/tournaments/${id}`);
      if (response.success) {
        return { success: true, tournament: response.tournament as Tournament };
      } else {
        return { success: false, errorMessage: response.errorMessage };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido al obtener torneo';
      return { success: false, errorMessage };
    }
  }

  public async getUserTournaments(userCode: string): Promise<{ success: boolean; tournaments?: Tournament[]; errorMessage?: string }> {
    try {
      const response: Response = await this.get(`/tournaments/user/${userCode}`);

      if (response.success) {
        return { success: true, tournaments: response.tournaments as Tournament[] };
      } else {
        return { success: false, errorMessage: response.errorMessage };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return { success: false, errorMessage };
    }
  }

  public async updateSushiCount(userCode: string, sushiCount: number): Promise<{ success: boolean; tournamentId?: string; errorMessage?: string }> {
    try {
      const response: Response = await this.post(`/tournaments/update-count`, {
        userCode,
        sushiCount,
      });
      console.log(response)
      if (response.success) {
        return { success: true, tournamentId: response.tournamentId as string };
      } else {
        return { success: false, errorMessage: response.errorMessage };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido al unirse al torneo';
      return { success: false, errorMessage };
    }
  }
}
