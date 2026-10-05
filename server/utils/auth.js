import "dotenv/config";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.startsWith("replace-with-")) {
  throw new Error("Set JWT_SECRET to a private, unique value in the environment.");
}
const JWT_EXPIRES_IN = "7d";

// Hash a password securely with salt rounds
export async function hashPassword(plainPassword) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
}

// Compare password with stored hash
export async function comparePassword(plainPassword, passwordHash) {
  return bcrypt.compare(plainPassword, passwordHash);
}

// Sign JWT token for authenticated session
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Generate single-use cryptographically secure invitation token and its SHA-256 hash
export function generateInvitationToken() {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  // Default expiry: 72 hours
  const expiryHours = parseInt(process.env.INVITATION_EXPIRY_HOURS || "72", 10);
  const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

  return {
    rawToken,
    tokenHash,
    expiresAt
  };
}

// Hash a token for safe database storage
export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
