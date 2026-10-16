"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createFruit } from "@/game/fruit-config";
import { getDeltaSeconds, updateFruits } from "@/game/physics";

/* ══════════════════════════════════════════════════════════════════════════
   GameCanvas — Fruit spawning
   ─────────────────
   • Client component with a full-screen HTML5 canvas
   • Canvas auto-resizes to its container
   • requestAnimationFrame loop with proper cleanup
   • Placeholder HUD: score, combo, lives (readable on mobile)
   • Overlays: main menu, pause, restart, game-over
   ══════════════════════════════════════════════════════════════════════════ */

/* ── Game states ─────────────────────────────────────────────────────────── */
const STATE = {
  MENU: "MENU",
  PLAYING: "PLAYING",
  PAUSED: "PAUSED",
  GAME_OVER: "GAME_OVER",
};

/* ── Background star particles for canvas ────────────────────────────────── */
function createStars(count, w, h) {
  const stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.5 + 0.3,
      alpha: Math.random() * 0.5 + 0.2,
      speed: Math.random() * 0.3 + 0.05,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinkleDir: Math.random() > 0.5 ? 1 : -1,
    });
  }
  return stars;
}

export default function GameCanvas() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const starsRef = useRef([]);
  const fruitsRef = useRef([]);
  const lastFrameRef = useRef(null);
  const spawnTimerRef = useRef(0);
  const drawFrameRef = useRef(null);
  const gameStateRef = useRef(STATE.MENU);
  const loopRunningRef = useRef(false);
  const timeRef = useRef(0);

  const [gameState, setGameState] = useState(STATE.MENU);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [lives, setLives] = useState(3);

  /* ── Canvas resize logic ─────────────────────────────────────────────── */
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    // Re-create stars on resize
    starsRef.current = createStars(80, rect.width, rect.height);
  }, []);

  /* ── Animation loop ──────────────────────────────────────────────────── */
  const drawFrame = useCallback((timestamp) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    const deltaSeconds = getDeltaSeconds(timestamp, lastFrameRef.current);
    lastFrameRef.current = timestamp;

    // Save and reset transform
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Clear canvas
    ctx.clearRect(0, 0, w, h);

    // ── Draw background gradient ─────────────────────────────────────
    const bgGrad = ctx.createRadialGradient(w * 0.3, h * 0.3, 0, w * 0.5, h * 0.5, w * 0.8);
    bgGrad.addColorStop(0, "rgba(0,245,255,0.03)");
    bgGrad.addColorStop(0.5, "rgba(255,0,110,0.02)");
    bgGrad.addColorStop(1, "rgba(8,12,23,1)");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // ── Draw twinkling stars ─────────────────────────────────────────
    starsRef.current.forEach((s) => {
      // Twinkle animation
      s.alpha += s.twinkleSpeed * s.twinkleDir;
      if (s.alpha >= 0.7) { s.twinkleDir = -1; }
      if (s.alpha <= 0.15) { s.twinkleDir = 1; }

      // Slow drift downward
      s.y += s.speed;
      if (s.y > h + 5) {
        s.y = -5;
        s.x = Math.random() * w;
      }

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,220,255,${s.alpha})`;
      ctx.fill();
    });

    if (gameStateRef.current === STATE.PLAYING) {
      spawnTimerRef.current -= deltaSeconds;
      if (spawnTimerRef.current <= 0) {
        fruitsRef.current.push(createFruit(w, h));
        spawnTimerRef.current = 0.65 + Math.random() * 0.45;
      }

      fruitsRef.current = updateFruits(fruitsRef.current, deltaSeconds, h);

      fruitsRef.current.forEach((fruit) => {
        ctx.save();
        ctx.translate(fruit.x, fruit.y);
        ctx.rotate(fruit.rotation);
        ctx.shadowColor = fruit.color;
        ctx.shadowBlur = 16;
        ctx.font = `${fruit.radius * 2}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(fruit.emoji, 0, 0);
        ctx.restore();
      });
    }

    // ── Draw subtle grid lines ───────────────────────────────────────
    ctx.strokeStyle = "rgba(0,245,255,0.03)";
    ctx.lineWidth = 0.5;
    const gridSpacing = 60;
    for (let x = 0; x < w; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // ── Draw center "Ready" text when playing (placeholder) ──────────
    if (gameStateRef.current === STATE.PLAYING) {
      const pulse = Math.sin(timestamp * 0.002) * 0.15 + 0.85;
      ctx.globalAlpha = 0.08 * pulse;
      ctx.font = `bold ${Math.min(w * 0.12, 90)}px 'Exo 2', sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#00f5ff";
      ctx.fillText("SLICE!", w / 2, h / 2);
      ctx.globalAlpha = 1;
    }

    // ── Decorative border glow ───────────────────────────────────────
    const borderGrad = ctx.createLinearGradient(0, 0, w, 0);
    borderGrad.addColorStop(0, "rgba(0,245,255,0)");
    borderGrad.addColorStop(0.5, "rgba(0,245,255,0.15)");
    borderGrad.addColorStop(1, "rgba(0,245,255,0)");
    ctx.strokeStyle = borderGrad;
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, w, h);

    ctx.restore();

    timeRef.current = timestamp;
    if (loopRunningRef.current) {
      animRef.current = requestAnimationFrame((nextTimestamp) => {
        drawFrameRef.current?.(nextTimestamp);
      });
    }
  }, []);

  /* ── Setup / Teardown ────────────────────────────────────────────────── */
  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    drawFrameRef.current = drawFrame;
    drawFrame(performance.now());

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      loopRunningRef.current = false;
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
      animRef.current = null;
      drawFrameRef.current = null;
      lastFrameRef.current = null;
    };
  }, [resizeCanvas, drawFrame]);

  useEffect(() => {
    gameStateRef.current = gameState;

    if (gameState === STATE.PLAYING) {
      loopRunningRef.current = false;
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
      animRef.current = null;
      lastFrameRef.current = null;
      loopRunningRef.current = true;
      animRef.current = requestAnimationFrame((timestamp) => {
        drawFrameRef.current?.(timestamp);
      });
    } else {
      loopRunningRef.current = false;
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
      animRef.current = null;
      lastFrameRef.current = null;
      drawFrame(performance.now());
    }
  }, [drawFrame, gameState]);

  /* ── Game state handlers ─────────────────────────────────────────────── */
  const handleStart = () => {
    setScore(0);
    setCombo(1);
    setLives(3);
    fruitsRef.current = [];
    spawnTimerRef.current = 0;
    lastFrameRef.current = null;
    setGameState(STATE.PLAYING);
  };

  const handlePause = () => {
    setGameState(STATE.PAUSED);
  };

  const handleResume = () => {
    setGameState(STATE.PLAYING);
  };

  const handleRestart = () => {
    setScore(0);
    setCombo(1);
    setLives(3);
    fruitsRef.current = [];
    spawnTimerRef.current = 0;
    lastFrameRef.current = null;
    setGameState(STATE.PLAYING);
  };

  const handleQuit = () => {
    setGameState(STATE.MENU);
  };

  const handleGameOver = () => {
    setGameState(STATE.GAME_OVER);
  };

  /* ═══════════════════════════════════════════════════════════════════════ */
  return (
    <div
      ref={containerRef}
      id="game-container"
      style={{
        position: "relative",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        minHeight: "100vh",
      }}
    >
      {/* ── Canvas ─────────────────────────────────────────────────────── */}
      <canvas
        ref={canvasRef}
        id="game-canvas"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
          cursor: gameState === STATE.PLAYING ? "crosshair" : "default",
        }}
      />

      {/* ── HUD (visible during PLAYING state) ─────────────────────────── */}
      {gameState === STATE.PLAYING && (
        <div
          id="game-hud"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 20,
            padding: "0.75rem 1rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "linear-gradient(to bottom, rgba(8,12,23,0.85) 0%, transparent 100%)",
            pointerEvents: "none",
          }}
        >
          {/* Score */}
          <div style={{ pointerEvents: "auto" }}>
            <div style={{
              fontSize: "0.65rem",
              color: "#8892a4",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontWeight: 600,
              marginBottom: "2px",
            }}>
              Score
            </div>
            <div style={{
              fontFamily: "'Exo 2', sans-serif",
              fontSize: "clamp(1.2rem, 4vw, 1.8rem)",
              fontWeight: 900,
              color: "#00f5ff",
              textShadow: "0 0 16px rgba(0,245,255,0.5)",
              lineHeight: 1,
            }}>
              {score}
            </div>
          </div>

          {/* Combo */}
          <div style={{ textAlign: "center", pointerEvents: "auto" }}>
            <div style={{
              fontSize: "0.65rem",
              color: "#8892a4",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontWeight: 600,
              marginBottom: "2px",
            }}>
              Combo
            </div>
            <div style={{
              fontFamily: "'Exo 2', sans-serif",
              fontSize: "clamp(1.2rem, 4vw, 1.8rem)",
              fontWeight: 900,
              color: combo > 1 ? "#39ff14" : "#ff8c00",
              textShadow: combo > 1 ? "0 0 16px rgba(57,255,20,0.5)" : "0 0 16px rgba(255,140,0,0.4)",
              lineHeight: 1,
            }}>
              ×{combo}
            </div>
          </div>

          {/* Pause button */}
          <button
            onClick={handlePause}
            id="pause-btn"
            style={{
              pointerEvents: "auto",
              background: "rgba(0,245,255,0.08)",
              border: "1px solid rgba(0,245,255,0.2)",
              borderRadius: "10px",
              color: "#00f5ff",
              padding: "0.4rem 0.8rem",
              cursor: "pointer",
              fontFamily: "'Exo 2', sans-serif",
              fontWeight: 700,
              fontSize: "0.75rem",
              letterSpacing: "0.05em",
              transition: "all 0.2s",
            }}
          >
            ⏸ PAUSE
          </button>

          {/* Lives */}
          <div style={{ textAlign: "right", pointerEvents: "auto" }}>
            <div style={{
              fontSize: "0.65rem",
              color: "#8892a4",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontWeight: 600,
              marginBottom: "2px",
            }}>
              Lives
            </div>
            <div style={{
              fontSize: "clamp(1rem, 3.5vw, 1.5rem)",
              lineHeight: 1,
              filter: "drop-shadow(0 0 6px rgba(255,0,110,0.4))",
            }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <span
                  key={i}
                  style={{
                    opacity: i < lives ? 1 : 0.2,
                    transition: "opacity 0.3s ease",
                    marginLeft: i > 0 ? "3px" : 0,
                  }}
                >
                  ❤️
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MENU Overlay ───────────────────────────────────────────────── */}
      {gameState === STATE.MENU && (
        <Overlay>
          <div style={{
            fontSize: "3.5rem",
            marginBottom: "0.5rem",
            filter: "drop-shadow(0 0 16px rgba(0,245,255,0.3))",
          }}>
            🍉⚡
          </div>
          <h1
            className="grad-text"
            style={{
              fontFamily: "'Exo 2', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(2rem, 8vw, 3.5rem)",
              lineHeight: 1,
              marginBottom: "0.5rem",
            }}
          >
            SLICE STORM
          </h1>
          <p style={{
            color: "#8892a4",
            fontSize: "clamp(0.8rem, 2.5vw, 1rem)",
            marginBottom: "2rem",
            maxWidth: "320px",
            lineHeight: 1.6,
          }}>
            Slash fruits. Dodge bombs. Climb the leaderboard.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%", maxWidth: "260px" }}>
            <OverlayButton onClick={handleStart} primary>
              🎮 Start Game
            </OverlayButton>
            <OverlayButton as={Link} href="/" outline>
              ← Back to Home
            </OverlayButton>
          </div>
        </Overlay>
      )}

      {/* ── PAUSED Overlay ─────────────────────────────────────────────── */}
      {gameState === STATE.PAUSED && (
        <Overlay>
          <div style={{
            fontSize: "2.5rem",
            marginBottom: "0.5rem",
          }}>
            ⏸️
          </div>
          <h2 style={{
            fontFamily: "'Exo 2', sans-serif",
            fontWeight: 900,
            fontSize: "clamp(1.5rem, 6vw, 2.5rem)",
            color: "#fff",
            marginBottom: "0.5rem",
          }}>
            PAUSED
          </h2>
          <p style={{ color: "#8892a4", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
            Take a breather — your game is safe.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%", maxWidth: "260px" }}>
            <OverlayButton onClick={handleResume} primary>
              ▶ Resume
            </OverlayButton>
            <OverlayButton onClick={handleRestart} outline>
              🔄 Restart
            </OverlayButton>
            <OverlayButton onClick={handleQuit} outline>
              ← Quit to Menu
            </OverlayButton>
          </div>
        </Overlay>
      )}

      {/* ── GAME OVER Overlay ──────────────────────────────────────────── */}
      {gameState === STATE.GAME_OVER && (
        <Overlay>
          <div style={{
            fontSize: "2.5rem",
            marginBottom: "0.5rem",
          }}>
            💥
          </div>
          <h2 style={{
            fontFamily: "'Exo 2', sans-serif",
            fontWeight: 900,
            fontSize: "clamp(1.5rem, 6vw, 2.5rem)",
            color: "#ff006e",
            textShadow: "0 0 24px rgba(255,0,110,0.4)",
            marginBottom: "0.5rem",
          }}>
            GAME OVER
          </h2>

          {/* Score summary */}
          <div
            className="glass-sm"
            style={{
              padding: "1rem 1.5rem",
              marginBottom: "1.5rem",
              display: "flex",
              gap: "2rem",
              justifyContent: "center",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.65rem", color: "#8892a4", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
                Final Score
              </div>
              <div style={{
                fontFamily: "'Exo 2', sans-serif",
                fontSize: "1.5rem",
                fontWeight: 900,
                color: "#00f5ff",
                textShadow: "0 0 12px rgba(0,245,255,0.4)",
              }}>
                {score}
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.65rem", color: "#8892a4", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
                Best Combo
              </div>
              <div style={{
                fontFamily: "'Exo 2', sans-serif",
                fontSize: "1.5rem",
                fontWeight: 900,
                color: "#39ff14",
                textShadow: "0 0 12px rgba(57,255,20,0.4)",
              }}>
                ×{combo}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%", maxWidth: "260px" }}>
            <OverlayButton onClick={handleRestart} primary>
              🔄 Play Again
            </OverlayButton>
            <OverlayButton as={Link} href="/leaderboard" outline>
              🏆 Leaderboard
            </OverlayButton>
            <OverlayButton onClick={handleQuit} outline>
              ← Main Menu
            </OverlayButton>
          </div>
        </Overlay>
      )}

      {/* ── Debug: Game Over trigger (placeholder — remove when gameplay is wired) */}
      {gameState === STATE.PLAYING && (
        <button
          onClick={handleGameOver}
          id="debug-gameover-btn"
          style={{
            position: "absolute",
            bottom: "1rem",
            right: "1rem",
            zIndex: 30,
            background: "rgba(255,0,110,0.12)",
            border: "1px solid rgba(255,0,110,0.3)",
            borderRadius: "8px",
            color: "#ff006e",
            padding: "0.4rem 0.8rem",
            cursor: "pointer",
            fontFamily: "'Exo 2', sans-serif",
            fontWeight: 600,
            fontSize: "0.7rem",
            letterSpacing: "0.03em",
            opacity: 0.6,
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => e.target.style.opacity = "1"}
          onMouseLeave={(e) => e.target.style.opacity = "0.6"}
        >
          ⚙ Debug: Game Over
        </button>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Overlay wrapper — glassmorphism centered modal
   ══════════════════════════════════════════════════════════════════════════ */
function Overlay({ children }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(8,12,23,0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "rgba(15,20,40,0.7)",
          backdropFilter: "blur(24px) saturate(1.8)",
          WebkitBackdropFilter: "blur(24px) saturate(1.8)",
          border: "1px solid rgba(0,245,255,0.12)",
          borderRadius: "24px",
          padding: "2.5rem 2rem",
          textAlign: "center",
          maxWidth: "400px",
          width: "100%",
          position: "relative",
          overflow: "hidden",
          animation: "slideUp 0.4s cubic-bezier(.16,1,.3,1) forwards",
        }}
      >
        {/* Inner glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at 50% 0%, rgba(0,245,255,0.06) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Overlay button component
   ══════════════════════════════════════════════════════════════════════════ */
function OverlayButton({ children, onClick, primary, outline, as: Component = "button", ...props }) {
  const baseStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.4rem",
    width: "100%",
    padding: "0.75rem 1.5rem",
    borderRadius: "12px",
    fontFamily: "'Exo 2', sans-serif",
    fontWeight: 700,
    fontSize: "0.9rem",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    cursor: "pointer",
    transition: "all 0.22s cubic-bezier(.4,0,.2,1)",
    textDecoration: "none",
    border: "none",
    outline: "none",
  };

  const primaryStyle = {
    ...baseStyle,
    background: "linear-gradient(135deg, #00f5ff 0%, #0077ff 100%)",
    color: "#080c17",
    boxShadow: "0 4px 24px rgba(0,245,255,0.3)",
  };

  const outlineStyle = {
    ...baseStyle,
    background: "rgba(0,245,255,0.05)",
    color: "#00f5ff",
    border: "1.5px solid rgba(0,245,255,0.3)",
  };

  return (
    <Component
      onClick={onClick}
      style={primary ? primaryStyle : outlineStyle}
      onMouseEnter={(e) => {
        if (primary) {
          e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
          e.currentTarget.style.boxShadow = "0 8px 36px rgba(0,245,255,0.5)";
        } else {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.background = "rgba(0,245,255,0.1)";
          e.currentTarget.style.boxShadow = "0 0 24px rgba(0,245,255,0.2)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        if (primary) {
          e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,245,255,0.3)";
        } else {
          e.currentTarget.style.background = "rgba(0,245,255,0.05)";
          e.currentTarget.style.boxShadow = "none";
        }
      }}
      {...props}
    >
      {children}
    </Component>
  );
}
