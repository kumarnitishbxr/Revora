import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { Role } from "@prisma/client";
import { prisma } from "./config/db";

import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import storeRoutes from "./routes/store.routes";
import userRoutes from "./routes/user.routes";
import { getOwnerDashboard } from "./controllers/store.controller";
import { requireAuth } from "./middleware/auth";
import { requireRole } from "./middleware/role";
import { errorHandler, notFoundHandler } from "./middleware/error";

const app = express();

// Security Headers
app.use(helmet());

// CORS configuration (supports CLIENT_URL and local dev ports with credentials)
const configuredClientUrl = process.env.CLIENT_URL || "http://localhost:5173";
const allowedOrigins = new Set([
  configuredClientUrl,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  })
);

// Cookie Parser
app.use(cookieParser());

// Request Body Parsing with size limits
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// General Rate Limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later",
    errors: [],
  },
});
app.use("/api", generalLimiter);

// Specific Auth Rate Limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login/registration attempts, please try again in 15 minutes",
    errors: [],
  },
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// Health Check Endpoint (Actually checks PostgreSQL connectivity)
app.get("/api/health", async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      success: true,
      message: "Revora API is healthy",
      database: "connected",
    });
  } catch (error) {
    next(error);
  }
});

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/users", userRoutes);

// Store Owner Dashboard
app.get(
  "/api/store-owner/dashboard",
  requireAuth,
  requireRole(Role.STORE_OWNER),
  getOwnerDashboard
);

// Root Welcome Endpoint
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Revora Backend API",
    health: "/api/health",
  });
});

// Centralized 404 & Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
