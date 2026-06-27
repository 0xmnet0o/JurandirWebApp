import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { ah } from "../../lib/async-handler.js";
import { idParam } from "../establishments/schema.js";
import { getEstablishments, getStats, patchEstablishment } from "./controller.js";

export const adminRoutes = Router();
adminRoutes.use("/admin", requireAuth(), requireRole("admin"));
adminRoutes.get("/admin/establishments", ah(getEstablishments));
adminRoutes.patch(
  "/admin/establishments/:id",
  validate({ params: idParam, body: z.object({ fee_pct: z.number().min(0).max(30).optional(), status: z.enum(["ativo", "pendente"]).optional() }) }),
  ah(patchEstablishment),
);
adminRoutes.get("/admin/stats", ah(getStats));
