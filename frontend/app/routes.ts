import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [layout("routes/_layout.tsx", [
  index("routes/index.tsx"),
  route("calendar", "routes/calendar.tsx"),
  route("calendar/:day", "routes/day.tsx"),
  route("tournaments", "routes/tournaments.tsx"),
  route("tournament/:id", "routes/tournament.tsx"),
  route("tournament/join/:id", "routes/joinTournament.tsx"),
  route("statistics", "routes/statistics.tsx"),
  route("user", "routes/user.tsx"),
]),
  //   route("area-socios/login", "routes/area-socios/login.tsx"),
] satisfies RouteConfig;
