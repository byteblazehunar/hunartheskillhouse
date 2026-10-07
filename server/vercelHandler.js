import app from "./server.js";
import { connectDB } from "./config/db.js";
import { bootstrapSystem } from "./bootstrap.js";

let bootstrapPromise;

async function initialize() {
  try {
    await connectDB();
  } catch (error) {
    return {
      code: process.env.MONGODB_URI?.trim()
        ? "DATABASE_CONNECTION_FAILED"
        : "DATABASE_CONFIGURATION_MISSING",
      stage: "MongoDB connection",
      error
    };
  }

  if (!bootstrapPromise) {
    bootstrapPromise = bootstrapSystem().catch((error) => {
      bootstrapPromise = undefined;
      return {
        code: "APPLICATION_BOOTSTRAP_FAILED",
        stage: "application bootstrap",
        error
      };
    });
  }

  return bootstrapPromise;
}

export default async function handler(req, res) {
  const failure = await initialize();
  if (failure) {
    console.error(`[Hunar API] ${failure.stage} failed:`, failure.error);
    return res.status(503).json({
      success: false,
      error: failure.code,
      message: failure.code === "DATABASE_CONFIGURATION_MISSING"
        ? "The database connection is not configured in this Vercel environment."
        : failure.code === "DATABASE_CONNECTION_FAILED"
          ? "The database could not be reached. Check the Production database URI, credentials, and Atlas network access."
          : "The application could not initialize its database records."
    });
  }

  return app(req, res);
}
