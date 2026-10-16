import jwt from "jsonwebtoken";
import { env } from "../app.js";
import { User } from "../models/User.js";

export async function requireAuth(request, response, next) {
  try {
    const token = request.cookies?.sliceStormToken;
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
