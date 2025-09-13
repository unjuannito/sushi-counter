import { type RouteConfig, index, layout, route} from "@react-router/dev/routes";

export default [  layout("routes/_layout.tsx", [
    index("routes/index.tsx"),
    // route("actividades", "routes/actividades.tsx"),
    // ...other non-area-socios routes
  ]),
//   route("area-socios/login", "routes/area-socios/login.tsx"),
] satisfies RouteConfig;
