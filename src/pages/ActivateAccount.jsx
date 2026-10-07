import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Lock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Copy,
  Check,
  UserCheck,
  Sparkles
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ActivateAccount() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const logoSrc = theme === "light" ? "/assets/LOGO BG - HUNAR.png" : "/assets/LOGO BG 2- HUNAR.png";

  const [verifying, setVerifying] = useState(true);
  const [tokenError, setTokenError] = useState("");
  const [userInfo, setUserInfo] = useState(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Live password validation rules
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasMaxLength = password.length <= 128;
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isPasswordValid = hasMinLength && hasMaxLength && hasUppercase && hasLowercase && hasNumber;

  // Step 1: Verify invitation token on mount and retrieve Login ID
  useEffect(() => {
    let isMounted = true;

    async function verifyInvitation() {
      if (!token) {
        setTokenError("No activation token was provided. Please use the link sent by administration.");
        setVerifying(false);
        return;
      }

      try {
        const res = await fetch(`/api/auth/verify-invitation/${encodeURIComponent(token)}`);
        const data = await res.json();

        if (!isMounted) return;

        if (!res.ok || !data.valid) {
          setTokenError(
            data.message || "This invitation link is invalid or has expired. Please request a new activation link."
          );
          setVerifying(false);
          return;
        }

        setUserInfo(data.user);
        setVerifying(false);
      } catch (err) {
        if (!isMounted) return;
        setTokenError("Unable to verify activation link at this moment. Please check your internet connection.");
        setVerifying(false);
      }
    }

    verifyInvitation();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleCopyId = () => {
    const idToCopy = userInfo?.loginId || "";
    if (!idToCopy) return;
    navigator.clipboard.writeText(idToCopy);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 3000);
  };

  const handleActivate = async (e) => {
    e.preventDefault();
    setError("");

    if (!password || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }

    if (!isPasswordValid) {
      setError("Please meet all password requirements: 8–128 characters, 1 uppercase letter, 1 lowercase letter, and 1 number.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-type carefully.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to activate account. The invitation link may have expired.");
        setLoading(false);
        return;
      }

      if (data.user) {
        setUserInfo((prev) => ({
          ...prev,
          ...data.user
        }));
        // Store prefill loginId for login page convenience
        if (data.user.loginId) {
          localStorage.setItem("hunar_last_login_id", data.user.loginId);
        }
      }

      setSuccess(true);
      setLoading(false);
    } catch (err) {
      setError("Network error while activating account. Please try again.");
      setLoading(false);
    }
  };

  const handleProceedToLogin = () => {
    navigate("/login", {
      state: {
        prefillId: userInfo?.loginId || "",
        prefillRole: userInfo?.role || "student"
      }
    });
  };

  return (
    <div
      style={{
        backgroundColor: "var(--color-bg)",
        minHeight: "90vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px"
      }}
    >
      <div
        className="hunar-card"
        style={{
          maxWidth: "480px",
          width: "100%",
          padding: "36px 28px",
          textAlign: "center",
          boxShadow: "0 20px 45px rgba(0,0,0,0.18)",
          borderRadius: "16px",
          position: "relative"
        }}
      >
        {/* Header Branding */}
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
            {success ? "Account Ready!" : "Set Your Password"}
          </h1>
          <p style={{ fontSize: "0.86rem", color: "var(--color-text-secondary)", margin: 0 }}>
            {success
              ? "Your password has been created and your account is active."
              : "Welcome to Hunar The Skill House institutional access."}
          </p>
        </div>

        {/* Loading / Verifying State */}
        {verifying && (
          <div style={{ padding: "40px 0" }}>
            <div
              className="loading-spinner"
              style={{
                width: "36px",
                height: "36px",
                border: "3px solid var(--color-border)",
                borderTopColor: "var(--color-brand)",
                borderRadius: "50%",
                margin: "0 auto 16px auto",
                animation: "spin 0.8s linear infinite"
              }}
            />
            <p style={{ fontSize: "0.88rem", color: "var(--color-text-secondary)" }}>
              Verifying your activation link...
            </p>
          </div>
        )}

        {/* Token Error State */}
        {!verifying && tokenError && (
          <div style={{ padding: "16px 0" }}>
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                backgroundColor: "rgba(239, 68, 68, 0.12)",
                color: "var(--color-danger)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px auto"
              }}
            >
              <AlertCircle size={28} />
            </div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: "700", marginBottom: "8px", color: "var(--color-text-primary)" }}>
              Activation Link Expired
            </h3>
            <p style={{ fontSize: "0.88rem", color: "var(--color-text-secondary)", lineHeight: "1.6", marginBottom: "22px" }}>
              {tokenError}
            </p>
            <div
              style={{
                backgroundColor: "var(--color-surface-secondary)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                padding: "14px",
                textAlign: "left",
                fontSize: "0.82rem",
                color: "var(--color-text-secondary)",
                marginBottom: "20px"
              }}
            >
              <strong>Need a new link?</strong>
              <p style={{ margin: "4px 0 0 0", fontSize: "0.8rem" }}>
                Contact the administrative office at{" "}
                <strong style={{ color: "var(--color-brand)" }}>+91 94637 95116</strong> or{" "}
                <strong style={{ color: "var(--color-brand)" }}>byteblaze.hunar@gmail.com</strong> with your name and enrolled course.
              </p>
            </div>
            <Link to="/login" className="btn btn-outline btn-full" style={{ minHeight: "42px" }}>
              Return to Login
            </Link>
          </div>
        )}

        {/* Step 1 & 2: Active Password Setup Flow */}
        {!verifying && !tokenError && !success && userInfo && (
          <div>
            {/* Prominent Login ID Display (Mandatory per Part 2) */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(239, 219, 25, 0.14) 0%, rgba(239, 219, 25, 0.05) 100%)",
                border: "2px solid var(--color-brand)",
                borderRadius: "12px",
                padding: "16px 18px",
                marginBottom: "20px",
                textAlign: "center",
                boxShadow: "0 6px 16px rgba(239, 219, 25, 0.12)"
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.74rem",
                  fontWeight: "800",
                  textTransform: "uppercase",
                  letterSpacing: "1.2px",
                  color: "var(--color-text-secondary)",
                  marginBottom: "4px"
                }}
              >
                <UserCheck size={14} color="var(--color-brand)" />
                YOUR LOGIN ID
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  margin: "4px 0"
                }}
              >
                <span
                  style={{
                    fontSize: "1.65rem",
                    fontWeight: "900",
                    fontFamily: "monospace",
                    letterSpacing: "1.5px",
                    color: "var(--color-brand-on)"
                  }}
                >
                  {userInfo.loginId}
                </span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  title="Copy Login ID"
                  aria-label="Copy Login ID"
                  style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "6px",
                    padding: "6px 8px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "0.75rem",
                    color: copiedId ? "var(--color-success)" : "var(--color-text-secondary)"
                  }}
                >
                  {copiedId ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedId ? "Copied" : "Copy"}</span>
                </button>
              </div>

              <div style={{ fontSize: "0.82rem", fontWeight: "600", color: "var(--color-brand-on)", marginTop: "4px" }}>
                Save this Login ID. You will use it every time you log in.
              </div>

              <div
                style={{
                  marginTop: "8px",
                  paddingTop: "8px",
                  borderTop: "1px dashed rgba(239, 219, 25, 0.4)",
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.76rem",
                  color: "var(--color-text-secondary)"
                }}
              >
                <span>Name: <strong style={{ color: "var(--color-text-primary)" }}>{userInfo.name}</strong></span>
                <span>Portal: <strong style={{ color: "var(--color-text-primary)" }}>{userInfo.portalName}</strong></span>
              </div>
            </div>

            {error && (
              <div
                style={{
                  background: "rgba(220, 38, 38, 0.08)",
                  border: "1px solid var(--color-danger)",
                  color: "var(--color-danger)",
                  padding: "12px 14px",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.84rem",
                  marginBottom: "18px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  textAlign: "left"
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Password Creation Form */}
            <form onSubmit={handleActivate} style={{ textAlign: "left" }}>
              <div className="form-group" style={{ marginBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label className="form-label" style={{ margin: 0, fontSize: "0.85rem", fontWeight: "600" }}>
                    Create Password
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
                    placeholder="Enter new password"
                    className="form-input"
                    style={{ minHeight: "44px" }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label className="form-label" style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "6px" }}>
                  Confirm Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Re-type new password"
                    className="form-input"
                    style={{ minHeight: "44px" }}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Requirements Checklist (Live Feedback) */}
              <div
                style={{
                  backgroundColor: "var(--color-surface-secondary)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  marginBottom: "20px"
                }}
              >
                <div style={{ fontSize: "0.76rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-text-secondary)", marginBottom: "8px" }}>
                  Password Requirements
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "0.76rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: hasMinLength && hasMaxLength ? "var(--color-success)" : "var(--color-text-muted)" }}>
                    <CheckCircle2 size={13} color={hasMinLength && hasMaxLength ? "var(--color-success)" : "var(--color-text-muted)"} />
                    <span>8 to 128 characters</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: hasUppercase ? "var(--color-success)" : "var(--color-text-muted)" }}>
                    <CheckCircle2 size={13} color={hasUppercase ? "var(--color-success)" : "var(--color-text-muted)"} />
                    <span>1 uppercase letter</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: hasLowercase ? "var(--color-success)" : "var(--color-text-muted)" }}>
                    <CheckCircle2 size={13} color={hasLowercase ? "var(--color-success)" : "var(--color-text-muted)"} />
                    <span>1 lowercase letter</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: hasNumber ? "var(--color-success)" : "var(--color-text-muted)" }}>
                    <CheckCircle2 size={13} color={hasNumber ? "var(--color-success)" : "var(--color-text-muted)"} />
                    <span>1 number</span>
                  </div>
                </div>

                {confirmPassword && (
                  <div
                    style={{
                      marginTop: "8px",
                      paddingTop: "6px",
                      borderTop: "1px dashed var(--color-border)",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "0.76rem",
                      color: passwordsMatch ? "var(--color-success)" : "var(--color-danger)"
                    }}
                  >
                    <CheckCircle2 size={13} color={passwordsMatch ? "var(--color-success)" : "var(--color-danger)"} />
                    <span>{passwordsMatch ? "Passwords match" : "Passwords do not match yet"}</span>
                  </div>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.76rem",
                  color: "var(--color-text-muted)",
                  marginBottom: "18px"
                }}
              >
                <ShieldCheck size={14} color="var(--color-brand)" />
                <span>Your password is cryptographically salted and hashed with bcrypt.</span>
              </div>

              <button
                type="submit"
                disabled={loading || !isPasswordValid || !passwordsMatch}
                className="btn btn-primary btn-full"
                style={{ minHeight: "46px", fontSize: "0.92rem", fontWeight: "700" }}
              >
                {loading ? "Activating Account..." : "Set Password & Complete Setup"}
              </button>
            </form>
          </div>
        )}

        {/* Step 3: Success Screen (Login ID MUST remain visible per Part 2 and Part 13) */}
        {!verifying && success && userInfo && (
          <div style={{ padding: "8px 0" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "rgba(16, 185, 129, 0.12)",
                color: "var(--color-success)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 14px auto"
              }}
            >
              <CheckCircle2 size={34} />
            </div>

            <h2
              style={{
                fontSize: "1.35rem",
                fontWeight: "800",
                color: "var(--color-text-primary)",
                marginBottom: "6px"
              }}
            >
              Password Created Successfully!
            </h2>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "0.88rem", lineHeight: "1.5", marginBottom: "20px" }}>
              Your account is ready. Please retain your Login ID for signing in.
            </p>

            {/* Permanent Confirmation Card displaying Login ID and Portal */}
            <div
              style={{
                backgroundColor: "var(--color-surface-secondary)",
                border: "2px solid var(--color-brand)",
                borderRadius: "12px",
                padding: "18px",
                marginBottom: "24px",
                textAlign: "left"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "0.72rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", color: "var(--color-text-secondary)" }}>
                  YOUR OFFICIAL LOGIN ID
                </span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  style={{
                    background: "none",
                    border: "none",
                    color: copiedId ? "var(--color-success)" : "var(--color-brand)",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    fontWeight: "600"
                  }}
                >
                  {copiedId ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedId ? "Copied!" : "Copy ID"}</span>
                </button>
              </div>

              <div
                style={{
                  fontSize: "1.75rem",
                  fontWeight: "900",
                  fontFamily: "monospace",
                  color: "var(--color-brand)",
                  letterSpacing: "1.5px",
                  marginBottom: "12px"
                }}
              >
                {userInfo.loginId}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", borderTop: "1px solid var(--color-border)", paddingTop: "10px" }}>
                <div>
                  <div style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>Target Portal</div>
                  <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--color-text-primary)" }}>
                    {userInfo.portalName || (userInfo.role === "student" ? "Student Portal" : "Faculty Portal")}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>Registered Name</div>
                  <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--color-text-primary)" }}>
                    {userInfo.name}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleProceedToLogin}
              className="btn btn-primary btn-full"
              style={{
                minHeight: "46px",
                fontSize: "0.92rem",
                fontWeight: "700",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              <span>Go to Login</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
