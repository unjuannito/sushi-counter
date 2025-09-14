import type { Config } from "@react-router/dev/config";

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
  basename: "/sushi-counter/", // 👈 ¡ESTO ES LO QUE FALTABA!
  ssr: false,
} satisfies Config;
