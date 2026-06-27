import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { ah } from "../../lib/async-handler.js";
import { establishmentInput, idParam } from "./schema.js";
import { getList, getMine, getOne, patchMine } from "./controller.js";

export const establishmentRoutes = Router();
establishmentRoutes.get("/establishments", ah(getList));
establishmentRoutes.get("/establishments/:id", validate({ params: idParam }), ah(getOne));

export const meEstablishmentRoutes = Router();
meEstablishmentRoutes.get("/me/establishment", requireAuth(), ah(getMine));
meEstablishmentRoutes.patch("/me/establishment", requireAuth(), validate({ body: establishmentInput.partial() }), ah(patchMine));
