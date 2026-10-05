import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let connectionPromise;

export async function connectDB() {
  if (mongoose.connection.readyState === 1) return true;
  if (connectionPromise) return connectionPromise;

  const uri = process.env.MONGODB_URI?.trim();
  if (!uri || uri.startsWith("replace-with-")) {
    throw new Error("MONGODB_URI must be set to a valid MongoDB connection string.");
  }

  if (/[<>]/.test(uri)) {
    throw new Error("MONGODB_URI still contains placeholder brackets. Replace the placeholder with the real MongoDB credential without < or > characters.");
  }

  let parsedUri;
  try {
    parsedUri = new URL(uri);
  } catch {
    throw new Error("MONGODB_URI is malformed. Check the connection string and URL-encode special characters in credentials.");
  }

  if (
    !["mongodb:", "mongodb+srv:"].includes(parsedUri.protocol) ||
    !parsedUri.hostname ||
    /\s/.test(uri)
  ) {
    throw new Error("MONGODB_URI is invalid. Use a mongodb:// or mongodb+srv:// connection string without spaces.");
  }

  const authority = uri.slice(uri.indexOf("://") + 3).split(/[/?#]/, 1)[0];
  if ((authority.match(/@/g) || []).length > 1) {
    throw new Error("MONGODB_URI contains unencoded credential characters. URL-encode reserved characters such as @ in the username or password.");
  }

  connectionPromise = mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    autoIndex: true
  }).then((conn) => {
    console.log(`[Database] MongoDB connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  }).catch((error) => {
    throw new Error(`MongoDB connection failed (${error.name}). Check network access, credentials, and database name.`);
  }).finally(() => {
    connectionPromise = undefined;
  });

  return connectionPromise;
}

export function isDbConnected() {
  const connected = mongoose.connection.readyState === 1;
  if (process.env.MONGODB_URI?.trim() && !connected) {
    throw new Error("MongoDB is configured but not connected; refusing to use local JSON fallback data.");
  }
  return connected;
}

export default connectDB;
