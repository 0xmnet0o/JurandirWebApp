import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { ah } from "../../lib/async-handler.js";
import { menuIdParam, menuItemInput } from "./schema.js";
import { del, getMine, getPublicMenu, patch, post } from "./controller.js";
import { idParam } from "../establishments/schema.js";

export const publicMenuRoutes = Router();
publicMenuRoutes.get("/establishments/:id/menu", validate({ params: idParam }), ah(getPublicMenu));

export const menuRoutes = Router();
menuRoutes.get("/menu-items", requireAuth(), ah(getMine));
menuRoutes.post("/menu-items", requireAuth(), validate({ body: menuItemInput }), ah(post));
menuRoutes.patch("/menu-items/:id", requireAuth(), validate({ params: menuIdParam, body: menuItemInput.partial() }), ah(patch));
menuRoutes.delete("/menu-items/:id", requireAuth(), validate({ params: menuIdParam }), ah(del));
