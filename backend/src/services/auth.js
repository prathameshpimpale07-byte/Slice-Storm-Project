import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../app.js";

const TOKEN_COOKIE = "sliceStormToken";
const TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export function createAuthToken(userId) {
  return jwt.sign({ sub: userId.toString() }, env.JWT_SECRET, { expiresIn: "7d" });
}

export function setAuthCookie(response, token) {
  response.cookie(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: TOKEN_MAX_AGE,
    path: "/",
  });
}

export function clearAuthCookie(response) {
  response.clearCookie(TOKEN_COOKIE, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });
}

export function serializeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    highestScore: user.highestScore,
    totalGames: user.totalGames,
    totalFruitsSliced: user.totalFruitsSliced,
    bestCombo: user.bestCombo,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
