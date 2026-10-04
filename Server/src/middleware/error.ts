import { Request, Response, NextFunction } from "express";

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errors: any[];

  constructor(message: string, statusCode: number = 500, errors: any[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static badRequest(message: string, errors: any[] = []): ApiError {
    return new ApiError(message, 400, errors);
  }

  static unauthorized(message: string = "Unauthorized access"): ApiError {
    return new ApiError(message, 401);
  }

  static forbidden(message: string = "Forbidden resource"): ApiError {
    return new ApiError(message, 403);
  }

  static notFound(message: string = "Resource not found"): ApiError {
    return new ApiError(message, 404);
  }

  static conflict(message: string): ApiError {
    return new ApiError(message, 409);
  }
}

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction): void => {
  // Log error on server
  console.error(`[ERROR] [${new Date().toISOString()}]`, err.message || err);

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  // Handle Prisma Known Request Errors
  if (err.code && typeof err.code === "string" && err.code.startsWith("P")) {
    if (err.code === "P2002") {
      const target = err.meta?.target ? ` (${err.meta.target.join(", ")})` : "";
      res.status(409).json({
        success: false,
        message: `A record with this field already exists${target}`,
        errors: [],
      });
      return;
    }

    if (err.code === "P2025") {
      res.status(404).json({
        success: false,
        message: "Record not found",
        errors: [],
      });
      return;
    }
  }

  // Generic internal server error
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message || "Something went wrong";

  res.status(500).json({
    success: false,
    message,
    errors: [],
  });
};

export const notFoundHandler = (req: Request, res: Response, _next: NextFunction): void => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
    errors: [],
  });
};
