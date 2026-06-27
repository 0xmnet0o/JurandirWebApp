import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "@/app";

const hasEnv = !!process.env.SUPABASE_URL;

describe.skipIf(!hasEnv)("menu (integração)", () => {
  const app = createApp();
  it("dono cria, edita e remove item", async () => {
    const email = `owner+${Date.now()}@example.com`;
    await request(app).post("/api/auth/register").send({ email, password: "secret123", name: "Dono" });
    const token = (await request(app).post("/api/auth/login").send({ email, password: "secret123" })).body.access_token as string;
    await request(app).patch("/api/me/establishment").set("Authorization", `Bearer ${token}`).send({ name: "Quiosque", city: "X", status: "ativo" });
    const created = await request(app).post("/api/menu-items").set("Authorization", `Bearer ${token}`).send({ name: "Caipirinha", price: 22, cat: "Bebidas", sub: "Drinks" });
    expect(created.status).toBe(201);
    const id = created.body.id as string;
    const patched = await request(app).patch(`/api/menu-items/${id}`).set("Authorization", `Bearer ${token}`).send({ price: 25 });
    expect(Number(patched.body.price)).toBe(25);
    const del = await request(app).delete(`/api/menu-items/${id}`).set("Authorization", `Bearer ${token}`);
    expect(del.status).toBe(204);
  });
});
