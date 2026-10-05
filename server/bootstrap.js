import {
  findUserByEmailOrId,
  createUser,
  createStaff,
  createStudent,
  createBatch,
  createAnnouncement,
  logAction
} from "./services/dataService.js";
import { hashPassword, generateInvitationToken } from "./utils/auth.js";
import { getAllCourses } from "./services/dataService.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "data");

function getInitialPassword(environmentKey) {
  const password = process.env[environmentKey];
  if (!password || password.startsWith("replace-with-")) {
    throw new Error(`Set ${environmentKey} to a private password to create the initial account.`);
  }
  return password;
}

export async function bootstrapSystem() {
  try {
    // 1. Check or Seed Admin (Gurlove Malhi)
    const existingAdmin = await findUserByEmailOrId("admin@hunarskillhouse.com");
    if (!existingAdmin) {
      console.log("[Bootstrap] Initializing primary administrator...");
      const passwordHash = await hashPassword(getInitialPassword("INITIAL_ADMIN_PASSWORD"));
      await createUser({
        name: "Gurlove Malhi",
        email: "admin@hunarskillhouse.com",
        role: "admin",
        assignedId: "HUN-A-0001",
        status: "active",
        passwordHash,
      });

      await createStaff({
        staffId: "HUN-T-0001",
        name: "Gurlove Malhi",
        email: "admin@hunarskillhouse.com",
        designation: "Founder & Director",
        department: "Administration & Strategy",
        role: "admin",
        assignedSubjects: ["Institute Leadership", "Entrepreneurship"],
        assignedCourses: ["All Programs"],
        assignedBatches: ["All Batches"]
      });

      await logAction("System Bootstrap", "System", "BOOTSTRAP_ADMIN", "User", "HUN-A-0001", "Primary admin created.");
    }

    // 2. Check or Seed Faculty (Paramjit Singh)
    const existingTeacher = await findUserByEmailOrId("paramjit@hunar.courses");
    if (!existingTeacher) {
      console.log("[Bootstrap] Initializing faculty member Paramjit Singh...");
      const passwordHash = await hashPassword(getInitialPassword("INITIAL_TEACHER_PASSWORD"));
      await createUser({
        name: "Paramjit Singh",
        email: "paramjit@hunar.courses",
        role: "teacher",
        assignedId: "HUN-T-0002",
        status: "active",
        passwordHash,
      });

      await createStaff({
        staffId: "HUN-T-0002",
        name: "Paramjit Singh",
        email: "paramjit@hunar.courses",
        designation: "Senior Lead Instructor",
        department: "Computer Technology & AI",
        role: "teacher",
        assignedSubjects: ["Web Development", "Artificial Intelligence (AI)", "Digital Marketing"],
        assignedCourses: [
          "Full Stack / Website Development",
          "Diploma in Digital Marketing",
          "30 Days AI Workshop"
        ],
        assignedBatches: ["Batch Alpha 2026", "AI Lab 2026"]
      });
    }

    // 2b. Check or Seed Operational Staff: Receptionist (Simran Kaur)
    const existingReceptionist = await findUserByEmailOrId("reception@hunarskillhouse.com");
    if (!existingReceptionist) {
      console.log("[Bootstrap] Initializing operational staff: Simran Kaur (Receptionist)...");
      const passwordHash = await hashPassword(getInitialPassword("INITIAL_RECEPTIONIST_PASSWORD"));
      await createUser({
        name: "Simran Kaur",
        email: "reception@hunarskillhouse.com",
        role: "staff",
        roleId: "role-receptionist",
        customRoleName: "Receptionist",
        assignedId: "HUN-T-0004",
        status: "active",
        passwordHash,
      });

      await createStaff({
        staffId: "HUN-T-0004",
        name: "Simran Kaur",
        email: "reception@hunarskillhouse.com",
        designation: "Front Desk Executive",
        department: "Front Desk & Reception",
        role: "staff",
        roleId: "role-receptionist",
        roleName: "Receptionist",
        assignedSubjects: ["Inquiry Desk"],
        assignedCourses: ["All Programs"],
        assignedBatches: ["All Batches"]
      });
    }

    // 2c. Check or Seed Operational Staff: Accountant (Rajesh Kumar)
    const existingAccountant = await findUserByEmailOrId("accounts@hunarskillhouse.com");
    if (!existingAccountant) {
      console.log("[Bootstrap] Initializing operational staff: Rajesh Kumar (Accountant)...");
      const passwordHash = await hashPassword(getInitialPassword("INITIAL_ACCOUNTANT_PASSWORD"));
      await createUser({
        name: "Rajesh Kumar",
        email: "accounts@hunarskillhouse.com",
        role: "staff",
        roleId: "role-accountant",
        customRoleName: "Accountant",
        assignedId: "HUN-T-0005",
        status: "active",
        passwordHash,
      });

      await createStaff({
        staffId: "HUN-T-0005",
        name: "Rajesh Kumar",
        email: "accounts@hunarskillhouse.com",
        designation: "Chief Accounts Officer",
        department: "Accounts & Finance",
        role: "staff",
        roleId: "role-accountant",
        roleName: "Accountant",
        assignedSubjects: ["Fee Management"],
        assignedCourses: ["All Programs"],
        assignedBatches: ["All Batches"]
      });
    }

    // 3. Comprehensive Idempotent Sync from server/data/*.json to MongoDB
    const { isDbConnected } = await import("./config/db.js");
    if (isDbConnected()) {
      const models = await import("./models/index.js");

      // A. Courses
      try {
        const raw = await fs.readFile(path.join(DATA_DIR, "courses.json"), "utf-8");
        const list = JSON.parse(raw);
        for (const c of list) {
          await models.Course.findOneAndUpdate(
            { slug: c.slug },
            {
              $set: {
                title: c.title,
                slug: c.slug,
                category: c.category,
                description: c.description,
                duration: c.duration,
                active: c.active !== false,
                assignedTeacher: c.assignedTeacher || "Paramjit Singh",
                syllabus: c.syllabus || []
              }
            },
            { upsert: true }
          );
        }
      } catch (err) {
        console.warn("[Bootstrap] Courses sync notice:", err.message);
      }

      // B. Batches
      try {
        const raw = await fs.readFile(path.join(DATA_DIR, "batches.json"), "utf-8");
        const list = JSON.parse(raw);
        for (const b of list) {
          await models.Batch.findOneAndUpdate(
            { name: b.name },
            {
              $set: {
                name: b.name,
                course: b.course,
                timing: b.timing || "Morning Batch (10:00 AM - 1:00 PM)",
                assignedTeacher: b.assignedTeacher || "Paramjit Singh",
                active: b.active !== false
              }
            },
            { upsert: true }
          );
        }
      } catch (err) {
        console.warn("[Bootstrap] Batches sync notice:", err.message);
      }

      // C. Staff
      try {
        const raw = await fs.readFile(path.join(DATA_DIR, "staff.json"), "utf-8");
        const list = JSON.parse(raw);
        for (const s of list) {
          await models.Staff.findOneAndUpdate(
            { staffId: s.staffId },
            {
              $set: {
                staffId: s.staffId,
                name: s.name,
                email: s.email,
                phone: s.phone || "",
                designation: s.designation,
                department: s.department || "Academic",
                role: s.role || "teacher",
                assignedSubjects: s.assignedSubjects || [],
                assignedCourses: s.assignedCourses || [],
                assignedBatches: s.assignedBatches || []
              }
            },
            { upsert: true }
          );
        }
      } catch (err) {
        console.warn("[Bootstrap] Staff sync notice:", err.message);
      }

      // D. Users
      try {
        const raw = await fs.readFile(path.join(DATA_DIR, "users.json"), "utf-8");
        const list = JSON.parse(raw);
        for (const u of list) {
          const norm = (u.email || "").toLowerCase().trim();
          if (!norm) continue;
          await models.User.findOneAndUpdate(
            { normalizedEmail: norm },
            {
              $set: {
                name: u.name,
                email: u.email,
                normalizedEmail: norm,
                assignedId: u.assignedId,
                role: u.role || "student",
                status: u.status || "pending_activation",
                phone: u.phone || "",
                passwordHash: u.passwordHash || null,
                invitationTokenHash: u.invitationTokenHash || null,
                invitationExpires: u.invitationExpires || null
              }
            },
            { upsert: true }
          );
        }
      } catch (err) {
        console.warn("[Bootstrap] Users sync notice:", err.message);
      }

      // E. Students
      try {
        const raw = await fs.readFile(path.join(DATA_DIR, "students.json"), "utf-8");
        const list = JSON.parse(raw);
        for (const s of list) {
          await models.Student.findOneAndUpdate(
            { studentId: s.studentId },
            {
              $set: {
                studentId: s.studentId,
                name: s.name,
                email: s.email,
                phone: s.phone,
                course: s.course,
                batch: s.batch || "Batch Alpha 2026",
                enrollmentDate: s.enrollmentDate ? new Date(s.enrollmentDate) : new Date(),
                enrollmentStatus: s.enrollmentStatus || "pending_activation",
                assignedTeacher: s.assignedTeacher || "Paramjit Singh"
              }
            },
            { upsert: true }
          );
        }
      } catch (err) {
        console.warn("[Bootstrap] Students sync notice:", err.message);
      }

      // F. Timetable
      try {
        const raw = await fs.readFile(path.join(DATA_DIR, "timetable.json"), "utf-8");
        const list = JSON.parse(raw);
        for (const t of list) {
          await models.Timetable.findOneAndUpdate(
            { course: t.course, batch: t.batch, day: t.day, time: t.time },
            {
              $set: {
                course: t.course,
                batch: t.batch,
                day: t.day,
                time: t.time,
                subject: t.subject,
                teacher: t.teacher || "Paramjit Singh",
                room: t.room || "Lab 1 (Silicon Room)"
              }
            },
            { upsert: true }
          );
        }
      } catch (err) {
        console.warn("[Bootstrap] Timetable sync notice:", err.message);
      }

      // G. Fee Records
      try {
        const raw = await fs.readFile(path.join(DATA_DIR, "fee_records.json"), "utf-8");
        const list = JSON.parse(raw);
        for (const f of list) {
          await models.FeeRecord.findOneAndUpdate(
            { studentId: f.studentId },
            {
              $set: {
                studentId: f.studentId,
                studentName: f.studentName,
                course: f.course,
                totalFee: Number(f.totalFee) || 0,
                paidAmount: Number(f.paidAmount) || 0,
                dueAmount: Number(f.dueAmount) || 0,
                dueDate: f.dueDate || "2026-10-15",
                status: f.status || "pending",
                receiptNumber: f.receiptNumber || "",
                lastPaymentDate: f.lastPaymentDate ? new Date(f.lastPaymentDate) : null
              }
            },
            { upsert: true }
          );
        }
      } catch (err) {
        console.warn("[Bootstrap] Fee records sync notice:", err.message);
      }

      // H. Announcements
      try {
        const raw = await fs.readFile(path.join(DATA_DIR, "announcements.json"), "utf-8");
        const list = JSON.parse(raw);
        for (const a of list) {
          await models.Announcement.findOneAndUpdate(
            { title: a.title },
            {
              $set: {
                title: a.title,
                message: a.message,
                audience: a.audience || "all",
                authorName: a.authorName || "Gurlove Malhi",
                authorRole: a.authorRole || "Founder & Director",
                publishDate: a.publishDate ? new Date(a.publishDate) : new Date()
              }
            },
            { upsert: true }
          );
        }
      } catch (err) {
        console.warn("[Bootstrap] Announcements sync notice:", err.message);
      }

      // I. Attendance
      try {
        const raw = await fs.readFile(path.join(DATA_DIR, "attendance.json"), "utf-8");
        const list = JSON.parse(raw);
        for (const att of list) {
          await models.Attendance.findOneAndUpdate(
            { studentId: att.studentId, batch: att.batch, date: att.date },
            {
              $set: {
                studentId: att.studentId,
                studentName: att.studentName,
                batch: att.batch,
                date: att.date,
                status: att.status || "present",
                markedBy: att.markedBy || "System Admin"
              }
            },
            { upsert: true }
          );
        }
      } catch (err) {
        console.warn("[Bootstrap] Attendance sync notice:", err.message);
      }

      // J. Roles & Permissions Sync
      try {
        const raw = await fs.readFile(path.join(DATA_DIR, "roles.json"), "utf-8");
        const list = JSON.parse(raw);
        for (const r of list) {
          await models.Role.findOneAndUpdate(
            { roleId: r.roleId },
            {
              $set: {
                roleId: r.roleId,
                name: r.name,
                department: r.department || "General",
                description: r.description || "",
                permissions: r.permissions || [],
                status: r.status || "active",
                isSystem: r.isSystem === true,
                createdBy: r.createdBy || "System"
              }
            },
            { upsert: true }
          );
        }
      } catch (err) {
        console.warn("[Bootstrap] Roles sync notice:", err.message);
      }
    }

    console.log("[Bootstrap] All JSON institute datasets safely synchronized with database.");
  } catch (error) {
    console.error("[Bootstrap Error]:", error);
  }
}
