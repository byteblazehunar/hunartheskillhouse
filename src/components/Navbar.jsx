import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ArrowRight, Sun, Moon } from "lucide-react";
import { siteConfig } from "../data/siteConfig";
import { useTheme } from "../context/ThemeContext";

export default function Navbar({ onOpenDemo }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      if (window.lenis) window.lenis.stop();
    } else {
      document.body.style.overflow = "";
      if (window.lenis) window.lenis.start();
    }
    return () => {
      document.body.style.overflow = "";
      if (window.lenis) window.lenis.start();
    };
  }, [mobileMenuOpen]);

  // Keyboard accessibility: Escape key closes menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Courses", path: "/courses" },
    { label: "AI Workshop", path: "/workshop" },
    { label: "About", path: "/about" },
    { label: "Testimonials", path: "/testimonials" },
    { label: "FAQ", path: "/faq" },
    { label: "Blog", path: "/blog" },
    { label: "Verify", path: "/verify" },
    { label: "Contact", path: "/contact" },
    { label: "Careers", path: "/careers" }
  ];

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          transition: "background-color 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          backgroundColor: isScrolled ? "var(--nav-bg-scrolled)" : "var(--nav-bg)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderBottom: `1px solid ${isScrolled ? "var(--color-border)" : "transparent"}`,
          boxShadow: isScrolled ? "0 4px 16px rgba(0, 0, 0, 0.05)" : "none"
        }}
      >
        <div
          className="container-wide"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: isScrolled ? "68px" : "84px",
            transition: "height 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            paddingLeft: "var(--container-pad)",
            paddingRight: "var(--container-pad)"
          }}
        >
          {/* LEFT: Hunar Logo (Theme Adaptive) */}
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexShrink: 0,
              textDecoration: "none"
            }}
            aria-label="Hunar The Skill House - Return to home"
          >
            <img
              src={theme === "light" ? "/logo-light.png" : "/logo-dark.png"}
              alt="Hunar The Skill House"
              width="220"
              height="60"
              style={{
                height: isScrolled ? "38px" : "44px",
                width: "auto",
                objectFit: "contain",
                display: "block",
                transition: "height 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
              }}
            />
          </Link>

          {/* CENTER: Desktop Navigation */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
            className="desktop-nav"
            aria-label="Primary Navigation"
          >
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    fontSize: "0.88rem",
                    fontWeight: active ? "600" : "500",
                    color: active ? "var(--color-brand-text)" : "var(--color-text-secondary)",
                    padding: "8px 12px",
                    borderRadius: "var(--radius-sm)",
                    position: "relative",
                    transition: "color var(--transition-fast), background-color var(--transition-fast)",
                    display: "inline-flex",
                    alignItems: "center"
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = "var(--color-text-primary)";
                      e.currentTarget.style.backgroundColor = "var(--color-surface-secondary)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = "var(--color-text-secondary)";
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  {link.label}
                  {active && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: "2px",
                        left: "12px",
                        right: "12px",
                        height: "2px",
                        background: "var(--color-brand)",
                        borderRadius: "2px"
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* RIGHT: Theme Toggle & Book Free Demo (No Phone Number) */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              style={{
                background: "var(--color-surface-secondary)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding: "8px",
                color: "var(--color-text-secondary)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all var(--transition-fast)",
                width: "40px",
                height: "40px"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-brand)";
                e.currentTarget.style.color = "var(--color-brand-text)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.color = "var(--color-text-secondary)";
              }}
              aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Desktop CTA */}
            <button
              onClick={onOpenDemo}
              className="btn btn-primary btn-sm header-cta-btn"
              style={{
                fontSize: "0.85rem",
                padding: "8px 18px",
                fontWeight: "700"
              }}
            >
              Book Free Demo
            </button>

            {/* Mobile / Tablet Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: "var(--color-surface-secondary)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                color: "var(--color-text-primary)",
                cursor: "pointer",
                display: "none",
                width: "42px",
                height: "42px",
                alignItems: "center",
                justifyContent: "center",
                transition: "all var(--transition-fast)"
              }}
              className="mobile-menu-btn"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Responsive CSS for Breakpoint Switch */}
        <style>{`
          @media (max-width: 1140px) {
            .desktop-nav { display: none !important; }
            .header-cta-btn { display: none !important; }
            .mobile-menu-btn { display: inline-flex !important; }
          }
        `}</style>
      </header>

      {/* MOBILE / TABLET NAVIGATION PANEL & BACKDROP */}
      {mobileMenuOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
            backgroundColor: "var(--color-overlay)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            display: "flex",
            flexDirection: "column"
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="animate-fade-in"
            data-lenis-prevent
            style={{
              backgroundColor: "var(--color-surface)",
              borderBottom: "1px solid var(--color-border)",
              padding: "16px var(--container-pad) 28px",
              marginTop: "72px",
              maxHeight: "calc(100vh - 72px)",
              overflowY: "auto",
              boxShadow: "var(--shadow-xl)",
              display: "flex",
              flexDirection: "column",
              gap: "4px"
            }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Mobile Navigation"
          >
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: active ? "700" : "500",
                    color: active ? "var(--color-brand-text)" : "var(--color-text-primary)",
                    padding: "12px 14px",
                    borderRadius: "var(--radius-md)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: active ? "var(--color-brand-subtle-bg)" : "transparent",
                    transition: "background-color var(--transition-fast)",
                    minHeight: "48px"
                  }}
                >
                  <span>{link.label}</span>
                  {active && (
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "var(--color-brand)"
                      }}
                    />
                  )}
                </Link>
              );
            })}

            <div
              style={{
                borderTop: "1px solid var(--color-border)",
                paddingTop: "20px",
                marginTop: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "12px"
              }}
            >
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenDemo();
                }}
                className="btn btn-primary btn-full"
                style={{ minHeight: "48px", fontSize: "0.95rem" }}
              >
                Book Free Demo Class
                <ArrowRight size={16} />
              </button>

              <a
                href={siteConfig.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp btn-full"
                style={{ minHeight: "48px", fontSize: "0.95rem" }}
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
