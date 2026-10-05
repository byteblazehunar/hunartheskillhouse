import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import { bootstrapSystem } from "./bootstrap.js";
import apiRouter from "./apiRouter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup with explicit origin support
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Router
app.use("/api", apiRouter);

// Serve admin static build if accessed directly through Node server
const adminDistPath = path.join(__dirname, "..", "public", "admin");
app.use("/admin", express.static(adminDistPath));
app.get("/admin/*", (req, res) => {
  res.sendFile(path.join(adminDistPath, "index.html"));
});

async function start() {
  await connectDB();
  await bootstrapSystem();
  app.listen(PORT, () => {
    console.log(`[Hunar Server] Running on http://localhost:${PORT}`);
    console.log(`[Hunar Server] API endpoints active at http://localhost:${PORT}/api/`);
    console.log(`[Hunar Server] Admin Control Center available at http://localhost:${PORT}/admin/`);
  });
}

start();
