import crypto from "node:crypto";
import mongoose from "mongoose";
import { z } from "zod";
import { Game } from "../models/Game.js";
import { User } from "../models/User.js";

const startSchema = z.object({
  mode: z.literal("classic"),
});

const completeSchema = z.object({
  sessionId: z.string().trim().min(20).max(100),
  score: z.number().finite().int().min(0).max(1_000_000),
  fruitsSliced: z.number().finite().int().min(0).max(10_000),
  bombsHit: z.number().finite().int().min(0).max(100),
  maxCombo: z.number().finite().int().min(1).max(10_000),
  accuracy: z.number().finite().min(0).max(100),
  durationSeconds: z.number().finite().int().min(1).max(3600),
});

const MAX_SCORE_PER_FRUIT = 100;
const MAX_BOMB_HITS_PER_SECOND = 2;
const MAX_COMBO_PER_FRUIT = 1;

function serializeGame(game) {
  return {
    id: game._id.toString(),
    sessionId: game.sessionId,
    mode: game.mode,
    score: game.score,
    fruitsSliced: game.fruitsSliced,
    bombsHit: game.bombsHit,
    maxCombo: game.maxCombo,
    accuracy: game.accuracy,
    durationSeconds: game.durationSeconds,
    status: game.status,
    startedAt: game.startedAt,
    completedAt: game.completedAt,
    createdAt: game.createdAt,
  };
}

function validateGameResult(input, game, now) {
  const elapsedSeconds = Math.max(1, Math.ceil((now.getTime() - game.startedAt.getTime()) / 1000));
  if (input.durationSeconds > elapsedSeconds + 10) {
    return "Duration cannot exceed the server-measured session time";
  }
  if (input.fruitsSliced === 0 && input.score > 0) {
    return "Score must be zero when no fruits were sliced";
  }
  if (input.score > input.fruitsSliced * MAX_SCORE_PER_FRUIT) {
    return "Score exceeds the permitted result range";
  }
  if (input.maxCombo > Math.max(1, input.fruitsSliced * MAX_COMBO_PER_FRUIT)) {
    return "Combo exceeds the permitted result range";
  }
  if (input.bombsHit > input.durationSeconds * MAX_BOMB_HITS_PER_SECOND) {
    return "Bomb count exceeds the permitted result range";
  }
  return null;
}

export async function startGame(request, response, next) {
  try {
    const { mode } = startSchema.parse(request.body);
    const startedAt = new Date();
    const game = await Game.create({
      user: request.user._id,
      sessionId: crypto.randomUUID(),
      mode,
      status: "active",
      startedAt,
    });

    return response.status(201).json({
      ok: true,
      game: {
        sessionId: game.sessionId,
        mode: game.mode,
        startedAt: game.startedAt,
        status: game.status,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function completeGame(request, response, next) {
  const mongoSession = await mongoose.startSession();
  try {
    const input = completeSchema.parse(request.body);
    const now = new Date();

    let completedGame;
    await mongoSession.withTransaction(async () => {
      const game = await Game.findOne({
        sessionId: input.sessionId,
        user: request.user._id,
      }).session(mongoSession);

      if (!game) {
        const ownedGame = await Game.exists({ sessionId: input.sessionId });
        const error = new Error(ownedGame ? "You do not own this game session" : "Game session not found");
        error.statusCode = ownedGame ? 403 : 404;
        throw error;
      }
      if (game.status !== "active") {
        const error = new Error("Game session has already been completed");
        error.statusCode = 409;
        throw error;
      }

      const validationError = validateGameResult(input, game, now);
      if (validationError) {
        const error = new Error(validationError);
        error.statusCode = 400;
        throw error;
      }

      game.score = input.score;
      game.fruitsSliced = input.fruitsSliced;
      game.bombsHit = input.bombsHit;
      game.maxCombo = input.maxCombo;
      game.accuracy = input.accuracy;
      game.durationSeconds = input.durationSeconds;
      game.status = "completed";
      game.completedAt = now;
      completedGame = await game.save({ session: mongoSession });

      await User.updateOne(
        { _id: request.user._id },
        {
          $inc: {
            totalGames: 1,
            totalFruitsSliced: input.fruitsSliced,
          },
          $max: {
            highestScore: input.score,
            bestCombo: input.maxCombo,
          },
        },
        { session: mongoSession }
      );
    });

    return response.status(200).json({ ok: true, game: serializeGame(completedGame) });
  } catch (error) {
    return next(error);
  } finally {
    await mongoSession.endSession();
  }
}

export async function gameHistory(request, response, next) {
  try {
    const requestedLimit = Number.parseInt(request.query.limit, 10);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 50)
      : 20;
    const filter = { user: request.user._id, status: "completed" };
    const [games, stats] = await Promise.all([
      Game.find(filter).sort({ createdAt: -1 }).limit(limit).lean(),
      Game.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalGames: { $sum: 1 },
            highestScore: { $max: "$score" },
            totalFruitsSliced: { $sum: "$fruitsSliced" },
            bestCombo: { $max: "$maxCombo" },
            totalScore: { $sum: "$score" },
          },
        },
      ]),
    ]);
    const summary = stats[0] || {
      totalGames: 0,
      highestScore: 0,
      totalFruitsSliced: 0,
      bestCombo: 0,
      totalScore: 0,
    };

    return response.status(200).json({
      ok: true,
      games: games.map(serializeGame),
      stats: {
        highestScore: summary.highestScore,
        totalGames: summary.totalGames,
        totalFruitsSliced: summary.totalFruitsSliced,
        bestCombo: summary.bestCombo,
        averageScore: summary.totalGames ? summary.totalScore / summary.totalGames : 0,
      },
    });
  } catch (error) {
    return next(error);
  }
}
