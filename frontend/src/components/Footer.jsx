import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer style={{
      marginTop: "auto",
      borderTop: "1px solid rgba(0,245,255,0.08)",
      background: "rgba(8,12,23,0.6)",
      backdropFilter: "blur(12px)",
    }}>
      <div style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "2rem 1rem",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
      }}>
        {/* Brand */}
        <div className="footer-brand">
          <Image className="footer-logo-image" src="/slice-storm-logo.png" alt="" width={56} height={56} />
          <span
            className="grad-text"
            style={{
              fontFamily: "var(--font-exo2, 'Exo 2', sans-serif)",
              fontWeight: 900,
              fontSize: "0.9rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Slice Storm
          </span>
        </div>

        {/* Copy */}
        <p style={{ color: "#8892a4", fontSize: "0.72rem", textAlign: "center" }}>
          VELoop Rewards · Full Stack Internship Project
        </p>

        {/* Links */}
        <nav style={{ display: "flex", gap: "1.25rem", fontSize: "0.75rem" }}>
          {[
            { href: "/leaderboard", label: "Leaderboard" },
            { href: "/login", label: "Login" },
            { href: "/register", label: "Register" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                color: "#8892a4",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => { e.target.style.color = "#00f5ff"; }}
              onMouseLeave={(e) => { e.target.style.color = "#8892a4"; }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
