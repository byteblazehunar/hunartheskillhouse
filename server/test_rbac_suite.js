import express from "express";
import http from "http";
import apiRouter from "./apiRouter.js";
import { signToken } from "./utils/auth.js";
import { getAllRoles, getRoleById, deleteRole, deleteStaff, deleteUser, deleteStudent } from "./services/dataService.js";

async function runRBACTestSuite() {
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    throw new Error("Set INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD before running the RBAC test suite.");
  }

  console.log("=================================================");
  console.log("   HUNAR ROLE & DUTY MANAGEMENT (RBAC) TEST SUITE");
  console.log("=================================================\n");

  const app = express();
  app.use(express.json());
  app.use("/api", apiRouter);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;
  console.log(`[TEST SERVER] Running on port ${port}\n`);

  let testPassed = 0;
  let testFailed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      testPassed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      testFailed++;
    }
  }

  try {
    // -----------------------------------------------------------------
    // 0. AUTHENTICATION & LOGIN AS SUPER ADMIN
    // -----------------------------------------------------------------
    console.log("--- TEST 0: Super Admin Login ---");
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: adminEmail, password: adminPassword })
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200 && loginData.success, "Super Admin login succeeds");
    assert(loginData.user && loginData.user.isSuperAdmin === true, "Super Admin user returned with isSuperAdmin=true");
    assert(loginData.user.permissions.includes("*"), "Super Admin has wildcard '*' permission");
    const adminToken = loginData.token;

    // -----------------------------------------------------------------
    // 1. PERMISSION LIBRARY & SEED ROLES
    // -----------------------------------------------------------------
    console.log("\n--- TEST 1: Permission Library & Categories ---");
    const libRes = await fetch(`${baseUrl}/roles/permissions/library`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const libData = await libRes.json();
    assert(libRes.status === 200 && libData.success, "Permission library endpoint returns 200");
    assert(Object.keys(libData.categories).length === 15, "Permission library has all 15 operational categories (A to O)");
    assert(Object.keys(libData.templates).length === 7, "All 7 role templates are available (Receptionist, Teacher, Accountant, etc.)");

    // -----------------------------------------------------------------
    // 2. CREATE ROLE FROM SCRATCH (CUSTOM COMBINATION OF DUTIES)
    // -----------------------------------------------------------------
    console.log("\n--- TEST 2: Create Role From Scratch ---");
    const scratchRoleData = {
      name: "Laboratory Technical Coordinator",
      description: "Oversees computer laboratories, student attendance, and practical assignments.",
      department: "Technical Operations",
      status: "active",
      permissions: [
        "dashboard.view",
        "attendance.student_view",
        "attendance.student_mark",
        "assignments.view",
        "assignments.submissions_view"
      ]
    };
    const createScratchRes = await fetch(`${baseUrl}/roles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify(scratchRoleData)
    });
    const scratchResult = await createScratchRes.json();
    assert(createScratchRes.status === 201 && scratchResult.success, "Create role from scratch returns 201 Created");
    assert(scratchResult.role && scratchResult.role.permissions.length === 5, "Scratch role contains exact 5 assigned duty permissions");
    const scratchRoleId = scratchResult.role.roleId;

    // -----------------------------------------------------------------
    // 3. CREATE ROLE FROM TEMPLATE & CUSTOMIZE
    // -----------------------------------------------------------------
    console.log("\n--- TEST 3: Create Role From Template & Customize ---");
    const templateRoleData = {
      name: "Front Desk & Student Counselor",
      description: "Handles inquiries, admission consultation, and basic student fee balance inquiries.",
      department: "Front Desk & Admissions",
      status: "active",
      templateKey: "template-receptionist",
      permissions: [
        "dashboard.view",
        "inquiries.view",
        "inquiries.create",
        "inquiries.edit",
        "inquiries.status_update",
        "inquiries.followup_notes",
        "inquiries.admissions_view",
        "students.fee_status_view",
        "fees.balance_view"
      ]
    };
    const createTemplateRes = await fetch(`${baseUrl}/roles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify(templateRoleData)
    });
    const templateResult = await createTemplateRes.json();
    assert(createTemplateRes.status === 201 && templateResult.success, "Create role from template returns 201 Created");
    assert(templateResult.role.permissions.includes("fees.balance_view"), "Customized template role includes fee balance view duty");
    assert(!templateResult.role.permissions.includes("fees.payments_record"), "Customized template role does NOT include payment recording duty");
    const templateRoleId = templateResult.role.roleId;

    // -----------------------------------------------------------------
    // 4. PERSISTENCE CHECK AFTER RE-FETCH
    // -----------------------------------------------------------------
    console.log("\n--- TEST 4: Persistence Verification ---");
    const fetchRoleRes = await fetch(`${baseUrl}/roles/${scratchRoleId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const fetchRoleData = await fetchRoleRes.json();
    assert(fetchRoleRes.status === 200 && fetchRoleData.role.roleId === scratchRoleId, "Role persists and is retrievable by ID");
    assert(fetchRoleData.role.permissions.length === 5, "Role permissions persisted identically in database");

    // -----------------------------------------------------------------
    // 5. DUPLICATE EXISTING ROLE
    // -----------------------------------------------------------------
    console.log("\n--- TEST 5: Duplicate Role as Starting Point ---");
    const dupRes = await fetch(`${baseUrl}/roles/${scratchRoleId}/duplicate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ name: "Junior Lab Coordinator (Copy)" })
    });
    const dupData = await dupRes.json();
    assert(dupRes.status === 201 && dupData.success, "Duplicate role returns 201 Created");
    assert(dupData.role.name === "Junior Lab Coordinator (Copy)", "Duplicate role has custom copy name");
    assert(dupData.role.permissions.length === scratchRoleData.permissions.length, "Duplicate role inherits duty permissions");
    const duplicateRoleId = dupData.role.roleId;

    // -----------------------------------------------------------------
    // 6. EDIT ROLE DETAILS & PERMISSIONS
    // -----------------------------------------------------------------
    console.log("\n--- TEST 6: Edit Role Details & Permissions ---");
    const editRes = await fetch(`${baseUrl}/roles/${duplicateRoleId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: "Senior Lab Technician",
        department: "Technical Facilities",
        permissions: ["dashboard.view", "assignments.view"]
      })
    });
    const editData = await editRes.json();
    assert(editRes.status === 200 && editData.success, "Edit role returns 200 OK");
    assert(editData.role.name === "Senior Lab Technician", "Role name updated successfully");
    assert(editData.role.permissions.length === 2, "Role permissions list updated to 2 duties");

    // -----------------------------------------------------------------
    // 7. DEACTIVATE AND ACTIVATE ROLE
    // -----------------------------------------------------------------
    console.log("\n--- TEST 7: Activate / Deactivate Role ---");
    const deactRes = await fetch(`${baseUrl}/roles/${duplicateRoleId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: "inactive" })
    });
    const deactData = await deactRes.json();
    assert(deactRes.status === 200 && deactData.role.status === "inactive", "Role successfully marked inactive");

    const reactRes = await fetch(`${baseUrl}/roles/${duplicateRoleId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: "active" })
    });
    const reactData = await reactRes.json();
    assert(reactRes.status === 200 && reactData.role.status === "active", "Role successfully reactivated");

    // -----------------------------------------------------------------
    // 8. SUPER ADMIN PROTECTION (CANNOT BE DELETED OR DEACTIVATED)
    // -----------------------------------------------------------------
    console.log("\n--- TEST 8: Super Admin Protection ---");
    const superDelRes = await fetch(`${baseUrl}/roles/role-super-admin`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(superDelRes.status === 400 || superDelRes.status === 403, "Super Admin role deletion blocked with 400/403");

    const superDeactRes = await fetch(`${baseUrl}/roles/role-super-admin/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: "inactive" })
    });
    assert(superDeactRes.status === 400 || superDeactRes.status === 403, "Super Admin deactivation blocked with 400/403");

    // -----------------------------------------------------------------
    // 9. ASSIGN CUSTOM ROLE TO STAFF MEMBER (CREATE STAFF)
    // -----------------------------------------------------------------
    console.log("\n--- TEST 9: Assign Role to Staff Member ---");
    const staffEmail = `simran.${Date.now()}@hunarskillhouse.com`;
    const createStaffRes = await fetch(`${baseUrl}/staff`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: "Simran Kaur",
        email: staffEmail,
        phone: "+91 98765 43210",
        designation: "Front Desk Officer",
        department: "Front Desk & Admissions",
        role: "staff",
        roleId: templateRoleId,
        assignedSubjects: ["Inquiry Processing", "Admissions Helpdesk"],
        assignedCourses: ["Full Stack Web Development"]
      })
    });
    const staffResult = await createStaffRes.json();
    assert(createStaffRes.status === 201 && staffResult.success, "Staff member created with custom role assigned");
    assert(staffResult.staff.roleId === templateRoleId, "Staff record stores assigned custom role ID");
    assert(staffResult.staff.staffId.startsWith("HUN-T-"), "Atomic staff ID generated: " + staffResult.staff.staffId);
    const createdStaffId = staffResult.staff.staffId;
    const staffRawToken = staffResult.invitation.token;

    // Activate staff account and set password
    const activateStaffRes = await fetch(`${baseUrl}/auth/activate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: staffRawToken, password: "StaffPassword2026!" })
    });
    const activateStaffData = await activateStaffRes.json();
    assert(activateStaffRes.status === 200 && activateStaffData.success, "Staff account activated successfully via invitation token");

    // Login as the receptionist staff member
    const recLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: staffEmail, password: "StaffPassword2026!" })
    });
    const recLoginData = await recLoginRes.json();
    assert(recLoginRes.status === 200 && recLoginData.success, "Receptionist login succeeds");
    assert(recLoginData.user.roleId === templateRoleId, "Logged in user has templateRoleId: " + templateRoleId);
    assert(recLoginData.user.isSuperAdmin === false, "Logged in receptionist isSuperAdmin is false");
    const receptionistToken = recLoginData.token;

    // -----------------------------------------------------------------
    // 10. REASSIGN STAFF ROLE (STAFF EDIT)
    // -----------------------------------------------------------------
    console.log("\n--- TEST 10: Reassign Staff Member's Role ---");
    const updateStaffRoleRes = await fetch(`${baseUrl}/staff/${createdStaffId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        roleId: scratchRoleId
      })
    });
    const updateStaffData = await updateStaffRoleRes.json();
    assert(updateStaffRoleRes.status === 200 && updateStaffData.success, "Staff role updated successfully");
    assert(updateStaffData.staff.roleId === scratchRoleId, "Staff record reflects newly assigned role ID");

    // Put staff back on templateRoleId for safe deletion test
    await fetch(`${baseUrl}/staff/${createdStaffId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ roleId: templateRoleId })
    });

    // -----------------------------------------------------------------
    // 11. ROLE DELETION BLOCKED WHILE STAFF STILL ASSIGNED
    // -----------------------------------------------------------------
    console.log("\n--- TEST 11: Role Deletion Blocked with Assigned Staff Warning ---");
    const blockedDeleteRes = await fetch(`${baseUrl}/roles/${templateRoleId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const blockedDeleteData = await blockedDeleteRes.json();
    assert(blockedDeleteRes.status === 400, "Role deletion blocked with HTTP 400 when staff assigned");
    assert(blockedDeleteData.assignedCount > 0, "Response warns that role is currently in use by staff member(s)");
    assert(blockedDeleteData.assignedStaff.length > 0, "Response returns list of assigned staff members for reassignment");

    // -----------------------------------------------------------------
    // 12. REASSIGN AND SAFE DELETE FLOW
    // -----------------------------------------------------------------
    console.log("\n--- TEST 12: Safe Reassign and Delete Flow ---");
    const safeDeleteRes = await fetch(`${baseUrl}/roles/${templateRoleId}/reassign-and-delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ targetRoleId: scratchRoleId })
    });
    const safeDeleteData = await safeDeleteRes.json();
    assert(safeDeleteRes.status === 200 && safeDeleteData.success, "Reassign-and-delete completed successfully");
    assert(safeDeleteData.reassignedCount >= 1, "Staff members safely migrated to target role");

    // Verify role is deleted
    const checkDeletedRes = await fetch(`${baseUrl}/roles/${templateRoleId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(checkDeletedRes.status === 404, "Original role no longer exists after deletion");

    // -----------------------------------------------------------------
    // 13. BACKEND ENFORCEMENT & LEAST PRIVILEGE (UNAUTHORIZED REJECTION)
    // -----------------------------------------------------------------
    console.log("\n--- TEST 13: Granular Backend Authorization & Least Privilege ---");

    // A) Receptionist trying to create a role (Requires admin.roles_create) -> MUST BE REJECTED 403
    const recCreateRoleRes = await fetch(`${baseUrl}/roles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${receptionistToken}`
      },
      body: JSON.stringify({ name: "Hacked Admin Role", permissions: ["*"] })
    });
    assert(recCreateRoleRes.status === 403, "Receptionist directly calling POST /api/roles is REJECTED with 403 Forbidden");

    // B) Receptionist trying to delete a role (Requires admin.roles_delete) -> MUST BE REJECTED 403
    const recDeleteRoleRes = await fetch(`${baseUrl}/roles/${scratchRoleId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${receptionistToken}` }
    });
    assert(recDeleteRoleRes.status === 403, "Receptionist directly calling DELETE /api/roles/:id is REJECTED with 403 Forbidden");

    // C) Receptionist trying to record a fee payment (Requires fees.payments_record) -> MUST BE REJECTED 403
    const recPostFeeRes = await fetch(`${baseUrl}/fees`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${receptionistToken}`
      },
      body: JSON.stringify({
        studentId: "HUN-S-2026-0001",
        studentName: "Amanpreet Kaur",
        paidAmount: 5000
      })
    });
    assert(recPostFeeRes.status === 403, "Receptionist directly calling POST /api/fees is REJECTED with 403 Forbidden");

    // D) Receptionist viewing fee status (Has students.fee_status_view / fees.balance_view) -> MUST BE PERMITTED 200
    // Staff was migrated to scratchRoleId in TEST 12. Let's create an accountant or receptionist role with read-only fees to test GET /api/fees
    const roFeeRole = await fetch(`${baseUrl}/roles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: "Fee Inspector Test Role",
        permissions: ["dashboard.view", "students.fee_status_view", "fees.balance_view"]
      })
    });
    const roFeeRoleData = await roFeeRole.json();
    const roFeeRoleId = roFeeRoleData.role.roleId;

    // Assign Simran to roFeeRoleId
    await fetch(`${baseUrl}/staff/${createdStaffId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ roleId: roFeeRoleId })
    });

    // Make fresh GET /api/fees call with Simran's token
    const recGetFeeRes = await fetch(`${baseUrl}/fees`, {
      headers: { Authorization: `Bearer ${receptionistToken}` }
    });
    assert(recGetFeeRes.status === 200, "User with fees.balance_view duty calling GET /api/fees is PERMITTED (200 OK)");

    // -----------------------------------------------------------------
    // 14. REGRESSION VERIFICATION: CREATE STUDENT WITH ATOMIC ID
    // -----------------------------------------------------------------
    console.log("\n--- TEST 14: Existing Feature Regression Test (Create Student) ---");
    const studentEmail = `student.test.${Date.now()}@hunarskillhouse.com`;
    const createStudentRes = await fetch(`${baseUrl}/students`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: "Navjot Singh",
        email: studentEmail,
        phone: "+91 99887 76655",
        course: "Full Stack Web Development",
        batch: "Batch Alpha 2026"
      })
    });
    const studentData = await createStudentRes.json();
    assert(createStudentRes.status === 201 && studentData.success, "Student registration succeeds without regressions");
    assert(studentData.student && studentData.student.studentId.startsWith("HUN-S-"), "Atomic Student ID format verified: " + studentData.student?.studentId);
    assert(studentData.invitation && studentData.invitation.token, "Invitation token generated for student");

    // Cleanup test artifacts
    await deleteRole(scratchRoleId);
    await deleteRole(duplicateRoleId);
    await deleteRole(roFeeRoleId);
    if (createdStaffId) await deleteStaff(createdStaffId);
    if (studentData.student?.studentId) await deleteStudent(studentData.student.studentId);

    console.log("\n=================================================");
    console.log(`TEST SUMMARY: ${testPassed} Passed, ${testFailed} Failed`);
    console.log("=================================================");

    server.close();
    process.exit(testFailed === 0 ? 0 : 1);
  } catch (err) {
    console.error("Test execution exception:", err);
    server.close();
    process.exit(1);
  }
}

runRBACTestSuite();
