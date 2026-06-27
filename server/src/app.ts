import express, { type Express } from "express";
import cors from "cors";
import { parseCorsOrigins } from "./lib/cors.js";
import { getEnv } from "./config/env.js";
import { authRoutes } from "./modules/auth/routes.js";
import { establishmentRoutes, meEstablishmentRoutes } from "./modules/establishments/routes.js";
import { menuRoutes, publicMenuRoutes } from "./modules/menu/routes.js";
import { orderRoutes, publicOrderRoutes } from "./modules/orders/routes.js";
import { adminRoutes } from "./modules/admin/routes.js";
import { errorHandler } from "./middleware/error.js";

export function createApp(): Express {
  const app = express();
  app.use(cors({ origin: parseCorsOrigins(getEnv().CORS_ORIGINS) }));
  app.use(express.json({ limit: "5mb" }));

  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  app.use("/api/auth", authRoutes);
  app.use("/api", establishmentRoutes);
  app.use("/api", meEstablishmentRoutes);
  app.use("/api", publicMenuRoutes);
  app.use("/api", menuRoutes);
  app.use("/api", publicOrderRoutes);
  app.use("/api", orderRoutes);
  app.use("/api", adminRoutes);

  app.use(errorHandler);
  return app;
}
