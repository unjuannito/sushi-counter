import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const frontendDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(frontendDir, "..");

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, projectRoot, "");
  const googleClientId = process.env.GOOGLE_CLIENT_ID || env.GOOGLE_CLIENT_ID || "";

  return {
    envDir: projectRoot,
    define: {
      "import.meta.env.VITE_GOOGLE_CLIENT_ID": JSON.stringify(googleClientId),
    },
    base: '/',
    plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
    server: {
      host: true,
      port: 5173,
      headers: {
        "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
      },
      proxy: {
        "/api": {
          target: "http://192.168.1.200:4000/api",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
