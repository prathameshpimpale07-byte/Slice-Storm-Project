const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message, status, details = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

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
