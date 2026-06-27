import type { Request, Response } from "express";
import * as service from "./service.js";

export async function postRegister(req: Request, res: Response) {
  const { email, password, name } = req.body as { email: string; password: string; name: string };
  res.status(201).json(await service.register(email, password, name));
}
export async function postLogin(req: Request, res: Response) {
  const { email, password } = req.body as { email: string; password: string };
  res.json(await service.login(email, password));
}
export function getMe(req: Request, res: Response) {
  res.json(req.user);
}
