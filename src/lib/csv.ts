import { CATS, CATEGORY_NAMES } from "@/data/categories";
import type { CategoryName, MeasureUnit, MenuItem } from "@/types";

/** Marca de ordem de bytes (BOM) usada em CSVs gerados pelo Excel. */
const BOM = "﻿";

/** Normaliza uma string (minúscula, sem acentos, sem espaços nas pontas). */
const ACC = (s: string): string =>
  String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

// Chaves de coluna reconhecidas no CSV de cardápio.
type ColumnKey =
  "name" | "desc" | "cat" | "sub" | "price" | "oldPrice" | "measure" | "unit" | "emoji";

/** Aliases aceitos para cada coluna do CSV de cardápio. */
const HDR_ALIASES: Record<ColumnKey, string[]> = {
  name: ["nome", "name", "item", "produto"],
  desc: ["descricao", "desc", "description"],
  cat: ["categoria", "cat"],
  sub: ["subcategoria", "subcat", "sub"],
  price: ["preco", "price", "valor"],
  oldPrice: ["preco promocional", "preco_promocional", "preco de", "preco_de", "promocao", "de"],
  measure: ["medida", "quantidade", "qtd", "measure"],
  unit: ["unidade", "unit", "un"],
  emoji: ["emoji", "icone"],
};

/** Faz o parse de um texto CSV (detecta `,` ou `;`, respeita aspas) em linhas de campos. */
export function parseCSV(input: string): string[][] {
  const text = input.replace(new RegExp(`^${BOM}`), "");
  const head = text.split(/\r?\n/)[0] || "";
  const delim = head.split(";").length > head.split(",").length ? ";" : ",";

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      quoted = true;
    } else if (c === delim) {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") {
      field += c;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((x) => x.trim() !== ""));
}

/** Converte o conteúdo de um CSV em itens de cardápio. */
export function csvToItems(text: string): MenuItem[] {
  const rows = parseCSV(text);
  if (rows.length < 2) return [];

  const header = rows[0].map(ACC);
  const col: Partial<Record<ColumnKey, number>> = {};
  (Object.entries(HDR_ALIASES) as [ColumnKey, string[]][]).forEach(([key, aliases]) => {
    const idx = header.findIndex((h) => aliases.includes(h));
    if (idx !== -1) col[key] = idx;
  });

  const num = (v: string): number => {
    const n = parseFloat(
      String(v)
        .replace(/[^0-9,.-]/g, "")
        .replace(",", "."),
    );
    return isNaN(n) ? 0 : n;
  };

  const out: MenuItem[] = [];
  for (let r = 1; r < rows.length; r++) {
    const get = (k: ColumnKey): string => {
      const idx = col[k];
      return idx != null ? (rows[r][idx] || "").trim() : "";
    };

    const name = get("name");
    if (!name) continue;

    const cat: CategoryName = CATEGORY_NAMES.find((k) => ACC(k) === ACC(get("cat"))) || "Alimentos";
    const sub = CATS[cat].find((s) => ACC(s) === ACC(get("sub"))) || CATS[cat][0];
    const price = num(get("price"));
    const old = num(get("oldPrice"));
    const measure = num(get("measure"));
    const ru = get("unit").toLowerCase();
    const unit: MeasureUnit = (["g", "kg", "ml", "l"] as string[]).includes(ru)
      ? ru === "l"
        ? "L"
        : (ru as MeasureUnit)
      : "g";

    out.push({
      id: Date.now() + r,
      name,
      desc: get("desc"),
      price,
      oldPrice: old > price ? old : undefined,
      measure: measure || undefined,
      unit,
      emoji: get("emoji") || "🍽️",
      photo: "",
      photo2: "",
      cat,
      sub,
    });
  }
  return out;
}

/** Gera e baixa um CSV-modelo para importação de cardápio. */
export function downloadMenuTemplate(): void {
  const headers = [
    "nome",
    "descricao",
    "categoria",
    "subcategoria",
    "preco",
    "preco_promocional",
    "medida",
    "unidade",
    "emoji",
  ];
  const rows = [
    [
      "Caipirinha de Limão",
      "Cachaça, limão e açúcar",
      "Bebidas",
      "Drinks",
      "22",
      "28",
      "300",
      "ml",
      "🍹",
    ],
    ["Porção de Camarão", "Camarão empanado", "Alimentos", "Porções", "68", "", "300", "g", "🍤"],
  ];
  const csv = BOM + [headers, ...rows].map((r) => r.join(";")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "modelo-cardapio-pedeai.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
