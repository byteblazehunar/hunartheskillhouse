import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let isConnected = false;

export async function connectDB() {
  if (isConnected) return true;

  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/hunar_db";

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500
    });
    isConnected = true;
    console.log(`[Database] MongoDB connected successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`[Database Notice] MongoDB connection failed: ${error.message}`);
    console.warn(`[Database Notice] Active Fallback: Hybrid in-memory & JSON persistence mode enabled.`);
    console.warn(`[Database Notice] To enable native MongoDB, start your local mongod service or update MONGODB_URI in .env.`);
    isConnected = false;
    return false;
  }
}

export function isDbConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

export default connectDB;
