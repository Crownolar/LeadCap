import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      "/api": {
        target: "https://api.leadcap.ng",
        changeOrigin: true,
        secure: false,
      },
    },
  },

  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.js",
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Keep only genuinely independent/heavy libraries separated.
          "vendor-pdf": ["jspdf"],
          "vendor-excel": ["xlsx"],
          "vendor-html2canvas": ["html2canvas"],
        },
      },
    },

    chunkSizeWarningLimit: 700,
  },
});