const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/, "");
const REQUEST_TIMEOUT_MS = 15_000;

export class ApiError extends Error {
  constructor(message, status, details = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export async function apiRequest(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      credentials: "include",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new ApiError("The request timed out. Check your connection and try again.", 408);
    }
    throw new ApiError("The server could not be reached. Check your connection and try again.", 0);
  } finally {
    clearTimeout(timeoutId);
  }

  let body = {};
  try {
    body = await response.json();
  } catch {
    if (!response.ok) {
      throw new ApiError("The server returned an invalid response.", response.status);
    }
  }

  if (!response.ok) {
    throw new ApiError(
      body.error || "Something went wrong. Please try again.",
      response.status,
      body.details || []
    );
  }

  return body;
}

export function getCurrentUser() {
  return apiRequest("/api/auth/me");
}

export function registerUser(data) {
  return apiRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function loginUser(data) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function logoutUser() {
  return apiRequest("/api/auth/logout", { method: "POST" });
}

export function startGame(data = { mode: "classic" }) {
  return apiRequest("/api/games/start", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function completeGame(data) {
  return apiRequest("/api/games/complete", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getLeaderboard(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/api/leaderboard${query ? `?${query}` : ""}`);
}

export function getMyLeaderboardRank() {
  return apiRequest("/api/leaderboard/me");
}

export function getGameHistory(limit = 20) {
  return apiRequest(`/api/games/history?limit=${limit}`);
}
