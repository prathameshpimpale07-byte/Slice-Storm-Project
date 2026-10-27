import express from "express";
import { getLeaderboard, getMyLeaderboardRank } from "../controllers/leaderboard.js";
import { requireAuth } from "../middleware/require-auth.js";

const router = express.Router();

router.get("/", getLeaderboard);
router.get("/me", requireAuth, getMyLeaderboardRank);

export default router;
