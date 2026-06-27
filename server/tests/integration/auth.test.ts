import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "@/app";

const hasEnv = !!process.env.SUPABASE_URL;
const email = `owner+${Date.now()}@example.com`;

describe.skipIf(!hasEnv)("auth (integração)", () => {
  const app = createApp();
  it("registra, loga e retorna /me", async () => {
    const reg = await request(app).post("/api/auth/register").send({ email, password: "secret123", name: "Dono" });
    expect(reg.status).toBe(201);
    const login = await request(app).post("/api/auth/login").send({ email, password: "secret123" });
    expect(login.status).toBe(200);
    const token = login.body.access_token as string;
    expect(token).toBeTruthy();
    const me = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);
    expect(me.status).toBe(200);
    expect(me.body.email).toBe(email);
    expect(me.body.role).toBe("owner");
  });
});
