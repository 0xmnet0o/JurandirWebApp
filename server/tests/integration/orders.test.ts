import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "@/app";

const hasEnv = !!process.env.SUPABASE_URL;

/** Cria dono autenticado + estabelecimento ativo; retorna token e estId. */
async function setupOwner(app: ReturnType<typeof createApp>, feePct: number, citySuffix = "") {
  const email = `owner+${Date.now()}${citySuffix}@example.com`;
  await request(app).post("/api/auth/register").send({ email, password: "secret123", name: "Dono" });
  const token = (await request(app).post("/api/auth/login").send({ email, password: "secret123" })).body
    .access_token as string;
  const est = await request(app)
    .patch("/api/me/establishment")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Quiosque", city: `C-${Date.now()}${citySuffix}`, status: "ativo", fee_pct: feePct });
  return { token, estId: est.body.id as string };
}

async function createMenuItem(
  app: ReturnType<typeof createApp>,
  token: string,
  name: string,
  price: number,
) {
  const res = await request(app)
    .post("/api/menu-items")
    .set("Authorization", `Bearer ${token}`)
    .send({ name, price, cat: "Bebidas", sub: "Drinks" });
  return res.body.id as string;
}

describe.skipIf(!hasEnv)("orders (integração)", () => {
  const app = createApp();

  it("cliente cria pedido público com preço autoritativo; dono lista e marca entregue", async () => {
    const { token, estId } = await setupOwner(app, 10);
    const itemId = await createMenuItem(app, token, "Caipirinha", 22);

    const order = await request(app)
      .post(`/api/establishments/${estId}/orders`)
      .send({ location: "Guarda-sol 14", items: [{ menu_item_id: itemId, qty: 2 }] });
    expect(order.status).toBe(201);
    expect(Number(order.body.total)).toBe(44); // preço vem do banco (22 × 2)
    expect(Number(order.body.fee)).toBe(4.4); // 10%
    expect(order.body.status).toBe("producao");
    expect(order.body.code).toMatch(/^PED-[0-9A-Z]{8}$/); // código curto único

    const list = await request(app).get("/api/orders").set("Authorization", `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(list.body.length).toBeGreaterThan(0);

    const upd = await request(app)
      .patch(`/api/orders/${order.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "entregue" });
    expect(upd.body.status).toBe("entregue");
  });

  it("ignora preço forjado pelo cliente — usa o do banco", async () => {
    const { token, estId } = await setupOwner(app, 0, "p");
    const itemId = await createMenuItem(app, token, "Item Caro", 100);

    // cliente tenta forjar price: 0 (campo é ignorado pelo schema/serviço)
    const order = await request(app)
      .post(`/api/establishments/${estId}/orders`)
      .send({ items: [{ menu_item_id: itemId, qty: 1, price: 0, name: "Grátis?" }] });
    expect(order.status).toBe(201);
    expect(Number(order.body.total)).toBe(100); // preço real do banco, não o forjado
  });

  it("rejeita item inexistente ou de outro estabelecimento", async () => {
    const { estId } = await setupOwner(app, 0, "x");
    const fakeId = "00000000-0000-0000-0000-000000000000";
    const order = await request(app)
      .post(`/api/establishments/${estId}/orders`)
      .send({ items: [{ menu_item_id: fakeId, qty: 1 }] });
    expect(order.status).toBe(400);
  });

  it("GET /orders/:id público retorna o pedido; id inexistente → 404", async () => {
    const { token, estId } = await setupOwner(app, 0, "g");
    const itemId = await createMenuItem(app, token, "Água", 5);
    const order = await request(app)
      .post(`/api/establishments/${estId}/orders`)
      .send({ items: [{ menu_item_id: itemId, qty: 1 }] });
    const got = await request(app).get(`/api/orders/${order.body.id}`);
    expect(got.status).toBe(200);
    expect(got.body.id).toBe(order.body.id);
    expect(Array.isArray(got.body.order_items)).toBe(true);

    const missing = await request(app).get("/api/orders/00000000-0000-0000-0000-000000000000");
    expect(missing.status).toBe(404);
  });

  it("pedido com split fica aguardando até todas as partes pagarem", async () => {
    const { token, estId } = await setupOwner(app, 0, "s");
    const itemId = await createMenuItem(app, token, "X", 60);

    const order = await request(app).post(`/api/establishments/${estId}/orders`).send({
      items: [{ menu_item_id: itemId, qty: 1 }],
      splits: [
        { method: "pix", amount: 30, position: 0 },
        { method: null, amount: 30, position: 1 },
      ],
    });
    expect(order.body.status).toBe("aguardando");

    const pay = await request(app)
      .post(`/api/orders/${order.body.id}/splits/1/pay`)
      .set("Authorization", `Bearer ${token}`)
      .send({ method: "pix" });
    expect(pay.body.allPaid).toBe(true);

    const list = await request(app)
      .get("/api/orders?status=producao")
      .set("Authorization", `Bearer ${token}`);
    expect(list.body.some((o: { id: string }) => o.id === order.body.id)).toBe(true);
  });
});
