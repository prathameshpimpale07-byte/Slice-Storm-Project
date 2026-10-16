import express from "express";
import rateLimit from "express-rate-limit";
import { currentUser, login, logout, register } from "../controllers/auth.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { ok: false, error: "Too many authentication attempts. Try again later." },
});

router.post("/register", authRateLimit, register);
router.post("/login", authRateLimit, login);
router.post("/logout", logout);
router.get("/me", requireAuth, currentUser);

export default router;
