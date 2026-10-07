import express from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { rateLimit } from "express-rate-limit";
import {
  findUserByEmailOrId,
  findUserById,
  findUserByInvitationTokenHash,
  consumeInvitationToken,
  createUser,
  updateUser,
  deleteUser,
  getAllUsers,
  getAllStudents,
  getStudentByStudentId,
  getStudentByEmail,
  createStudent,
  updateStudent,
  deleteStudent,
  getAllStaff,
  getStaffByStaffId,
  getStaffByEmail,
  createStaff,
  updateStaff,
  deleteStaff,
  getAllCourses,
  getAllBatches,
  createBatch,
  updateBatch,
  deleteBatch,
  getAttendanceByBatchAndDate,
  getStudentAttendance,
  recordAttendance,
  getAllAssignments,
  createAssignment,
  getSubmissionsForStudent,
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  logAction,
  getAuditLogs,
  createCourse,
  updateCourse,
  deleteCourse,
  getTimetable,
  createTimetableItem,
  updateTimetableItem,
  deleteTimetableItem,
  getFeeRecords,
  createOrUpdateFeeRecord,
  deleteFeeRecord,
  getAllLeads,
  createLead,
  updateLead,
  deleteLead,
  getAllSubmissions,
  gradeSubmission,
  getAllRoles,
  getRoleById,
  getRoleByName,
  createRole,
  updateRole,
  deleteRole,
  getStaffAssignedToRole,
  getStaffCountForRole,
  reassignStaffRole
} from "./services/dataService.js";
import {
  hashPassword,
  comparePassword,
  signToken,
  generateInvitationToken,
  hashToken
} from "./utils/auth.js";
import { generateStudentId, generateStaffId } from "./utils/idGenerator.js";
import {
  authenticate,
  requireRole,
  requirePermission,
  enforceStudentAccess,
  resolveUserPermissions
} from "./middleware/authMiddleware.js";
import {
  PERMISSION_CATEGORIES,
  ROLE_TEMPLATES,
  ALL_PERMISSION_KEYS
} from "./constants/permissions.js";
import { isDbConnected } from "./config/db.js";
import { buildFrontendUrl, sendEmail } from "./services/emailService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "data");

const router = express.Router();
const rateLimitResponse = {
  success: false,
  error: "RATE_LIMITED",
  message: "Too many requests. Please wait before trying again."
};

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 240,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: rateLimitResponse
});
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: rateLimitResponse
});
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: rateLimitResponse
});
const activationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: rateLimitResponse
});
const inquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: rateLimitResponse
});

router.use(apiLimiter);

async function sendActivationEmail(user, rawToken, subject, purpose) {
  const activationUrl = buildFrontendUrl(`/activate/${encodeURIComponent(rawToken)}`);
  try {
    await sendEmail({
      to: user.email,
      subject,
      text: [
        `Hello ${user.name},`,
        "",
        `Use this secure link to ${purpose} your Hunar portal account:`,
        activationUrl,
        "",
        `This link expires in ${process.env.INVITATION_EXPIRY_HOURS || 72} hours.`,
        "If you were not expecting this email, please contact the institute."
      ].join("\n")
    });
    return { activationUrl, emailSent: true };
  } catch (error) {
    console.error("[Account Email Error]:", error.message);
    return { activationUrl, emailSent: false };
  }
}

// Helper to safely read settings
async function readSettings() {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, "settings.json"), "utf-8");
    return JSON.parse(raw);
  } catch {
    return {
      instituteName: "HUNAR — The Skill House",
      phone: "+91 94637 95116",
      announcementActive: false,
      announcementText: ""
    };
  }
}

// ══════════════════════════════════════════════
// 1. HEALTH & SYSTEM DIAGNOSTICS
// ══════════════════════════════════════════════
router.get("/health", (req, res) => {
  let databaseConnected = false;
  try {
    databaseConnected = isDbConnected();
  } catch (error) {
    console.error("[Health Check] MongoDB is not ready:", error.message);
  }

  const health = {
    status: databaseConnected ? "ok" : "unavailable",
    service: "Hunar Institute Management Core",
    version: "2.0.0",
    database: databaseConnected ? "connected" : "disconnected",
    time: new Date().toISOString()
  };

  res.status(databaseConnected ? 200 : 503).json(health);
});

// ══════════════════════════════════════════════
// 2. AUTHENTICATION & SESSIONS
// ══════════════════════════════════════════════

// POST /api/auth/login - Supports Canonical Login ID (HUN-S-XXXX, HUN-T-XXXX, HUN-A-XXXX) or Email
router.post("/auth/login", loginLimiter, async (req, res) => {
  try {
    const body = req.body || {};
    const rawIdentifier = body.loginId || body.identifier || body.email || "";
    const identifier = String(rawIdentifier).trim();
    const password = typeof body.password === "string" ? body.password : "";

    if (!identifier || !password || identifier.length > 254 || password.length > 128) {
      return res.status(400).json({
        success: false,
        error: "MISSING_CREDENTIALS",
        message: "Enter a valid Login ID or email and a password of at most 128 characters."
      });
    }

    const user = await findUserByEmailOrId(identifier);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "INVALID_CREDENTIALS",
        message: "Invalid Login ID or password."
      });
    }

    if (user.status === "suspended" || user.status === "pending_activation" || !user.passwordHash) {
      return res.status(401).json({
        success: false,
        error: "INVALID_CREDENTIALS",
        message: "Invalid Login ID or password."
      });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "INVALID_CREDENTIALS",
        message: "Invalid Login ID or password."
      });
    }

    const canonicalLoginId = user.loginId || user.assignedId || "";

    // Update last login
    await updateUser(user._id || user.id, { lastLogin: new Date().toISOString() });

    // Generate JWT token with canonical loginId
    const token = signToken({
      id: user._id || user.id,
      role: user.role,
      assignedId: canonicalLoginId,
      loginId: canonicalLoginId
    });

    const roleData = await resolveUserPermissions(user);

    await logAction(user.name, user.role, "USER_LOGIN", "User", canonicalLoginId || user.email);

    res.json({
      success: true,
      message: "Login successful. Redirecting...",
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        loginId: canonicalLoginId,
        assignedId: canonicalLoginId,
        role: user.role,
        roleId: roleData.roleId,
        roleName: roleData.roleName,
        isSuperAdmin: roleData.isSuperAdmin,
        permissions: roleData.permissions,
        status: user.status
      }
    });
  } catch (error) {
    console.error("[Login Error]:", error);
    res.status(500).json({ success: false, message: "Authentication service error. Please try again." });
  }
});

// GET /api/auth/verify-invitation/:token - Inspect invitation token and retrieve user Login ID
router.get("/auth/verify-invitation/:token", activationLimiter, async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({
        success: false,
        valid: false,
        error: "MISSING_TOKEN",
        message: "Activation token is required."
      });
    }

    const tokenHash = hashToken(token);
    const user = await findUserByInvitationTokenHash(tokenHash);

    if (!user) {
      return res.status(400).json({
        success: false,
        valid: false,
        error: "INVALID_OR_EXPIRED_TOKEN",
        message: "This invitation link is invalid or has expired. Please contact administration for a new activation link."
      });
    }

    const canonicalLoginId = user.loginId || user.assignedId || "";
    const portalName =
      user.role === "student"
        ? "Student Portal"
        : user.role === "teacher"
        ? "Faculty Portal"
        : user.role === "admin"
        ? "Admin Portal"
        : "Operations Portal";

    res.json({
      success: true,
      valid: true,
      user: {
        name: user.name,
        email: user.email,
        loginId: canonicalLoginId,
        role: user.role,
        roleName: user.customRoleName || user.role,
        portalName
      }
    });
  } catch (error) {
    console.error("[Verify Invitation Error]:", error);
    res.status(500).json({ success: false, message: "Error verifying invitation token." });
  }
});

// GET /api/auth/me - Retrieve authenticated profile
router.get("/auth/me", authenticate, async (req, res) => {
  try {
    let studentInfo = null;
    let staffInfo = null;
    const lookupId = req.user.loginId || req.user.assignedId;

    if (req.user.role === "student" && lookupId) {
      studentInfo = await getStudentByStudentId(lookupId);
    } else if (lookupId) {
      staffInfo = await getStaffByStaffId(lookupId);
    }

    res.json({
      success: true,
      user: {
        ...req.user,
        loginId: lookupId,
        assignedId: lookupId
      },
      student: studentInfo,
      staff: staffInfo
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching user profile." });
  }
});

// POST /api/auth/activate - Activate invited account & set personal password
router.post("/auth/activate", activationLimiter, async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body || {};
    if (
      typeof token !== "string" ||
      !token ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        error: "MISSING_FIELDS",
        message: "Token and password are required."
      });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "PASSWORD_MISMATCH",
        message: "Passwords do not match. Please re-type carefully."
      });
    }

    // Strict Password Policy: Min 8 chars, 1 uppercase, 1 lowercase, 1 number
    if (
      password.length < 8 ||
      password.length > 128 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      return res.status(400).json({
        success: false,
        error: "WEAK_PASSWORD",
        message: "Password must be 8 to 128 characters long and contain at least one uppercase letter, one lowercase letter, and one number."
      });
    }

    const tokenHash = hashToken(token);
    const user = await findUserByInvitationTokenHash(tokenHash);

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "INVALID_OR_EXPIRED_TOKEN",
        message: "This invitation link is invalid or has expired. Please request a new invitation from administration."
      });
    }

    const canonicalLoginId = user.loginId || user.assignedId || "";
    const passwordHash = await hashPassword(password);

    // Atomically activate User record in MongoDB and fallback storage
    const activatedUser = await consumeInvitationToken(tokenHash, {
      passwordHash,
      status: "active",
      passwordSet: true,
      isActive: true
    });
    if (!activatedUser) {
      return res.status(400).json({
        success: false,
        error: "INVALID_OR_EXPIRED_TOKEN",
        message: "This invitation link is invalid, expired, or has already been used. Please request a new invitation."
      });
    }

    // If student, update student status as well
    if (user.role === "student" && canonicalLoginId) {
      await updateStudent(canonicalLoginId, { enrollmentStatus: "active" });
    }

    // If staff, update staff employment status as well
    if (user.role !== "student" && canonicalLoginId) {
      await updateStaff(canonicalLoginId, { employmentStatus: "active" });
    }

    await logAction(user.name, user.role, "ACCOUNT_ACTIVATED", "User", canonicalLoginId || user.email);

    const portalName =
      user.role === "student"
        ? "Student Portal"
        : user.role === "teacher"
        ? "Faculty Portal"
        : user.role === "admin"
        ? "Admin Portal"
        : "Operations Portal";

    res.json({
      success: true,
      message: "Password created successfully. Your account is ready!",
      user: {
        name: user.name,
        email: user.email,
        loginId: canonicalLoginId,
        assignedId: canonicalLoginId,
        role: user.role,
        portalName
      }
    });
  } catch (error) {
    console.error("[Activation Error]:", error);
    res.status(500).json({ success: false, message: "Activation service error. Please try again." });
  }
});

