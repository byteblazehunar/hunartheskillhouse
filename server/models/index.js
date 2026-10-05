import mongoose from "mongoose";

// 1. User Schema
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    normalizedEmail: { type: String, required: true, unique: true, trim: true, lowercase: true },
    assignedId: { type: String, trim: true, sparse: true, index: true }, // Student or Staff ID
    loginId: { type: String, trim: true, sparse: true, index: true }, // Canonical Login Identifier
    passwordHash: { type: String, default: null },
    passwordSet: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    role: {
      type: String,
      required: true,
      enum: ["admin", "teacher", "staff", "student"],
      default: "student"
    },
    roleId: { type: String, default: "" }, // Custom Role reference key (e.g. role-super-admin, role-receptionist)
    customRoleName: { type: String, default: "" },
    status: {
      type: String,
      enum: ["active", "pending_activation", "suspended"],
      default: "pending_activation"
    },
    invitationTokenHash: { type: String, default: null },
    invitationExpires: { type: Date, default: null },
    phone: { type: String, trim: true, default: "" },
    lastLogin: { type: Date, default: null }
  },
  { timestamps: true }
);

// 2. Student Schema
const StudentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    studentId: { type: String, required: true, unique: true, index: true },
    loginId: { type: String, trim: true, sparse: true, index: true }, // Canonical Login Identifier
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    course: { type: String, required: true },
    courseId: { type: String, default: "" },
    batch: { type: String, default: "" },
    batchId: { type: String, default: "" },
    enrollmentDate: { type: Date, default: Date.now },
    enrollmentYear: { type: Number },
    enrollmentStatus: {
      type: String,
      enum: ["active", "pending_activation", "completed", "suspended"],
      default: "pending_activation"
    },
    assignedTeacher: { type: String, default: "" },
    guardianContact: { type: String, default: "" }
  },
  { timestamps: true }
);

// 3. Staff Schema
const StaffSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    staffId: { type: String, required: true, unique: true, index: true },
    loginId: { type: String, trim: true, sparse: true, index: true }, // Canonical Login Identifier
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    designation: { type: String, required: true }, // e.g. Founder & Director, Senior Instructor
    department: { type: String, default: "Academic" },
    role: { type: String, enum: ["admin", "teacher", "staff"], default: "teacher" },
    roleId: { type: String, default: "" }, // Reference to custom Role.roleId
    roleName: { type: String, default: "" },
    joiningDate: { type: Date, default: Date.now },
    employmentStatus: { type: String, enum: ["active", "on_leave", "resigned"], default: "active" },
    assignedSubjects: [{ type: String }],
    assignedCourses: [{ type: String }],
    assignedBatches: [{ type: String }]
  },
  { timestamps: true }
);

// 4. Course Schema
const CourseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: String, default: "" },
    active: { type: Boolean, default: true },
    syllabus: [{ type: String }],
    assignedTeacher: { type: String, default: "" }
  },
  { timestamps: true }
);

// 5. Batch Schema
const BatchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    course: { type: String, required: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    timing: { type: String, default: "" },
    assignedTeacher: { type: String, default: "" },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// 6. Attendance Schema (with composite unique index to prevent duplicate records per class date)
const AttendanceSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, index: true },
    studentName: { type: String, required: true },
    batch: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true }, // YYYY-MM-DD
    status: { type: String, enum: ["present", "absent", "late"], default: "present" },
    markedBy: { type: String, default: "" }
  },
  { timestamps: true }
);
AttendanceSchema.index({ studentId: 1, batch: 1, date: 1 }, { unique: true });

// 7. Assignment Schema
const AssignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    course: { type: String, required: true },
    batch: { type: String, default: "" },
    deadline: { type: Date, required: true },
    maxMarks: { type: Number, default: 100 },
    published: { type: Boolean, default: true },
    assignedBy: { type: String, default: "" }
  },
  { timestamps: true }
);

// 8. Submission Schema
const SubmissionSchema = new mongoose.Schema(
  {
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
    assignmentTitle: { type: String, default: "" },
    studentId: { type: String, required: true, index: true },
    studentName: { type: String, required: true },
    content: { type: String, default: "" },
    fileUrl: { type: String, default: "" },
    status: { type: String, enum: ["submitted", "graded", "resubmit"], default: "submitted" },
    marks: { type: Number, default: null },
    feedback: { type: String, default: "" },
    submittedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// 9. Announcement Schema
const AnnouncementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    audience: { type: String, enum: ["all", "students", "staff"], default: "all" },
    authorName: { type: String, default: "" },
    authorRole: { type: String, default: "" },
    pinned: { type: Boolean, default: false },
    publishDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// 10. Audit Log Schema
const AuditLogSchema = new mongoose.Schema(
  {
    actorName: { type: String, required: true },
    actorRole: { type: String, required: true },
    action: { type: String, required: true }, // e.g. "CREATE_STUDENT", "GENERATE_ID", "MARK_ATTENDANCE"
    targetType: { type: String, required: true }, // e.g. "Student", "Staff", "Course"
    targetId: { type: String, default: "" },
    details: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// 11. Timetable Schema
const TimetableSchema = new mongoose.Schema(
  {
    course: { type: String, required: true },
    batch: { type: String, required: true },
    day: { type: String, required: true }, // e.g. "Monday", "Tuesday"
    time: { type: String, required: true }, // e.g. "10:00 AM - 1:00 PM"
    subject: { type: String, required: true },
    teacher: { type: String, default: "" },
    room: { type: String, default: "" }
  },
  { timestamps: true }
);

// 12. Fee Record Schema
const FeeRecordSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, index: true },
    studentName: { type: String, required: true },
    course: { type: String, required: true },
    totalFee: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 },
    dueDate: { type: String, default: "" },
    status: { type: String, enum: ["paid", "partial", "pending", "overdue"], default: "pending" },
    receiptNumber: { type: String, default: "" },
    lastPaymentDate: { type: Date, default: null }
  },
  { timestamps: true }
);

// 13. Role & Permissions Schema
const RoleSchema = new mongoose.Schema(
  {
    roleId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    department: { type: String, default: "General" },
    permissions: [{ type: String }],
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    isSystem: { type: Boolean, default: false },
    createdBy: { type: String, default: "System" }
  },
  { timestamps: true }
);

// Export Mongoose Models with model-reuse guard
export const User = mongoose.models.User || mongoose.model("User", UserSchema);
export const Student = mongoose.models.Student || mongoose.model("Student", StudentSchema);
export const Staff = mongoose.models.Staff || mongoose.model("Staff", StaffSchema);
export const Course = mongoose.models.Course || mongoose.model("Course", CourseSchema);
export const Batch = mongoose.models.Batch || mongoose.model("Batch", BatchSchema);
export const Attendance = mongoose.models.Attendance || mongoose.model("Attendance", AttendanceSchema);
export const Assignment = mongoose.models.Assignment || mongoose.model("Assignment", AssignmentSchema);
export const Submission = mongoose.models.Submission || mongoose.model("Submission", SubmissionSchema);
export const Announcement = mongoose.models.Announcement || mongoose.model("Announcement", AnnouncementSchema);
export const AuditLog = mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);
export const Timetable = mongoose.models.Timetable || mongoose.model("Timetable", TimetableSchema);
export const FeeRecord = mongoose.models.FeeRecord || mongoose.model("FeeRecord", FeeRecordSchema);
export const Role = mongoose.models.Role || mongoose.model("Role", RoleSchema);
