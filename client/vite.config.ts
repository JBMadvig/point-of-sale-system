import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import basicSsl from "@vitejs/plugin-basic-ssl";

export default defineConfig({
  plugins: [react(), tailwindcss(), basicSsl()],
  server: {
    host: "0.0.0.0",
    port: 4200,
    https: {},                     // basic-ssl plugin populates this
    watch: { usePolling: true },   // for Docker bind mounts (replaces CHOKIDAR_USEPOLLING)
    proxy: {
      "/api": {
        target: "http://server:9001",
        changeOrigin: true,
        secure: false,
      },
      "/ws": {
        target: "http://server:9001",
        changeOrigin: true,
        ws: true,
      },
    },
  },
});