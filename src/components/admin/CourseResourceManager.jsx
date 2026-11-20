import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { Download, FileVideo2, LoaderCircle, Plus, Trash2 } from "lucide-react";

const ACCEPTED_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation"
];
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024;

export default function CourseResourceManager({ courseId, course, resources = [], onResourcesChange, getAuthHeaders, showToast }) {
  const fileInputRef = useRef(null);
  const [kind, setKind] = useState("recorded");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!courseId) {
      showToast("Save the course before adding learning resources.", "error");
      return;
    }
    if (!ACCEPTED_TYPES.includes(file.type) || file.size > MAX_FILE_SIZE) {
      showToast("Upload an MP4, WebM, MOV, PDF, or PPTX file under 2 GB.", "error");
      return;
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-150) || "course-resource";
    const pathname = `courses/${courseId}/${Date.now()}-${safeName}`;
    setBusy(true);
    setProgress(0);
    try {
      const blob = await upload(pathname, file, {
        access: "private",
        handleUploadUrl: "/api/courses/blob-upload",
        clientPayload: JSON.stringify({ courseId }),
        multipart: file.size > 50 * 1024 * 1024,
        onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage))
      });
      const response = await fetch(`/api/courses/${encodeURIComponent(courseId)}/resources`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          pathname: blob.pathname,
          url: blob.url,
          filename: file.name,
          contentType: file.type,
          size: file.size,
          kind,
          courseTitle: course.title,
          courseCategory: course.category,
          courseDescription: course.description || course.shortDesc
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "The upload completed, but the resource could not be saved.");
      onResourcesChange(data.course?.resources || [...resources, data.resource]);
      showToast("Course resource uploaded successfully.");
    } catch (error) {
      showToast(error.message || "Unable to upload this resource.", "error");
    } finally {
      setBusy(false);
      setProgress(0);
    }
  };

  const handleDownload = async (resource) => {
    try {
      const response = await fetch(`/api/courses/${encodeURIComponent(courseId)}/resources/${encodeURIComponent(resource.id)}/download`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error("Unable to download this resource.");
      const fileBlob = await response.blob();
      const downloadUrl = URL.createObjectURL(fileBlob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = resource.filename;
      anchor.click();
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const handleDelete = async (resource) => {
    if (!window.confirm(`Delete “${resource.filename}” from this course?`)) return;
    try {
      const response = await fetch(`/api/courses/${encodeURIComponent(courseId)}/resources/${encodeURIComponent(resource.id)}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to delete this resource.");
      onResourcesChange(data.course?.resources || resources.filter((item) => item.id !== resource.id));
      showToast("Course resource deleted.");
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  return (
    <section aria-labelledby="course-resources-heading" style={{ borderTop: "1px solid var(--color-border)", paddingTop: 16, display: "grid", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <h4 id="course-resources-heading" style={{ margin: 0, fontSize: "0.9rem", fontWeight: 800 }}>LMS learning resources</h4>
          <p style={{ margin: "4px 0 0", color: "var(--color-text-secondary)", fontSize: "0.76rem" }}>Private video lessons, live-class recordings, and downloadable course materials.</p>
        </div>
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={busy || !courseId} style={{ border: 0, borderRadius: 8, padding: "9px 12px", background: "var(--color-brand)", color: "#191A17", fontWeight: 750, cursor: busy || !courseId ? "not-allowed" : "pointer", opacity: !courseId ? 0.6 : 1, display: "inline-flex", alignItems: "center", gap: 7 }}>
          {busy ? <LoaderCircle size={16} className="animate-spin" /> : <Plus size={16} />}
          {busy ? `Uploading ${progress}%` : "Upload resource"}
        </button>
        <input ref={fileInputRef} type="file" accept="video/mp4,video/webm,video/quicktime,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation" onChange={handleUpload} hidden aria-label="Choose a video or course document" />
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.78rem", color: "var(--color-text-secondary)" }}>
        Resource type
        <select value={kind} onChange={(event) => setKind(event.target.value)} disabled={busy} style={{ padding: "7px 9px", borderRadius: 7, border: "1px solid var(--color-border)", background: "var(--color-background)", color: "var(--color-text-primary)" }}>
          <option value="recorded">Recorded lesson / material</option>
          <option value="live">Live class recording / material</option>
        </select>
      </label>

      {resources.length ? (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
          {resources.map((resource) => (
            <li key={resource.id || resource.pathname} style={{ border: "1px solid var(--color-border)", borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <FileVideo2 size={18} color="var(--color-brand)" aria-hidden="true" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div title={resource.filename} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.82rem", fontWeight: 700 }}>{resource.filename}</div>
                <div style={{ color: "var(--color-text-secondary)", fontSize: "0.72rem", marginTop: 3 }}>{resource.kind === "live" ? "Live class" : "Recorded lesson"} · {resource.contentType || "Course file"}</div>
              </div>
              <button type="button" onClick={() => handleDownload(resource)} aria-label={`Download ${resource.filename}`} title="Download" style={{ border: 0, background: "transparent", color: "var(--color-text-primary)", cursor: "pointer", padding: 6 }}><Download size={17} /></button>
              <button type="button" onClick={() => handleDelete(resource)} aria-label={`Delete ${resource.filename}`} title="Delete" style={{ border: 0, background: "transparent", color: "#d45d54", cursor: "pointer", padding: 6 }}><Trash2 size={17} /></button>
            </li>
          ))}
        </ul>
      ) : <p style={{ margin: 0, padding: "12px 0", color: "var(--color-text-secondary)", fontSize: "0.8rem" }}>No course resources have been uploaded yet.</p>}
    </section>
  );
}
