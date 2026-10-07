import mongoose from "mongoose";
import { isDbConnected } from "../config/db.js";
import {
  User,
  Student,
  Staff,
  Course,
  Batch,
  Attendance,
  Assignment,
  Submission,
  Announcement,
  AuditLog,
  Timetable,
  FeeRecord,
  Role,
  Lead
} from "../models/index.js";

const DISABLED_FALLBACK_MESSAGE = "MongoDB must be connected. Local JSON storage and demo data are disabled.";

// Local JSON storage is intentionally disabled. The app must use MongoDB-backed data only.
async function readJson(file, defaultValue = []) {
  throw new Error(DISABLED_FALLBACK_MESSAGE);
}

async function writeJson(file, data) {
  throw new Error(DISABLED_FALLBACK_MESSAGE);
}

async function mutateJson(file, mutator, defaultValue = []) {
  throw new Error(DISABLED_FALLBACK_MESSAGE);
}

// ==========================================
// 1. AUDIT LOGS
// ==========================================
export async function logAction(actorName, actorRole, action, targetType, targetId, details = "") {
  const entry = {
    id: "audit-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
    actorName,
    actorRole,
    action,
    targetType,
    targetId,
    details,
    timestamp: new Date().toISOString()
  };

  if (isDbConnected()) {
    try {
      await AuditLog.create(entry);
      return entry;
    } catch (e) {
      throw new Error(`MongoDB could not write the audit log: ${e.message}`);
    }
  }

  const logs = await readJson("audit_logs.json", []);
  await writeJson("audit_logs.json", [entry, ...logs.slice(0, 499)]); // Keep last 500
  return entry;
}

export async function getAuditLogs(limit = 100) {
  if (isDbConnected()) {
    try {
      return await AuditLog.find().sort({ timestamp: -1 }).limit(limit).lean();
    } catch (e) {
      throw new Error(`MongoDB could not read audit logs: ${e.message}`);
    }
  }
  const logs = await readJson("audit_logs.json", []);
  return logs.slice(0, limit);
}

