import jwt from "jsonwebtoken";
import { env } from "../app.js";
import { User } from "../models/User.js";

export async function requireAuth(request, response, next) {
  try {
    const token = getAuthToken(request);
    if (!token) {
      return response.status(401).json({ ok: false, error: "Authentication required" });
    }

    const payload = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(payload.sub).select("-passwordHash");
    if (!user) {
      return response.status(401).json({ ok: false, error: "Authentication required" });
    }

    request.user = user;
    return next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return response.status(401).json({ ok: false, error: "Authentication required" });
    }
    return next(error);
  }
}

export async function optionalAuth(request, _response, next) {
  const token = getAuthToken(request);
  if (!token) return next();

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    request.user = await User.findById(payload.sub).select("-passwordHash");
    return next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return next();
    }
    return next(error);
  }
}

function getAuthToken(request) {
  const cookieToken = request.cookies?.sliceStormToken;
  if (cookieToken) return cookieToken;

  const authorization = request.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return null;

  return authorization.slice("Bearer ".length).trim() || null;
}
