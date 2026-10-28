"use client";

import Link from "next/link";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { GAME_MODE_COUNT, INITIAL_LIVES, MAX_COMBO_MULTIPLIER } from "@/game/constants";

/* ── Feature cards ───────────────────────────────────────────────────────── */
const FEATURES = [
  { icon: "🎮", title: "One good mode",       desc: "Three lives, a pile of fruit, and bombs that really should not be touched. The speed picks up as you play.", color: "#00f5ff" },
  { icon: "⚡", title: "Build a combo",       desc: "Catch a few fruits in the same swipe and your score starts moving quickly. The satisfying part.", color: "#39ff14" },
  { icon: "💣", title: "Watch the bombs",     desc: "Bombs cost a life, and so do missed fruits. It is simple until the screen gets busy.", color: "#ff006e" },
  { icon: "🏆", title: "Keep your best",      desc: "Finished runs are saved so you can see your best score and chase it next time.", color: "#ff8c00" },
  { icon: "📊", title: "See your progress",   desc: "Your dashboard keeps track of scores, combos, sliced fruit, and the runs you have played.", color: "#00f5ff" },
  { icon: "📱", title: "Play your way",       desc: "Use a mouse on a laptop or swipe on a phone. Both work the same once the fruit starts flying.", color: "#39ff14" },
];

/* ── How-to steps ────────────────────────────────────────────────────────── */
const STEPS = [
  { n: "01", color: "#00f5ff", title: "Make a profile",  desc: "It only takes an email and a player name. This is how your scores stay yours." },
  { n: "02", color: "#39ff14", title: "Start slicing",   desc: "Drag through the fruit with your mouse, or swipe across it on a phone." },
  { n: "03", color: "#ff8c00", title: "Go for combos",   desc: "Try to catch three or more fruits in one clean swipe for a bigger score." },
  { n: "04", color: "#ff006e", title: "Try again",       desc: "Your run is over when the lives are gone. Take a breath and beat your score." },
];

/* ── Scroll-reveal hook ──────────────────────────────────────────────────── */
function useRevealOnScroll() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

