import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: "0.0.0.0",
    watch: {
      usePolling: true,
      interval: 100,
    },
  },
  preview: {
    port: 4173,
    host: "0.0.0.0",
  },
  define: {
    __API_URL__: JSON.stringify(
      process.env.VITE_API_URL || "http://localhost:5000"
    ),
  },
});

