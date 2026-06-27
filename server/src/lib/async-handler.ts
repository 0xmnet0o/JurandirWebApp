import type { NextFunction, Request, Response } from "express";

/** Envolve handlers async para encaminhar erros ao errorHandler do Express. */
export const ah =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
