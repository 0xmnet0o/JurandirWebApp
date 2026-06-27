import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "@/app";
import { supabase } from "@/lib/supabase";

const hasEnv = !!process.env.SUPABASE_URL;

describe.skipIf(!hasEnv)("admin (integração)", () => {
  const app = createApp();
  it("admin lista e vê stats; não-admin recebe 403", async () => {
    const email = `admin+${Date.now()}@example.com`;
    const reg = await request(app).post("/api/auth/register").send({ email, password: "secret123", name: "Admin" });
    await supabase().from("profiles").update({ role: "admin" }).eq("id", reg.body.id);
    const token = (await request(app).post("/api/auth/login").send({ email, password: "secret123" })).body.access_token as string;

    const list = await request(app).get("/api/admin/establishments").set("Authorization", `Bearer ${token}`);
    expect(list.status).toBe(200);
    const stats = await request(app).get("/api/admin/stats").set("Authorization", `Bearer ${token}`);
    expect(stats.status).toBe(200);
    expect(stats.body).toHaveProperty("gmv");

    const e2 = `owner+${Date.now()}@example.com`;
    await request(app).post("/api/auth/register").send({ email: e2, password: "secret123", name: "Dono" });
    const t2 = (await request(app).post("/api/auth/login").send({ email: e2, password: "secret123" })).body.access_token as string;
    const denied = await request(app).get("/api/admin/stats").set("Authorization", `Bearer ${t2}`);
    expect(denied.status).toBe(403);
  });
});
