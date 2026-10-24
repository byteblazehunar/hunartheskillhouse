import { verifyToken } from "../utils/auth.js";
import { findUserById, getRoleById, getRoleByName } from "../services/dataService.js";

// Helper to resolve role and attached permissions
export async function resolveUserPermissions(user) {
  // If user has specific roleId, look it up
  let roleDoc = null;
  if (user.roleId) {
    roleDoc = await getRoleById(user.roleId);
  }

  // Fallback to role name or system default based on user.role
  // Super admin email fallback is read from env — never hardcoded in source
  const superAdminEmail = (process.env.ADMIN_EMAIL || process.env.INITIAL_ADMIN_EMAIL || "").trim().toLowerCase();
  if (!roleDoc) {
    if (
      user.role === "admin" ||
      user.assignedId === "HUN-A-0001" ||
      (superAdminEmail && user.email === superAdminEmail)
    ) {
      roleDoc = await getRoleById("role-super-admin");
    } else if (user.role === "teacher") {
      roleDoc = await getRoleById("role-teacher");
    } else if (user.role === "student") {
      return {
        roleId: "role-student",
        roleName: "Student",
        roleStatus: "active",
        isSuperAdmin: false,
        permissions: ["student.portal_view", "fees.view_own", "attendance.view_own"]
      };
    } else if (user.role === "staff") {
      roleDoc = await getRoleById("role-office-administrator");
    }
  }

  const isSuperAdmin =
    user.role === "admin" ||
    user.assignedId === "HUN-A-0001" ||
    (superAdminEmail && user.email === superAdminEmail) ||
    (roleDoc && (roleDoc.isSystem || roleDoc.roleId === "role-super-admin" || (roleDoc.permissions && roleDoc.permissions.includes("*"))));

  const permissions = isSuperAdmin
    ? ["*"]
    : (roleDoc && roleDoc.status !== "inactive" ? roleDoc.permissions || [] : []);

  return {
    roleId: roleDoc ? roleDoc.roleId : (isSuperAdmin ? "role-super-admin" : (user.role === "student" ? "role-student" : "role-staff")),
    roleName: roleDoc ? roleDoc.name : (isSuperAdmin ? "Super Admin" : (user.role === "student" ? "Student" : "Staff Member")),
    roleStatus: roleDoc ? roleDoc.status : "active",
    isSuperAdmin: !!isSuperAdmin,
    permissions
  };
}

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "AUTHENTICATION_REQUIRED",
        message: "Access token missing or invalid. Please sign in."
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: "TOKEN_EXPIRED_OR_INVALID",
        message: "Your session has expired. Please log in again."
      });
    }

    const user = await findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "USER_NOT_FOUND",
        message: "User account no longer exists."
      });
    }

    if (user.status === "suspended") {
      return res.status(403).json({
        success: false,
        error: "ACCOUNT_SUSPENDED",
        message: "Your account has been suspended by the institute administration."
      });
    }

    const roleData = await resolveUserPermissions(user);

    // Check if non-superadmin assigned role has been deactivated
    if (!roleData.isSuperAdmin && roleData.roleStatus === "inactive") {
      return res.status(403).json({
        success: false,
        error: "ROLE_DEACTIVATED",
        message: "Your assigned staff role has been deactivated by administration. Contact an administrator."
      });
    }

    // Attach verified user with full permissions to request
    req.user = {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      roleId: roleData.roleId,
      roleName: roleData.roleName,
      isSuperAdmin: roleData.isSuperAdmin,
      permissions: roleData.permissions,
      assignedId: user.assignedId || user.loginId,
      loginId: user.loginId || user.assignedId,
      status: user.status
    };

    next();
  } catch (err) {
    // Log category only — never log token, password, or full stack trace to stdout in production
    const isProduction = process.env.NODE_ENV === "production";
    if (!isProduction) {
      console.error("[Auth Middleware Error]:", err);
    } else {
      console.error("[Auth Middleware Error]: Authentication processing failed.", err?.message || "");
    }
    return res.status(500).json({
      success: false,
      error: "AUTH_PROCESSING_ERROR",
      message: "An internal authentication error occurred."
    });
  }
}

// Fine-grained Permission Middleware
// Accepts a single permission key, an array of keys (any match by default), or options object { matchAll: true }
export function requirePermission(requiredPerms, options = { matchAll: false }) {
  const permList = Array.isArray(requiredPerms) ? requiredPerms : [requiredPerms];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "AUTHENTICATION_REQUIRED",
        message: "Authentication required."
      });
    }

    // Super Admin has unrestricted wildcard access
    if (req.user.isSuperAdmin || (req.user.permissions && req.user.permissions.includes("*"))) {
      return next();
    }

    const userPerms = req.user.permissions || [];

    const hasAccess = options.matchAll
      ? permList.every((p) => userPerms.includes(p))
      : permList.some((p) => userPerms.includes(p));

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: "PERMISSION_DENIED",
        message: `Forbidden: You lack the required duty permission [${permList.join(", ")}] to perform this action.`,
        requiredPermissions: permList
      });
    }

    next();
  };
}

// Role-Based Access Control Middleware (Backwards Compatible + Permission Aware)
export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "AUTHENTICATION_REQUIRED",
        message: "Authentication required."
      });
    }

    // Super Admin passes any role check
    if (req.user.isSuperAdmin || (req.user.permissions && req.user.permissions.includes("*"))) {
      return next();
    }

    const isTeacherRole = req.user.roleId === "role-teacher" && allowedRoles.includes("teacher");
    if (allowedRoles.includes(req.user.role) || isTeacherRole) {
      return next();
    }

    // If allowedRoles contains 'admin', and user is not superadmin and has no admin permissions
    return res.status(403).json({
      success: false,
      error: "PERMISSION_DENIED",
      message: `Forbidden: This resource requires one of [${allowedRoles.join(", ")}] privileges.`
    });
  };
}

// Student Data Isolation Guard
export function enforceStudentAccess(req, res, next) {
  if (req.user?.isSuperAdmin || req.user?.role === "admin" || req.user?.role === "teacher") {
    return next();
  }

  // Also allow staff with student profile view permission
  if (req.user?.permissions && (req.user.permissions.includes("students.view") || req.user.permissions.includes("students.profile_view"))) {
    return next();
  }

  const requestedStudentId = (req.params && req.params.studentId) || (req.query && req.query.studentId) || (req.body && req.body.studentId);
  if (requestedStudentId && req.user?.assignedId && requestedStudentId !== req.user.assignedId) {
    return res.status(403).json({
      success: false,
      error: "ISOLATION_VIOLATION",
      message: "Security Notice: You are only authorized to access your own student records."
    });
  }

  next();
}
