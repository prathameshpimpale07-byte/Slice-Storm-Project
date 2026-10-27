"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { getLeaderboard, getMyLeaderboardRank } from "@/lib/api-client";
import { useAuth } from "@/components/AuthProvider";

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getLeaderboard({ page: 1, limit: 50 }), user ? getMyLeaderboardRank() : Promise.resolve(null)])
      .then(([leaderboard, rank]) => {
        setData(leaderboard);
        setMyRank(rank);
      })
      .catch(() => setError("We could not load the leaderboard. Please try again."))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <main style={pageStyle}>
      <Navbar />
      <section style={contentStyle}>
        <p style={eyebrowStyle}>GLOBAL RANKINGS</p>
        <h1 style={headingStyle}>Leaderboard</h1>
        <p style={subheadingStyle}>The best completed runs, ranked by score.</p>
        {loading ? <MessageState message="Loading rankings..." /> : error ? <MessageState message={error} error /> : (
          <section className="glass" style={cardStyle}>
            {myRank?.rank ? (
              <div className="glass-sm" style={{ padding: "1rem", marginBottom: "1.25rem", color: "#c5ccda" }}>
                Your best: <strong style={{ color: "#00f5ff" }}>#{myRank.rank}</strong> with {myRank.score} points
              </div>
            ) : user ? (
              <div style={{ color: "#8892a4", marginBottom: "1.25rem" }}>Complete a game to appear on the leaderboard.</div>
            ) : null}
            {data.leaderboard.length === 0 ? <EmptyState /> : (
              <div style={{ overflowX: "auto" }}>
                <table style={tableStyle}>
                  <thead><tr><th>Rank</th><th>Player</th><th>Score</th></tr></thead>
                  <tbody>
                    {data.leaderboard.map((entry, i) => {
                      const isCurrentPlayer = myRank?.rank === entry.rank && myRank?.score === entry.score && myRank?.playerName === entry.playerName;
                      return (
                        <tr key={`${entry.rank}-${entry.playerName}-${entry.score}-${i}`} style={isCurrentPlayer ? { background: "rgba(0,245,255,0.1)" } : undefined}>
                          <td style={{ color: entry.rank <= 3 ? "#ff8c00" : "#8892a4", fontWeight: 700 }}>#{entry.rank}</td>
                          <td>{entry.playerName}{isCurrentPlayer && <span style={{ color: "#00f5ff", fontSize: "0.7rem", marginLeft: "0.5rem" }}>YOU</span>}</td>
                          <td style={{ color: "#00f5ff", fontWeight: 700 }}>{entry.score}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
              <Link href={user ? "/play" : "/register"} className="btn-primary" style={{ fontSize: "0.85rem" }}>
                {user ? "Play for a higher rank" : "Join the rankings"}
              </Link>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

function MessageState({ message, error = false }) {
  return <div className="glass" style={{ ...cardStyle, textAlign: "center", color: error ? "#ff6b9d" : "#8892a4" }}>{message}</div>;
}

function EmptyState() {
  return <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "#8892a4" }}><p style={{ fontSize: "2rem" }}>🏆</p><p>No completed scores yet.</p></div>;
}

const pageStyle = { minHeight: "100vh", background: "#080c17", color: "#fff" };
const contentStyle = { maxWidth: "900px", margin: "0 auto", padding: "4rem 1rem" };
const cardStyle = { padding: "1.5rem", marginTop: "2rem" };
const eyebrowStyle = { color: "#00f5ff", fontSize: "0.7rem", letterSpacing: "0.16em", fontWeight: 700, margin: 0 };
const headingStyle = { fontFamily: "var(--font-exo2, sans-serif)", fontSize: "clamp(2rem, 5vw, 3.5rem)", margin: "0.5rem 0" };
const subheadingStyle = { color: "#8892a4", margin: 0 };
const tableStyle = { width: "100%", borderCollapse: "collapse", minWidth: "440px", color: "#c5ccda" };

