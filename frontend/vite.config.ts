import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");

  return {
    plugins: [react()],
    server: {
      port: Number(env.VITE_DEV_SERVER_PORT ?? 5173),
      open: true,
    },
    preview: {
      port: Number(env.VITE_PREVIEW_SERVER_PORT ?? 4173),
    },
    css: {
      devSourcemap: true,
    },
  };
});
