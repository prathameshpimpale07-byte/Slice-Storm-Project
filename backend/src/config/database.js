import mongoose from "mongoose";

export async function connectDatabase(uri) {
  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log("MongoDB connected");
}

export function getDatabaseState() {
  return {
    connected: mongoose.connection.readyState === 1,
    state: mongoose.connection.readyState,
  };
}
