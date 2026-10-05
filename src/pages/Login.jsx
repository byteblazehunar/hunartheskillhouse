import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Lock,
  User,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  HelpCircle,
  X,
  PhoneCall,
  Mail,
  Copy,
  Check,
  ExternalLink,
  Sparkles
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const logoSrc = theme === "light" ? "/assets/LOGO BG - HUNAR.png" : "/assets/LOGO BG 2- HUNAR.png";

  const prefilledId = location.state?.prefillId || localStorage.getItem("hunar_last_login_id") || "";
  const initialRole = location.state?.prefillRole === "staff" || location.state?.prefillRole === "teacher" ? "staff" : "student";

  const [role, setRole] = useState(initialRole);
  const [loginId, setLoginId] = useState(prefilledId);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotResult, setForgotResult] = useState(null);
  const [forgotCopied, setForgotCopied] = useState(false);

  const handleOpenForgotModal = () => {
    setForgotIdentifier(loginId || "");
    setForgotError("");
    setForgotResult(null);
    setForgotCopied(false);
    setShowForgotModal(true);
  };

  const handleRequestPasswordReset = async (e) => {
    e.preventDefault();
    if (!forgotIdentifier.trim()) {
      setForgotError("Please enter your Login ID or registered Email.");
      return;
    }
    setForgotLoading(true);
    setForgotError("");
    setForgotResult(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: forgotIdentifier.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Account not found.");
      }
      setForgotResult(data);
    } catch (err) {
      setForgotError(err.message || "Failed to generate password reset link.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleCopyResetLink = () => {
    if (!forgotResult?.resetUrl) return;
    const fullUrl = `${window.location.origin}${forgotResult.resetUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setForgotCopied(true);
    setTimeout(() => setForgotCopied(false), 2500);
  };

  useEffect(() => {
    if (location.state?.prefillId) {
      setLoginId(location.state.prefillId);
    }
  }, [location.state]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const cleanLoginId = loginId.trim();
    if (!cleanLoginId || !password) {
      setError("Please enter your Login ID and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId: cleanLoginId, password })
      });

      const data = await res.json();

      if (!res.ok) {
        // Specific safe error messages per Part 14
        if (res.status === 401) {
          setError("Invalid Login ID or password.");
        } else if (res.status === 403) {
          setError(
            data.message ||
              "Your account is not activated or is suspended. Please contact the administrative office."
          );
        } else if (res.status === 429) {
          setError("Too many login attempts. Please wait a moment before trying again.");
        } else {
          setError(data.message || "Unable to complete the request right now. Please try again.");
        }
        setLoading(false);
        return;
      }

      // Store authenticated session
      localStorage.setItem("hunar_token", data.token);
      localStorage.setItem("hunar_user", JSON.stringify(data.user));
      localStorage.setItem("hunar_last_login_id", data.user.loginId || data.user.assignedId || cleanLoginId);

      setLoggedInUser(data.user);
      setLoggedIn(true);

      // Redirect dynamically based on verified backend role
      setTimeout(() => {
        const u = data.user || {};
        if (u.role === "admin" || u.isSuperAdmin || u.roleId === "role-super-admin") {
          localStorage.setItem("hunar_admin", JSON.stringify(u));
          navigate("/portal/admin");
        } else if (
          u.role === "staff" ||
          (u.roleId && !["role-super-admin", "role-teacher"].includes(u.roleId) && u.role !== "student")
        ) {
          navigate("/portal/operations");
        } else if (u.role === "teacher" || u.roleId === "role-teacher") {
          navigate("/portal/staff");
        } else {
          navigate("/portal/student");
        }
      }, 900);
    } catch (err) {
      setError("Unable to complete the request right now. Please check your internet connection.");
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "var(--color-bg)",
        minHeight: "88vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "36px 16px"
      }}
    >
      <div
        className="hunar-card"
        style={{
          maxWidth: "460px",
          width: "100%",
          padding: "36px 28px",
          textAlign: "center",
          borderRadius: "16px",
          boxShadow: "0 20px 45px rgba(0,0,0,0.16)",
          position: "relative"
        }}
      >
        {/* Brand Header */}
        <div style={{ marginBottom: "22px" }}>
          <Link to="/" style={{ display: "inline-block", marginBottom: "14px" }} aria-label="Hunar Home">
            <img src={logoSrc} alt="Hunar The Skill House" style={{ height: "42px", width: "auto" }} />
          </Link>
          <h1
            style={{
              fontSize: "1.45rem",
              fontWeight: "800",
              color: "var(--color-text-primary)",
              marginBottom: "4px",
              letterSpacing: "-0.3px"
            }}
          >
            Hunar Portal Access
          </h1>
          <p style={{ fontSize: "0.86rem", color: "var(--color-text-secondary)", margin: 0 }}>
            Sign in with your official Login ID and password.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "6px",
            backgroundColor: "var(--color-surface-secondary)",
            padding: "4px",
            borderRadius: "8px",
            marginBottom: "20px",
            border: "1px solid var(--color-border)"
          }}
          role="tablist"
          aria-label="Portal Selection"
        >
          <button
            type="button"
            role="tab"
            aria-selected={role === "student"}
            onClick={() => {
              setRole("student");
              setError("");
            }}
            style={{
              padding: "10px 12px",
              minHeight: "42px",
              borderRadius: "6px",
              border: "none",
              backgroundColor: role === "student" ? "var(--color-brand)" : "transparent",
              color: role === "student" ? "var(--color-brand-on)" : "var(--color-text-secondary)",
              fontWeight: "700",
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "all var(--transition-fast)"
            }}
          >
            Student Portal
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={role === "staff"}
            onClick={() => {
              setRole("staff");
              setError("");
            }}
            style={{
              padding: "10px 12px",
              minHeight: "42px",
              borderRadius: "6px",
              border: "none",
              backgroundColor: role === "staff" ? "var(--color-brand)" : "transparent",
              color: role === "staff" ? "var(--color-brand-on)" : "var(--color-text-secondary)",
              fontWeight: "700",
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "all var(--transition-fast)"
            }}
          >
            Staff / Faculty
          </button>
        </div>

        {/* Admin Quick Switcher Banner */}
        {role === "staff" && (
          <div
            style={{
              background: "rgba(239, 219, 25, 0.08)",
              border: "1px solid var(--color-brand-border)",
              borderRadius: "var(--radius-md)",
              padding: "10px 14px",
              marginBottom: "18px",
              fontSize: "0.82rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px",
              textAlign: "left"
            }}
          >
            <div>
              <strong style={{ color: "var(--color-text-primary)", display: "block", fontSize: "0.84rem" }}>
                Director / Admin Access
              </strong>
              <span style={{ color: "var(--color-text-secondary)", fontSize: "0.76rem" }}>
                System control & audit center
              </span>
            </div>
            <a
              href="/admin"
              className="btn btn-primary btn-sm"
              style={{ padding: "5px 10px", fontSize: "0.76rem", whiteSpace: "nowrap" }}
            >
              Admin →
            </a>
          </div>
        )}

        {/* Error Alert Box */}
        {error && (
          <div
            style={{
              background: "rgba(220, 38, 38, 0.08)",
              border: "1px solid var(--color-danger)",
              color: "var(--color-danger)",
              padding: "11px 14px",
              borderRadius: "var(--radius-md)",
              fontSize: "0.84rem",
              marginBottom: "18px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textAlign: "left"
            }}
          >
            <AlertCircle size={17} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Logged In Success State */}
        {loggedIn ? (
          <div style={{ padding: "20px 0" }}>
            <CheckCircle2 size={52} color="var(--color-success)" style={{ margin: "0 auto 12px" }} />
            <h2
              style={{
                fontSize: "1.28rem",
                fontWeight: "800",
                color: "var(--color-text-primary)",
                marginBottom: "6px"
              }}
            >
              Login Successful!
            </h2>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "0.88rem", lineHeight: "1.6", marginBottom: "16px" }}>
              Welcome back, <strong>{loggedInUser?.name}</strong>. Entering your workspace...
            </p>
            <div
              style={{
                width: "28px",
                height: "28px",
                border: "3px solid var(--color-border)",
                borderTopColor: "var(--color-brand)",
                borderRadius: "50%",
                margin: "0 auto",
                animation: "spin 0.8s linear infinite"
              }}
            />
          </div>
        ) : (
          <form onSubmit={handleLogin} style={{ textAlign: "left" }}>
            {/* Login ID Input Field */}
            <div className="form-group" style={{ marginBottom: "14px" }}>
              <label
                className="form-label"
                style={{ fontSize: "0.84rem", fontWeight: "700", marginBottom: "6px" }}
              >
                Login ID
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  required
                  placeholder={role === "student" ? "e.g. HUN-S-2026-0001" : "e.g. HUN-T-0001"}
                  className="form-input"
                  style={{
                    minHeight: "44px",
                    fontFamily: loginId ? "monospace" : "inherit",
                    letterSpacing: loginId ? "0.5px" : "normal"
                  }}
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  autoComplete="username"
                  autoFocus={!prefilledId}
                />
              </div>
              <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", marginTop: "4px", display: "block" }}>
                Institutional ID or registered email address.
              </span>
            </div>

            {/* Password Input Field */}
            <div className="form-group" style={{ marginBottom: "16px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "6px"
                }}
              >
                <label className="form-label" style={{ margin: 0, fontSize: "0.84rem", fontWeight: "700" }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--color-text-muted)",
                    fontSize: "0.76rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  <span>{showPassword ? "Hide" : "Show"}</span>
                </button>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  className="form-input"
                  style={{ minHeight: "44px" }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-full"
              style={{
                marginTop: "6px",
                minHeight: "46px",
                fontSize: "0.92rem",
                fontWeight: "700",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              {loading ? (
                "Authenticating..."
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {/* Forgot Password Link */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "16px"
              }}
            >
              <button
                type="button"
                onClick={handleOpenForgotModal}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--color-text-secondary)",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  textDecoration: "underline",
                  padding: "4px 8px"
                }}
              >
                Forgot Password or Need Help?
              </button>
            </div>

            {/* Institutional Security Badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                marginTop: "18px",
                fontSize: "0.76rem",
                color: "var(--color-text-muted)"
              }}
            >
              <ShieldCheck size={14} color="var(--color-brand)" />
              <span>Hunar Institutional Access Security System</span>
            </div>
          </form>
        )}
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 120,
            padding: "16px"
          }}
          onClick={() => setShowForgotModal(false)}
        >
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              borderRadius: "14px",
              border: "1px solid var(--color-border)",
              maxWidth: "480px",
              width: "100%",
              padding: "24px",
              boxShadow: "0 24px 48px rgba(0,0,0,0.3)",
              position: "relative",
              textAlign: "left"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <HelpCircle size={20} color="var(--color-brand)" />
                <h3 style={{ fontSize: "1.1rem", fontWeight: "800", margin: 0, color: "var(--color-text-primary)" }}>
                  Reset Forgotten Password
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-text-muted)",
                  padding: "4px"
                }}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Success State with Direct Reset Link */}
            {forgotResult ? (
              <div>
                <div
                  style={{
                    backgroundColor: "rgba(34, 197, 94, 0.12)",
                    border: "1px solid rgba(34, 197, 94, 0.35)",
                    borderRadius: "8px",
                    padding: "14px",
                    marginBottom: "16px"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <CheckCircle2 size={18} color="#22c55e" />
                    <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "#22c55e" }}>
                      Account Located Successfully
                    </span>
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--color-text-primary)", marginBottom: "4px" }}>
                    User: <strong>{forgotResult.userName}</strong>
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
                    Login ID: <code style={{ backgroundColor: "var(--color-surface)", padding: "2px 6px", borderRadius: "4px", fontWeight: "700" }}>{forgotResult.loginId}</code>
                  </div>
                </div>

                <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", lineHeight: "1.5", marginBottom: "16px" }}>
                  A one-time secure password creation link has been generated. Click below to choose your new password:
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(false);
                      navigate(forgotResult.resetUrl);
                    }}
                    className="btn btn-primary btn-full"
                    style={{ minHeight: "42px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                  >
                    <span>Proceed to Set New Password</span>
                    <ArrowRight size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyResetLink}
                    className="btn btn-secondary btn-full"
                    style={{ minHeight: "38px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                  >
                    {forgotCopied ? <Check size={16} color="#22c55e" /> : <Copy size={16} />}
                    <span>{forgotCopied ? "Link Copied to Clipboard!" : "Copy Reset Link"}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Input Form */
              <form onSubmit={handleRequestPasswordReset}>
                <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", lineHeight: "1.5", marginBottom: "14px" }}>
                  Enter your assigned <strong>Login ID</strong> (e.g. <code>HUN-S-2026-XXXX</code> or <code>HUN-T-XXXX</code>) or your <strong>registered email address</strong>:
                </p>

                {forgotError && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      backgroundColor: "rgba(239, 68, 68, 0.12)",
                      border: "1px solid rgba(239, 68, 68, 0.35)",
                      borderRadius: "8px",
                      padding: "10px 12px",
                      marginBottom: "12px",
                      color: "var(--color-danger, #ef4444)",
                      fontSize: "0.82rem"
                    }}
                  >
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{forgotError}</span>
                  </div>
                )}

                <div style={{ marginBottom: "16px" }}>
                  <input
                    type="text"
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    placeholder="Enter Login ID or registered Email"
                    className="hunar-input"
                    style={{ width: "100%", padding: "10px 14px", fontSize: "0.9rem" }}
                    autoFocus
                  />
                </div>

                <div style={{ display: "flex", gap: "10px", marginBottom: "18px" }}>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="btn btn-primary"
                    style={{ flex: 1, minHeight: "40px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                  >
                    {forgotLoading ? (
                      <span>Verifying...</span>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        <span>Generate Reset Link</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Offline / Direct Administrator Support Option */}
            <div
              style={{
                borderTop: "1px solid var(--color-border)",
                paddingTop: "14px",
                marginTop: "10px"
              }}
            >
              <div style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--color-text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Need Help from Administration?
              </div>
              <p style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", lineHeight: "1.5", margin: "0 0 10px 0" }}>
                An administrator can also generate a direct reset link for you from the institute admin desk:
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "0.8rem" }}>
                <a
                  href="https://wa.me/919463795116"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-brand)", textDecoration: "none", fontWeight: "600" }}
                >
                  <PhoneCall size={14} />
                  <span>+91 94637 95116</span>
                </a>
                <a
                  href="mailto:admin@hunarskillhouse.com"
                  style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-brand)", textDecoration: "none", fontWeight: "600" }}
                >
                  <Mail size={14} />
                  <span>admin@hunarskillhouse.com</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
