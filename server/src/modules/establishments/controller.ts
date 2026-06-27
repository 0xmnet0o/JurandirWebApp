import type { Request, Response } from "express";
import * as service from "./service.js";
import { notFound } from "../../lib/http-error.js";

export async function getList(req: Request, res: Response) {
  const { city, neighborhood } = req.query as { city?: string; neighborhood?: string };
  res.json(await service.listPublic({ city, neighborhood }));
}
export async function getOne(req: Request, res: Response) {
  res.json(await service.getPublic(req.params.id));
}
export async function getMine(req: Request, res: Response) {
  const e = await service.getByOwner(req.user!.id);
  if (!e) throw notFound("Você ainda não tem estabelecimento");
  res.json(e);
}
export async function patchMine(req: Request, res: Response) {
  res.json(await service.upsertForOwner(req.user!.id, req.body));
}
