import { describe, expect, it } from "vitest";
import { csvToItems, parseCSV } from "./csv";

describe("parseCSV", () => {
  it("detecta o delimitador ponto-e-vírgula", () => {
    const rows = parseCSV("a;b;c\n1;2;3");
    expect(rows).toEqual([
      ["a", "b", "c"],
      ["1", "2", "3"],
    ]);
  });

  it("respeita aspas com delimitador interno", () => {
    const rows = parseCSV('nome,preco\n"Item, especial",10');
    expect(rows[1]).toEqual(["Item, especial", "10"]);
  });

  it("ignora linhas totalmente vazias", () => {
    const rows = parseCSV("a,b\n\n1,2\n");
    expect(rows).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });
});

describe("csvToItems", () => {
  const header = "nome;preco;categoria;subcategoria;preco_promocional;medida;unidade;emoji";

  it("mapeia colunas por aliases e detecta promoção", () => {
    const items = csvToItems(`${header}\nCaipirinha;22;Bebidas;Drinks;28;300;ml;🍹`);
    expect(items).toHaveLength(1);
    const [item] = items;
    expect(item.name).toBe("Caipirinha");
    expect(item.price).toBe(22);
    expect(item.oldPrice).toBe(28);
    expect(item.cat).toBe("Bebidas");
    expect(item.sub).toBe("Drinks");
    expect(item.measure).toBe(300);
    expect(item.unit).toBe("ml");
    expect(item.emoji).toBe("🍹");
  });

  it("aceita vírgula decimal e normaliza a unidade 'l' para 'L'", () => {
    const items = csvToItems(`${header}\nSuco;14,50;Bebidas;Naturais;;1;l;🍊`);
    expect(items[0].price).toBe(14.5);
    expect(items[0].unit).toBe("L");
  });

  it("usa categoria padrão quando não reconhece a informada", () => {
    const items = csvToItems(`${header}\nMisterioso;10;Inexistente;Nada;;;;`);
    expect(items[0].cat).toBe("Alimentos");
  });

  it("ignora linhas sem nome e retorna vazio sem dados", () => {
    expect(csvToItems(`${header}\n;10;Bebidas;Drinks;;;;`)).toHaveLength(0);
    expect(csvToItems("")).toEqual([]);
  });
});
