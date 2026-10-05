import express from "express";
import http from "http";
import apiRouter from "./apiRouter.js";
import { connectDB } from "./config/db.js";
import { User, Student, Staff } from "./models/index.js";
import { deleteStudent, deleteStaff, deleteUser } from "./services/dataService.js";

async function runAuditSuite() {
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error("Set INITIAL_ADMIN_PASSWORD before running the authentication audit suite.");
  }

  console.log("==================================================================");
  console.log("   HUNAR THE SKILL HOUSE — COMPLETE AUTHENTICATION AUDIT SUITE");
  console.log("==================================================================\n");

  await connectDB();

  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/api", apiRouter);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;
  console.log(`[TEST SERVER] Mounted on port ${port}\n`);

  let passed = 0;
  let failed = 0;

  function assert(cond, msg) {
    if (cond) {
      console.log(`  ✓ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${msg}`);
      failed++;
    }
  }

  let adminToken = null;
  let testStudentId = null;
  let studentInviteToken = null;
  let studentToken = null;

  let testStaffId = null;
  let staffInviteToken = null;
  let staffToken = null;

  try {
    // -------------------------------------------------------------
    // TEST 1: ADMIN LOGIN
    // -------------------------------------------------------------
    console.log("--- TEST 1: Admin Login & Profile ---");
    const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loginId: "admin@hunarskillhouse.com", password: adminPassword })
    });
    const adminData = await adminLoginRes.json();
    assert(adminLoginRes.status === 200 && adminData.success, "Admin login succeeds");
    assert(adminData.user?.isSuperAdmin === true, "Admin has isSuperAdmin=true");
    assert(adminData.user?.loginId === "HUN-A-0001", "Admin returns canonical loginId HUN-A-0001");
    adminToken = adminData.token;

    // Verify Admin Overview Access
    const overviewRes = await fetch(`${baseUrl}/admin/overview`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(overviewRes.status === 200, "Admin overview endpoint accessible");

    // -------------------------------------------------------------
    // TEST 2: STUDENT CREATION & ATOMIC ID GENERATION
    // -------------------------------------------------------------
    console.log("\n--- TEST 2: Student Creation by Admin ---");
    const testEmail = `student.audit.${Date.now()}@example.com`;
    const createStuRes = await fetch(`${baseUrl}/students`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: "Audit Test Student",
        email: testEmail,
        phone: "+91 98888 77777",
        course: "Full Stack Web Development",
        batch: "Batch Alpha 2026"
      })
    });
    const createStuData = await createStuRes.json();
    assert(createStuRes.status === 201 && createStuData.success, "Student created successfully");
    testStudentId = createStuData.student?.studentId;
    studentInviteToken = createStuData.invitation?.token;
    assert(testStudentId && testStudentId.startsWith("HUN-S-"), `Generated valid Student ID: ${testStudentId}`);
    assert(studentInviteToken && studentInviteToken.length > 20, "Generated invitation token");

    // Verify MongoDB state
    const mongoUser = await User.findOne({ email: testEmail }).lean();
    assert(mongoUser !== null, "User record saved in MongoDB");
    assert(mongoUser.loginId === testStudentId, "User record has canonical loginId matching studentId");
    assert(mongoUser.status === "pending_activation", "Initial status is pending_activation");
    assert(mongoUser.passwordSet === false, "passwordSet is false initially");

    // -------------------------------------------------------------
    // TEST 3: STUDENT PASSWORD SETUP & TOKEN VERIFICATION
    // -------------------------------------------------------------
    console.log("\n--- TEST 3: Student Password Setup & Verification ---");
    // Verify invitation token
    const verifyStuRes = await fetch(`${baseUrl}/auth/verify-invitation/${studentInviteToken}`);
    const verifyStuData = await verifyStuRes.json();
    assert(verifyStuRes.status === 200 && verifyStuData.valid, "Invitation token verification succeeds");
    assert(verifyStuData.user?.loginId === testStudentId, "Verification returns correct canonical loginId");
    assert(verifyStuData.user?.portalName === "Student Portal", "Verification returns 'Student Portal'");

    // Test Weak Password Rejection
    const weakPassRes = await fetch(`${baseUrl}/auth/activate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: studentInviteToken, password: "weak" })
    });
    const weakPassData = await weakPassRes.json();
    assert(weakPassRes.status === 400 && weakPassData.error === "WEAK_PASSWORD", "Weak password rejected (< 8 chars)");

    // Test Successful Activation with Strong Password
    const actRes = await fetch(`${baseUrl}/auth/activate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: studentInviteToken,
        password: "StudentPass@2026",
        confirmPassword: "StudentPass@2026"
      })
    });
    const actData = await actRes.json();
    assert(actRes.status === 200 && actData.success, "Password setup & activation succeeds");
    assert(actData.user?.loginId === testStudentId, "Activation response displays canonical Login ID");

    // Verify MongoDB state after activation
    const activeMongoUser = await User.findOne({ email: testEmail }).lean();
    assert(activeMongoUser.status === "active", "MongoDB status updated to active");
    assert(activeMongoUser.passwordSet === true, "MongoDB passwordSet updated to true");
    assert(activeMongoUser.isActive === true, "MongoDB isActive updated to true");
    assert(activeMongoUser.passwordHash && activeMongoUser.passwordHash.startsWith("$2"), "Password stored as bcrypt hash");
    assert(activeMongoUser.invitationTokenHash === null, "Single-use invitation token invalidated");

    // -------------------------------------------------------------
    // TEST 4: STUDENT LOGIN VALIDATION
    // -------------------------------------------------------------
    console.log("\n--- TEST 4: Student Login Variations ---");
    // Wrong password
    const wrongPassRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loginId: testStudentId, password: "WrongPassword999" })
    });
    assert(wrongPassRes.status === 401, "Wrong password rejected with 401");

    // Wrong Login ID
    const wrongIdRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loginId: "HUN-S-9999-9999", password: "StudentPass@2026" })
    });
    assert(wrongIdRes.status === 401, "Non-existent Login ID rejected with 401");

    // Correct Login ID (Exact uppercase)
    const stuLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loginId: testStudentId, password: "StudentPass@2026" })
    });
    const stuLoginData = await stuLoginRes.json();
    assert(stuLoginRes.status === 200 && stuLoginData.success, "Login succeeds with exact uppercase Login ID");
    assert(stuLoginData.user?.role === "student", "Logged-in user has role=student");
    studentToken = stuLoginData.token;

    // Lowercase Login ID (e.g. mobile virtual keyboard typing)
    const lowerStuLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loginId: testStudentId.toLowerCase(), password: "StudentPass@2026" })
    });
    assert(lowerStuLoginRes.status === 200, "Login succeeds with lowercase Login ID");

    // Email login
    const emailLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loginId: testEmail, password: "StudentPass@2026" })
    });
    assert(emailLoginRes.status === 200, "Login succeeds with registered Email");

    // -------------------------------------------------------------
    // TEST 5: STUDENT ACCESS & RBAC AUTHORIZATION
    // -------------------------------------------------------------
    console.log("\n--- TEST 5: Student Portal Access & Route Protection ---");
    // Authorized Student Portal Access
    const stuPortalRes = await fetch(`${baseUrl}/portal/student`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const stuPortalData = await stuPortalRes.json();
    assert(stuPortalRes.status === 200 && stuPortalData.success, "Student accesses /portal/student successfully");
    assert(stuPortalData.profile?.studentId === testStudentId, "Student portal returns student's profile");

    // Unauthorized Access: Student tries to access Teacher Portal
    const stuTeachRes = await fetch(`${baseUrl}/portal/staff`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(stuTeachRes.status === 403, "Student blocked from /portal/staff with 403 Forbidden");

    // Unauthorized Access: Student tries to access Admin Overview
    const stuAdminRes = await fetch(`${baseUrl}/admin/overview`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(stuAdminRes.status === 403, "Student blocked from /admin/overview with 403 Forbidden");

    // Unauthenticated Access: Missing Token
    const unauthRes = await fetch(`${baseUrl}/portal/student`);
    assert(unauthRes.status === 401, "Unauthenticated request blocked with 401 Unauthorized");

    // -------------------------------------------------------------
    // TEST 6: STAFF CREATION, PASSWORD SETUP & LOGIN
    // -------------------------------------------------------------
    console.log("\n--- TEST 6: Staff Account Lifecycle ---");
    const testStaffEmail = `staff.audit.${Date.now()}@hunar.courses`;
    const createStaffRes = await fetch(`${baseUrl}/staff`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: "Audit Reception Staff",
        email: testStaffEmail,
        phone: "+91 97777 66666",
        designation: "Front Desk Coordinator",
        department: "Reception",
        roleId: "role-receptionist",
        assignedSubjects: ["Front Desk"],
        assignedCourses: ["All Programs"]
      })
    });
    const createStaffData = await createStaffRes.json();
    assert(createStaffRes.status === 201 && createStaffData.success, "Staff created with custom role");
    testStaffId = createStaffData.staff?.staffId;
    staffInviteToken = createStaffData.invitation?.token;
    assert(testStaffId && testStaffId.startsWith("HUN-T-"), `Generated valid Staff ID: ${testStaffId}`);

    // Verify Staff invitation token
    const verifyStaffRes = await fetch(`${baseUrl}/auth/verify-invitation/${staffInviteToken}`);
    const verifyStaffData = await verifyStaffRes.json();
    assert(verifyStaffRes.status === 200 && verifyStaffData.user?.loginId === testStaffId, "Staff invitation verified with Login ID");

    // Activate Staff Password
    const actStaffRes = await fetch(`${baseUrl}/auth/activate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: staffInviteToken,
        password: "StaffPass@2026",
        confirmPassword: "StaffPass@2026"
      })
    });
    assert(actStaffRes.status === 200, "Staff password activated successfully");

    // Staff Login with exact ID
    const staffLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loginId: testStaffId, password: "StaffPass@2026" })
    });
    const staffLoginData = await staffLoginRes.json();
    assert(staffLoginRes.status === 200 && staffLoginData.user?.role === "staff", "Staff login succeeds with role=staff");
    staffToken = staffLoginData.token;

    // Staff Login with lowercase ID
    const lowerStaffLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loginId: testStaffId.toLowerCase(), password: "StaffPass@2026" })
    });
    assert(lowerStaffLoginRes.status === 200, "Staff login succeeds with lowercase Staff ID");

    // Staff Authorization checks: Receptionist can view leads, but blocked from modifying roles
    const leadsRes = await fetch(`${baseUrl}/leads`, {
      headers: { Authorization: `Bearer ${staffToken}` }
    });
    assert(leadsRes.status === 200, "Staff receptionist can view inquiries/leads");

    const rolesManageRes = await fetch(`${baseUrl}/roles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${staffToken}`
      },
      body: JSON.stringify({ name: "Hacked Role", permissions: ["*"] })
    });
    assert(rolesManageRes.status === 403, "Staff blocked from creating roles with 403 Forbidden");

    // -------------------------------------------------------------
    // TEST 7: PASSWORD RESET / RE-INVITE
    // -------------------------------------------------------------
    console.log("\n--- TEST 7: Password Reset / Re-Invitation Flow ---");
    // Admin generates a new invite for student
    const resendStuRes = await fetch(`${baseUrl}/students/${testStudentId}/invite`, {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const resendStuData = await resendStuRes.json();
    assert(resendStuRes.status === 200 && resendStuData.token, "Admin generates fresh activation token for student");
    const newStuToken = resendStuData.token;

    // Set new password
    const resetPassRes = await fetch(`${baseUrl}/auth/activate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: newStuToken,
        password: "NewStudentPass@2026",
        confirmPassword: "NewStudentPass@2026"
      })
    });
    assert(resetPassRes.status === 200, "Student successfully set new password");

    // Old password must fail
    const oldLoginFail = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loginId: testStudentId, password: "StudentPass@2026" })
    });
    assert(oldLoginFail.status === 401, "Old password rejected after password reset");

    // New password must succeed
    const newLoginSuccess = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loginId: testStudentId, password: "NewStudentPass@2026" })
    });
    assert(newLoginSuccess.status === 200, "New password succeeds after password reset");

    // Admin generates fresh invite for staff
    const resendStaffRes = await fetch(`${baseUrl}/staff/${testStaffId}/invite`, {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const resendStaffData = await resendStaffRes.json();
    assert(resendStaffRes.status === 200 && resendStaffData.token, "Admin generates fresh activation token for staff");

    // -------------------------------------------------------------
    // CLEANUP
    // -------------------------------------------------------------
    console.log("\n--- CLEANUP: Removing Test Records ---");
    if (testStudentId) await deleteStudent(testStudentId);
    if (testStaffId) await deleteStaff(testStaffId);
    await deleteUser(testEmail);
    await deleteUser(testStaffEmail);
    console.log("  ✓ Test records cleaned from database.");

  } catch (err) {
    console.error("Unhandled test suite exception:", err);
    failed++;
  } finally {
    server.close();
  }

  console.log("\n==================================================================");
  console.log(` AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================================");
  if (failed > 0) process.exit(1);
  process.exit(0);
}

runAuditSuite();
