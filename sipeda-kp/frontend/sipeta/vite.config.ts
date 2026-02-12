import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        // This will transform your SVG to a React component
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  server: {
    host: true, // Listen on all local IPs
    port: 5173,
    allowedHosts: [
      "delmer-globelike-tetanically.ngrok-free.dev",
      ".trycloudflare.com"
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:5055',
        changeOrigin: true,
        secure: false,
      }
    },
    watch: {
      usePolling: true, // Fix for Windows Docker hot reload
    }
  }
});
