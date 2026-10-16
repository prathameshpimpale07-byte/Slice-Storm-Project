import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/* ── Static fruit emoji list for decorative display ─────────────────────── */
const FRUITS = [
  { emoji: "🍉", pos: "top-24 left-[8%]",  delay: "0s",   size: "text-4xl" },
  { emoji: "🍊", pos: "top-40 right-[10%]", delay: "0.8s", size: "text-3xl" },
  { emoji: "🍎", pos: "top-[55%] left-[5%]",delay: "1.6s", size: "text-3xl" },
  { emoji: "🍋", pos: "top-[60%] right-[7%]",delay:"0.4s", size: "text-4xl" },
  { emoji: "🍇", pos: "top-[30%] left-[15%]",delay:"1.2s", size: "text-2xl" },
  { emoji: "🥭", pos: "top-[35%] right-[18%]",delay:"2s",  size: "text-3xl" },
];

/* ── Feature cards ───────────────────────────────────────────────────────── */
const FEATURES = [
  { icon: "🎮", title: "Classic Mode",        desc: "Slice fruits, dodge bombs, and survive 3 lives. Difficulty ramps every 30 seconds." },
  { icon: "⚡", title: "Combo Multipliers",   desc: "Slice 3+ fruits in one swipe for ×2–×4 combo bonuses and sky-high scores." },
  { icon: "💣", title: "Bombs & Penalties",   desc: "Hit a bomb and lose a life. Miss 3 fruits and it's game over — stay sharp!" },
  { icon: "🏆", title: "Global Leaderboard",  desc: "Scores are validated server-side and ranked globally. Claim your spot at the top." },
  { icon: "📊", title: "Personal Dashboard",  desc: "Track your highest score, best combo, total fruits sliced, and full game history." },
  { icon: "📱", title: "Mouse & Touch",       desc: "Play on desktop with mouse or on mobile with swipe gestures — fully responsive." },
];

