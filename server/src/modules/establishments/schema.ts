import { z } from "zod";

export const establishmentInput = z.object({
  name: z.string().min(1),
  tagline: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  hours: z.string().optional(),
  cover: z.string().optional(),
  logo: z.string().optional(),
  fee_pct: z.number().min(0).max(30).optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
  city: z.string().optional(),
  neighborhood: z.string().optional(),
  status: z.enum(["ativo", "pendente"]).optional(),
});

export const idParam = z.object({ id: z.string().uuid() });
