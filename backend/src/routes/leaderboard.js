import express from "express";
import { getLeaderboard, getMyLeaderboardRank } from "../controllers/leaderboard.js";
import { requireAuth } from "../middleware/require-auth.js";

const router = express.Router();

router.use(requireAuth);
router.get("/", getLeaderboard);
router.get("/me", getMyLeaderboardRank);

export default router;
