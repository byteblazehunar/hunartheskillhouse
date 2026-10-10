import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Briefcase,
  BookOpen,
  Calendar,
  CheckSquare,
  FileText,
  Clock,
  Bell,
  CreditCard,
  FileSpreadsheet,
  Mail,
  ShieldCheck,
  Settings,
  History,
  Plus,
  Search,
  Filter,
  RefreshCw,
  LogOut,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  Menu,
  X,
  Eye,
  Edit2,
  Trash2,
  Sun,
  Moon,
  Database,
  ArrowUpRight,
  UserCheck,
  Award,
  Phone,
  Send,
  Globe,
  HelpCircle,
  Image,
  Sparkles,
  ChevronDown,
  Layers,
  Activity,
  FileCheck,
  Compass,
  ArrowRight,
  KeyRound
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import CMSManager from "../components/admin/CMSManager";
import ExtraSubviews from "../components/admin/ExtraSubviews";
import RoleManagement from "../components/admin/RoleManagement";
import usePortalTab from "../hooks/usePortalTab";
import { coursesData } from "../data/coursesData";

const ADMIN_PORTAL_TABS = [
  "overview", "activity", "notifications", "students", "invitations", "enrollments",
  "courses", "attendance", "assignments", "assessments", "progress", "staff",
  "staff_invitations", "departments", "teaching_assignments", "timetable",
  "course_categories", "batches", "cms_homepage", "cms_about", "cms_founder",
  "cms_faculty", "cms_testimonials", "announcements", "cms_faqs", "cms_contact",
  "cms_gallery", "cms_navigation", "fees", "receipts", "leads", "reports", "calendar",
  "users", "roles", "audit", "security", "settings", "profile"
];

function courseFormFromRecord(course = {}) {
  return {
    title: course.title || "",
    category: course.category || "",
    duration: course.duration || "",
    description: course.description || course.shortDesc || "",
    syllabus: Array.isArray(course.syllabus) ? course.syllabus.join("\n") : (course.syllabus || ""),
    assignedTeacher: course.assignedTeacher || course.mentor?.name || "",
    badge: course.badge || "",
    mode: course.mode || "",
    level: course.level || "",
    shortDesc: course.shortDesc || course.description || "",
    tagline: course.tagline || "",
    image: course.image || "",
    featured: Boolean(course.featured),
    rating: String(course.rating || ""),
    reviewsCount: String(course.reviewsCount || ""),
    mentorName: course.mentor?.name || "",
    mentorRole: course.mentor?.role || "",
    mentorExp: course.mentor?.exp || "",
    highlights: Array.isArray(course.highlights) ? course.highlights.join("\n") : "",
    tools: Array.isArray(course.tools) ? course.tools.join("\n") : "",
    curriculum: JSON.stringify(course.curriculum || [], null, 2),
    projects: JSON.stringify(course.projects || [], null, 2),
    careerRoles: Array.isArray(course.careerRoles) ? course.careerRoles.join("\n") : ""
  };
}

function coursePayloadFromForm(form) {
  const parseJsonArray = (value, label) => {
    try {
      const parsed = JSON.parse(value || "[]");
      if (!Array.isArray(parsed)) throw new Error();
      return parsed;
    } catch {
      throw new Error(`${label} must be a valid JSON array.`);
    }
  };
  const splitLines = (value) => value.split("\n").map((item) => item.trim()).filter(Boolean);

  return {
    title: form.title.trim(),
    category: form.category.trim(),
    duration: form.duration.trim(),
    description: form.description.trim(),
    syllabus: splitLines(form.syllabus),
    assignedTeacher: form.assignedTeacher.trim(),
    badge: form.badge.trim(),
    mode: form.mode.trim(),
    level: form.level.trim(),
    shortDesc: form.shortDesc.trim(),
    tagline: form.tagline.trim(),
    image: form.image.trim(),
    featured: form.featured,
    rating: Number(form.rating) || 0,
    reviewsCount: Number(form.reviewsCount) || 0,
    mentor: {
      name: form.mentorName.trim(),
      role: form.mentorRole.trim(),
      exp: form.mentorExp.trim()
    },
    highlights: splitLines(form.highlights),
    tools: splitLines(form.tools),
    curriculum: parseJsonArray(form.curriculum, "Curriculum"),
    projects: parseJsonArray(form.projects, "Projects"),
    careerRoles: splitLines(form.careerRoles)
  };
}

function mergeCourseCatalog(publishedCourses, savedCourses) {
  const catalog = new Map(
    publishedCourses.map((course) => [(course.slug || course.title).toLowerCase(), course])
  );

  savedCourses.forEach((savedCourse) => {
    const key = (savedCourse.slug || savedCourse.title).toLowerCase();
    const publishedCourse = catalog.get(key);
    if (!publishedCourse) {
      catalog.set(key, savedCourse);
      return;
    }

    const savedMentor = savedCourse.mentor && typeof savedCourse.mentor === "object" && !Array.isArray(savedCourse.mentor)
      ? savedCourse.mentor
      : {};
    const hasMentorDetails = Object.values(savedMentor).some(Boolean);
    catalog.set(key, {
      ...publishedCourse,
      ...savedCourse,
      category: savedCourse.category || publishedCourse.category,
      duration: savedCourse.duration || publishedCourse.duration,
      description: savedCourse.description || publishedCourse.description || publishedCourse.shortDesc,
      shortDesc: savedCourse.shortDesc || publishedCourse.shortDesc || savedCourse.description,
      tagline: savedCourse.tagline || publishedCourse.tagline,
      badge: savedCourse.badge || publishedCourse.badge,
      mode: savedCourse.mode || publishedCourse.mode,
      level: savedCourse.level || publishedCourse.level,
      image: savedCourse.image || publishedCourse.image,
      mentor: hasMentorDetails ? { ...publishedCourse.mentor, ...savedMentor } : publishedCourse.mentor,
      syllabus: savedCourse.syllabus?.length ? savedCourse.syllabus : (publishedCourse.syllabus || []),
      highlights: savedCourse.highlights?.length ? savedCourse.highlights : (publishedCourse.highlights || []),
      tools: savedCourse.tools?.length ? savedCourse.tools : (publishedCourse.tools || []),
      curriculum: savedCourse.curriculum?.length ? savedCourse.curriculum : (publishedCourse.curriculum || []),
      projects: savedCourse.projects?.length ? savedCourse.projects : (publishedCourse.projects || []),
      careerRoles: savedCourse.careerRoles?.length ? savedCourse.careerRoles : (publishedCourse.careerRoles || [])
    });
  });

  return Array.from(catalog.values());
}

