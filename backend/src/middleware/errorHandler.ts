import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("Request failed:", err.message);
  res.status(500).json({
    success: false,
    error: err.message || "Internal server error",
  });
}