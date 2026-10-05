import { hashPassword } from "./utils/auth.js";
import { Role, User } from "./models/index.js";
import { createUser } from "./services/dataService.js";
import { isDbConnected } from "./config/db.js";
import { ROLE_TEMPLATES } from "./constants/permissions.js";

const SYSTEM_ROLE_IDS = {
  "template-receptionist": "role-receptionist",
  "template-admissions-coordinator": "role-admissions-coordinator",
  "template-course-coordinator": "role-course-coordinator",
  "template-teacher": "role-teacher",
  "template-accountant": "role-accountant",
  "template-office-administrator": "role-office-administrator",
  "template-super-admin": "role-super-admin"
};

export async function bootstrapSystem() {
  if (!isDbConnected()) {
    throw new Error("MongoDB must be connected before initializing the application.");
  }

  for (const template of ROLE_TEMPLATES) {
    await Role.updateOne(
      { roleId: SYSTEM_ROLE_IDS[template.id] },
      {
        $setOnInsert: {
          roleId: SYSTEM_ROLE_IDS[template.id],
          name: template.name,
          department: template.department || "Administration",
          description: template.description,
          permissions: template.suggestedPermissions,
          status: "active",
          isSystem: template.isSystem === true,
          createdBy: "System"
        }
      },
      { upsert: true }
    );
  }

  const existingAdmin = await User.exists({ role: "admin" });
  if (existingAdmin) return;

  const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
  const name = process.env.INITIAL_ADMIN_NAME?.trim();
  const password = process.env.INITIAL_ADMIN_PASSWORD;

  if (!email && !name && !password) {
    console.warn("[Bootstrap] No admin account exists. Set INITIAL_ADMIN_EMAIL, INITIAL_ADMIN_NAME, and INITIAL_ADMIN_PASSWORD to create one.");
    return;
  }

  if (!email || !name || !password || password.startsWith("replace-with-")) {
    throw new Error("Create the initial admin by setting INITIAL_ADMIN_EMAIL, INITIAL_ADMIN_NAME, and INITIAL_ADMIN_PASSWORD.");
  }

  const passwordHash = await hashPassword(password);
  await createUser({
    name,
    email,
    role: "admin",
    assignedId: "HUN-A-0001",
    status: "active",
    passwordHash
  });

  console.log("[Bootstrap] Initial admin account created from private environment settings.");
}