/* ── How-to steps ────────────────────────────────────────────────────────── */
const STEPS = [
  { n: "01", color: "#00f5ff", title: "Create Account",  desc: "Register in seconds — free forever. Your scores are saved automatically." },
  { n: "02", color: "#39ff14", title: "Slice Fruits",    desc: "Click-drag or swipe across fruits to slice them. Each slice scores 1 point." },
  { n: "03", color: "#ff8c00", title: "Chain Combos",    desc: "Cut 3+ fruits in one swipe to trigger combos up to ×4 multiplier." },
  { n: "04", color: "#ff006e", title: "Top the Board",   desc: "Survive the longest, score the most, and claim your rank on the leaderboard." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* ───────────────────────── HERO ──────────────────────────── */}
      <section
        className="relative flex-1 flex flex-col items-center justify-center text-center px-4 py-24 sm:py-36 overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse at 20% 40%, rgba(0,245,255,0.07) 0%, transparent 55%), " +
            "radial-gradient(ellipse at 80% 20%, rgba(255,0,110,0.07) 0%, transparent 55%), " +
            "#0a0e1a",
        }}
      >
        {/* Floating fruit emojis — purely decorative */}
        {FRUITS.map((f) => (
          <span
            key={f.emoji + f.pos}
            aria-hidden="true"
            className={`absolute ${f.pos} ${f.size} pointer-events-none select-none float opacity-40`}
            style={{ animationDelay: f.delay }}
          >
            {f.emoji}
          </span>
        ))}

        {/* Content */}
        <div className="relative z-10 slide-up max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00f5ff]/30 bg-[#00f5ff]/10 text-[#00f5ff] text-xs font-semibold tracking-widest uppercase mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#39ff14] animate-pulse" />
            VELoop Rewards · Full Stack Game
          </div>

          {/* Title */}
          <h1
            className="font-black leading-none mb-5"
            style={{
              fontFamily: "var(--font-exo2, 'Exo 2', sans-serif)",
              fontSize: "clamp(3.5rem, 10vw, 7rem)",
            }}
          >
            <span className="grad-text">SLICE</span>
            <br />
            <span className="text-white">STORM</span>
            <span style={{ fontSize: "0.55em" }}>⚡</span>
          </h1>

          {/* Tagline */}
          <p className="text-[#8892a4] text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
            Slash fruits. Dodge bombs. Climb the leaderboard.
            <br />
            <span className="text-white/80">The ultimate browser fruit-slicing experience.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-primary pulse-btn text-base px-8 py-3" id="hero-play-btn">
              🍉 Play Now — Free
            </Link>
            <Link href="/leaderboard" className="btn-outline text-base px-8 py-3" id="hero-leaderboard-btn">
              🏆 Leaderboard
            </Link>
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-14 text-sm">
            {[
              { val: "3", label: "Lives" },
              { val: "×4", label: "Max Combo" },
              { val: "∞", label: "Leaderboard" },
              { val: "1", label: "Classic Mode" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div
                  className="glow-text text-3xl font-black mb-0.5"
                  style={{ fontFamily: "var(--font-exo2, 'Exo 2', sans-serif)", color: "#00f5ff" }}
                >
                  {s.val}
                </div>
                <div className="text-[#8892a4]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, #0a0e1a)" }}
        />
      </section>

      {/* ───────────────────────── FEATURES ─────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="grad-text font-black text-3xl sm:text-4xl mb-3"
              style={{ fontFamily: "var(--font-exo2, 'Exo 2', sans-serif)" }}
            >
              What&apos;s in the Game
            </h2>
            <p className="text-[#8892a4] max-w-md mx-auto text-sm">
              A complete full-stack game — real auth, persistent scores, global leaderboard.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="glass p-6 transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,245,255,0.12)] cursor-default"
              >
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3
                  className="text-white font-bold text-lg mb-1.5"
                  style={{ fontFamily: "var(--font-exo2, 'Exo 2', sans-serif)" }}
                >
                  {f.title}
                </h3>
                <p className="text-[#8892a4] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── HOW TO PLAY ──────────────────── */}
      <section
        className="py-20 px-4"
        style={{
          background:
            "linear-gradient(180deg, #0a0e1a 0%, #0d1628 50%, #0a0e1a 100%)",
        }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-white font-black text-3xl sm:text-4xl mb-3"
              style={{ fontFamily: "var(--font-exo2, 'Exo 2', sans-serif)" }}
            >
              How to Play
            </h2>
            <p className="text-[#8892a4] text-sm">Four simple steps to the top of the leaderboard.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {STEPS.map((s) => (
              <div key={s.n} className="flex gap-5 items-start">
                <span
                  className="text-4xl font-black flex-shrink-0 leading-none"
                  style={{
                    fontFamily: "var(--font-exo2, 'Exo 2', sans-serif)",
                    color: s.color,
                    textShadow: `0 0 18px ${s.color}80`,
                  }}
                >
                  {s.n}
                </span>
                <div>
                  <h3
                    className="text-white font-bold text-lg mb-1"
                    style={{ fontFamily: "var(--font-exo2, 'Exo 2', sans-serif)" }}
                  >
                    {s.title}
                  </h3>
                  <p className="text-[#8892a4] text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── GAME MODES ───────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2
              className="grad-text font-black text-3xl sm:text-4xl mb-3"
              style={{ fontFamily: "var(--font-exo2, 'Exo 2', sans-serif)" }}
            >
              Game Mode
            </h2>
          </div>
          <div className="glass p-8 text-center glow-box">
            <div className="text-5xl mb-4">⚔️</div>
            <h3
              className="text-white font-black text-2xl mb-2"
              style={{ fontFamily: "var(--font-exo2, 'Exo 2', sans-serif)" }}
            >
              Classic Mode
            </h3>
            <p className="text-[#8892a4] text-sm mb-6 max-w-sm mx-auto leading-relaxed">
              Survive as long as possible. Slice every fruit — miss 3 and it&apos;s over.
              Slice bombs carefully — each one costs a life. Difficulty escalates every 30 seconds.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {["3 Lives", "Combo ×2–×4", "Bombs", "Escalating Speed", "Global Ranking"].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs font-semibold border border-[#00f5ff]/30 text-[#00f5ff] bg-[#00f5ff]/10"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────── CTA BANNER ───────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto glass glow-box text-center p-12 relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(0,245,255,0.06) 0%, transparent 70%)",
            }}
          />
          <div className="relative z-10">
            <div className="text-5xl mb-5">🍉⚡🏆</div>
            <h2
              className="font-black text-3xl sm:text-4xl text-white mb-3"
              style={{ fontFamily: "var(--font-exo2, 'Exo 2', sans-serif)" }}
            >
              Ready to{" "}
              <span className="grad-text">Dominate?</span>
            </h2>
            <p className="text-[#8892a4] text-sm mb-8 max-w-sm mx-auto leading-relaxed">
              Create your free account. Your scores are saved, ranked globally, and waiting to be beaten.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="btn-primary text-base px-8 py-3" id="cta-register-btn">
                Create Free Account
              </Link>
              <Link href="/login" className="btn-outline text-base px-8 py-3" id="cta-login-btn">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
