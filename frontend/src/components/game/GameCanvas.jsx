"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createFruit } from "@/game/fruit-config";
import { createBomb } from "@/game/bomb";
import { getDifficulty } from "@/game/difficulty";
import { getDeltaSeconds, updateFruit, updateFruitsWithMisses } from "@/game/physics";
import { hitBombsBySegment, sliceFruitsBySegment } from "@/game/collision";
import { calculateSliceScore, createScoreLabels } from "@/game/scoring";
import { createBurst, drawParticles, updateParticles } from "@/game/particles";
import { completeGame, startGame } from "@/lib/api-client";
import {
  getAudioSettings,
  playSound,
  resumeAudio,
  setMusicEnabled,
  setSoundEffectsEnabled,
  startMusic,
  stopMusic,
} from "@/game/audio";

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

const TRAIL_DURATION_MS = 240;
const MAX_TRAIL_POINTS = 18;
const SLICE_ANIMATION_DURATION_MS = 180;
const SCORE_LABEL_DURATION_MS = 700;
const COMBO_MESSAGE_DURATION_MS = 900;
const SCREEN_FLASH_DURATION_MS = 120;
const BOMB_ANIMATION_DURATION_MS = 220;
const MAX_MISSES = 3;

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
  const bombsRef = useRef([]);
  const lastFrameRef = useRef(null);
  const spawnTimerRef = useRef(0);
  const drawFrameRef = useRef(null);
  const canvasDprRef = useRef(1);
  const gameStateRef = useRef(STATE.MENU);
  const loopRunningRef = useRef(false);
  const pointerActiveRef = useRef(false);
  const pointerTrailRef = useRef([]);
  const scoreLabelsRef = useRef([]);
  const comboMessageRef = useRef(null);
  const particlesRef = useRef([]);
  const screenFlashRef = useRef(0);
  const livesRef = useRef(3);
  const missesRef = useRef(0);
  const elapsedGameSecondsRef = useRef(0);
  const timeRef = useRef(0);
  const bombsHitRef = useRef(0);
  const bestComboRef = useRef(1);
  const sessionIdRef = useRef(null);
  const completionSubmittedRef = useRef(false);

  const [gameState, setGameState] = useState(STATE.MENU);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [lives, setLives] = useState(3);
  const [misses, setMisses] = useState(0);
  const [totalSliced, setTotalSliced] = useState(0);
  const [bestCombo, setBestCombo] = useState(1);
  const [audioSettings, setAudioSettings] = useState(getAudioSettings);
  const [startError, setStartError] = useState("");
  const [completionStatus, setCompletionStatus] = useState(null);

  /* ── Canvas resize logic ─────────────────────────────────────────────── */
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvasDprRef.current = dpr;

    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Re-create stars on resize
    starsRef.current = createStars(80, rect.width, rect.height);
  }, []);

  /* ── Animation loop ──────────────────────────────────────────────────── */
  const drawFrame = useCallback((timestamp) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = canvasDprRef.current;
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

    const trailCutoff = timestamp - TRAIL_DURATION_MS;
    pointerTrailRef.current = pointerTrailRef.current.filter(
      (point) => point.time >= trailCutoff
    );
    const trail = pointerTrailRef.current;
    if (trail.length > 1) {
      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowColor = "#00f5ff";
      ctx.shadowBlur = 18;

      for (let i = 1; i < trail.length; i += 1) {
        const previous = trail[i - 1];
        const point = trail[i];
        const opacity = Math.max(0, 1 - (timestamp - point.time) / TRAIL_DURATION_MS);
        ctx.beginPath();
        ctx.moveTo(previous.x, previous.y);
        ctx.lineTo(point.x, point.y);
        ctx.strokeStyle = `rgba(0, 245, 255, ${opacity})`;
        ctx.lineWidth = 3 + opacity * 5;
        ctx.stroke();
      }

      ctx.restore();
    }

    if (gameStateRef.current === STATE.PLAYING) {
      elapsedGameSecondsRef.current += deltaSeconds;
      const difficulty = getDifficulty(elapsedGameSecondsRef.current);
      spawnTimerRef.current -= deltaSeconds;
      if (spawnTimerRef.current <= 0) {
        if (fruitsRef.current.length < difficulty.maxFruits) {
          fruitsRef.current.push(createFruit(w, h, difficulty.speedMultiplier));
        }
        if (
          Math.random() < difficulty.bombChance
          && bombsRef.current.length < Math.ceil(difficulty.maxFruits / 3)
        ) {
          bombsRef.current.push(createBomb(w, h, difficulty.speedMultiplier));
        }
        spawnTimerRef.current = difficulty.spawnInterval * (0.8 + Math.random() * 0.35);
      }

      const fruitUpdate = updateFruitsWithMisses(fruitsRef.current, deltaSeconds, h);
      fruitsRef.current = fruitUpdate.active
        .filter((fruit) => (
          !fruit.sliced
          || timestamp - fruit.slicedAt < SLICE_ANIMATION_DURATION_MS
        ));
      if (fruitUpdate.missed.length > 0) {
        const nextMisses = missesRef.current + fruitUpdate.missed.length;
        missesRef.current = nextMisses;
        setMisses(nextMisses);
        if (nextMisses >= MAX_MISSES) {
          gameStateRef.current = STATE.GAME_OVER;
          loopRunningRef.current = false;
          setGameState(STATE.GAME_OVER);
        }
      }

      bombsRef.current = bombsRef.current
        .map((bomb) => updateFruit(bomb, deltaSeconds))
        .filter((bomb) => (
          bomb.y - bomb.radius <= h + bomb.radius
          && (!bomb.hit || timestamp - bomb.hitAt < BOMB_ANIMATION_DURATION_MS)
        ));

      fruitsRef.current.forEach((fruit) => {
        ctx.save();
        ctx.translate(fruit.x, fruit.y);
        ctx.rotate(fruit.rotation);
        if (fruit.sliced) {
          const progress = Math.min(
            1,
            (timestamp - fruit.slicedAt) / SLICE_ANIMATION_DURATION_MS
          );
          ctx.globalAlpha = 1 - progress;
          ctx.scale(1 + progress * 0.45, 1 + progress * 0.45);
        }
        ctx.shadowColor = fruit.color;
        ctx.shadowBlur = 16;
        ctx.font = `${fruit.radius * 2}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(fruit.emoji, 0, 0);
        ctx.restore();
      });

      bombsRef.current.forEach((bomb) => {
        ctx.save();
        ctx.translate(bomb.x, bomb.y);
        ctx.rotate(bomb.rotation);
        const progress = bomb.hit
          ? Math.min(1, (timestamp - bomb.hitAt) / BOMB_ANIMATION_DURATION_MS)
          : 0;
        ctx.globalAlpha = 1 - progress;
        ctx.shadowColor = bomb.color;
        ctx.shadowBlur = 18;
        ctx.font = `${bomb.radius * 2}px "Segoe UI Emoji", sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("💣", 0, 0);
        ctx.restore();
      });
    }

    particlesRef.current = updateParticles(
      particlesRef.current,
      deltaSeconds,
      timestamp
    );
    drawParticles(ctx, particlesRef.current, timestamp);

    scoreLabelsRef.current = scoreLabelsRef.current.filter(
      (label) => timestamp - label.createdAt < SCORE_LABEL_DURATION_MS
    );
    scoreLabelsRef.current.forEach((label) => {
      const progress = (timestamp - label.createdAt) / SCORE_LABEL_DURATION_MS;
      ctx.save();
      ctx.globalAlpha = 1 - progress;
      ctx.fillStyle = label.color;
      ctx.shadowColor = label.color;
      ctx.shadowBlur = 12;
      ctx.font = "900 18px 'Exo 2', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(label.text, label.x, label.y - progress * 42);
      ctx.restore();
    });

    if (comboMessageRef.current) {
      const messageAge = timestamp - comboMessageRef.current.createdAt;
      if (messageAge >= COMBO_MESSAGE_DURATION_MS) {
        comboMessageRef.current = null;
      } else {
        const progress = messageAge / COMBO_MESSAGE_DURATION_MS;
        ctx.save();
        ctx.globalAlpha = Math.min(1, (1 - progress) * 1.5);
        ctx.fillStyle = "#39ff14";
        ctx.shadowColor = "#39ff14";
        ctx.shadowBlur = 18;
        ctx.font = "900 30px 'Exo 2', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(
          comboMessageRef.current.text,
          w / 2,
          h * 0.35 - progress * 24
        );
        ctx.restore();
      }
    }

    if (screenFlashRef.current > timestamp) {
      ctx.save();
      ctx.globalAlpha = (screenFlashRef.current - timestamp) / SCREEN_FLASH_DURATION_MS * 0.18;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
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

  const getCanvasPoint = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      time: performance.now(),
    };
  };

  const addPointerPoint = (event) => {
    const point = getCanvasPoint(event);
    if (!point) return;

    pointerTrailRef.current = [
      ...pointerTrailRef.current.slice(-(MAX_TRAIL_POINTS - 1)),
      point,
    ];
  };

  const processSwipeSegment = (start, end) => {
    const hitBombs = hitBombsBySegment(
      bombsRef.current,
      start,
      end,
      end.time
    );
    if (hitBombs.length > 0) {
      playSound("bomb");
      bombsHitRef.current += hitBombs.length;
      const nextLives = Math.max(0, livesRef.current - hitBombs.length);
      livesRef.current = nextLives;
      setLives(nextLives);
      screenFlashRef.current = end.time + SCREEN_FLASH_DURATION_MS;
      if (nextLives === 0) {
        gameStateRef.current = STATE.GAME_OVER;
        loopRunningRef.current = false;
        setGameState(STATE.GAME_OVER);
        return;
      }
    }

    const slicedFruits = sliceFruitsBySegment(
      fruitsRef.current,
      start,
      end,
      end.time
    );
    if (slicedFruits.length === 0) return;

    const scoreResult = calculateSliceScore(slicedFruits, combo);
    playSound("slice");
    if (scoreResult.milestoneMessage) playSound("combo");
    slicedFruits.forEach((fruit) => {
      particlesRef.current.push(
        ...createBurst(fruit.x, fruit.y, fruit.color, end.time)
      );
    });
    particlesRef.current = particlesRef.current.slice(-240);
    screenFlashRef.current = end.time + SCREEN_FLASH_DURATION_MS;
    setScore((currentScore) => currentScore + scoreResult.totalPoints);
    setCombo(scoreResult.nextCombo);
    setTotalSliced((currentTotal) => currentTotal + slicedFruits.length);
    setBestCombo((currentBest) => {
      const next = Math.max(currentBest, scoreResult.nextCombo);
      bestComboRef.current = next;
      return next;
    });
    scoreLabelsRef.current.push(
      ...createScoreLabels(slicedFruits, scoreResult, end.time)
    );
    if (scoreResult.milestoneMessage) {
      comboMessageRef.current = {
        text: scoreResult.milestoneMessage,
        createdAt: end.time,
      };
    }
  };

  const handlePointerDown = (event) => {
    if (gameStateRef.current !== STATE.PLAYING) return;
    pointerActiveRef.current = true;
    pointerTrailRef.current = [];
    event.currentTarget.setPointerCapture(event.pointerId);
    addPointerPoint(event);
  };

  const handlePointerMove = (event) => {
    if (!pointerActiveRef.current) return;
    const previousPoint = pointerTrailRef.current.at(-1);
    const point = getCanvasPoint(event);
    if (!point) return;
    if (previousPoint) {
      processSwipeSegment(previousPoint, point);
    }
    addPointerPoint(event);
  };

  const handlePointerEnd = (event) => {
    if (!pointerActiveRef.current) return;
    const previousPoint = pointerTrailRef.current.at(-1);
    const point = getCanvasPoint(event);
    if (previousPoint && point) {
      processSwipeSegment(previousPoint, point);
    }
    addPointerPoint(event);
    pointerActiveRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  /* ── Setup / Teardown ────────────────────────────────────────────────── */
  useEffect(() => {
    resizeCanvas();
    const container = containerRef.current;
    const resizeObserver = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(resizeCanvas);
    resizeObserver?.observe(container);
    window.addEventListener("resize", resizeCanvas);
    drawFrameRef.current = drawFrame;
    drawFrame(performance.now());

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", resizeCanvas);
      stopMusic();
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
      startMusic();
      loopRunningRef.current = false;
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
      animRef.current = null;
      lastFrameRef.current = null;
      loopRunningRef.current = true;
      animRef.current = requestAnimationFrame((timestamp) => {
        drawFrameRef.current?.(timestamp);
      });
    } else {
      stopMusic();
      if (gameState === STATE.GAME_OVER) playSound("gameOver");
      loopRunningRef.current = false;
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
      animRef.current = null;
      lastFrameRef.current = null;
      drawFrame(performance.now());
    }
  }, [drawFrame, gameState]);

  useEffect(() => {
    if (gameState !== STATE.GAME_OVER || !sessionIdRef.current || completionSubmittedRef.current) {
      return;
    }

    completionSubmittedRef.current = true;
    setCompletionStatus("saving");
    const durationSeconds = Math.max(1, Math.ceil(elapsedGameSecondsRef.current));
    const accuracy = totalSliced + misses > 0
      ? (totalSliced / (totalSliced + misses)) * 100
      : 0;

    completeGame({
      sessionId: sessionIdRef.current,
      score,
      fruitsSliced: totalSliced,
      bombsHit: bombsHitRef.current,
      maxCombo: Math.max(1, bestComboRef.current),
      accuracy,
      durationSeconds,
    })
      .then(() => setCompletionStatus("saved"))
      .catch(() => setCompletionStatus("failed"));
  }, [bestCombo, gameState, misses, score, totalSliced]);

  /* ── Game state handlers ─────────────────────────────────────────────── */
  const beginGame = async () => {
    setStartError("");
    try {
      const result = await startGame();
      sessionIdRef.current = result.game.sessionId;
      completionSubmittedRef.current = false;
    } catch (error) {
      setStartError(error.message || "Unable to start a game. Please try again.");
      return;
    }

    resumeAudio();
    playSound("start");
    setScore(0);
    setCombo(1);
    setLives(3);
    setMisses(0);
    livesRef.current = 3;
    missesRef.current = 0;
    elapsedGameSecondsRef.current = 0;
    bombsHitRef.current = 0;
    bestComboRef.current = 1;
    setTotalSliced(0);
    setBestCombo(1);
    fruitsRef.current = [];
    bombsRef.current = [];
    spawnTimerRef.current = 0;
    lastFrameRef.current = null;
    pointerTrailRef.current = [];
    scoreLabelsRef.current = [];
    comboMessageRef.current = null;
    particlesRef.current = [];
    screenFlashRef.current = 0;
    setCompletionStatus(null);
    setGameState(STATE.PLAYING);
  };

  const handleStart = () => {
    void beginGame();
  };

  const handlePause = () => {
    playSound("button");
    setGameState(STATE.PAUSED);
  };

  const handleResume = () => {
    resumeAudio();
    playSound("button");
    setGameState(STATE.PLAYING);
  };

  const handleRestart = () => {
    void beginGame();
  };

  const handleQuit = () => {
    playSound("button");
    setGameState(STATE.MENU);
  };

  const toggleSoundEffects = () => {
    const enabled = !audioSettings.soundEffectsEnabled;
    setSoundEffectsEnabled(enabled);
    setAudioSettings((current) => ({ ...current, soundEffectsEnabled: enabled }));
    if (enabled) {
      resumeAudio();
      playSound("button");
    }
  };

  const toggleMusic = () => {
    const enabled = !audioSettings.musicEnabled;
    setMusicEnabled(enabled);
    setAudioSettings((current) => ({ ...current, musicEnabled: enabled }));
    if (enabled) {
      resumeAudio();
      startMusic();
    }
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
          touchAction: "none",
          userSelect: "none",
          WebkitUserSelect: "none",
          WebkitTapHighlightColor: "transparent",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
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

          {/* Run stats */}
          <div style={{ textAlign: "center", pointerEvents: "auto" }}>
            <div style={{
              fontSize: "0.65rem",
              color: "#8892a4",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontWeight: 600,
              marginBottom: "2px",
            }}>
              Sliced
            </div>
            <div style={{
              fontFamily: "'Exo 2', sans-serif",
              fontSize: "clamp(1rem, 3.5vw, 1.5rem)",
              fontWeight: 900,
              color: "#ff8c00",
              lineHeight: 1,
            }}>
              {totalSliced}
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

          <div style={{ textAlign: "center", pointerEvents: "auto" }}>
            <div style={{
              fontSize: "0.65rem",
              color: "#8892a4",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontWeight: 600,
              marginBottom: "2px",
            }}>
              Best
            </div>
            <div style={{
              fontFamily: "'Exo 2', sans-serif",
              fontSize: "clamp(1rem, 3.5vw, 1.5rem)",
              fontWeight: 900,
              color: "#39ff14",
              lineHeight: 1,
            }}>
              ×{bestCombo}
            </div>
          </div>

          <div className="game-hud-secondary">
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

            <div style={{ textAlign: "right", pointerEvents: "auto" }}>
              <div style={{
                fontSize: "0.65rem",
                color: "#8892a4",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontWeight: 600,
                marginBottom: "2px",
              }}>
                Misses
              </div>
              <div style={{
                fontFamily: "'Exo 2', sans-serif",
                fontSize: "clamp(1rem, 3.5vw, 1.5rem)",
                fontWeight: 900,
                color: misses > 1 ? "#ff006e" : "#ff8c00",
                lineHeight: 1,
              }}>
                {misses}/{MAX_MISSES}
              </div>
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
          {startError && (
            <p role="alert" style={{ color: "#ff6b9d", fontSize: "0.8rem", marginBottom: "1rem" }}>
              {startError}
            </p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%", maxWidth: "260px" }}>
            <OverlayButton onClick={handleStart} primary>
              🎮 Start Game
            </OverlayButton>
            <OverlayButton as={Link} href="/" outline>
              ← Back to Home
            </OverlayButton>
          </div>
          <div style={{
            display: "flex",
            gap: "0.5rem",
            justifyContent: "center",
            width: "100%",
            marginTop: "1.25rem",
          }}>
            <OverlayButton onClick={toggleSoundEffects} outline>
              {audioSettings.soundEffectsEnabled ? "🔊 SFX On" : "🔇 SFX Off"}
            </OverlayButton>
            <OverlayButton onClick={toggleMusic} outline>
              {audioSettings.musicEnabled ? "🎵 Music On" : "🎵 Music Off"}
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
          <p
            role={completionStatus === "failed" ? "alert" : undefined}
            style={{
              color: completionStatus === "saved" ? "#39ff14" : "#ff6b9d",
              fontSize: "0.8rem",
              minHeight: "1.2rem",
              marginBottom: "1rem",
            }}
          >
            {completionStatus === "saving" && "Saving your score..."}
            {completionStatus === "saved" && "Score saved successfully."}
            {completionStatus === "failed" && "Score could not be saved. Please try again later."}
          </p>

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
