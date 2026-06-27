import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "@/app";

const hasEnv = !!process.env.SUPABASE_URL;

describe.skipIf(!hasEnv)("orders (integração)", () => {
  const app = createApp();
  it("cliente cria pedido público; dono lista e marca entregue", async () => {
    const email = `owner+${Date.now()}@example.com`;
    await request(app).post("/api/auth/register").send({ email, password: "secret123", name: "Dono" });
    const token = (await request(app).post("/api/auth/login").send({ email, password: "secret123" })).body.access_token as string;
    const est = await request(app).patch("/api/me/establishment").set("Authorization", `Bearer ${token}`)
      .send({ name: "Quiosque", city: `C-${Date.now()}`, status: "ativo", fee_pct: 10 });
    const estId = est.body.id as string;

    const order = await request(app).post(`/api/establishments/${estId}/orders`)
      .send({ location: "Guarda-sol 14", items: [{ name: "Caipirinha", qty: 2, price: 22 }] });
    expect(order.status).toBe(201);
    expect(Number(order.body.total)).toBe(44);
    expect(Number(order.body.fee)).toBe(4.4);
    expect(order.body.status).toBe("producao");

    const list = await request(app).get("/api/orders").set("Authorization", `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(list.body.length).toBeGreaterThan(0);

    const upd = await request(app).patch(`/api/orders/${order.body.id}`).set("Authorization", `Bearer ${token}`).send({ status: "entregue" });
    expect(upd.body.status).toBe("entregue");
  });

  it("pedido com split fica aguardando até todas as partes pagarem", async () => {
    const email = `owner+${Date.now()}s@example.com`;
    await request(app).post("/api/auth/register").send({ email, password: "secret123", name: "Dono" });
    const token = (await request(app).post("/api/auth/login").send({ email, password: "secret123" })).body.access_token as string;
    const est = await request(app).patch("/api/me/establishment").set("Authorization", `Bearer ${token}`)
      .send({ name: "Quiosque", city: `C-${Date.now()}s`, status: "ativo", fee_pct: 0 });
    const estId = est.body.id as string;

    const order = await request(app).post(`/api/establishments/${estId}/orders`).send({
      items: [{ name: "X", qty: 1, price: 60 }],
      splits: [{ method: "pix", amount: 30, position: 0 }, { method: null, amount: 30, position: 1 }],
    });
    expect(order.body.status).toBe("aguardando");
    const pay = await request(app).post(`/api/orders/${order.body.id}/splits/1/pay`).set("Authorization", `Bearer ${token}`).send({ method: "pix" });
    expect(pay.body.allPaid).toBe(true);
    const list = await request(app).get("/api/orders?status=producao").set("Authorization", `Bearer ${token}`);
    expect(list.body.some((o: { id: string }) => o.id === order.body.id)).toBe(true);
  });
});
