import { z } from "zod";
import { User } from "../models/User.js";
import {
  clearAuthCookie,
  createAuthToken,
  hashPassword,
  serializeUser,
  setAuthCookie,
} from "../services/auth.js";

const credentialsSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(128),
});

export async function register(request, response, next) {
  try {
    const input = credentialsSchema.parse(request.body);
    const existingUser = await User.exists({ email: input.email });
    if (existingUser) {
      return response.status(409).json({ ok: false, error: "An account with this email already exists" });
    }

    const user = await User.create({
      name: input.name,
      email: input.email,
      passwordHash: await hashPassword(input.password),
    });
    const token = createAuthToken(user._id);
    setAuthCookie(response, token);
    return response.status(201).json({ ok: true, token, user: serializeUser(user) });
  } catch (error) {
    if (error.code === 11000) {
      return response.status(409).json({ ok: false, error: "An account with this email already exists" });
    }
    return next(error);
  }
}

export async function login(request, response, next) {
  try {
    const input = loginSchema.parse(request.body);
    const user = await User.findOne({ email: input.email }).select("+passwordHash");
    const validPassword = user ? await user.comparePassword(input.password) : false;
    if (!validPassword) {
      return response.status(401).json({ ok: false, error: "Invalid email or password" });
    }

    const token = createAuthToken(user._id);
    setAuthCookie(response, token);
    return response.status(200).json({ ok: true, token, user: serializeUser(user) });
  } catch (error) {
    return next(error);
  }
}

export function logout(_request, response) {
  clearAuthCookie(response);
  return response.status(200).json({ ok: true });
}

export function currentUser(request, response) {
  return response.status(200).json({
    ok: true,
    user: request.user ? serializeUser(request.user) : null,
  });
}
