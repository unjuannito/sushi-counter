export interface Participant {
  name: string;
  sushiCount: number;
}

export interface Tournament {
  id: string;
  creator: string;
  createdAt: string; // Si usás Date, podés cambiarlo
  participants: Participant[];
}
