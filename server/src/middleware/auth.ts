import type { NextFunction, Request, Response } from "express";
import { getUserFromToken, supabase } from "../lib/supabase.js";
import { forbidden, unauthorized } from "../lib/http-error.js";

export interface AuthUser {
  id: string;
  email: string | undefined;
  role: "owner" | "admin";
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function extractBearer(header: string | undefined): string | null {
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  return scheme === "Bearer" && token ? token : null;
}

async function resolveRole(userId: string): Promise<"owner" | "admin"> {
  const { data } = await supabase().from("profiles").select("role").eq("id", userId).single();
  return data?.role === "admin" ? "admin" : "owner";
}

export function requireAuth() {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const token = extractBearer(req.headers.authorization);
    if (!token) return next(unauthorized());
    const user = await getUserFromToken(token);
    if (!user) return next(unauthorized("Token inválido ou expirado"));
    req.user = { id: user.id, email: user.email, role: await resolveRole(user.id) };
    next();
  };
}

export function requireRole(role: "admin") {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(unauthorized());
    if (req.user.role !== role) return next(forbidden());
    next();
  };
}
