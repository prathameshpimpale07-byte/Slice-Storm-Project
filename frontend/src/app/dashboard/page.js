"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { ApiError, getGameHistory } from "@/lib/api-client";
import { useAuth } from "@/components/AuthProvider";

const numberFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login?next=/dashboard");
      return;
    }

    getGameHistory()
      .then(setData)
      .catch((requestError) => {
        if (requestError instanceof ApiError && requestError.status === 401) {
          router.replace("/login?next=/dashboard");
        } else {
          setError("We could not load your dashboard. Please try again.");
        }
      })
      .finally(() => setLoading(false));
  }, [authLoading, router, user]);

  return (
    <main style={pageStyle}>
      <Navbar />
      <section style={contentStyle}>
        <p style={eyebrowStyle}>PLAYER PROFILE</p>
        <h1 style={headingStyle}>Welcome back, {user?.name || "player"}</h1>
        <p style={subheadingStyle}>Your saved Slice Storm performance at a glance.</p>

        {authLoading || loading ? <LoadingState label="Loading your stats..." /> : error ? (
          <MessageState message={error} />
        ) : (
          <>
            <div className="dashboard-stat-grid">
              <StatCard label="Highest Score" value={data.stats.highestScore} accent="#00f5ff" />
              <StatCard label="Total Games" value={data.stats.totalGames} accent="#39ff14" />
              <StatCard label="Fruits Sliced" value={data.stats.totalFruitsSliced} accent="#ff8c00" />
              <StatCard label="Best Combo" value={`×${data.stats.bestCombo}`} accent="#ff006e" />
              <StatCard label="Average Score" value={numberFormatter.format(data.stats.averageScore)} accent="#b36bff" />
            </div>
            <section className="glass" style={cardStyle}>
              <div style={sectionHeaderStyle}>
                <div>
                  <p style={eyebrowStyle}>RECENT RUNS</p>
                  <h2 style={sectionTitleStyle}>Game history</h2>
                </div>
                <Link href="/play" className="btn-primary" style={{ fontSize: "0.8rem", padding: "0.65rem 1rem" }}>
                  Play again
                </Link>
              </div>
              {data.games.length === 0 ? (
                <EmptyState />
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={tableStyle}>
                    <thead>
                      <tr><th>Mode</th><th>Score</th><th>Date</th><th>Duration</th></tr>
                    </thead>
                    <tbody>
                      {data.games.map((game) => (
                        <tr key={game.id}>
                          <td style={{ textTransform: "capitalize" }}>{game.mode}</td>
                          <td style={{ color: "#00f5ff", fontWeight: 700 }}>{game.score}</td>
                          <td>{formatDate(game.completedAt || game.createdAt)}</td>
                          <td>{formatDuration(game.durationSeconds)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </section>
    </main>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className="glass-sm" style={{ padding: "1.25rem", borderTop: `2px solid ${accent}` }}>
      <p style={{ ...eyebrowStyle, marginBottom: "0.65rem" }}>{label}</p>
      <strong style={{ color: accent, fontSize: "1.8rem", fontFamily: "var(--font-exo2, sans-serif)" }}>{value}</strong>
    </div>
  );
}

function LoadingState({ label }) {
  return <div className="glass" style={{ ...cardStyle, color: "#8892a4", textAlign: "center" }}>{label}</div>;
}

function MessageState({ message }) {
  return <div className="glass" style={{ ...cardStyle, color: "#ff6b9d", textAlign: "center" }}>{message}</div>;
}

function EmptyState() {
  return (
    <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "#8892a4" }}>
      <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🍉</p>
      <p>No completed games yet. Start your first run to build your history.</p>
    </div>
  );
}

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—";
}

function formatDuration(seconds) {
  if (!seconds) return "—";
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

const pageStyle = { minHeight: "100vh", background: "#080c17", color: "#fff" };
const contentStyle = { maxWidth: "1100px", margin: "0 auto", padding: "4rem 1rem" };
const cardStyle = { padding: "1.5rem", marginTop: "2rem" };
const eyebrowStyle = { color: "#00f5ff", fontSize: "0.7rem", letterSpacing: "0.16em", fontWeight: 700, margin: 0 };
const headingStyle = { fontFamily: "var(--font-exo2, sans-serif)", fontSize: "clamp(2rem, 5vw, 3.5rem)", margin: "0.5rem 0" };
const subheadingStyle = { color: "#8892a4", margin: 0 };
const sectionHeaderStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" };
const sectionTitleStyle = { margin: "0.35rem 0 0", fontSize: "1.5rem", fontFamily: "var(--font-exo2, sans-serif)" };
const tableStyle = { width: "100%", borderCollapse: "collapse", minWidth: "500px", color: "#c5ccda" };

