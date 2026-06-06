import { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

/**
 * Central error handler — catches anything passed to next(err).
 * Always returns a clean JSON error response; never lets the server crash.
 */
export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode ?? 500;
  const message =
    err.message || "An unexpected error occurred. Please try again.";

  // Don't leak stack traces in production
  if (process.env.NODE_ENV !== "production") {
    console.error("[ERROR]", err);
  } else {
    console.error(`[ERROR] ${statusCode}: ${message}`);
  }

  res.status(statusCode).json({
    error: message,
    ...(err.code ? { code: err.code } : {}),
  });
}

/**
 * 404 fallback — catch routes that don't exist.
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
}
