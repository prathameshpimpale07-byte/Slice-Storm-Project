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
        background:
          "radial-gradient(ellipse at 30% 30%, rgba(0,245,255,0.05) 0%, transparent 55%), " +
          "radial-gradient(ellipse at 70% 70%, rgba(255,0,110,0.04) 0%, transparent 50%), " +
          "#080c17",
      }}
    >
      <GameCanvas />
    </div>
  );
}