// ══════════════════════════════════════════════
// 3. ADMIN DASHBOARD OVERVIEW & METRICS
// ══════════════════════════════════════════════
router.get("/admin/overview", authenticate, requireRole(["admin"]), async (req, res) => {
  try {
    const students = await getAllStudents();
    const staff = await getAllStaff();
    const courses = await getAllCourses();
    const batches = await getAllBatches();
    const recentLogs = await getAuditLogs(10);

    const activeStudents = students.filter((s) => s.enrollmentStatus === "active").length;
    const pendingStudents = students.filter((s) => s.enrollmentStatus === "pending_activation").length;
    const activeStaff = staff.filter((s) => s.employmentStatus === "active").length;

    res.json({
      success: true,
      metrics: {
        totalStudents: students.length,
        activeStudents,
        pendingStudents,
        totalStaff: staff.length,
        activeStaff,
        activeCourses: courses.length,
        activeBatches: batches.length
      },
      recentActivity: recentLogs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error loading dashboard metrics." });
  }
});

// GET /api/admin/users - List all institutional users and assigned IDs
router.get("/admin/users", authenticate, requireRole(["admin"]), async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching system users." });
  }
});

// DELETE /api/admin/users/:id - Delete user account and linked profile
router.delete("/admin/users/:id", authenticate, requireRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    await deleteUser(id);
    await logAction(req.user.name, req.user.role, "DELETE_USER", "User", id, "User account deleted");
    res.json({ success: true, message: "User account deleted successfully." });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || "Error deleting user account." });
  }
});

// PUT /api/admin/users/:id - Update user account details
router.put("/admin/users/:id", authenticate, requireRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, status, password } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (email) {
      updates.email = email.trim();
      updates.normalizedEmail = email.trim().toLowerCase();
    }
    if (phone !== undefined) updates.phone = phone.trim();
    if (role) updates.role = role;
    if (status) updates.status = status;
    if (password && password.trim().length >= 6) {
      updates.passwordHash = await hashPassword(password.trim());
    }

    const updated = await updateUser(id, updates);
    if (!updated) return res.status(404).json({ success: false, message: "User not found." });

    if (updated.assignedId) {
      if (updated.assignedId.startsWith("HUN-S")) {
        await updateStudent(updated.assignedId, { name: updates.name, email: updates.email, phone: updates.phone, enrollmentStatus: updates.status });
      } else if (updated.assignedId.startsWith("HUN-T")) {
        await updateStaff(updated.assignedId, { name: updates.name, email: updates.email, phone: updates.phone, role: updates.role });
      }
    }

    await logAction(req.user.name, req.user.role, "UPDATE_USER", "User", id, "Updated account profile");
    res.json({ success: true, message: "User updated successfully.", user: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating user account." });
  }
});

// ══════════════════════════════════════════════
// 3. ROLES & DUTY MANAGEMENT (RBAC)
// ══════════════════════════════════════════════

// GET /api/roles/permissions/library - Categorized suggested permissions & templates
router.get("/roles/permissions/library", authenticate, (req, res) => {
  res.json({
    success: true,
    categories: PERMISSION_CATEGORIES,
    templates: ROLE_TEMPLATES,
    allKeys: ALL_PERMISSION_KEYS
  });
});

// GET /api/roles - List all roles with staff count and assignment details
router.get(
  "/roles",
  authenticate,
  requirePermission(["admin.roles_view", "admin.roles_assign", "staff.roles_assign"]),
  async (req, res) => {
    try {
      const roles = await getAllRoles();
      const enrichedRoles = await Promise.all(
        roles.map(async (r) => {
          const assignedStaff = await getStaffAssignedToRole(r.roleId, r.name);
          return {
            ...r,
            staffCount: assignedStaff.length,
            assignedStaff: assignedStaff.map((s) => ({
              staffId: s.staffId,
              name: s.name,
              email: s.email,
              designation: s.designation,
              department: s.department
            }))
          };
        })
      );

      res.json({
        success: true,
        roles: enrichedRoles
      });
    } catch (error) {
      console.error("[Get Roles Error]:", error);
      res.status(500).json({ success: false, message: "Error fetching roles list." });
    }
  }
);

// GET /api/roles/:id - Get specific role details
router.get(
  "/roles/:id",
  authenticate,
  requirePermission("admin.roles_view"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const role = await getRoleById(id);
      if (!role) {
        return res.status(404).json({ success: false, message: `Role not found.` });
      }

      const assignedStaff = await getStaffAssignedToRole(role.roleId, role.name);
      res.json({
        success: true,
        role: {
          ...role,
          staffCount: assignedStaff.length,
          assignedStaff: assignedStaff.map((s) => ({
            staffId: s.staffId,
            name: s.name,
            email: s.email,
            designation: s.designation,
            department: s.department
          }))
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error fetching role details." });
    }
  }
);

// POST /api/roles - Create custom role with explicit duties
router.post(
  "/roles",
  authenticate,
  requirePermission("admin.roles_create"),
  async (req, res) => {
    try {
      const { name, description, department, permissions, status } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          error: "MISSING_ROLE_NAME",
          message: "Role name is required."
        });
      }

      const trimmedName = name.trim();
      const existing = await getRoleByName(trimmedName);
      if (existing) {
        return res.status(409).json({
          success: false,
          error: "DUPLICATE_ROLE_NAME",
          message: `A role with the name "${trimmedName}" already exists.`
        });
      }

      const selectedPerms = Array.isArray(permissions) ? permissions : [];

      // Validate permission keys against library
      const invalidKeys = selectedPerms.filter((p) => p !== "*" && !ALL_PERMISSION_KEYS.includes(p));
      if (invalidKeys.length > 0) {
        return res.status(400).json({
          success: false,
          error: "INVALID_PERMISSION_KEYS",
          message: `The following permission keys are unrecognized: ${invalidKeys.join(", ")}`
        });
      }

      // Least privilege: non-super-admin cannot assign wildcard or permissions they don't have
      if (!req.user.isSuperAdmin) {
        const userPerms = req.user.permissions || [];
        const unauthorizedKeys = selectedPerms.filter((p) => p === "*" || !userPerms.includes(p));
        if (unauthorizedKeys.length > 0) {
          return res.status(403).json({
            success: false,
            error: "PRIVILEGE_ESCALATION_DENIED",
            message: `You cannot grant permissions that exceed your own administrative clearance: ${unauthorizedKeys.join(", ")}`
          });
        }
      }

      const newRole = await createRole({
        name: trimmedName,
        description: description ? description.trim() : "",
        department: department ? department.trim() : "General",
        permissions: selectedPerms,
        status: status === "inactive" ? "inactive" : "active",
        isSystem: false,
        createdBy: req.user.name || "Administrator"
      });

      await logAction(
        req.user.name,
        req.user.roleName || req.user.role,
        "CREATE_ROLE",
        "Role",
        newRole.roleId,
        `Created role "${trimmedName}" in department "${newRole.department}" with ${selectedPerms.length} assigned duties.`
      );

      res.status(201).json({
        success: true,
        message: `Role "${trimmedName}" created successfully.`,
        role: {
          ...newRole,
          staffCount: 0,
          assignedStaff: []
        }
      });
    } catch (error) {
      console.error("[Create Role Error]:", error);
      res.status(500).json({ success: false, message: "Error creating role." });
    }
  }
);