export default function HomePage() {
  useRevealOnScroll();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      {/* ───────────────────────── HERO ──────────────────────────── */}
      <section
        className="landing-hero"
        style={{
          position: "relative",
          flex: "1",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "6rem 1rem 4rem",
          overflow: "hidden",
          background:
            "radial-gradient(ellipse at 20% 40%, rgba(0,245,255,0.08) 0%, transparent 55%), " +
            "radial-gradient(ellipse at 80% 20%, rgba(255,0,110,0.07) 0%, transparent 55%), " +
            "radial-gradient(ellipse at 50% 80%, rgba(57,255,20,0.04) 0%, transparent 50%), " +
            "#0a0e1a",
        }}
      >
        {/* Hero content */}
        <div className="slide-up hero-content" style={{ position: "relative", zIndex: 10, maxWidth: "720px", margin: "0 auto" }}>
          {/* Badge */}
          {/* <div
            className="slide-up-delay-1"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.4rem 1.2rem",
              borderRadius: "999px",
              border: "1px solid rgba(0,245,255,0.25)",
              background: "rgba(0,245,255,0.08)",
              color: "#00f5ff",
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: "2rem",
              backdropFilter: "blur(8px)",
            }}
          >
            <span style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#39ff14",
              boxShadow: "0 0 8px #39ff14",
              animation: "blink-dot 1.5s ease-in-out infinite",
            }} />
            VELoop Rewards · Full Stack Game
          </div> */}

          {/* Title */}
          <h1
            style={{
              fontFamily: "var(--font-exo2, 'Exo 2', sans-serif)",
              fontWeight: 900,
              lineHeight: 0.95,
              marginBottom: "1.5rem",
              fontSize: "clamp(3.5rem, 10vw, 7.5rem)",
            }}
          >
            <span className="grad-text" style={{ display: "block" }}>SLICE</span>
            <span style={{
              color: "#fff",
              display: "block",
              textShadow: "0 0 40px rgba(255,255,255,0.1)",
            }}>
              STORM
              <span
                aria-label="Game mode"
                role="img"
                style={{ fontSize: "0.42em", marginLeft: "0.2em", verticalAlign: "0.08em" }}
              >
                🎮
              </span>
            </span>
          </h1>

          {/* Tagline */}
          <p
            className="slide-up-delay-2"
            style={{
              color: "#8892a4",
              fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
              maxWidth: "520px",
              margin: "0 auto 2.5rem",
              lineHeight: 1.7,
            }}
          >
            A tiny fruit-slicing game for your next five-minute break.
            <br />
            <span style={{ color: "rgba(255,255,255,0.85)" }}>How long can you keep the kitchen tidy?</span>
          </p>
          <p className="hero-note slide-up-delay-2">
            <span aria-hidden="true">✦</span> Tip: short, clean swipes are easier to control.
          </p>

          {/* CTA Buttons */}
          <div
            className="slide-up-delay-3"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              justifyContent: "center",
            }}
          >
            <Link href="/register" className="btn-primary pulse-btn" id="hero-play-btn"
              style={{ padding: "0.9rem 2.5rem", fontSize: "1rem" }}>
              🍉 Play Now — Free
            </Link>
            <Link href="/leaderboard" className="btn-outline" id="hero-leaderboard-btn"
              style={{ padding: "0.85rem 2.2rem", fontSize: "1rem" }}>
              🏆 Leaderboard
            </Link>
          </div>

          {/* Quick stats */}
          <div
            className="slide-up-delay-4"
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "2.5rem",
              marginTop: "3.5rem",
              fontSize: "0.85rem",
            }}
          >
            {[
              { val: INITIAL_LIVES, label: "Lives" },
              { val: `×${MAX_COMBO_MULTIPLIER}`, label: "Max Combo" },
              { val: "∞", label: "Leaderboard" },
              { val: GAME_MODE_COUNT, label: "Classic Mode" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div
                  className="glow-text"
                  style={{
                    fontFamily: "var(--font-exo2, 'Exo 2', sans-serif)",
                    color: "#00f5ff",
                    fontSize: "2rem",
                    fontWeight: 900,
                    marginBottom: "0.15rem",
                  }}
                >
                  {s.val}
                </div>
                <div style={{ color: "#8892a4", fontSize: "0.8rem" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom fade */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "120px",
            background: "linear-gradient(to bottom, transparent, #0a0e1a)",
            pointerEvents: "none",
            zIndex: 5,
          }}
        />
      </section>

      {/* ── Glow divider ─────────────────────────────────────────── */}
      <div className="divider-glow" />

      {/* ───────────────────────── FEATURES ─────────────────────── */}
      <section className="landing-section features-section" style={{ padding: "5rem 1rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2
              className="grad-text"
              style={{
                fontFamily: "var(--font-exo2, 'Exo 2', sans-serif)",
                fontWeight: 900,
                fontSize: "clamp(1.8rem, 5vw, 2.5rem)",
                marginBottom: "0.8rem",
              }}
            >
              What&apos;s in the Game
            </h2>
            <p style={{ color: "#8892a4", maxWidth: "480px", margin: "0 auto", fontSize: "0.9rem", lineHeight: 1.6 }}>
              Made for quick breaks, suspiciously high scores, and “one more try.”
            </p>
          </div>

          <div className="feature-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.25rem",
          }}>
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="glass card-hover feature-card reveal"
                style={{
                  padding: "1.75rem",
                  transitionDelay: `${i * 0.1}s`,
                  cursor: "default",
                }}
              >
                <div style={{
                  fontSize: "2.2rem",
                  marginBottom: "0.8rem",
                  width: "52px",
                  height: "52px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "14px",
                  background: `${f.color}10`,
                  border: `1px solid ${f.color}25`,
                }}>
                  {f.icon}
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-exo2, 'Exo 2', sans-serif)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  {f.title}
                </h3>
                <p style={{ color: "#8892a4", fontSize: "0.85rem", lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Glow divider ─────────────────────────────────────────── */}
      <div className="divider-glow" />

      {/* ───────────────────────── HOW TO PLAY ──────────────────── */}
      <section
        className="landing-section how-section"
        style={{
          padding: "5rem 1rem",
          background: "linear-gradient(180deg, #0a0e1a 0%, #0d1628 50%, #0a0e1a 100%)",
          position: "relative",
        }}
      >
        {/* Background orb */}
        <div className="orb orb-cyan" style={{ width: "350px", height: "350px", top: "20%", right: "5%", opacity: 0.3 }} />

        <div style={{ maxWidth: "900px", margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2
              style={{
                fontFamily: "var(--font-exo2, 'Exo 2', sans-serif)",
                color: "#fff",
                fontWeight: 900,
                fontSize: "clamp(1.8rem, 5vw, 2.5rem)",
                marginBottom: "0.8rem",
              }}
            >
              How to Play
            </h2>
            <p style={{ color: "#8892a4", fontSize: "0.9rem" }}>The rules are easy. Staying calm when the fruit speeds up is not.</p>
          </div>

          <div className="steps-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
            gap: "2rem",
          }}>
            {STEPS.map((s, i) => (
              <div
                key={s.n}
                className="step-card reveal"
                style={{
                  display: "flex",
                  gap: "1.25rem",
                  alignItems: "flex-start",
                  transitionDelay: `${i * 0.12}s`,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-exo2, 'Exo 2', sans-serif)",
                    fontSize: "3rem",
                    fontWeight: 900,
                    lineHeight: 1,
                    flexShrink: 0,
                    color: s.color,
                    textShadow: `0 0 24px ${s.color}60`,
                    opacity: 0.9,
                  }}
                >
                  {s.n}
                </span>
                <div>
                  <h3
                    style={{
                      fontFamily: "var(--font-exo2, 'Exo 2', sans-serif)",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "1.1rem",
                      marginBottom: "0.3rem",
                    }}
                  >
                    {s.title}
                  </h3>
                  <p style={{ color: "#8892a4", fontSize: "0.85rem", lineHeight: 1.7 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Glow divider ─────────────────────────────────────────── */}
      <div className="divider-glow" />

      {/* ───────────────────────── GAME MODES ───────────────────── */}
      <section className="landing-section mode-section" style={{ padding: "5rem 1rem" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <h2
              className="grad-text"
              style={{
                fontFamily: "var(--font-exo2, 'Exo 2', sans-serif)",
                fontWeight: 900,
                fontSize: "clamp(1.8rem, 5vw, 2.5rem)",
                marginBottom: "0.5rem",
              }}
            >
              Game Mode
            </h2>
          </div>
          <div className="glass-glow mode-card reveal" style={{ padding: "2.5rem", textAlign: "center" }}>
            <div style={{
              position: "relative",
              zIndex: 1,
            }}>
              <div style={{
                fontSize: "3.5rem",
                marginBottom: "1rem",
                filter: "drop-shadow(0 0 16px rgba(255,140,0,0.3))",
              }}>
                ⚔️
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-exo2, 'Exo 2', sans-serif)",
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: "1.5rem",
                  marginBottom: "0.6rem",
                }}
              >
                Classic Mode
              </h3>
              <p style={{
                color: "#8892a4",
                fontSize: "0.9rem",
                marginBottom: "1.5rem",
                maxWidth: "400px",
                margin: "0 auto 1.5rem",
                lineHeight: 1.7,
              }}>
                Slice fruit, avoid bombs, and try not to panic when the pace picks up.
                Every miss costs a life, so a little patience goes a long way.
              </p>
              <div style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "0.6rem",
              }}>
                {["3 Lives", "Combo ×2–×4", "Bombs", "Faster over time", "Saved scores"].map((tag) => (
                  <span
                    key={tag}
                    style={{
                      padding: "0.3rem 0.9rem",
                      borderRadius: "999px",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      border: "1px solid rgba(0,245,255,0.25)",
                      color: "#00f5ff",
                      background: "rgba(0,245,255,0.08)",
                      letterSpacing: "0.03em",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Glow divider ─────────────────────────────────────────── */}
      <div className="divider-glow" />

      {/* ───────────────────────── CTA BANNER ───────────────────── */}
      <section className="landing-section cta-section" style={{ padding: "5rem 1rem" }}>
        <div
          className="glass-glow reveal"
          style={{
            maxWidth: "640px",
            margin: "0 auto",
            padding: "3.5rem 2rem",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Inner radial glow */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background: "radial-gradient(ellipse at center, rgba(0,245,255,0.06) 0%, transparent 70%)",
              zIndex: 0,
            }}
          />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{
              fontSize: "3.2rem",
              marginBottom: "1.2rem",
              filter: "drop-shadow(0 0 12px rgba(0,245,255,0.2))",
            }}>
              🍉⚡🏆
            </div>
            <h2
              style={{
                fontFamily: "var(--font-exo2, 'Exo 2', sans-serif)",
                fontWeight: 900,
                fontSize: "clamp(1.6rem, 5vw, 2.2rem)",
                color: "#fff",
                marginBottom: "0.8rem",
              }}
            >
              Ready to{" "}
              <span className="shimmer-text">Dominate?</span>
            </h2>
            <p style={{
              color: "#8892a4",
              fontSize: "0.9rem",
              marginBottom: "2rem",
              maxWidth: "400px",
              margin: "0 auto 2rem",
              lineHeight: 1.7,
            }}>
              Make a profile, play a quick round, and leave your mark on the score board.
            </p>
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              justifyContent: "center",
            }}>
              <Link href="/register" className="btn-primary" id="cta-register-btn"
                style={{ padding: "0.85rem 2rem", fontSize: "0.95rem" }}>
                Create Free Account
              </Link>
              <Link href="/login" className="btn-outline" id="cta-login-btn"
                style={{ padding: "0.8rem 1.8rem", fontSize: "0.95rem" }}>
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
