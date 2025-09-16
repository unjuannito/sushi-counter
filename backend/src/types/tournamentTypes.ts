type Tournament = {
  id: string;
  creator: string;
  status: string;
  createdAt: Date;
};

type PublicTournament = {
  id: string;
  ownerId: string;
  ownerName: string;
  status: string;
  createdAt: Date;
  participants: PublicParticipant[];
};


type Participant = {
  user: string;
  tournament: string;
  sushiCount: number;
};

type PublicParticipant = {
  userId: string;
  userName: string
  tournamentId: string;
  sushiCount: number;
};
export { Tournament, PublicTournament, Participant, PublicParticipant };