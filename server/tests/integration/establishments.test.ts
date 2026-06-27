import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "@/app";

const hasEnv = !!process.env.SUPABASE_URL;

describe.skipIf(!hasEnv)("establishments (integração)", () => {
  const app = createApp();
  it("dono cria/atualiza o próprio estabelecimento e aparece na listagem pública", async () => {
    const email = `owner+${Date.now()}@example.com`;
    await request(app).post("/api/auth/register").send({ email, password: "secret123", name: "Dono" });
    const login = await request(app).post("/api/auth/login").send({ email, password: "secret123" });
    const token = login.body.access_token as string;
    const city = `Cidade-${Date.now()}`;
    const patch = await request(app).patch("/api/me/establishment").set("Authorization", `Bearer ${token}`)
      .send({ name: "Quiosque Teste", city, status: "ativo", fee_pct: 8 });
    expect(patch.status).toBe(200);
    expect(patch.body.name).toBe("Quiosque Teste");
    const list = await request(app).get(`/api/establishments?city=${encodeURIComponent(city)}`);
    expect(list.status).toBe(200);
    expect(list.body.length).toBe(1);
  });
});
