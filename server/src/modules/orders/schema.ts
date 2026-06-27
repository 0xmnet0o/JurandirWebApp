import { z } from "zod";

export const createOrderInput = z.object({
  location: z.string().optional(),
  customer_name: z.string().optional(),
  note: z.string().max(200).optional(),
  items: z.array(z.object({ name: z.string().min(1), qty: z.number().int().positive(), price: z.number().nonnegative() })).min(1),
  splits: z.array(z.object({ method: z.string().nullable(), amount: z.number().nonnegative(), position: z.number().int() })).optional(),
});
export const orderIdParam = z.object({ id: z.string().uuid() });
export const updateOrderInput = z.object({ status: z.enum(["aguardando", "producao", "entregue"]) });
export const splitPayParam = z.object({ id: z.string().uuid(), position: z.coerce.number().int() });
export const splitPayInput = z.object({ method: z.string().min(1) });
