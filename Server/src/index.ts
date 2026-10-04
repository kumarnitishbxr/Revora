import dotenv from "dotenv";
import app from "./app";
import { prisma, pool } from "./config/db";

dotenv.config();

const PORT = parseInt(process.env.PORT || "5000", 10);

const server = app.listen(PORT, () => {
  console.log(`🚀 Revora server running on http://localhost:${PORT}`);
  console.log(`📡 Health check available at http://localhost:${PORT}/api/health`);
});

const gracefulShutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}. Shutting down server gracefully...`);

  server.close(async () => {
    console.log("HTTP server closed.");
    try {
      await prisma.$disconnect();
      await pool.end();
      console.log("Database connection closed.");
      process.exit(0);
    } catch (err) {
      console.error("Error during database shutdown:", err);
      process.exit(1);
    }
  });

  setTimeout(() => {
    console.error("Forcefully shutting down server due to timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
