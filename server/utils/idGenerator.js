import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { isDbConnected } from "../config/db.js";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const COUNTERS_FILE = path.join(__dirname, "..", "data", "counters.json");

// Mongoose Counter Schema definition for native MongoDB mode
const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

let MongoCounter;
try {
  MongoCounter = mongoose.model("Counter", CounterSchema);
} catch {
  MongoCounter = mongoose.models.Counter;
}

// Atomic local counter helper
let sequenceLock = Promise.resolve();

async function getNextLocalSequence(key) {
  return new Promise((resolve, reject) => {
    sequenceLock = sequenceLock.then(async () => {
      try {
        let counters = {};
        try {
          const raw = await fs.readFile(COUNTERS_FILE, "utf-8");
          counters = JSON.parse(raw);
        } catch {
          counters = {};
        }

        const currentSeq = counters[key] || 0;
        const nextSeq = currentSeq + 1;
        counters[key] = nextSeq;

        await fs.writeFile(COUNTERS_FILE, JSON.stringify(counters, null, 2), "utf-8");
        resolve(nextSeq);
      } catch (err) {
        reject(err);
      }
    });
  });
}

// Generate Next Student ID: HUN-S-YYYY-XXXX (e.g. HUN-S-2026-0001)
export async function generateStudentId(enrollmentDate = new Date()) {
  const dateObj = new Date(enrollmentDate);
  const year = isNaN(dateObj.getFullYear()) ? new Date().getFullYear() : dateObj.getFullYear();
  const counterKey = `student_${year}`;

  let minSeq = 0;
  try {
    const raw = await fs.readFile(COUNTERS_FILE, "utf-8");
    const json = JSON.parse(raw);
    if (json[counterKey]) minSeq = json[counterKey];
  } catch {}

  let nextSeq = minSeq + 1;

  if (isDbConnected()) {
    try {
      const res = await MongoCounter.findByIdAndUpdate(
        counterKey,
        { $inc: { seq: 1 } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      if (res.seq <= minSeq) {
        res.seq = minSeq + 1;
        await res.save();
      }
      nextSeq = res.seq;
    } catch (err) {
      console.warn("[ID Generator] Falling back to local sequence counter:", err.message);
      nextSeq = await getNextLocalSequence(counterKey);
    }
  } else {
    nextSeq = await getNextLocalSequence(counterKey);
  }

  const paddedSeq = String(nextSeq).padStart(4, "0");
  return `HUN-S-${year}-${paddedSeq}`;
}

// Generate Next Staff ID: HUN-T-XXXX (e.g. HUN-T-0001)
export async function generateStaffId() {
  const counterKey = "staff_id";
  let minSeq = 3;
  try {
    const raw = await fs.readFile(COUNTERS_FILE, "utf-8");
    const json = JSON.parse(raw);
    if (json[counterKey]) minSeq = json[counterKey];
  } catch {}

  let nextSeq = minSeq + 1;

  if (isDbConnected()) {
    try {
      const res = await MongoCounter.findByIdAndUpdate(
        counterKey,
        { $inc: { seq: 1 } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      if (res.seq <= minSeq) {
        res.seq = minSeq + 1;
        await res.save();
      }
      nextSeq = res.seq;
    } catch (err) {
      console.warn("[ID Generator] Falling back to local sequence counter:", err.message);
      nextSeq = await getNextLocalSequence(counterKey);
    }
  } else {
    nextSeq = await getNextLocalSequence(counterKey);
  }

  const paddedSeq = String(nextSeq).padStart(4, "0");
  return `HUN-T-${paddedSeq}`;
}
