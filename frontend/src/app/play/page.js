import GameCanvas from "@/components/game/GameCanvas";

export const metadata = {
  title: "Play — Slice Storm",
  description: "Slice fruits, dodge bombs, and climb the leaderboard in Slice Storm!",
};

export default function PlayPage() {
  return (
    <div
      id="play-page"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#0b1320",
      }}
    >
      <GameCanvas />
    </div>
  );
}
