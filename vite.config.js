import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

function apiDevServerPlugin() {
  return {
    name: "vite-plugin-trender-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const urlStr = req.url || "";
        if (!urlStr.startsWith("/api/")) return next();

        try {
          const parsedUrl = new URL(urlStr, "http://localhost:5173");
          req.query = Object.fromEntries(parsedUrl.searchParams.entries());

          if (["POST", "PUT", "PATCH"].includes(req.method)) {
            const chunks = [];
            for await (const chunk of req) {
              chunks.push(chunk);
            }
            const bodyStr = Buffer.concat(chunks).toString("utf8");
            try {
              req.body = bodyStr ? JSON.parse(bodyStr) : {};
            } catch {
              req.body = {};
            }
          } else {
            req.body = {};
          }

          res.status = function (code) {
            res.statusCode = code;
            return res;
          };
          res.json = function (payload) {
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(payload));
            return res;
          };

          const pathname = parsedUrl.pathname;
          if (pathname === "/api/geo") {
            const mod = await import("./api/geo.js");
            return mod.default(req, res);
          }
          if (pathname === "/api/market") {
            const mod = await import("./api/market.js");
            return mod.default(req, res);
          }
          if (pathname === "/api/research") {
            const mod = await import("./api/research.js");
            return mod.default(req, res);
          }
          if (pathname === "/api/trends") {
            const mod = await import("./api/trends.js");
            return mod.default(req, res);
          }
          if (pathname === "/api/chat" || pathname === "/api/openrouter") {
            const mod = await import("./api/chat.js");
            return mod.default(req, res);
          }

          next();
        } catch (error) {
          console.error("Vite Dev API Server Error:", error);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: error.message || "Dev API Server Error" }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  Object.assign(process.env, env);

  return {
    plugins: [react(), apiDevServerPlugin()],
    server: { port: 5173 },
  };
});
