import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Default to local backend for dev; use remote only when explicitly set to false
  const useRemoteBackend = env.VITE_USE_LOCAL_BACKEND === "false";
  const apiTarget = useRemoteBackend
    ? "https://194-146-38-237.cloud-xip.com"
    : "http://localhost:3000";

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
