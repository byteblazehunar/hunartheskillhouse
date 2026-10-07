import mongoose from "mongoose";
import { hashPassword } from "./utils/auth.js";
import { updateUser, findUserByEmailOrId } from "./services/dataService.js";
import { connectDB } from "./config/db.js";

function promptHidden(prompt) {
  return new Promise((resolve, reject) => {
    const input = process.stdin;
    if (!input.isTTY || typeof input.setRawMode !== "function") {
      reject(new Error("Run this command in an interactive terminal so the password can be hidden."));
      return;
    }

    process.stdout.write(prompt);
    input.setRawMode(true);
    input.resume();
    const characters = [];
    const cleanup = () => {
      input.removeListener("data", onData);
      input.setRawMode(false);
      input.pause();
    };
    const onData = (chunk) => {
      for (const character of chunk) {
        if (character === "\u0003") {
          cleanup();
          process.stdout.write("\n");
          reject(new Error("Password reset cancelled."));
          return;
        }
        if (character === "\r" || character === "\n") {
          cleanup();
          process.stdout.write("\n");
          resolve(characters.join(""));
          return;
        }
        if (character === "\u007f" || character === "\b") {
          characters.pop();
        } else if (character >= " ") {
          characters.push(character);
        }
      }
    };
    input.on("data", onData);
  });
}

async function resetPassword() {
  const newPassword = await promptHidden("New admin password (8-128 characters): ");
  if (newPassword.length < 8 || newPassword.length > 128) {
    throw new Error("Password must be between 8 and 128 characters.");
  }

  const confirmation = await promptHidden("Confirm new admin password: ");
  if (confirmation !== newPassword) {
    throw new Error("Passwords do not match.");
  }

  try {
    await connectDB();
    const admin = await findUserByEmailOrId("admin@hunarskillhouse.com");
    if (!admin) {
      throw new Error("Admin user not found.");
    }
    const passwordHash = await hashPassword(newPassword);
    await updateUser(admin._id || admin.id || "HUN-A-0001", { passwordHash });
    console.log("Admin password successfully updated.");
  } finally {
    await mongoose.disconnect();
  }
}

resetPassword().catch((error) => {
  console.error("Admin password reset failed:", error.message);
  process.exitCode = 1;
});
