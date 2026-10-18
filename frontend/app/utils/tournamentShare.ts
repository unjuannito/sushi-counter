import { APP_CONSTANTS } from "./constants";

export type TournamentShareData = {
  id: string;
  owner: string;
  status: string;
  participants: { name: string; count: number }[];
};

export async function loadTournamentShare(request: Request, id?: string) {
  if (!id) return null;
  try {
    const url = new URL(`/share/tournament/${encodeURIComponent(id)}.json`, request.url);
    const response = await fetch(url, { headers: { accept: "application/json" } });
    if (!response.ok) return null;
    return await response.json() as TournamentShareData;
  } catch {
    return null;
  }
}

export function tournamentMeta(tournament: TournamentShareData | null, id?: string) {
  const title = tournament ? `El torneo de ${tournament.owner} | Sushi Counter` : "Torneo de sushi | Sushi Counter";
  const description = tournament
    ? `${tournament.participants.length} participantes · ${tournament.status === "open" ? "En juego. Mira la clasificación y únete" : "Finalizado. Mira la clasificación"} al torneo de ${tournament.owner}.`
    : "Mira la clasificación y compite contando piezas de sushi con tus amigos.";
  const version = tournament ? `${tournament.status}-${tournament.participants.map((p) => p.count).join("-")}` : "";
  const image = tournament && id
    ? `${APP_CONSTANTS.legalDetails.websiteUrl}/share/tournament/${encodeURIComponent(id)}.png?v=${encodeURIComponent(version)}`
    : `${APP_CONSTANTS.legalDetails.websiteUrl}/share/home.png`;
  return [
    { title },
    { name: "description", content: description },
    { name: "robots", content: "noindex, follow" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: image },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: tournament ? `Tarjeta del torneo de ${tournament.owner}` : "Sushi Counter" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
  ];
}
