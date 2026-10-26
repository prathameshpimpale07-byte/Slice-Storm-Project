import express from "express";
import { completeGame, gameHistory, startGame } from "../controllers/games.js";
import { requireAuth } from "../middleware/require-auth.js";

const router = express.Router();

router.use(requireAuth);
router.post("/start", startGame);
router.post("/complete", completeGame);
router.get("/history", gameHistory);

export default router;
