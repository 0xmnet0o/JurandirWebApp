import type { Request, Response } from "express";
import * as service from "./service.js";

export async function postPublic(req: Request, res: Response) {
  res.status(201).json(await service.createPublic(req.params.id, req.body));
}
export async function getMine(req: Request, res: Response) {
  res.json(await service.listByOwner(req.user!.id, req.query.status as string | undefined));
}
export async function patchStatus(req: Request, res: Response) {
  res.json(await service.updateStatus(req.user!.id, req.params.id, req.body.status));
}
export async function postPayShare(req: Request, res: Response) {
  res.json(await service.payShare(req.user!.id, req.params.id, Number(req.params.position), req.body.method));
}
export async function getOne(req: Request, res: Response) {
  res.json(await service.getPublicOrder(req.params.id));
}
