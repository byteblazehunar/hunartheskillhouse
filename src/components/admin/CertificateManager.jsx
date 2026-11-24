import React, { useState } from "react";
import { Award, Copy, Download, Plus, ShieldCheck } from "lucide-react";

function makeCertificateId() {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return `HNR-${new Date().getFullYear()}-${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

export default function CertificateManager({ authToken, students = [], showToast }) {
  const [form, setForm] = useState({ certCode: makeCertificateId(), studentId: "", studentName: "", course: "", batch: "", grade: "A" });
  const [saving, setSaving] = useState(false);
  const [issued, setIssued] = useState(null);

  const updateStudent = (studentId) => {
    const student = students.find((item) => item.studentId === studentId);
    setForm((current) => ({ ...current, studentId, studentName: student?.name || current.studentName, course: student?.course || current.course, batch: student?.batch || current.batch }));
  };

  const issueCertificate = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken || localStorage.getItem("hunar_token")}` },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to issue certificate.");
      setIssued(data.certificate);
      showToast?.("Certificate issued and ready to download.");
      setForm((current) => ({ ...current, certCode: makeCertificateId() }));
    } catch (error) {
      showToast?.(error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const downloadCertificate = () => {
    if (!issued) return;
    const certificate = `<html><head><title>${issued.certCode}</title><style>body{font-family:Arial;padding:64px;text-align:center;color:#111}main{border:8px solid #eddb19;padding:48px}h1{font-size:40px}p{font-size:18px}</style></head><body><main><p>HUNAR — THE SKILL HOUSE</p><h1>Certificate of Completion</h1><p>This certifies that</p><h2>${issued.studentName}</h2><p>has successfully completed ${issued.course}</p><p>Grade: ${issued.grade || "Completion"} · Certificate ID: ${issued.certCode}</p></main></body></html>`;
    const url = URL.createObjectURL(new Blob([certificate], { type: "text/html" }));
    const link = document.createElement("a"); link.href = url; link.download = `${issued.certCode}.html`; link.click(); URL.revokeObjectURL(url);
  };

  return <section style={{ display: "flex", flexDirection: "column", gap: 20 }}>
    <header><span className="badge badge-brand"><ShieldCheck size={14} /> CREDENTIAL REGISTRY</span><h2 style={{ margin: "12px 0 6px" }}>Certificates & report cards</h2><p style={{ color: "var(--color-text-secondary)", margin: 0 }}>Issue a unique UID, download the credential, and publish it to the public verification page.</p></header>
    <form onSubmit={issueCertificate} className="hunar-card" style={{ padding: 24, display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
      <label className="form-group">Student<select className="form-input" value={form.studentId} onChange={(event) => updateStudent(event.target.value)}><option value="">Choose student</option>{students.map((student) => <option key={student.studentId} value={student.studentId}>{student.name} · {student.studentId}</option>)}</select></label>
      <label className="form-group">Certificate UID<input className="form-input" value={form.certCode} onChange={(event) => setForm({ ...form, certCode: event.target.value.toUpperCase() })} required /></label>
      <label className="form-group">Student name<input className="form-input" value={form.studentName} onChange={(event) => setForm({ ...form, studentName: event.target.value })} required /></label>
      <label className="form-group">Course<input className="form-input" value={form.course} onChange={(event) => setForm({ ...form, course: event.target.value })} required /></label>
      <label className="form-group">Batch<input className="form-input" value={form.batch} onChange={(event) => setForm({ ...form, batch: event.target.value })} /></label>
      <label className="form-group">Grade<input className="form-input" value={form.grade} onChange={(event) => setForm({ ...form, grade: event.target.value })} /></label>
      <button className="btn btn-primary" disabled={saving} type="submit"><Plus size={16} /> {saving ? "Issuing..." : "Issue certificate"}</button>
    </form>
    {issued && <div className="hunar-card" style={{ padding: 24, border: "2px solid var(--color-brand-border)" }}><Award color="var(--color-brand-text)" /><h3 style={{ margin: "12px 0 6px" }}>{issued.studentName}</h3><p style={{ margin: 0, color: "var(--color-text-secondary)" }}>{issued.course} · Grade {issued.grade || "Completion"}</p><strong style={{ display: "block", margin: "14px 0" }}>{issued.certCode}</strong><div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}><button className="btn btn-primary" onClick={downloadCertificate}><Download size={16} /> Download certificate</button><button className="btn btn-outline" onClick={() => navigator.clipboard?.writeText(issued.certCode)}><Copy size={16} /> Copy UID</button></div></div>}
  </section>;
}
