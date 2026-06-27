import type { Request, Response } from "express";
import * as service from "./service.js";

export async function getEstablishments(_req: Request, res: Response) {
  res.json(await service.listAll());
}
export async function patchEstablishment(req: Request, res: Response) {
  res.json(await service.patchEstablishment(req.params.id, req.body));
}
export async function getStats(_req: Request, res: Response) {
  res.json(await service.stats());
}
