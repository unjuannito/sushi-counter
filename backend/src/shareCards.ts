import { Router } from "express";
import sharp from "sharp";
import { pool } from "./db/db";

type ShareParticipant = { name: string; count: number };
type ShareTournament = {
  id: string;
  owner: string;
  status: string;
  participants: ShareParticipant[];
};

const escapeXml = (value: string) => value.replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;",
})[char] || char);

const short = (value: string, max: number) => {
  const chars = Array.from(value.trim());
  return escapeXml(chars.length > max ? `${chars.slice(0, max - 1).join("")}…` : value.trim());
};

async function getTournament(id: string): Promise<ShareTournament | null> {
  if (!/^[a-zA-Z0-9_-]{1,80}$/.test(id)) return null;
  const [rows] = await pool.query<any[]>(
    "SELECT t.id, t.status, u.name AS owner FROM tournaments t JOIN users u ON u.id = t.owner_id WHERE t.id = ? LIMIT 1",
    [id],
  );
  if (!rows.length) return null;
  const [participants] = await pool.query<any[]>(
    "SELECT u.name, p.sushi_count AS count FROM participants p JOIN users u ON u.id = p.user_id WHERE p.tournament_id = ? AND p.status != 'left' ORDER BY p.sushi_count DESC, u.name ASC",
    [id],
  );
  return { id, owner: rows[0].owner, status: rows[0].status, participants };
}

const sushi = `
  <ellipse cx="1006" cy="333" rx="165" ry="178" fill="#262626" stroke="#52504a" stroke-width="3"/>
  <ellipse cx="1006" cy="333" rx="140" ry="151" fill="#34312c"/>
  <g transform="translate(941 251) rotate(-18)"><rect x="0" y="0" width="110" height="72" rx="30" fill="#f5edda"/><rect x="25" y="15" width="60" height="42" rx="20" fill="#fb715a"/><path d="M35 36h40" stroke="#ffc6ad" stroke-width="8" stroke-linecap="round"/></g>
  <g transform="translate(901 347) rotate(22)"><rect x="0" y="0" width="110" height="72" rx="30" fill="#f5edda"/><rect x="25" y="15" width="60" height="42" rx="20" fill="#fb715a"/><path d="M35 36h40" stroke="#ffc6ad" stroke-width="8" stroke-linecap="round"/></g>
  <g transform="translate(1028 343) rotate(-12)"><rect x="0" y="0" width="110" height="72" rx="30" fill="#f5edda"/><rect x="25" y="15" width="60" height="42" rx="20" fill="#fb715a"/><path d="M35 36h40" stroke="#ffc6ad" stroke-width="8" stroke-linecap="round"/></g>
  <circle cx="1093" cy="245" r="13" fill="#9eae77"/><circle cx="895" cy="287" r="9" fill="#9eae77"/>`;