// PUT /api/roles/:id - Edit role's name, description, department, and duties
router.put(
  "/roles/:id",
  authenticate,
  requirePermission("admin.roles_edit"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, department, permissions, status } = req.body;

      const existingRole = await getRoleById(id);
      if (!existingRole) {
        return res.status(404).json({ success: false, message: "Role not found." });
      }

      // Protect built-in Super Admin role
      if (existingRole.isSystem || existingRole.roleId === "role-super-admin") {
        if (status === "inactive") {
          return res.status(400).json({
            success: false,
            error: "SUPER_ADMIN_PROTECTED",
            message: "The primary Super Admin role is protected and cannot be deactivated."
          });
        }
        if (permissions && !permissions.includes("*")) {
          return res.status(400).json({
            success: false,
            error: "SUPER_ADMIN_PROTECTED",
            message: "The Super Admin role must retain full system wildcard permissions."
          });
        }
      }

      const updatePayload = {};

      if (name !== undefined) {
        const trimmed = name.trim();
        if (!trimmed) {
          return res.status(400).json({ success: false, message: "Role name cannot be empty." });
        }
        if (trimmed.toLowerCase() !== existingRole.name.toLowerCase()) {
          const duplicate = await getRoleByName(trimmed);
          if (duplicate && duplicate.roleId !== existingRole.roleId) {
            return res.status(409).json({
              success: false,
              error: "DUPLICATE_ROLE_NAME",
              message: `A role with the name "${trimmed}" already exists.`
            });
          }
        }
        updatePayload.name = trimmed;
      }

      if (description !== undefined) updatePayload.description = description.trim();
      if (department !== undefined) updatePayload.department = department.trim();
      if (status !== undefined) updatePayload.status = status;

      if (permissions !== undefined) {
        const selectedPerms = Array.isArray(permissions) ? permissions : [];
        const invalidKeys = selectedPerms.filter((p) => p !== "*" && !ALL_PERMISSION_KEYS.includes(p));
        if (invalidKeys.length > 0) {
          return res.status(400).json({
            success: false,
            error: "INVALID_PERMISSION_KEYS",
            message: `Unrecognized permission keys: ${invalidKeys.join(", ")}`
          });
        }

        // Privilege escalation guard
        if (!req.user.isSuperAdmin) {
          const userPerms = req.user.permissions || [];
          const unauthorizedKeys = selectedPerms.filter((p) => p === "*" || !userPerms.includes(p));
          if (unauthorizedKeys.length > 0) {
            return res.status(403).json({
              success: false,
              error: "PRIVILEGE_ESCALATION_DENIED",
              message: `You cannot assign permissions exceeding your own clearance: ${unauthorizedKeys.join(", ")}`
            });
          }
        }
        updatePayload.permissions = selectedPerms;
      }

      const updated = await updateRole(existingRole.roleId, updatePayload);

      // If role name changed, sync staff and user labels
      if (updatePayload.name && updatePayload.name !== existingRole.name) {
        const assignedStaff = await getStaffAssignedToRole(existingRole.roleId);
        for (const s of assignedStaff) {
          await updateStaff(s.staffId, { roleName: updatePayload.name });
          const user = await findUserByEmailOrId(s.staffId);
          if (user) {
            await updateUser(user._id || user.id, { customRoleName: updatePayload.name });
          }
        }
      }

      await logAction(
        req.user.name,
        req.user.roleName || req.user.role,
        "UPDATE_ROLE",
        "Role",
        existingRole.roleId,
        `Updated role "${updatePayload.name || existingRole.name}". Duties count: ${
          updatePayload.permissions ? updatePayload.permissions.length : existingRole.permissions.length
        }.`
      );

      const assignedStaff = await getStaffAssignedToRole(existingRole.roleId, updatePayload.name || existingRole.name);

      res.json({
        success: true,
        message: `Role "${updatePayload.name || existingRole.name}" updated successfully.`,
        role: {
          ...updated,
          staffCount: assignedStaff.length,
          assignedStaff: assignedStaff.map((s) => ({
            staffId: s.staffId,
            name: s.name,
            email: s.email,
            designation: s.designation
          }))
        }
      });
    } catch (error) {
      console.error("[Update Role Error]:", error);
      res.status(500).json({ success: false, message: "Error updating role." });
    }
  }
);

// POST /api/roles/:id/duplicate - Duplicate role as a starting point
router.post(
  "/roles/:id/duplicate",
  authenticate,
  requirePermission("admin.roles_create"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const sourceRole = await getRoleById(id);
      if (!sourceRole) {
        return res.status(404).json({ success: false, message: "Source role not found." });
      }

      const { name: requestedName } = req.body || {};
      let newName = requestedName && requestedName.trim() ? requestedName.trim() : `${sourceRole.name} (Copy)`;
      let counter = 1;
      const baseCandidate = newName;
      while (await getRoleByName(newName)) {
        counter += 1;
        newName = `${baseCandidate} ${counter}`;
      }

      const duplicated = await createRole({
        name: newName,
        description: `Copy of ${sourceRole.name}. ${sourceRole.description || ""}`.trim(),
        department: sourceRole.department || "General",
        permissions: [...(sourceRole.permissions || [])],
        status: "active",
        isSystem: false,
        createdBy: req.user.name || "Administrator"
      });

      await logAction(
        req.user.name,
        req.user.roleName || req.user.role,
        "DUPLICATE_ROLE",
        "Role",
        duplicated.roleId,
        `Duplicated role "${sourceRole.name}" as "${newName}".`
      );

      res.status(201).json({
        success: true,
        message: `Role "${sourceRole.name}" duplicated successfully as "${newName}".`,
        role: {
          ...duplicated,
          staffCount: 0,
          assignedStaff: []
        }
      });
    } catch (error) {
      console.error("[Duplicate Role Error]:", error);
      res.status(500).json({ success: false, message: "Error duplicating role." });
    }
  }
);

// PATCH /api/roles/:id/status - Toggle activate or deactivate
router.patch(
  "/roles/:id/status",
  authenticate,
  requirePermission("admin.roles_deactivate"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status, confirmed } = req.body;

      if (!status || !["active", "inactive"].includes(status)) {
        return res.status(400).json({ success: false, message: "Status must be 'active' or 'inactive'." });
      }

      const role = await getRoleById(id);
      if (!role) {
        return res.status(404).json({ success: false, message: "Role not found." });
      }

      if (role.isSystem || role.roleId === "role-super-admin") {
        return res.status(400).json({
          success: false,
          error: "SUPER_ADMIN_PROTECTED",
          message: "The built-in Super Admin role cannot be deactivated."
        });
      }

      if (status === "inactive") {
        const assignedStaff = await getStaffAssignedToRole(role.roleId, role.name);
        if (assignedStaff.length > 0 && !confirmed) {
          return res.status(400).json({
            success: false,
            error: "ROLE_HAS_ASSIGNED_STAFF",
            requiresConfirmation: true,
            assignedCount: assignedStaff.length,
            message: `Role "${role.name}" is currently assigned to ${assignedStaff.length} staff member(s). Deactivating this role will suspend their operational permissions until reassigned. Confirm to proceed.`
          });
        }
      }

      const updated = await updateRole(role.roleId, { status });

      await logAction(
        req.user.name,
        req.user.roleName || req.user.role,
        status === "active" ? "ACTIVATE_ROLE" : "DEACTIVATE_ROLE",
        "Role",
        role.roleId,
        `Role "${role.name}" set to ${status}.`
      );

      res.json({
        success: true,
        message: `Role "${role.name}" is now ${status}.`,
        role: updated
      });
    } catch (error) {
      console.error("[Role Status Error]:", error);
      res.status(500).json({ success: false, message: "Error changing role status." });
    }
  }
);

// DELETE /api/roles/:id - Delete eligible role with safety guard against assigned staff
router.delete(
  "/roles/:id",
  authenticate,
  requirePermission("admin.roles_delete"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const role = await getRoleById(id);
      if (!role) {
        return res.status(404).json({ success: false, message: "Role not found." });
      }

      if (role.isSystem || role.roleId === "role-super-admin") {
        return res.status(403).json({
          success: false,
          error: "SUPER_ADMIN_PROTECTED",
          message: "The built-in Super Admin role is protected and cannot be deleted."
        });
      }

      // Check if any staff members are currently assigned
      const assignedStaff = await getStaffAssignedToRole(role.roleId, role.name);
      if (assignedStaff.length > 0) {
        return res.status(400).json({
          success: false,
          error: "ROLE_IN_USE",
          assignedCount: assignedStaff.length,
          assignedStaff: assignedStaff.map((s) => ({
            staffId: s.staffId,
            name: s.name,
            email: s.email,
            designation: s.designation,
            department: s.department
          })),
          message: `Cannot delete role "${role.name}" because it is currently assigned to ${assignedStaff.length} staff member(s). You must first reassign them to another active role.`
        });
      }

      await deleteRole(role.roleId);

      await logAction(
        req.user.name,
        req.user.roleName || req.user.role,
        "DELETE_ROLE",
        "Role",
        role.roleId,
        `Role "${role.name}" permanently deleted.`
      );

      res.json({
        success: true,
        message: `Role "${role.name}" deleted successfully.`
      });
    } catch (error) {
      console.error("[Delete Role Error]:", error);
      res.status(500).json({ success: false, message: "Error deleting role." });
    }
  }
);

// POST /api/roles/:id/reassign-and-delete - Safe reassignment and deletion flow
router.post(
  "/roles/:id/reassign-and-delete",
  authenticate,
  requirePermission("admin.roles_delete"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { targetRoleId } = req.body;

      if (!targetRoleId) {
        return res.status(400).json({
          success: false,
          message: "Target role ID for staff reassignment is required."
        });
      }

      const roleToDelete = await getRoleById(id);
      if (!roleToDelete) {
        return res.status(404).json({ success: false, message: "Role to delete not found." });
      }

      if (roleToDelete.isSystem || roleToDelete.roleId === "role-super-admin") {
        return res.status(403).json({
          success: false,
          message: "The built-in Super Admin role cannot be deleted."
        });
      }

      if (roleToDelete.roleId === targetRoleId) {
        return res.status(400).json({
          success: false,
          message: "Target role must be different from the role being deleted."
        });
      }

      const targetRole = await getRoleById(targetRoleId);
      if (!targetRole) {
        return res.status(404).json({ success: false, message: "Target role for reassignment not found." });
      }

      if (targetRole.status === "inactive") {
        return res.status(400).json({
          success: false,
          message: `Cannot reassign staff to inactive role "${targetRole.name}".`
        });
      }

      const reassignedCount = await reassignStaffRole(roleToDelete.roleId, targetRole.roleId, targetRole.name);
      await deleteRole(roleToDelete.roleId);

      await logAction(
        req.user.name,
        req.user.roleName || req.user.role,
        "REASSIGN_AND_DELETE_ROLE",
        "Role",
        roleToDelete.roleId,
        `Reassigned ${reassignedCount} staff member(s) to "${targetRole.name}" and safely deleted role "${roleToDelete.name}".`
      );

      res.json({
        success: true,
        message: `Successfully reassigned ${reassignedCount} staff member(s) to "${targetRole.name}" and deleted role "${roleToDelete.name}".`,
        reassignedCount,
        newRoleId: targetRole.roleId
      });
    } catch (error) {
      console.error("[Reassign & Delete Error]:", error);
      res.status(500).json({ success: false, message: "Error in safe reassignment flow." });
    }
  }
);

// ══════════════════════════════════════════════
// 4. STUDENT MANAGEMENT & ATOMIC ID GENERATION
// ══════════════════════════════════════════════

