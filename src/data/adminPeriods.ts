import type { AdminPeriod } from "@/types";

/** Recortes de período usados no painel administrativo da plataforma. */
export const ADMIN_PERIODS: AdminPeriod[] = [
  { id: "dia", label: "Dia", days: 1, factor: 1 / 30 },
  { id: "semana", label: "Semana", days: 7, factor: 7 / 30 },
  { id: "quinzena", label: "Quinzena", days: 15, factor: 15 / 30 },
  { id: "mes", label: "Mês", days: 30, factor: 1 },
];
