import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { z } from "zod";
import { getDatabaseState } from "./config/database.js";
import authRoutes from "./routes/auth.js";
import gameRoutes from "./routes/games.js";
import leaderboardRoutes from "./routes/leaderboard.js";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const env = envSchema.parse({
  PORT: process.env.PORT,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  FRONTEND_URL: process.env.FRONTEND_URL,
  NODE_ENV: process.env.NODE_ENV,
});

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));
app.use(cookieParser());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: "draft-8",
  legacyHeaders: false,
}));

app.get("/api/health", (_request, response) => {
  const database = getDatabaseState();
  response.status(database.connected ? 200 : 503).json({
    ok: database.connected,
    service: "slice-storm-backend",
    database,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

app.use((_request, response) => {
  response.status(404).json({
    ok: false,
    error: "Route not found",
  });
});

app.use((error, _request, response, _next) => {
  console.error(error);
  if (error instanceof z.ZodError) {
    return response.status(400).json({
      ok: false,
      error: "Invalid request data",
      details: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }
  response.status(error.statusCode || 500).json({
    ok: false,
    error: env.NODE_ENV === "production" ? "Internal server error" : error.message,
  });
});

export { app, env };
