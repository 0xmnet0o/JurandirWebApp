import { z } from "zod";

export const menuItemInput = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  old_price: z.number().nonnegative().nullable().optional(),
  emoji: z.string().optional(),
  photo: z.string().optional(),
  photo2: z.string().optional(),
  measure: z.number().nonnegative().nullable().optional(),
  unit: z.string().nullable().optional(),
  cat: z.string().min(1),
  sub: z.string().min(1),
});
export const menuIdParam = z.object({ id: z.string().uuid() });
