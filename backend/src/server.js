import app from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./config/db.js";

const start = async () => {
  try {
    await connectDatabase();
    app.listen(env.port, () => {
      console.log(`[server] Backend running on port ${env.port}`);
    });
  } catch (error) {
    console.error("[startup] Failed to start backend", error);
    process.exit(1);
  }
};

start();