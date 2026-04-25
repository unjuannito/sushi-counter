import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  layout("layouts/MainLayout.tsx", [
    index("routes/index.tsx"),
    route("calendar/:month?", "routes/calendar/calendar.tsx"),
    route("calendar/day/:day", "routes/calendar/day.tsx"),
    route("tournaments", "routes/tournaments/list.tsx"),
    route("tournament/join/:id?", "routes/tournaments/join.tsx"),
    route("tournament/:id", "routes/tournaments/detail.tsx"),
    route("statistics", "routes/statistics.tsx"),
    route("user", "routes/user.tsx"),
  ]),
  layout("layouts/LegalLayout.tsx", [
    route("legal-notice", "routes/legal/notice.tsx"),
    route("privacy-policy", "routes/legal/privacy.tsx"),
    route("cookies-policy", "routes/legal/cookies.tsx"),
  ]),
  route("login", "routes/auth/login.tsx"),
  route("register", "routes/auth/register.tsx"),
] satisfies RouteConfig;
