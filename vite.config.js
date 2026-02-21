import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const useLocalBackend = env.VITE_USE_LOCAL_BACKEND === "true";
  const apiTarget = useLocalBackend
    ? "http://localhost:3000"
    : "https://194-146-38-237.cloud-xip.com";

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
