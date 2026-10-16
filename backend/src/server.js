import "dotenv/config";
import { app, env } from "./app.js";
import { connectDatabase } from "./config/database.js";

async function startServer() {
  try {
    await connectDatabase(env.MONGODB_URI);
    app.listen(env.PORT, () => {
      console.log(`Slice Storm API listening on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("Backend startup failed:", error.message);
    process.exitCode = 1;
  }
}

startServer();
