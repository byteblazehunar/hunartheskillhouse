import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  LogOut,
  Bell,
  User,
  ShieldCheck,
  Send,
  AlertCircle
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import usePortalTab from "../hooks/usePortalTab";

const STUDENT_PORTAL_TABS = ["overview", "attendance", "assignments", "announcements", "profile"];

export default function StudentPortal() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [portalData, setPortalData] = useState(null);
  const [activeTab, setActiveTab] = usePortalTab(STUDENT_PORTAL_TABS);

  // Assignment submission state
  const [submittingAssignmentId, setSubmittingAssignmentId] = useState(null);
  const [submissionContent, setSubmissionContent] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [submitError, setSubmitError] = useState("");

  const logoSrc = theme === "light" ? "/assets/LOGO BG - HUNAR.png" : "/assets/LOGO BG 2- HUNAR.png";

  useEffect(() => {
    const token = localStorage.getItem("hunar_token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch("/api/portal/student", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          const error = new Error(data.message || "Unable to load your student portal.");
          error.status = res.status;
          throw error;
        }
        return data;
      })
      .then((data) => {
        if (data.success) {
          setPortalData(data);
        } else {
          throw new Error(data.message);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Portal error:", err);
        if (err.status === 401 || err.status === 403) {
          localStorage.removeItem("hunar_token");
          localStorage.removeItem("hunar_user");
          navigate("/login", { replace: true });
          return;
        }
        setLoadError(err.message || "Unable to connect to the backend.");
        setLoading(false);
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("hunar_token");
    localStorage.removeItem("hunar_user");
    navigate("/login");
  };

  const handleSubmitAssignment = async (assignmentId) => {
    setSubmitError("");
    setSubmitSuccess("");
    const token = localStorage.getItem("hunar_token");

    if (!submissionContent.trim()) {
      setSubmitError("Please enter your project repository URL or submission text.");
      return;
    }

    try {
      const res = await fetch(`/api/assignments/${assignmentId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: submissionContent })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSubmitSuccess("Assignment submitted successfully to your instructor!");
      setSubmissionContent("");
      setSubmittingAssignmentId(null);

      // Refresh portal data
      const refreshRes = await fetch("/api/portal/student", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const refreshData = await refreshRes.json();
      if (refreshData.success) setPortalData(refreshData);
    } catch (err) {
      setSubmitError(err.message || "Failed to submit assignment.");
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
          Authenticating Student Workspace...
        </p>
      </div>
    );
  }

  if (loadError || !portalData) {
    return (
      <div className="container" style={{ minHeight: "60vh", display: "grid", placeContent: "center", gap: "16px" }}>
        <p role="alert" style={{ color: "var(--color-danger)" }}>{loadError || "Student data is unavailable."}</p>
        <button className="btn btn-outline" onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  const { profile, attendance, assignments, announcements } = portalData;

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
              Student Portal
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ textAlign: "right", display: "none", sm: "block" }}>
              <div style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--color-text-primary)" }}>
                {profile.name}
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--color-brand-text)", fontFamily: "monospace", fontWeight: "600" }}>
                {profile.studentId}
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
                  ACADEMIC YEAR 2026 · MULLANPUR DAKHA
                </span>
              </div>
              <h1 style={{ fontSize: "clamp(1.6rem, 2.8vw, 2.2rem)", fontWeight: "700", marginBottom: "8px" }}>
                Welcome, {profile.name}
              </h1>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem", maxWidth: "600px" }}>
                Enrolled in <strong>{profile.course}</strong> ({profile.batch}). Instructor: <strong>{profile.assignedTeacher}</strong>.
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
                Permanent Student ID
              </span>
              <span style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--color-text-primary)", fontFamily: "monospace" }}>
                {profile.studentId}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div role="tablist" aria-label="Student portal pages" style={{
          display: "flex",
          gap: "8px",
          borderBottom: "1px solid var(--color-border)",
          marginBottom: "28px",
          overflowX: "auto",
          paddingBottom: "4px"
        }}>
          {[
            { id: "overview", label: "Dashboard", icon: GraduationCap },
            { id: "attendance", label: `Attendance (${attendance.percentage}%)`, icon: CheckCircle2 },
            { id: "assignments", label: `Assignments (${assignments.length})`, icon: FileText },
            { id: "announcements", label: `Notices (${announcements.length})`, icon: Bell },
            { id: "profile", label: "Academic Profile", icon: User }
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

        {/* Tab Content 1: Overview */}
        {activeTab === "overview" && (
          <div>
            {/* Metric Cards */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px",
              marginBottom: "32px"
            }}>
              <div className="hunar-card" style={{ padding: "24px" }}>
                <div style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", marginBottom: "8px" }}>
                  Attendance Rate
                </div>
                <div style={{ fontSize: "2rem", fontWeight: "700", color: attendance.percentage >= 75 ? "var(--color-success)" : "var(--color-danger)" }}>
                  {attendance.percentage}%
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                  {attendance.presentClasses} of {attendance.totalClasses} classes attended
                </div>
              </div>

              <div className="hunar-card" style={{ padding: "24px" }}>
                <div style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", marginBottom: "8px" }}>
                  Active Assignments
                </div>
                <div style={{ fontSize: "2rem", fontWeight: "700", color: "var(--color-text-primary)" }}>
                  {assignments.length}
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                  Practical workstation labs
                </div>
              </div>

              <div className="hunar-card" style={{ padding: "24px" }}>
                <div style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", marginBottom: "8px" }}>
                  Assigned Batch
                </div>
                <div style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--color-brand-text)", lineHeight: "1.4" }}>
                  {profile.batch}
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                  Morning Batch (10 AM - 1 PM)
                </div>
              </div>

              <div className="hunar-card" style={{ padding: "24px" }}>
                <div style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", marginBottom: "8px" }}>
                  Account Status
                </div>
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 10px",
                  borderRadius: "9999px",
                  backgroundColor: "rgba(34, 197, 94, 0.12)",
                  color: "var(--color-success)",
                  fontSize: "0.85rem",
                  fontWeight: "700",
                  marginTop: "6px"
                }}>
                  <CheckCircle2 size={14} />
                  <span>Enrolled & Active</span>
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", marginTop: "8px" }}>
                  Mullanpur Campus Lab
                </div>
              </div>
            </div>

            {/* Timetable & Upcoming Tasks Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "28px" }}>
              {/* Daily Timetable */}
              <div className="hunar-card" style={{ padding: "28px" }}>
                <h3 style={{ fontSize: "1.15rem", fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Calendar size={18} color="var(--color-brand)" />
                  <span>Today's Workstation Schedule</span>
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{
                    padding: "14px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--color-surface-secondary)",
                    border: "1px solid var(--color-border)"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <strong style={{ fontSize: "0.95rem" }}>{profile.course}</strong>
                      <span style={{ fontSize: "0.8rem", color: "var(--color-brand-text)", fontWeight: "600" }}>10:00 AM - 1:00 PM</span>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", margin: 0 }}>
                      Instructor: {profile.assignedTeacher} · Lab Workstation #4
                    </p>
                  </div>
                </div>
              </div>

              {/* Latest Notice */}
              <div className="hunar-card" style={{ padding: "28px" }}>
                <h3 style={{ fontSize: "1.15rem", fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Bell size={18} color="var(--color-brand)" />
                  <span>Latest Institute Announcement</span>
                </h3>
                {announcements.length > 0 ? (
                  <div style={{
                    padding: "16px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "rgba(239, 219, 25, 0.08)",
                    border: "1px solid var(--color-brand-border)"
                  }}>
                    <div style={{ fontWeight: "700", fontSize: "0.95rem", marginBottom: "6px" }}>
                      {announcements[0].title}
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", lineHeight: "1.6", margin: 0 }}>
                      {announcements[0].message}
                    </p>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "10px" }}>
                      By {announcements[0].authorName} ({announcements[0].authorRole})
                    </div>
                  </div>
                ) : (
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>No active notices at this time.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 2: Attendance */}
        {activeTab === "attendance" && (
          <div className="hunar-card" style={{ padding: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "4px" }}>
                  Class Attendance Record
                </h3>
                <p style={{ fontSize: "0.88rem", color: "var(--color-text-secondary)" }}>
                  Verified lab attendance recorded by instructors at Hunar The Skill House.
                </p>
              </div>

              <div style={{
                padding: "8px 16px",
                borderRadius: "9999px",
                backgroundColor: attendance.percentage >= 75 ? "rgba(34, 197, 94, 0.12)" : "rgba(239, 68, 68, 0.12)",
                color: attendance.percentage >= 75 ? "var(--color-success)" : "var(--color-danger)",
                fontWeight: "700",
                fontSize: "0.9rem"
              }}>
                Overall Rate: {attendance.percentage}%
              </div>
            </div>

            {attendance.recent && attendance.recent.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--color-border)", color: "var(--color-text-muted)" }}>
                      <th style={{ padding: "12px 14px" }}>Date</th>
                      <th style={{ padding: "12px 14px" }}>Batch</th>
                      <th style={{ padding: "12px 14px" }}>Status</th>
                      <th style={{ padding: "12px 14px" }}>Verified By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.recent.map((rec, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid var(--color-border)" }}>
                        <td style={{ padding: "14px", fontWeight: "600" }}>{rec.date}</td>
                        <td style={{ padding: "14px", color: "var(--color-text-secondary)" }}>{rec.batch}</td>
                        <td style={{ padding: "14px" }}>
                          <span style={{
                            display: "inline-block",
                            padding: "4px 10px",
                            borderRadius: "9999px",
                            fontSize: "0.78rem",
                            fontWeight: "700",
                            textTransform: "uppercase",
                            backgroundColor:
                              rec.status === "present"
                                ? "rgba(34, 197, 94, 0.12)"
                                : rec.status === "late"
                                ? "rgba(234, 179, 8, 0.12)"
                                : "rgba(239, 68, 68, 0.12)",
                            color:
                              rec.status === "present"
                                ? "var(--color-success)"
                                : rec.status === "late"
                                ? "#EAB308"
                                : "var(--color-danger)"
                          }}>
                            {rec.status}
                          </span>
                        </td>
                        <td style={{ padding: "14px", color: "var(--color-text-muted)" }}>{rec.markedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--color-text-muted)" }}>
                <Clock size={38} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
                <p>No attendance has been recorded for your batch yet. Classes start this week.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab Content 3: Assignments */}
        {activeTab === "assignments" && (
          <div className="hunar-card" style={{ padding: "32px" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "6px" }}>
              Practical Assignments & Projects
            </h3>
            <p style={{ fontSize: "0.88rem", color: "var(--color-text-secondary)", marginBottom: "24px" }}>
              Submit your project repository URLs or live campaign links below for mentor review.
            </p>

            {submitSuccess && (
              <div style={{
                background: "rgba(34, 197, 94, 0.1)",
                border: "1px solid var(--color-success)",
                color: "var(--color-success)",
                padding: "12px",
                borderRadius: "var(--radius-md)",
                marginBottom: "16px",
                fontSize: "0.85rem"
              }}>
                {submitSuccess}
              </div>
            )}

            {submitError && (
              <div style={{
                background: "rgba(220, 38, 38, 0.1)",
                border: "1px solid var(--color-danger)",
                color: "var(--color-danger)",
                padding: "12px",
                borderRadius: "var(--radius-md)",
                marginBottom: "16px",
                fontSize: "0.85rem"
              }}>
                {submitError}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {assignments.map((assign) => (
                <div
                  key={assign._id || assign.id}
                  style={{
                    padding: "24px",
                    borderRadius: "var(--radius-lg)",
                    backgroundColor: "var(--color-surface-secondary)",
                    border: "1px solid var(--color-border)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "10px" }}>
                    <h4 style={{ fontSize: "1.1rem", fontWeight: "700" }}>{assign.title}</h4>
                    <span style={{
                      padding: "4px 10px",
                      borderRadius: "9999px",
                      fontSize: "0.78rem",
                      fontWeight: "700",
                      backgroundColor: assign.submissionStatus === "submitted" ? "rgba(34, 197, 94, 0.12)" : "rgba(239, 219, 25, 0.12)",
                      color: assign.submissionStatus === "submitted" ? "var(--color-success)" : "var(--color-brand-text)"
                    }}>
                      {assign.submissionStatus === "submitted" ? "Submitted" : "Pending Submission"}
                    </span>
                  </div>

                  <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", lineHeight: "1.6", marginBottom: "16px" }}>
                    {assign.description}
                  </p>

                  <div style={{ display: "flex", gap: "18px", fontSize: "0.82rem", color: "var(--color-text-muted)", marginBottom: "16px", flexWrap: "wrap" }}>
                    <span>Deadline: <strong>{new Date(assign.deadline).toLocaleDateString()}</strong></span>
                    <span>Max Marks: <strong>{assign.maxMarks || 100}</strong></span>
                    <span>Instructor: <strong>{assign.assignedBy || "Paramjit Singh"}</strong></span>
                  </div>

                  {/* Submission Form / Status */}
                  {assign.submissionStatus === "submitted" ? (
                    <div style={{
                      padding: "12px 16px",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      fontSize: "0.85rem"
                    }}>
                      <div style={{ color: "var(--color-success)", fontWeight: "600", marginBottom: "4px" }}>
                        ✓ Your work has been submitted and is under instructor review.
                      </div>
                      {assign.marks !== null && (
                        <div style={{ color: "var(--color-text-primary)", fontWeight: "700" }}>
                          Score: {assign.marks} / {assign.maxMarks}
                        </div>
                      )}
                      {assign.feedback && (
                        <div style={{ color: "var(--color-text-secondary)", marginTop: "4px" }}>
                          Feedback: "{assign.feedback}"
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      {submittingAssignmentId === (assign._id || assign.id) ? (
                        <div style={{ marginTop: "12px" }}>
                          <textarea
                            placeholder="Paste your GitHub repository URL, campaign dashboard link, or project notes..."
                            className="form-textarea"
                            rows="3"
                            value={submissionContent}
                            onChange={(e) => setSubmissionContent(e.target.value)}
                            style={{ marginBottom: "10px" }}
                          />
                          <div style={{ display: "flex", gap: "10px" }}>
                            <button
                              onClick={() => handleSubmitAssignment(assign._id || assign.id)}
                              className="btn btn-primary btn-sm"
                              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                            >
                              <Send size={14} />
                              <span>Submit for Review</span>
                            </button>
                            <button
                              onClick={() => setSubmittingAssignmentId(null)}
                              className="btn btn-outline btn-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSubmittingAssignmentId(assign._id || assign.id);
                            setSubmissionContent("");
                          }}
                          className="btn btn-primary btn-sm"
                        >
                          Submit Assignment Now →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content 4: Announcements */}
        {activeTab === "announcements" && (
          <div className="hunar-card" style={{ padding: "32px" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "20px" }}>
              Official Institute Notices
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {announcements.map((ann, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "20px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--color-surface-secondary)",
                    border: "1px solid var(--color-border)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <h4 style={{ fontSize: "1rem", fontWeight: "700" }}>{ann.title}</h4>
                    <span style={{ fontSize: "0.78rem", color: "var(--color-text-muted)" }}>
                      {new Date(ann.publishDate).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", lineHeight: "1.6", margin: 0 }}>
                    {ann.message}
                  </p>
                  <div style={{ fontSize: "0.76rem", color: "var(--color-brand-text)", marginTop: "12px", fontWeight: "600" }}>
                    Issued by: {ann.authorName} · {ann.authorRole}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content 5: Profile */}
        {activeTab === "profile" && (
          <div className="hunar-card" style={{ padding: "32px", maxWidth: "680px" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "6px" }}>
              Verified Academic Profile
            </h3>
            <p style={{ fontSize: "0.88rem", color: "var(--color-text-secondary)", marginBottom: "24px" }}>
              Institutional record registered with Hunar The Skill House, Mullanpur Dakha.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", fontSize: "0.9rem" }}>
              <div>
                <span style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", display: "block" }}>Full Name</span>
                <strong style={{ color: "var(--color-text-primary)" }}>{profile.name}</strong>
              </div>
              <div>
                <span style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", display: "block" }}>Student ID</span>
                <strong style={{ color: "var(--color-brand-text)", fontFamily: "monospace" }}>{profile.studentId}</strong>
              </div>
              <div>
                <span style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", display: "block" }}>Enrolled Program</span>
                <strong>{profile.course}</strong>
              </div>
              <div>
                <span style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", display: "block" }}>Assigned Batch</span>
                <strong>{profile.batch}</strong>
              </div>
              <div>
                <span style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", display: "block" }}>Registered Email</span>
                <strong>{profile.email}</strong>
              </div>
              <div>
                <span style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", display: "block" }}>Phone Number</span>
                <strong>{profile.phone}</strong>
              </div>
              <div>
                <span style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", display: "block" }}>Lead Instructor</span>
                <strong>{profile.assignedTeacher}</strong>
              </div>
              <div>
                <span style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", display: "block" }}>Campus Location</span>
                <strong>Mullanpur Dakha, Ludhiana</strong>
              </div>
            </div>

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginTop: "28px",
              padding: "12px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "rgba(239, 219, 25, 0.08)",
              border: "1px solid var(--color-brand-border)",
              fontSize: "0.8rem",
              color: "var(--color-text-secondary)"
            }}>
              <ShieldCheck size={16} color="var(--color-brand)" />
              <span>Official academic records are protected by institute policy and cannot be edited by students.</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