// ==========================================
// 2. USERS & AUTH
// ==========================================
function escapeRegex(str) {
  return String(str || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function findUserByEmailOrId(identifier) {
  if (!identifier) return null;
  const clean = String(identifier).trim();
  const normLower = clean.toLowerCase();
  const normUpper = clean.toUpperCase();
  const escaped = escapeRegex(clean);

  if (isDbConnected()) {
    try {
      const user = await User.findOne({
        $or: [
          { normalizedEmail: normLower },
          { email: normLower },
          { assignedId: clean },
          { assignedId: normUpper },
          { assignedId: { $regex: new RegExp(`^${escaped}$`, "i") } },
          { loginId: clean },
          { loginId: normUpper },
          { loginId: { $regex: new RegExp(`^${escaped}$`, "i") } }
        ]
      }).lean();
      return user;
    } catch (e) {
      throw new Error(`MongoDB could not find the user: ${e.message}`);
    }
  }

  const users = await readJson("users.json", []);
  return (
    users.find((u) => {
      const uEmail = (u.normalizedEmail || u.email || "").toLowerCase();
      const uAssigned = (u.assignedId || "").toLowerCase();
      const uLogin = (u.loginId || "").toLowerCase();
      return uEmail === normLower || uAssigned === normLower || uLogin === normLower;
    }) || null
  );
}

export async function findUserById(id) {
  if (!id) return null;
  const idStr = String(id).trim();

  if (isDbConnected()) {
    try {
      if (mongoose.Types.ObjectId.isValid(id) && (typeof id === "object" || idStr.match(/^[0-9a-fA-F]{24}$/))) {
        const user = await User.findById(id).lean();
        if (user) return user;
      }
      return await User.findOne({
        $or: [{ assignedId: idStr }, { loginId: idStr }, { normalizedEmail: idStr.toLowerCase() }]
      }).lean();
    } catch (error) {
      throw new Error(`MongoDB could not find the user: ${error.message}`);
    }
  }
  const users = await readJson("users.json", []);
  return (
    users.find(
      (u) =>
        String(u._id || u.id) === idStr ||
        (u.assignedId && u.assignedId.toLowerCase() === idStr.toLowerCase()) ||
        (u.loginId && u.loginId.toLowerCase() === idStr.toLowerCase())
    ) || null
  );
}

export async function findUserByInvitationTokenHash(tokenHash) {
  if (!tokenHash) return null;
  if (isDbConnected()) {
    try {
      return await User.findOne({
        invitationTokenHash: tokenHash,
        invitationExpires: { $gt: new Date() }
      }).lean();
    } catch (error) {
      throw new Error(`MongoDB could not find the invitation: ${error.message}`);
    }
  }

  const users = await readJson("users.json", []);
  const now = new Date();
  return (
    users.find(
      (u) =>
        u.invitationTokenHash === tokenHash &&
        u.invitationExpires &&
        new Date(u.invitationExpires) > now
    ) || null
  );
}

export async function consumeInvitationToken(tokenHash, updates) {
  if (!isDbConnected()) throw new Error(DISABLED_FALLBACK_MESSAGE);
  try {
    return await User.findOneAndUpdate(
      {
        invitationTokenHash: tokenHash,
        invitationExpires: { $gt: new Date() }
      },
      {
        $set: {
          ...updates,
          invitationTokenHash: null,
          invitationExpires: null
        }
      },
      { new: true, runValidators: true }
    ).lean();
  } catch (error) {
    throw new Error(`MongoDB could not consume the invitation token: ${error.message}`);
  }
}

export async function createUser(userData) {
  const normEmail = (userData.email || "").trim().toLowerCase();
  const cleanAssignedId = String(userData.assignedId || userData.loginId || userData.studentId || userData.staffId || "").trim();
  const isActive = userData.isActive !== undefined ? userData.isActive : userData.status === "active";
  const passwordSet = userData.passwordSet !== undefined ? userData.passwordSet : !!userData.passwordHash;

  const fullData = {
    ...userData,
    _id: userData._id || "user-" + Date.now(),
    email: (userData.email || "").trim(),
    normalizedEmail: normEmail,
    assignedId: cleanAssignedId || undefined,
    loginId: cleanAssignedId || undefined,
    isActive,
    passwordSet,
    createdAt: new Date().toISOString()
  };

  if (isDbConnected()) {
    try {
      const mongoData = { ...fullData };
      if (typeof mongoData._id === "string" && !mongoData._id.match(/^[0-9a-fA-F]{24}$/)) {
        delete mongoData._id;
      }
      const created = await User.findOneAndUpdate(
        { normalizedEmail: normEmail },
        { $set: mongoData },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      if (!created) throw new Error("MongoDB did not return the created user.");
      return created.toObject();
    } catch (e) {
      throw new Error(`MongoDB could not create the user: ${e.message}`);
    }
  }

  await mutateJson("users.json", (users) => [
    fullData,
    ...users.filter((u) => u.normalizedEmail !== normEmail && (!cleanAssignedId || u.assignedId !== cleanAssignedId))
  ]);
  return fullData;
}

export async function updateUser(id, updateFields) {
  if (!id) return null;
  let updatedDoc = null;
  const idStr = String(id).trim();
  const normLower = idStr.toLowerCase();

  const finalUpdates = { ...updateFields };
  if (finalUpdates.assignedId && !finalUpdates.loginId) {
    finalUpdates.loginId = finalUpdates.assignedId;
  }
  if (finalUpdates.loginId && !finalUpdates.assignedId) {
    finalUpdates.assignedId = finalUpdates.loginId;
  }
  if (finalUpdates.passwordHash && (finalUpdates.status === "active" || updateFields.status === "active")) {
    finalUpdates.passwordSet = true;
    finalUpdates.isActive = true;
    finalUpdates.status = "active";
  } else if (finalUpdates.status === "suspended") {
    finalUpdates.isActive = false;
  } else if (finalUpdates.status === "active") {
    finalUpdates.isActive = true;
  }

  if (isDbConnected()) {
    try {
      let query;
      if (mongoose.Types.ObjectId.isValid(id) && (typeof id === "object" || idStr.match(/^[0-9a-fA-F]{24}$/))) {
        query = {
          $or: [
            { _id: id },
            { assignedId: idStr },
            { assignedId: idStr.toUpperCase() },
            { loginId: idStr },
            { loginId: idStr.toUpperCase() },
            { normalizedEmail: normLower }
          ]
        };
      } else {
        query = {
          $or: [
            { assignedId: idStr },
            { assignedId: idStr.toUpperCase() },
            { loginId: idStr },
            { loginId: idStr.toUpperCase() },
            { normalizedEmail: normLower },
            { email: idStr }
          ]
        };
      }
      updatedDoc = await User.findOneAndUpdate(query, { $set: finalUpdates }, { returnDocument: "after" }).lean();
    } catch (err) {
      throw new Error(`MongoDB could not update the user: ${err.message}`);
    }
    return updatedDoc;
  }

  const users = await readJson("users.json", []);
  let found = null;
  const newUsers = users.map((u) => {
    const isMatch =
      String(u._id || u.id) === idStr ||
      (u.assignedId && u.assignedId.toLowerCase() === normLower) ||
      (u.loginId && u.loginId.toLowerCase() === normLower) ||
      (u.normalizedEmail && u.normalizedEmail.toLowerCase() === normLower) ||
      (u.email && u.email.toLowerCase() === normLower);
    if (isMatch) {
      found = { ...u, ...finalUpdates, updatedAt: new Date().toISOString() };
      return found;
    }
    return u;
  });

  if (found) {
    await writeJson("users.json", newUsers);
  }
  return updatedDoc || found;
}

export async function getAllUsers() {
  if (isDbConnected()) {
    try {
      const users = await User.find({}, { passwordHash: 0, invitationTokenHash: 0 }).sort({ createdAt: -1 }).lean();
      return users;
    } catch (error) {
      throw new Error(`MongoDB could not read users: ${error.message}`);
    }
  }
  const users = await readJson("users.json", []);
  return users.map(({ passwordHash, invitationTokenHash, ...u }) => u);
}

export async function deleteUser(id) {
  let targetAssignedId = null;

  if (isDbConnected()) {
    try {
      const isObjectId = typeof id === "string" && id.match(/^[0-9a-fA-F]{24}$/);
      const userQuery = isObjectId ? { $or: [{ _id: id }, { assignedId: id }] } : { assignedId: id };
      const user = await User.findOne(userQuery).lean();
      if (user) {
        targetAssignedId = user.assignedId;
        if (user.role === "admin" && (
          user.assignedId === "HUN-A-0001" ||
          user.email === "admin@hunarskillhouse.com" ||
          user.email === "byteblaze.hunar@gmail.com"
        )) {
          throw new Error("Primary administrator account cannot be deleted.");
        }
        await User.deleteOne({ _id: user._id });
        if (targetAssignedId) {
          await Student.deleteMany({ studentId: targetAssignedId });
          await Staff.deleteMany({ staffId: targetAssignedId });
          await FeeRecord.deleteMany({ studentId: targetAssignedId });
        }
      }
    } catch (e) {
      if (e.message.includes("Primary administrator")) throw e;
      throw new Error(`MongoDB could not delete the user: ${e.message}`);
    }
    return true;
  }

  await mutateJson("users.json", (users) => {
    const user = users.find((u) => String(u._id || u.id) === String(id) || u.assignedId === id);
    if (user) {
      targetAssignedId = targetAssignedId || user.assignedId;
      if (user.role === "admin" && (
        user.assignedId === "HUN-A-0001" ||
        user.email === "admin@hunarskillhouse.com" ||
        user.email === "byteblaze.hunar@gmail.com"
      )) {
        throw new Error("Primary administrator account cannot be deleted.");
      }
    }
    return users.filter((u) => String(u._id || u.id) !== String(id) && u.assignedId !== id);
  });

  if (targetAssignedId) {
    await mutateJson("students.json", (list) => list.filter((s) => s.studentId !== targetAssignedId));
    await mutateJson("staff.json", (list) => list.filter((s) => s.staffId !== targetAssignedId));
    await mutateJson("fee_records.json", (list) => list.filter((f) => f.studentId !== targetAssignedId));
  }

  return true;
}

// ==========================================
// 3. STUDENTS
// ==========================================
export async function getAllStudents(filters = {}) {
  let list = [];
  if (isDbConnected()) {
    try {
      const query = {};
      if (filters.course) query.course = filters.course;
      if (filters.batch) query.batch = filters.batch;
      if (filters.status) query.enrollmentStatus = filters.status;
      list = await Student.find(query).sort({ createdAt: -1 }).lean();
      return list;
    } catch (error) {
      throw new Error(`MongoDB could not read students: ${error.message}`);
    }
  }

  let jsonList = await readJson("students.json", []);
  if (filters.course) jsonList = jsonList.filter((s) => s.course === filters.course);
  if (filters.batch) jsonList = jsonList.filter((s) => s.batch === filters.batch);
  if (filters.status) jsonList = jsonList.filter((s) => s.enrollmentStatus === filters.status);
  return jsonList;
}

export async function getStudentByStudentId(studentId) {
  if (!studentId) return null;
  const clean = String(studentId).trim();
  const upper = clean.toUpperCase();
  const lower = clean.toLowerCase();
  const escaped = escapeRegex(clean);

  if (isDbConnected()) {
    try {
      const student = await Student.findOne({
        $or: [
          { studentId: clean },
          { studentId: upper },
          { studentId: { $regex: new RegExp(`^${escaped}$`, "i") } },
          { loginId: clean },
          { loginId: upper },
          { loginId: { $regex: new RegExp(`^${escaped}$`, "i") } }
        ]
      }).lean();
      return student;
    } catch (error) {
      throw new Error(`MongoDB could not find the student: ${error.message}`);
    }
  }
  const list = await readJson("students.json", []);
  return (
    list.find(
      (s) =>
        (s.studentId && s.studentId.toLowerCase() === lower) ||
        (s.loginId && s.loginId.toLowerCase() === lower)
    ) || null
  );
}

export async function getStudentByEmail(email) {
  const norm = email.trim().toLowerCase();
  if (isDbConnected()) {
    try {
      const student = await Student.findOne({ email: norm }).lean();
      return student;
    } catch (error) {
      throw new Error(`MongoDB could not find the student: ${error.message}`);
    }
  }
  const list = await readJson("students.json", []);
  return list.find((s) => s.email.toLowerCase() === norm) || null;
}

export async function createStudent(data) {
  const cleanId = String(data.studentId || data.loginId || "").trim();
  const record = {
    ...data,
    studentId: cleanId,
    loginId: cleanId,
    _id: data._id || "student-" + Date.now(),
    createdAt: new Date().toISOString()
  };

  if (isDbConnected()) {
    try {
      const mongoRecord = { ...record };
      if (typeof mongoRecord._id === "string" && !mongoRecord._id.match(/^[0-9a-fA-F]{24}$/)) {
        delete mongoRecord._id;
      }
      const created = await Student.findOneAndUpdate(
        { studentId: cleanId },
        { $set: mongoRecord },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      if (!created) throw new Error("MongoDB did not return the created student.");
      return created.toObject();
    } catch (e) {
      throw new Error(`MongoDB could not create the student: ${e.message}`);
    }
  }

  await mutateJson("students.json", (list) => [
    record,
    ...list.filter((s) => s.studentId !== cleanId && s.loginId !== cleanId)
  ]);
  return record;
}

export async function updateStudent(studentId, updateFields) {
  let updatedDoc = null;
  if (isDbConnected()) {
    try {
      updatedDoc = await Student.findOneAndUpdate(
        { studentId },
        { $set: updateFields },
        { new: true }
      ).lean();
    } catch (error) {
      throw new Error(`MongoDB could not update the student: ${error.message}`);
    }
    return updatedDoc;
  }

  const list = await readJson("students.json", []);
  let found = null;
  const updated = list.map((s) => {
    if (s.studentId === studentId) {
      found = { ...s, ...updateFields, updatedAt: new Date().toISOString() };
      return found;
    }
    return s;
  });

  if (found) await writeJson("students.json", updated);
  return updatedDoc || found;
}

export async function deleteStudent(studentId) {
  if (isDbConnected()) {
    try {
      const isObjectId = typeof studentId === "string" && studentId.match(/^[0-9a-fA-F]{24}$/);
      const studentQuery = isObjectId ? { $or: [{ studentId }, { _id: studentId }] } : { studentId };
      const student = await Student.findOne(studentQuery).lean();
      const sId = student?.studentId || studentId;
      await Student.deleteMany({ studentId: sId });
      if (isObjectId) await Student.deleteMany({ _id: studentId });
      await User.deleteMany({ assignedId: sId });
      await FeeRecord.deleteMany({ studentId: sId });
    } catch (e) {
      throw new Error(`MongoDB could not delete the student: ${e.message}`);
    }
    return true;
  }

  await mutateJson("students.json", (list) =>
    list.filter((s) => s.studentId !== studentId && String(s._id || s.id) !== String(studentId))
  );

  await mutateJson("users.json", (list) =>
    list.filter((u) => u.assignedId !== studentId && String(u._id || u.id) !== String(studentId))
  );

  await mutateJson("fee_records.json", (list) =>
    list.filter((f) => f.studentId !== studentId)
  );

  return true;
}

// ==========================================
// 4. STAFF
// ==========================================
export async function getAllStaff() {
  if (isDbConnected()) {
    try {
      return await Staff.find().sort({ designation: 1 }).lean();
    } catch (error) {
      throw new Error(`MongoDB could not read staff: ${error.message}`);
    }
  }
  return await readJson("staff.json", []);
}

export async function getStaffByStaffId(staffId) {
  if (!staffId) return null;
  const clean = String(staffId).trim();
  const upper = clean.toUpperCase();
  const lower = clean.toLowerCase();
  const escaped = escapeRegex(clean);

  if (isDbConnected()) {
    try {
      const member = await Staff.findOne({
        $or: [
          { staffId: clean },
          { staffId: upper },
          { staffId: { $regex: new RegExp(`^${escaped}$`, "i") } },
          { loginId: clean },
          { loginId: upper },
          { loginId: { $regex: new RegExp(`^${escaped}$`, "i") } }
        ]
      }).lean();
      return member;
    } catch (error) {
      throw new Error(`MongoDB could not find the staff member: ${error.message}`);
    }
  }
  const list = await readJson("staff.json", []);
  return (
    list.find(
      (s) =>
        (s.staffId && s.staffId.toLowerCase() === lower) ||
        (s.loginId && s.loginId.toLowerCase() === lower)
    ) || null
  );
}

export async function getStaffByEmail(email) {
  const norm = email.trim().toLowerCase();
  if (isDbConnected()) {
    try {
      const member = await Staff.findOne({ email: norm }).lean();
      return member;
    } catch (error) {
      throw new Error(`MongoDB could not find the staff member: ${error.message}`);
    }
  }
  const list = await readJson("staff.json", []);
  return list.find((s) => s.email.toLowerCase() === norm) || null;
}

export async function createStaff(data) {
  const cleanId = String(data.staffId || data.loginId || "").trim();
  const record = {
    ...data,
    staffId: cleanId,
    loginId: cleanId,
    _id: data._id || "staff-" + Date.now(),
    createdAt: new Date().toISOString()
  };

  if (isDbConnected()) {
    try {
      const mongoRecord = { ...record };
      if (typeof mongoRecord._id === "string" && !mongoRecord._id.match(/^[0-9a-fA-F]{24}$/)) {
        delete mongoRecord._id;
      }
      const created = await Staff.findOneAndUpdate(
        { staffId: cleanId },
        { $set: mongoRecord },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      if (!created) throw new Error("MongoDB did not return the created staff member.");
      return created.toObject();
    } catch (e) {
      throw new Error(`MongoDB could not create the staff member: ${e.message}`);
    }
  }

  await mutateJson("staff.json", (list) => [
    record,
    ...list.filter((s) => s.staffId !== cleanId && s.loginId !== cleanId)
  ]);
  return record;
}

export async function updateStaff(staffId, updateFields) {
  let updatedDoc = null;
  if (isDbConnected()) {
    try {
      updatedDoc = await Staff.findOneAndUpdate(
        { staffId },
        { $set: updateFields },
        { new: true }
      ).lean();
    } catch (error) {
      throw new Error(`MongoDB could not update the staff member: ${error.message}`);
    }
    return updatedDoc;
  }

  const list = await readJson("staff.json", []);
  let found = null;
  const updated = list.map((s) => {
    if (s.staffId === staffId) {
      found = { ...s, ...updateFields, updatedAt: new Date().toISOString() };
      return found;
    }
    return s;
  });

  if (found) await writeJson("staff.json", updated);
  return updatedDoc || found;
}

export async function deleteStaff(staffId) {
  if (staffId === "HUN-A-0001") {
    throw new Error("The primary institute administrator account cannot be deleted.");
  }

  if (isDbConnected()) {
    try {
      const isObjectId = typeof staffId === "string" && staffId.match(/^[0-9a-fA-F]{24}$/);
      const staffQuery = isObjectId ? { $or: [{ staffId }, { _id: staffId }] } : { staffId };
      const member = await Staff.findOne(staffQuery).lean();
      const sId = member?.staffId || staffId;
      await Staff.deleteMany({ staffId: sId });
      if (isObjectId) await Staff.deleteMany({ _id: staffId });
      await User.deleteMany({ assignedId: sId });
    } catch (e) {
      throw new Error(`MongoDB could not delete the staff member: ${e.message}`);
    }
    return true;
  }

  await mutateJson("staff.json", (list) =>
    list.filter((s) => s.staffId !== staffId && String(s._id || s.id) !== String(staffId))
  );

  await mutateJson("users.json", (list) =>
    list.filter((u) => u.assignedId !== staffId && String(u._id || u.id) !== String(staffId))
  );

  return true;
}

// ==========================================
// 5. COURSES & BATCHES
// ==========================================
export async function getAllCourses() {
  if (isDbConnected()) {
    try {
      return await Course.find({ active: true }).lean();
    } catch (error) {
      throw new Error(`MongoDB could not read courses: ${error.message}`);
    }
  }
  return await readJson("courses.json", []);
}

export async function getAllBatches() {
  if (isDbConnected()) {
    try {
      return await Batch.find({ active: true }).lean();
    } catch (error) {
      throw new Error(`MongoDB could not read batches: ${error.message}`);
    }
  }
  return await readJson("batches.json", []);
}

export async function createBatch(data) {
  const record = {
    ...data,
    _id: data._id || "batch-" + Date.now(),
    active: true,
    createdAt: new Date().toISOString()
  };
  if (isDbConnected()) {
    try {
      const created = await Batch.findOneAndUpdate(
        { name: record.name },
        { $set: record },
        { upsert: true, new: true }
      );
      if (!created) throw new Error("MongoDB did not return the created batch.");
      return created.toObject();
    } catch (e) {
      throw new Error(`MongoDB could not create the batch: ${e.message}`);
    }
  }
  await mutateJson("batches.json", (list) => [record, ...list.filter((b) => b.name !== record.name)]);
  return record;
}

export async function updateBatch(idOrName, updateFields) {
  let updatedDoc = null;
  if (isDbConnected()) {
    try {
      const isObjectId = typeof idOrName === "string" && idOrName.match(/^[0-9a-fA-F]{24}$/);
      const q = isObjectId ? { $or: [{ _id: idOrName }, { name: idOrName }] } : { name: idOrName };
      updatedDoc = await Batch.findOneAndUpdate(q, { $set: updateFields }, { new: true }).lean();
    } catch (e) {
      throw new Error(`MongoDB could not update the batch: ${e.message}`);
    }
    return updatedDoc;
  }

  let found = null;
  await mutateJson("batches.json", (list) => {
    return list.map((b) => {
      if (b.name === idOrName || String(b._id || b.id) === String(idOrName)) {
        found = { ...b, ...updateFields };
        return found;
      }
      return b;
    });
  });

  return updatedDoc || found;
}

export async function deleteBatch(idOrName) {
  if (isDbConnected()) {
    try {
      const isObjectId = typeof idOrName === "string" && idOrName.match(/^[0-9a-fA-F]{24}$/);
      const q = isObjectId ? { $or: [{ _id: idOrName }, { name: idOrName }] } : { name: idOrName };
      await Batch.findOneAndDelete(q);
    } catch (error) {
      throw new Error(`MongoDB could not delete the batch: ${error.message}`);
    }
    return true;
  }
  await mutateJson("batches.json", (list) => list.filter((b) => b.name !== idOrName && String(b._id || b.id) !== String(idOrName)));
  return true;
}

// ==========================================
// 6. ATTENDANCE
// ==========================================
export async function getAttendanceByBatchAndDate(batch, date) {
  if (isDbConnected()) {
    try {
      return await Attendance.find({ batch, date }).lean();
    } catch (error) {
      throw new Error(`MongoDB could not read attendance: ${error.message}`);
    }
  }
  const list = await readJson("attendance.json", []);
  return list.filter((a) => a.batch === batch && a.date === date);
}

export async function getStudentAttendance(studentId) {
  if (isDbConnected()) {
    try {
      return await Attendance.find({ studentId }).sort({ date: -1 }).lean();
    } catch (error) {
      throw new Error(`MongoDB could not read student attendance: ${error.message}`);
    }
  }
  const list = await readJson("attendance.json", []);
  return list.filter((a) => a.studentId === studentId);
}

export async function recordAttendance(records) {
  // records: array of { studentId, studentName, batch, date, status, markedBy }
  if (isDbConnected()) {
    try {
      for (const rec of records) {
        await Attendance.findOneAndUpdate(
          { studentId: rec.studentId, batch: rec.batch, date: rec.date },
          { $set: rec },
          { upsert: true, new: true }
        );
      }
    } catch (e) {
      throw new Error(`MongoDB could not record attendance: ${e.message}`);
    }
    return true;
  }

  const existing = await readJson("attendance.json", []);
  const map = new Map(existing.map((e) => [`${e.studentId}_${e.batch}_${e.date}`, e]));

  for (const rec of records) {
    const key = `${rec.studentId}_${rec.batch}_${rec.date}`;
    map.set(key, { ...rec, updatedAt: new Date().toISOString() });
  }

  await writeJson("attendance.json", Array.from(map.values()));
  return true;
}

// ==========================================
// 7. ASSIGNMENTS & SUBMISSIONS
// ==========================================
export async function getAllAssignments(batch = null) {
  if (isDbConnected()) {
    try {
      const q = batch ? { $or: [{ batch }, { batch: "All Batches" }] } : {};
      return await Assignment.find(q).sort({ deadline: 1 }).lean();
    } catch (error) {
      throw new Error(`MongoDB could not read assignments: ${error.message}`);
    }
  }
  const list = await readJson("assignments.json", []);
  if (batch) return list.filter((a) => a.batch === batch || a.batch === "All Batches");
  return list;
}

export async function createAssignment(data) {
  const rec = {
    ...data,
    _id: data._id || "assign-" + Date.now(),
    createdAt: new Date().toISOString()
  };
  if (isDbConnected()) {
    try {
      return (await Assignment.create(rec)).toObject();
    } catch (error) {
      throw new Error(`MongoDB could not create the assignment: ${error.message}`);
    }
  }
  await mutateJson("assignments.json", (list) => [rec, ...list.filter((a) => (a._id || a.id) !== (rec._id || rec.id))]);
  return rec;
}

export async function getSubmissionsForStudent(studentId) {
  if (isDbConnected()) {
    try {
      return await Submission.find({ studentId }).lean();
    } catch (error) {
      throw new Error(`MongoDB could not read submissions: ${error.message}`);
    }
  }
  const list = await readJson("submissions.json", []);
  return list.filter((s) => s.studentId === studentId);
}

export async function createSubmission(data) {
  const rec = {
    ...data,
    _id: data._id || "sub-" + Date.now(),
    submittedAt: new Date().toISOString()
  };
  if (isDbConnected()) {
    try {
      return (await Submission.create(rec)).toObject();
    } catch (error) {
      throw new Error(`MongoDB could not create the submission: ${error.message}`);
    }
  }
  await mutateJson("submissions.json", (list) => [rec, ...list.filter((s) => (s._id || s.id) !== (rec._id || rec.id))]);
  return rec;
}

// ==========================================
// 8. ANNOUNCEMENTS
// ==========================================
export async function getAnnouncements(audience = "all") {
  if (isDbConnected()) {
    try {
      const q = audience === "all" ? {} : { $or: [{ audience: "all" }, { audience }] };
      return await Announcement.find(q).sort({ publishDate: -1 }).lean();
    } catch (error) {
      throw new Error(`MongoDB could not read announcements: ${error.message}`);
    }
  }
  const list = await readJson("announcements.json", []);
  if (audience === "all") return list;
  return list.filter((a) => a.audience === "all" || a.audience === audience);
}

export async function createAnnouncement(data) {
  const rec = {
    ...data,
    _id: data._id || "ann-" + Date.now(),
    publishDate: new Date().toISOString()
  };
  if (isDbConnected()) {
    try {
      return (await Announcement.create(rec)).toObject();
    } catch (error) {
      throw new Error(`MongoDB could not create the announcement: ${error.message}`);
    }
  }
  await mutateJson("announcements.json", (list) => [rec, ...list.filter((a) => (a._id || a.id) !== (rec._id || rec.id))]);
  return rec;
}

export async function updateAnnouncement(id, data) {
  let result = null;
  if (isDbConnected()) {
    try {
      const isObjectId = typeof id === "string" && id.match(/^[0-9a-fA-F]{24}$/);
      const q = isObjectId ? { $or: [{ _id: id }, { id }] } : { _id: id };
      result = await Announcement.findOneAndUpdate(q, { $set: data }, { new: true }).lean();
    } catch (error) {
      throw new Error(`MongoDB could not update the announcement: ${error.message}`);
    }
    return result;
  }
  await mutateJson("announcements.json", (list) => {
    return list.map((a) => {
      if (String(a._id || a.id) === String(id)) {
        const merged = { ...a, ...data, ...(result || {}) };
        if (!result) result = merged;
        return merged;
      }
      return a;
    });
  });
  return result;
}

export async function deleteAnnouncement(id) {
  if (isDbConnected()) {
    try {
      const isObjectId = typeof id === "string" && id.match(/^[0-9a-fA-F]{24}$/);
      const q = isObjectId ? { $or: [{ _id: id }, { id }] } : { _id: id };
      await Announcement.findOneAndDelete(q);
    } catch (error) {
      throw new Error(`MongoDB could not delete the announcement: ${error.message}`);
    }
    return true;
  }
  await mutateJson("announcements.json", (list) => list.filter((a) => String(a._id || a.id) !== String(id)));
  return true;
}

// ==========================================
// 9. TIMETABLE
// ==========================================
export async function getTimetable(batch = null) {
  if (isDbConnected()) {
    try {
      const q = batch ? { $or: [{ batch }, { batch: "All Batches" }] } : {};
      return await Timetable.find(q).lean();
    } catch (error) {
      throw new Error(`MongoDB could not read the timetable: ${error.message}`);
    }
  }
  const list = await readJson("timetable.json", []);
  if (batch) return list.filter((t) => t.batch === batch || t.batch === "All Batches");
  return list;
}

export async function createTimetableItem(data) {
  const rec = {
    ...data,
    _id: data._id || "time-" + Date.now()
  };
  if (isDbConnected()) {
    try {
      return (await Timetable.create(rec)).toObject();
    } catch (error) {
      throw new Error(`MongoDB could not create the timetable item: ${error.message}`);
    }
  }
  await mutateJson("timetable.json", (list) => [rec, ...list.filter((t) => (t._id || t.id) !== (rec._id || rec.id))]);
  return rec;
}

export async function updateTimetableItem(id, data) {
  let result = null;
  if (isDbConnected()) {
    try {
      const isObjectId = typeof id === "string" && id.match(/^[0-9a-fA-F]{24}$/);
      const q = isObjectId ? { $or: [{ _id: id }, { id }] } : { id };
      result = await Timetable.findOneAndUpdate(q, { $set: data }, { new: true }).lean();
    } catch (error) {
      throw new Error(`MongoDB could not update the timetable item: ${error.message}`);
    }
    return result;
  }
  await mutateJson("timetable.json", (list) => {
    return list.map((t) => {
      if (String(t._id || t.id) === String(id)) {
        const merged = { ...t, ...data, ...(result || {}) };
        if (!result) result = merged;
        return merged;
      }
      return t;
    });
  });
  return result;
}

export async function deleteTimetableItem(id) {
  if (isDbConnected()) {
    try {
      const isObjectId = typeof id === "string" && id.match(/^[0-9a-fA-F]{24}$/);
      const q = isObjectId ? { $or: [{ _id: id }, { id }] } : { id };
      await Timetable.findOneAndDelete(q);
    } catch (error) {
      throw new Error(`MongoDB could not delete the timetable item: ${error.message}`);
    }
    return true;
  }
  await mutateJson("timetable.json", (list) => list.filter((t) => String(t._id || t.id) !== String(id)));
  return true;
}

// ==========================================
// 10. FEE RECORDS
// ==========================================
export async function getFeeRecords(studentId = null) {
  if (isDbConnected()) {
    try {
      const q = studentId ? { studentId } : {};
      return await FeeRecord.find(q).lean();
    } catch (error) {
      throw new Error(`MongoDB could not read fee records: ${error.message}`);
    }
  }
  const list = await readJson("fee_records.json", []);
  if (studentId) return list.filter((f) => f.studentId === studentId);
  return list;
}

export async function createOrUpdateFeeRecord(data) {
  const totalFee = Number(data.totalFee);
  const paidAmount = Number(data.paidAmount ?? 0);
  if (!Number.isFinite(totalFee) || totalFee <= 0) {
    throw new Error("Total fee must be a positive amount.");
  }
  if (!Number.isFinite(paidAmount) || paidAmount < 0 || paidAmount > totalFee) {
    throw new Error("Paid amount must be between zero and the total fee.");
  }
  if (data.dueDate) {
    const dueDateTimestamp = Date.parse(`${data.dueDate}T00:00:00.000Z`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(data.dueDate) ||
      Number.isNaN(dueDateTimestamp) ||
      new Date(dueDateTimestamp).toISOString().slice(0, 10) !== data.dueDate
    ) {
      throw new Error("Due date must be a valid date in YYYY-MM-DD format.");
    }
  }

  const dueAmount = totalFee - paidAmount;
  const today = new Date().toISOString().slice(0, 10);
  const status = dueAmount === 0
    ? "paid"
    : (data.dueDate && data.dueDate < today ? "overdue" : (paidAmount > 0 ? "partial" : "pending"));

  const rec = {
    ...data,
    totalFee,
    paidAmount,
    dueAmount,
    status,
    receiptNumber: data.receiptNumber || (`RCPT-${new Date().getFullYear()}-` + Math.floor(1000 + Math.random() * 9000)),
    lastPaymentDate: new Date().toISOString()
  };

  let result = rec;
  if (isDbConnected()) {
    try {
      const saved = await FeeRecord.findOneAndUpdate(
        { studentId: data.studentId },
        { $set: rec },
        { upsert: true, new: true }
      ).lean();
      if (!saved) throw new Error("MongoDB did not return the saved fee record.");
      return saved;
    } catch (error) {
      throw new Error(`MongoDB could not save the fee record: ${error.message}`);
    }
  }

  await mutateJson("fee_records.json", (list) => {
    let found = false;
    const updated = list.map((f) => {
      if (f.studentId === data.studentId) {
        found = true;
        return { ...f, ...result };
      }
      return f;
    });
    if (!found) {
      updated.unshift({ _id: result._id || "fee-" + Date.now(), ...result });
    }
    return updated;
  });

  return result;
}

export async function deleteFeeRecord(idOrStudentId) {
  if (isDbConnected()) {
    try {
      const isObjectId = typeof idOrStudentId === "string" && idOrStudentId.match(/^[0-9a-fA-F]{24}$/);
      const q = isObjectId ? { $or: [{ _id: idOrStudentId }, { studentId: idOrStudentId }] } : { studentId: idOrStudentId };
      await FeeRecord.findOneAndDelete(q);
    } catch (error) {
      throw new Error(`MongoDB could not delete the fee record: ${error.message}`);
    }
    return true;
  }
  await mutateJson("fee_records.json", (list) =>
    list.filter((f) => f.studentId !== idOrStudentId && String(f._id || f.id) !== String(idOrStudentId))
  );
  return true;
}

// ==========================================
// 11. COURSE CRUD
// ==========================================
export async function createCourse(data) {
  const { _id, ...courseData } = data;
  const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const rec = {
    ...courseData,
    slug,
    active: true,
    createdAt: new Date().toISOString()
  };
  if (isDbConnected()) {
    try {
      return (await Course.create(rec)).toObject();
    } catch (error) {
      throw new Error(`MongoDB could not create the course: ${error.message}`);
    }
  }
  const fallbackRecord = { ...rec, _id: _id || "course-" + Date.now() };
  await mutateJson("courses.json", (list) => [fallbackRecord, ...list.filter((c) => (c.slug || c._id) !== (fallbackRecord.slug || fallbackRecord._id))]);
  return fallbackRecord;
}

export async function updateCourse(id, data) {
  let result = null;
  if (isDbConnected()) {
    try {
      const isObjectId = typeof id === "string" && id.match(/^[0-9a-fA-F]{24}$/);
      const q = isObjectId ? { $or: [{ _id: id }, { slug: id }] } : { slug: id };
      result = await Course.findOneAndUpdate(q, { $set: data }, { new: true }).lean();
    } catch (error) {
      throw new Error(`MongoDB could not update the course: ${error.message}`);
    }
    return result;
  }
  await mutateJson("courses.json", (list) => {
    let found = false;
    const updated = list.map((c) => {
      if (String(c._id || c.id) === String(id) || c.slug === id) {
        found = true;
        const merged = { ...c, ...data, ...(result || {}) };
        if (!result) result = merged;
        return merged;
      }
      return c;
    });
    return updated;
  });
  return result;
}

export async function deleteCourse(id) {
  if (isDbConnected()) {
    try {
      const isObjectId = typeof id === "string" && id.match(/^[0-9a-fA-F]{24}$/);
      const q = isObjectId ? { $or: [{ _id: id }, { slug: id }] } : { slug: id };
      await Course.findOneAndDelete(q);
    } catch (error) {
      throw new Error(`MongoDB could not delete the course: ${error.message}`);
    }
    return true;
  }
  await mutateJson("courses.json", (list) => {
    return list.filter((c) => String(c._id || c.id) !== String(id) && c.slug !== id);
  });
  return true;
}

// ==========================================
// 12. WEBSITE LEADS & INQUIRIES
// ==========================================
export async function getAllLeads() {
  if (!isDbConnected()) throw new Error(DISABLED_FALLBACK_MESSAGE);
  try {
    const records = await Lead.find().sort({ createdAt: -1 }).lean();
    return records.map((lead) => ({ ...lead, id: String(lead._id) }));
  } catch (error) {
    throw new Error(`MongoDB could not read inquiries: ${error.message}`);
  }
}

export async function createLead(data) {
  if (!isDbConnected()) throw new Error(DISABLED_FALLBACK_MESSAGE);
  try {
    const lead = await Lead.create(data);
    return { ...lead.toObject(), id: String(lead._id) };
  } catch (error) {
    throw new Error(`MongoDB could not save the inquiry: ${error.message}`);
  }
}

export async function updateLead(id, data) {
  if (!isDbConnected()) throw new Error(DISABLED_FALLBACK_MESSAGE);
  try {
    const lead = await Lead.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).lean();
    return lead ? { ...lead, id: String(lead._id) } : null;
  } catch (error) {
    throw new Error(`MongoDB could not update the inquiry: ${error.message}`);
  }
}

export async function deleteLead(id) {
  if (!isDbConnected()) throw new Error(DISABLED_FALLBACK_MESSAGE);
  try {
    return Boolean(await Lead.findByIdAndDelete(id));
  } catch (error) {
    throw new Error(`MongoDB could not delete the inquiry: ${error.message}`);
  }
}

// ==========================================
// 13. SUBMISSION REVIEWS
// ==========================================
export async function getAllSubmissions(assignmentId = null) {
  if (isDbConnected()) {
    try {
      const q = assignmentId ? { assignmentId } : {};
      return await Submission.find(q).sort({ submittedAt: -1 }).lean();
    } catch (error) {
      throw new Error(`MongoDB could not read submissions: ${error.message}`);
    }
  }
  const list = await readJson("submissions.json", []);
  if (assignmentId) return list.filter((s) => String(s.assignmentId) === String(assignmentId));
  return list;
}

export async function gradeSubmission(submissionId, marks, feedback) {
  const update = {
    marks: Number(marks),
    feedback: feedback || "",
    status: "graded",
    gradedAt: new Date().toISOString()
  };

  let result = null;
  if (isDbConnected()) {
    try {
      result = await Submission.findByIdAndUpdate(submissionId, { $set: update }, { new: true }).lean();
    } catch (error) {
      throw new Error(`MongoDB could not grade the submission: ${error.message}`);
    }
    return result;
  }

  await mutateJson("submissions.json", (list) => {
    return list.map((s) => {
      if (String(s._id || s.id) === String(submissionId)) {
        const merged = { ...s, ...update, ...(result || {}) };
        if (!result) result = merged;
        return merged;
      }
      return s;
    });
  });
  return result;
}

// ==========================================
// 13. ROLES & PERMISSIONS
// ==========================================
export async function getAllRoles() {
  if (isDbConnected()) {
    try {
      return await Role.find().sort({ isSystem: -1, name: 1 }).lean();
    } catch (e) {
      throw new Error(`MongoDB could not read roles: ${e.message}`);
    }
  }
  return await readJson("roles.json", []);
}

export async function getRoleById(roleId) {
  if (isDbConnected()) {
    try {
      const isObjectId = typeof roleId === "string" && roleId.match(/^[0-9a-fA-F]{24}$/);
      const q = isObjectId ? { $or: [{ roleId }, { _id: roleId }] } : { roleId };
      return await Role.findOne(q).lean();
    } catch (error) {
      throw new Error(`MongoDB could not find the role: ${error.message}`);
    }
  }
  const list = await readJson("roles.json", []);
  return list.find((r) => r.roleId === roleId || String(r._id || r.id) === String(roleId)) || null;
}

export async function getRoleByName(name) {
  const norm = (name || "").trim().toLowerCase();
  if (isDbConnected()) {
    try {
      const doc = await Role.findOne({ name: { $regex: new RegExp(`^${norm}$`, "i") } }).lean();
      return doc;
    } catch (error) {
      throw new Error(`MongoDB could not find the role: ${error.message}`);
    }
  }
  const list = await readJson("roles.json", []);
  return list.find((r) => r.name && r.name.trim().toLowerCase() === norm) || null;
}

export async function createRole(data) {
  const slug = (data.name || "role")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const roleId = data.roleId || `role-${slug}-${Date.now().toString().slice(-4)}`;

  const record = {
    ...data,
    roleId,
    _id: data._id || `role-${Date.now()}`,
    permissions: Array.isArray(data.permissions) ? data.permissions : [],
    status: data.status || "active",
    isSystem: data.isSystem === true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (isDbConnected()) {
    try {
      const mongoRecord = { ...record };
      if (typeof mongoRecord._id === "string" && !mongoRecord._id.match(/^[0-9a-fA-F]{24}$/)) {
        delete mongoRecord._id;
      }
      const created = await Role.findOneAndUpdate(
        { roleId: record.roleId },
        { $set: mongoRecord },
        { upsert: true, new: true }
      );
      if (!created) throw new Error("MongoDB did not return the created role.");
      return created.toObject();
    } catch (e) {
      throw new Error(`MongoDB could not create the role: ${e.message}`);
    }
  }

  await mutateJson("roles.json", (list) => [
    record,
    ...list.filter((r) => r.roleId !== record.roleId)
  ]);
  return record;
}

export async function updateRole(roleId, updateFields) {
  let updatedDoc = null;
  const fields = { ...updateFields, updatedAt: new Date().toISOString() };
  if (isDbConnected()) {
    try {
      const isObjectId = typeof roleId === "string" && roleId.match(/^[0-9a-fA-F]{24}$/);
      const q = isObjectId ? { $or: [{ roleId }, { _id: roleId }] } : { roleId };
      updatedDoc = await Role.findOneAndUpdate(
        q,
        { $set: fields },
        { new: true }
      ).lean();
    } catch (error) {
      throw new Error(`MongoDB could not update the role: ${error.message}`);
    }
    return updatedDoc;
  }

  const list = await readJson("roles.json", []);
  let found = null;
  const updated = list.map((r) => {
    if (r.roleId === roleId || String(r._id || r.id) === String(roleId)) {
      found = { ...r, ...fields };
      return found;
    }
    return r;
  });

  if (found) await writeJson("roles.json", updated);
  return updatedDoc || found;
}

export async function deleteRole(roleId) {
  if (isDbConnected()) {
    try {
      const isObjectId = typeof roleId === "string" && roleId.match(/^[0-9a-fA-F]{24}$/);
      const q = isObjectId ? { $or: [{ roleId }, { _id: roleId }] } : { roleId };
      await Role.findOneAndDelete(q);
    } catch (error) {
      throw new Error(`MongoDB could not delete the role: ${error.message}`);
    }
    return true;
  }
  await mutateJson("roles.json", (list) =>
    list.filter((r) => r.roleId !== roleId && String(r._id || r.id) !== String(roleId))
  );
  return true;
}

export async function getStaffAssignedToRole(roleId, roleName = "") {
  const allStaffMembers = await getAllStaff();
  return allStaffMembers.filter((s) => {
    if (s.roleId && s.roleId === roleId) return true;
    if (roleName && s.roleName && s.roleName.toLowerCase() === roleName.toLowerCase()) return true;
    if (roleId === "role-super-admin" && s.role === "admin") return true;
    if (roleId === "role-teacher" && s.role === "teacher" && (!s.roleId || s.roleId === "role-teacher")) return true;
    return false;
  });
}

export async function getStaffCountForRole(roleId, roleName = "") {
  const staff = await getStaffAssignedToRole(roleId, roleName);
  return staff.length;
}

export async function reassignStaffRole(fromRoleId, toRoleId, toRoleName) {
  const staffToReassign = await getStaffAssignedToRole(fromRoleId);
  for (const member of staffToReassign) {
    const sId = member.staffId;
    await updateStaff(sId, { roleId: toRoleId, roleName: toRoleName });
    const user = await findUserByEmailOrId(sId);
    if (user) {
      await updateUser(user._id || user.id, { roleId: toRoleId, customRoleName: toRoleName });
    }
  }
  return staffToReassign.length;
}
