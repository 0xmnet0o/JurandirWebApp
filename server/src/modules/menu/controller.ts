import type { Request, Response } from "express";
import * as service from "./service.js";

export async function getMine(req: Request, res: Response) {
  res.json(await service.listByOwner(req.user!.id));
}
export async function getPublicMenu(req: Request, res: Response) {
  res.json(await service.listPublic(req.params.id));
}
export async function post(req: Request, res: Response) {
  res.status(201).json(await service.create(req.user!.id, req.body));
}
export async function patch(req: Request, res: Response) {
  res.json(await service.update(req.user!.id, req.params.id, req.body));
}
export async function del(req: Request, res: Response) {
  await service.remove(req.user!.id, req.params.id);
  res.status(204).end();
}