// GET /api/students - List & filter students
router.get(
  "/students",
  authenticate,
  requirePermission(["students.view", "admissions.view", "attendance.student_view", "fees.balance_view"]),
  async (req, res) => {
  try {
    const { course, batch, status, search } = req.query;
    let students = await getAllStudents({ course, batch, status });

    if (search) {
      const q = search.toLowerCase();
      students = students.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.studentId.toLowerCase().includes(q)
      );
    }

    res.json(students);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching student records." });
  }
});

// POST /api/students - Register student with atomic backend ID generation
router.post(
  "/students",
  authenticate,
  requirePermission(["students.create", "inquiries.admissions_create", "admissions.enrollment_record"]),
  async (req, res) => {
  try {
    const { name, email, phone, course, batch, enrollmentDate } = req.body;

    if (!name || !email || !phone || !course) {
      return res.status(400).json({
        success: false,
        error: "MISSING_FIELDS",
        message: "Name, email, phone number, and course are required."
      });
    }

    // Check duplicate email
    const existing = await getStudentByEmail(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: "DUPLICATE_EMAIL",
        message: `A student with email ${email} is already registered with ID ${existing.studentId}.`
      });
    }

    // Generate atomic sequence Student ID: HUN-S-YYYY-XXXX
    const studentId = await generateStudentId(enrollmentDate || new Date());

    // Generate single-use invitation token
    const { rawToken, tokenHash, expiresAt } = generateInvitationToken();

    // Create User record
    const user = await createUser({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      assignedId: studentId,
      role: "student",
      status: "pending_activation",
      invitationTokenHash: tokenHash,
      invitationExpires: expiresAt
    });

    // Create Student record
    const student = await createStudent({
      studentId,
      userId: user._id || user.id,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      course: course.trim(),
      batch: typeof batch === "string" ? batch.trim() : "",
      enrollmentDate: enrollmentDate || new Date(),
      enrollmentStatus: "pending_activation",
      assignedTeacher: ""
    });

    await logAction(req.user.name, req.user.role, "REGISTER_STUDENT", "Student", studentId, `Enrolled into ${course}`);
    const delivery = await sendActivationEmail(
      user,
      rawToken,
      "Activate your Hunar student portal account",
      "activate"
    );

    res.status(201).json({
      success: true,
      message: delivery.emailSent
        ? `Student registered with ID ${studentId}; activation email sent to ${student.email}.`
        : `Student registered with ID ${studentId}, but activation email could not be sent. Copy and share the link securely.`,
      student,
      invitation: {
        token: rawToken,
        activationUrl: delivery.activationUrl,
        emailSent: delivery.emailSent,
        expiresAt
      }
    });
  } catch (error) {
    console.error("[Create Student Error]:", error);
    res.status(500).json({ success: false, message: "Error registering student." });
  }
});

// PATCH /api/students/:id/status - Suspend or reactivate student
router.patch(
  "/students/:id/status",
  authenticate,
  requirePermission(["students.edit", "admin.accounts_manage"]),
  async (req, res) => {
  try {
    const { id } = req.params; // studentId
    const { status } = req.body; // "active" or "suspended"

    if (!["active", "suspended"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value." });
    }

    const student = await updateStudent(id, { enrollmentStatus: status });
    if (!student) return res.status(404).json({ success: false, message: "Student not found." });

    const user = await findUserByEmailOrId(id);
    if (user) {
      await updateUser(user._id || user.id, { status });
    }

    await logAction(req.user.name, req.user.role, "UPDATE_STUDENT_STATUS", "Student", id, `Status changed to ${status}`);

    res.json({ success: true, message: `Student status updated to ${status}.`, student });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating student status." });
  }
});

// POST /api/students/:id/invite - Generate or resend account activation invitation
router.post(
  "/students/:id/invite",
  authenticate,
  requirePermission(["students.create", "students.edit", "admin.accounts_manage"]),
  async (req, res) => {
  try {
    const { id } = req.params;
    const student = await getStudentByStudentId(id);
    if (!student) return res.status(404).json({ success: false, message: "Student not found." });

    const user = await findUserByEmailOrId(id);
    if (!user) return res.status(404).json({ success: false, message: "User account not found." });

    const { rawToken, tokenHash, expiresAt } = generateInvitationToken();
    await updateUser(user._id || user.id, {
      invitationTokenHash: tokenHash,
      invitationExpires: expiresAt,
      status: "pending_activation"
    });

    await logAction(req.user.name, req.user.role, "GENERATE_INVITATION", "Student", id, `New activation link generated.`);
    const delivery = await sendActivationEmail(
      user,
      rawToken,
      "Activate your Hunar student portal account",
      "activate"
    );

    res.json({
      success: true,
      emailSent: delivery.emailSent,
      message: delivery.emailSent
        ? `Account activation link emailed to ${student.email}.`
        : "Activation link generated, but email could not be sent. Copy and share the link securely.",
      invitationUrl: delivery.activationUrl,
      token: rawToken,
      expiresAt
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error generating invitation." });
  }
});

// PUT /api/students/:id - Update student academic & contact details
router.put(
  "/students/:id",
  authenticate,
  requirePermission(["students.edit", "students.contact_update"]),
  async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, course, batch, assignedTeacher, enrollmentStatus } = req.body;
    const updatePayload = {};
    if (name !== undefined) updatePayload.name = name.trim();
    if (email !== undefined) updatePayload.email = email.trim();
    if (phone !== undefined) updatePayload.phone = phone.trim();
    if (course !== undefined) updatePayload.course = course.trim();
    if (batch !== undefined) updatePayload.batch = batch.trim();
    if (assignedTeacher !== undefined) updatePayload.assignedTeacher = assignedTeacher.trim();
    if (enrollmentStatus !== undefined) updatePayload.enrollmentStatus = enrollmentStatus;

    const updated = await updateStudent(id, updatePayload);
    if (!updated) return res.status(404).json({ success: false, message: "Student not found." });

    // Sync with linked User record
    const user = await findUserByEmailOrId(id);
    if (user) {
      const userUpdates = {};
      if (updatePayload.name) userUpdates.name = updatePayload.name;
      if (updatePayload.email) userUpdates.email = updatePayload.email;
      if (updatePayload.phone) userUpdates.phone = updatePayload.phone;
      if (updatePayload.enrollmentStatus) userUpdates.status = updatePayload.enrollmentStatus;
      await updateUser(user._id || user.id, userUpdates);
    }

    await logAction(req.user.name, req.user.role, "UPDATE_STUDENT", "Student", id, `Updated student details`);
    res.json({ success: true, message: "Student record updated successfully.", student: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating student record." });
  }
});

// DELETE /api/students/:id - Permanently delete student and linked user & fees
router.delete("/students/:id", authenticate, requireRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    await deleteStudent(id);
    await logAction(req.user.name, req.user.role, "DELETE_STUDENT", "Student", id, "Student account and records deleted");
    res.json({ success: true, message: `Student ${id} permanently deleted successfully.` });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting student." });
  }
});

// ══════════════════════════════════════════════
// 5. STAFF MANAGEMENT & STAFF ID GENERATION
// ══════════════════════════════════════════════

// GET /api/staff - List staff members
router.get(
  "/staff",
  authenticate,
  requirePermission(["staff.view", "staff.roles_assign", "admin.roles_assign"]),
  async (req, res) => {
    try {
      const list = await getAllStaff();
      res.json(list);
    } catch (error) {
      res.status(500).json({ success: false, message: "Error fetching staff members." });
    }
  }
);

// POST /api/staff - Register staff member with atomic HUN-T-XXXX ID and custom role
router.post(
  "/staff",
  authenticate,
  requirePermission("staff.create"),
  async (req, res) => {
    try {
      const {
        name,
        email,
        phone,
        designation,
        department,
        role,
        roleId,
        roleName,
        assignedSubjects,
        assignedCourses
      } = req.body;

      if (!name || !email || !designation) {
        return res.status(400).json({
          success: false,
          error: "MISSING_FIELDS",
          message: "Name, email, and designation are required."
        });
      }

      const existing = await getStaffByEmail(email);
      if (existing) {
        return res.status(409).json({
          success: false,
          error: "DUPLICATE_EMAIL",
          message: `A staff member with email ${email} is already registered with Staff ID ${existing.staffId}.`
        });
      }

      // Role Assignment Validation
      let assignedRoleId = roleId || "";
      let assignedRoleName = roleName || "";

      if (assignedRoleId) {
        // Verify role-assign clearance if non-super-admin
        if (
          !req.user.isSuperAdmin &&
          (!req.user.permissions ||
            (!req.user.permissions.includes("staff.roles_assign") &&
              !req.user.permissions.includes("admin.roles_assign")))
        ) {
          return res.status(403).json({
            success: false,
            error: "PERMISSION_DENIED",
            message: "Forbidden: You lack permission to assign custom staff roles."
          });
        }

        const roleDoc = await getRoleById(assignedRoleId);
        if (!roleDoc) {
          return res.status(400).json({
            success: false,
            error: "ROLE_NOT_FOUND",
            message: `Selected role (${assignedRoleId}) does not exist.`
          });
        }

        if (roleDoc.status === "inactive") {
          return res.status(400).json({
            success: false,
            error: "ROLE_INACTIVE",
            message: `Cannot assign inactive role "${roleDoc.name}" to new staff. Please choose an active role.`
          });
        }

        assignedRoleName = roleDoc.name;
      } else {
        // Fallback default role
        if (role === "admin") {
          assignedRoleId = "role-super-admin";
          assignedRoleName = "Super Admin";
        } else if (role === "staff") {
          assignedRoleId = "role-office-administrator";
          assignedRoleName = "Office Administrator";
        } else {
          assignedRoleId = "role-teacher";
          assignedRoleName = "Teacher / Faculty";
        }
      }

      const staffId = await generateStaffId();
      const { rawToken, tokenHash, expiresAt } = generateInvitationToken();

      const user = await createUser({
        name: name.trim(),
        email: email.trim(),
        phone: phone ? phone.trim() : "",
        assignedId: staffId,
        role: role || (assignedRoleId === "role-super-admin" ? "admin" : (assignedRoleId === "role-teacher" ? "teacher" : "staff")),
        roleId: assignedRoleId,
        customRoleName: assignedRoleName,
        status: "pending_activation",
        invitationTokenHash: tokenHash,
        invitationExpires: expiresAt
      });

      const staff = await createStaff({
        staffId,
        userId: user._id || user.id,
        name: name.trim(),
        email: email.trim(),
        phone: phone ? phone.trim() : "",
        designation: designation.trim(),
        department: department || "Academic Faculty",
        role: role || (assignedRoleId === "role-super-admin" ? "admin" : (assignedRoleId === "role-teacher" ? "teacher" : "staff")),
        roleId: assignedRoleId,
        roleName: assignedRoleName,
        assignedSubjects: assignedSubjects || ["Computer Science"],
        assignedCourses: assignedCourses || ["All Programs"],
        assignedBatches: []
      });

      await logAction(
        req.user.name,
        req.user.roleName || req.user.role,
        "REGISTER_STAFF",
        "Staff",
        staffId,
        `${designation} registered. Assigned Role: "${assignedRoleName}" (${assignedRoleId}).`
      );
      const delivery = await sendActivationEmail(
        user,
        rawToken,
        "Activate your Hunar staff portal account",
        "activate"
      );

      res.status(201).json({
        success: true,
        message: delivery.emailSent
          ? `Staff member registered with ID ${staffId}; activation email sent to ${staff.email}.`
          : `Staff member registered with ID ${staffId}, but activation email could not be sent. Copy and share the link securely.`,
        staff,
        invitation: {
          token: rawToken,
          activationUrl: delivery.activationUrl,
          emailSent: delivery.emailSent,
          expiresAt
        }
      });
    } catch (error) {
      console.error("[Create Staff Error]:", error);
      res.status(500).json({ success: false, message: "Error registering staff member." });
    }
  }
);

