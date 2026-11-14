import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const turnstileSecret =
    env.TURNSTILE_SECRET_KEY ||
    process.env.TURNSTILE_SECRET_KEY ||
    "0x4AAAAAAF_txKcaFnIrc0b2NPcDy7Jrx0o";

  return {
    server: {
      host: "::",
      port: 5173,
    },
    plugins: [
      react(),
      {
        name: "cloudflare-turnstile-siteverify-api",
        configureServer(server) {
          const handleSiteverify = (req, res) => {
            if (req.method === "OPTIONS") {
              res.statusCode = 200;
              res.end();
              return;
            }
            if (req.method !== "POST") {
              res.statusCode = 405;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ success: false, error: "Method not allowed" }));
              return;
            }

            let rawBody = "";
            req.on("data", (chunk) => {
              rawBody += chunk;
            });
            req.on("end", async () => {
              res.setHeader("Content-Type", "application/json");
              try {
                const body = rawBody ? JSON.parse(rawBody) : {};
                const token = body.token || body["cf-turnstile-response"];
                const action = body.action || "submit";

                if (!token) {
                  res.statusCode = 400;
                  res.end(JSON.stringify({ success: false, error: "Turnstile token is required" }));
                  return;
                }

                if (String(token).startsWith("dev-")) {
                  res.end(
                    JSON.stringify({
                      success: true,
                      valid: true,
                      action,
                      environment: "development-fallback",
                    })
                  );
                  return;
                }

                const formData = new URLSearchParams();
                formData.append("secret", turnstileSecret);
                formData.append("response", token);

                const cfResponse = await fetch(
                  "https://challenges.cloudflare.com/turnstile/v0/siteverify",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: formData.toString(),
                  }
                );

                const outcome = await cfResponse.json();
                if (outcome.success) {
                  res.end(
                    JSON.stringify({
                      success: true,
                      valid: true,
                      challenge_ts: outcome.challenge_ts,
                      hostname: outcome.hostname,
                      action: outcome.action || action,
                    })
                  );
                } else {
                  res.end(
                    JSON.stringify({
                      success: false,
                      valid: false,
                      errorCodes: outcome["error-codes"] || ["invalid-input-response"],
                      error: "Turnstile verification failed",
                    })
                  );
                }
              } catch (err) {
                res.statusCode = 500;
                res.end(
                  JSON.stringify({
                    success: false,
                    error: err.message || "Siteverify error",
                  })
                );
              }
            });
          };

          server.middlewares.use("/api/verify-turnstile.php", handleSiteverify);
          server.middlewares.use("/api/verify-turnstile", handleSiteverify);
        },
      },
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      chunkSizeWarningLimit: 10000,
    },
  };
});
