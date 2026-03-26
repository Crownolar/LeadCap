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
    environment: "jsdom",   // simulate browser
    globals: true,          // so you can use test(), expect() directly
    setupFiles: "./src/test/setup.js"
  },

});


