type Tournament = {
  id: string;
  creator: string;
  createdAt: Date;
};

type PublicTournament = {
  id: string;
  creator: string;
  createdAt: Date;
  participants: PublicParticipant[];
};


type Participant = {
  user: string;
  tournament: string;
  sushiCount: number;
  finished: boolean;
};

type PublicParticipant = {
  tournament: string;
  name: string;
  sushiCount: number;
  finished: boolean;
};
export { Tournament, PublicTournament, Participant, PublicParticipant };