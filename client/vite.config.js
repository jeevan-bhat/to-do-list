// ------------------------------------------------------------------
// vite.config.js
// ------------------------------------------------------------------
// Configuration for Vite, the build tool / dev server for the React app.
//
// The important part is the "proxy": during development the React app
// runs on http://localhost:5173 while the Express API runs on :5000.
// Browsers block cross-origin requests, so we tell Vite to forward any
// request that starts with "/api" to the backend server. This lets the
// frontend simply call fetch("/api/notes") without worrying about ports.
// ------------------------------------------------------------------

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