// PUT /api/staff/:id - Update staff details & role assignment
router.put(
  "/staff/:id",
  authenticate,
  requirePermission("staff.edit"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        name,
        email,
        designation,
        department,
        role,
        roleId,
        roleName,
        assignedSubjects,
        assignedCourses,
        phone,
        employmentStatus
      } = req.body;

      const existingStaff = await getStaffByStaffId(id);
      if (!existingStaff) {
        return res.status(404).json({ success: false, message: "Staff member not found." });
      }

      const updatePayload = {};
      if (name !== undefined) updatePayload.name = name.trim();
      if (email !== undefined) updatePayload.email = email.trim();
      if (phone !== undefined) updatePayload.phone = phone.trim();
      if (designation !== undefined) updatePayload.designation = designation.trim();
      if (department !== undefined) updatePayload.department = department.trim();
      if (role !== undefined) updatePayload.role = role.trim();
      if (employmentStatus !== undefined) updatePayload.employmentStatus = employmentStatus;
      if (assignedSubjects !== undefined) {
        updatePayload.assignedSubjects = Array.isArray(assignedSubjects)
          ? assignedSubjects
          : assignedSubjects.split(",").map((s) => s.trim()).filter(Boolean);
      }
      if (assignedCourses !== undefined) {
        updatePayload.assignedCourses = Array.isArray(assignedCourses)
          ? assignedCourses
          : assignedCourses.split(",").map((s) => s.trim()).filter(Boolean);
      }

      // Handle Role change with validation & permission check
      if (roleId !== undefined && roleId !== existingStaff.roleId) {
        if (
          !req.user.isSuperAdmin &&
          (!req.user.permissions ||
            (!req.user.permissions.includes("staff.roles_assign") &&
              !req.user.permissions.includes("admin.roles_assign")))
        ) {
          return res.status(403).json({
            success: false,
            error: "PERMISSION_DENIED",
            message: "Forbidden: You lack permission to change staff member roles."
          });
        }

        const roleDoc = await getRoleById(roleId);
        if (!roleDoc) {
          return res.status(400).json({
            success: false,
            error: "ROLE_NOT_FOUND",
            message: `Selected role (${roleId}) does not exist.`
          });
        }

        if (roleDoc.status === "inactive") {
          return res.status(400).json({
            success: false,
            error: "ROLE_INACTIVE",
            message: `Cannot assign inactive role "${roleDoc.name}".`
          });
        }

        updatePayload.roleId = roleDoc.roleId;
        updatePayload.roleName = roleDoc.name;
      } else if (roleName !== undefined && !updatePayload.roleName) {
        updatePayload.roleName = roleName;
      }

      const updated = await updateStaff(id, updatePayload);
      if (!updated) return res.status(404).json({ success: false, message: "Staff member not found." });

      // Sync with linked User record
      const user = await findUserByEmailOrId(id);
      if (user) {
        const userUpdates = {};
        if (updatePayload.name) userUpdates.name = updatePayload.name;
        if (updatePayload.email) userUpdates.email = updatePayload.email;
        if (updatePayload.phone) userUpdates.phone = updatePayload.phone;
        if (updatePayload.role) userUpdates.role = updatePayload.role;
        if (updatePayload.roleId) userUpdates.roleId = updatePayload.roleId;
        if (updatePayload.roleName) userUpdates.customRoleName = updatePayload.roleName;
        if (updatePayload.employmentStatus) {
          userUpdates.status = updatePayload.employmentStatus === "active" ? "active" : "suspended";
        }
        await updateUser(user._id || user.id, userUpdates);
      }

      await logAction(
        req.user.name,
        req.user.roleName || req.user.role,
        "UPDATE_STAFF",
        "Staff",
        id,
        `Updated staff details. Role: "${updated.roleName || updated.role}".`
      );

      res.json({ success: true, message: "Staff record updated successfully.", staff: updated });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error updating staff record." });
    }
  }
);

// POST /api/staff/:id/invite - Generate or resend staff account activation invitation
router.post(
  "/staff/:id/invite",
  authenticate,
  requirePermission(["staff.create", "staff.edit", "admin.accounts_manage"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const staff = await getStaffByStaffId(id);
      if (!staff) return res.status(404).json({ success: false, message: "Staff member not found." });

      const user = await findUserByEmailOrId(id);
      if (!user) return res.status(404).json({ success: false, message: "Linked user account not found." });

      const { rawToken, tokenHash, expiresAt } = generateInvitationToken();
      await updateUser(user._id || user.id, {
        invitationTokenHash: tokenHash,
        invitationExpires: expiresAt,
        status: "pending_activation"
      });

      await logAction(req.user.name, req.user.roleName || req.user.role, "GENERATE_INVITATION", "Staff", id, "New staff activation link generated.");
      const delivery = await sendActivationEmail(
        user,
        rawToken,
        "Activate your Hunar staff portal account",
        "activate"
      );

      res.json({
        success: true,
        emailSent: delivery.emailSent,
        message: delivery.emailSent
          ? `Account activation link emailed to ${staff.email}.`
          : "Activation link generated, but email could not be sent. Copy and share the link securely.",
        invitationUrl: delivery.activationUrl,
        token: rawToken,
        expiresAt
      });
    } catch (error) {
      console.error("[Staff Invite Error]:", error);
      res.status(500).json({ success: false, message: "Error generating staff invitation." });
    }
  }
);

// DELETE /api/staff/:id - Permanently delete staff member
router.delete(
  "/staff/:id",
  authenticate,
  requirePermission(["staff.deactivate", "admin.accounts_manage"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      await deleteStaff(id);
      await logAction(req.user.name, req.user.roleName || req.user.role, "DELETE_STAFF", "Staff", id, `Staff member deleted`);
      res.json({ success: true, message: `Staff member ${id} deleted successfully.` });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message || "Error deleting staff member." });
    }
  }
);

// ══════════════════════════════════════════════
// 6. COURSES & BATCHES
// ══════════════════════════════════════════════
router.get("/courses", async (req, res) => {
  const courses = await getAllCourses();
  res.json(courses);
});

router.post("/courses", authenticate, requireRole(["admin"]), async (req, res) => {
  try {
    const { title, category, description, duration, syllabus, assignedTeacher } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Title and description are required." });
    }
    const course = await createCourse({ title, category: category || "Design & Tech", description, duration, syllabus: syllabus || [], assignedTeacher: assignedTeacher || "" });
    await logAction(req.user.name, req.user.role, "CREATE_COURSE", "Course", course.title);
    res.status(201).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating course." });
  }
});

router.put("/courses/:id", authenticate, requireRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await updateCourse(id, req.body);
    await logAction(req.user.name, req.user.role, "UPDATE_COURSE", "Course", id);
    res.json({ success: true, course: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating course." });
  }
});

router.delete("/courses/:id", authenticate, requireRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    await deleteCourse(id);
    await logAction(req.user.name, req.user.role, "DELETE_COURSE", "Course", id);
    res.json({ success: true, message: "Course archived successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error archiving course." });
  }
});

router.get("/batches", async (req, res) => {
  const batches = await getAllBatches();
  res.json(batches);
});

router.post("/batches", authenticate, requireRole(["admin"]), async (req, res) => {
  try {
    const { name, course, timing, assignedTeacher } = req.body;
    if (!name || !course) {
      return res.status(400).json({ success: false, message: "Batch name and course are required." });
    }
    const batch = await createBatch({ name, course, timing, assignedTeacher });
    await logAction(req.user.name, req.user.role, "CREATE_BATCH", "Batch", batch.name);
    res.status(201).json({ success: true, batch });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating batch." });
  }
});

router.put("/batches/:id", authenticate, requireRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await updateBatch(id, req.body);
    await logAction(req.user.name, req.user.role, "UPDATE_BATCH", "Batch", id);
    res.json({ success: true, message: "Batch updated successfully.", batch: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating batch." });
  }
});

router.delete("/batches/:id", authenticate, requireRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    await deleteBatch(id);
    await logAction(req.user.name, req.user.role, "DELETE_BATCH", "Batch", id);
    res.json({ success: true, message: "Batch deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting batch." });
  }
});

// ══════════════════════════════════════════════
// 6B. TIMETABLE
// ══════════════════════════════════════════════
router.get("/timetable", async (req, res) => {
  const { batch } = req.query;
  const list = await getTimetable(batch);
  res.json(list);
});

