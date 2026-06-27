import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../lib/http-error.js";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }
  console.error("Unhandled error:", err);
  return res.status(500).json({ error: "Erro interno" });
}
