import app from "./server.js";
import { connectDB } from "./config/db.js";
import { bootstrapSystem } from "./bootstrap.js";

let bootstrapPromise;

async function initialize() {
  await connectDB();

  if (!bootstrapPromise) {
    bootstrapPromise = bootstrapSystem().catch((error) => {
      bootstrapPromise = undefined;
      throw error;
    });
  }

  await bootstrapPromise;
}

export default async function handler(req, res) {
  try {
    await initialize();
    return app(req, res);
  } catch (error) {
    console.error("[Hunar API] Request initialization failed:", error);
    return res.status(503).json({
      success: false,
      message: "The application backend is temporarily unavailable."
    });
  }
}