router.post("/timetable", authenticate, requireRole(["admin", "teacher"]), async (req, res) => {
  try {
    const { course, batch, day, time, subject, teacher, room } = req.body;
    if (!course || !batch || !day || !time || !subject) {
      return res.status(400).json({ success: false, message: "Course, batch, day, time, and subject are required." });
    }
    const item = await createTimetableItem({ course, batch, day, time, subject, teacher: teacher || "", room: room || "" });
    await logAction(req.user.name, req.user.role, "CREATE_TIMETABLE", "Timetable", `${batch} - ${day}`);
    res.status(201).json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating timetable slot." });
  }
});

router.put("/timetable/:id", authenticate, requireRole(["admin", "teacher"]), async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await updateTimetableItem(id, req.body);
    await logAction(req.user.name, req.user.role, "UPDATE_TIMETABLE", "Timetable", id);
    res.json({ success: true, message: "Timetable slot updated successfully.", item: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating timetable slot." });
  }
});

router.delete("/timetable/:id", authenticate, requireRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    await deleteTimetableItem(id);
    await logAction(req.user.name, req.user.role, "DELETE_TIMETABLE", "Timetable", id);
    res.json({ success: true, message: "Timetable slot removed." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error removing timetable slot." });
  }
});

// ══════════════════════════════════════════════
// 7. ATTENDANCE WORKFLOWS
// ══════════════════════════════════════════════
router.get("/attendance", authenticate, async (req, res) => {
  try {
    const { batch, date } = req.query;
    if (!batch || !date) {
      return res.status(400).json({ success: false, message: "Batch and date are required." });
    }
    const records = await getAttendanceByBatchAndDate(batch, date);
    res.json(records);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error loading attendance." });
  }
});

router.post("/attendance", authenticate, requireRole(["admin", "teacher"]), async (req, res) => {
  try {
    const { batch, date, records } = req.body;
    if (!batch || !date || !Array.isArray(records)) {
      return res.status(400).json({ success: false, message: "Batch, date, and attendance records are required." });
    }

    const payload = records.map((r) => ({
      studentId: r.studentId,
      studentName: r.studentName,
      batch,
      date,
      status: r.status || "present",
      markedBy: req.user.name
    }));

    await recordAttendance(payload);
    await logAction(req.user.name, req.user.role, "MARK_ATTENDANCE", "Attendance", `${batch} (${date})`);

    res.json({ success: true, message: "Attendance marked successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error recording attendance." });
  }
});

router.get("/attendance/student/:studentId", authenticate, enforceStudentAccess, async (req, res) => {
  try {
    const { studentId } = req.params;
    const history = await getStudentAttendance(studentId);
    const total = history.length;
    const presentCount = history.filter((h) => h.status === "present").length;
    const percentage = total > 0 ? Math.round((presentCount / total) * 100) : 100;

    res.json({
      studentId,
      totalClasses: total,
      presentCount,
      percentage,
      history
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error loading student attendance." });
  }
});

// ══════════════════════════════════════════════
// 8. ASSIGNMENTS & SUBMISSIONS
// ══════════════════════════════════════════════
router.get("/assignments", authenticate, async (req, res) => {
  const { batch } = req.query;
  const assignments = await getAllAssignments(batch);
  res.json(assignments);
});

router.post("/assignments", authenticate, requireRole(["admin", "teacher"]), async (req, res) => {
  try {
    const { title, description, course, batch, deadline, maxMarks } = req.body;
    if (!title || !deadline) {
      return res.status(400).json({ success: false, message: "Title and deadline are required." });
    }
    const item = await createAssignment({
      title,
      description: description || "",
      course: course || "General",
      batch: batch || "All Batches",
      deadline: new Date(deadline),
      maxMarks: Number(maxMarks) || 100,
      assignedBy: req.user.name
    });
    await logAction(req.user.name, req.user.role, "CREATE_ASSIGNMENT", "Assignment", item.title);
    res.status(201).json({ success: true, assignment: item });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating assignment." });
  }
});

router.post("/assignments/:id/submit", authenticate, requireRole(["student"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { content, fileUrl } = req.body;

    const sub = await createSubmission({
      assignmentId: id,
      studentId: req.user.assignedId,
      studentName: req.user.name,
      content: content || "",
      fileUrl: fileUrl || ""
    });

    res.status(201).json({ success: true, message: "Assignment submitted successfully!", submission: sub });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error submitting assignment." });
  }
});

// ══════════════════════════════════════════════
// 9. ANNOUNCEMENTS
// ══════════════════════════════════════════════
router.get("/announcements", async (req, res) => {
  const audience = req.query.audience || "all";
  const announcements = await getAnnouncements(audience);
  res.json(announcements);
});

router.post("/announcements", authenticate, requireRole(["admin", "teacher"]), async (req, res) => {
  try {
    const { title, message, audience } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: "Title and message are required." });
    }
    const ann = await createAnnouncement({
      title,
      message,
      audience: audience || "all",
      authorName: req.user.name,
      authorRole: req.user.role === "admin" ? "Founder & Director" : "Lead Instructor"
    });
    await logAction(req.user.name, req.user.role, "POST_ANNOUNCEMENT", "Announcement", ann.title);
    res.status(201).json({ success: true, announcement: ann });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating announcement." });
  }
});

router.put("/announcements/:id", authenticate, requireRole(["admin", "teacher"]), async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await updateAnnouncement(id, req.body);
    await logAction(req.user.name, req.user.role, "UPDATE_ANNOUNCEMENT", "Announcement", id);
    res.json({ success: true, message: "Announcement updated successfully.", announcement: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating announcement." });
  }
});

router.delete("/announcements/:id", authenticate, requireRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    await deleteAnnouncement(id);
    await logAction(req.user.name, req.user.role, "DELETE_ANNOUNCEMENT", "Announcement", id);
    res.json({ success: true, message: "Announcement deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting announcement." });
  }
});

// ══════════════════════════════════════════════
// 10. AUDIT LOGS (ADMIN ONLY)
// ══════════════════════════════════════════════
router.get("/audit-logs", authenticate, requireRole(["admin"]), async (req, res) => {
  const logs = await getAuditLogs(100);
  res.json(logs);
});

// ══════════════════════════════════════════════
// 11. PERSONALIZED STUDENT & STAFF PORTALS
// ══════════════════════════════════════════════

// GET /api/portal/student - Complete student data bundle
router.get("/portal/student", authenticate, requireRole(["student"]), async (req, res) => {
  try {
    const student = await getStudentByStudentId(req.user.assignedId);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student record not found." });
    }

    const attendanceRecords = await getStudentAttendance(req.user.assignedId);
    const totalClasses = attendanceRecords.length;
    const presentClasses = attendanceRecords.filter((a) => a.status === "present").length;
    const attendancePercentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 100;

    const assignments = await getAllAssignments(student.batch);
    const submissions = await getSubmissionsForStudent(req.user.assignedId);
    const announcements = await getAnnouncements("students");

    res.json({
      success: true,
      profile: {
        name: student.name,
        studentId: student.studentId,
        email: student.email,
        phone: student.phone,
        course: student.course,
        batch: student.batch,
        enrollmentDate: student.enrollmentDate,
        assignedTeacher: student.assignedTeacher,
        status: student.enrollmentStatus
      },
      attendance: {
        totalClasses,
        presentClasses,
        percentage: attendancePercentage,
        recent: attendanceRecords.slice(0, 10)
      },
      assignments: assignments.map((a) => {
        const sub = submissions.find((s) => String(s.assignmentId) === String(a._id || a.id));
        return {
          ...a,
          submissionStatus: sub ? sub.status : "pending",
          marks: sub ? sub.marks : null,
          feedback: sub ? sub.feedback : ""
        };
      }),
      announcements
    });
  } catch (error) {
    console.error("[Student Portal Error]:", error);
    res.status(500).json({ success: false, message: "Error loading student portal data." });
  }
});

// GET /api/portal/staff - Complete staff/faculty data bundle
router.get("/portal/staff", authenticate, requireRole(["admin", "teacher"]), async (req, res) => {
  try {
    const staff = await getStaffByStaffId(req.user.assignedId);
    const batches = await getAllBatches();
    const students = await getAllStudents();
    const assignments = await getAllAssignments();
    const announcements = await getAnnouncements("staff");

    res.json({
      success: true,
      profile: staff || {
        name: req.user.name,
        staffId: req.user.assignedId,
        designation: "Faculty Member",
        department: "Academic",
        email: req.user.email
      },
      assignedBatches: batches,
      studentsCount: students.length,
      assignments,
      announcements
    });
  } catch (error) {
    console.error("[Staff Portal Error]:", error);
    res.status(500).json({ success: false, message: "Error loading staff portal data." });
  }
});

// ══════════════════════════════════════════════
// 12. LEADS & INQUIRIES
// ══════════════════════════════════════════════
router.get("/leads", authenticate, requirePermission(["inquiries.view", "inquiries.web_requests_view"]), async (req, res) => {
  try {
    res.json(await getAllLeads());
  } catch (error) {
    console.error("[Get Leads Error]:", error);
    res.status(500).json({ success: false, message: "Unable to fetch inquiries." });
  }
});

