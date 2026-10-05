import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Calendar,
  CheckSquare,
  Clock,
  Bell,
  CreditCard,
  FileSpreadsheet,
  Plus,
  Search,
  Filter,
  RefreshCw,
  LogOut,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Edit2,
  Trash2,
  Sun,
  Moon,
  ArrowUpRight,
  UserCheck,
  Award,
  Phone,
  Send,
  HelpCircle,
  Sparkles,
  ChevronDown,
  Layers,
  Activity,
  FileCheck,
  Check,
  X,
  Shield,
  Briefcase,
  BookOpen,
  DollarSign,
  ArrowRight,
  ExternalLink,
  ClipboardList
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function OperationsPanel() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Authentication & Current User State
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(localStorage.getItem("hunar_token") || "");
  const [loading, setLoading] = useState(true);

  // Active View Tab
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Live Data States
  const [leads, setLeads] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [fees, setFees] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [tasks, setTasks] = useState([
    { id: "task-1", title: "Follow up with Batch Beta graphic design applicants", priority: "high", completed: false, category: "Admissions" },
    { id: "task-2", title: "Collect pending installment fee receipts for Silicon lab batch", priority: "medium", completed: false, category: "Accounts" },
    { id: "task-3", title: "Verify student attendance log for Web Dev morning session", priority: "low", completed: true, category: "Attendance" },
    { id: "task-4", title: "Prepare inquiry response sheet for weekend bootcamp", priority: "high", completed: false, category: "Front Desk" }
  ]);

  // Filters & Search
  const [leadSearch, setLeadSearch] = useState("");
  const [leadStatusFilter, setLeadStatusFilter] = useState("all");
  const [studentSearch, setStudentSearch] = useState("");
  const [studentCourseFilter, setStudentCourseFilter] = useState("all");
  const [feeSearch, setFeeSearch] = useState("");
  const [selectedBatchForAttendance, setSelectedBatchForAttendance] = useState("Batch Alpha 2026");
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]);

  // Modal States
  const [modalType, setModalType] = useState(null); // 'new_lead', 'enroll_student', 'record_fee', 'new_task', 'view_student'
  const [selectedStudentForView, setSelectedStudentForView] = useState(null);
  const [invitationModal, setInvitationModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form States
  const [leadForm, setLeadForm] = useState({
    name: "",
    email: "",
    phone: "",
    course: "Full Stack Web Development",
    notes: ""
  });

  const [studentForm, setStudentForm] = useState({
    name: "",
    email: "",
    phone: "",
    course: "Full Stack Web Development",
    batch: "Batch Alpha 2026"
  });

  const [feeForm, setFeeForm] = useState({
    studentId: "",
    studentName: "",
    course: "Full Stack Web Development",
    totalFee: 45000,
    paidAmount: 45000,
    dueDate: "2026-05-15"
  });

  const [taskForm, setTaskForm] = useState({
    title: "",
    priority: "medium",
    category: "General Operations"
  });

  const showToast = (text, type = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const getAuthHeaders = () => {
    const t = authToken || localStorage.getItem("hunar_token");
    return {
      "Content-Type": "application/json",
      ...(t ? { Authorization: `Bearer ${t}` } : {})
    };
  };

  // Helper: Duty Permission Check
  const hasPermission = (required) => {
    if (!user) return false;
    if (user.isSuperAdmin || user.role === "admin" || user.role === "super_admin") return true;
    const perms = user.permissions || [];
    if (perms.includes("*")) return true;
    if (!required) return true;
    if (Array.isArray(required)) {
      return required.some((p) => perms.includes(p));
    }
    return perms.includes(required);
  };

  // Load User Profile and Operational Data
  const loadData = async (token) => {
    setLoading(true);
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    try {
      // 1. Fetch current user identity & verified permissions
      const meRes = await fetch("/api/auth/me", { headers }).catch(() => null);
      if (meRes && meRes.ok) {
        const meData = await meRes.json();
        if (meData.user?.role === "student") {
          localStorage.setItem("hunar_user", JSON.stringify(meData.user));
          navigate("/portal/student", { replace: true });
          return;
        }
        setUser(meData.user);
        localStorage.setItem("hunar_user", JSON.stringify(meData.user));
      } else {
        const cached = localStorage.getItem("hunar_user");
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed.role === "student") {
              navigate("/portal/student", { replace: true });
              return;
            }
            setUser(parsed);
          } catch {}
        }
      }

      // 2. Fetch parallel operational datasets
      const [leadsRes, studentsRes, coursesRes, batchesRes, timeRes, feesRes, annRes, attRes] = await Promise.all([
        fetch("/api/leads").catch(() => null),
        fetch("/api/students", { headers }).catch(() => null),
        fetch("/api/courses").catch(() => null),
        fetch("/api/batches").catch(() => null),
        fetch("/api/timetable").catch(() => null),
        fetch("/api/fees", { headers }).catch(() => null),
        fetch("/api/announcements").catch(() => null),
        fetch("/api/attendance", { headers }).catch(() => null)
      ]);

      if (leadsRes && leadsRes.ok) setLeads(await leadsRes.json());
      if (studentsRes && studentsRes.ok) setStudents(await studentsRes.json());
      if (coursesRes && coursesRes.ok) setCourses(await coursesRes.json());
      if (batchesRes && batchesRes.ok) setBatches(await batchesRes.json());
      if (timeRes && timeRes.ok) setTimetable(await timeRes.json());
      if (feesRes && feesRes.ok) setFees(await feesRes.json());
      if (annRes && annRes.ok) setAnnouncements(await annRes.json());
      if (attRes && attRes.ok) setAttendanceRecords(await attRes.json());
    } catch (err) {
      console.error("Error loading operations data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("hunar_token");
    if (!token) {
      navigate("/login");
      return;
    }
    const cachedUser = localStorage.getItem("hunar_user");
    if (cachedUser) {
      try {
        const parsed = JSON.parse(cachedUser);
        if (parsed.role === "student") {
          navigate("/portal/student", { replace: true });
          return;
        }
      } catch {}
    }
    setAuthToken(token);
    loadData(token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("hunar_token");
    localStorage.removeItem("hunar_user");
    navigate("/login");
  };

  // Operational Action Handlers
  const handleCreateLead = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: leadForm.name.trim(),
          email: leadForm.email.trim(),
          phone: leadForm.phone.trim(),
          course: leadForm.course,
          message: leadForm.notes || "Inquiry recorded via Operations Desk",
          status: "New"
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to record inquiry");

      setLeads((prev) => [data.lead, ...prev]);
      setModalType(null);
      setLeadForm({ name: "", email: "", phone: "", course: "Full Stack Web Development", notes: "" });
      showToast("New inquiry logged successfully!");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateLeadStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error("Failed to update status");
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
      showToast(`Inquiry status updated to ${status}`);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

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
      if (!res.ok) throw new Error(data.message || "Failed to register student");

      setStudents((prev) => [data.student, ...prev]);
      setModalType(null);
      setStudentForm({ name: "", email: "", phone: "", course: "Full Stack Web Development", batch: "Batch Alpha 2026" });
      if (data.invitation) {
        setInvitationModal({
          studentId: data.student.studentId,
          name: data.student.name,
          email: data.student.email,
          activationUrl: window.location.origin + data.invitation.activationUrl,
          rawToken: data.invitation.token,
          expiresAt: data.invitation.expiresAt
        });
      }
      showToast(`Student registered! ID: ${data.student.studentId}`, "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

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
      if (!res.ok) throw new Error(data.message || "Failed to record payment");

      setFees((prev) => [data.record, ...prev.filter((f) => f.studentId !== feeForm.studentId)]);
      setModalType(null);
      showToast(`Payment recorded for ${feeForm.studentId}!`);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

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
      showToast(`Attendance saved for ${selectedBatchForAttendance}`);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    const newTask = {
      id: "task-" + Date.now(),
      title: taskForm.title.trim(),
      priority: taskForm.priority,
      category: taskForm.category,
      completed: false
    };
    setTasks((prev) => [newTask, ...prev]);
    setTaskForm({ title: "", priority: "medium", category: "General Operations" });
    setModalType(null);
    showToast("Task created!");
  };

  const toggleTask = (id) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  // Dynamic Navigation Tabs according to user permissions
  const NAV_MODULES = [
    {
      id: "overview",
      label: "Operational Desk",
      icon: LayoutDashboard,
      perms: ["dashboard.view", "dashboard.stats_view"]
    },
    {
      id: "inquiries",
      label: "Inquiries & Leads",
      icon: Users,
      badge: leads.filter((l) => l.status === "New").length,
      perms: ["inquiries.view", "inquiries.create", "inquiries.edit"]
    },
    {
      id: "admissions",
      label: "Admissions & Intake",
      icon: UserCheck,
      badge: students.filter((s) => s.enrollmentStatus === "pending_activation").length,
      perms: ["admissions.view", "admissions.applications_view", "admissions.enrollment_record", "inquiries.convert_to_student"]
    },
    {
      id: "students",
      label: "Student Roster",
      icon: GraduationCap,
      badge: students.length,
      perms: ["students.view", "students.list_view", "students.profile_view"]
    },
    {
      id: "fees",
      label: "Fee Balances & Receipts",
      icon: CreditCard,
      perms: ["fees.balance_view", "fees.plans_view", "fees.payments_record", "students.fee_status_view"]
    },
    {
      id: "timetable",
      label: "Class Schedules & Labs",
      icon: Calendar,
      perms: ["timetable.view", "timetable.institute_view", "timetable.personal_view", "batches.view"]
    },
    {
      id: "attendance",
      label: "Attendance Desk",
      icon: CheckSquare,
      perms: ["attendance.student_view", "attendance.student_mark", "attendance.staff_view"]
    },
    {
      id: "tasks",
      label: "Operations Checklist",
      icon: ClipboardList,
      badge: tasks.filter((t) => !t.completed).length,
      perms: ["dashboard.view", "tasks.assigned_view", "tasks.create"]
    },
    {
      id: "announcements",
      label: "Notices & Bulletins",
      icon: Bell,
      perms: ["announcements.view"]
    }
  ];

  // Filter modules user is permitted to see
  const visibleModules = NAV_MODULES.filter((m) => {
    if (!m.perms) return true;
    return hasPermission(m.perms);
  });

  // Filtered Lists
  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      (l.name && l.name.toLowerCase().includes(leadSearch.toLowerCase())) ||
      (l.email && l.email.toLowerCase().includes(leadSearch.toLowerCase())) ||
      (l.phone && l.phone.toLowerCase().includes(leadSearch.toLowerCase()));
    const matchesStatus = leadStatusFilter === "all" || l.status === leadStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      (s.name && s.name.toLowerCase().includes(studentSearch.toLowerCase())) ||
      (s.email && s.email.toLowerCase().includes(studentSearch.toLowerCase())) ||
      (s.studentId && s.studentId.toLowerCase().includes(studentSearch.toLowerCase()));
    const matchesCourse = studentCourseFilter === "all" || s.course === studentCourseFilter;
    return matchesSearch && matchesCourse;
  });

  const filteredFees = fees.filter((f) => {
    return (
      (f.studentName && f.studentName.toLowerCase().includes(feeSearch.toLowerCase())) ||
      (f.studentId && f.studentId.toLowerCase().includes(feeSearch.toLowerCase())) ||
      (f.course && f.course.toLowerCase().includes(feeSearch.toLowerCase()))
    );
  });

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "var(--color-background)",
        color: "var(--color-text-primary)",
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
      }}
    >
      {/* ══════════════════════════════════════════════ */}
      {/* OPERATIONS SIDEBAR NAVIGATION */}
      {/* ══════════════════════════════════════════════ */}
      <aside
        style={{
          width: "280px",
          backgroundColor: "var(--color-surface)",
          borderRight: "1px solid var(--color-border)",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
          zIndex: 40
        }}
      >
        {/* Brand & Desk Identifier */}
        <div
          style={{
            padding: "20px",
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
                fontWeight: 900,
                color: "#191A17",
                fontSize: "1.1rem",
                boxShadow: "0 4px 12px rgba(239, 219, 25, 0.35)"
              }}
            >
              H
            </div>
            <div>
              <h2 style={{ fontSize: "0.98rem", fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
                HUNAR OPERATIONS
              </h2>
              <p
                style={{
                  fontSize: "0.68rem",
                  color: "var(--color-text-secondary)",
                  margin: 0,
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase"
                }}
              >
                Staff Duty Workspace
              </p>
            </div>
          </div>
        </div>

        {/* User Identity & Active Role Badge */}
        <div
          style={{
            padding: "14px 18px",
            margin: "12px 14px",
            borderRadius: "12px",
            backgroundColor: "rgba(239, 219, 25, 0.08)",
            border: "1px solid rgba(239, 219, 25, 0.25)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                backgroundColor: "var(--color-brand)",
                color: "#191A17",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "0.85rem"
              }}
            >
              {user?.name ? user.name.charAt(0) : "S"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.name || "Staff Member"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                <span
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 800,
                    padding: "2px 6px",
                    borderRadius: "4px",
                    backgroundColor: "var(--color-accent, #EB5E28)",
                    color: "#FFF",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em"
                  }}
                >
                  {user?.roleName || "Staff Role"}
                </span>
                <span style={{ fontSize: "0.68rem", color: "var(--color-text-secondary)", fontFamily: "monospace" }}>
                  {user?.assignedId || "HUN-T"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Nav Modules List */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "8px 12px", display: "flex", flexDirection: "column", gap: "4px" }}>
          {visibleModules.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "9px 12px",
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
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Icon size={16} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    style={{
                      fontSize: "0.7rem",
                      padding: "2px 6px",
                      borderRadius: "10px",
                      backgroundColor: isActive ? "rgba(0,0,0,0.15)" : "var(--color-border)",
                      color: isActive ? "#191A17" : "var(--color-text-secondary)",
                      fontWeight: 700
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Actions (Theme, Switch to Master Admin if SuperAdmin, Logout) */}
        <div style={{ padding: "14px 16px", borderTop: "1px solid var(--color-border)", display: "flex", flexDirection: "column", gap: "8px" }}>
          {user?.isSuperAdmin && (
            <Link
              to="/portal/admin"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 10px",
                borderRadius: "6px",
                backgroundColor: "rgba(235, 94, 40, 0.1)",
                color: "var(--color-accent, #EB5E28)",
                fontSize: "0.78rem",
                fontWeight: 700,
                textDecoration: "none"
              }}
            >
              <Shield size={14} />
              <span>Back to Master Admin</span>
              <ArrowRight size={12} style={{ marginLeft: "auto" }} />
            </Link>
          )}

          <div style={{ display: "flex", gap: "6px" }}>
            <button
              onClick={toggleTheme}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text-secondary)",
                fontSize: "0.76rem",
                cursor: "pointer"
              }}
            >
              {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
              <span>{theme === "light" ? "Dark" : "Light"}</span>
            </button>
            <button
              onClick={handleLogout}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                backgroundColor: "rgba(239, 68, 68, 0.08)",
                color: "#EF4444",
                fontSize: "0.76rem",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════ */}
      {/* MAIN OPERATIONS WORKSPACE */}
      {/* ══════════════════════════════════════════════ */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflowY: "auto" }}>
        {/* Top Operational Header */}
        <header
          style={{
            padding: "16px 28px",
            borderBottom: "1px solid var(--color-border)",
            backgroundColor: "var(--color-surface)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 30
          }}
        >
          <div>
            <h1 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0 }}>
              {visibleModules.find((m) => m.id === activeTab)?.label || "Operational Workspace"}
            </h1>
            <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
              Authorized operations desk for {user?.name || "Staff"} ({user?.roleName || "Operational Staff"})
            </p>
          </div>

          {/* Quick Context Actions based on permission */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={() => loadData(authToken)}
              style={{
                padding: "7px 12px",
                borderRadius: "8px",
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text-secondary)",
                fontSize: "0.78rem",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer"
              }}
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              Sync Desk
            </button>

            {hasPermission(["inquiries.create", "inquiries.add"]) && (
              <button
                onClick={() => setModalType("new_lead")}
                style={{
                  padding: "7px 14px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "var(--color-brand)",
                  color: "#191A17",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer"
                }}
              >
                <Plus size={14} />
                New Inquiry
              </button>
            )}

            {hasPermission(["students.create", "students.add", "admissions.enrollment_record"]) && (
              <button
                onClick={() => setModalType("enroll_student")}
                style={{
                  padding: "7px 14px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "var(--color-accent, #EB5E28)",
                  color: "#FFF",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer"
                }}
              >
                <Plus size={14} />
                Enroll Student
              </button>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: "24px", flex: 1 }}>
          {/* Toast Notification */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                style={{
                  position: "fixed",
                  top: "20px",
                  right: "30px",
                  zIndex: 9999,
                  padding: "12px 20px",
                  borderRadius: "10px",
                  backgroundColor: toastMessage.type === "error" ? "#EF4444" : "var(--color-brand)",
                  color: toastMessage.type === "error" ? "#FFF" : "#191A17",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.25)"
                }}
              >
                {toastMessage.text}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ══════════════════════════════════════════════ */}
          {/* TAB 1: OPERATIONAL DESK OVERVIEW */}
          {/* ══════════════════════════════════════════════ */}
          {activeTab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Quick Metrics Bar */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                {hasPermission("inquiries.view") && (
                  <div style={{ padding: "20px", backgroundColor: "var(--color-surface)", borderRadius: "14px", border: "1px solid var(--color-border)" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", fontWeight: 700, textTransform: "uppercase" }}>
                      New Inquiries
                    </div>
                    <div style={{ fontSize: "1.8rem", fontWeight: 900, marginTop: "6px", color: "var(--color-accent, #EB5E28)" }}>
                      {leads.filter((l) => l.status === "New").length}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                      {leads.length} total prospect inquiries logged
                    </div>
                  </div>
                )}

                {hasPermission("students.view") && (
                  <div style={{ padding: "20px", backgroundColor: "var(--color-surface)", borderRadius: "14px", border: "1px solid var(--color-border)" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", fontWeight: 700, textTransform: "uppercase" }}>
                      Enrolled Students
                    </div>
                    <div style={{ fontSize: "1.8rem", fontWeight: 900, marginTop: "6px" }}>
                      {students.length}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#10B981", marginTop: "4px" }}>
                      {students.filter((s) => s.enrollmentStatus === "active").length} active learners
                    </div>
                  </div>
                )}

                {hasPermission("batches.view") && (
                  <div style={{ padding: "20px", backgroundColor: "var(--color-surface)", borderRadius: "14px", border: "1px solid var(--color-border)" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", fontWeight: 700, textTransform: "uppercase" }}>
                      Active Cohorts / Batches
                    </div>
                    <div style={{ fontSize: "1.8rem", fontWeight: 900, marginTop: "6px" }}>
                      {batches.length}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                      Across {courses.length} training programs
                    </div>
                  </div>
                )}

                {hasPermission("students.fee_status_view") && (
                  <div style={{ padding: "20px", backgroundColor: "var(--color-surface)", borderRadius: "14px", border: "1px solid var(--color-border)" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", fontWeight: 700, textTransform: "uppercase" }}>
                      Pending Fee Reminders
                    </div>
                    <div style={{ fontSize: "1.8rem", fontWeight: 900, marginTop: "6px", color: "#F59E0B" }}>
                      {fees.filter((f) => f.status === "Pending" || f.status === "Partial").length}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                      Students with balance due
                    </div>
                  </div>
                )}
              </div>

              {/* Operations Work Queue & Today's Schedule */}
              <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "20px" }}>
                {/* Daily Checklist & Tasks */}
                <div style={{ padding: "22px", backgroundColor: "var(--color-surface)", borderRadius: "14px", border: "1px solid var(--color-border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <div>
                      <h3 style={{ fontSize: "1rem", fontWeight: 800, margin: 0 }}>Operational Checklist</h3>
                      <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", margin: 0 }}>
                        Action items and priority follow-ups for your desk
                      </p>
                    </div>
                    <button
                      onClick={() => setModalType("new_task")}
                      style={{
                        padding: "5px 10px",
                        borderRadius: "6px",
                        backgroundColor: "var(--color-brand)",
                        color: "#191A17",
                        border: "none",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        cursor: "pointer"
                      }}
                    >
                      + Add Task
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          backgroundColor: task.completed ? "rgba(0,0,0,0.02)" : "var(--color-background)",
                          border: "1px solid var(--color-border)",
                          cursor: "pointer"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div
                            style={{
                              width: "18px",
                              height: "18px",
                              borderRadius: "4px",
                              border: task.completed ? "none" : "1px solid var(--color-border)",
                              backgroundColor: task.completed ? "#10B981" : "transparent",
                              color: "#FFF",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            {task.completed && <Check size={12} />}
                          </div>
                          <div>
                            <div
                              style={{
                                fontSize: "0.82rem",
                                fontWeight: 600,
                                textDecoration: task.completed ? "line-through" : "none",
                                color: task.completed ? "var(--color-text-secondary)" : "var(--color-text-primary)"
                              }}
                            >
                              {task.title}
                            </div>
                            <span style={{ fontSize: "0.68rem", color: "var(--color-text-secondary)" }}>
                              {task.category}
                            </span>
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            padding: "2px 6px",
                            borderRadius: "4px",
                            backgroundColor:
                              task.priority === "high"
                                ? "rgba(239, 68, 68, 0.12)"
                                : task.priority === "medium"
                                ? "rgba(245, 158, 11, 0.12)"
                                : "rgba(16, 185, 129, 0.12)",
                            color:
                              task.priority === "high"
                                ? "#EF4444"
                                : task.priority === "medium"
                                ? "#F59E0B"
                                : "#10B981"
                          }}
                        >
                          {task.priority.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Today's Institute Timetable Slots */}
                <div style={{ padding: "22px", backgroundColor: "var(--color-surface)", borderRadius: "14px", border: "1px solid var(--color-border)" }}>
                  <div style={{ marginBottom: "16px" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 800, margin: 0 }}>Class & Lab Sessions</h3>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", margin: 0 }}>
                      Current session roster and lab room assignments
                    </p>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {timetable.slice(0, 5).map((t, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: "10px 14px",
                          borderRadius: "8px",
                          backgroundColor: "var(--color-background)",
                          border: "1px solid var(--color-border)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "0.82rem", fontWeight: 700 }}>{t.subject || t.course}</div>
                          <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary)" }}>
                            {t.batch} • {t.teacher}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-accent, #EB5E28)" }}>
                            {t.time}
                          </span>
                          <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary)" }}>{t.room}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════ */}
          {/* TAB 2: INQUIRIES & LEADS MANAGEMENT */}
          {/* ══════════════════════════════════════════════ */}
          {activeTab === "inquiries" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0 }}>Prospective Student Inquiries</h3>
                  <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
                    Inquiries received from front desk, phone calls, and website forms
                  </p>
                </div>
                {hasPermission(["inquiries.create", "inquiries.add"]) && (
                  <button
                    onClick={() => setModalType("new_lead")}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "8px",
                      backgroundColor: "var(--color-brand)",
                      color: "#191A17",
                      border: "none",
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      cursor: "pointer"
                    }}
                  >
                    <Plus size={15} />
                    <span>Log New Inquiry</span>
                  </button>
                )}
              </div>

              {/* Filters Bar */}
              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <Search size={15} style={{ position: "absolute", left: "12px", top: "11px", color: "var(--color-text-secondary)" }} />
                  <input
                    type="text"
                    value={leadSearch}
                    onChange={(e) => setLeadSearch(e.target.value)}
                    placeholder="Search prospect by name, phone, or email..."
                    style={{
                      width: "100%",
                      padding: "8px 12px 8px 36px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-surface)",
                      color: "var(--color-text-primary)",
                      fontSize: "0.82rem"
                    }}
                  />
                </div>
                <select
                  value={leadStatusFilter}
                  onChange={(e) => setLeadStatusFilter(e.target.value)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-surface)",
                    color: "var(--color-text-primary)",
                    fontSize: "0.82rem"
                  }}
                >
                  <option value="all">All Inquiry Statuses</option>
                  <option value="New">New Inquiries</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Enrolled">Converted to Enrolled</option>
                </select>
              </div>

              {/* Inquiries Table */}
              <div style={{ backgroundColor: "var(--color-surface)", borderRadius: "14px", border: "1px solid var(--color-border)", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--color-border)", backgroundColor: "rgba(0,0,0,0.02)" }}>
                      <th style={{ padding: "12px 16px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Prospect Details</th>
                      <th style={{ padding: "12px 16px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Course of Interest</th>
                      <th style={{ padding: "12px 16px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Inquiry Notes</th>
                      <th style={{ padding: "12px 16px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Status</th>
                      <th style={{ padding: "12px 16px", fontWeight: 700, color: "var(--color-text-secondary)", textAlign: "right" }}>Update Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((l) => (
                      <tr key={l.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ fontWeight: 700 }}>{l.name}</div>
                          <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary)" }}>
                            {l.phone} • {l.email}
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px", fontWeight: 600 }}>{l.course}</td>
                        <td style={{ padding: "14px 16px", color: "var(--color-text-secondary)", maxWidth: "260px" }}>
                          {l.message || "Standard inquiry"}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              padding: "3px 8px",
                              borderRadius: "4px",
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              backgroundColor:
                                l.status === "New"
                                  ? "rgba(235, 94, 40, 0.12)"
                                  : l.status === "Enrolled"
                                  ? "rgba(16, 185, 129, 0.12)"
                                  : "rgba(59, 130, 246, 0.12)",
                              color:
                                l.status === "New"
                                  ? "var(--color-accent, #EB5E28)"
                                  : l.status === "Enrolled"
                                  ? "#10B981"
                                  : "#3B82F6"
                            }}
                          >
                            {l.status}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", textAlign: "right" }}>
                          {hasPermission(["inquiries.edit", "inquiries.status_update"]) ? (
                            <select
                              value={l.status}
                              onChange={(e) => handleUpdateLeadStatus(l.id, e.target.value)}
                              style={{
                                padding: "4px 8px",
                                borderRadius: "6px",
                                border: "1px solid var(--color-border)",
                                backgroundColor: "var(--color-background)",
                                color: "var(--color-text-primary)",
                                fontSize: "0.75rem"
                              }}
                            >
                              <option value="New">Mark New</option>
                              <option value="Contacted">Mark Contacted</option>
                              <option value="Enrolled">Mark Enrolled</option>
                              <option value="Declined">Mark Declined</option>
                            </select>
                          ) : (
                            <span style={{ fontSize: "0.72rem", color: "var(--color-text-secondary)" }}>View Only</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════ */}
          {/* TAB 3: STUDENT DIRECTORY & FEE STATUS */}
          {/* ══════════════════════════════════════════════ */}
          {activeTab === "students" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0 }}>Registered Student Directory</h3>
                  <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
                    Active learners, cohort assignments, and institutional ID records
                  </p>
                </div>
                {hasPermission(["students.create", "students.add"]) && (
                  <button
                    onClick={() => setModalType("enroll_student")}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "8px",
                      backgroundColor: "var(--color-brand)",
                      color: "#191A17",
                      border: "none",
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      cursor: "pointer"
                    }}
                  >
                    <Plus size={15} />
                    <span>Register New Student</span>
                  </button>
                )}
              </div>

              {/* Search & Filter */}
              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <Search size={15} style={{ position: "absolute", left: "12px", top: "11px", color: "var(--color-text-secondary)" }} />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Search student by name, student ID, or email..."
                    style={{
                      width: "100%",
                      padding: "8px 12px 8px 36px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-surface)",
                      color: "var(--color-text-primary)",
                      fontSize: "0.82rem"
                    }}
                  />
                </div>
                <select
                  value={studentCourseFilter}
                  onChange={(e) => setStudentCourseFilter(e.target.value)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-surface)",
                    color: "var(--color-text-primary)",
                    fontSize: "0.82rem"
                  }}
                >
                  <option value="all">All Courses</option>
                  {courses.map((c) => (
                    <option key={c.id || c.title} value={c.title}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Table */}
              <div style={{ backgroundColor: "var(--color-surface)", borderRadius: "14px", border: "1px solid var(--color-border)", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--color-border)", backgroundColor: "rgba(0,0,0,0.02)" }}>
                      <th style={{ padding: "12px 16px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Student ID</th>
                      <th style={{ padding: "12px 16px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Learner Name</th>
                      <th style={{ padding: "12px 16px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Course & Batch</th>
                      <th style={{ padding: "12px 16px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Status</th>
                      <th style={{ padding: "12px 16px", fontWeight: 700, color: "var(--color-text-secondary)", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((s) => (
                      <tr key={s.studentId || s._id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                        <td style={{ padding: "14px 16px", fontFamily: "monospace", fontWeight: 700, color: "var(--color-accent, #EB5E28)" }}>
                          {s.studentId}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ fontWeight: 700 }}>{s.name}</div>
                          <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary)" }}>{s.email}</div>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ fontWeight: 600 }}>{s.course}</div>
                          <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary)" }}>{s.batch}</div>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              padding: "2px 7px",
                              borderRadius: "4px",
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              backgroundColor:
                                s.enrollmentStatus === "active"
                                  ? "rgba(16, 185, 129, 0.12)"
                                  : "rgba(245, 158, 11, 0.12)",
                              color: s.enrollmentStatus === "active" ? "#10B981" : "#F59E0B"
                            }}
                          >
                            {s.enrollmentStatus}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", textAlign: "right" }}>
                          <button
                            onClick={() => {
                              setSelectedStudentForView(s);
                              setModalType("view_student");
                            }}
                            style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              border: "1px solid var(--color-border)",
                              backgroundColor: "var(--color-background)",
                              color: "var(--color-text-primary)",
                              fontSize: "0.75rem",
                              cursor: "pointer"
                            }}
                          >
                            View Card
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════ */}
          {/* TAB 4: FEE BALANCES & RECEIPTS */}
          {/* ══════════════════════════════════════════════ */}
          {activeTab === "fees" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0 }}>Fee Balances & Transactions</h3>
                  <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
                    Track installment balances, verified receipts, and payment statuses
                  </p>
                </div>
                {hasPermission("fees.payments_record") && (
                  <button
                    onClick={() => setModalType("record_fee")}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "8px",
                      backgroundColor: "var(--color-brand)",
                      color: "#191A17",
                      border: "none",
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      cursor: "pointer"
                    }}
                  >
                    <Plus size={15} />
                    <span>Record Payment Receipt</span>
                  </button>
                )}
              </div>

              {/* Search */}
              <div style={{ position: "relative" }}>
                <Search size={15} style={{ position: "absolute", left: "12px", top: "11px", color: "var(--color-text-secondary)" }} />
                <input
                  type="text"
                  value={feeSearch}
                  onChange={(e) => setFeeSearch(e.target.value)}
                  placeholder="Search fee records by student name, ID, or course..."
                  style={{
                    width: "100%",
                    padding: "8px 12px 8px 36px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-surface)",
                    color: "var(--color-text-primary)",
                    fontSize: "0.82rem"
                  }}
                />
              </div>

              {/* Fee Table */}
              <div style={{ backgroundColor: "var(--color-surface)", borderRadius: "14px", border: "1px solid var(--color-border)", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--color-border)", backgroundColor: "rgba(0,0,0,0.02)" }}>
                      <th style={{ padding: "12px 16px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Student</th>
                      <th style={{ padding: "12px 16px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Program</th>
                      <th style={{ padding: "12px 16px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Total Fee</th>
                      <th style={{ padding: "12px 16px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Paid</th>
                      <th style={{ padding: "12px 16px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Balance Due</th>
                      <th style={{ padding: "12px 16px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Receipt No.</th>
                      <th style={{ padding: "12px 16px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFees.map((f, idx) => {
                      const balance = (f.totalFee || 0) - (f.paidAmount || 0);
                      return (
                        <tr key={idx} style={{ borderBottom: "1px solid var(--color-border)" }}>
                          <td style={{ padding: "14px 16px" }}>
                            <div style={{ fontWeight: 700 }}>{f.studentName}</div>
                            <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary)", fontFamily: "monospace" }}>
                              {f.studentId}
                            </div>
                          </td>
                          <td style={{ padding: "14px 16px", fontWeight: 600 }}>{f.course}</td>
                          <td style={{ padding: "14px 16px" }}>₹{Number(f.totalFee || 0).toLocaleString()}</td>
                          <td style={{ padding: "14px 16px", color: "#10B981", fontWeight: 700 }}>
                            ₹{Number(f.paidAmount || 0).toLocaleString()}
                          </td>
                          <td style={{ padding: "14px 16px", color: balance > 0 ? "#EF4444" : "#10B981", fontWeight: 700 }}>
                            ₹{Number(balance).toLocaleString()}
                          </td>
                          <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: "0.75rem" }}>
                            {f.receiptNumber || "HUN-REC-001"}
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <span
                              style={{
                                padding: "2px 6px",
                                borderRadius: "4px",
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                backgroundColor:
                                  f.status === "Paid"
                                    ? "rgba(16, 185, 129, 0.12)"
                                    : f.status === "Partial"
                                    ? "rgba(245, 158, 11, 0.12)"
                                    : "rgba(239, 68, 68, 0.12)",
                                color:
                                  f.status === "Paid"
                                    ? "#10B981"
                                    : f.status === "Partial"
                                    ? "#F59E0B"
                                    : "#EF4444"
                              }}
                            >
                              {f.status || (balance === 0 ? "Paid" : "Pending")}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════ */}
          {/* TAB 5: CLASS SCHEDULES & LAB TIMETABLE */}
          {/* ══════════════════════════════════════════════ */}
          {activeTab === "timetable" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0 }}>Class Schedules & Room Rosters</h3>
                <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
                  Weekly academic timetable, classroom allocations, and lab availability
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
                {timetable.map((slot, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "18px",
                      borderRadius: "12px",
                      backgroundColor: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <span style={{ fontSize: "0.7rem", fontWeight: 800, padding: "2px 6px", borderRadius: "4px", backgroundColor: "rgba(239, 219, 25, 0.2)", color: "var(--color-text-primary)" }}>
                          {slot.day || "Everyday"}
                        </span>
                        <h4 style={{ fontSize: "0.95rem", fontWeight: 800, margin: "6px 0 2px 0" }}>
                          {slot.subject || slot.course}
                        </h4>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                          {slot.batch}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--color-accent, #EB5E28)" }}>
                          {slot.time}
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)" }}>
                          {slot.room || "Silicon Lab"}
                        </div>
                      </div>
                    </div>
                    <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "8px", fontSize: "0.75rem", color: "var(--color-text-secondary)", display: "flex", justifyContent: "space-between" }}>
                      <span>Instructor: <strong>{slot.teacher}</strong></span>
                      <span>Verified Active</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════ */}
          {/* TAB 6: ATTENDANCE DESK */}
          {/* ══════════════════════════════════════════════ */}
          {activeTab === "attendance" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0 }}>Attendance Operations Desk</h3>
                  <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
                    Check-in logs and batch attendance submission
                  </p>
                </div>
                {hasPermission(["attendance.student_mark", "attendance.student_edit"]) && (
                  <button
                    onClick={handleSaveAttendance}
                    disabled={submitting}
                    style={{
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
                    Save Batch Attendance
                  </button>
                )}
              </div>

              {/* Selector */}
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <select
                  value={selectedBatchForAttendance}
                  onChange={(e) => setSelectedBatchForAttendance(e.target.value)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-surface)",
                    color: "var(--color-text-primary)",
                    fontSize: "0.82rem"
                  }}
                >
                  <option value="Batch Alpha 2026">Batch Alpha 2026</option>
                  <option value="Batch Beta 2026">Batch Beta 2026</option>
                </select>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-surface)",
                    color: "var(--color-text-primary)",
                    fontSize: "0.82rem"
                  }}
                />
              </div>

              {/* Attendance Table */}
              <div style={{ backgroundColor: "var(--color-surface)", borderRadius: "14px", border: "1px solid var(--color-border)", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--color-border)", backgroundColor: "rgba(0,0,0,0.02)" }}>
                      <th style={{ padding: "12px 16px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Student ID</th>
                      <th style={{ padding: "12px 16px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Learner Name</th>
                      <th style={{ padding: "12px 16px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Class Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students
                      .filter((s) => s.batch === selectedBatchForAttendance)
                      .map((s) => (
                        <tr key={s.studentId} style={{ borderBottom: "1px solid var(--color-border)" }}>
                          <td style={{ padding: "12px 16px", fontFamily: "monospace", fontWeight: 700 }}>{s.studentId}</td>
                          <td style={{ padding: "12px 16px", fontWeight: 600 }}>{s.name}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ fontSize: "0.75rem", padding: "2px 8px", borderRadius: "4px", backgroundColor: "rgba(16, 185, 129, 0.12)", color: "#10B981", fontWeight: 700 }}>
                              Present
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════ */}
          {/* TAB 7: OPERATIONS CHECKLIST & TASKS */}
          {/* ══════════════════════════════════════════════ */}
          {activeTab === "tasks" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0 }}>Operations Action Checklist</h3>
                  <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
                    Track tasks assigned to your desk, daily operational checklists, and milestones
                  </p>
                </div>
                <button
                  onClick={() => setModalType("new_task")}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    backgroundColor: "var(--color-brand)",
                    color: "#191A17",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer"
                  }}
                >
                  <Plus size={15} />
                  <span>Create Action Item</span>
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "14px" }}>
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    style={{
                      padding: "16px",
                      borderRadius: "12px",
                      backgroundColor: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: "12px"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "2px 6px", borderRadius: "4px", backgroundColor: "rgba(0,0,0,0.05)", color: "var(--color-text-secondary)" }}>
                          {task.category}
                        </span>
                        <span
                          style={{
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            padding: "2px 6px",
                            borderRadius: "4px",
                            backgroundColor:
                              task.priority === "high"
                                ? "rgba(239, 68, 68, 0.12)"
                                : task.priority === "medium"
                                ? "rgba(245, 158, 11, 0.12)"
                                : "rgba(16, 185, 129, 0.12)",
                            color:
                              task.priority === "high"
                                ? "#EF4444"
                                : task.priority === "medium"
                                ? "#F59E0B"
                                : "#10B981"
                          }}
                        >
                          {task.priority.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.88rem", fontWeight: 700, textDecoration: task.completed ? "line-through" : "none" }}>
                        {task.title}
                      </div>
                    </div>

                    <button
                      onClick={() => toggleTask(task.id)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "1px solid var(--color-border)",
                        backgroundColor: task.completed ? "rgba(16, 185, 129, 0.12)" : "var(--color-background)",
                        color: task.completed ? "#10B981" : "var(--color-text-primary)",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px"
                      }}
                    >
                      {task.completed ? <Check size={13} /> : null}
                      <span>{task.completed ? "Completed" : "Mark Complete"}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════ */}
          {/* TAB 8: NOTICES & ANNOUNCEMENTS */}
          {/* ══════════════════════════════════════════════ */}
          {activeTab === "announcements" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0 }}>Institute Bulletins & Notices</h3>
                <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
                  Active notifications broadcast across student, staff, and public portals
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {announcements.map((a, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "16px 20px",
                      borderRadius: "12px",
                      backgroundColor: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h4 style={{ fontSize: "0.92rem", fontWeight: 800, margin: 0 }}>{a.title}</h4>
                      <span style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)" }}>
                        Audience: {a.audience || "all"}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", margin: 0 }}>
                      {a.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ══════════════════════════════════════════════ */}
      {/* MODAL 1: LOG NEW INQUIRY */}
      {/* ══════════════════════════════════════════════ */}
      {modalType === "new_lead" && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ backgroundColor: "var(--color-surface)", width: "100%", maxWidth: "480px", borderRadius: "14px", border: "1px solid var(--color-border)", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0 }}>Record New Prospect Inquiry</h3>
              <button onClick={() => setModalType(null)} style={{ background: "none", border: "none", color: "var(--color-text-secondary)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateLead} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-secondary)" }}>Full Name</label>
                <input
                  required
                  type="text"
                  value={leadForm.name}
                  onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                  placeholder="e.g. Jasmeet Kaur"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.82rem", marginTop: "4px" }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-secondary)" }}>Phone Number</label>
                  <input
                    required
                    type="text"
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                    placeholder="+91 98765 00000"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.82rem", marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-secondary)" }}>Email Address</label>
                  <input
                    type="email"
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                    placeholder="student@gmail.com"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.82rem", marginTop: "4px" }}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-secondary)" }}>Course of Interest</label>
                <select
                  value={leadForm.course}
                  onChange={(e) => setLeadForm({ ...leadForm, course: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.82rem", marginTop: "4px" }}
                >
                  <option value="Full Stack Web Development">Full Stack Web Development</option>
                  <option value="Graphic Design & Visual Branding">Graphic Design & Visual Branding</option>
                  <option value="Digital Marketing & AI Growth">Digital Marketing & AI Growth</option>
                  <option value="Data Analytics & AI Tools">Data Analytics & AI Tools</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-secondary)" }}>Front Desk Notes</label>
                <textarea
                  rows={2}
                  value={leadForm.notes}
                  onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                  placeholder="e.g. Interested in morning batch, requested syllabus booklet"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.82rem", marginTop: "4px" }}
                />
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  style={{ flex: 1, padding: "9px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "transparent", color: "var(--color-text-primary)", fontSize: "0.82rem", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ flex: 1, padding: "9px", borderRadius: "8px", border: "none", backgroundColor: "var(--color-brand)", color: "#191A17", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}
                >
                  {submitting ? "Saving..." : "Log Inquiry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/* MODAL 2: ENROLL STUDENT */}
      {/* ══════════════════════════════════════════════ */}
      {modalType === "enroll_student" && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ backgroundColor: "var(--color-surface)", width: "100%", maxWidth: "480px", borderRadius: "14px", border: "1px solid var(--color-border)", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0 }}>Enroll Student & Issue ID</h3>
              <button onClick={() => setModalType(null)} style={{ background: "none", border: "none", color: "var(--color-text-secondary)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleRegisterStudent} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-secondary)" }}>Learner Full Name</label>
                <input
                  required
                  type="text"
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                  placeholder="e.g. Navjot Singh"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.82rem", marginTop: "4px" }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-secondary)" }}>Email (for Login)</label>
                  <input
                    required
                    type="email"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    placeholder="student@domain.com"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.82rem", marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-secondary)" }}>Phone Number</label>
                  <input
                    required
                    type="text"
                    value={studentForm.phone}
                    onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                    placeholder="+91 99887 00000"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.82rem", marginTop: "4px" }}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-secondary)" }}>Enrolled Program</label>
                <select
                  value={studentForm.course}
                  onChange={(e) => setStudentForm({ ...studentForm, course: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.82rem", marginTop: "4px" }}
                >
                  <option value="Full Stack Web Development">Full Stack Web Development</option>
                  <option value="Graphic Design & Visual Branding">Graphic Design & Visual Branding</option>
                  <option value="Digital Marketing & AI Growth">Digital Marketing & AI Growth</option>
                  <option value="Data Analytics & AI Tools">Data Analytics & AI Tools</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-secondary)" }}>Cohort Batch</label>
                <select
                  value={studentForm.batch}
                  onChange={(e) => setStudentForm({ ...studentForm, batch: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.82rem", marginTop: "4px" }}
                >
                  <option value="Batch Alpha 2026">Batch Alpha 2026 (Morning 10 AM - 1 PM)</option>
                  <option value="Batch Beta 2026">Batch Beta 2026 (Evening 3 PM - 6 PM)</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  style={{ flex: 1, padding: "9px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "transparent", color: "var(--color-text-primary)", fontSize: "0.82rem", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ flex: 1, padding: "9px", borderRadius: "8px", border: "none", backgroundColor: "var(--color-accent, #EB5E28)", color: "#FFF", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}
                >
                  {submitting ? "Enrolling..." : "Enroll Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/* MODAL 3: RECORD FEE PAYMENT */}
      {/* ══════════════════════════════════════════════ */}
      {modalType === "record_fee" && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ backgroundColor: "var(--color-surface)", width: "100%", maxWidth: "480px", borderRadius: "14px", border: "1px solid var(--color-border)", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0 }}>Record Fee Installment</h3>
              <button onClick={() => setModalType(null)} style={{ background: "none", border: "none", color: "var(--color-text-secondary)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleRecordFee} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-secondary)" }}>Select Student</label>
                <select
                  required
                  onChange={(e) => {
                    const st = students.find((s) => s.studentId === e.target.value);
                    if (st) {
                      setFeeForm({ ...feeForm, studentId: st.studentId, studentName: st.name, course: st.course });
                    }
                  }}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.82rem", marginTop: "4px" }}
                >
                  <option value="">-- Choose enrolled learner --</option>
                  {students.map((s) => (
                    <option key={s.studentId} value={s.studentId}>
                      {s.name} ({s.studentId})
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-secondary)" }}>Total Program Fee (₹)</label>
                  <input
                    type="number"
                    value={feeForm.totalFee}
                    onChange={(e) => setFeeForm({ ...feeForm, totalFee: Number(e.target.value) })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.82rem", marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-secondary)" }}>Amount Paid Today (₹)</label>
                  <input
                    type="number"
                    value={feeForm.paidAmount}
                    onChange={(e) => setFeeForm({ ...feeForm, paidAmount: Number(e.target.value) })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.82rem", marginTop: "4px" }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  style={{ flex: 1, padding: "9px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "transparent", color: "var(--color-text-primary)", fontSize: "0.82rem", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ flex: 1, padding: "9px", borderRadius: "8px", border: "none", backgroundColor: "var(--color-brand)", color: "#191A17", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}
                >
                  {submitting ? "Issuing Receipt..." : "Record & Issue Receipt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/* MODAL 4: ADD CHECKLIST TASK */}
      {/* ══════════════════════════════════════════════ */}
      {modalType === "new_task" && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ backgroundColor: "var(--color-surface)", width: "100%", maxWidth: "440px", borderRadius: "14px", border: "1px solid var(--color-border)", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0 }}>Add Operations Task</h3>
              <button onClick={() => setModalType(null)} style={{ background: "none", border: "none", color: "var(--color-text-secondary)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddTask} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-secondary)" }}>Action Item Description</label>
                <input
                  required
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="e.g. Call Batch Beta pending inquiries"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.82rem", marginTop: "4px" }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-secondary)" }}>Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.82rem", marginTop: "4px" }}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-secondary)" }}>Category</label>
                  <input
                    type="text"
                    value={taskForm.category}
                    onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value })}
                    placeholder="Front Desk"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.82rem", marginTop: "4px" }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  style={{ flex: 1, padding: "9px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "transparent", color: "var(--color-text-primary)", fontSize: "0.82rem", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: "9px", borderRadius: "8px", border: "none", backgroundColor: "var(--color-brand)", color: "#191A17", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/* MODAL 5: STUDENT DETAIL CARD */}
      {/* ══════════════════════════════════════════════ */}
      {modalType === "view_student" && selectedStudentForView && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ backgroundColor: "var(--color-surface)", width: "100%", maxWidth: "460px", borderRadius: "14px", border: "1px solid var(--color-border)", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <GraduationCap size={20} color="var(--color-accent, #EB5E28)" />
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0 }}>Student Profile Card</h3>
              </div>
              <button onClick={() => setModalType(null)} style={{ background: "none", border: "none", color: "var(--color-text-secondary)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.82rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--color-border)" }}>
                <span style={{ color: "var(--color-text-secondary)" }}>Student ID:</span>
                <span style={{ fontWeight: 800, fontFamily: "monospace", color: "var(--color-accent, #EB5E28)" }}>{selectedStudentForView.studentId}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--color-border)" }}>
                <span style={{ color: "var(--color-text-secondary)" }}>Learner Name:</span>
                <span style={{ fontWeight: 700 }}>{selectedStudentForView.name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--color-border)" }}>
                <span style={{ color: "var(--color-text-secondary)" }}>Email:</span>
                <span>{selectedStudentForView.email}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--color-border)" }}>
                <span style={{ color: "var(--color-text-secondary)" }}>Phone:</span>
                <span>{selectedStudentForView.phone}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--color-border)" }}>
                <span style={{ color: "var(--color-text-secondary)" }}>Enrolled Course:</span>
                <span style={{ fontWeight: 700 }}>{selectedStudentForView.course}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--color-border)" }}>
                <span style={{ color: "var(--color-text-secondary)" }}>Assigned Batch:</span>
                <span>{selectedStudentForView.batch}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                <span style={{ color: "var(--color-text-secondary)" }}>Enrollment Status:</span>
                <span style={{ fontWeight: 700, color: "#10B981" }}>{selectedStudentForView.enrollmentStatus}</span>
              </div>
            </div>

            <button
              onClick={() => setModalType(null)}
              style={{ width: "100%", marginTop: "16px", padding: "9px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)", color: "var(--color-text-primary)", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/* MODAL 6: INVITATION MODAL */}
      {/* ══════════════════════════════════════════════ */}
      {invitationModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 110, padding: "16px" }}>
          <div style={{ backgroundColor: "var(--color-surface)", borderRadius: "16px", border: "1px solid var(--color-border)", width: "100%", maxWidth: "480px", padding: "24px", boxShadow: "0 24px 48px rgba(0,0,0,0.3)" }}>
            <div style={{ textAlign: "center", marginBottom: "18px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px auto" }}>
                <CheckCircle2 size={28} />
              </div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, margin: "0 0 6px 0", color: "var(--color-text-primary)" }}>Student Enrolled & ID Generated</h3>
              <p style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)", margin: 0 }}>
                Official Login ID: <strong style={{ color: "var(--color-brand)", fontFamily: "monospace" }}>{invitationModal.studentId}</strong>
              </p>
            </div>

            <div style={{ padding: "14px", borderRadius: "10px", backgroundColor: "var(--color-surface-secondary)", border: "1px solid var(--color-border)", marginBottom: "16px" }}>
              <label style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "var(--color-text-secondary)", display: "block", marginBottom: "6px" }}>
                Single-Use Activation URL
              </label>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  type="text"
                  readOnly
                  value={invitationModal.activationUrl}
                  style={{ flex: 1, padding: "8px", borderRadius: "6px", border: "1px solid var(--color-border)", backgroundColor: "transparent", color: "var(--color-text-primary)", fontSize: "0.78rem", fontFamily: "monospace" }}
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(invitationModal.activationUrl);
                    showToast("Activation link copied to clipboard!");
                  }}
                  style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--color-brand)", backgroundColor: "var(--color-brand)", color: "var(--color-brand-on)", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  Copy Link
                </button>
              </div>
            </div>

            <button
              onClick={() => setInvitationModal(null)}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)", color: "var(--color-text-primary)", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
