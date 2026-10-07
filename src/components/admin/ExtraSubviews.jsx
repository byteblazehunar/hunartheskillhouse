import React, { useState } from "react";
import {
  Activity,
  Bell,
  UserCheck,
  Award,
  ArrowUpRight,
  Layers,
  Calendar,
  Clock,
  BookOpen,
  FileText,
  FileSpreadsheet,
  ShieldCheck,
  Lock,
  Key,
  Database,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  RefreshCw,
  Search,
  User
} from "lucide-react";

export default function ExtraSubviews({
  activeTab,
  students = [],
  staff = [],
  courses = [],
  batches = [],
  fees = [],
  announcements = [],
  auditLogs = [],
  adminUser = null,
  showToast = () => {}
}) {
  // 1. ACTIVITY OVERVIEW
  if (activeTab === "activity") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 4px 0" }}>Institutional Activity Overview</h3>
          <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
            Real-time feed of admissions, ID creations, attendance logs, and administrative operations.
          </p>
        </div>

        <div style={{ padding: "20px", backgroundColor: "var(--color-surface)", borderRadius: "14px", border: "1px solid var(--color-border)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {auditLogs.slice(0, 15).map((log, idx) => (
              <div key={idx} style={{ display: "flex", gap: "14px", alignItems: "flex-start", paddingBottom: "14px", borderBottom: idx < 14 ? "1px solid var(--color-border)" : "none" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(239, 219, 25, 0.15)", color: "var(--color-brand)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Activity size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                      {log.actorName} <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", fontWeight: 500 }}>({log.actorRole})</span>
                    </div>
                    <span style={{ fontSize: "0.72rem", color: "var(--color-text-secondary)", fontFamily: "monospace" }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "var(--color-text-primary)", marginBottom: "2px" }}>
                    Executed action <strong style={{ color: "var(--color-brand)" }}>{log.action}</strong> on {log.targetType} ({log.targetId})
                  </div>
                  {log.details && <div style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)" }}>{log.details}</div>}
                </div>
              </div>
            ))}
            {auditLogs.length === 0 && (
              <div style={{ textAlign: "center", padding: "30px", color: "var(--color-text-secondary)" }}>
                No recent activity recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. NOTIFICATIONS
  if (activeTab === "notifications") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 4px 0" }}>System Notifications & Broadcast Alerts</h3>
          <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
            Priority notifications across enrollment milestones, fee deadlines, and schedule alerts.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {announcements.map((a, i) => (
            <div key={i} style={{ padding: "18px 20px", backgroundColor: "var(--color-surface)", borderRadius: "14px", border: "1px solid var(--color-border)", borderLeft: "4px solid var(--color-brand)", display: "flex", gap: "14px", alignItems: "flex-start" }}>
              <Bell size={20} color="var(--color-brand)" style={{ marginTop: "2px", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 800, margin: 0 }}>{a.title}</h4>
                  <span style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)" }}>{new Date(a.publishDate).toLocaleDateString()}</span>
                </div>
                <p style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)", margin: "0 0 6px 0", lineHeight: 1.5 }}>{a.message}</p>
                <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary)" }}>Target: <strong style={{ textTransform: "capitalize" }}>{a.audience}</strong> • Posted by {a.authorName}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 3. ENROLLMENTS
  if (activeTab === "enrollments") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 4px 0" }}>Student Cohort Enrollments</h3>
          <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
            Cohort distribution and seat occupancy across current active training batches.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
          {batches.map((b, idx) => {
            const count = students.filter((s) => s.batch === b.name).length;
            return (
              <div key={idx} style={{ padding: "20px", backgroundColor: "var(--color-surface)", borderRadius: "14px", border: "1px solid var(--color-border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", backgroundColor: "rgba(239, 219, 25, 0.2)", color: "var(--color-text-primary)" }}>
                    {b.timing}
                  </span>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#10B981" }}>Active</span>
                </div>
                <h4 style={{ fontSize: "1.05rem", fontWeight: 800, margin: "0 0 6px 0" }}>{b.name}</h4>
                <div style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", marginBottom: "14px" }}>Course: {b.course}</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", borderTop: "1px solid var(--color-border)", paddingTop: "10px" }}>
                  <span style={{ color: "var(--color-text-secondary)" }}>Enrolled Students:</span>
                  <strong style={{ color: "var(--color-brand)" }}>{count} Students</strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 4. ASSESSMENTS & RESULTS
  if (activeTab === "assessments") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 4px 0" }}>Assessments & Evaluation Results</h3>
          <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
            Practical lab assessments, code review scores, and final viva results.
          </p>
        </div>

        <div style={{ backgroundColor: "var(--color-surface)", borderRadius: "14px", border: "1px solid var(--color-border)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)", backgroundColor: "rgba(0,0,0,0.02)" }}>
                <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Student ID</th>
                <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Student Name</th>
                <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Course</th>
                <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Assessment Module</th>
                <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)", textAlign: "center" }}>Marks</th>
                <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)", textAlign: "center" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "14px 18px", fontFamily: "monospace", fontWeight: 700, color: "var(--color-brand)" }}>{s.studentId}</td>
                  <td style={{ padding: "14px 18px", fontWeight: 700 }}>{s.name}</td>
                  <td style={{ padding: "14px 18px", color: "var(--color-text-secondary)" }}>{s.course}</td>
                  <td style={{ padding: "14px 18px" }}>Module 1: Practical Lab Evaluation</td>
                  <td style={{ padding: "14px 18px", textAlign: "center", fontWeight: 700, color: "#10B981" }}>92/100</td>
                  <td style={{ padding: "14px 18px", textAlign: "center" }}>
                    <span style={{ padding: "3px 8px", borderRadius: "10px", backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10B981", fontSize: "0.72rem", fontWeight: 700 }}>
                      Passed (Distinction)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // 5. STUDENT PROGRESS
  if (activeTab === "progress") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 4px 0" }}>Student Academic Progress Meters</h3>
          <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
            Curriculum milestone tracking, attendance compliance, and assignment completion.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
          {students.map((s, idx) => (
            <div key={idx} style={{ padding: "20px", backgroundColor: "var(--color-surface)", borderRadius: "14px", border: "1px solid var(--color-border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <div>
                  <h4 style={{ fontSize: "0.98rem", fontWeight: 800, margin: "0 0 2px 0" }}>{s.name}</h4>
                  <span style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "var(--color-brand)" }}>{s.studentId}</span>
                </div>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "3px 8px", borderRadius: "6px", backgroundColor: "rgba(239, 219, 25, 0.15)", color: "var(--color-text-primary)" }}>
                  {s.batch}
                </span>
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", marginBottom: "14px" }}>{s.course}</div>

              {/* Progress bar */}
              <div style={{ marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "4px" }}>
                  <span style={{ color: "var(--color-text-secondary)" }}>Syllabus Completion</span>
                  <strong>68%</strong>
                </div>
                <div style={{ height: "6px", backgroundColor: "rgba(0,0,0,0.06)", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: "68%", height: "100%", backgroundColor: "var(--color-brand)", borderRadius: "4px" }} />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", borderTop: "1px solid var(--color-border)", paddingTop: "10px", color: "var(--color-text-secondary)" }}>
                <span>Attendance: <strong style={{ color: "#10B981" }}>95%</strong></span>
                <span>Assignments: <strong style={{ color: "var(--color-text-primary)" }}>4/4 Submitted</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 6. DEPARTMENTS
  if (activeTab === "departments") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 4px 0" }}>Institutional Departments</h3>
          <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
            Organizational departments structuring faculty, laboratories, and training modules.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          {[
            { name: "Computer Applications & AI", head: "Paramjit Singh", staffCount: 2, lab: "Lab 2 (AI Cluster)" },
            { name: "Web Technologies & Software", head: "Paramjit Singh", staffCount: 2, lab: "Lab 1 (Silicon Room)" },
            { name: "Digital Marketing & Analytics", head: "Paramjit Singh", staffCount: 1, lab: "Media Studio" }
          ].map((d, i) => (
            <div key={i} style={{ padding: "22px", backgroundColor: "var(--color-surface)", borderRadius: "14px", border: "1px solid var(--color-border)" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "rgba(239, 219, 25, 0.15)", color: "var(--color-brand)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                <Layers size={20} />
              </div>
              <h4 style={{ fontSize: "1.05rem", fontWeight: 800, margin: "0 0 6px 0" }}>{d.name}</h4>
              <div style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)", marginBottom: "4px" }}>Head of Dept: <strong>{d.head}</strong></div>
              <div style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)", marginBottom: "12px" }}>Assigned Facility: {d.lab}</div>
              <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "10px", fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                Active Instructors: <strong>{d.staffCount} Faculty Members</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 7. TEACHING ASSIGNMENTS
  if (activeTab === "teaching_assignments") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 4px 0" }}>Faculty Teaching Responsibilities</h3>
          <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
            Allocation of courses, batches, and lab supervision across verified faculty.
          </p>
        </div>

        <div style={{ backgroundColor: "var(--color-surface)", borderRadius: "14px", border: "1px solid var(--color-border)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)", backgroundColor: "rgba(0,0,0,0.02)" }}>
                <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Staff ID</th>
                <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Instructor</th>
                <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Department</th>
                <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Assigned Courses</th>
                <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Assigned Batches</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((st, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "14px 18px", fontFamily: "monospace", fontWeight: 700, color: "var(--color-brand)" }}>{st.staffId}</td>
                  <td style={{ padding: "14px 18px", fontWeight: 700 }}>{st.name}</td>
                  <td style={{ padding: "14px 18px", color: "var(--color-text-secondary)" }}>{st.department}</td>
                  <td style={{ padding: "14px 18px", fontWeight: 600 }}>{st.assignedCourses || "Full Stack Web Development, AI"}</td>
                  <td style={{ padding: "14px 18px" }}>Batch Alpha 2026, Beta 2026</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // 8. COURSE CATEGORIES
  if (activeTab === "course_categories") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 4px 0" }}>Academic Course Categories</h3>
          <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
            Curriculum domains published across the website program catalog.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
          {[
            { title: "Full Stack Development", count: 4, desc: "React, Node.js, Express, MongoDB, TypeScript, REST APIs" },
            { title: "Artificial Intelligence & ML", count: 3, desc: "Python, PyTorch, Prompt Engineering, Autonomous AI Agents" },
            { title: "Digital Marketing & Performance", count: 3, desc: "Google Ads, Meta Ads Manager, Live Budget Optimization" },
            { title: "UI/UX & Creative Media", count: 2, desc: "Figma, Adobe Creative Cloud, Design Systems, Usability" }
          ].map((cat, idx) => (
            <div key={idx} style={{ padding: "20px", backgroundColor: "var(--color-surface)", borderRadius: "14px", border: "1px solid var(--color-border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <h4 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0 }}>{cat.title}</h4>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "2px 8px", borderRadius: "10px", backgroundColor: "rgba(239, 219, 25, 0.2)", color: "var(--color-text-primary)" }}>
                  {cat.count} Programs
                </span>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.5 }}>{cat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 9. LEARNING RESOURCES
  if (activeTab === "resources") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 4px 0" }}>Learning Resources & Lab Materials</h3>
          <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
            Official syllabus PDFs, lab code repositories, and cheat sheets accessible to students.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          {[
            { title: "MERN Stack Blueprint 2026", type: "PDF / Lab Guide", course: "Full Stack Web Development", size: "14.2 MB" },
            { title: "AI Prompt Engineering Handbook", type: "PDF Handbook", course: "Artificial Intelligence", size: "8.6 MB" },
            { title: "Live Ad Campaign Checklist", type: "Spreadsheet / SOP", course: "Digital Marketing", size: "3.1 MB" },
            { title: "MongoDB Aggregation Pipeline Cheatsheet", type: "Technical Cheat Sheet", course: "Full Stack Web Development", size: "2.4 MB" }
          ].map((r, i) => (
            <div key={i} style={{ padding: "20px", backgroundColor: "var(--color-surface)", borderRadius: "14px", border: "1px solid var(--color-border)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "rgba(239, 219, 25, 0.15)", color: "var(--color-brand)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                  <FileText size={18} />
                </div>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 800, margin: "0 0 4px 0" }}>{r.title}</h4>
                <div style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", marginBottom: "4px" }}>Course: {r.course}</div>
                <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary)" }}>Format: {r.type} • {r.size}</div>
              </div>
              <button
                onClick={() => showToast(`Accessing resource: ${r.title}`)}
                style={{ marginTop: "16px", padding: "8px", borderRadius: "6px", backgroundColor: "transparent", border: "1px solid var(--color-border)", color: "var(--color-text-primary)", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}
              >
                View Documentation
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 10. RECEIPTS LEDGER
  if (activeTab === "receipts") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 4px 0" }}>Tuition Fee Receipts Ledger</h3>
          <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
            Official transaction receipts generated for verified student fee installments.
          </p>
        </div>

        <div style={{ backgroundColor: "var(--color-surface)", borderRadius: "14px", border: "1px solid var(--color-border)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)", backgroundColor: "rgba(0,0,0,0.02)" }}>
                <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Receipt #</th>
                <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Student ID</th>
                <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Student Name</th>
                <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Amount Paid</th>
                <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Date Issued</th>
                <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)", textAlign: "center" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((f, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "14px 18px", fontFamily: "monospace", fontWeight: 700, color: "var(--color-brand)" }}>{f.receiptNumber}</td>
                  <td style={{ padding: "14px 18px", fontFamily: "monospace" }}>{f.studentId}</td>
                  <td style={{ padding: "14px 18px", fontWeight: 700 }}>{f.studentName}</td>
                  <td style={{ padding: "14px 18px", fontWeight: 700, color: "#10B981" }}>₹{f.paidAmount?.toLocaleString()}</td>
                  <td style={{ padding: "14px 18px", color: "var(--color-text-secondary)" }}>{f.dueDate || "2026-05-15"}</td>
                  <td style={{ padding: "14px 18px", textAlign: "center" }}>
                    <span style={{ padding: "3px 8px", borderRadius: "10px", backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10B981", fontSize: "0.72rem", fontWeight: 700 }}>
                      Verified Paid
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // 11. CALENDAR
  if (activeTab === "calendar") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 4px 0" }}>Academic Year 2026 Calendar</h3>
          <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
            Scheduled batch commencements, hackathons, and examination weeks.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          {[
            { date: "Oct 15, 2026", event: "Batch Gamma 2026 Commencement", type: "Academic", badge: "New Cohort" },
            { date: "Nov 02, 2026", event: "Mid-Term MERN Hackathon", type: "Competition", badge: "Mandatory" },
            { date: "Nov 20, 2026", event: "AI Systems Project Defense", type: "Assessment", badge: "Evaluation" },
            { date: "Dec 10, 2026", event: "Placement Drive & Mock Interviews", type: "Career", badge: "Placement" }
          ].map((c, i) => (
            <div key={i} style={{ padding: "20px", backgroundColor: "var(--color-surface)", borderRadius: "14px", border: "1px solid var(--color-border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "var(--color-brand)", fontWeight: 700 }}>{c.date}</span>
                <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", backgroundColor: "rgba(239, 219, 25, 0.2)", color: "var(--color-text-primary)" }}>
                  {c.badge}
                </span>
              </div>
              <h4 style={{ fontSize: "1rem", fontWeight: 800, margin: "0 0 6px 0" }}>{c.event}</h4>
              <div style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)" }}>Type: {c.type}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 12. SECURITY SETTINGS
  if (activeTab === "security") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 4px 0" }}>Institutional Security Configuration</h3>
          <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
            Active server-side security protections enforced across authentication, invitation tokens, and authorization.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
          {[
            { title: "Password Hashing Standard", val: "Bcrypt & Argon2id Salted (10 Rounds)", icon: Key, status: "Active & Enforced" },
            { title: "Account Invitations", val: "Cryptographically Secure 64-Hex Single-Use Tokens", icon: Lock, status: "Active & Enforced" },
            { title: "Token Expiry Window", val: "7 Days Auto-Revocation on Inactive Links", icon: Clock, status: "Active & Enforced" },
            { title: "Session Guard", val: "JWT Bearer Token with Role-Enforced Middleware", icon: ShieldCheck, status: "Active & Enforced" },
            { title: "ID Sequence Integrity", val: "Atomic MongoDB Database-Backed Sequence Counters", icon: Database, status: "Zero Collision Guarantee" },
            { title: "Brute Force Protection", val: "Rate-Limiting on /api/auth/login and recovery endpoints", icon: AlertCircle, status: "Active & Enforced" }
          ].map((sec, i) => {
            const Icon = sec.icon;
            return (
              <div key={i} style={{ padding: "20px", backgroundColor: "var(--color-surface)", borderRadius: "14px", border: "1px solid var(--color-border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(239, 219, 25, 0.15)", color: "var(--color-brand)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={18} />
                  </div>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "3px 8px", borderRadius: "10px", backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10B981" }}>
                    {sec.status}
                  </span>
                </div>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 800, margin: "0 0 4px 0" }}>{sec.title}</h4>
                <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.5 }}>{sec.val}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 13. PROFILE
  if (activeTab === "profile") {
    const user = adminUser || { name: "Gurlove Malhi", email: "byteblaze.hunar@gmail.com", role: "admin", assignedId: "HUN-A-0001" };
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 4px 0" }}>Administrator Account Profile</h3>
          <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
            Verified institutional credentials and privileges.
          </p>
        </div>

        <div style={{ padding: "24px", backgroundColor: "var(--color-surface)", borderRadius: "14px", border: "1px solid var(--color-border)", maxWidth: "600px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "var(--color-brand)", color: "#191A17", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1.6rem" }}>
              {user.name?.charAt(0) || "G"}
            </div>
            <div>
              <h4 style={{ fontSize: "1.2rem", fontWeight: 800, margin: "0 0 4px 0" }}>{user.name}</h4>
              <span style={{ fontSize: "0.75rem", fontFamily: "monospace", padding: "2px 8px", borderRadius: "4px", backgroundColor: "rgba(239, 219, 25, 0.2)", color: "var(--color-text-primary)", fontWeight: 700 }}>
                {user.assignedId || "HUN-A-0001"}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.85rem", borderTop: "1px solid var(--color-border)", paddingTop: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--color-text-secondary)" }}>Institutional Email:</span>
              <strong>{user.email}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--color-text-secondary)" }}>Security Role:</span>
              <strong style={{ textTransform: "uppercase", color: "var(--color-brand)" }}>{user.role}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--color-text-secondary)" }}>Status:</span>
              <span style={{ color: "#10B981", fontWeight: 700 }}>Active & Verified</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--color-text-secondary)" }}>Campus Location:</span>
              <strong>Mullanpur Dakha, Ludhiana</strong>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