router.post("/leads", inquiryLimiter, async (req, res) => {
  const { name, phone, email, course, preferredTiming, message } = req.body || {};
  const leadData = {
    name: typeof name === "string" ? name.trim() : "",
    phone: typeof phone === "string" ? phone.trim() : "",
    email: typeof email === "string" ? email.trim().toLowerCase() : "",
    course: typeof course === "string" && course.trim() ? course.trim() : "General Inquiry",
    preferredTiming: typeof preferredTiming === "string" ? preferredTiming.trim() : "",
    message: typeof message === "string" ? message.trim() : ""
  };
  if (!leadData.name || !leadData.phone) {
    return res.status(400).json({ success: false, message: "Name and phone are required." });
  }
  if (
    leadData.name.length > 120 ||
    leadData.phone.length > 40 ||
    leadData.email.length > 254 ||
    leadData.course.length > 160 ||
    leadData.preferredTiming.length > 120 ||
    leadData.message.length > 2000
  ) {
    return res.status(400).json({ success: false, message: "One or more inquiry fields exceed the allowed length." });
  }
  if (leadData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadData.email)) {
    return res.status(400).json({ success: false, message: "Please enter a valid email address." });
  }

  try {
    const newLead = await createLead({ ...leadData, source: "website" });
    let emailSent = false;
    try {
      await sendEmail({
        to: process.env.INQUIRY_NOTIFICATION_EMAIL,
        replyTo: leadData.email || undefined,
        subject: "New Hunar website inquiry",
        text: [
          "A new inquiry was submitted on the Hunar website.",
          "",
          `Name: ${leadData.name}`,
          `Phone: ${leadData.phone}`,
          `Email: ${leadData.email || "Not provided"}`,
          `Course: ${leadData.course}`,
          `Preferred timing: ${leadData.preferredTiming || "Not specified"}`,
          `Message: ${leadData.message || "No message provided"}`,
          `Inquiry ID: ${newLead.id}`
        ].join("\n")
      });
      emailSent = true;
    } catch (emailError) {
      console.error("[Inquiry Email Error]:", emailError.message);
    }
    try {
      await updateLead(newLead.id, { emailNotificationStatus: emailSent ? "sent" : "failed" });
    } catch (statusError) {
      console.error("[Inquiry Email Status Error]:", statusError.message);
    }

    res.status(201).json({
      success: true,
      emailSent,
      message: emailSent
        ? "Inquiry received and saved. The admissions team has been notified."
        : "Inquiry received and saved, but the admissions email could not be sent. Please contact the institute directly.",
      lead: newLead
    });
  } catch (error) {
    console.error("[Create Lead Error]:", error);
    res.status(500).json({ success: false, message: "Unable to save your inquiry. Please try again." });
  }
});

router.put("/leads/:id", authenticate, requirePermission(["inquiries.status_update", "inquiries.edit"]), async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  const updates = {};
  if (status !== undefined) {
    if (!["New", "Contacted", "Interested", "Dropped"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid inquiry status." });
    }
    updates.status = status;
  }
  if (notes !== undefined) {
    if (typeof notes !== "string" || notes.length > 2000) {
      return res.status(400).json({ success: false, message: "Inquiry notes must be text of at most 2,000 characters." });
    }
    updates.notes = notes.trim();
  }
  if (!Object.keys(updates).length) {
    return res.status(400).json({ success: false, message: "No inquiry updates were provided." });
  }
  try {
    const updatedLead = await updateLead(id, updates);
    if (!updatedLead) return res.status(404).json({ success: false, message: "Lead not found." });
    res.json({ success: true, message: "Lead updated.", lead: updatedLead });
  } catch (error) {
    console.error("[Update Lead Error]:", error);
    res.status(500).json({ success: false, message: "Unable to update the inquiry." });
  }
});

router.delete("/leads/:id", authenticate, requirePermission("inquiries.edit"), async (req, res) => {
  const { id } = req.params;
  try {
    if (!await deleteLead(id)) return res.status(404).json({ success: false, message: "Lead not found." });
    res.json({ success: true, message: "Lead deleted." });
  } catch (error) {
    console.error("[Delete Lead Error]:", error);
    res.status(500).json({ success: false, message: "Unable to delete the inquiry." });
  }
});

// ══════════════════════════════════════════════
// 13. SITE SETTINGS
// ══════════════════════════════════════════════
router.get("/settings", async (req, res) => {
  const settings = await readSettings();
  res.json(settings);
});

router.put("/settings", authenticate, requireRole(["admin"]), async (req, res) => {
  const current = await readSettings();
  const updated = { ...current, ...req.body };
  await fs.writeFile(path.join(DATA_DIR, "settings.json"), JSON.stringify(updated, null, 2));
  await logAction(req.user.name, req.user.role, "UPDATE_SETTINGS", "Settings", "SiteConfig");
  res.json({ success: true, settings: updated });
});

// ══════════════════════════════════════════════
// 14. FEE RECORDS & RECEIPTS
// ══════════════════════════════════════════════
router.get(
  "/fees",
  authenticate,
  (req, res, next) => {
    if (req.user.role === "student") {
      return enforceStudentAccess(req, res, next);
    }
    return requirePermission([
      "fees.plans_view",
      "fees.balance_view",
      "students.fee_status_view",
      "fees.reports_view",
      "fees.payments_record"
    ])(req, res, next);
  },
  async (req, res) => {
    try {
      const studentId = req.user.role === "student" ? req.user.assignedId : req.query.studentId;
      const records = await getFeeRecords(studentId);
      res.json(records);
    } catch (error) {
      res.status(500).json({ success: false, message: "Error loading fee records." });
    }
  }
);

router.post(
  "/fees",
  authenticate,
  requirePermission("fees.payments_record"),
  async (req, res) => {
    try {
      const { studentId, studentName, course, totalFee, paidAmount, dueDate } = req.body;
      if (!studentId || !studentName || !totalFee) {
        return res.status(400).json({ success: false, message: "Student ID, name, and total fee are required." });
      }
      if (!Number.isFinite(Number(totalFee)) || Number(totalFee) <= 0 ||
        !Number.isFinite(Number(paidAmount ?? 0)) || Number(paidAmount ?? 0) < 0 ||
        Number(paidAmount ?? 0) > Number(totalFee)) {
        return res.status(400).json({ success: false, message: "Fee must be positive and paid amount must be between zero and the total fee." });
      }
      const record = await createOrUpdateFeeRecord({ studentId, studentName, course: course || "Standard Course", totalFee, paidAmount: paidAmount || 0, dueDate });
      await logAction(req.user.name, req.user.roleName || req.user.role, "UPDATE_FEES", "FeeRecord", studentId, `Recorded payment: ₹${paidAmount}`);
      res.status(201).json({ success: true, message: "Fee record saved successfully.", record });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error saving fee record." });
    }
  }
);

router.put(
  "/fees/:id",
  authenticate,
  requirePermission("fees.payments_edit"),
  async (req, res) => {
    try {
      const { studentId, studentName, course, totalFee, paidAmount, dueDate } = req.body;
      const targetStudentId = studentId || req.params.id;
      if (!studentName || !Number.isFinite(Number(totalFee)) || Number(totalFee) <= 0 ||
        !Number.isFinite(Number(paidAmount ?? 0)) || Number(paidAmount ?? 0) < 0 ||
        Number(paidAmount ?? 0) > Number(totalFee)) {
        return res.status(400).json({ success: false, message: "Student name, a positive fee, and a paid amount within the fee total are required." });
      }
      const record = await createOrUpdateFeeRecord({ studentId: targetStudentId, studentName, course: course || "Standard Course", totalFee, paidAmount: paidAmount !== undefined ? paidAmount : 0, dueDate });
      await logAction(req.user.name, req.user.roleName || req.user.role, "UPDATE_FEES", "FeeRecord", targetStudentId, `Edited payment record: ₹${paidAmount}/${totalFee}`);
      res.json({ success: true, message: "Fee record updated successfully.", record });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error updating fee record." });
    }
  }
);

router.delete(
  "/fees/:id",
  authenticate,
  requirePermission("fees.settings_manage"),
  async (req, res) => {
    try {
      const { id } = req.params;
      await deleteFeeRecord(id);
      await logAction(req.user.name, req.user.roleName || req.user.role, "DELETE_FEE", "FeeRecord", id);
      res.json({ success: true, message: "Fee record deleted successfully." });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error deleting fee record." });
    }
  }
);

// ══════════════════════════════════════════════
// 15. SUBMISSION REVIEWS & GRADING (STAFF & ADMIN)
// ══════════════════════════════════════════════
router.get("/submissions", authenticate, requireRole(["admin", "teacher"]), async (req, res) => {
  try {
    const { assignmentId } = req.query;
    const list = await getAllSubmissions(assignmentId);
    res.json(list);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error loading submissions." });
  }
});

