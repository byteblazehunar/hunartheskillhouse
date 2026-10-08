import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  LogOut,
  Bell,
  User,
  ShieldCheck,
  Plus,
  Send,
  Check,
  X
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import usePortalTab from "../hooks/usePortalTab";

const STAFF_PORTAL_TABS = ["overview", "attendance", "students", "assignments", "announcements", "profile"];

export default function StaffPortal() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [portalData, setPortalData] = useState(null);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = usePortalTab(STAFF_PORTAL_TABS);

  // Attendance marking state
  const [selectedBatch, setSelectedBatch] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [attendanceMessage, setAttendanceMessage] = useState("");

  // Assignment creation state
  const [showNewAssignModal, setShowNewAssignModal] = useState(false);
  const [newAssignTitle, setNewAssignTitle] = useState("");
  const [newAssignDesc, setNewAssignDesc] = useState("");
  const [newAssignBatch, setNewAssignBatch] = useState("");
  const [newAssignDeadline, setNewAssignDeadline] = useState("");
  const [assignSuccess, setAssignSuccess] = useState("");

  // Announcement state
  const [annTitle, setAnnTitle] = useState("");
  const [annMsg, setAnnMsg] = useState("");
  const [annAudience, setAnnAudience] = useState("students");
  const [annSuccess, setAnnSuccess] = useState("");

  const logoSrc = theme === "light" ? "/assets/LOGO BG - HUNAR.png" : "/assets/LOGO BG 2- HUNAR.png";

  useEffect(() => {
    const token = localStorage.getItem("hunar_token");
    if (!token) {
      navigate("/login");
      return;
    }

    Promise.all([
      fetch("/api/portal/staff", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch("/api/students", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json())
    ])
      .then(([pData, sData]) => {
        if (!pData.success) throw new Error(pData.message || "Unable to load the staff portal.");
        if (!Array.isArray(sData)) {
          throw new Error(sData.message || "Unable to load the student roster.");
        }
        setPortalData(pData);
        setStudents(sData);
        const firstBatch = pData.assignedBatches?.[0]?.name || "";
        setSelectedBatch((current) => pData.assignedBatches?.some((batch) => batch.name === current)
          ? current
          : firstBatch);
        setNewAssignBatch((current) => pData.assignedBatches?.some((batch) => batch.name === current)
          ? current
          : firstBatch);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Staff portal error:", err);
        setLoadError(err.message || "Unable to connect to the backend.");
        setLoading(false);
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("hunar_token");
    localStorage.removeItem("hunar_user");
    navigate("/login");
  };

  const handleSaveAttendance = async () => {
    setAttendanceMessage("");
    const token = localStorage.getItem("hunar_token");

    const batchStudents = students.filter((s) => s.batch === selectedBatch);
    const records = batchStudents.map((s) => ({
      studentId: s.studentId,
      studentName: s.name,
      status: attendanceRecords[s.studentId] || "present"
    }));

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          batch: selectedBatch,
          date: attendanceDate,
          records
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setAttendanceMessage("Attendance recorded successfully!");
    } catch (err) {
      setAttendanceMessage("Error saving attendance: " + err.message);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setAssignSuccess("");
    const token = localStorage.getItem("hunar_token");

    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newAssignTitle,
          description: newAssignDesc,
          batch: newAssignBatch,
          deadline: newAssignDeadline,
          maxMarks: 100
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setAssignSuccess("Assignment published successfully!");
      setNewAssignTitle("");
      setNewAssignDesc("");
      setShowNewAssignModal(false);

      // Refresh assignments
      const ref = await fetch("/api/portal/staff", { headers: { Authorization: `Bearer ${token}` } });
      const refData = await ref.json();
      if (refData.success) setPortalData(refData);
    } catch (err) {
      alert("Error creating assignment: " + err.message);
    }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    setAnnSuccess("");
    const token = localStorage.getItem("hunar_token");

    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: annTitle,
          message: annMsg,
          audience: annAudience
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setAnnSuccess("Announcement published to students!");
      setAnnTitle("");
      setAnnMsg("");
    } catch (err) {
      alert("Error posting notice: " + err.message);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "75vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        backgroundColor: "var(--color-bg)"
      }}>
        <div style={{
          width: "42px",
          height: "42px",
          border: "3px solid var(--color-brand)",
          borderTopColor: "transparent",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite"
        }} />
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem" }}>
          Authenticating Faculty Workspace...
        </p>
      </div>
    );
  }

  if (loadError || !portalData) {
    return (
      <div className="container" style={{ minHeight: "60vh", display: "grid", placeContent: "center", gap: "16px" }}>
        <p role="alert" style={{ color: "var(--color-danger)" }}>{loadError || "Staff data is unavailable."}</p>
        <button className="btn btn-outline" onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  const { profile, assignedBatches, assignments } = portalData;
  const filteredStudents = students.filter((s) => s.batch === selectedBatch);

  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100vh", paddingBottom: "60px" }}>
      {/* Top Banner / Portal Navigation */}
      <header style={{
        backgroundColor: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        padding: "16px 0",
        position: "sticky",
        top: 0,
        zIndex: 50
      }}>
        <div className="container" style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link to="/" aria-label="Hunar Home">
              <img src={logoSrc} alt="HUNAR" style={{ height: "36px", width: "auto" }} />
            </Link>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "9999px",
              backgroundColor: "rgba(239, 219, 25, 0.12)",
              border: "1px solid var(--color-brand-border)",
              fontSize: "0.76rem",
              fontWeight: "700",
              color: "var(--color-brand-text)",
              letterSpacing: "0.04em",
              textTransform: "uppercase"
            }}>
              Staff & Faculty Portal
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ textAlign: "right", display: "none", sm: "block" }}>
              <div style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--color-text-primary)" }}>
                {profile.name}
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--color-brand-text)", fontFamily: "monospace", fontWeight: "600" }}>
                {profile.staffId || "HUN-T-0002"}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-outline btn-sm"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 14px" }}
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="container" style={{ paddingTop: "32px" }}>
        {/* Welcome Card */}
        <div className="hunar-card" style={{
          padding: "32px",
          marginBottom: "28px",
          background: "linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-secondary) 100%)",
          border: "1px solid var(--color-border)",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: "5px",
            backgroundColor: "var(--color-brand)"
          }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
            <div>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px"
              }}>
                <span style={{ fontSize: "0.82rem", fontWeight: "600", color: "var(--color-brand-text)" }}>
                  FACULTY MANAGEMENT · MULLANPUR DAKHA
                </span>
              </div>
              <h1 style={{ fontSize: "clamp(1.6rem, 2.8vw, 2.2rem)", fontWeight: "700", marginBottom: "8px" }}>
                {profile.name}
              </h1>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem", maxWidth: "600px" }}>
                {profile.designation} · {profile.department}.
              </p>
            </div>

            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              padding: "14px 20px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              minWidth: "200px"
            }}>
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Faculty ID
              </span>
              <span style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--color-text-primary)", fontFamily: "monospace" }}>
                {profile.staffId || "HUN-T-0002"}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div role="tablist" aria-label="Staff portal pages" style={{
          display: "flex",
          gap: "8px",
          borderBottom: "1px solid var(--color-border)",
          marginBottom: "28px",
          overflowX: "auto",
          paddingBottom: "4px"
        }}>
          {[
            { id: "overview", label: "Overview", icon: Calendar },
            { id: "attendance", label: "Mark Attendance", icon: CheckCircle2 },
            { id: "students", label: `My Students (${students.length})`, icon: Users },
            { id: "assignments", label: `Assignments (${assignments.length})`, icon: FileText },
            { id: "announcements", label: "Post Announcement", icon: Bell },
            { id: "profile", label: "Staff Profile", icon: User }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
                role="tab"
                aria-selected={active}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 18px",
                  border: "none",
                  borderBottom: active ? "3px solid var(--color-brand)" : "3px solid transparent",
                  backgroundColor: "transparent",
                  color: active ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                  fontWeight: active ? "700" : "500",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all var(--transition-fast)"
                }}
              >
                <Icon size={16} color={active ? "var(--color-brand)" : "currentColor"} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "32px" }}>
              <div className="hunar-card" style={{ padding: "24px" }}>
                <div style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", marginBottom: "8px" }}>Assigned Batches</div>
                <div style={{ fontSize: "2rem", fontWeight: "700", color: "var(--color-brand-text)" }}>{assignedBatches.length}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", marginTop: "4px" }}>Workstation batches</div>
              </div>
              <div className="hunar-card" style={{ padding: "24px" }}>
                <div style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", marginBottom: "8px" }}>Enrolled Students</div>
                <div style={{ fontSize: "2rem", fontWeight: "700", color: "var(--color-text-primary)" }}>{students.length}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", marginTop: "4px" }}>Under faculty mentorship</div>
              </div>
              <div className="hunar-card" style={{ padding: "24px" }}>
                <div style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", marginBottom: "8px" }}>Active Assignments</div>
                <div style={{ fontSize: "2rem", fontWeight: "700", color: "var(--color-text-primary)" }}>{assignments.length}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", marginTop: "4px" }}>Workstation practicals</div>
              </div>
            </div>

            <div className="hunar-card" style={{ padding: "28px" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "16px" }}>
                Assigned Teaching Batches
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                {assignedBatches.map((b) => (
                  <div key={b._id || b.id} style={{
                    padding: "18px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--color-surface-secondary)",
                    border: "1px solid var(--color-border)"
                  }}>
                    <div style={{ fontWeight: "700", fontSize: "1rem", marginBottom: "4px" }}>{b.name}</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--color-brand-text)", marginBottom: "4px" }}>{b.course}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{b.timing}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Mark Attendance */}
        {activeTab === "attendance" && (
          <div className="hunar-card" style={{ padding: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "4px" }}>
                  Record Batch Attendance
                </h3>
                <p style={{ fontSize: "0.88rem", color: "var(--color-text-secondary)" }}>
                  Select batch and class date to mark student attendance.
                </p>
              </div>

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <div>
                  <label className="form-label" style={{ fontSize: "0.78rem" }}>Batch</label>
                  <select
                    className="form-select"
                    style={{ minHeight: "40px", padding: "6px 12px" }}
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                  >
                    {assignedBatches.map((b) => (
                      <option key={b._id || b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: "0.78rem" }}>Date</label>
                  <input
                    type="date"
                    className="form-input"
                    style={{ minHeight: "40px", padding: "6px 12px" }}
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {attendanceMessage && (
              <div style={{
                background: "rgba(34, 197, 94, 0.1)",
                border: "1px solid var(--color-success)",
                color: "var(--color-success)",
                padding: "12px",
                borderRadius: "var(--radius-md)",
                marginBottom: "20px",
                fontSize: "0.85rem"
              }}>
                {attendanceMessage}
              </div>
            )}

            {filteredStudents.length > 0 ? (
              <div>
                <div style={{ overflowX: "auto", marginBottom: "24px" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--color-border)", color: "var(--color-text-muted)" }}>
                        <th style={{ padding: "12px 14px" }}>Student ID</th>
                        <th style={{ padding: "12px 14px" }}>Student Name</th>
                        <th style={{ padding: "12px 14px" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((s) => {
                        const currentStatus = attendanceRecords[s.studentId] || "present";
                        return (
                          <tr key={s.studentId} style={{ borderBottom: "1px solid var(--color-border)" }}>
                            <td style={{ padding: "14px", fontFamily: "monospace", fontWeight: "600", color: "var(--color-brand-text)" }}>
                              {s.studentId}
                            </td>
                            <td style={{ padding: "14px", fontWeight: "600" }}>{s.name}</td>
                            <td style={{ padding: "14px" }}>
                              <div style={{ display: "inline-flex", gap: "6px" }}>
                                {["present", "absent", "late"].map((st) => (
                                  <button
                                    key={st}
                                    type="button"
                                    onClick={() => setAttendanceRecords((prev) => ({ ...prev, [s.studentId]: st }))}
                                    style={{
                                      padding: "4px 12px",
                                      borderRadius: "6px",
                                      border: "1px solid",
                                      borderColor: currentStatus === st ? "var(--color-brand)" : "var(--color-border)",
                                      backgroundColor: currentStatus === st ? "var(--color-brand)" : "transparent",
                                      color: currentStatus === st ? "var(--color-brand-on)" : "var(--color-text-secondary)",
                                      fontWeight: "600",
                                      fontSize: "0.78rem",
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
                    </tbody>
                  </table>
                </div>

                <button onClick={handleSaveAttendance} className="btn btn-primary">
                  Save Verified Attendance
                </button>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--color-text-muted)" }}>
                <Users size={38} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
                <p>No students enrolled in this batch yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: My Students */}
        {activeTab === "students" && (
          <div className="hunar-card" style={{ padding: "32px" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "20px" }}>
              Enrolled Student Roster
            </h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--color-border)", color: "var(--color-text-muted)" }}>
                    <th style={{ padding: "12px 14px" }}>Student ID</th>
                    <th style={{ padding: "12px 14px" }}>Name</th>
                    <th style={{ padding: "12px 14px" }}>Program</th>
                    <th style={{ padding: "12px 14px" }}>Batch</th>
                    <th style={{ padding: "12px 14px" }}>Contact</th>
                    <th style={{ padding: "12px 14px" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.studentId} style={{ borderBottom: "1px solid var(--color-border)" }}>
                      <td style={{ padding: "14px", fontFamily: "monospace", fontWeight: "600", color: "var(--color-brand-text)" }}>
                        {s.studentId}
                      </td>
                      <td style={{ padding: "14px", fontWeight: "600" }}>{s.name}</td>
                      <td style={{ padding: "14px", color: "var(--color-text-secondary)" }}>{s.course}</td>
                      <td style={{ padding: "14px", color: "var(--color-text-secondary)" }}>{s.batch}</td>
                      <td style={{ padding: "14px", color: "var(--color-text-muted)" }}>{s.phone}</td>
                      <td style={{ padding: "14px" }}>
                        <span style={{
                          display: "inline-block",
                          padding: "3px 8px",
                          borderRadius: "9999px",
                          fontSize: "0.75rem",
                          fontWeight: "700",
                          textTransform: "uppercase",
                          backgroundColor: s.enrollmentStatus === "active" ? "rgba(34, 197, 94, 0.12)" : "rgba(239, 219, 25, 0.12)",
                          color: s.enrollmentStatus === "active" ? "var(--color-success)" : "var(--color-brand-text)"
                        }}>
                          {s.enrollmentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Assignments */}
        {activeTab === "assignments" && (
          <div className="hunar-card" style={{ padding: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "4px" }}>
                  Workstation Assignments & Practicals
                </h3>
                <p style={{ fontSize: "0.88rem", color: "var(--color-text-secondary)" }}>
                  Create and manage hands-on assignments for your batches.
                </p>
              </div>

              <button onClick={() => setShowNewAssignModal(true)} disabled={assignedBatches.length === 0} className="btn btn-primary btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <Plus size={16} />
                <span>Create Assignment</span>
              </button>
            </div>

            {assignSuccess && (
              <div style={{
                background: "rgba(34, 197, 94, 0.1)",
                border: "1px solid var(--color-success)",
                color: "var(--color-success)",
                padding: "12px",
                borderRadius: "var(--radius-md)",
                marginBottom: "20px",
                fontSize: "0.85rem"
              }}>
                {assignSuccess}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {assignments.map((a) => (
                <div key={a._id || a.id} style={{
                  padding: "20px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--color-surface-secondary)",
                  border: "1px solid var(--color-border)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <strong style={{ fontSize: "1.05rem" }}>{a.title}</strong>
                    <span style={{ fontSize: "0.8rem", color: "var(--color-brand-text)", fontWeight: "600" }}>{a.batch}</span>
                  </div>
                  <p style={{ fontSize: "0.88rem", color: "var(--color-text-secondary)", lineHeight: "1.5", margin: 0 }}>
                    {a.description}
                  </p>
                  <div style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", marginTop: "10px" }}>
                    Deadline: {new Date(a.deadline).toLocaleDateString()} · Max Marks: {a.maxMarks || 100}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal */}
            {showNewAssignModal && (
              <div style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 100,
                padding: "20px"
              }}>
                <div className="hunar-card" style={{ maxWidth: "500px", width: "100%", padding: "30px" }}>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "16px" }}>New Assignment</h3>
                  <form onSubmit={handleCreateAssignment}>
                    <div className="form-group">
                      <label className="form-label">Assignment Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Build Responsive Landing Page"
                        className="form-input"
                        value={newAssignTitle}
                        onChange={(e) => setNewAssignTitle(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Batch</label>
                      <select
                        className="form-select"
                        required
                        disabled={assignedBatches.length === 0}
                        value={newAssignBatch}
                        onChange={(e) => setNewAssignBatch(e.target.value)}
                      >
                        {assignedBatches.map((b) => (
                          <option key={b._id || b.id} value={b.name}>{b.name}</option>
                        ))}
                      </select>
                      {assignedBatches.length === 0 && (
                        <p role="alert" style={{ color: "var(--color-danger)", fontSize: "0.82rem" }}>
                          No batches are assigned to your account. Contact an administrator before creating an assignment.
                        </p>
                      )}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Instructions / Details</label>
                      <textarea
                        required
                        rows="3"
                        placeholder="Specify requirements, repository deliverables, etc."
                        className="form-textarea"
                        value={newAssignDesc}
                        onChange={(e) => setNewAssignDesc(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Submission Deadline</label>
                      <input
                        type="date"
                        required
                        className="form-input"
                        value={newAssignDeadline}
                        onChange={(e) => setNewAssignDeadline(e.target.value)}
                      />
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                      <button type="button" onClick={() => setShowNewAssignModal(false)} className="btn btn-outline">
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Publish Assignment
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Announcements */}
        {activeTab === "announcements" && (
          <div className="hunar-card" style={{ padding: "32px", maxWidth: "650px" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "6px" }}>
              Publish Announcement
            </h3>
            <p style={{ fontSize: "0.88rem", color: "var(--color-text-secondary)", marginBottom: "20px" }}>
              Post notices to students enrolled in your workstation batches.
            </p>

            {annSuccess && (
              <div style={{
                background: "rgba(34, 197, 94, 0.1)",
                border: "1px solid var(--color-success)",
                color: "var(--color-success)",
                padding: "12px",
                borderRadius: "var(--radius-md)",
                marginBottom: "20px",
                fontSize: "0.85rem"
              }}>
                {annSuccess}
              </div>
            )}

            <form onSubmit={handlePostAnnouncement}>
              <div className="form-group">
                <label className="form-label">Notice Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Saturday Special AI Workstation Lab"
                  className="form-input"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Audience</label>
                <select
                  className="form-select"
                  value={annAudience}
                  onChange={(e) => setAnnAudience(e.target.value)}
                >
                  <option value="students">Students Only</option>
                  <option value="all">Institute-Wide (All)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Announcement Content</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Type message content here..."
                  className="form-textarea"
                  value={annMsg}
                  onChange={(e) => setAnnMsg(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Publish Announcement
              </button>
            </form>
          </div>
        )}

        {/* Tab 6: Profile */}
        {activeTab === "profile" && (
          <div className="hunar-card" style={{ padding: "32px", maxWidth: "680px" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "20px" }}>
              Verified Faculty Profile
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", fontSize: "0.9rem" }}>
              <div>
                <span style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", display: "block" }}>Full Name</span>
                <strong>{profile.name}</strong>
              </div>
              <div>
                <span style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", display: "block" }}>Faculty ID</span>
                <strong style={{ color: "var(--color-brand-text)", fontFamily: "monospace" }}>{profile.staffId || "HUN-T-0002"}</strong>
              </div>
              <div>
                <span style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", display: "block" }}>Designation</span>
                <strong>{profile.designation}</strong>
              </div>
              <div>
                <span style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", display: "block" }}>Department</span>
                <strong>{profile.department}</strong>
              </div>
              <div>
                <span style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", display: "block" }}>Institutional Email</span>
                <strong>{profile.email}</strong>
              </div>
              <div>
                <span style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", display: "block" }}>Campus Location</span>
                <strong>Mullanpur Dakha, Ludhiana</strong>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
