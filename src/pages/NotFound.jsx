import { Link } from "react-router-dom";
import { ArrowLeft, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <section className="section" style={{ minHeight: "65vh", display: "grid", placeItems: "center" }}>
      <div className="hunar-card" style={{ maxWidth: "560px", padding: "48px 32px", textAlign: "center" }}>
        <SearchX size={48} color="var(--color-brand-text)" style={{ margin: "0 auto 18px" }} />
        <p className="eyebrow">Error 404</p>
        <h1 style={{ marginBottom: "12px" }}>We couldn’t find that page</h1>
        <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.7, marginBottom: "24px" }}>
          The link may be incorrect or the page may have moved.
        </p>
        <Link to="/" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
          <ArrowLeft size={16} />
          Back to Hunar home
        </Link>
      </div>
    </section>
  );
}