router.patch("/submissions/:id/grade", authenticate, requireRole(["admin", "teacher"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { marks, feedback } = req.body;
    const updated = await gradeSubmission(id, marks, feedback);
    if (!updated) return res.status(404).json({ success: false, message: "Submission not found." });

    await logAction(req.user.name, req.user.role, "GRADE_SUBMISSION", "Submission", id, `Awarded ${marks} marks`);
    res.json({ success: true, message: "Submission graded successfully.", submission: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error grading submission." });
  }
});

// ══════════════════════════════════════════════
// 16. DATA EXPORTS (CSV)
// ══════════════════════════════════════════════
router.get(
  "/admin/export/:type",
  authenticate,
  async (req, res) => {
    try {
      const { type } = req.params;
      const userPerms = req.user.permissions || [];
      const isSuper = req.user.isSuperAdmin || userPerms.includes("*");

      // Verify specific dataset export clearance
      let allowed = isSuper;
      if (!allowed) {
        if (type === "students") {
          allowed = userPerms.includes("students.export") || userPerms.includes("reports.students_view") || userPerms.includes("reports.export");
        } else if (type === "staff") {
          allowed = userPerms.includes("staff.export") || userPerms.includes("reports.staff_view") || userPerms.includes("reports.export");
        } else if (type === "leads") {
          allowed = userPerms.includes("inquiries.export") || userPerms.includes("reports.inquiries_view") || userPerms.includes("reports.export");
        } else if (type === "fees") {
          allowed = userPerms.includes("fees.reports_export") || userPerms.includes("reports.fees_view");
        } else if (type === "attendance") {
          allowed = userPerms.includes("attendance.reports_export") || userPerms.includes("reports.attendance_view") || userPerms.includes("reports.export");
        }
      }

      if (!allowed) {
        return res.status(403).json({
          success: false,
          error: "PERMISSION_DENIED",
          message: `Forbidden: You lack clearance to export the ${type} dataset.`
        });
      }

      let csv = "";
      const filename = `hunar_${type}_${Date.now()}.csv`;

      if (type === "students") {
        const students = await getAllStudents();
        csv = "Student ID,Name,Email,Phone,Course,Batch,Enrollment Status,Assigned Teacher,Enrollment Date\n";
        students.forEach((s) => {
          csv += `"${s.studentId}","${s.name}","${s.email}","${s.phone}","${s.course}","${s.batch}","${s.enrollmentStatus}","${s.assignedTeacher || ''}","${s.enrollmentDate}"\n`;
        });
      } else if (type === "staff") {
        const staff = await getAllStaff();
        csv = "Staff ID,Name,Email,Phone,Designation,Department,Role,Assigned Role,Employment Status\n";
        staff.forEach((s) => {
          csv += `"${s.staffId}","${s.name}","${s.email}","${s.phone || ''}","${s.designation}","${s.department}","${s.role}","${s.roleName || ''}","${s.employmentStatus}"\n`;
        });
      } else if (type === "leads") {
        const leads = await getAllLeads();
        csv = "ID,Name,Phone,Email,Course,Preferred Timing,Status,Created At\n";
        leads.forEach((l) => {
          csv += `"${l.id}","${l.name}","${l.phone}","${l.email}","${l.course}","${l.preferredTiming}","${l.status}","${l.createdAt}"\n`;
        });
      } else if (type === "fees") {
        const fees = await getFeeRecords();
        csv = "Student ID,Student Name,Course,Total Fee,Paid Amount,Due Amount,Due Date,Status,Receipt Number\n";
        fees.forEach((f) => {
          csv += `"${f.studentId}","${f.studentName}","${f.course}","${f.totalFee}","${f.paidAmount}","${f.dueAmount}","${f.dueDate}","${f.status}","${f.receiptNumber || ''}"\n`;
        });
      } else {
        return res.status(400).json({ success: false, message: "Invalid export type. Supported: students, staff, leads, fees" });
      }

      await logAction(req.user.name, req.user.roleName || req.user.role, "EXPORT_DATA", "Export", type);

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(csv);
    } catch (error) {
      res.status(500).json({ success: false, message: "Error exporting data." });
    }
  }
);

// ══════════════════════════════════════════════
// 17. PASSWORD RECOVERY FLOW
// ══════════════════════════════════════════════
router.post("/auth/forgot-password", passwordResetLimiter, async (req, res) => {
  try {
    const body = req.body || {};
    const rawIdentifier = String(body.email || body.loginId || body.identifier || "").trim();
    if (!rawIdentifier || rawIdentifier.length > 254) {
      return res.status(400).json({ success: false, message: "Please enter your Login ID or registered Email." });
    }

    const user = await findUserByEmailOrId(rawIdentifier);

    if (user) {
      const { rawToken, tokenHash, expiresAt } = generateInvitationToken();
      await updateUser(user._id || user.id, {
        invitationTokenHash: tokenHash,
        invitationExpires: expiresAt
      });
      const resetLink = buildFrontendUrl(`/activate/${encodeURIComponent(rawToken)}`);
      try {
        await sendEmail({
          to: user.email,
          subject: "Reset your Hunar portal password",
          text: `Hello ${user.name},\n\nUse this secure, one-time link to set a new password for your Hunar portal account:\n${resetLink}\n\nThis link expires in ${process.env.INVITATION_EXPIRY_HOURS || 72} hours. If you did not request a password reset, you can ignore this email.`
        });
      } catch (emailError) {
        console.error("[Password Reset Email Error]:", emailError.name);
        try {
          await updateUser(user._id || user.id, {
            invitationTokenHash: null,
            invitationExpires: null
          });
        } catch (cleanupError) {
          console.error("[Password Reset Cleanup Error]:", cleanupError.name);
        }
      }
      await logAction("System", "System", "REQUEST_PASSWORD_RESET", "User", user.assignedId || user.email);
    }

    return res.json({
      success: true,
      message: "If an account matches those details, reset instructions will be sent to its registered email address."
    });
  } catch (error) {
    console.error("[Forgot Password Error]:", error);
    res.status(500).json({ success: false, message: "Password recovery service error." });
  }
});

// ══════════════════════════════════════════════
// 18. WEBSITE CONTENT MANAGEMENT (CMS)
// ══════════════════════════════════════════════
router.get("/content", async (req, res) => {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, "content.json"), "utf-8");
    res.json(JSON.parse(raw));
  } catch {
    res.json({});
  }
});

router.put("/content/:section", authenticate, requireRole(["admin"]), async (req, res) => {
  try {
    const { section } = req.params;
    let content = {};
    try {
      const raw = await fs.readFile(path.join(DATA_DIR, "content.json"), "utf-8");
      content = JSON.parse(raw);
    } catch {}

    content[section] = { ...(content[section] || {}), ...req.body };
    await fs.writeFile(path.join(DATA_DIR, "content.json"), JSON.stringify(content, null, 2));
    await logAction(req.user.name, req.user.role, "UPDATE_CMS_CONTENT", "CMS", section);

    res.json({ success: true, message: `Updated ${section} content.`, data: content[section] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating content." });
  }
});

// ══════════════════════════════════════════════
// 19. FAQS MANAGER
// ══════════════════════════════════════════════
router.get("/faqs", async (req, res) => {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, "faqs.json"), "utf-8");
    res.json(JSON.parse(raw));
  } catch {
    res.json([]);
  }
});

router.post("/faqs", authenticate, requireRole(["admin"]), async (req, res) => {
  try {
    const { question, answer, category } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ success: false, message: "Question and answer required." });
    }
    let list = [];
    try {
      const raw = await fs.readFile(path.join(DATA_DIR, "faqs.json"), "utf-8");
      list = JSON.parse(raw);
    } catch {}

    const newItem = { id: "faq-" + Date.now(), question, answer, category: category || "General" };
    const updated = [newItem, ...list];
    await fs.writeFile(path.join(DATA_DIR, "faqs.json"), JSON.stringify(updated, null, 2));
    await logAction(req.user.name, req.user.role, "CREATE_FAQ", "FAQ", newItem.id);

    res.status(201).json({ success: true, item: newItem });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error saving FAQ." });
  }
});

router.delete("/faqs/:id", authenticate, requireRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    let list = [];
    try {
      const raw = await fs.readFile(path.join(DATA_DIR, "faqs.json"), "utf-8");
      list = JSON.parse(raw);
    } catch {}

    const filtered = list.filter((f) => f.id !== id);
    await fs.writeFile(path.join(DATA_DIR, "faqs.json"), JSON.stringify(filtered, null, 2));
    await logAction(req.user.name, req.user.role, "DELETE_FAQ", "FAQ", id);

    res.json({ success: true, message: "FAQ removed." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting FAQ." });
  }
});

// ══════════════════════════════════════════════
// 20. TESTIMONIALS & SUCCESS STORIES
// ══════════════════════════════════════════════
router.get("/testimonials", async (req, res) => {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, "testimonials.json"), "utf-8");
    res.json(JSON.parse(raw));
  } catch {
    res.json([]);
  }
});

router.post("/testimonials", authenticate, requireRole(["admin"]), async (req, res) => {
  try {
    const { name, role, quote, company, rating } = req.body;
    if (!name || !quote) {
      return res.status(400).json({ success: false, message: "Name and quote are required." });
    }
    let list = [];
    try {
      const raw = await fs.readFile(path.join(DATA_DIR, "testimonials.json"), "utf-8");
      list = JSON.parse(raw);
    } catch {}

    const newItem = { id: "test-" + Date.now(), name, role, quote, company: company || "", rating: Number(rating) || 5, featured: true };
    const updated = [newItem, ...list];
    await fs.writeFile(path.join(DATA_DIR, "testimonials.json"), JSON.stringify(updated, null, 2));
    await logAction(req.user.name, req.user.role, "CREATE_TESTIMONIAL", "Testimonial", newItem.name);

    res.status(201).json({ success: true, item: newItem });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error saving testimonial." });
  }
});

router.delete("/testimonials/:id", authenticate, requireRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    let list = [];
    try {
      const raw = await fs.readFile(path.join(DATA_DIR, "testimonials.json"), "utf-8");
      list = JSON.parse(raw);
    } catch {}

    const filtered = list.filter((t) => t.id !== id);
    await fs.writeFile(path.join(DATA_DIR, "testimonials.json"), JSON.stringify(filtered, null, 2));
    await logAction(req.user.name, req.user.role, "DELETE_TESTIMONIAL", "Testimonial", id);

    res.json({ success: true, message: "Testimonial removed." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting testimonial." });
  }
});

// ══════════════════════════════════════════════
// 21. GALLERY & MEDIA MANAGER
// ══════════════════════════════════════════════
router.get("/media", async (req, res) => {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, "media.json"), "utf-8");
    res.json(JSON.parse(raw));
  } catch {
    res.json([]);
  }
});

router.post("/media", authenticate, requireRole(["admin"]), async (req, res) => {
  try {
    const { title, url, category, caption } = req.body;
    if (!title || !url) {
      return res.status(400).json({ success: false, message: "Title and URL are required." });
    }
    let list = [];
    try {
      const raw = await fs.readFile(path.join(DATA_DIR, "media.json"), "utf-8");
      list = JSON.parse(raw);
    } catch {}

    const newItem = { id: "med-" + Date.now(), title, url, category: category || "Campus", caption: caption || "" };
    const updated = [newItem, ...list];
    await fs.writeFile(path.join(DATA_DIR, "media.json"), JSON.stringify(updated, null, 2));
    await logAction(req.user.name, req.user.role, "ADD_MEDIA", "Media", newItem.title);

    res.status(201).json({ success: true, item: newItem });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding media." });
  }
});

router.delete("/media/:id", authenticate, requireRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    let list = [];
    try {
      const raw = await fs.readFile(path.join(DATA_DIR, "media.json"), "utf-8");
      list = JSON.parse(raw);
    } catch {}

    const filtered = list.filter((m) => m.id !== id);
    await fs.writeFile(path.join(DATA_DIR, "media.json"), JSON.stringify(filtered, null, 2));
    await logAction(req.user.name, req.user.role, "DELETE_MEDIA", "Media", id);

    res.json({ success: true, message: "Media item removed." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting media." });
  }
});

export default router;
