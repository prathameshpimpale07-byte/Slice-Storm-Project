"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/login", label: "Login" },
  { href: "/register", label: "Register" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="navbar">
      <div style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "0 1rem",
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
          <span style={{ fontSize: "1.5rem", filter: "drop-shadow(0 0 8px rgba(0,245,255,0.4))" }}>⚡</span>
          <span
            className="grad-text"
            style={{
              fontFamily: "var(--font-exo2, 'Exo 2', sans-serif)",
              fontWeight: 900,
              fontSize: "1.15rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Slice Storm
          </span>
        </Link>

        {/* Desktop links */}
        <nav style={{ display: "flex", alignItems: "center", gap: "1.5rem" }} className="nav-desktop">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                fontSize: "0.85rem",
                fontWeight: 500,
                color: pathname === l.href ? "#00f5ff" : "#8892a4",
                textDecoration: "none",
                transition: "color 0.2s ease, text-shadow 0.2s ease",
                textShadow: pathname === l.href ? "0 0 12px rgba(0,245,255,0.4)" : "none",
              }}
              onMouseEnter={(e) => { e.target.style.color = "#00f5ff"; }}
              onMouseLeave={(e) => { if (pathname !== l.href) e.target.style.color = "#8892a4"; }}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/register" className="btn-primary" style={{ padding: "0.5rem 1.2rem", fontSize: "0.8rem" }}>
            Play Free
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen((p) => !p)}
          aria-label="Toggle navigation menu"
          id="nav-mobile-toggle"
          className="nav-mobile-btn"
          style={{
            display: "none",
            background: "none",
            border: "none",
            color: "#8892a4",
            cursor: "pointer",
            padding: "4px",
            transition: "color 0.2s",
          }}
        >
          {open ? (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className="glass-sm"
          style={{
            borderRadius: 0,
            borderLeft: "none",
            borderRight: "none",
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{
                display: "block",
                fontSize: "0.9rem",
                fontWeight: 500,
                padding: "0.5rem 0",
                color: pathname === l.href ? "#00f5ff" : "#8892a4",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/register"
            onClick={() => setOpen(false)}
            className="btn-primary"
            style={{ width: "100%", textAlign: "center", fontSize: "0.85rem", marginTop: "0.5rem" }}
          >
            Play Free
          </Link>
        </div>
      )}

      {/* Responsive styles via inline style tag */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: block !important; }
        }
      `}</style>
    </header>
  );
}
