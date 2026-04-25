export interface Participant {
  userId: string;
  userName: string
  tournamentId: string;
  sushiCount: number;
  status: string;
}

export interface Tournament {
  id: string;
  ownerId: string;
  ownerName: string;
  status: string;
  createdAt: string;
  participants: Participant[];
}
