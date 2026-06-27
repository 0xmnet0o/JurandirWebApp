import type { CategoryName, Categories } from "@/types";

/** Categorias do cardápio e suas subcategorias. */
export const CATS: Categories = {
  "Combos & Combinações": ["Combos", "Combinações"],
  Bebidas: ["Drinks", "Cervejas", "Refrigerantes", "Naturais", "Águas"],
  Alimentos: ["Porções", "Pratos", "Saudáveis"],
  Snacks: ["Salgados", "Petiscos"],
  Sobremesas: ["Sorvetes", "Doces"],
};

/** Lista ordenada dos nomes de categoria. */
export const CATEGORY_NAMES = Object.keys(CATS) as CategoryName[];

/** Gradiente Tailwind por categoria (fundo de fallback quando não há foto). */
const CAT_GRAD: Record<CategoryName, string> = {
  "Combos & Combinações": "bg-gradient-to-br from-indigo-400 to-purple-500",
  Bebidas: "bg-gradient-to-br from-cyan-400 to-blue-500",
  Alimentos: "bg-gradient-to-br from-amber-400 to-orange-500",
  Snacks: "bg-gradient-to-br from-yellow-400 to-amber-500",
  Sobremesas: "bg-gradient-to-br from-pink-400 to-rose-500",
};

/** Emoji representativo de cada categoria. */
export const CAT_EMOJI: Record<CategoryName, string> = {
  "Combos & Combinações": "🍱",
  Bebidas: "🥤",
  Alimentos: "🍽️",
  Snacks: "🍿",
  Sobremesas: "🍦",
};

/** Cor sólida (hex) por categoria — usada em gráficos. */
export const CAT_COLORS: Record<string, string> = {
  "Combos & Combinações": "#8b5cf6",
  Bebidas: "#06b6d4",
  Alimentos: "#f59e0b",
  Snacks: "#eab308",
  Sobremesas: "#ec4899",
  Outros: "#94a3b8",
};

/** Retorna o gradiente de fundo da categoria (com fallback neutro). */
export const catGrad = (cat: CategoryName | string): string =>
  CAT_GRAD[cat as CategoryName] || "bg-gradient-to-br from-slate-300 to-slate-400";

/** Medalhas para rankings (1º, 2º, 3º). */
export const MEDAL = ["🥇", "🥈", "🥉"];
