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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group select-none">
          <span className="text-2xl">⚡</span>
          <span
            className="grad-text font-black text-xl tracking-widest uppercase"
            style={{ fontFamily: "var(--font-exo2, 'Exo 2', sans-serif)" }}
          >
            Slice Storm
          </span>
        </Link>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition-colors duration-200 hover:text-[#00f5ff] ${
                pathname === l.href ? "text-[#00f5ff]" : "text-[#8892a4]"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/register" className="btn-primary py-2 px-5 text-sm">
            Play Free
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-[#8892a4] hover:text-white transition-colors p-1"
          onClick={() => setOpen((p) => !p)}
          aria-label="Toggle navigation menu"
          id="nav-mobile-toggle"
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
        <div className="md:hidden border-t border-white/5 px-4 py-4 space-y-3 bg-[#0a0e1a]/95">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`block text-sm font-medium py-1.5 transition-colors hover:text-[#00f5ff] ${
                pathname === l.href ? "text-[#00f5ff]" : "text-[#8892a4]"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/register" onClick={() => setOpen(false)} className="btn-primary w-full text-sm justify-center">
            Play Free
          </Link>
        </div>
      )}
    </header>
  );
}
