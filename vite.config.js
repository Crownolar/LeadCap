import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://194-146-38-237.cloud-xip.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
