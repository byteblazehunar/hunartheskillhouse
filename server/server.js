import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import { bootstrapSystem } from "./bootstrap.js";
import apiRouter from "./apiRouter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 5000;
if (process.env.VERCEL === "1") app.set("trust proxy", 1);
const allowedOrigins = new Set(
  (process.env.ALLOWED_ORIGINS || "https://hunar.courses,https://www.hunar.courses")
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean)
);
const clientDistPath = path.join(__dirname, "..", "dist");
const clientEntryPath = path.join(clientDistPath, "index.html");

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    hsts: process.env.NODE_ENV === "production"
  })
);

app.use(
  cors({
    origin: (origin, callback) => callback(null, !origin || allowedOrigins.has(origin))
  })
);

app.use(express.json({ limit: "32kb" }));
app.use(express.urlencoded({ extended: true, limit: "32kb" }));

// API Router
app.use("/api", apiRouter);
app.use("/api", (_req, res) => {
  res.status(404).json({ success: false, message: "API endpoint not found." });
});

app.use(express.static(clientDistPath));
app.use((req, res, next) => {
  if ((req.method !== "GET" && req.method !== "HEAD") || !req.accepts("html")) {
    return next();
  }
  if (req.path.startsWith("/activate/")) {
    if (!existsSync(clientEntryPath)) {
      return res.status(503).type("text").send("Frontend build not found. Run npm run build before starting the server.");
    }
    return res.sendFile(clientEntryPath);
  }
  if (!existsSync(clientEntryPath)) {
    return res.status(503).type("text").send("Frontend build not found. Run npm run build before starting the server.");
  }
  next();
});
app.use((req, res) => {
  if (req.accepts("html")) {
    const notFoundPagePath = path.join(clientDistPath, "404.html");
    if (existsSync(notFoundPagePath)) {
      return res.status(404).sendFile(notFoundPagePath, (error) => {
        if (error && !res.headersSent) res.status(404).type("text").send("Page not found.");
      });
    }
    return res.status(404).sendFile(clientEntryPath, (error) => {
      if (error && !res.headersSent) res.status(404).type("text").send("Page not found.");
    });
  }
  res.status(404).json({ success: false, message: "Route not found." });
});
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.type === "entity.too.large") {
    return res.status(413).json({ success: false, message: "Request body is too large." });
  }
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "Request body contains invalid JSON." });
  }
  console.error("[Request Error]:", error);
  res.status(500).json({ success: false, message: "Internal server error." });
});

export async function startServer() {
  await connectDB();
  await bootstrapSystem();
  app.listen(PORT, "0.0.0.0", () => {
    console.log("[Hunar Server] Live site: https://hunar.courses");
    console.log("[Hunar Server] API endpoints active at https://hunar.courses/api/");
    console.log("[Hunar Server] Admin and LMS available at https://hunar.courses/");
  });
}

export default app;

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  startServer().catch((error) => {
    console.error("[Hunar Server] Startup failed:", error);
    process.exitCode = 1;
  });
}