function frame(content: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#171717"/>
  <circle cx="1065" cy="76" r="315" fill="#25231f"/><circle cx="1114" cy="610" r="240" fill="#20231e"/>
  <path d="M0 1h1200M0 629h1200" stroke="#31312e" stroke-width="2"/>
  <rect x="66" y="55" width="43" height="43" rx="14" fill="#fb715a"/>
  <circle cx="87.5" cy="76.5" r="12" fill="#f6ead8"/><circle cx="87.5" cy="76.5" r="6" fill="#fb715a"/>
  <text x="124" y="86" fill="#f6f0e7" font-family="DejaVu Sans, sans-serif" font-weight="bold" font-size="29">sushi counter</text>
  <text x="66" y="591" fill="#aaa9a3" font-family="DejaVu Sans, sans-serif" font-size="22">sushi-counter.jcanas.es</text>
  ${content}</svg>`;
}

export function homeCard() {
  return frame(`<text x="66" y="203" fill="#fb715a" font-family="DejaVu Sans, sans-serif" font-size="23" font-weight="bold" letter-spacing="5">COME · CUENTA · COMPITE</text>
  <text x="62" y="305" fill="#f6f0e7" font-family="DejaVu Sans, sans-serif" font-size="72" font-weight="bold">Cada pieza</text>
  <text x="62" y="392" fill="#f6f0e7" font-family="DejaVu Sans, sans-serif" font-size="72" font-weight="bold">cuenta.</text>
  <text x="66" y="457" fill="#c2bfb8" font-family="DejaVu Sans, sans-serif" font-size="27">Cuenta tu sushi. Reta a tus amigos.</text>
  <rect x="66" y="493" width="294" height="52" rx="26" fill="#fb715a"/>
  <text x="96" y="528" fill="#171717" font-family="DejaVu Sans, sans-serif" font-size="23" font-weight="bold">Empieza a contar  →</text>
  ${sushi}`);
}

export function tournamentCard(tournament: ShareTournament) {
  const active = tournament.status === "open";
  const rows = tournament.participants.slice(0, 3).map((participant, i) => `
    <rect x="748" y="${242 + i * 92}" width="394" height="76" rx="17" fill="#34322d"/>
    <circle cx="788" cy="${280 + i * 92}" r="23" fill="${i === 0 ? "#fb715a" : "#59554b"}"/>
    <text x="781" y="${288 + i * 92}" fill="#fff6eb" font-family="DejaVu Sans, sans-serif" font-size="22" font-weight="bold">${i + 1}</text>
  <text x="827" y="${289 + i * 92}" fill="#f6f0e7" font-family="DejaVu Sans, sans-serif" font-size="24" font-weight="bold">${short(participant.name, 10)}</text>
    <text x="1121" y="${289 + i * 92}" text-anchor="end" fill="#fb715a" font-family="DejaVu Sans, sans-serif" font-size="24" font-weight="bold">${participant.count}</text>`).join("");
  return frame(`<text x="66" y="195" fill="#fb715a" font-family="DejaVu Sans, sans-serif" font-size="23" font-weight="bold" letter-spacing="5">TORNEO DE SUSHI</text>
  <text x="62" y="285" fill="#f6f0e7" font-family="DejaVu Sans, sans-serif" font-size="66" font-weight="bold">El torneo de</text>
  <text x="62" y="365" fill="#f6f0e7" font-family="DejaVu Sans, sans-serif" font-size="66" font-weight="bold">${short(tournament.owner, 12)}</text>
  <text x="66" y="436" fill="#c2bfb8" font-family="DejaVu Sans, sans-serif" font-size="26">${tournament.participants.length} participantes · ${active ? "En juego" : "Finalizado"}</text>
  <rect x="66" y="481" width="303" height="57" rx="28" fill="#fb715a"/>
  <text x="99" y="518" fill="#171717" font-family="DejaVu Sans, sans-serif" font-size="23" font-weight="bold">${active ? "Únete al torneo  →" : "Ver clasificación  →"}</text>
  <rect x="722" y="151" width="446" height="405" rx="30" fill="#292823" stroke="#48443c" stroke-width="2"/>
  <text x="748" y="211" fill="#f6f0e7" font-family="DejaVu Sans, sans-serif" font-size="24" font-weight="bold">CLASIFICACIÓN</text>
  ${rows || `<text x="748" y="292" fill="#c2bfb8" font-family="DejaVu Sans, sans-serif" font-size="23">La competición empieza aquí.</text>`}
  <text x="748" y="527" fill="#9e9b92" font-family="DejaVu Sans, sans-serif" font-size="19">Piezas de sushi contadas</text>`);
}

export const shareRouter = Router();

shareRouter.get("/home.png", async (_req, res) => {
  const image = await sharp(Buffer.from(homeCard())).png().toBuffer();
  res.type("png").set("Cache-Control", "public, max-age=86400").send(image);
});

shareRouter.get("/tournament/:id.json", async (req, res) => {
  const tournament = await getTournament(String(req.params.id));
  if (!tournament) return res.status(404).json({ error: "Tournament not found" });
  res.set("Cache-Control", "no-store").json(tournament);
});

shareRouter.get("/tournament/:id.png", async (req, res) => {
  const tournament = await getTournament(String(req.params.id));
  if (!tournament) return res.status(404).send("Tournament not found");
  const image = await sharp(Buffer.from(tournamentCard(tournament))).png().toBuffer();
  res.type("png").set("Cache-Control", "public, max-age=300").send(image);
});
