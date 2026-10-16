import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <span className="text-lg">⚡</span>
          <span
            className="grad-text font-black text-base tracking-widest uppercase"
            style={{ fontFamily: "var(--font-exo2, 'Exo 2', sans-serif)" }}
          >
            Slice Storm
          </span>
        </div>

        {/* Copy */}
        <p className="text-[#8892a4] text-xs text-center">
          VELoop Rewards · Full Stack Internship Project
        </p>

        {/* Links */}
        <nav className="flex gap-5 text-xs text-[#8892a4]">
          <Link href="/leaderboard" className="hover:text-[#00f5ff] transition-colors">Leaderboard</Link>
          <Link href="/login"       className="hover:text-[#00f5ff] transition-colors">Login</Link>
          <Link href="/register"    className="hover:text-[#00f5ff] transition-colors">Register</Link>
        </nav>
      </div>
    </footer>
  );
}
