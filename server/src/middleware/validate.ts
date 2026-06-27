import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodSchema } from "zod";
import { badRequest } from "../lib/http-error.js";

interface Schemas {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

export function validate(schemas: Schemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.params) req.params = schemas.params.parse(req.params) as typeof req.params;
      if (schemas.query) req.query = schemas.query.parse(req.query) as typeof req.query;
      next();
    } catch (e) {
      if (e instanceof ZodError) return next(badRequest("Dados inválidos", e.flatten()));
      next(e);
    }
  };
}
