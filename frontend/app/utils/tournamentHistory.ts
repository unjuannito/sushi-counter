import type { Tournament } from "~/types/tournamentType";

export function getLocalDateKey(value: string): string | null {
  const date = new Date(value.includes(" ") ? value.replace(" ", "T") : value);
  if (Number.isNaN(date.getTime())) return null;
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function getTournamentPlace(tournament: Tournament, userId?: string): number | null {
  if (!userId) return null;
  const participant = tournament.participants.find((entry) => entry.userId === userId);
  if (!participant) return null;
  return 1 + tournament.participants.filter((entry) => entry.sushiCount > participant.sushiCount).length;
}

export function getPlaceLabel(place: number, language: "en" | "es"): string {
  if (language === "es") return `${place}${place === 1 || place === 3 ? ".ᵉʳ" : ".º"} puesto`;
  const suffix = place % 100 >= 11 && place % 100 <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" }[place % 10] ?? "th");
  return `${place}${suffix} place`;
}
