import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 5173,
  },
  plugins: [
    react(),
    {
      name: "mock-turnstile-api",
      configureServer(server) {
        const handleMock = (req, res) => {
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              success: true,
              valid: true,
              environment: "local-dev",
              message: "Local development Turnstile verification simulated successfully"
            })
          );
        };
        server.middlewares.use("/api/verify-turnstile", handleMock);
        server.middlewares.use("/api/verify-recaptcha", handleMock);
      }
    }
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 10000,
  }
});
