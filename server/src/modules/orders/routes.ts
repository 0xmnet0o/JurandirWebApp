import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { ah } from "../../lib/async-handler.js";
import { idParam } from "../establishments/schema.js";
import { createOrderInput, orderIdParam, splitPayInput, splitPayParam, updateOrderInput } from "./schema.js";
import { getMine, patchStatus, postPayShare, postPublic } from "./controller.js";

export const publicOrderRoutes = Router();
publicOrderRoutes.post("/establishments/:id/orders", validate({ params: idParam, body: createOrderInput }), ah(postPublic));

export const orderRoutes = Router();
orderRoutes.get("/orders", requireAuth(), ah(getMine));
orderRoutes.patch("/orders/:id", requireAuth(), validate({ params: orderIdParam, body: updateOrderInput }), ah(patchStatus));
orderRoutes.post("/orders/:id/splits/:position/pay", requireAuth(), validate({ params: splitPayParam, body: splitPayInput }), ah(postPayShare));
