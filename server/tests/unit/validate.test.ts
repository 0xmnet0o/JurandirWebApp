import { describe, expect, it } from "vitest";
import { z } from "zod";
import express from "express";
import request from "supertest";
import { validate } from "@/middleware/validate";
import { errorHandler } from "@/middleware/error";

function appWith(schema: Parameters<typeof validate>[0]) {
  const app = express();
  app.use(express.json());
  app.post("/x", validate(schema), (req, res) => res.json(req.body));
  app.use(errorHandler);
  return app;
}

describe("validate", () => {
  it("400 quando o body é inválido", async () => {
    const app = appWith({ body: z.object({ name: z.string() }) });
    const res = await request(app).post("/x").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
  it("passa quando válido", async () => {
    const app = appWith({ body: z.object({ name: z.string() }) });
    const res = await request(app).post("/x").send({ name: "ok" });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("ok");
  });
});
