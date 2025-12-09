import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
<<<<<<< HEAD
        target: "https://194-146-38-237.cloud-xip.com",
=======
        target: "http://localhost:3000",
>>>>>>> 1c72dea739c8c211494b3966c6afe8780381b982
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
