import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { ah } from "../../lib/async-handler.js";
import { getMe, postLogin, postRegister } from "./controller.js";

export const authRoutes = Router();
const creds = z.object({ email: z.string().email(), password: z.string().min(6) });

authRoutes.post("/register", validate({ body: creds.extend({ name: z.string().min(1) }) }), ah(postRegister));
authRoutes.post("/login", validate({ body: creds }), ah(postLogin));
authRoutes.get("/me", requireAuth(), getMe);
