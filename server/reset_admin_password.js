import { hashPassword } from "./utils/auth.js";
import { updateUser, findUserByEmailOrId } from "./services/dataService.js";
import { connectDB } from "./config/db.js";

const newPassword = process.argv[2];

if (!newPassword) {
  console.error("❌ Provide the new password as a command-line argument.");
  process.exit(1);
}

async function resetPassword() {
  try {
    await connectDB();
    const admin = await findUserByEmailOrId("admin@hunarskillhouse.com");
    if (!admin) {
      console.error("❌ Admin user not found.");
      process.exit(1);
    }
    const passwordHash = await hashPassword(newPassword);
    await updateUser(admin._id || admin.id || "HUN-A-0001", { passwordHash });
    console.log("✅ Admin password successfully updated.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error resetting password:", error.message);
    process.exit(1);
  }
}

resetPassword();
