import { z } from "zod";
import { Game } from "../models/Game.js";

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

function parsePagination(query) {
  return paginationSchema.parse({
    page: query.page ?? 1,
    limit: query.limit ?? 10,
  });
}

function serializeEntry(entry) {
  return {
    rank: entry.rank,
    playerName: entry.playerName,
    score: entry.score,
  };
}

export async function getLeaderboard(request, response, next) {
  try {
    const { page, limit } = parsePagination(request.query);
    const skip = (page - 1) * limit;
    const [entries, total] = await Promise.all([
      Game.aggregate([
        { $match: { status: "completed" } },
        {
          $setWindowFields: {
            sortBy: { score: -1 },
            output: { rank: { $rank: {} } },
          },
        },
        { $sort: { score: -1, completedAt: 1, _id: 1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "player",
          },
        },
        { $unwind: "$player" },
        {
          $project: {
            _id: 0,
            rank: 1,
            playerName: "$player.name",
            score: 1,
          },
        },
      ]),
      Game.countDocuments({ status: "completed" }),
    ]);

    return response.status(200).json({
      ok: true,
      leaderboard: entries.map(serializeEntry),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getMyLeaderboardRank(request, response, next) {
  try {
    const bestGame = await Game.findOne({
      user: request.user._id,
      status: "completed",
    })
      .sort({ score: -1, completedAt: 1 })
      .select("score")
      .lean();

    if (!bestGame) {
      return response.status(200).json({
        ok: true,
        rank: null,
        playerName: request.user.name,
        score: null,
      });
    }

    const playersAhead = await Game.countDocuments({
      status: "completed",
      score: { $gt: bestGame.score },
    });

    return response.status(200).json({
      ok: true,
      rank: playersAhead + 1,
      playerName: request.user.name,
      score: bestGame.score,
    });
  } catch (error) {
    return next(error);
  }
}
