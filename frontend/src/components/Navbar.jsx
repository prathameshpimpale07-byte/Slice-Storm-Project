"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/login", label: "Login" },
  { href: "/register", label: "Register" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
      setOpen(false);
    }
  }

  const links = user
    ? [
      { href: "/play", label: "Play" },
      { href: "/dashboard", label: "Dashboard" },
      { href: "/leaderboard", label: "Leaderboard" },
    ]
    : NAV_LINKS;

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link href="/" className="brand-link" aria-label="Slice Storm home">
          <Image className="brand-logo-image" src="/slice-storm-logo.png" alt="" width={72} height={72} priority />
          <span className="brand-copy">
            <strong>SLICE</strong>
            <span>STORM</span>
          </span>
        </Link>

        {/* Desktop links */}
        <nav className="nav-desktop" aria-label="Primary navigation">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`nav-link${pathname === l.href ? " active" : ""}`}
            >
              {l.label}
            </Link>
          ))}
          {!loading && (user ? (
            <>
              <span className="nav-greeting">Hi, {user.name}</span>
              <button type="button" onClick={handleLogout} disabled={loggingOut} className="btn-outline nav-action-btn">
                {loggingOut ? "Signing out..." : "Logout"}
              </button>
            </>
          ) : (
            <Link href="/register" className="btn-primary" style={{ padding: "0.5rem 1.2rem", fontSize: "0.8rem" }}>
              Start slicing
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen((p) => !p)}
          aria-label="Toggle navigation menu"
          id="nav-mobile-toggle"
          className="nav-mobile-btn"
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
          className="mobile-menu glass-sm"
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`mobile-nav-link${pathname === l.href ? " active" : ""}`}
            >
              {l.label}
            </Link>
          ))}
          {!loading && (user ? (
            <button type="button" onClick={handleLogout} disabled={loggingOut} className="btn-outline nav-action-btn">
              {loggingOut ? "Signing out..." : "Logout"}
            </button>
          ) : (
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="btn-primary mobile-play-btn"
            >
              Play Free
            </Link>
          ))}
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
