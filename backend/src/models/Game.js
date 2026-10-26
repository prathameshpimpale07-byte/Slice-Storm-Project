import mongoose from "mongoose";

const gameSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    mode: {
      type: String,
      enum: ["classic"],
      required: true,
    },
    score: {
      type: Number,
      min: 0,
      default: 0,
    },
    fruitsSliced: {
      type: Number,
      min: 0,
      default: 0,
    },
    bombsHit: {
      type: Number,
      min: 0,
      default: 0,
    },
    maxCombo: {
      type: Number,
      min: 1,
      default: 1,
    },
    accuracy: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    durationSeconds: {
      type: Number,
      min: 1,
      max: 3600,
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
      index: true,
    },
    startedAt: {
      type: Date,
      required: true,
    },
    completedAt: Date,
  },
  { timestamps: true }
);

gameSchema.index({ user: 1, createdAt: -1 });

export const Game = mongoose.models.Game || mongoose.model("Game", gameSchema);
