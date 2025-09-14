type Tournament = {
  id: string;
  creator: string;
  status: string;
  createdAt: Date;
};

type PublicTournament = {
  id: string;
  status: string;
  creator: string;
  createdAt: Date;
  participants: PublicParticipant[];
};


type Participant = {
  user: string;
  tournament: string;
  sushiCount: number;
};

type PublicParticipant = {
  tournament: string;
  name: string;
  sushiCount: number;
};
export { Tournament, PublicTournament, Participant, PublicParticipant };