export default function AdminPortal() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Navigation State
  const [activeTab, setActiveTab] = usePortalTab(ADMIN_PORTAL_TABS);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({
    "Overview": true,
    "Student Management": true,
    "Staff Management": true,
    "Academic Management": true,
    "Website Content Management": true,
    "Institute Operations": false,
    "Administration": false
  });

  // Data States
  const [loading, setLoading] = useState(true);
  const [overviewMetrics, setOverviewMetrics] = useState(null);
  const [students, setStudents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [academicDataErrors, setAcademicDataErrors] = useState({});
  const adminCourseList = mergeCourseCatalog(coursesData, courses)
    .filter((course) => course.title?.trim());
  const courseOptions = adminCourseList;
  const [leads, setLeads] = useState([]);
  const [leadNotes, setLeadNotes] = useState({});
  const [announcements, setAnnouncements] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [fees, setFees] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [authToken, setAuthToken] = useState(localStorage.getItem("hunar_token") || "");

  // Filter & Search States
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");

  const [studentSearch, setStudentSearch] = useState("");
  const [studentCourseFilter, setStudentCourseFilter] = useState("all");
  const [studentStatusFilter, setStudentStatusFilter] = useState("all");

  const [staffSearch, setStaffSearch] = useState("");
  const [staffRoleFilter, setStaffRoleFilter] = useState("all");

  const [leadStatusFilter, setLeadStatusFilter] = useState("all");
  const [selectedBatchForAttendance, setSelectedBatchForAttendance] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]);

  // Modal States
  const [modalType, setModalType] = useState(null); // 'add_student', 'add_staff', 'add_course', 'add_batch', 'post_announcement', 'add_timetable', 'record_fee', 'view_student'
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Form Inputs
  const [studentForm, setStudentForm] = useState({
    name: "",
    email: "",
    phone: "",
    course: "",
    batch: ""
  });

  const [staffForm, setStaffForm] = useState({
    name: "",
    email: "",
    phone: "",
    designation: "",
    department: "",
    role: "teacher",
    roleId: "role-teacher",
    roleName: "Teacher / Faculty",
    assignedSubjects: "",
    assignedCourses: ""
  });

  const [courseForm, setCourseForm] = useState({
    title: "",
    category: "",
    duration: "",
    description: "",
    syllabus: "",
    assignedTeacher: "",
    badge: "",
    mode: "",
    level: "",
    shortDesc: "",
    tagline: "",
    image: "",
    featured: false,
    rating: "",
    reviewsCount: "",
    mentorName: "",
    mentorRole: "",
    mentorExp: "",
    highlights: "",
    tools: "",
    curriculum: "[]",
    projects: "[]",
    careerRoles: ""
  });

  const [batchForm, setBatchForm] = useState({
    name: "",
    course: "",
    timing: "",
    assignedTeacher: ""
  });

  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    message: "",
    audience: "all"
  });

  const [timetableForm, setTimetableForm] = useState({
    course: "",
    batch: "",
    day: "",
    time: "",
    subject: "",
    teacher: "",
    room: ""
  });

  const [feeForm, setFeeForm] = useState({
    studentId: "",
    studentName: "",
    course: "",
    totalFee: 0,
    paidAmount: 0,
    dueDate: ""
  });

  const [editingItem, setEditingItem] = useState(null);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "student",
    status: "active"
  });

  // Generated Invitation Details Modal
  const [invitationModal, setInvitationModal] = useState(null);

  const showToast = (text, type = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const getAuthHeaders = (overrideToken) => {
    const t = overrideToken || authToken || localStorage.getItem("hunar_token");
    return {
      "Content-Type": "application/json",
      ...(t ? { Authorization: `Bearer ${t}` } : {})
    };
  };

  const loadAllData = async (activeToken) => {
    setLoading(true);
    const headers = getAuthHeaders(activeToken);
    try {
      const [
        overviewRes,
        usersRes,
        studentsRes,
        staffRes,
        coursesRes,
        batchesRes,
        leadsRes,
        annRes,
        timeRes,
        feesRes,
        auditRes,
        assignRes,
        subRes,
        rolesRes
      ] = await Promise.all([
        fetch("/api/admin/overview", { headers }).catch(() => null),
        fetch("/api/admin/users", { headers }).catch(() => null),
        fetch("/api/students", { headers }).catch(() => null),
        fetch("/api/staff", { headers }).catch(() => null),
        fetch("/api/courses").catch(() => null),
        fetch("/api/batches", { headers }).catch(() => null),
        fetch("/api/leads", { headers }).catch(() => null),
        fetch("/api/announcements", { headers }).catch(() => null),
        fetch("/api/timetable", { headers }).catch(() => null),
        fetch("/api/fees", { headers }).catch(() => null),
        fetch("/api/audit-logs", { headers }).catch(() => null),
        fetch("/api/assignments", { headers }).catch(() => null),
        fetch("/api/submissions", { headers }).catch(() => null),
        fetch("/api/roles", { headers }).catch(() => null)
      ]);

      if (!overviewRes) {
        throw new Error("Unable to connect to the backend API.");
      }
      if (overviewRes.status === 401 || overviewRes.status === 403) {
        localStorage.removeItem("hunar_token");
        localStorage.removeItem("hunar_user");
        navigate("/login", { replace: true });
        return;
      }
      if (!overviewRes.ok) {
        throw new Error("Unable to load the admin dashboard from the backend.");
      }

      const readAcademicCollection = async (response, resourceName) => {
        if (!response) {
          return { records: [], error: `${resourceName} could not be reached. Check the server connection and try again.` };
        }
        if (!response.ok) {
          let detail = "";
          try {
            const body = await response.json();
            detail = body.message || body.error || "";
          } catch {
            // Keep the HTTP status as the actionable error when the body is not JSON.
          }
          return {
            records: [],
            error: `${resourceName} could not be loaded (${response.status})${detail ? `: ${detail}` : "."}`
          };
        }

        try {
          const records = await response.json();
          if (!Array.isArray(records)) {
            return { records: [], error: `${resourceName} returned an unexpected response. Try refreshing.` };
          }
          return { records, error: "" };
        } catch {
          return { records: [], error: `${resourceName} returned unreadable data. Try refreshing.` };
        }
      };

      const [courseResult, batchResult] = await Promise.all([
        readAcademicCollection(coursesRes, "Courses"),
        readAcademicCollection(batchesRes, "Batches")
      ]);
      setCourses(courseResult.records);
      setBatches(batchResult.records);
      // Auto-select the first batch for the attendance tab so the select is never blank
      if (batchResult.records.length > 0) {
        setSelectedBatchForAttendance((current) => current || batchResult.records[0].name || "");
      }
      setAcademicDataErrors({
        courses: courseResult.error,
        batches: batchResult.error
      });

      if (overviewRes && overviewRes.ok) setOverviewMetrics(await overviewRes.json());
      if (usersRes && usersRes.ok) setUsers(await usersRes.json());
      if (studentsRes && studentsRes.ok) setStudents(await studentsRes.json());
      if (staffRes && staffRes.ok) setStaff(await staffRes.json());
      if (leadsRes && leadsRes.ok) setLeads(await leadsRes.json());
      if (annRes && annRes.ok) setAnnouncements(await annRes.json());
      if (timeRes && timeRes.ok) setTimetable(await timeRes.json());
      if (feesRes && feesRes.ok) setFees(await feesRes.json());
      if (auditRes && auditRes.ok) setAuditLogs(await auditRes.json());
      if (assignRes && assignRes.ok) setAssignments(await assignRes.json());
      if (subRes && subRes.ok) setSubmissions(await subRes.json());
      if (rolesRes && rolesRes.ok) {
        const rolesData = await rolesRes.json();
        setAvailableRoles(rolesData.roles || []);
      }
    } catch (err) {
      console.error("Error loading admin data:", err);
      showToast(err.message || "Error loading dashboard data from the backend.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      let currentToken = localStorage.getItem("hunar_token");
      let currentUser = localStorage.getItem("hunar_user");

      if (!currentToken) {
        navigate("/login", { replace: true });
        return;
      }

      if (currentUser) {
        try {
          const parsed = JSON.parse(currentUser);
          if (parsed.role === "student") {
            navigate("/portal/student", { replace: true });
            return;
          }
          setAdminUser(parsed);
        } catch {}
      }

      // Always fetch fresh profile and duty permissions from backend
      if (currentToken) {
        try {
          const meRes = await fetch("/api/auth/me", {
            headers: { Authorization: `Bearer ${currentToken}` }
          });
          if (meRes.status === 401 || meRes.status === 403) {
            localStorage.removeItem("hunar_token");
            localStorage.removeItem("hunar_user");
            localStorage.removeItem("hunar_admin");
            navigate("/login", { replace: true });
            return;
          }
          if (meRes.ok) {
            const meData = await meRes.json();
            if (meData.user) {
              if (meData.user.role === "student") {
                navigate("/portal/student", { replace: true });
                return;
              }
              if (meData.user.role === "teacher" || meData.user.roleId === "role-teacher") {
                navigate("/portal/staff", { replace: true });
                return;
              }
              if (meData.user.role !== "admin" && !meData.user.isSuperAdmin && meData.user.role !== "super_admin") {
                navigate("/portal/operations", { replace: true });
                return;
              }
              setAdminUser(meData.user);
              localStorage.setItem("hunar_user", JSON.stringify(meData.user));
            }
          }
        } catch (e) {
          console.error("Auth me check error:", e);
        }
      }

      setAuthToken(currentToken);
      loadAllData(currentToken);
    };

    initAuth();
  }, []);

  // Granular Duty / Permission Check
  const hasAdministratorAccess = Boolean(
    adminUser?.isSuperAdmin ||
    ["admin", "super_admin"].includes(String(adminUser?.role || "").toLowerCase()) ||
    adminUser?.roleId === "role-super-admin"
  );

  const hasPermission = (required) => {
    if (!adminUser) return true;
    if (hasAdministratorAccess) return true;
    const perms = adminUser.permissions || [];
    if (perms.includes("*")) return true;
    if (!required) return true;
    if (Array.isArray(required)) {
      return required.some((p) => perms.includes(p));
    }
    return perms.includes(required);
  };

  const handleLogout = () => {
    localStorage.removeItem("hunar_token");
    localStorage.removeItem("hunar_user");
    navigate("/login");
  };

  // ══════════════════════════════════════════════
  // ACTIONS & HANDLERS
  // ══════════════════════════════════════════════

  // 1. Register Student & Atomic ID Generation
  const handleRegisterStudent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(studentForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to register student.");

      setStudents((prev) => [data.student, ...prev]);
      setModalType(null);
      setStudentForm({
        name: "",
        email: "",
        phone: "",
        course: "",
        batch: ""
      });

      // Show invitation details
      setInvitationModal({
        studentId: data.student.studentId,
        name: data.student.name,
        email: data.student.email,
        activationUrl: data.invitation.activationUrl,
        rawToken: data.invitation.token,
        expiresAt: data.invitation.expiresAt
      });

      showToast(data.message, data.invitation.emailSent ? "success" : "error");
      loadAllData();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Register Staff & Atomic ID Generation
  const handleRegisterStaff = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...staffForm,
        assignedSubjects: staffForm.assignedSubjects.split(",").map((s) => s.trim()),
        assignedCourses: staffForm.assignedCourses.split(",").map((s) => s.trim())
      };
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to register staff.");

      setStaff((prev) => [data.staff, ...prev]);
      setModalType(null);
      setInvitationModal({
        studentId: data.staff.staffId,
        name: data.staff.name,
        email: data.staff.email,
        activationUrl: data.invitation.activationUrl,
        rawToken: data.invitation.token,
        expiresAt: data.invitation.expiresAt
      });
      showToast(data.message, data.invitation.emailSent ? "success" : "error");
      loadAllData();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Suspend / Reactivate Student
  const handleToggleStudentStatus = async (studentId, currentStatus) => {
    const nextStatus = currentStatus === "active" ? "suspended" : "active";
    try {
      const res = await fetch(`/api/students/${studentId}/status`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: nextStatus })
      });
      if (!res.ok) throw new Error("Status update failed");
      setStudents((prev) =>
        prev.map((s) => (s.studentId === studentId ? { ...s, enrollmentStatus: nextStatus } : s))
      );
      showToast(`Student ${studentId} marked as ${nextStatus}.`);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Permanently Delete Student
  const handleDeleteStudent = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to permanently delete student "${studentName}" (${studentId})?\n\nThis will remove their enrollment record, login account, and fee records.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete student");

      setStudents((prev) => prev.filter((s) => s.studentId !== studentId && String(s._id || s.id) !== String(studentId)));
      setUsers((prev) => prev.filter((u) => u.assignedId !== studentId));
      setFees((prev) => prev.filter((f) => f.studentId !== studentId));
      setOverviewMetrics((prev) => prev ? { ...prev, totalStudents: Math.max(0, (prev.totalStudents || 1) - 1) } : prev);
      showToast(data.message || `Student ${studentName} was successfully deleted.`);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Permanently Delete Staff Member
  const handleDeleteStaff = async (staffId, staffName) => {
    if (staffId === "HUN-A-0001") {
      showToast("The primary institute administrator account cannot be deleted.", "error");
      return;
    }
    if (!window.confirm(`Are you sure you want to permanently remove staff member "${staffName}" (${staffId})?\n\nThis will delete their staff profile and user credentials.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/staff/${staffId}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete staff member");

      setStaff((prev) => prev.filter((st) => st.staffId !== staffId && String(st._id || st.id) !== String(staffId)));
      setUsers((prev) => prev.filter((u) => u.assignedId !== staffId));
      setOverviewMetrics((prev) => prev ? { ...prev, totalStaff: Math.max(0, (prev.totalStaff || 1) - 1) } : prev);
      showToast(data.message || `Staff member ${staffName} was successfully deleted.`);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Permanently Delete User Account
  const handleDeleteUser = async (userId, userName, role, assignedId) => {
    if (role === "admin" && assignedId === "HUN-A-0001") {
      showToast("Cannot delete primary administrator user.", "error");
      return;
    }
    if (!window.confirm(`Are you sure you want to delete user account "${userName}" (${assignedId || userId})?\n\nThis will permanently remove the account and linked institute records.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete user account");

      setUsers((prev) => prev.filter((u) => String(u._id || u.id) !== String(userId) && u.assignedId !== assignedId));
      if (assignedId) {
        setStudents((prev) => prev.filter((s) => s.studentId !== assignedId));
        setStaff((prev) => prev.filter((st) => st.staffId !== assignedId));
        setFees((prev) => prev.filter((f) => f.studentId !== assignedId));
      }
      showToast(data.message || `User account ${userName} deleted successfully.`);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // 4. Resend Invitation
  const handleResendInvitation = async (studentId) => {
    try {
      const res = await fetch(`/api/students/${studentId}/invite`, {
        method: "POST",
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to generate invite.");

      setInvitationModal({
        studentId,
        activationUrl: data.invitationUrl,
        rawToken: data.token,
        expiresAt: data.expiresAt
      });
      showToast(data.message, data.emailSent ? "success" : "error");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // 4b. Resend Staff Invitation / Password Reset
  const handleResendStaffInvitation = async (staffId, staffName) => {
    try {
      const res = await fetch(`/api/staff/${staffId}/invite`, {
        method: "POST",
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to generate staff invite.");

      setInvitationModal({
        studentId: staffId,
        name: staffName,
        activationUrl: data.invitationUrl,
        rawToken: data.token,
        expiresAt: data.expiresAt
      });
      showToast(data.message, data.emailSent ? "success" : "error");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // 5. Create Batch
  const handleCreateBatch = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/batches", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(batchForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error creating batch");
      setBatches((prev) => [data.batch, ...prev]);
      // Auto-select the newly created batch in the attendance tab
      setSelectedBatchForAttendance(data.batch?.name || batchForm.name);
      setModalType(null);
      showToast("Batch created successfully!");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // 6. Create Course
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = coursePayloadFromForm(courseForm);
      if (!payload.title || !payload.category || !payload.description) {
        throw new Error("Course title, category, and description are required.");
      }
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error creating course");
      setCourses((prev) => [data.course, ...prev]);
      setModalType(null);
      setCourseForm(courseFormFromRecord());
      showToast("Course created successfully!");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // 7. Post Announcement
  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(announcementForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error posting announcement");
      setAnnouncements((prev) => [data.announcement, ...prev]);
      setModalType(null);
      setAnnouncementForm({ title: "", message: "", audience: "all" });
      showToast("Announcement published successfully!");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // 8. Add Timetable Slot
  const handleAddTimetable = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/timetable", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(timetableForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error adding timetable slot");
      setTimetable((prev) => [...prev, data.item]);
      setModalType(null);
      showToast("Class slot added to timetable!");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // 9. Delete Timetable Slot
  const handleDeleteTimetable = async (id) => {
    try {
      const res = await fetch(`/api/timetable/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error("Failed to delete slot");
      setTimetable((prev) => prev.filter((t) => String(t._id || t.id) !== String(id)));
      showToast("Schedule slot removed.");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // 10. Record Fee Payment
  const handleRecordFee = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/fees", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(feeForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error recording fee payment");
      setFees((prev) => {
        const filtered = prev.filter((f) => f.studentId !== feeForm.studentId);
        return [data.record, ...filtered];
      });
      setModalType(null);
      showToast(`Fee receipt recorded for ${feeForm.studentId}!`);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ══════════════════════════════════════════════
  // EDIT & DELETE HANDLERS ACROSS ALL ENTITIES
  // ══════════════════════════════════════════════

  const openEditStudent = (s) => {
    setEditingItem(s);
    setStudentForm({
      name: s.name || "",
      email: s.email || "",
      phone: s.phone || "",
      course: s.course || (courses[0]?.title || ""),
      batch: s.batch || (batches[0]?.name || ""),
      enrollmentStatus: s.enrollmentStatus || "active",
      assignedTeacher: s.assignedTeacher || ""
    });
    setModalType("edit_student");
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const id = editingItem.studentId || editingItem._id;
      const res = await fetch(`/api/students/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(studentForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update student.");
      const updated = data.student || { ...editingItem, ...studentForm };
      setStudents((prev) =>
        prev.map((s) => ((s.studentId && s.studentId === editingItem.studentId) || (s._id && s._id === editingItem._id) ? updated : s))
      );
      setUsers((prev) =>
        prev.map((u) => (u.assignedId === editingItem.studentId ? { ...u, name: studentForm.name, email: studentForm.email, phone: studentForm.phone } : u))
      );
      setModalType(null);
      setEditingItem(null);
      showToast(`Student ${studentForm.name} updated successfully!`);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditStaff = (st) => {
    setEditingItem(st);
    setStaffForm({
      name: st.name || "",
      email: st.email || "",
      phone: st.phone || "",
      designation: st.designation || "Senior Technical Instructor",
      department: st.department || "Computer Applications & AI",
      role: st.role || "teacher",
      roleId: st.roleId || "",
      roleName: st.roleName || "",
      assignedSubjects: Array.isArray(st.assignedSubjects) ? st.assignedSubjects.join(", ") : (st.assignedSubjects || ""),
      assignedCourses: Array.isArray(st.assignedCourses) ? st.assignedCourses.join(", ") : (st.assignedCourses || ""),
      employmentStatus: st.employmentStatus || "active"
    });
    setModalType("edit_staff");
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const id = editingItem.staffId || editingItem._id;
      const payload = {
        ...staffForm,
        assignedSubjects: staffForm.assignedSubjects ? staffForm.assignedSubjects.split(",").map((s) => s.trim()) : [],
        assignedCourses: staffForm.assignedCourses ? staffForm.assignedCourses.split(",").map((s) => s.trim()) : []
      };
      const res = await fetch(`/api/staff/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update staff member.");
      const updated = data.staff || { ...editingItem, ...payload };
      setStaff((prev) =>
        prev.map((st) => ((st.staffId && st.staffId === editingItem.staffId) || (st._id && st._id === editingItem._id) ? updated : st))
      );
      setUsers((prev) =>
        prev.map((u) => (u.assignedId === editingItem.staffId ? { ...u, name: staffForm.name, email: staffForm.email, phone: staffForm.phone } : u))
      );
      setModalType(null);
      setEditingItem(null);
      showToast(`Staff member ${staffForm.name} updated successfully!`);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditUser = (u) => {
    setEditingItem(u);
    setUserForm({
      name: u.name || "",
      email: u.email || "",
      phone: u.phone || "",
      role: u.role || "student",
      status: u.status || "active",
      password: ""
    });
    setModalType("edit_user");
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const id = editingItem._id || editingItem.id;
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(userForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update user.");
      const updated = data.user || { ...editingItem, ...userForm };
      setUsers((prev) => prev.map((u) => (String(u._id || u.id) === String(id) ? updated : u)));
      if (adminUser && (String(adminUser.id || adminUser._id) === String(id) || adminUser.assignedId === editingItem.assignedId || adminUser.email === editingItem.email)) {
        setAdminUser((prev) => ({ ...prev, name: userForm.name, email: userForm.email, phone: userForm.phone }));
      }
      if (editingItem.assignedId) {
        setStudents((prev) =>
          prev.map((s) => (s.studentId === editingItem.assignedId ? { ...s, name: userForm.name, email: userForm.email, phone: userForm.phone } : s))
        );
        setStaff((prev) =>
          prev.map((st) => (st.staffId === editingItem.assignedId ? { ...st, name: userForm.name, email: userForm.email, phone: userForm.phone } : st))
        );
      }
      setModalType(null);
      setEditingItem(null);
      showToast(`User ${userForm.name} updated successfully!`);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditCourse = (c) => {
    setEditingItem(c);
    setCourseForm(courseFormFromRecord(c));
    setModalType("edit_course");
  };

  const openAddStudent = () => {
    setEditingItem(null);
    setStudentForm({ name: "", email: "", phone: "", course: "", batch: "" });
    setModalType("add_student");
  };

  const openAddCourse = () => {
    setEditingItem(null);
    setCourseForm(courseFormFromRecord());
    setModalType("add_course");
  };

  const openAddBatch = () => {
    setEditingItem(null);
    // Pre-select the first available course so the select is never blank
    const defaultCourse = courseOptions[0]?.title || courses[0]?.title || "";
    setBatchForm({ name: "", course: defaultCourse, timing: "", assignedTeacher: "" });
    setModalType("add_batch");
  };

  const openAddTimetable = () => {
    setEditingItem(null);
    // Pre-fill course and batch with first available options so dropdowns are never blank
    setTimetableForm({
      course: courseOptions[0]?.title || courses[0]?.title || "",
      batch: batches[0]?.name || "",
      day: "",
      time: "",
      subject: "",
      teacher: "",
      room: ""
    });
    setModalType("add_timetable");
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const id = editingItem.slug || editingItem._id || editingItem.id;
      const payload = coursePayloadFromForm(courseForm);
      if (!payload.title || !payload.category || !payload.description) {
        throw new Error("Course title, category, and description are required.");
      }
      const res = await fetch(`/api/courses/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update course.");
      const updated = data.course || { ...editingItem, ...payload };
      setCourses((prev) => [
        updated,
        ...prev.filter((course) => course.slug !== updated.slug && String(course._id || course.id) !== String(id))
      ]);
      setModalType(null);
      setEditingItem(null);
      showToast(`Course "${courseForm.title}" updated successfully!`);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCourse = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete course "${title}"?\n\nThis will remove it from the catalog.`)) return;
    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete course.");
      setCourses((prev) => prev.filter((course) =>
        String(course.slug || "") !== String(id) &&
        String(course._id || course.id || "") !== String(id)
      ));
      showToast(`Course "${title}" removed successfully.`);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const openEditBatch = (b) => {
    setEditingItem(b);
    setBatchForm({
      name: b.name || "",
      // Keep the batch's own course — don't silently fall back to courses[0]
      course: b.course || "",
      timing: b.timing || "",
      assignedTeacher: b.assignedTeacher || ""
    });
    setModalType("edit_batch");
  };

  const handleUpdateBatch = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const id = editingItem.name || editingItem._id;
      const res = await fetch(`/api/batches/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(batchForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update batch.");
      const updated = data.batch || { ...editingItem, ...batchForm };
      setBatches((prev) => prev.map((b) => (b.name === editingItem.name || String(b._id || b.id) === String(id) ? updated : b)));
      setModalType(null);
      setEditingItem(null);
      showToast(`Batch "${batchForm.name}" updated successfully!`);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBatch = async (name) => {
    if (!window.confirm(`Are you sure you want to delete batch "${name}"?`)) return;
    try {
      const res = await fetch(`/api/batches/${encodeURIComponent(name)}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete batch.");
      setBatches((prev) => prev.filter((b) => b.name !== name && String(b._id || b.id) !== String(name)));
      showToast(`Batch "${name}" deleted.`);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const openEditTimetable = (slot) => {
    setEditingItem(slot);
    setTimetableForm({
      course: slot.course || "",
      batch: slot.batch || "",
      day: slot.day || "",
      time: slot.time || "",
      subject: slot.subject || "",
      teacher: slot.teacher || "",
      room: slot.room || ""
    });
    setModalType("edit_timetable");
  };

  const handleUpdateTimetable = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const id = editingItem._id || editingItem.id;
      const res = await fetch(`/api/timetable/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(timetableForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update timetable slot.");
      const updated = data.item || { ...editingItem, ...timetableForm };
      setTimetable((prev) => prev.map((t) => (String(t._id || t.id) === String(id) ? updated : t)));
      setModalType(null);
      setEditingItem(null);
      showToast("Timetable slot updated successfully!");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditFee = (f) => {
    setEditingItem(f);
    setFeeForm({
      studentId: f.studentId || "",
      studentName: f.studentName || "",
      course: f.course || (courses[0]?.title || ""),
      totalFee: f.totalFee || 0,
      paidAmount: f.paidAmount !== undefined ? f.paidAmount : 0,
      dueDate: f.dueDate || ""
    });
    setModalType("edit_fee");
  };

  const handleUpdateFee = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const id = editingItem.studentId || editingItem._id;
      const res = await fetch(`/api/fees/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(feeForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update fee record.");
      const updated = data.record || { ...editingItem, ...feeForm };
      setFees((prev) => prev.map((f) => (f.studentId === editingItem.studentId || String(f._id || f.id) === String(id) ? updated : f)));
      setModalType(null);
      setEditingItem(null);
      showToast(`Fee record for ${feeForm.studentName || feeForm.studentId} updated!`);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFee = async (idOrStudentId, studentName) => {
    if (!window.confirm(`Are you sure you want to delete fee record for "${studentName || idOrStudentId}"?`)) return;
    try {
      const res = await fetch(`/api/fees/${idOrStudentId}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete fee record.");
      setFees((prev) => prev.filter((f) => f.studentId !== idOrStudentId && String(f._id || f.id) !== String(idOrStudentId)));
      showToast("Fee record deleted.");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const openEditAnnouncement = (a) => {
    setEditingItem(a);
    setAnnouncementForm({
      title: a.title || "",
      message: a.message || "",
      audience: a.audience || "all"
    });
    setModalType("edit_announcement");
  };

  const handleUpdateAnnouncement = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const id = editingItem._id || editingItem.id;
      const res = await fetch(`/api/announcements/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(announcementForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update announcement.");
      const updated = data.announcement || { ...editingItem, ...announcementForm };
      setAnnouncements((prev) => prev.map((a) => (String(a._id || a.id) === String(id) ? updated : a)));
      setModalType(null);
      setEditingItem(null);
      showToast("Announcement updated successfully!");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete announcement "${title}"?`)) return;
    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete announcement.");
      setAnnouncements((prev) => prev.filter((a) => String(a._id || a.id) !== String(id)));
      showToast("Announcement deleted.");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // 11. Update Lead Status
  const handleUpdateLead = async (id, updates) => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update inquiry.");
      setLeads((prev) => prev.map((lead) =>
        String(lead._id || lead.id) === String(id) ? { ...lead, ...updates } : lead
      ));
      showToast(updates.status ? `Inquiry marked as ${updates.status}` : "Inquiry notes saved.");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleUpdateLeadStatus = (id, status) => handleUpdateLead(id, { status });
  const handleSaveLeadNotes = (id) => handleUpdateLead(id, { notes: leadNotes[id] || "" });

  // 12. Submit Batch Attendance
  const handleSaveAttendance = async () => {
    setSubmitting(true);
    try {
      const batchStudents = students.filter((s) => s.batch === selectedBatchForAttendance);
      const records = batchStudents.map((s) => {
        const existing = attendanceRecords.find((a) => a.studentId === s.studentId);
        return {
          studentId: s.studentId,
          studentName: s.name,
          status: existing ? existing.status : "present"
        };
      });

      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          batch: selectedBatchForAttendance,
          date: attendanceDate,
          records
        })
      });
      if (!res.ok) throw new Error("Failed to record attendance");
      showToast(`Attendance recorded for ${selectedBatchForAttendance} (${attendanceDate})!`);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // 13. Download CSV Export
  const handleDownloadExport = (type) => {
    window.open(`/api/admin/export/${type}`, "_blank");
    showToast(`Exporting ${type} dataset to CSV...`);
  };

  // Filtered Students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.studentId.toLowerCase().includes(studentSearch.toLowerCase());
    const matchesCourse = studentCourseFilter === "all" || s.course === studentCourseFilter;
    const matchesStatus = studentStatusFilter === "all" || s.enrollmentStatus === studentStatusFilter;
    return matchesSearch && matchesCourse && matchesStatus;
  });

  // Filtered Staff
  const filteredStaff = staff.filter((st) => {
    const matchesSearch =
      st.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
      st.email.toLowerCase().includes(staffSearch.toLowerCase()) ||
      st.staffId.toLowerCase().includes(staffSearch.toLowerCase()) ||
      st.designation.toLowerCase().includes(staffSearch.toLowerCase());
    const matchesRole = staffRoleFilter === "all" || st.role === staffRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Filtered Leads
  const filteredLeads = leads.filter((l) => {
    return leadStatusFilter === "all" || l.status === leadStatusFilter;
  });

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.name && u.name.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.assignedId && u.assignedId.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u._id && String(u._id).toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.id && String(u.id).toLowerCase().includes(userSearch.toLowerCase()));
    const matchesRole = userRoleFilter === "all" || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  // ══════════════════════════════════════════════
  // MAIN SIDEBAR STRUCTURE (SECTION 2 REQUIREMENTS)
  // ══════════════════════════════════════════════
  const SIDEBAR_GROUPS = [
    {
      id: "Overview",
      label: "Overview",
      icon: LayoutDashboard,
      perms: ["dashboard.view", "dashboard.stats_view", "dashboard.counts_view"],
      roles: ["admin", "super_admin", "teacher", "staff"],
      items: [
        { id: "overview", label: "Dashboard", icon: LayoutDashboard, perms: ["dashboard.view", "dashboard.stats_view"] },
        { id: "activity", label: "Activity Overview", icon: Activity, perms: ["dashboard.view", "dashboard.tasks_view"] },
        { id: "notifications", label: "Notifications", icon: Bell, count: announcements.length, perms: ["announcements.view", "dashboard.notifications_view"] }
      ]
    },
    {
      id: "Student Management",
      label: "Student Management",
      icon: GraduationCap,
      perms: [
        "students.list_view",
        "students.profile_view",
        "students.create",
        "students.edit",
        "students.attendance_view",
        "students.fee_status_view",
        "admissions.applications_view"
      ],
      roles: ["admin", "super_admin", "teacher", "staff"],
      items: [
        { id: "students", label: "All Students", icon: GraduationCap, count: students.length, perms: ["students.list_view", "students.profile_view"] },
        { id: "add_student", label: "Add Student", icon: Plus, isAction: true, perms: ["students.create"] },
        { id: "invitations", label: "Student Invitations", icon: Mail, count: students.filter((s) => s.enrollmentStatus === "pending_activation").length, perms: ["students.create", "students.edit"] },
        { id: "enrollments", label: "Enrollments", icon: UserCheck, perms: ["admissions.applications_view", "admissions.enrollment_record"] },
        { id: "courses", label: "Courses & Batches", icon: BookOpen, perms: ["courses.view", "batches.view"] },
        { id: "attendance", label: "Attendance", icon: CheckSquare, perms: ["attendance.students_view", "attendance.students_mark", "students.attendance_view"] },
        { id: "assignments", label: "Assignments", icon: FileText, count: assignments.length, perms: ["academics.assignments_view"] },
        { id: "assessments", label: "Assessments", icon: Award, perms: ["academics.results_record", "academics.results_edit", "academics.progress_view"] },
        { id: "progress", label: "Student Progress", icon: ArrowUpRight, perms: ["students.academic_progress_view", "academics.progress_view"] }
      ]
    },
    {
      id: "Staff Management",
      label: "Staff Management",
      icon: Briefcase,
      perms: ["staff.list_view", "staff.profile_view", "staff.add", "staff.edit", "staff.roles_assign", "staff.schedules_view"],
      roles: ["admin", "super_admin", "teacher"],
      items: [
        { id: "staff", label: "All Staff", icon: Briefcase, count: staff.length, perms: ["staff.list_view", "staff.profile_view"] },
        { id: "add_staff", label: "Add Staff", icon: Plus, isAction: true, perms: ["staff.add"] },
        { id: "staff_invitations", label: "Staff Invitations", icon: Mail, count: users.filter((user) => user.role !== "student" && user.status === "pending_activation").length, perms: ["staff.add", "staff.edit"] },
        { id: "departments", label: "Departments", icon: Layers, perms: ["staff.dept_assign", "staff.edit"] },
        { id: "teaching_assignments", label: "Teaching Assignments", icon: UserCheck, perms: ["batches.teachers_assign", "staff.schedules_manage"] },
        { id: "timetable", label: "Staff Timetable", icon: Calendar, perms: ["timetable.institute_view", "timetable.personal_view", "staff.schedules_view"] }
      ]
    },
    {
      id: "Academic Management",
      label: "Academic Management",
      icon: BookOpen,
      perms: ["courses.view", "batches.view", "timetable.institute_view", "academics.assignments_view"],
      roles: ["admin", "super_admin", "teacher"],
      items: [
        { id: "courses", label: "Courses", icon: BookOpen, count: adminCourseList.length, perms: ["courses.view"] },
        { id: "course_categories", label: "Course Categories", icon: Layers, perms: ["courses.view", "courses.edit"] },
        { id: "batches", label: "Batches", icon: Calendar, count: batches.length, perms: ["batches.view"] },
        { id: "timetable", label: "Class Timetable", icon: Clock, perms: ["timetable.institute_view"] },
        { id: "attendance", label: "Attendance Records", icon: CheckSquare, perms: ["attendance.students_view"] },
        { id: "resources", label: "Learning Resources", icon: FileText, perms: ["academics.assignments_view"] },
        { id: "assignments", label: "Assignments & Submissions", icon: FileText, perms: ["academics.assignments_view"] },
        { id: "assessments", label: "Assessment Results", icon: Award, perms: ["academics.results_record"] }
      ]
    },
    {
      id: "Website Content Management",
      label: "Website Content Management",
      icon: Globe,
      perms: ["website.content_view", "website.homepage_edit", "website.about_founder_edit"],
      roles: ["admin", "super_admin"],
      items: [
        { id: "cms_homepage", label: "Homepage Content", icon: Globe, perms: ["website.homepage_edit"] },
        { id: "cms_about", label: "About Hunar", icon: FileText, perms: ["website.about_founder_edit"] },
        { id: "cms_founder", label: "Founder & Leadership", icon: UserCheck, perms: ["website.about_founder_edit"] },
        { id: "cms_faculty", label: "Teachers & Faculty", icon: Users, perms: ["website.content_view"] },
        { id: "courses", label: "Courses on Website", icon: BookOpen, perms: ["website.courses_edit"] },
        { id: "cms_testimonials", label: "Student Success Stories", icon: Sparkles, perms: ["website.testimonials_manage"] },
        { id: "announcements", label: "Announcements", icon: Bell, perms: ["website.announcements_manage"] },
        { id: "cms_faqs", label: "FAQs", icon: HelpCircle, perms: ["website.content_view"] },
        { id: "cms_contact", label: "Contact Information", icon: Phone, perms: ["website.content_view"] },
        { id: "cms_gallery", label: "Gallery & Media", icon: Image, perms: ["website.gallery_manage"] },
        { id: "cms_navigation", label: "Website Navigation Content", icon: Compass, perms: ["website.navigation_manage"] }
      ]
    },
    {
      id: "Institute Operations",
      label: "Institute Operations",
      icon: CreditCard,
      perms: [
        "fees.plans_view",
        "fees.balance_view",
        "fees.payments_record",
        "inquiries.view",
        "admissions.applications_view",
        "reports.students_view",
        "reports.fees_view",
        "reports.inquiries_view",
        "students.fee_status_view"
      ],
      roles: ["admin", "super_admin", "staff"],
      items: [
        { id: "fees", label: "Fee Management", icon: CreditCard, count: fees.length, perms: ["fees.balance_view", "fees.plans_view", "fees.payments_record", "students.fee_status_view"] },
        { id: "receipts", label: "Receipts", icon: FileSpreadsheet, perms: ["fees.receipts_generate", "fees.history_view"] },
        { id: "leads", label: "Inquiries & Admissions", icon: Users, count: leads.filter((l) => l.status === "New").length, perms: ["inquiries.view", "admissions.applications_view"] },
        { id: "reports", label: "Reports", icon: FileSpreadsheet, perms: ["reports.students_view", "reports.fees_view", "reports.inquiries_view", "reports.staff_view", "reports.export"] },
        { id: "calendar", label: "Calendar", icon: Calendar, perms: ["timetable.institute_view", "dashboard.view"] },
        { id: "announcements", label: "Notices", icon: Bell, perms: ["announcements.view"] }
      ]
    },
    {
      id: "Administration",
      label: "Administration",
      icon: ShieldCheck,
      perms: ["admin.roles_view", "admin.accounts_manage", "admin.audit_view", "admin.settings_manage"],
      roles: ["admin", "super_admin"],
      items: [
        { id: "users", label: "User Accounts", icon: ShieldCheck, count: users.length, perms: ["admin.accounts_manage"] },
        { id: "roles", label: "Roles & Permissions", icon: ShieldCheck, perms: ["admin.roles_view"] },
        { id: "audit", label: "Audit Logs", icon: History, perms: ["admin.audit_view"] },
        { id: "security", label: "Security Settings", icon: ShieldCheck, perms: ["admin.settings_manage"] },
        { id: "settings", label: "General Settings", icon: Database, perms: ["admin.settings_manage"] },
        { id: "profile", label: "Profile", icon: UserCheck },
        { id: "logout", label: "Logout", icon: LogOut, isAction: true }
      ]
    }
  ];

  const currentRole = adminUser?.role || "admin";

  const allNavItems = SIDEBAR_GROUPS.flatMap((g) => g.items);
  const getTabTitle = (tabId) => {
    const found = allNavItems.find((i) => i.id === tabId);
    return found ? found.label : "Dashboard";
  };

  const toggleGroup = (groupId) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  return (
    <div
      className="admin-control-center"
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "var(--color-background)",
        color: "var(--color-text-primary)",
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
      }}
    >
      {/* ══════════════════════════════════════════════ */}
      {/* SIDEBAR NAVIGATION (COLLAPSIBLE GROUPS & RBAC) */}
      {/* ══════════════════════════════════════════════ */}
      <aside
        style={{
          width: "285px",
          backgroundColor: "var(--color-surface)",
          borderRight: "1px solid var(--color-border)",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
          zIndex: 40,
          transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          transform: sidebarOpen ? "translateX(0)" : undefined
        }}
        className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: "18px 20px",
            borderBottom: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                backgroundColor: "var(--color-brand)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                color: "#191A17",
                fontSize: "1.15rem",
                boxShadow: "0 4px 12px rgba(239, 219, 25, 0.35)"
              }}
            >
              H
            </div>
            <div>
              <h2 style={{ fontSize: "1rem", fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>HUNAR</h2>
              <p style={{ fontSize: "0.68rem", color: "var(--color-text-secondary)", margin: 0, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Institute Management
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="mobile-close-btn"
            style={{
              display: "none",
              background: "none",
              border: "none",
              color: "var(--color-text-secondary)",
              cursor: "pointer"
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Switch to Operations Desk */}
        <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--color-border)" }}>
          <Link
            to="/portal/operations"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "7px 10px",
              borderRadius: "8px",
              backgroundColor: "rgba(239, 219, 25, 0.12)",
              color: "var(--color-text-primary)",
              textDecoration: "none",
              fontSize: "0.76rem",
              fontWeight: 700
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <Briefcase size={14} color="var(--color-accent, #EB5E28)" />
              <span>Operations Desk</span>
            </div>
            <ArrowRight size={12} color="var(--color-text-secondary)" />
          </Link>
        </div>

        {/* Scrollable Collapsible Nav Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 10px" }}>
          {SIDEBAR_GROUPS.map((group) => {
            // Check group-level permissions (duty permissions first, role fallback)
            if (group.perms && !hasPermission(group.perms) && !(hasAdministratorAccess && group.id === "Academic Management")) return null;
            if (!group.perms && group.roles && !group.roles.includes(currentRole)) return null;

            const isExpanded = expandedGroups[group.id] !== false;
            const GroupIcon = group.icon;

            // Filter items within group by duty permission
            const visibleItems = group.items.filter((item) => {
              if (hasAdministratorAccess && group.id === "Academic Management" && ["courses", "batches"].includes(item.id)) return true;
              if (item.perms && !hasPermission(item.perms)) return false;
              if (!item.perms && item.roles && !item.roles.includes(currentRole)) return false;
              return true;
            });

            if (visibleItems.length === 0) return null;

            return (
              <div key={group.id} style={{ marginBottom: "10px" }}>
                {/* Collapsible Group Header */}
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 10px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "transparent",
                    color: "var(--color-text-secondary)",
                    cursor: "pointer",
                    transition: "color 0.15s ease"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <GroupIcon size={14} style={{ opacity: 0.8 }} />
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.07em"
                      }}
                    >
                      {group.label}
                    </span>
                  </div>
                  <ChevronDown
                    size={14}
                    style={{
                      transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                      transition: "transform 0.2s ease"
                    }}
                  />
                </button>

                {/* Group Sub-Items */}
                {isExpanded && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "2px", paddingLeft: "6px" }}>
                    {visibleItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id + item.label}
                          type="button"
                          onClick={() => {
                            if (item.isAction) {
                              if (item.id === "add_student") openAddStudent();
                              else if (item.id === "add_staff") setModalType("add_staff");
                              else if (item.id === "logout") handleLogout();
                            } else {
                              setActiveTab(item.id);
                            }
                            setSidebarOpen(false);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            border: "none",
                            backgroundColor: isActive ? "var(--color-brand)" : "transparent",
                            color: isActive ? "#191A17" : "var(--color-text-primary)",
                            fontWeight: isActive ? 700 : 500,
                            fontSize: "0.82rem",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                            textAlign: "left"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                            <Icon size={15} style={{ opacity: isActive ? 1 : 0.7 }} />
                            <span>{item.label}</span>
                          </div>
                          {item.count !== undefined && item.count > 0 && (
                            <span
                              style={{
                                fontSize: "0.68rem",
                                fontWeight: 700,
                                padding: "1px 6px",
                                borderRadius: "10px",
                                backgroundColor: isActive ? "rgba(0,0,0,0.15)" : "rgba(239, 219, 25, 0.2)",
                                color: isActive ? "#191A17" : "var(--color-brand)"
                              }}
                            >
                              {item.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* User Card & Logout Bottom */}
        <div
          style={{
            padding: "16px",
            borderTop: "1px solid var(--color-border)",
            backgroundColor: "rgba(0,0,0,0.02)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", overflow: "hidden" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "var(--color-brand)",
                color: "#191A17",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "0.9rem"
              }}
            >
              {adminUser ? adminUser.name.charAt(0) : "A"}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                {adminUser ? adminUser.name : "Administrator"}
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                {adminUser ? adminUser.email : ""}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            style={{
              background: "none",
              border: "none",
              color: "#EF4444",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "8px"
            }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════ */}
      {/* MAIN CONTENT AREA */}
      {/* ══════════════════════════════════════════════ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top Header Bar */}
        <header
          style={{
            height: "64px",
            borderBottom: "1px solid var(--color-border)",
            backgroundColor: "var(--color-surface)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            position: "sticky",
            top: 0,
            zIndex: 30
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={() => setSidebarOpen(true)}
              className="mobile-hamburger-btn"
              style={{
                display: "none",
                background: "none",
                border: "none",
                color: "var(--color-text-primary)",
                cursor: "pointer",
                padding: "4px"
              }}
            >
              <Menu size={22} />
            </button>
            <h1 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0, letterSpacing: "-0.01em" }}>
              {getTabTitle(activeTab)}
            </h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Quick Action: Add Student */}
            <button
              onClick={openAddStudent}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "8px",
                backgroundColor: "var(--color-brand)",
                color: "#191A17",
                border: "none",
                fontWeight: 700,
                fontSize: "0.82rem",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(239, 219, 25, 0.25)"
              }}
            >
              <Plus size={15} />
              <span>Register Student</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title="Toggle Theme"
              style={{
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid var(--color-border)",
                backgroundColor: "transparent",
                color: "var(--color-text-primary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Refresh */}
            <button
              onClick={loadAllData}
              title="Refresh Data"
              style={{
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid var(--color-border)",
                backgroundColor: "transparent",
                color: "var(--color-text-primary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <RefreshCw size={17} className={loading ? "spin" : ""} />
            </button>

            {/* Institute Tag */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "5px 12px",
                borderRadius: "20px",
                backgroundColor: "rgba(239, 219, 25, 0.12)",
                border: "1px solid rgba(239, 219, 25, 0.3)",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--color-text-primary)"
              }}
            >
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10B981" }} />
              <span>Mullanpur Dakha</span>
            </div>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <main style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
          {/* ══════════════════════════════════════════════ */}
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {/* ══════════════════════════════════════════════ */}
          {activeTab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Metric Stat Cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "16px"
                }}
              >
                {[
                  {
                    label: "Active Students",
                    value: students.filter((s) => s.enrollmentStatus === "active").length,
                    sub: `${students.length} Total Enrolled`,
                    icon: GraduationCap,
                    color: "var(--color-brand)"
                  },
                  {
                    label: "Faculty & Staff",
                    value: staff.length,
                    sub: "Active Instructors",
                    icon: Briefcase,
                    color: "#3B82F6"
                  },
                  {
                    label: "Active Courses",
                    value: academicDataErrors.courses ? "—" : courses.length,
                    sub: academicDataErrors.batches ? "Batch data unavailable" : `${batches.length} Live Batches`,
                    icon: BookOpen,
                    color: "#10B981"
                  },
                  {
                    label: "Pending Inquiries",
                    value: leads.filter((l) => l.status === "New").length,
                    sub: "Website Admissions",
                    icon: Users,
                    color: "#F59E0B"
                  },
                  {
                    label: "Pending Activations",
                    value: students.filter((s) => s.enrollmentStatus === "pending_activation").length,
                    sub: "Single-Use Invitations",
                    icon: Mail,
                    color: "#8B5CF6"
                  }
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={i}
                      style={{
                        padding: "20px",
                        backgroundColor: "var(--color-surface)",
                        borderRadius: "14px",
                        border: "1px solid var(--color-border)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                        <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--color-text-secondary)" }}>
                          {stat.label}
                        </span>
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "10px",
                            backgroundColor: "rgba(0,0,0,0.04)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: stat.color
                          }}
                        >
                          <Icon size={18} />
                        </div>
                      </div>
                      <div style={{ fontSize: "1.85rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
                        {stat.value}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                        {stat.sub}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Actions Bar */}
              <div
                style={{
                  padding: "18px 24px",
                  backgroundColor: "var(--color-surface)",
                  borderRadius: "14px",
                  border: "1px solid var(--color-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "12px"
                }}
              >
                <div>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 4px 0" }}>Institutional Shortcuts</h3>
                  <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
                    Execute administrative actions across students, staff, and batches
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    onClick={openAddStudent}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "8px",
                      backgroundColor: "var(--color-brand)",
                      color: "#191A17",
                      border: "none",
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      cursor: "pointer"
                    }}
                  >
                    + Register Student
                  </button>
                  <button
                    onClick={() => setModalType("add_staff")}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "transparent",
                      color: "var(--color-text-primary)",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      cursor: "pointer"
                    }}
                  >
                    + Add Staff
                  </button>
                  <button
                    onClick={openAddBatch}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "transparent",
                      color: "var(--color-text-primary)",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      cursor: "pointer"
                    }}
                  >
                    + Create Batch
                  </button>
                  <button
                    onClick={() => setModalType("post_announcement")}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "transparent",
                      color: "var(--color-text-primary)",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      cursor: "pointer"
                    }}
                  >
                    + Post Notice
                  </button>
                </div>
              </div>

              {/* Grid: Recent Activity & Announcements */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px" }}>
                {/* Recent Audit Activity */}
                <div
                  style={{
                    backgroundColor: "var(--color-surface)",
                    borderRadius: "14px",
                    border: "1px solid var(--color-border)",
                    padding: "20px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h3 style={{ fontSize: "0.92rem", fontWeight: 700, margin: 0 }}>Recent Activity Stream</h3>
                    <button
                      onClick={() => setActiveTab("audit")}
                      style={{ background: "none", border: "none", color: "var(--color-brand)", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}
                    >
                      View All
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {auditLogs.slice(0, 5).map((log, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: "10px 14px",
                          borderRadius: "10px",
                          backgroundColor: "rgba(0,0,0,0.02)",
                          border: "1px solid var(--color-border)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between"
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "0.82rem", fontWeight: 700 }}>
                            {log.action} <span style={{ fontWeight: 500, color: "var(--color-text-secondary)" }}>by {log.actorName}</span>
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary)" }}>
                            Target: {log.targetType} ({log.targetId}) {log.details ? `— ${log.details}` : ""}
                          </div>
                        </div>
                        <span style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    ))}
                    {auditLogs.length === 0 && (
                      <p style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)", textAlign: "center", margin: "20px 0" }}>
                        No audit activities recorded yet.
                      </p>
                    )}
                  </div>
                </div>

                {/* Published Announcements */}
                <div
                  style={{
                    backgroundColor: "var(--color-surface)",
                    borderRadius: "14px",
                    border: "1px solid var(--color-border)",
                    padding: "20px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h3 style={{ fontSize: "0.92rem", fontWeight: 700, margin: 0 }}>Active Announcements</h3>
                    <button
                      onClick={() => setModalType("post_announcement")}
                      style={{ background: "none", border: "none", color: "var(--color-brand)", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}
                    >
                      + New
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {announcements.slice(0, 4).map((ann, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: "12px 14px",
                          borderRadius: "10px",
                          backgroundColor: "rgba(0,0,0,0.02)",
                          borderLeft: "3px solid var(--color-brand)",
                          border: "1px solid var(--color-border)"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                          <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>{ann.title}</span>
                          <span
                            style={{
                              fontSize: "0.68rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              backgroundColor: "rgba(239, 219, 25, 0.2)",
                              color: "var(--color-text-primary)"
                            }}
                          >
                            {ann.audience}
                          </span>
                        </div>
                        <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>{ann.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════ */}
          {/* TAB: ALL USERS & ASSIGNED IDS */}
          {/* ══════════════════════════════════════════════ */}
          {activeTab === "users" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Header & Filter Controls */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "16px",
                  padding: "16px 20px",
                  backgroundColor: "var(--color-surface)",
                  borderRadius: "14px",
                  border: "1px solid var(--color-border)"
                }}
              >
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", flex: 1 }}>
                  {/* Search */}
                  <div style={{ position: "relative", minWidth: "240px", flex: 1 }}>
                    <Search size={16} style={{ position: "absolute", left: "12px", top: "12px", color: "var(--color-text-secondary)" }} />
                    <input
                      type="text"
                      placeholder="Search by Name, Email, or Assigned ID (e.g. HUN-S-...)"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "9px 12px 9px 36px",
                        borderRadius: "8px",
                        border: "1px solid var(--color-border)",
                        backgroundColor: "var(--color-background)",
                        color: "var(--color-text-primary)",
                        fontSize: "0.85rem"
                      }}
                    />
                  </div>

                  {/* Role Filter */}
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    style={{
                      padding: "9px 14px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-background)",
                      color: "var(--color-text-primary)",
                      fontSize: "0.85rem"
                    }}
                  >
                    <option value="all">All Roles ({users.length})</option>
                    <option value="admin">Administrators</option>
                    <option value="teacher">Teachers / Faculty</option>
                    <option value="student">Students</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={openAddStudent}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "9px 14px",
                      borderRadius: "8px",
                      backgroundColor: "var(--color-brand)",
                      color: "#191A17",
                      border: "none",
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      cursor: "pointer"
                    }}
                  >
                    <Plus size={15} />
                    <span>+ Student</span>
                  </button>
                  <button
                    onClick={() => setModalType("add_staff")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "9px 14px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "transparent",
                      color: "var(--color-text-primary)",
                      fontWeight: 600,
                      fontSize: "0.82rem",
                      cursor: "pointer"
                    }}
                  >
                    <Plus size={15} />
                    <span>+ Staff</span>
                  </button>
                </div>
              </div>

              {/* Users & IDs Table */}
              <div
                style={{
                  backgroundColor: "var(--color-surface)",
                  borderRadius: "14px",
                  border: "1px solid var(--color-border)",
                  overflowX: "auto"
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--color-border)", backgroundColor: "rgba(0,0,0,0.02)" }}>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Assigned Institutional ID</th>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Name & Contact</th>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>System Role</th>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Status</th>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Internal User ID</th>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u._id || u.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                        <td style={{ padding: "14px 18px" }}>
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontWeight: 800,
                              fontSize: "0.88rem",
                              color: "var(--color-brand)",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              backgroundColor: "rgba(239, 219, 25, 0.12)"
                            }}
                          >
                            {u.assignedId || "—"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          <div style={{ fontWeight: 700 }}>{u.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>{u.email}</div>
                          {u.phone && <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>{u.phone}</div>}
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              padding: "3px 8px",
                              borderRadius: "6px",
                              backgroundColor:
                                u.role === "admin"
                                  ? "rgba(239, 219, 25, 0.25)"
                                  : u.role === "teacher"
                                  ? "rgba(59, 130, 246, 0.15)"
                                  : "rgba(16, 185, 129, 0.15)",
                              color:
                                u.role === "admin"
                                  ? "var(--color-text-primary)"
                                  : u.role === "teacher"
                                  ? "#3B82F6"
                                  : "#10B981"
                            }}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          <span
                            style={{
                              padding: "3px 8px",
                              borderRadius: "12px",
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              backgroundColor:
                                u.status === "active"
                                  ? "rgba(16, 185, 129, 0.15)"
                                  : u.status === "suspended"
                                  ? "rgba(239, 68, 68, 0.15)"
                                  : "rgba(245, 158, 11, 0.15)",
                              color:
                                u.status === "active"
                                  ? "#10B981"
                                  : u.status === "suspended"
                                  ? "#EF4444"
                                  : "#F59E0B"
                            }}
                          >
                            {u.status === "pending_activation" ? "Pending Setup" : u.status}
                          </span>
                        </td>
                        <td style={{ padding: "14px 18px", fontFamily: "monospace", fontSize: "0.78rem", color: "var(--color-text-secondary)" }}>
                          {u._id || u.id}
                        </td>
                        <td style={{ padding: "14px 18px", textAlign: "right" }}>
                          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                            <button
                              onClick={() => openEditUser(u)}
                              title="Edit User Details"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "6px 10px",
                                borderRadius: "6px",
                                border: "1px solid var(--color-border)",
                                backgroundColor: "transparent",
                                color: "var(--color-text-primary)",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "all 0.15s ease"
                              }}
                            >
                              <Edit2 size={13} />
                              <span>Edit</span>
                            </button>
                            {u.role === "admin" && u.assignedId === "HUN-A-0001" ? (
                              <span
                                style={{
                                  fontSize: "0.72rem",
                                  padding: "4px 8px",
                                  borderRadius: "6px",
                                  backgroundColor: "rgba(239, 219, 25, 0.15)",
                                  color: "var(--color-brand)",
                                  fontWeight: 700
                                }}
                              >
                                Root Admin
                              </span>
                            ) : (
                              <button
                                onClick={() => handleDeleteUser(u._id || u.id, u.name, u.role, u.assignedId)}
                                title="Permanently Delete User Account"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  padding: "6px 10px",
                                  borderRadius: "6px",
                                  border: "1px solid rgba(239, 68, 68, 0.3)",
                                  backgroundColor: "rgba(239, 68, 68, 0.08)",
                                  color: "#EF4444",
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  transition: "all 0.15s ease"
                                }}
                              >
                                <Trash2 size={13} />
                                <span>Delete</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "var(--color-text-secondary)" }}>
                          No users matched your search criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════ */}
          {/* TAB 2: STUDENT MANAGEMENT & AUTOMATED ID */}
          {/* ══════════════════════════════════════════════ */}
          {activeTab === "students" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Header & Filter Controls */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "16px",
                  padding: "16px 20px",
                  backgroundColor: "var(--color-surface)",
                  borderRadius: "14px",
                  border: "1px solid var(--color-border)"
                }}
              >
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", flex: 1 }}>
                  {/* Search */}
                  <div style={{ position: "relative", minWidth: "220px", flex: 1 }}>
                    <Search size={16} style={{ position: "absolute", left: "12px", top: "12px", color: "var(--color-text-secondary)" }} />
                    <input
                      type="text"
                      placeholder="Search by Name, Email, or Student ID..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "9px 12px 9px 36px",
                        borderRadius: "8px",
                        border: "1px solid var(--color-border)",
                        backgroundColor: "var(--color-background)",
                        color: "var(--color-text-primary)",
                        fontSize: "0.85rem"
                      }}
                    />
                  </div>

                  {/* Course Filter */}
                  <select
                    value={studentCourseFilter}
                    onChange={(e) => setStudentCourseFilter(e.target.value)}
                    style={{
                      padding: "9px 14px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-background)",
                      color: "var(--color-text-primary)",
                      fontSize: "0.85rem"
                    }}
                  >
                    <option value="all">All Courses</option>
                    {courseOptions.map((c) => (
                      <option key={c.slug || c._id} value={c.title}>
                        {c.title}
                      </option>
                    ))}
                  </select>

                  {/* Status Filter */}
                  <select
                    value={studentStatusFilter}
                    onChange={(e) => setStudentStatusFilter(e.target.value)}
                    style={{
                      padding: "9px 14px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-background)",
                      color: "var(--color-text-primary)",
                      fontSize: "0.85rem"
                    }}
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="pending_activation">Pending Activation</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <button
                  onClick={openAddStudent}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "9px 16px",
                    borderRadius: "8px",
                    backgroundColor: "var(--color-brand)",
                    color: "#191A17",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer"
                  }}
                >
                  <Plus size={16} />
                  <span>Register Student</span>
                </button>
              </div>

              {/* Student Table */}
              <div
                style={{
                  backgroundColor: "var(--color-surface)",
                  borderRadius: "14px",
                  border: "1px solid var(--color-border)",
                  overflowX: "auto"
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--color-border)", backgroundColor: "rgba(0,0,0,0.02)" }}>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Student ID</th>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Student Details</th>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Course & Batch</th>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Status</th>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((s) => (
                      <tr key={s.studentId} style={{ borderBottom: "1px solid var(--color-border)", transition: "background 0.15s ease" }}>
                        <td style={{ padding: "14px 18px", fontFamily: "monospace", fontWeight: 700, color: "var(--color-brand)" }}>
                          {s.studentId}
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          <div style={{ fontWeight: 700 }}>{s.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>{s.email}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>{s.phone}</div>
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          <div style={{ fontWeight: 600 }}>{s.course}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>{s.batch}</div>
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          <span
                            style={{
                              padding: "4px 9px",
                              borderRadius: "12px",
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              backgroundColor:
                                s.enrollmentStatus === "active"
                                  ? "rgba(16, 185, 129, 0.15)"
                                  : s.enrollmentStatus === "suspended"
                                  ? "rgba(239, 68, 68, 0.15)"
                                  : "rgba(245, 158, 11, 0.15)",
                              color:
                                s.enrollmentStatus === "active"
                                  ? "#10B981"
                                  : s.enrollmentStatus === "suspended"
                                  ? "#EF4444"
                                  : "#F59E0B"
                            }}
                          >
                            {s.enrollmentStatus === "pending_activation" ? "Pending Activation" : s.enrollmentStatus}
                          </span>
                        </td>
                        <td style={{ padding: "14px 18px", textAlign: "right" }}>
                          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                            <button
                              onClick={() => openEditStudent(s)}
                              title="Edit Student Details"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "6px 10px",
                                borderRadius: "6px",
                                border: "1px solid var(--color-border)",
                                backgroundColor: "transparent",
                                color: "var(--color-text-primary)",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "all 0.15s ease"
                              }}
                            >
                              <Edit2 size={13} />
                              <span>Edit</span>
                            </button>
                            {s.enrollmentStatus === "pending_activation" && (
                              <button
                                onClick={() => handleResendInvitation(s.studentId)}
                                title="Copy / Resend Activation Link"
                                style={{
                                  padding: "6px 10px",
                                  borderRadius: "6px",
                                  border: "1px solid var(--color-border)",
                                  backgroundColor: "transparent",
                                  color: "var(--color-brand)",
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  cursor: "pointer"
                                }}
                              >
                                Invite Link
                              </button>
                            )}
                            <button
                              onClick={() => handleToggleStudentStatus(s.studentId, s.enrollmentStatus)}
                              title={s.enrollmentStatus === "active" ? "Suspend Account" : "Reactivate Account"}
                              style={{
                                padding: "6px 10px",
                                borderRadius: "6px",
                                border: "1px solid var(--color-border)",
                                backgroundColor: "transparent",
                                color: s.enrollmentStatus === "active" ? "#EF4444" : "#10B981",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                cursor: "pointer"
                              }}
                            >
                              {s.enrollmentStatus === "active" ? "Suspend" : "Activate"}
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(s.studentId, s.name)}
                              title="Permanently Delete Student"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "6px 10px",
                                borderRadius: "6px",
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                backgroundColor: "rgba(239, 68, 68, 0.08)",
                                color: "#EF4444",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "all 0.15s ease"
                              }}
                            >
                              <Trash2 size={13} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredStudents.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "var(--color-text-secondary)" }}>
                          No students matched your search criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════ */}
          {/* TAB 3: STAFF MANAGEMENT & HUN-T-XXXX ID */}
          {/* ══════════════════════════════════════════════ */}
          {activeTab === "staff" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "16px",
                  padding: "16px 20px",
                  backgroundColor: "var(--color-surface)",
                  borderRadius: "14px",
                  border: "1px solid var(--color-border)"
                }}
              >
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", flex: 1 }}>
                  <div style={{ position: "relative", minWidth: "220px", flex: 1 }}>
                    <Search size={16} style={{ position: "absolute", left: "12px", top: "12px", color: "var(--color-text-secondary)" }} />
                    <input
                      type="text"
                      placeholder="Search faculty by name, ID, or subject..."
                      value={staffSearch}
                      onChange={(e) => setStaffSearch(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "9px 12px 9px 36px",
                        borderRadius: "8px",
                        border: "1px solid var(--color-border)",
                        backgroundColor: "var(--color-background)",
                        color: "var(--color-text-primary)",
                        fontSize: "0.85rem"
                      }}
                    />
                  </div>
                  <select
                    value={staffRoleFilter}
                    onChange={(e) => setStaffRoleFilter(e.target.value)}
                    style={{
                      padding: "9px 14px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-background)",
                      color: "var(--color-text-primary)",
                      fontSize: "0.85rem"
                    }}
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin / Founder</option>
                    <option value="teacher">Teacher / Faculty</option>
                    <option value="staff">Administrative Staff</option>
                  </select>
                </div>

                <button
                  onClick={() => setModalType("add_staff")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "9px 16px",
                    borderRadius: "8px",
                    backgroundColor: "var(--color-brand)",
                    color: "#191A17",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer"
                  }}
                >
                  <Plus size={16} />
                  <span>Add Staff Member</span>
                </button>
              </div>

              <div
                style={{
                  backgroundColor: "var(--color-surface)",
                  borderRadius: "14px",
                  border: "1px solid var(--color-border)",
                  overflowX: "auto"
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--color-border)", backgroundColor: "rgba(0,0,0,0.02)" }}>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Staff ID</th>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Member</th>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Designation & Dept</th>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Assigned Domains</th>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Status</th>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff.map((st) => (
                      <tr key={st.staffId} style={{ borderBottom: "1px solid var(--color-border)" }}>
                        <td style={{ padding: "14px 18px", fontFamily: "monospace", fontWeight: 700, color: "var(--color-brand)" }}>
                          {st.staffId}
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          <div style={{ fontWeight: 700 }}>{st.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>{st.email}</div>
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          <div style={{ fontWeight: 600 }}>{st.designation}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "3px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>{st.department}</span>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "3px",
                                padding: "2px 7px",
                                borderRadius: "6px",
                                backgroundColor: "rgba(235, 94, 40, 0.1)",
                                color: "var(--color-accent, #EB5E28)",
                                fontSize: "0.7rem",
                                fontWeight: 700
                              }}
                            >
                              <ShieldCheck size={11} />
                              {st.roleName || (st.role === "admin" ? "Super Admin" : (st.role === "teacher" ? "Teacher / Faculty" : "Staff"))}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                            {st.assignedSubjects &&
                              st.assignedSubjects.map((sub, i) => (
                                <span
                                  key={i}
                                  style={{
                                    fontSize: "0.7rem",
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                    backgroundColor: "rgba(0,0,0,0.05)",
                                    color: "var(--color-text-primary)"
                                  }}
                                >
                                  {sub}
                                </span>
                              ))}
                          </div>
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          <span
                            style={{
                              padding: "4px 9px",
                              borderRadius: "12px",
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              backgroundColor: st.employmentStatus === "active" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                              color: st.employmentStatus === "active" ? "#10B981" : "#EF4444"
                            }}
                          >
                            {st.employmentStatus}
                          </span>
                        </td>
                        <td style={{ padding: "14px 18px", textAlign: "right" }}>
                          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                            <button
                              onClick={() => openEditStaff(st)}
                              title="Edit Staff Member Details"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "6px 10px",
                                borderRadius: "6px",
                                border: "1px solid var(--color-border)",
                                backgroundColor: "transparent",
                                color: "var(--color-text-primary)",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "all 0.15s ease"
                              }}
                            >
                              <Edit2 size={13} />
                              <span>Edit</span>
                            </button>
                            {st.role === "admin" ? (
                              <span
                                style={{
                                  fontSize: "0.72rem",
                                  padding: "4px 8px",
                                  borderRadius: "6px",
                                  backgroundColor: "rgba(239, 219, 25, 0.15)",
                                  color: "var(--color-brand)",
                                  fontWeight: 700
                                }}
                              >
                                Root Admin
                              </span>
                            ) : (
                              <div style={{ display: "inline-flex", gap: "6px" }}>
                                <button
                                  onClick={() => handleResendStaffInvitation(st.staffId, st.name)}
                                  title="Generate / Resend Password Activation Link"
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    padding: "6px 10px",
                                    borderRadius: "6px",
                                    border: "1px solid var(--color-border)",
                                    backgroundColor: "var(--color-surface)",
                                    color: "var(--color-text-primary)",
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    transition: "all 0.15s ease"
                                  }}
                                >
                                  <KeyRound size={13} color="var(--color-brand)" />
                                  <span>Invite / Reset</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteStaff(st.staffId, st.name)}
                                  title="Permanently Delete Staff Member"
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    padding: "6px 10px",
                                    borderRadius: "6px",
                                    border: "1px solid rgba(239, 68, 68, 0.3)",
                                    backgroundColor: "rgba(239, 68, 68, 0.08)",
                                    color: "#EF4444",
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    transition: "all 0.15s ease"
                                  }}
                                >
                                  <Trash2 size={13} />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════ */}
          {/* TAB 4: ACCOUNT INVITATIONS & ACTIVATION TRACKER */}
          {/* ══════════════════════════════════════════════ */}
          {(activeTab === "invitations" || activeTab === "staff_invitations") && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div
                style={{
                  padding: "18px 24px",
                  backgroundColor: "var(--color-surface)",
                  borderRadius: "14px",
                  border: "1px solid var(--color-border)"
                }}
              >
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 6px 0" }}>
                  {activeTab === "staff_invitations" ? "Staff Invitations" : "Student Invitations"}
                </h3>
                <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
                  View pending account activations and generate a fresh single-use invitation link when needed.
                </p>
              </div>

              <div
                style={{
                  backgroundColor: "var(--color-surface)",
                  borderRadius: "14px",
                  border: "1px solid var(--color-border)",
                  overflowX: "auto"
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--color-border)", backgroundColor: "rgba(0,0,0,0.02)" }}>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>{activeTab === "staff_invitations" ? "Staff ID" : "Student ID"}</th>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Recipient</th>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Type</th>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Activation Status</th>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeTab === "invitations" && students
                      .filter((s) => s.enrollmentStatus === "pending_activation")
                      .map((s) => (
                        <tr key={s.studentId} style={{ borderBottom: "1px solid var(--color-border)" }}>
                          <td style={{ padding: "14px 18px", fontFamily: "monospace", fontWeight: 700, color: "var(--color-brand)" }}>
                            {s.studentId}
                          </td>
                          <td style={{ padding: "14px 18px" }}>
                            <div style={{ fontWeight: 700 }}>{s.name}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>{s.email}</div>
                          </td>
                          <td style={{ padding: "14px 18px" }}>
                            <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>Student Invitation</span>
                          </td>
                          <td style={{ padding: "14px 18px" }}>
                            <span
                              style={{
                                padding: "4px 9px",
                                borderRadius: "12px",
                                fontSize: "0.72rem",
                                fontWeight: 700,
                                backgroundColor: "rgba(245, 158, 11, 0.15)",
                                color: "#F59E0B"
                              }}
                            >
                              Pending Password Setup
                            </span>
                          </td>
                          <td style={{ padding: "14px 18px", textAlign: "right" }}>
                            <button
                              onClick={() => handleResendInvitation(s.studentId)}
                              style={{
                                padding: "6px 12px",
                                borderRadius: "6px",
                                backgroundColor: "var(--color-brand)",
                                color: "#191A17",
                                border: "none",
                                fontWeight: 700,
                                fontSize: "0.78rem",
                                cursor: "pointer"
                              }}
                            >
                              Generate Activation Link
                            </button>
                          </td>
                        </tr>
                      ))}
                    {activeTab === "staff_invitations" && staff
                      .filter((member) => users.some((user) =>
                        user.assignedId === member.staffId && user.status === "pending_activation"
                      ))
                      .map((member) => (
                        <tr key={member.staffId} style={{ borderBottom: "1px solid var(--color-border)" }}>
                          <td style={{ padding: "14px 18px", fontFamily: "monospace", fontWeight: 700, color: "var(--color-brand)" }}>
                            {member.staffId}
                          </td>
                          <td style={{ padding: "14px 18px" }}>
                            <div style={{ fontWeight: 700 }}>{member.name}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>{member.email}</div>
                          </td>
                          <td style={{ padding: "14px 18px" }}>
                            <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>Staff Invitation</span>
                          </td>
                          <td style={{ padding: "14px 18px" }}>
                            <span
                              style={{
                                padding: "4px 9px",
                                borderRadius: "12px",
                                fontSize: "0.72rem",
                                fontWeight: 700,
                                backgroundColor: "rgba(245, 158, 11, 0.15)",
                                color: "#F59E0B"
                              }}
                            >
                              Pending Password Setup
                            </span>
                          </td>
                          <td style={{ padding: "14px 18px", textAlign: "right" }}>
                            <button
                              type="button"
                              onClick={() => handleResendStaffInvitation(member.staffId, member.name)}
                              style={{
                                padding: "6px 12px",
                                borderRadius: "6px",
                                backgroundColor: "var(--color-brand)",
                                color: "#191A17",
                                border: "none",
                                fontWeight: 700,
                                fontSize: "0.78rem",
                                cursor: "pointer"
                              }}
                            >
                              Generate Activation Link
                            </button>
                          </td>
                        </tr>
                      ))}
                    {(activeTab === "invitations"
                      ? students.filter((s) => s.enrollmentStatus === "pending_activation").length
                      : staff.filter((member) => users.some((user) =>
                          user.assignedId === member.staffId && user.status === "pending_activation"
                        )).length) === 0 && (
                      <tr>
                        <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "var(--color-text-secondary)" }}>
                          No pending {activeTab === "staff_invitations" ? "staff" : "student"} invitations.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════ */}
          {/* TAB 5: COURSES & BATCHES */}
          {/* ══════════════════════════════════════════════ */}
          {activeTab === "courses" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Courses Section */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <div>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0 }}>Courses & Curriculum</h3>
                    <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
                      Programs offered at Hunar The Skill House, Ludhiana
                    </p>
                  </div>
                  <button
                    onClick={openAddCourse}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 14px",
                      borderRadius: "8px",
                      backgroundColor: "var(--color-brand)",
                      color: "#191A17",
                      border: "none",
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      cursor: "pointer"
                    }}
                  >
                    <Plus size={15} />
                    <span>Create Course</span>
                  </button>
                </div>

                {academicDataErrors.courses && (
                  <div role="alert" style={{ padding: "16px", borderRadius: "10px", border: "1px solid #FCA5A5", color: "#B91C1C" }}>
                    <p style={{ margin: "0 0 10px" }}>{academicDataErrors.courses}</p>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => loadAllData()}>Retry loading courses</button>
                  </div>
                )}
                {adminCourseList.length === 0 ? (
                  <div role="status" style={{ padding: "18px", borderRadius: "10px", border: "1px dashed var(--color-border)", color: "var(--color-text-secondary)" }}>
                    <p style={{ margin: "0 0 10px" }}>No courses have been added yet.</p>
                    <button type="button" className="btn btn-outline btn-sm" onClick={openAddCourse}>Create your first course</button>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
                    {adminCourseList.map((c) => (
                    <div
                      key={c.slug || c._id || c.id}
                      style={{
                        padding: "20px",
                        backgroundColor: "var(--color-surface)",
                        borderRadius: "14px",
                        border: "1px solid var(--color-border)"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                        <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "var(--color-brand)" }}>
                          {c.category || "Uncategorized"}
                        </span>
                        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-secondary)" }}>
                          {c.duration || "Duration not set"}
                        </span>
                      </div>
                      <h4 style={{ fontSize: "1rem", fontWeight: 800, margin: "0 0 6px 0" }}>{c.title}</h4>
                      <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", margin: "0 0 12px 0", lineHeight: 1.5 }}>
                        {c.shortDesc || c.description || c.tagline || "No course description provided."}
                      </p>
                      <details style={{ marginBottom: "12px", fontSize: "0.78rem", color: "var(--color-text-secondary)" }}>
                        <summary style={{ cursor: "pointer", fontWeight: 700, color: "var(--color-text-primary)" }}>
                          View complete course information
                        </summary>
                        <div style={{ display: "grid", gap: "8px", marginTop: "12px", lineHeight: 1.55 }}>
                          {c.tagline && <p style={{ margin: 0 }}><strong>Tagline:</strong> {c.tagline}</p>}
                          {c.badge && <p style={{ margin: 0 }}><strong>Badge:</strong> {c.badge}</p>}
                          {c.mode && <p style={{ margin: 0 }}><strong>Mode:</strong> {c.mode}</p>}
                          {c.level && <p style={{ margin: 0 }}><strong>Level:</strong> {c.level}</p>}
                          {c.description && <p style={{ margin: 0 }}><strong>Description:</strong> {c.description}</p>}
                          {c.mentor && <p style={{ margin: 0 }}><strong>Mentor:</strong> {[c.mentor.name, c.mentor.role, c.mentor.exp].filter(Boolean).join(" · ") || "Not assigned"}</p>}
                          {c.highlights?.length > 0 && (
                            <div><strong>Highlights</strong><ul style={{ margin: "4px 0 0", paddingLeft: "20px" }}>{c.highlights.map((item, index) => <li key={index}>{item}</li>)}</ul></div>
                          )}
                          {c.tools?.length > 0 && <p style={{ margin: 0 }}><strong>Tools:</strong> {c.tools.join(", ")}</p>}
                          {c.syllabus?.length > 0 && <p style={{ margin: 0 }}><strong>Syllabus:</strong> {c.syllabus.join(", ")}</p>}
                          {c.curriculum?.length > 0 && (
                            <div><strong>Curriculum</strong>
                              {c.curriculum.map((module, index) => (
                                <div key={index} style={{ marginTop: "6px" }}>
                                  <strong>{[module.module, module.title].filter(Boolean).join(": ")}</strong>
                                  {Array.isArray(module.topics) && <ul style={{ margin: "3px 0 0", paddingLeft: "20px" }}>{module.topics.map((topic, topicIndex) => <li key={topicIndex}>{topic}</li>)}</ul>}
                                </div>
                              ))}
                            </div>
                          )}
                          {c.projects?.length > 0 && (
                            <div><strong>Projects</strong><ul style={{ margin: "4px 0 0", paddingLeft: "20px" }}>
                              {c.projects.map((project, index) => <li key={index}><strong>{project.title || project.name || "Project"}</strong>{(project.desc || project.description) && `: ${project.desc || project.description}`}</li>)}
                            </ul></div>
                          )}
                          {c.careerRoles?.length > 0 && <p style={{ margin: 0 }}><strong>Career roles:</strong> {c.careerRoles.join(", ")}</p>}
                          {c.rating > 0 && <p style={{ margin: 0 }}><strong>Rating:</strong> {c.rating}{c.reviewsCount ? ` (${c.reviewsCount} reviews)` : ""}</p>}
                          {c.image && <p style={{ margin: 0, overflowWrap: "anywhere" }}><strong>Image:</strong> {c.image}</p>}
                          {c.featured && <p style={{ margin: 0 }}><strong>Featured program</strong></p>}
                        </div>
                      </details>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--color-border)", paddingTop: "10px", marginTop: "10px" }}>
                        <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-secondary)" }}>
                          Lead Faculty: {c.assignedTeacher || c.mentor?.name || "Unassigned"}
                        </div>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            onClick={() => openEditCourse(c)}
                            title="Edit Course"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              border: "1px solid var(--color-border)",
                              backgroundColor: "transparent",
                              color: "var(--color-text-primary)",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              cursor: "pointer"
                            }}
                          >
                            <Edit2 size={12} />
                            <span>Edit</span>
                          </button>
                          {courses.some((savedCourse) => savedCourse.slug === c.slug) && !coursesData.some((publishedCourse) => publishedCourse.slug === c.slug) ? (
                            <button
                              onClick={() => handleDeleteCourse(c.slug || c._id || c.id, c.title)}
                              title="Delete Course"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "4px 8px",
                                borderRadius: "6px",
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                backgroundColor: "rgba(239, 68, 68, 0.08)",
                                color: "#EF4444",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                cursor: "pointer"
                              }}
                            >
                              <Trash2 size={12} />
                              <span>Delete</span>
                            </button>
                          ) : (
                            <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>Published catalog</span>
                          )}
                        </div>
                      </div>
                    </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Batches Section */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <div>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0 }}>Batches & Schedules</h3>
                    <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
                      Active student cohorts and class timings
                    </p>
                  </div>
                  <button
                    onClick={openAddBatch}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 14px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "transparent",
                      color: "var(--color-text-primary)",
                      fontWeight: 600,
                      fontSize: "0.82rem",
                      cursor: "pointer"
                    }}
                  >
                    <Plus size={15} />
                    <span>New Batch</span>
                  </button>
                </div>

                {academicDataErrors.batches ? (
                  <div role="alert" style={{ padding: "16px", borderRadius: "10px", border: "1px solid #FCA5A5", color: "#B91C1C" }}>
                    <p style={{ margin: "0 0 10px" }}>{academicDataErrors.batches}</p>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => loadAllData()}>Retry loading batches</button>
                  </div>
                ) : batches.length === 0 ? (
                  <div role="status" style={{ padding: "18px", borderRadius: "10px", border: "1px dashed var(--color-border)", color: "var(--color-text-secondary)" }}>
                    <p style={{ margin: "0 0 10px" }}>No batches have been created yet.</p>
                    <button type="button" className="btn btn-outline btn-sm" onClick={openAddBatch}>Create your first batch</button>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                    {batches.map((b) => (
                    <div
                      key={b._id || b.name}
                      style={{
                        padding: "18px",
                        backgroundColor: "var(--color-surface)",
                        borderRadius: "14px",
                        border: "1px solid var(--color-border)"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <span style={{ fontSize: "0.92rem", fontWeight: 800 }}>{b.name}</span>
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10B981" }} />
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", marginBottom: "4px" }}>
                        Course: <strong>{b.course}</strong>
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", marginBottom: "8px" }}>
                        Timing: <strong>{b.timing}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--color-border)", paddingTop: "10px", marginTop: "10px" }}>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                          Instructor: {b.assignedTeacher || "Unassigned"}
                        </div>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            onClick={() => openEditBatch(b)}
                            title="Edit Batch"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              border: "1px solid var(--color-border)",
                              backgroundColor: "transparent",
                              color: "var(--color-text-primary)",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              cursor: "pointer"
                            }}
                          >
                            <Edit2 size={12} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteBatch(b.name || b._id)}
                            title="Delete Batch"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              border: "1px solid rgba(239, 68, 68, 0.3)",
                              backgroundColor: "rgba(239, 68, 68, 0.08)",
                              color: "#EF4444",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              cursor: "pointer"
                            }}
                          >
                            <Trash2 size={12} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════ */}
          {/* TAB 6: ATTENDANCE REGISTER */}
          {/* ══════════════════════════════════════════════ */}
          {activeTab === "attendance" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div
                style={{
                  padding: "18px 24px",
                  backgroundColor: "var(--color-surface)",
                  borderRadius: "14px",
                  border: "1px solid var(--color-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "14px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-secondary)", display: "block", marginBottom: "4px" }}>
                      Select Batch
                    </label>
                    <select
                      value={selectedBatchForAttendance}
                      onChange={(e) => setSelectedBatchForAttendance(e.target.value)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "8px",
                        border: "1px solid var(--color-border)",
                        backgroundColor: "var(--color-background)",
                        color: "var(--color-text-primary)",
                        fontSize: "0.85rem",
                        fontWeight: 600
                      }}
                    >
                      {batches.map((b) => (
                        <option key={b._id || b.name} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-secondary)", display: "block", marginBottom: "4px" }}>
                      Class Date
                    </label>
                    <input
                      type="date"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      style={{
                        padding: "7px 12px",
                        borderRadius: "8px",
                        border: "1px solid var(--color-border)",
                        backgroundColor: "var(--color-background)",
                        color: "var(--color-text-primary)",
                        fontSize: "0.85rem"
                      }}
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveAttendance}
                  disabled={submitting}
                  style={{
                    padding: "9px 18px",
                    borderRadius: "8px",
                    backgroundColor: "var(--color-brand)",
                    color: "#191A17",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(239, 219, 25, 0.3)"
                  }}
                >
                  {submitting ? "Saving Register..." : "Submit Attendance Register"}
                </button>
              </div>

              {/* Attendance Table */}
              <div
                style={{
                  backgroundColor: "var(--color-surface)",
                  borderRadius: "14px",
                  border: "1px solid var(--color-border)",
                  overflowX: "auto"
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--color-border)", backgroundColor: "rgba(0,0,0,0.02)" }}>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Student ID</th>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Name</th>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Course</th>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)", textAlign: "center" }}>
                        Attendance Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {students
                      .filter((s) => s.batch === selectedBatchForAttendance)
                      .map((s) => {
                        const rec = attendanceRecords.find((a) => a.studentId === s.studentId);
                        const currentStatus = rec ? rec.status : "present";
                        return (
                          <tr key={s.studentId} style={{ borderBottom: "1px solid var(--color-border)" }}>
                            <td style={{ padding: "14px 18px", fontFamily: "monospace", fontWeight: 700, color: "var(--color-brand)" }}>
                              {s.studentId}
                            </td>
                            <td style={{ padding: "14px 18px", fontWeight: 700 }}>{s.name}</td>
                            <td style={{ padding: "14px 18px", color: "var(--color-text-secondary)" }}>{s.course}</td>
                            <td style={{ padding: "14px 18px", textAlign: "center" }}>
                              <div style={{ display: "inline-flex", gap: "6px" }}>
                                {["present", "absent", "late"].map((st) => (
                                  <button
                                    key={st}
                                    onClick={() => {
                                      setAttendanceRecords((prev) => {
                                        const filtered = prev.filter((a) => a.studentId !== s.studentId);
                                        return [...filtered, { studentId: s.studentId, status: st }];
                                      });
                                    }}
                                    style={{
                                      padding: "5px 12px",
                                      borderRadius: "6px",
                                      fontSize: "0.75rem",
                                      fontWeight: 700,
                                      border: "1px solid var(--color-border)",
                                      backgroundColor:
                                        currentStatus === st
                                          ? st === "present"
                                            ? "#10B981"
                                            : st === "absent"
                                            ? "#EF4444"
                                            : "#F59E0B"
                                          : "transparent",
                                      color: currentStatus === st ? "#FFFFFF" : "var(--color-text-primary)",
                                      cursor: "pointer",
                                      textTransform: "capitalize"
                                    }}
                                  >
                                    {st}
                                  </button>
                                ))}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    {students.filter((s) => s.batch === selectedBatchForAttendance).length === 0 && (
                      <tr>
                        <td colSpan={4} style={{ padding: "40px", textAlign: "center", color: "var(--color-text-secondary)" }}>
                          No students currently enrolled in {selectedBatchForAttendance}.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════ */}
          {/* TAB 7: TIMETABLE & SCHEDULES */}
          {/* ══════════════════════════════════════════════ */}
          {activeTab === "timetable" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0 }}>Institute Weekly Schedule</h3>
                  <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
                    Classroom & Lab allocation across batches (Lab 1 Silicon Room & Lab 2 AI Cluster)
                  </p>
                </div>
                <button
                  onClick={openAddTimetable}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 14px",
                    borderRadius: "8px",
                    backgroundColor: "var(--color-brand)",
                    color: "#191A17",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    cursor: "pointer"
                  }}
                >
                  <Plus size={15} />
                  <span>Add Class Slot</span>
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                {timetable.map((slot) => (
                  <div
                    key={slot._id || slot.id}
                    style={{
                      padding: "18px",
                      backgroundColor: "var(--color-surface)",
                      borderRadius: "14px",
                      border: "1px solid var(--color-border)",
                      position: "relative"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          backgroundColor: "rgba(239, 219, 25, 0.2)",
                          color: "var(--color-text-primary)"
                        }}
                      >
                        {slot.day}
                      </span>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <button
                          onClick={() => openEditTimetable(slot)}
                          title="Edit Class Slot"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "3px",
                            padding: "3px 7px",
                            borderRadius: "5px",
                            border: "1px solid var(--color-border)",
                            backgroundColor: "transparent",
                            color: "var(--color-text-primary)",
                            fontSize: "0.72rem",
                            cursor: "pointer"
                          }}
                        >
                          <Edit2 size={12} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteTimetable(slot._id || slot.id)}
                          title="Remove slot"
                          style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", padding: "2px" }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                    <h4 style={{ fontSize: "0.95rem", fontWeight: 800, margin: "0 0 6px 0" }}>{slot.subject}</h4>
                    <div style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", marginBottom: "4px" }}>
                      Batch: <strong>{slot.batch}</strong>
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", marginBottom: "8px" }}>
                      Time: <strong>{slot.time}</strong>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", borderTop: "1px solid var(--color-border)", paddingTop: "8px" }}>
                      Instructor: {slot.teacher} • {slot.room}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════ */}
          {/* TAB 8: ASSIGNMENTS & REVIEWS */}
          {/* ══════════════════════════════════════════════ */}
          {activeTab === "assignments" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0 }}>Assignments & Submissions</h3>
                  <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
                    Track student project submissions and grading
                  </p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
                {assignments.map((a) => (
                  <div
                    key={a._id || a.id}
                    style={{
                      padding: "20px",
                      backgroundColor: "var(--color-surface)",
                      borderRadius: "14px",
                      border: "1px solid var(--color-border)"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--color-brand)" }}>{a.batch}</span>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                        Max: {a.maxMarks} Marks
                      </span>
                    </div>
                    <h4 style={{ fontSize: "1rem", fontWeight: 800, margin: "0 0 6px 0" }}>{a.title}</h4>
                    <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", margin: "0 0 12px 0" }}>
                      {a.description}
                    </p>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                      Deadline: {new Date(a.deadline).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════ */}
          {/* TAB 9: FEE RECORDS & RECEIPTS */}
          {/* ══════════════════════════════════════════════ */}
          {activeTab === "fees" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0 }}>Fee Records & Receipts</h3>
                  <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
                    Institutional fee schedules, verified transactions, and receipts
                  </p>
                </div>
                {hasPermission("fees.payments_record") && (
                  <button
                    onClick={() => setModalType("record_fee")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 14px",
                      borderRadius: "8px",
                      backgroundColor: "var(--color-brand)",
                      color: "#191A17",
                      border: "none",
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      cursor: "pointer"
                    }}
                  >
                    <Plus size={15} />
                    <span>Record Payment</span>
                  </button>
                )}
              </div>

              <div
                style={{
                  backgroundColor: "var(--color-surface)",
                  borderRadius: "14px",
                  border: "1px solid var(--color-border)",
                  overflowX: "auto"
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--color-border)", backgroundColor: "rgba(0,0,0,0.02)" }}>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Student ID</th>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Student</th>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Course</th>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Total Fee</th>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Paid</th>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Status</th>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Receipt</th>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fees.map((f, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid var(--color-border)" }}>
                        <td style={{ padding: "14px 18px", fontFamily: "monospace", fontWeight: 700, color: "var(--color-brand)" }}>
                          {f.studentId}
                        </td>
                        <td style={{ padding: "14px 18px", fontWeight: 700 }}>{f.studentName}</td>
                        <td style={{ padding: "14px 18px", color: "var(--color-text-secondary)" }}>{f.course}</td>
                        <td style={{ padding: "14px 18px", fontWeight: 600 }}>₹{f.totalFee?.toLocaleString()}</td>
                        <td style={{ padding: "14px 18px", fontWeight: 700, color: "#10B981" }}>₹{f.paidAmount?.toLocaleString()}</td>
                        <td style={{ padding: "14px 18px" }}>
                          <span
                            style={{
                              padding: "4px 9px",
                              borderRadius: "12px",
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              backgroundColor: f.status === "paid" ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                              color: f.status === "paid" ? "#10B981" : "#F59E0B"
                            }}
                          >
                            {f.status}
                          </span>
                        </td>
                        <td style={{ padding: "14px 18px", fontFamily: "monospace", fontSize: "0.75rem" }}>
                          {f.receiptNumber}
                        </td>
                        <td style={{ padding: "14px 18px", textAlign: "right" }}>
                          <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                            {hasPermission("fees.payments_edit") && (
                              <>
                                <button
                                  onClick={() => openEditFee(f)}
                                  title="Edit Fee Record"
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    padding: "4px 8px",
                                    borderRadius: "6px",
                                    border: "1px solid var(--color-border)",
                                    backgroundColor: "transparent",
                                    color: "var(--color-text-primary)",
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    cursor: "pointer"
                                  }}
                                >
                                  <Edit2 size={12} />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteFee(f.studentId || f._id, f.studentName)}
                                  title="Delete Fee Record"
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    padding: "4px 8px",
                                    borderRadius: "6px",
                                    border: "1px solid rgba(239, 68, 68, 0.3)",
                                    backgroundColor: "rgba(239, 68, 68, 0.08)",
                                    color: "#EF4444",
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    cursor: "pointer"
                                  }}
                                >
                                  <Trash2 size={12} />
                                  <span>Delete</span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════ */}
          {/* TAB 10: ANNOUNCEMENTS CENTER */}
          {/* ══════════════════════════════════════════════ */}
          {activeTab === "announcements" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0 }}>Institute Announcements</h3>
                  <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
                    Official notices broadcasted to student & staff portals
                  </p>
                </div>
                <button
                  onClick={() => setModalType("post_announcement")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 14px",
                    borderRadius: "8px",
                    backgroundColor: "var(--color-brand)",
                    color: "#191A17",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    cursor: "pointer"
                  }}
                >
                  <Plus size={15} />
                  <span>Post Notice</span>
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {announcements.map((a, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "20px",
                      backgroundColor: "var(--color-surface)",
                      borderRadius: "14px",
                      border: "1px solid var(--color-border)",
                      borderLeft: "4px solid var(--color-brand)"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <h4 style={{ fontSize: "1.02rem", fontWeight: 800, margin: 0 }}>{a.title}</h4>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <span
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            padding: "3px 8px",
                            borderRadius: "4px",
                            backgroundColor: "rgba(239, 219, 25, 0.2)",
                            color: "var(--color-text-primary)"
                          }}
                        >
                          Target: {a.audience}
                        </span>
                        <button
                          onClick={() => openEditAnnouncement(a)}
                          title="Edit Announcement"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "3px 7px",
                            borderRadius: "5px",
                            border: "1px solid var(--color-border)",
                            backgroundColor: "transparent",
                            color: "var(--color-text-primary)",
                            fontSize: "0.72rem",
                            cursor: "pointer"
                          }}
                        >
                          <Edit2 size={12} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteAnnouncement(a._id || a.id, a.title)}
                          title="Delete Announcement"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "3px 7px",
                            borderRadius: "5px",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                            backgroundColor: "rgba(239, 68, 68, 0.08)",
                            color: "#EF4444",
                            fontSize: "0.72rem",
                            cursor: "pointer"
                          }}
                        >
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", margin: "0 0 12px 0", lineHeight: 1.6 }}>
                      {a.message}
                    </p>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                      Posted by <strong>{a.authorName}</strong> ({a.authorRole}) • {new Date(a.publishDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════ */}
          {/* TAB 11: LEADS & INQUIRIES */}
          {/* ══════════════════════════════════════════════ */}
          {activeTab === "leads" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 20px",
                  backgroundColor: "var(--color-surface)",
                  borderRadius: "14px",
                  border: "1px solid var(--color-border)",
                  flexWrap: "wrap",
                  gap: "12px"
                }}
              >
                <div>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 4px 0" }}>Website Inquiries & Admissions</h3>
                  <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
                    Inquiries submitted via the Contact and Course Demo forms
                  </p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {["all", "New", "Contacted", "Interested", "Enrolled", "Dropped"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setLeadStatusFilter(status)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        border: "1px solid var(--color-border)",
                        backgroundColor: leadStatusFilter === status ? "var(--color-brand)" : "transparent",
                        color: leadStatusFilter === status ? "#191A17" : "var(--color-text-primary)",
                        fontWeight: 700,
                        fontSize: "0.78rem",
                        cursor: "pointer"
                      }}
                    >
                      {status === "all" ? "All Inquiries" : status}
                    </button>
                  ))}
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "var(--color-surface)",
                  borderRadius: "14px",
                  border: "1px solid var(--color-border)",
                  overflowX: "auto"
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--color-border)", backgroundColor: "rgba(0,0,0,0.02)" }}>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Prospect</th>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Course Interested</th>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Preferred Time</th>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Status</th>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)", textAlign: "right" }}>Update Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((l) => {
                      const leadId = String(l._id || l.id);
                      return (
                      <tr key={leadId} style={{ borderBottom: "1px solid var(--color-border)" }}>
                        <td style={{ padding: "14px 18px" }}>
                          <div style={{ fontWeight: 700 }}>{l.name}</div>
                          <a href={`tel:${l.phone}`} style={{ display: "block", fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>{l.phone}</a>
                          {l.email && <a href={`mailto:${l.email}`} style={{ display: "block", fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>{l.email}</a>}
                          {l.createdAt && <div style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", marginTop: "4px" }}>{new Date(l.createdAt).toLocaleDateString()}</div>}
                        </td>
                        <td style={{ padding: "14px 18px", fontWeight: 600 }}>
                          <div>{l.course || "Not specified"}</div>
                          {l.message && <div style={{ maxWidth: "280px", marginTop: "6px", color: "var(--color-text-secondary)", fontSize: "0.78rem", fontWeight: 400, whiteSpace: "pre-wrap" }}>{l.message}</div>}
                          <textarea
                            aria-label={`Follow-up notes for ${l.name}`}
                            maxLength={2000}
                            placeholder="Add follow-up notes"
                            value={leadNotes[leadId] ?? l.notes ?? ""}
                            onChange={(e) => setLeadNotes((previous) => ({ ...previous, [leadId]: e.target.value }))}
                            style={{ display: "block", width: "100%", minWidth: "180px", marginTop: "8px", padding: "7px", borderRadius: "6px", border: "1px solid var(--color-border)", background: "var(--color-background)", color: "var(--color-text-primary)", font: "inherit" }}
                          />
                          <button type="button" className="btn btn-outline" onClick={() => handleSaveLeadNotes(leadId)} style={{ marginTop: "6px", padding: "5px 9px", fontSize: "0.72rem" }}>Save notes</button>
                        </td>
                        <td style={{ padding: "14px 18px", color: "var(--color-text-secondary)" }}>{l.preferredTiming}</td>
                        <td style={{ padding: "14px 18px" }}>
                          <span
                            style={{
                              padding: "4px 9px",
                              borderRadius: "12px",
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              backgroundColor:
                                l.status === "New"
                                  ? "rgba(239, 219, 25, 0.2)"
                                  : l.status === "Enrolled"
                                  ? "rgba(16, 185, 129, 0.15)"
                                  : "rgba(59, 130, 246, 0.15)",
                              color:
                                l.status === "New"
                                  ? "var(--color-text-primary)"
                                  : l.status === "Enrolled"
                                  ? "#10B981"
                                  : "#3B82F6"
                            }}
                          >
                            {l.status}
                          </span>
                        </td>
                        <td style={{ padding: "14px 18px", textAlign: "right" }}>
                          <select
                            value={l.status}
                            onChange={(e) => handleUpdateLeadStatus(leadId, e.target.value)}
                            style={{
                              padding: "5px 10px",
                              borderRadius: "6px",
                              border: "1px solid var(--color-border)",
                              backgroundColor: "var(--color-background)",
                              color: "var(--color-text-primary)",
                              fontSize: "0.78rem"
                            }}
                          >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Interested">Interested</option>
                            <option value="Enrolled">Enrolled</option>
                            <option value="Dropped">Dropped</option>
                          </select>
                        </td>
                      </tr>
                    );})}
                    {filteredLeads.length === 0 && (
                      <tr><td colSpan={5} style={{ padding: "24px", textAlign: "center", color: "var(--color-text-secondary)" }}>No inquiries found for this status.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════ */}
          {/* TAB 12: REPORTS & EXPORTS */}
          {/* ══════════════════════════════════════════════ */}
          {activeTab === "reports" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div
                style={{
                  padding: "18px 24px",
                  backgroundColor: "var(--color-surface)",
                  borderRadius: "14px",
                  border: "1px solid var(--color-border)"
                }}
              >
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: "0 0 6px 0" }}>Institutional Reports & CSV Exports</h3>
                <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
                  Generate and export institution data securely. Data exports are permission-controlled and logged to audit trails.
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                {[
                  {
                    title: "Student Roster Export",
                    desc: "Full enrollment database including Student IDs, courses, batches, and contact numbers.",
                    type: "students",
                    icon: GraduationCap
                  },
                  {
                    title: "Staff & Faculty Registry",
                    desc: "Staff IDs, departments, designated subjects, and assigned courses.",
                    type: "staff",
                    icon: Briefcase
                  },
                  {
                    title: "Inquiries & Admissions",
                    desc: "Lead pipeline, contact phone numbers, selected courses, and status.",
                    type: "leads",
                    icon: Users
                  }
                ].map((rep, idx) => {
                  const Icon = rep.icon;
                  return (
                    <div
                      key={idx}
                      style={{
                        padding: "22px",
                        backgroundColor: "var(--color-surface)",
                        borderRadius: "14px",
                        border: "1px solid var(--color-border)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between"
                      }}
                    >
                      <div>
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "10px",
                            backgroundColor: "rgba(239, 219, 25, 0.15)",
                            color: "var(--color-brand)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: "14px"
                          }}
                        >
                          <Icon size={20} />
                        </div>
                        <h4 style={{ fontSize: "1rem", fontWeight: 800, margin: "0 0 6px 0" }}>{rep.title}</h4>
                        <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", margin: "0 0 16px 0", lineHeight: 1.5 }}>
                          {rep.desc}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDownloadExport(rep.type)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          padding: "10px",
                          borderRadius: "8px",
                          backgroundColor: "var(--color-brand)",
                          color: "#191A17",
                          border: "none",
                          fontWeight: 700,
                          fontSize: "0.82rem",
                          cursor: "pointer"
                        }}
                      >
                        <FileSpreadsheet size={16} />
                        <span>Download CSV</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════ */}
          {/* TAB 13: ROLES & RBAC PERMISSIONS */}
          {/* ══════════════════════════════════════════════ */}
          {activeTab === "roles" && (
            hasPermission("admin.roles_view") ? (
              <RoleManagement
                authToken={authToken}
                onToast={showToast}
                currentUser={adminUser}
              />
            ) : (
              <div
                style={{
                  padding: "48px 24px",
                  textAlign: "center",
                  backgroundColor: "var(--color-surface)",
                  borderRadius: "14px",
                  border: "1px solid var(--color-border)"
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "14px",
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    color: "#EF4444",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px auto"
                  }}
                >
                  <ShieldCheck size={28} />
                </div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 800, margin: "0 0 8px 0" }}>
                  Access Restricted
                </h3>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem", maxWidth: "460px", margin: "0 auto" }}>
                  You lack the required administrative permission (<code>admin.roles_view</code>) to inspect or modify institute role assignments.
                </p>
              </div>
            )
          )}

          {/* ══════════════════════════════════════════════ */}
          {/* TAB 14: SECURITY & AUDIT LOGS */}
          {/* ══════════════════════════════════════════════ */}
          {activeTab === "audit" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div
                style={{
                  padding: "18px 24px",
                  backgroundColor: "var(--color-surface)",
                  borderRadius: "14px",
                  border: "1px solid var(--color-border)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: "0 0 4px 0" }}>Immutable Security & Audit Trail</h3>
                  <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
                    Every privileged modification, authentication attempt, and ID generation is logged with timestamp and user attribution.
                  </p>
                </div>
                <button
                  onClick={loadAllData}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "transparent",
                    color: "var(--color-text-primary)",
                    fontWeight: 600,
                    fontSize: "0.82rem",
                    cursor: "pointer"
                  }}
                >
                  <RefreshCw size={14} />
                  <span>Refresh Log</span>
                </button>
              </div>

              <div
                style={{
                  backgroundColor: "var(--color-surface)",
                  borderRadius: "14px",
                  border: "1px solid var(--color-border)",
                  overflowX: "auto"
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--color-border)", backgroundColor: "rgba(0,0,0,0.02)" }}>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Timestamp</th>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Actor</th>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Action</th>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Target</th>
                      <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid var(--color-border)" }}>
                        <td style={{ padding: "14px 18px", fontFamily: "monospace", fontSize: "0.78rem", color: "var(--color-text-secondary)" }}>
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          <span style={{ fontWeight: 700 }}>{log.actorName}</span>
                          <span style={{ fontSize: "0.72rem", color: "var(--color-text-secondary)", marginLeft: "6px" }}>({log.actorRole})</span>
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          <span
                            style={{
                              padding: "3px 8px",
                              borderRadius: "4px",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              fontFamily: "monospace",
                              backgroundColor: "rgba(239, 219, 25, 0.15)",
                              color: "var(--color-brand)"
                            }}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td style={{ padding: "14px 18px", fontWeight: 600 }}>
                          {log.targetType} <span style={{ fontFamily: "monospace", fontSize: "0.8rem", opacity: 0.8 }}>({log.targetId})</span>
                        </td>
                        <td style={{ padding: "14px 18px", color: "var(--color-text-secondary)" }}>{log.details || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════ */}
          {/* TAB 15: SYSTEM DIAGNOSTICS & MONGODB STATUS */}
          {/* ══════════════════════════════════════════════ */}
          {activeTab === "settings" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div
                style={{
                  padding: "20px 24px",
                  backgroundColor: "var(--color-surface)",
                  borderRadius: "14px",
                  border: "1px solid var(--color-border)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <Database size={20} color="var(--color-brand)" />
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0 }}>Hunar Institute Management Engine</h3>
                </div>
                <p style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.6 }}>
                  High-availability hybrid storage engine. Operates seamlessly with production MongoDB clusters or with atomic file-backed JSON synchronization when offline.
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
                <div
                  style={{
                    padding: "20px",
                    backgroundColor: "var(--color-surface)",
                    borderRadius: "14px",
                    border: "1px solid var(--color-border)"
                  }}
                >
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 14px 0" }}>Engine Diagnostics</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.82rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--color-text-secondary)" }}>Storage Driver</span>
                      <strong>Mongoose ODM / Atomic JSON Fallback</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--color-text-secondary)" }}>ID Generator</span>
                      <strong style={{ color: "var(--color-brand)" }}>Atomic Sequence Lock (HUN-S / HUN-T)</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--color-text-secondary)" }}>Password Hashing</span>
                      <strong>Bcrypt / Argon2id Salted (10 Rounds)</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--color-text-secondary)" }}>Tokens</span>
                      <strong>HMAC-SHA256 Single-Use Tokens</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--color-text-secondary)" }}>Session Security</span>
                      <strong>JWT (Role-Enforced Guard)</strong>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    padding: "20px",
                    backgroundColor: "var(--color-surface)",
                    borderRadius: "14px",
                    border: "1px solid var(--color-border)"
                  }}
                >
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 14px 0" }}>Verified Campus Details</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.82rem" }}>
                    <div>
                      <span style={{ color: "var(--color-text-secondary)", display: "block" }}>Campus Location</span>
                      <strong>Mullanpur Dakha, Ludhiana, Punjab, India</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--color-text-secondary)", display: "block" }}>Founder & Director</span>
                      <strong>Gurlove Malhi</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--color-text-secondary)", display: "block" }}>Lead Faculty</span>
                      <strong>Paramjit Singh (Web Dev, AI & Digital Marketing)</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--color-text-secondary)", display: "block" }}>Support Helpline</span>
                      <strong>+91 94637 95116</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════ */}
          {/* WEBSITE CONTENT MANAGEMENT (CMS) MODULES */}
          {/* ══════════════════════════════════════════════ */}
          {(activeTab.startsWith("cms_") || activeTab === "cms_navigation") && (
            <CMSManager activeTab={activeTab} authToken={authToken} showToast={showToast} />
          )}

          {/* ══════════════════════════════════════════════ */}
          {/* OPERATIONAL & ACADEMIC SUBVIEWS */}
          {/* ══════════════════════════════════════════════ */}
          {[
            "activity",
            "notifications",
            "enrollments",
            "assessments",
            "progress",
            "departments",
            "teaching_assignments",
            "course_categories",
            "batches",
            "resources",
            "receipts",
            "calendar",
            "security",
            "profile"
          ].includes(activeTab) && (
            <ExtraSubviews
              activeTab={activeTab}
              students={students}
              staff={staff}
              courses={courses}
              batches={batches}
              fees={fees}
              announcements={announcements}
              auditLogs={auditLogs}
              adminUser={adminUser}
              showToast={showToast}
              onNavigate={setActiveTab}
              onRefresh={() => loadAllData()}
              academicDataErrors={academicDataErrors}
            />
          )}
        </main>
      </div>

      {/* ══════════════════════════════════════════════ */}
      {/* MODAL: STUDENT (ADD & EDIT) */}
      {/* ══════════════════════════════════════════════ */}
      {(modalType === "add_student" || modalType === "edit_student") && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "16px"
          }}
        >
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              borderRadius: "16px",
              border: "1px solid var(--color-border)",
              width: "100%",
              maxWidth: "520px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "24px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 4px 0" }}>
                  {modalType === "edit_student" ? "Edit Student Profile" : "Register New Student"}
                </h3>
                <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
                  {modalType === "edit_student"
                    ? `Updating student ID: ${editingItem?.studentId || "student"}`
                    : "Backend will automatically generate atomic ID (e.g. HUN-S-2026-XXXX) & invite link."}
                </p>
              </div>
              <button
                onClick={() => setModalType(null)}
                style={{ background: "none", border: "none", color: "var(--color-text-secondary)", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={modalType === "edit_student" ? handleUpdateStudent : handleRegisterStudent}
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Simranjit Kaur"
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-background)",
                    color: "var(--color-text-primary)",
                    fontSize: "0.85rem"
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Verified Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="student@example.com"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-background)",
                      color: "var(--color-text-primary)",
                      fontSize: "0.85rem"
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={studentForm.phone}
                    onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-background)",
                      color: "var(--color-text-primary)",
                      fontSize: "0.85rem"
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Program / Course *</label>
                <select
                  required
                  value={studentForm.course}
                  onChange={(e) => setStudentForm({ ...studentForm, course: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-background)",
                    color: "var(--color-text-primary)",
                    fontSize: "0.85rem"
                  }}
                >
                  <option value="" disabled>Select a course</option>
                  {modalType === "edit_student" && studentForm.course && !courses.some((c) => c.title === studentForm.course) && (
                    <option value={studentForm.course}>{studentForm.course} (Current)</option>
                  )}
                  {courseOptions.map((c) => (
                    <option key={c.slug || c._id} value={c.title}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Assigned Cohort / Batch</label>
                <select
                  value={studentForm.batch}
                  onChange={(e) => setStudentForm({ ...studentForm, batch: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-background)",
                    color: "var(--color-text-primary)",
                    fontSize: "0.85rem"
                  }}
                >
                  <option value="">No batch selected</option>
                  {modalType === "edit_student" && studentForm.batch &&
                    studentForm.batch.trim().toLowerCase() !== "no batch selected" &&
                    !batches.some((b) => b.name === studentForm.batch) && (
                    <option value={studentForm.batch}>{studentForm.batch} (Current)</option>
                  )}
                  {batches
                    .filter((b) => b.name?.trim() && b.name.trim().toLowerCase() !== "no batch selected")
                    .map((b) => (
                    <option key={b._id || b.name} value={b.name}>
                      {b.name} ({b.timing})
                    </option>
                  ))}
                </select>
              </div>

              {modalType === "edit_student" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Enrollment Status</label>
                    <select
                      value={studentForm.enrollmentStatus || "active"}
                      onChange={(e) => setStudentForm({ ...studentForm, enrollmentStatus: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: "8px",
                        border: "1px solid var(--color-border)",
                        backgroundColor: "var(--color-background)",
                        color: "var(--color-text-primary)",
                        fontSize: "0.85rem"
                      }}
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="pending_activation">Pending Activation</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Assigned Mentor</label>
                    <input
                      type="text"
                      placeholder="e.g. Paramjit Singh"
                      value={studentForm.assignedTeacher || ""}
                      onChange={(e) => setStudentForm({ ...studentForm, assignedTeacher: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: "8px",
                        border: "1px solid var(--color-border)",
                        backgroundColor: "var(--color-background)",
                        color: "var(--color-text-primary)",
                        fontSize: "0.85rem"
                      }}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  style={{
                    padding: "9px 16px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "transparent",
                    color: "var(--color-text-primary)",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: "9px 18px",
                    borderRadius: "8px",
                    backgroundColor: "var(--color-brand)",
                    color: "#191A17",
                    border: "none",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  {submitting
                    ? "Saving..."
                    : modalType === "edit_student"
                    ? "Update Student"
                    : "Generate Student Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/* MODAL: STAFF (ADD & EDIT) */}
      {/* ══════════════════════════════════════════════ */}
      {(modalType === "add_staff" || modalType === "edit_staff") && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "16px"
          }}
        >
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              borderRadius: "16px",
              border: "1px solid var(--color-border)",
              width: "100%",
              maxWidth: "520px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "24px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 4px 0" }}>
                  {modalType === "edit_staff" ? "Edit Staff Member" : "Register Faculty Member"}
                </h3>
                <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
                  {modalType === "edit_staff"
                    ? `Updating staff ID: ${editingItem?.staffId || "member"}`
                    : "Automatically generates atomic staff sequence ID (e.g. HUN-T-XXXX)."}
                </p>
              </div>
              <button
                onClick={() => setModalType(null)}
                style={{ background: "none", border: "none", color: "var(--color-text-secondary)", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={modalType === "edit_staff" ? handleUpdateStaff : handleRegisterStaff}
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Navjot Singh"
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-background)",
                    color: "var(--color-text-primary)",
                    fontSize: "0.85rem"
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Work Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="faculty@hunar.courses"
                    value={staffForm.email}
                    onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-background)",
                      color: "var(--color-text-primary)",
                      fontSize: "0.85rem"
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Contact Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 94637 95116"
                    value={staffForm.phone}
                    onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-background)",
                      color: "var(--color-text-primary)",
                      fontSize: "0.85rem"
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Designation *</label>
                  <input
                    type="text"
                    required
                    value={staffForm.designation}
                    onChange={(e) => setStaffForm({ ...staffForm, designation: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-background)",
                      color: "var(--color-text-primary)",
                      fontSize: "0.85rem"
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>
                    Assigned Staff Role *
                  </label>
                  <select
                    value={staffForm.roleId || (staffForm.role === "admin" ? "role-super-admin" : (staffForm.role === "teacher" ? "role-teacher" : "role-office-administrator"))}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const roleObj = availableRoles.find((r) => r.roleId === selectedId);
                      if (roleObj) {
                        setStaffForm({
                          ...staffForm,
                          roleId: roleObj.roleId,
                          roleName: roleObj.name,
                          role: roleObj.department === "Academics" ? "teacher" : (roleObj.roleId === "role-super-admin" ? "admin" : "staff"),
                          department: roleObj.department && roleObj.department !== "General" ? roleObj.department : staffForm.department
                        });
                      } else {
                        setStaffForm({ ...staffForm, roleId: selectedId });
                      }
                    }}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-background)",
                      color: "var(--color-text-primary)",
                      fontSize: "0.85rem"
                    }}
                  >
                    {availableRoles && availableRoles.length > 0 ? (
                      availableRoles
                        .filter((r) => r.status === "active" || r.roleId === staffForm.roleId)
                        .map((r) => (
                          <option key={r.roleId} value={r.roleId}>
                            {r.name} ({r.department || "General"}){r.status === "inactive" ? " - Inactive" : ""}
                          </option>
                        ))
                    ) : (
                      <>
                        <option value="role-teacher">Teacher / Faculty (Academics)</option>
                        <option value="role-receptionist">Receptionist (Front Desk)</option>
                        <option value="role-admissions-coordinator">Admissions Coordinator (Admissions)</option>
                        <option value="role-accountant">Accountant (Accounts & Finance)</option>
                        <option value="role-course-coordinator">Course Coordinator (Academics)</option>
                        <option value="role-office-administrator">Office Administrator (Operations)</option>
                        <option value="role-super-admin">Super Admin (Administration)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Role Duties & Access Preview Card */}
              {(() => {
                const currentRoleId = staffForm.roleId || (staffForm.role === "admin" ? "role-super-admin" : (staffForm.role === "teacher" ? "role-teacher" : "role-office-administrator"));
                const roleObj = availableRoles.find((r) => r.roleId === currentRoleId);
                if (!roleObj) return null;
                const isWildcard = (roleObj.permissions || []).includes("*");
                return (
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: "8px",
                      backgroundColor: "rgba(235, 94, 40, 0.06)",
                      border: "1px solid rgba(235, 94, 40, 0.18)"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{ fontSize: "0.76rem", fontWeight: 800, color: "var(--color-accent, #EB5E28)" }}>
                        {roleObj.name} • {roleObj.department || "General"}
                      </span>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          padding: "1px 6px",
                          borderRadius: "4px",
                          backgroundColor: "rgba(235, 94, 40, 0.12)",
                          color: "var(--color-accent, #EB5E28)"
                        }}
                      >
                        {isWildcard ? "Full System Clearance" : `${roleObj.permissions?.length || 0} Duties Assigned`}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.72rem", color: "var(--color-text-secondary)", margin: 0, lineHeight: "1.3" }}>
                      {roleObj.description || "Custom staff role."}
                    </p>
                  </div>
                );
              })()}

              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Department</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Applications & AI"
                  value={staffForm.department}
                  onChange={(e) => setStaffForm({ ...staffForm, department: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-background)",
                    color: "var(--color-text-primary)",
                    fontSize: "0.85rem"
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Assigned Subjects (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Artificial Intelligence, Machine Learning, Python"
                  value={staffForm.assignedSubjects}
                  onChange={(e) => setStaffForm({ ...staffForm, assignedSubjects: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-background)",
                    color: "var(--color-text-primary)",
                    fontSize: "0.85rem"
                  }}
                />
              </div>

              {modalType === "edit_staff" && (
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Employment Status</label>
                  <select
                    value={staffForm.employmentStatus || "active"}
                    onChange={(e) => setStaffForm({ ...staffForm, employmentStatus: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-background)",
                      color: "var(--color-text-primary)",
                      fontSize: "0.85rem"
                    }}
                  >
                    <option value="active">Active</option>
                    <option value="on_leave">On Leave</option>
                    <option value="resigned">Resigned</option>
                  </select>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  style={{
                    padding: "9px 16px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "transparent",
                    color: "var(--color-text-primary)",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: "9px 18px",
                    borderRadius: "8px",
                    backgroundColor: "var(--color-brand)",
                    color: "#191A17",
                    border: "none",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  {submitting
                    ? "Saving..."
                    : modalType === "edit_staff"
                    ? "Update Staff"
                    : "Create Staff ID"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/* MODAL: EDIT USER ACCOUNT */}
      {/* ══════════════════════════════════════════════ */}
      {modalType === "edit_user" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "16px"
          }}
        >
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              borderRadius: "16px",
              border: "1px solid var(--color-border)",
              width: "100%",
              maxWidth: "500px",
              padding: "24px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 4px 0" }}>Edit User Account</h3>
                <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
                  Assigned ID: <strong style={{ color: "var(--color-brand)", fontFamily: "monospace" }}>{editingItem?.assignedId || editingItem?._id}</strong>
                </p>
              </div>
              <button
                onClick={() => setModalType(null)}
                style={{ background: "none", border: "none", color: "var(--color-text-secondary)", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Full Name *</label>
                <input
                  type="text"
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-background)",
                    color: "var(--color-text-primary)",
                    fontSize: "0.85rem"
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Email *</label>
                  <input
                    type="email"
                    required
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-background)",
                      color: "var(--color-text-primary)",
                      fontSize: "0.85rem"
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Contact Phone</label>
                  <input
                    type="tel"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-background)",
                      color: "var(--color-text-primary)",
                      fontSize: "0.85rem"
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>System Role *</label>
                  <select
                    value={userForm.role}
                    disabled={editingItem?.role === "admin" && editingItem?.assignedId === "HUN-A-0001"}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-background)",
                      color: "var(--color-text-primary)",
                      fontSize: "0.85rem"
                    }}
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher / Faculty</option>
                    <option value="admin">Administrator</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Account Status *</label>
                  <select
                    value={userForm.status}
                    onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-background)",
                      color: "var(--color-text-primary)",
                      fontSize: "0.85rem"
                    }}
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending_activation">Pending Activation</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>
                  New Password <span style={{ fontWeight: 400, color: "var(--color-text-secondary)" }}>(Leave blank to keep unchanged)</span>
                </label>
                <input
                  type="password"
                  placeholder="Enter new password (min. 6 characters)"
                  value={userForm.password || ""}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-background)",
                    color: "var(--color-text-primary)",
                    fontSize: "0.85rem"
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  style={{
                    padding: "9px 16px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "transparent",
                    color: "var(--color-text-primary)",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: "9px 18px",
                    borderRadius: "8px",
                    backgroundColor: "var(--color-brand)",
                    color: "#191A17",
                    border: "none",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  {submitting ? "Saving..." : "Save User Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/* MODAL: COURSE (ADD & EDIT) */}
      {/* ══════════════════════════════════════════════ */}
      {(modalType === "add_course" || modalType === "edit_course") && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "16px"
          }}
        >
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              borderRadius: "16px",
              border: "1px solid var(--color-border)",
              width: "100%",
              maxWidth: "520px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "24px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 4px 0" }}>
                  {modalType === "edit_course" ? "Edit Course & Curriculum" : "Create New Program"}
                </h3>
                <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
                  Published across website and institute management portal.
                </p>
              </div>
              <button
                onClick={() => setModalType(null)}
                style={{ background: "none", border: "none", color: "var(--color-text-secondary)", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={modalType === "edit_course" ? handleUpdateCourse : handleCreateCourse}
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Course Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artificial Intelligence & Machine Learning"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-background)",
                    color: "var(--color-text-primary)",
                    fontSize: "0.85rem"
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Category *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Marketing & Growth"
                    value={courseForm.category}
                    onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-background)",
                      color: "var(--color-text-primary)",
                      fontSize: "0.85rem"
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 6 Months"
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-background)",
                      color: "var(--color-text-primary)",
                      fontSize: "0.85rem"
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Lead Faculty / Instructor</label>
                <input
                  type="text"
                  placeholder="e.g. Paramjit Singh"
                  value={courseForm.assignedTeacher || ""}
                  onChange={(e) => setCourseForm({ ...courseForm, assignedTeacher: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-background)",
                    color: "var(--color-text-primary)",
                    fontSize: "0.85rem"
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Comprehensive industry training with live projects..."
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-background)",
                    color: "var(--color-text-primary)",
                    fontSize: "0.85rem",
                    fontFamily: "inherit",
                    resize: "vertical"
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Syllabus (one item per line)</label>
                <textarea
                  rows={3}
                  placeholder={"React\nNode.js\nExpress"}
                  value={courseForm.syllabus}
                  onChange={(e) => setCourseForm({ ...courseForm, syllabus: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-background)",
                    color: "var(--color-text-primary)",
                    fontSize: "0.85rem",
                    fontFamily: "inherit",
                    resize: "vertical"
                  }}
                />
              </div>

              <details style={{ borderTop: "1px solid var(--color-border)", paddingTop: "12px" }}>
                <summary style={{ cursor: "pointer", fontSize: "0.85rem", fontWeight: 700 }}>Complete website course details</summary>
                <div style={{ display: "grid", gap: "12px", marginTop: "14px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    {[
                      ["badge", "Course Badge", "e.g. Flagship Program"],
                      ["mode", "Learning Mode", "e.g. Offline Lab + Hands-on"],
                      ["level", "Student Level", "e.g. Beginner to Advanced"],
                      ["image", "Image URL", "https://..."]
                    ].map(([field, label, placeholder]) => (
                      <div key={field}>
                        <label style={{ fontSize: "0.75rem", fontWeight: 700, display: "block", marginBottom: "5px" }}>{label}</label>
                        <input
                          type="text"
                          placeholder={placeholder}
                          value={courseForm[field]}
                          onChange={(e) => setCourseForm({ ...courseForm, [field]: e.target.value })}
                          style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.82rem" }}
                        />
                      </div>
                    ))}
                  </div>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={courseForm.featured}
                      onChange={(e) => setCourseForm({ ...courseForm, featured: e.target.checked })}
                    />
                    Show as a featured program
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    {[
                      ["rating", "Rating"],
                      ["reviewsCount", "Number of Reviews"]
                    ].map(([field, label]) => (
                      <div key={field}>
                        <label style={{ fontSize: "0.75rem", fontWeight: 700, display: "block", marginBottom: "5px" }}>{label}</label>
                        <input
                          type="number"
                          min="0"
                          step={field === "rating" ? "0.1" : "1"}
                          value={courseForm[field]}
                          onChange={(e) => setCourseForm({ ...courseForm, [field]: e.target.value })}
                          style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.82rem" }}
                        />
                      </div>
                    ))}
                  </div>
                  {[
                    ["shortDesc", "Short Description", 3],
                    ["tagline", "Course Tagline", 2],
                    ["highlights", "Highlights (one per line)", 4],
                    ["tools", "Tools (one per line)", 3],
                    ["careerRoles", "Career Roles (one per line)", 3]
                  ].map(([field, label, rows]) => (
                    <div key={field}>
                      <label style={{ fontSize: "0.75rem", fontWeight: 700, display: "block", marginBottom: "5px" }}>{label}</label>
                      <textarea
                        rows={rows}
                        value={courseForm[field]}
                        onChange={(e) => setCourseForm({ ...courseForm, [field]: e.target.value })}
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.82rem", fontFamily: "inherit", resize: "vertical" }}
                      />
                    </div>
                  ))}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    {[
                      ["mentorName", "Mentor Name"],
                      ["mentorRole", "Mentor Role"],
                      ["mentorExp", "Mentor Experience"]
                    ].map(([field, label]) => (
                      <div key={field}>
                        <label style={{ fontSize: "0.75rem", fontWeight: 700, display: "block", marginBottom: "5px" }}>{label}</label>
                        <input
                          type="text"
                          value={courseForm[field]}
                          onChange={(e) => setCourseForm({ ...courseForm, [field]: e.target.value })}
                          style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.82rem" }}
                        />
                      </div>
                    ))}
                  </div>
                  {[
                    ["curriculum", "Curriculum JSON (array of modules)", 9],
                    ["projects", "Projects JSON (array of projects)", 6]
                  ].map(([field, label, rows]) => (
                    <div key={field}>
                      <label style={{ fontSize: "0.75rem", fontWeight: 700, display: "block", marginBottom: "5px" }}>{label}</label>
                      <textarea
                        rows={rows}
                        value={courseForm[field]}
                        onChange={(e) => setCourseForm({ ...courseForm, [field]: e.target.value })}
                        spellCheck="false"
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.78rem", fontFamily: "monospace", resize: "vertical" }}
                      />
                    </div>
                  ))}
                </div>
              </details>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  style={{
                    padding: "9px 16px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "transparent",
                    color: "var(--color-text-primary)",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: "9px 18px",
                    borderRadius: "8px",
                    backgroundColor: "var(--color-brand)",
                    color: "#191A17",
                    border: "none",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  {submitting
                    ? "Saving..."
                    : modalType === "edit_course"
                    ? "Update Course"
                    : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/* MODAL: BATCH (ADD & EDIT) */}
      {/* ══════════════════════════════════════════════ */}
      {(modalType === "add_batch" || modalType === "edit_batch") && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "16px"
          }}
        >
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              borderRadius: "16px",
              border: "1px solid var(--color-border)",
              width: "100%",
              maxWidth: "500px",
              padding: "24px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 4px 0" }}>
                  {modalType === "edit_batch" ? "Edit Batch & Cohort" : "Create New Batch"}
                </h3>
                <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
                  Configure student group timings and mentor.
                </p>
              </div>
              <button
                onClick={() => setModalType(null)}
                style={{ background: "none", border: "none", color: "var(--color-text-secondary)", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={modalType === "edit_batch" ? handleUpdateBatch : handleCreateBatch}
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Batch Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Batch Delta 2026"
                  value={batchForm.name}
                  onChange={(e) => setBatchForm({ ...batchForm, name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-background)",
                    color: "var(--color-text-primary)",
                    fontSize: "0.85rem"
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Course *</label>
                <select
                  required
                  value={batchForm.course}
                  onChange={(e) => setBatchForm({ ...batchForm, course: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-background)",
                    color: "var(--color-text-primary)",
                    fontSize: "0.85rem"
                  }}
                >
                  <option value="" disabled>Select a course</option>
                  {courseOptions.map((c) => (
                    <option key={c.slug || c._id} value={c.title}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Class Timing *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Morning Batch (10:00 AM - 1:00 PM)"
                  value={batchForm.timing}
                  onChange={(e) => setBatchForm({ ...batchForm, timing: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-background)",
                    color: "var(--color-text-primary)",
                    fontSize: "0.85rem"
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Assigned Instructor</label>
                <select
                  value={batchForm.assignedTeacher}
                  onChange={(e) => setBatchForm({ ...batchForm, assignedTeacher: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-background)",
                    color: "var(--color-text-primary)",
                    fontSize: "0.85rem"
                  }}
                >
                  <option value="">— Unassigned —</option>
                  {staff.filter((s) => s.employmentStatus === "active" || s.role === "teacher").map((s) => (
                    <option key={s.staffId || s._id} value={s.name}>
                      {s.name}{s.designation ? ` (${s.designation})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  style={{
                    padding: "9px 16px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "transparent",
                    color: "var(--color-text-primary)",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: "9px 18px",
                    borderRadius: "8px",
                    backgroundColor: "var(--color-brand)",
                    color: "#191A17",
                    border: "none",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  {submitting
                    ? "Saving..."
                    : modalType === "edit_batch"
                    ? "Update Batch"
                    : "Create Batch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/* MODAL: TIMETABLE (ADD & EDIT) */}
      {/* ══════════════════════════════════════════════ */}
      {(modalType === "add_timetable" || modalType === "edit_timetable") && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "16px"
          }}
        >
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              borderRadius: "16px",
              border: "1px solid var(--color-border)",
              width: "100%",
              maxWidth: "520px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "24px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 4px 0" }}>
                  {modalType === "edit_timetable" ? "Edit Class Slot" : "Add Timetable Slot"}
                </h3>
                <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
                  Weekly lab & classroom allocation.
                </p>
              </div>
              <button
                onClick={() => setModalType(null)}
                style={{ background: "none", border: "none", color: "var(--color-text-secondary)", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={modalType === "edit_timetable" ? handleUpdateTimetable : handleAddTimetable}
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Day *</label>
                  <select
                    value={timetableForm.day}
                    onChange={(e) => setTimetableForm({ ...timetableForm, day: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-background)",
                      color: "var(--color-text-primary)",
                      fontSize: "0.85rem"
                    }}
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Time Slot *</label>
                  <input
                    type="text"
                    required
                    placeholder="10:00 AM - 01:00 PM"
                    value={timetableForm.time}
                    onChange={(e) => setTimetableForm({ ...timetableForm, time: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-background)",
                      color: "var(--color-text-primary)",
                      fontSize: "0.85rem"
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Subject / Module *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Full Stack MERN Architecture"
                  value={timetableForm.subject}
                  onChange={(e) => setTimetableForm({ ...timetableForm, subject: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-background)",
                    color: "var(--color-text-primary)",
                    fontSize: "0.85rem"
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Course *</label>
                  <select
                    required
                    value={timetableForm.course}
                    onChange={(e) => setTimetableForm({ ...timetableForm, course: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-background)",
                      color: "var(--color-text-primary)",
                      fontSize: "0.85rem"
                    }}
                  >
                    <option value="" disabled>Select a course</option>
                    {courseOptions.map((c) => (
                      <option key={c.slug || c._id} value={c.title}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Cohort / Batch *</label>
                  <select
                    required
                    value={timetableForm.batch}
                    onChange={(e) => setTimetableForm({ ...timetableForm, batch: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-background)",
                      color: "var(--color-text-primary)",
                      fontSize: "0.85rem"
                    }}
                  >
                    <option value="" disabled>Select a batch</option>
                    {batches.map((b) => (
                      <option key={b._id || b.name} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Instructor</label>
                  <input
                    type="text"
                    placeholder="e.g. Paramjit Singh"
                    value={timetableForm.teacher}
                    onChange={(e) => setTimetableForm({ ...timetableForm, teacher: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-background)",
                      color: "var(--color-text-primary)",
                      fontSize: "0.85rem"
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Room / Lab</label>
                  <input
                    type="text"
                    placeholder="e.g. Lab 1 (Silicon Room)"
                    value={timetableForm.room}
                    onChange={(e) => setTimetableForm({ ...timetableForm, room: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-background)",
                      color: "var(--color-text-primary)",
                      fontSize: "0.85rem"
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  style={{
                    padding: "9px 16px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "transparent",
                    color: "var(--color-text-primary)",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: "9px 18px",
                    borderRadius: "8px",
                    backgroundColor: "var(--color-brand)",
                    color: "#191A17",
                    border: "none",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  {submitting
                    ? "Saving..."
                    : modalType === "edit_timetable"
                    ? "Update Slot"
                    : "Add Class Slot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/* MODAL: FEE PAYMENT (RECORD & EDIT) */}
      {/* ══════════════════════════════════════════════ */}
      {(modalType === "record_fee" || modalType === "edit_fee") && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "16px"
          }}
        >
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              borderRadius: "16px",
              border: "1px solid var(--color-border)",
              width: "100%",
              maxWidth: "520px",
              padding: "24px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 4px 0" }}>
                  {modalType === "edit_fee" ? "Edit Fee Record" : "Record Fee Payment"}
                </h3>
                <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
                  Institutional fee invoice & receipt generation.
                </p>
              </div>
              <button
                onClick={() => setModalType(null)}
                style={{ background: "none", border: "none", color: "var(--color-text-secondary)", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={modalType === "edit_fee" ? handleUpdateFee : handleRecordFee}
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Student ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="HUN-S-2026-0001"
                    value={feeForm.studentId}
                    onChange={(e) => {
                      const sId = e.target.value;
                      const matched = students.find((s) => s.studentId === sId);
                      setFeeForm({
                        ...feeForm,
                        studentId: sId,
                        studentName: matched ? matched.name : feeForm.studentName,
                        course: matched ? matched.course : feeForm.course
                      });
                    }}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-background)",
                      color: "var(--color-text-primary)",
                      fontSize: "0.85rem",
                      fontFamily: "monospace"
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Student Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Student Name"
                    value={feeForm.studentName}
                    onChange={(e) => setFeeForm({ ...feeForm, studentName: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-background)",
                      color: "var(--color-text-primary)",
                      fontSize: "0.85rem"
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Course</label>
                <select
                  value={feeForm.course}
                  onChange={(e) => setFeeForm({ ...feeForm, course: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-background)",
                    color: "var(--color-text-primary)",
                    fontSize: "0.85rem"
                  }}
                >
                  <option value="">Select a course</option>
                  {courseOptions.map((c) => (
                    <option key={c.slug || c._id} value={c.title}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Total Fee (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={feeForm.totalFee}
                    onChange={(e) => setFeeForm({ ...feeForm, totalFee: Number(e.target.value) })}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-background)",
                      color: "var(--color-text-primary)",
                      fontSize: "0.85rem"
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Amount Paid (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={feeForm.paidAmount}
                    onChange={(e) => setFeeForm({ ...feeForm, paidAmount: Number(e.target.value) })}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-background)",
                      color: "var(--color-text-primary)",
                      fontSize: "0.85rem"
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Due Date</label>
                <input
                  type="date"
                  value={feeForm.dueDate}
                  onChange={(e) => setFeeForm({ ...feeForm, dueDate: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-background)",
                    color: "var(--color-text-primary)",
                    fontSize: "0.85rem"
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  style={{
                    padding: "9px 16px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "transparent",
                    color: "var(--color-text-primary)",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: "9px 18px",
                    borderRadius: "8px",
                    backgroundColor: "var(--color-brand)",
                    color: "#191A17",
                    border: "none",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  {submitting
                    ? "Saving..."
                    : modalType === "edit_fee"
                    ? "Update Fee Record"
                    : "Save Receipt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/* MODAL: ANNOUNCEMENT (POST & EDIT) */}
      {/* ══════════════════════════════════════════════ */}
      {(modalType === "post_announcement" || modalType === "edit_announcement") && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "16px"
          }}
        >
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              borderRadius: "16px",
              border: "1px solid var(--color-border)",
              width: "100%",
              maxWidth: "520px",
              padding: "24px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 4px 0" }}>
                  {modalType === "edit_announcement" ? "Edit Announcement" : "Post Official Announcement"}
                </h3>
                <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
                  Notices broadcasted to student and faculty portals.
                </p>
              </div>
              <button
                onClick={() => setModalType(null)}
                style={{ background: "none", border: "none", color: "var(--color-text-secondary)", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={modalType === "edit_announcement" ? handleUpdateAnnouncement : handlePostAnnouncement}
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Notice Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule Update / Hackathon Announcement"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-background)",
                    color: "var(--color-text-primary)",
                    fontSize: "0.85rem"
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Target Audience *</label>
                <select
                  value={announcementForm.audience}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, audience: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-background)",
                    color: "var(--color-text-primary)",
                    fontSize: "0.85rem"
                  }}
                >
                  <option value="all">All Institute Members (Broadcast)</option>
                  <option value="students">Students Only</option>
                  <option value="teachers">Faculty / Teachers Only</option>
                  <option value="staff">Administrative Staff Only</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "6px" }}>Notice Message *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter notice text clearly for students and teachers..."
                  value={announcementForm.message}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-background)",
                    color: "var(--color-text-primary)",
                    fontSize: "0.85rem",
                    fontFamily: "inherit",
                    resize: "vertical"
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  style={{
                    padding: "9px 16px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "transparent",
                    color: "var(--color-text-primary)",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: "9px 18px",
                    borderRadius: "8px",
                    backgroundColor: "var(--color-brand)",
                    color: "#191A17",
                    border: "none",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  {submitting
                    ? "Saving..."
                    : modalType === "edit_announcement"
                    ? "Update Notice"
                    : "Broadcast Notice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/* MODAL: INVITATION TOKEN & LINK POPUP */}
      {/* ══════════════════════════════════════════════ */}
      {invitationModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 110,
            padding: "16px"
          }}
        >
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              borderRadius: "16px",
              border: "1px solid var(--color-border)",
              width: "100%",
              maxWidth: "500px",
              padding: "24px",
              boxShadow: "0 24px 48px rgba(0,0,0,0.3)"
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "18px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(16, 185, 129, 0.15)",
                  color: "#10B981",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px auto"
                }}
              >
                <CheckCircle2 size={28} />
              </div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, margin: "0 0 6px 0" }}>Account Created & ID Generated</h3>
              <p style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)", margin: 0 }}>
                Unique Identifier: <strong style={{ color: "var(--color-brand)", fontFamily: "monospace" }}>{invitationModal.studentId}</strong>
              </p>
            </div>

            <div
              style={{
                padding: "14px",
                borderRadius: "10px",
                backgroundColor: "var(--color-background)",
                border: "1px solid var(--color-border)",
                marginBottom: "16px"
              }}
            >
              <label style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "var(--color-text-secondary)", display: "block", marginBottom: "6px" }}>
                Single-Use Activation URL
              </label>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  type="text"
                  readOnly
                  value={invitationModal.activationUrl}
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "transparent",
                    color: "var(--color-text-primary)",
                    fontSize: "0.78rem",
                    fontFamily: "monospace"
                  }}
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(invitationModal.activationUrl);
                    showToast("Activation link copied to clipboard!");
                  }}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "6px",
                    backgroundColor: "var(--color-brand)",
                    color: "#191A17",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  <Copy size={14} />
                  <span>Copy</span>
                </button>
              </div>
              <p style={{ fontSize: "0.72rem", color: "var(--color-text-secondary)", margin: "8px 0 0 0" }}>
                The user can open this link to configure their private password. Expiring in 7 days.
              </p>
            </div>

            <button
              onClick={() => setInvitationModal(null)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid var(--color-border)",
                backgroundColor: "transparent",
                color: "var(--color-text-primary)",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: "pointer"
              }}
            >
              Done & Close
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/* TOAST NOTIFICATION */}
      {/* ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: "fixed",
              bottom: "24px",
              right: "24px",
              padding: "12px 18px",
              borderRadius: "10px",
              backgroundColor: toastMessage.type === "error" ? "#EF4444" : "#10B981",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "0.85rem",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              zIndex: 200
            }}
          >
            {toastMessage.type === "error" ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
