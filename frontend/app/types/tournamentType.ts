export interface Participant {
  name: string;
  sushiCount: number;
  finished: boolean;
}

export interface Tournament {
  id: string;
  creator: string;
  status: string;
  createdAt: string; // Si usás Date, podés cambiarlo
  participants: Participant[];
}
