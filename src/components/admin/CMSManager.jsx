import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSiteContent } from "../../context/SiteContentContext";
import { blogData } from "../../data/blogData";
import {
  Globe,
  FileText,
  UserCheck,
  Users,
  BookOpen,
  Sparkles,
  HelpCircle,
  Phone,
  Image,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  ExternalLink,
  Star,
  MapPin,
  Clock,
  Mail
} from "lucide-react";

export default function CMSManager({ activeTab, authToken, showToast }) {
  const { updateSection } = useSiteContent();
  const [loading, setLoading] = useState(false);
  const [cmsContent, setCmsContent] = useState({
    homepage: {
      badge: "Mullanpur's Premier Skills & Tech Academy",
      heroTitle: "Master Tomorrow's Skills Today",
      heroSubtitle: "Industry-grade training in Full Stack Development, AI Systems, Digital Marketing, and UI/UX Design with guaranteed internship pathways.",
      stats: [
        { label: "Industry Programs", value: "12+" },
        { label: "Students Trained", value: "1,000+" },
        { label: "Internship Support", value: "100%" },
        { label: "Placement Rating", value: "4.9/5" }
      ]
    },
    about: {
      heading: "Empowering Youth with Practical, Market-Ready Skills",
      description: "Hunar – The Skill House is an institutional skill development center powered by Byteblaze Technologies. Founded with a singular mission: bridge the divide between textbook theory and actual industry execution through individual workstations, live ad budgets, and daily mentor guidance.",
      mission: "To bridge the gap between academic theory and practical industry excellence, empowering students from Punjab to compete on the global technology stage.",
      vision: "To establish Hunar The Skill House as North India's benchmark destination for modern computer engineering, AI mastery, and digital entrepreneurship.",
      establishedYear: "2024",
      campus: "Mullanpur Dakha, Ludhiana, Punjab"
    },
    founder: {
      name: "Gurlove Malhi",
      title: "Founder & Director",
      organization: "Hunar The Skill House",
      quote: "Education should build self-reliance, technical clarity, and high-income potential. We don't just teach software; we sculpt professionals ready for global challenges.",
      experience: "8+ Years in Technical Education & Youth Development",
      location: "Mullanpur Dakha, Ludhiana"
    },
    faculty: {
      leadInstructor: "Paramjit Singh",
      domains: "Full Stack Web Development, Artificial Intelligence & Machine Learning, Performance Marketing",
      pedagogy: "Project-first, lab-intensive curriculum with 1-on-1 code reviews and live client projects."
    },
    contact: {
      instituteName: "Hunar The Skill House",
      phone: "+91 94637 95116",
      whatsapp: "+91 94637 95116",
      email: "byteblaze.hunar@gmail.com",
      address: "Opposite Bus Stand, Mullanpur Dakha, Ludhiana, Punjab 141101",
      officeHours: "Monday to Saturday: 9:00 AM – 6:30 PM",
      coordinates: "30.9168, 75.6885"
    }
  });

  const [faqs, setFaqs] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [mediaList, setMediaList] = useState([]);
  const [blogJson, setBlogJson] = useState(() => JSON.stringify(blogData, null, 2));

  // Form states
  const [faqForm, setFaqForm] = useState({ question: "", answer: "", category: "Admissions" });
  const [testimonialForm, setTestimonialForm] = useState({
    name: "",
    role: "Alumni / Full Stack Developer",
    quote: "",
    company: "Byteblaze Technologies",
    rating: 5
  });
  const [mediaForm, setMediaForm] = useState({
    title: "",
    url: "",
    category: "Lab Workstations",
    caption: ""
  });

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${authToken || localStorage.getItem("hunar_token")}`
  });

  const fetchCMSData = async () => {
    try {
      const [contentRes, faqsRes, testRes, mediaRes] = await Promise.all([
        fetch("/api/content").catch(() => null),
        fetch("/api/faqs").catch(() => null),
        fetch("/api/testimonials").catch(() => null),
        fetch("/api/media").catch(() => null)
      ]);

      if (contentRes && contentRes.ok) {
        const data = await contentRes.json();
        if (data && Object.keys(data).length > 0) {
          setCmsContent((prev) => ({ ...prev, ...data }));
          if (Array.isArray(data.blog)) setBlogJson(JSON.stringify(data.blog, null, 2));
        }
      }
      if (faqsRes && faqsRes.ok) setFaqs(await faqsRes.json());
      if (testRes && testRes.ok) setTestimonials(await testRes.json());
      if (mediaRes && mediaRes.ok) setMediaList(await mediaRes.json());
    } catch (e) {
      console.warn("CMS data load error:", e);
    }
  };

  useEffect(() => {
    fetchCMSData();
  }, []);

  const handleSaveSection = async (section, data) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/content/${section}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to update content");

      setCmsContent((prev) => ({ ...prev, [section]: data }));
      updateSection(section, data);
      showToast(`Published ${section.toUpperCase()} content to live website!`);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddFaq = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/faqs", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(faqForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add FAQ");
      setFaqs((prev) => [data.item, ...prev]);
      setFaqForm({ question: "", answer: "", category: "Admissions" });
      showToast("New FAQ published to live website!");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDeleteFaq = async (id) => {
    try {
      const res = await fetch(`/api/faqs/${id}`, {
        method: "DELETE",
        headers: getHeaders()
      });
      if (!res.ok) throw new Error("Failed to delete FAQ");
      setFaqs((prev) => prev.filter((f) => f.id !== id));
      showToast("FAQ removed from website.");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleAddTestimonial = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(testimonialForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add testimonial");
      setTestimonials((prev) => [data.item, ...prev]);
      setTestimonialForm({ name: "", role: "Alumni / Full Stack Developer", quote: "", company: "Byteblaze Technologies", rating: 5 });
      showToast("Success story published to website!");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDeleteTestimonial = async (id) => {
    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: "DELETE",
        headers: getHeaders()
      });
      if (!res.ok) throw new Error("Failed to delete testimonial");
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
      showToast("Success story removed.");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleAddMedia = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/media", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(mediaForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add media item");
      setMediaList((prev) => [data.item, ...prev]);
      setMediaForm({ title: "", url: "", category: "Lab Workstations", caption: "" });
      showToast("Media item added to gallery!");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDeleteMedia = async (id) => {
    try {
      const res = await fetch(`/api/media/${id}`, {
        method: "DELETE",
        headers: getHeaders()
      });
      if (!res.ok) throw new Error("Failed to delete media item");
      setMediaList((prev) => prev.filter((m) => m.id !== id));
      showToast("Media photo removed.");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // ══════════════════════════════════════════════════════
  // RENDER BASED ON ACTIVE TAB
  // ══════════════════════════════════════════════════════

  // 1. BLOG CONTENT
  if (activeTab === "cms_blog") {
    const publishBlog = async () => {
      try {
        const parsed = JSON.parse(blogJson);
        if (!Array.isArray(parsed)) throw new Error("Blog content must be a JSON array.");
        await handleSaveSection("blog", parsed);
      } catch (error) {
        showToast(error.message, "error");
      }
    };
    return <section style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <header><span className="badge badge-brand"><BookOpen size={14} /> BLOG CMS</span><h3 style={{ margin: "12px 0 6px" }}>Blog posts and articles</h3><p style={{ margin: 0, color: "var(--color-text-secondary)" }}>Control titles, excerpts, images, authors, dates, categories, and article content from one publishable editor.</p></header>
      <div className="hunar-card" style={{ padding: 20 }}><textarea aria-label="Blog content JSON" value={blogJson} onChange={(event) => setBlogJson(event.target.value)} rows={24} style={{ width: "100%", fontFamily: "monospace", fontSize: "0.82rem", padding: 14, borderRadius: 10, border: "1px solid var(--color-border)", background: "var(--color-background)", color: "var(--color-text-primary)" }} /><button className="btn btn-primary" onClick={publishBlog} disabled={loading} style={{ marginTop: 14 }}><Save size={16} /> {loading ? "Publishing..." : "Publish blog changes"}</button></div>
    </section>;
  }

  // 2. HOMEPAGE CONTENT
  if (activeTab === "cms_homepage") {
    const hp = cmsContent.homepage || {};
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 4px 0" }}>Homepage Content & Hero Editor</h3>
            <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
              Edits made here update the public landing page instantly via <code>/api/content/homepage</code>
            </p>
          </div>
          <button
            onClick={() => handleSaveSection("homepage", hp)}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
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
            <Save size={16} />
            <span>{loading ? "Publishing..." : "Publish to Website"}</span>
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "20px" }}>
          {/* Edit Form */}
          <div style={{ padding: "24px", backgroundColor: "var(--color-surface)", borderRadius: "14px", border: "1px solid var(--color-border)", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "6px", color: "var(--color-text-secondary)" }}>
                Institutional Eyebrow Badge
              </label>
              <input
                type="text"
                value={hp.badge || ""}
                onChange={(e) => setCmsContent({ ...cmsContent, homepage: { ...hp, badge: e.target.value } })}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.85rem" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "6px", color: "var(--color-text-secondary)" }}>
                Main Hero Headline
              </label>
              <input
                type="text"
                value={hp.heroTitle || ""}
                onChange={(e) => setCmsContent({ ...cmsContent, homepage: { ...hp, heroTitle: e.target.value } })}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.85rem" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "6px", color: "var(--color-text-secondary)" }}>
                Hero Subtitle Description
              </label>
              <textarea
                rows={4}
                value={hp.heroSubtitle || ""}
                onChange={(e) => setCmsContent({ ...cmsContent, homepage: { ...hp, heroSubtitle: e.target.value } })}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.85rem", resize: "vertical" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "8px", color: "var(--color-text-secondary)" }}>
                Hero Metrics (Live Counter Statistics)
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {(hp.stats || []).map((s, idx) => (
                  <div key={idx} style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "rgba(0,0,0,0.02)" }}>
                    <input
                      type="text"
                      placeholder="Value (e.g. 12+)"
                      value={s.value}
                      onChange={(e) => {
                        const newStats = (hp.stats || []).map((stat, statIndex) =>
                          statIndex === idx ? { ...stat, value: e.target.value } : stat
                        );
                        setCmsContent({ ...cmsContent, homepage: { ...hp, stats: newStats } });
                      }}
                      style={{ width: "100%", padding: "6px", fontWeight: 700, borderRadius: "6px", border: "1px solid var(--color-border)", marginBottom: "4px", fontSize: "0.85rem" }}
                    />
                    <input
                      type="text"
                      placeholder="Label"
                      value={s.label}
                      onChange={(e) => {
                        const newStats = (hp.stats || []).map((stat, statIndex) =>
                          statIndex === idx ? { ...stat, label: e.target.value } : stat
                        );
                        setCmsContent({ ...cmsContent, homepage: { ...hp, stats: newStats } });
                      }}
                      style={{ width: "100%", padding: "6px", fontSize: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-border)" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Live Preview Card */}
          <div style={{ padding: "24px", backgroundColor: "var(--color-surface)", borderRadius: "14px", border: "1px solid var(--color-border)", display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-brand)", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10B981" }} />
              Live Website Preview
            </div>

            <div style={{ padding: "20px", borderRadius: "12px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", flex: 1 }}>
              <span style={{ display: "inline-block", padding: "4px 10px", borderRadius: "20px", backgroundColor: "rgba(239, 219, 25, 0.2)", color: "var(--color-text-primary)", fontSize: "0.72rem", fontWeight: 700, marginBottom: "12px" }}>
                {hp.badge}
              </span>
              <h4 style={{ fontSize: "1.3rem", fontWeight: 800, margin: "0 0 10px 0", letterSpacing: "-0.02em" }}>
                {hp.heroTitle}
              </h4>
              <p style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)", lineHeight: 1.6, margin: "0 0 20px 0" }}>
                {hp.heroSubtitle}
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", borderTop: "1px solid var(--color-border)", paddingTop: "14px" }}>
                {(hp.stats || []).map((s, i) => (
                  <div key={i} style={{ textAlign: "center", padding: "8px", backgroundColor: "rgba(0,0,0,0.02)", borderRadius: "6px" }}>
                    <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--color-brand)" }}>{s.value}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. ABOUT HUNAR
  if (activeTab === "cms_about") {
    const ab = cmsContent.about || {};
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 4px 0" }}>About Hunar Institute Details</h3>
            <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
              Institutional mission, vision, and campus declarations displayed on <code>/about</code>
            </p>
          </div>
          <button
            onClick={() => handleSaveSection("about", ab)}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
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
            <Save size={16} />
            <span>{loading ? "Publishing..." : "Save & Publish"}</span>
          </button>
        </div>

        <div style={{ padding: "24px", backgroundColor: "var(--color-surface)", borderRadius: "14px", border: "1px solid var(--color-border)", display: "flex", flexDirection: "column", gap: "16px", maxWidth: "800px" }}>
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "6px", color: "var(--color-text-secondary)" }}>
              About Page Introduction
            </label>
            <textarea
              rows={3}
              value={ab.description || ""}
              onChange={(e) => setCmsContent({ ...cmsContent, about: { ...ab, description: e.target.value } })}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.85rem" }}
            />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "6px", color: "var(--color-text-secondary)" }}>
              Section Heading
            </label>
            <input
              type="text"
              value={ab.heading || ""}
              onChange={(e) => setCmsContent({ ...cmsContent, about: { ...ab, heading: e.target.value } })}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.85rem" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "6px", color: "var(--color-text-secondary)" }}>
              Institutional Mission Statement
            </label>
            <textarea
              rows={3}
              value={ab.mission || ""}
              onChange={(e) => setCmsContent({ ...cmsContent, about: { ...ab, mission: e.target.value } })}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.85rem" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "6px", color: "var(--color-text-secondary)" }}>
              Institutional Vision Statement
            </label>
            <textarea
              rows={3}
              value={ab.vision || ""}
              onChange={(e) => setCmsContent({ ...cmsContent, about: { ...ab, vision: e.target.value } })}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.85rem" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "6px", color: "var(--color-text-secondary)" }}>
                Established Year
              </label>
              <input
                type="text"
                value={ab.establishedYear || "2024"}
                onChange={(e) => setCmsContent({ ...cmsContent, about: { ...ab, establishedYear: e.target.value } })}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.85rem" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "6px", color: "var(--color-text-secondary)" }}>
                Campus Location
              </label>
              <input
                type="text"
                value={ab.campus || "Mullanpur Dakha, Ludhiana"}
                onChange={(e) => setCmsContent({ ...cmsContent, about: { ...ab, campus: e.target.value } })}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.85rem" }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. FOUNDER & LEADERSHIP
  if (activeTab === "cms_founder") {
    const fo = cmsContent.founder || {};
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 4px 0" }}>Founder & Leadership Profile</h3>
            <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
              Institutional leadership bio for Gurlove Malhi, Founder & Director of Hunar The Skill House.
            </p>
          </div>
          <button
            onClick={() => handleSaveSection("founder", fo)}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
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
            <Save size={16} />
            <span>{loading ? "Publishing..." : "Update Founder Bio"}</span>
          </button>
        </div>

        <div style={{ padding: "24px", backgroundColor: "var(--color-surface)", borderRadius: "14px", border: "1px solid var(--color-border)", display: "flex", flexDirection: "column", gap: "16px", maxWidth: "800px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "6px", color: "var(--color-text-secondary)" }}>
                Director's Full Name
              </label>
              <input
                type="text"
                value={fo.name || "Gurlove Malhi"}
                onChange={(e) => setCmsContent({ ...cmsContent, founder: { ...fo, name: e.target.value } })}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.85rem" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "6px", color: "var(--color-text-secondary)" }}>
                Designation & Title
              </label>
              <input
                type="text"
                value={fo.title || "Founder & Institutional Director"}
                onChange={(e) => setCmsContent({ ...cmsContent, founder: { ...fo, title: e.target.value } })}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.85rem" }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "6px", color: "var(--color-text-secondary)" }}>
              Director's Institutional Message & Quote
            </label>
            <textarea
              rows={4}
              value={fo.quote || ""}
              onChange={(e) => setCmsContent({ ...cmsContent, founder: { ...fo, quote: e.target.value } })}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.85rem" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "6px", color: "var(--color-text-secondary)" }}>
                Institutional Experience
              </label>
              <input
                type="text"
                value={fo.experience || "8+ Years in Technical Education"}
                onChange={(e) => setCmsContent({ ...cmsContent, founder: { ...fo, experience: e.target.value } })}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.85rem" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "6px", color: "var(--color-text-secondary)" }}>
                Primary Headquarters
              </label>
              <input
                type="text"
                value={fo.location || "Mullanpur Dakha, Ludhiana"}
                onChange={(e) => setCmsContent({ ...cmsContent, founder: { ...fo, location: e.target.value } })}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.85rem" }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. TEACHERS & FACULTY
  if (activeTab === "cms_faculty") {
    const fac = cmsContent.faculty || {};
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 4px 0" }}>Faculty & Academic Pedagogy</h3>
            <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
              Lead technical instructor Paramjit Singh and institutional hands-on methodology.
            </p>
          </div>
          <button
            onClick={() => handleSaveSection("faculty", fac)}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
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
            <Save size={16} />
            <span>{loading ? "Publishing..." : "Save Faculty Details"}</span>
          </button>
        </div>

        <div style={{ padding: "24px", backgroundColor: "var(--color-surface)", borderRadius: "14px", border: "1px solid var(--color-border)", display: "flex", flexDirection: "column", gap: "16px", maxWidth: "800px" }}>
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "6px", color: "var(--color-text-secondary)" }}>
              Lead Instructor
            </label>
            <input
              type="text"
              value={fac.leadInstructor || "Paramjit Singh"}
              onChange={(e) => setCmsContent({ ...cmsContent, faculty: { ...fac, leadInstructor: e.target.value } })}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.85rem" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "6px", color: "var(--color-text-secondary)" }}>
              Assigned Instructional Domains
            </label>
            <input
              type="text"
              value={fac.domains || "Full Stack Web Development, Artificial Intelligence & Machine Learning, Performance Marketing"}
              onChange={(e) => setCmsContent({ ...cmsContent, faculty: { ...fac, domains: e.target.value } })}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.85rem" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "6px", color: "var(--color-text-secondary)" }}>
              Lab Pedagogy Statement
            </label>
            <textarea
              rows={4}
              value={fac.pedagogy || ""}
              onChange={(e) => setCmsContent({ ...cmsContent, faculty: { ...fac, pedagogy: e.target.value } })}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.85rem" }}
            />
          </div>
        </div>
      </div>
    );
  }

  // 5. FAQS MANAGER
  if (activeTab === "cms_faqs") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 4px 0" }}>Frequently Asked Questions (FAQ) Manager</h3>
            <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
              Live questions synchronized with <code>/faq</code> public page ({faqs.length} active questions)
            </p>
          </div>
        </div>

        {/* Add FAQ Card */}
        <form onSubmit={handleAddFaq} style={{ padding: "20px", backgroundColor: "var(--color-surface)", borderRadius: "14px", border: "1px solid var(--color-border)", display: "flex", flexDirection: "column", gap: "12px" }}>
          <h4 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0 }}>Add New Institutional FAQ</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: "12px" }}>
            <input
              type="text"
              required
              placeholder="Question title (e.g. Do you offer installment plans?)"
              value={faqForm.question}
              onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.85rem" }}
            />
            <select
              value={faqForm.category}
              onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.85rem" }}
            >
              <option value="Admissions">Admissions</option>
              <option value="Courses">Courses</option>
              <option value="Placement">Placement</option>
              <option value="Fees">Fees & Installments</option>
              <option value="General">General</option>
            </select>
          </div>
          <textarea
            required
            rows={3}
            placeholder="Official transparent response..."
            value={faqForm.answer}
            onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
            style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.85rem" }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
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
              <span>Publish FAQ</span>
            </button>
          </div>
        </form>

        {/* Existing FAQs List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {faqs.map((f) => (
            <div
              key={f.id || f._id}
              style={{
                padding: "16px 20px",
                backgroundColor: "var(--color-surface)",
                borderRadius: "12px",
                border: "1px solid var(--color-border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "16px"
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", backgroundColor: "rgba(239, 219, 25, 0.2)", color: "var(--color-text-primary)" }}>
                    {f.category}
                  </span>
                  <h5 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0 }}>{f.question}</h5>
                </div>
                <p style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.6 }}>{f.answer}</p>
              </div>
              <button
                onClick={() => handleDeleteFaq(f.id || f._id)}
                title="Remove FAQ"
                style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", padding: "6px", borderRadius: "6px" }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 6. STUDENT SUCCESS STORIES / TESTIMONIALS
  if (activeTab === "cms_testimonials") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 4px 0" }}>Student Success Stories & Testimonials</h3>
            <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
              Verified graduate placement reviews shown on <code>/testimonials</code> and the home page.
            </p>
          </div>
        </div>

        {/* Add Testimonial Card */}
        <form onSubmit={handleAddTestimonial} style={{ padding: "20px", backgroundColor: "var(--color-surface)", borderRadius: "14px", border: "1px solid var(--color-border)", display: "flex", flexDirection: "column", gap: "12px" }}>
          <h4 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0 }}>Add Verified Student Story</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 120px", gap: "12px" }}>
            <input
              type="text"
              required
              placeholder="Student Name (e.g. Harman Preet Singh)"
              value={testimonialForm.name}
              onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.85rem" }}
            />
            <input
              type="text"
              required
              placeholder="Role / Program (e.g. Full Stack Developer)"
              value={testimonialForm.role}
              onChange={(e) => setTestimonialForm({ ...testimonialForm, role: e.target.value })}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.85rem" }}
            />
            <input
              type="text"
              placeholder="Company Placed At (e.g. Byteblaze)"
              value={testimonialForm.company}
              onChange={(e) => setTestimonialForm({ ...testimonialForm, company: e.target.value })}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.85rem" }}
            />
            <select
              value={testimonialForm.rating}
              onChange={(e) => setTestimonialForm({ ...testimonialForm, rating: Number(e.target.value) })}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.85rem" }}
            >
              <option value={5}>5 Stars ★★★★★</option>
              <option value={4}>4 Stars ★★★★</option>
            </select>
          </div>
          <textarea
            required
            rows={3}
            placeholder="Student's genuine learning testimonial..."
            value={testimonialForm.quote}
            onChange={(e) => setTestimonialForm({ ...testimonialForm, quote: e.target.value })}
            style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.85rem" }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
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
              <span>Publish Success Story</span>
            </button>
          </div>
        </form>

        {/* Testimonials Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
          {testimonials.map((t) => (
            <div
              key={t.id || t._id}
              style={{
                padding: "20px",
                backgroundColor: "var(--color-surface)",
                borderRadius: "14px",
                border: "1px solid var(--color-border)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                  <div style={{ display: "flex", gap: "2px" }}>
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} size={14} fill="#EFDB19" color="#EFDB19" />
                    ))}
                  </div>
                  <button
                    onClick={() => handleDeleteTestimonial(t.id || t._id)}
                    style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", padding: "2px" }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", lineHeight: 1.6, margin: "0 0 14px 0", fontStyle: "italic" }}>
                  "{t.quote}"
                </p>
              </div>
              <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "10px" }}>
                <div style={{ fontSize: "0.88rem", fontWeight: 700 }}>{t.name}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                  {t.role} {t.company && `• ${t.company}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 7. GALLERY & MEDIA
  if (activeTab === "cms_gallery") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 4px 0" }}>Gallery & Campus Media</h3>
            <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
              Campus infrastructure, workstation labs, and student project media.
            </p>
          </div>
        </div>

        {/* Add Media Form */}
        <form onSubmit={handleAddMedia} style={{ padding: "20px", backgroundColor: "var(--color-surface)", borderRadius: "14px", border: "1px solid var(--color-border)", display: "flex", flexDirection: "column", gap: "12px" }}>
          <h4 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0 }}>Add Media Photo</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 160px", gap: "12px" }}>
            <input
              type="text"
              required
              placeholder="Media Title (e.g. AI Lab Cluster)"
              value={mediaForm.title}
              onChange={(e) => setMediaForm({ ...mediaForm, title: e.target.value })}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.85rem" }}
            />
            <input
              type="url"
              required
              placeholder="Image URL (e.g. /images/lab1.jpg)"
              value={mediaForm.url}
              onChange={(e) => setMediaForm({ ...mediaForm, url: e.target.value })}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.85rem" }}
            />
            <select
              value={mediaForm.category}
              onChange={(e) => setMediaForm({ ...mediaForm, category: e.target.value })}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.85rem" }}
            >
              <option value="Lab Workstations">Workstations</option>
              <option value="Campus">Campus Infrastructure</option>
              <option value="Workshops">Workshops</option>
              <option value="Mentorship">1-on-1 Mentorship</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Caption (e.g. High-performance dual-display coding workstations)"
            value={mediaForm.caption}
            onChange={(e) => setMediaForm({ ...mediaForm, caption: e.target.value })}
            style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.85rem" }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
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
              <span>Add to Gallery</span>
            </button>
          </div>
        </form>

        {/* Media Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
          {mediaList.map((m) => (
            <div
              key={m.id || m._id}
              style={{
                borderRadius: "14px",
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-surface)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column"
              }}
            >
              <div style={{ height: "160px", backgroundColor: "#191A17", position: "relative" }}>
                <img
                  src={m.url}
                  alt={m.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <button
                  onClick={() => handleDeleteMedia(m.id || m._id)}
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    padding: "6px",
                    borderRadius: "6px",
                    backgroundColor: "rgba(0,0,0,0.6)",
                    color: "#EF4444",
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
              <div style={{ padding: "14px" }}>
                <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", backgroundColor: "rgba(239, 219, 25, 0.2)", color: "var(--color-text-primary)", display: "inline-block", marginBottom: "6px" }}>
                  {m.category}
                </span>
                <h5 style={{ fontSize: "0.92rem", fontWeight: 800, margin: "0 0 4px 0" }}>{m.title}</h5>
                {m.caption && <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>{m.caption}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 8. CONTACT INFORMATION
  if (activeTab === "cms_contact") {
    const co = cmsContent.contact || {};
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 4px 0" }}>Contact & Campus Information</h3>
            <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
              Live phone, email, and location details published across <code>/contact</code>, footer, and navigation.
            </p>
          </div>
          <button
            onClick={() => handleSaveSection("contact", co)}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
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
            <Save size={16} />
            <span>{loading ? "Publishing..." : "Update Contact Info"}</span>
          </button>
        </div>

        <div style={{ padding: "24px", backgroundColor: "var(--color-surface)", borderRadius: "14px", border: "1px solid var(--color-border)", display: "flex", flexDirection: "column", gap: "16px", maxWidth: "800px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "6px", color: "var(--color-text-secondary)" }}>
                Support Helpline Phone
              </label>
              <input
                type="text"
                value={co.phone || "+91 94637 95116"}
                onChange={(e) => setCmsContent({ ...cmsContent, contact: { ...co, phone: e.target.value } })}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.85rem" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "6px", color: "var(--color-text-secondary)" }}>
                WhatsApp Admissions Number
              </label>
              <input
                type="text"
                value={co.whatsapp || "+91 94637 95116"}
                onChange={(e) => setCmsContent({ ...cmsContent, contact: { ...co, whatsapp: e.target.value } })}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.85rem" }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "6px", color: "var(--color-text-secondary)" }}>
              Verified Contact Email
            </label>
            <input
              type="email"
              value={co.email || "byteblaze.hunar@gmail.com"}
              onChange={(e) => setCmsContent({ ...cmsContent, contact: { ...co, email: e.target.value } })}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.85rem" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "6px", color: "var(--color-text-secondary)" }}>
              Physical Campus Address
            </label>
            <input
              type="text"
              value={co.address || "Opposite Bus Stand, Mullanpur Dakha, Ludhiana, Punjab 141101"}
              onChange={(e) => setCmsContent({ ...cmsContent, contact: { ...co, address: e.target.value } })}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.85rem" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "6px", color: "var(--color-text-secondary)" }}>
                Campus Office Hours
              </label>
              <input
                type="text"
                value={co.officeHours || "Monday to Saturday: 9:00 AM – 6:30 PM"}
                onChange={(e) => setCmsContent({ ...cmsContent, contact: { ...co, officeHours: e.target.value } })}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.85rem" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "6px", color: "var(--color-text-secondary)" }}>
                GPS Coordinates
              </label>
              <input
                type="text"
                value={co.coordinates || "30.9168, 75.6885"}
                onChange={(e) => setCmsContent({ ...cmsContent, contact: { ...co, coordinates: e.target.value } })}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.85rem" }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 9. WEBSITE NAVIGATION CONTENT
  if (activeTab === "cms_navigation") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 4px 0" }}>Website Navigation Content & Sitemap</h3>
          <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: 0 }}>
            Active header and footer routes linked across Hunar The Skill House.
          </p>
        </div>

        <div style={{ backgroundColor: "var(--color-surface)", borderRadius: "14px", border: "1px solid var(--color-border)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)", backgroundColor: "rgba(0,0,0,0.02)" }}>
                <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Label</th>
                <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Route URL</th>
                <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)" }}>Target Section</th>
                <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-text-secondary)", textAlign: "center" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Home", url: "/", section: "Main Landing", active: true },
                { label: "All Programs", url: "/courses", section: "Course Directory", active: true },
                { label: "AI Workshop", url: "/workshop", section: "Featured Program", active: true },
                { label: "About Us", url: "/about", section: "Campus & Leadership", active: true },
                { label: "Contact & Campus", url: "/contact", section: "Admissions & Map", active: true },
                { label: "Frequently Asked Questions", url: "/faq", section: "Knowledge Base", active: true },
                { label: "Student Reviews", url: "/testimonials", section: "Success Stories", active: true },
                { label: "Articles", url: "/blog", section: "Learning Resources", active: true },
                { label: "Verify Certificate", url: "/verify", section: "Student Services", active: true },
                { label: "Enrollment", url: "/enroll", section: "Admissions", active: true },
                { label: "Student & Staff Login", url: "/login", section: "Institutional Auth", active: true },
                { label: "Privacy Policy", url: "/page/privacy-policy", section: "Legal", active: true },
                { label: "Terms & Conditions", url: "/page/terms-conditions", section: "Legal", active: true },
                { label: "Account Activation", url: "/activate/:token", section: "Single-Use Onboarding", active: true }
              ].map((item, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "14px 18px", fontWeight: 700 }}>{item.label}</td>
                  <td style={{ padding: "14px 18px", fontFamily: "monospace", color: "var(--color-brand)" }}>
                    {item.url.includes(":") ? (
                      item.url
                    ) : (
                      <Link to={item.url} style={{ textDecoration: "underline", textUnderlineOffset: "3px" }}>
                        {item.url}
                      </Link>
                    )}
                  </td>
                  <td style={{ padding: "14px 18px", color: "var(--color-text-secondary)" }}>{item.section}</td>
                  <td style={{ padding: "14px 18px", textAlign: "center" }}>
                    <span style={{ padding: "3px 8px", borderRadius: "10px", backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10B981", fontSize: "0.72rem", fontWeight: 700 }}>
                      Live
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

  return null;
}
