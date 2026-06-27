import { useState, type ChangeEvent, type Dispatch, type SetStateAction } from "react";
import { Download, Edit3, FileSpreadsheet, Plus, Trash2, Upload, X } from "lucide-react";
import { Img } from "@/components/Img";
import { CATEGORY_NAMES, CAT_EMOJI, catGrad } from "@/data/categories";
import { csvToItems, downloadMenuTemplate } from "@/lib/csv";
import { isPromo, money, pct } from "@/lib/format";
import type { CategoryName, MenuItem, MenuItemForm } from "@/types";
import { ItemEditor } from "./ItemEditor";

export interface CardapioProps {
  menu: MenuItem[];
  setMenu: Dispatch<SetStateAction<MenuItem[]>>;
}

type CatFilter = "Todos" | CategoryName;
type ImportMode = "replace" | "append";

const blankItem = (): MenuItemForm => ({
  name: "",
  desc: "",
  price: "",
  oldPrice: "",
  emoji: "🍽️",
  photo: "",
  photo2: "",
  measure: "",
  unit: "g",
  cat: "Bebidas",
  sub: "Drinks",
});

/** Gestão do cardápio: listar, criar, editar, excluir e importar via CSV. */
export function Cardapio({ menu, setMenu }: CardapioProps) {
  const [editing, setEditing] = useState<MenuItemForm | null>(null);
  const [catFilter, setCatFilter] = useState<CatFilter>("Todos");
  const [imp, setImp] = useState<MenuItem[] | null>(null);

  const list = catFilter === "Todos" ? menu : menu.filter((i) => i.cat === catFilter);

  const save = (item: MenuItemForm) => {
    const clean: MenuItem = {
      ...item,
      id: item.id ?? Date.now(),
      price: parseFloat(item.price) || 0,
      oldPrice: item.oldPrice ? parseFloat(item.oldPrice) : undefined,
      measure: item.measure ? parseFloat(item.measure) : undefined,
      unit: item.unit || "g",
    };
    if (item.id) setMenu((m) => m.map((x) => (x.id === item.id ? clean : x)));
    else setMenu((m) => [...m, clean]);
    setEditing(null);
  };

  const del = (id: number) => setMenu((m) => m.filter((x) => x.id !== id));

  const onImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const r = new FileReader();
    r.onload = () => setImp(csvToItems(String(r.result || "")));
    r.readAsText(file, "utf-8");
  };

  const applyImport = (mode: ImportMode) => {
    if (!imp) return;
    if (mode === "replace") setMenu(imp);
    else setMenu((m) => [...m, ...imp]);
    setImp(null);
  };

  const toForm = (i: MenuItem): MenuItemForm => ({
    ...i,
    price: String(i.price),
    oldPrice: i.oldPrice ? String(i.oldPrice) : "",
    measure: i.measure ? String(i.measure) : "",
    unit: i.unit || "g",
  });

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
        <h2 className="font-semibold text-slate-600">
          {list.length} {list.length === 1 ? "item" : "itens"}
          {catFilter !== "Todos" ? ` em ${catFilter}` : " no cardápio"}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={downloadMenuTemplate}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-3 py-2 rounded-xl flex items-center gap-1 active:scale-95"
          >
            <Download size={15} /> <span className="hidden sm:inline">Modelo</span>
          </button>
          <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-3 py-2 rounded-xl flex items-center gap-1 active:scale-95 cursor-pointer">
            <Upload size={15} /> <span className="hidden sm:inline">Importar</span>
            <input type="file" accept=".csv,text/csv" onChange={onImport} className="hidden" />
          </label>
          <button
            onClick={() => setEditing(blankItem())}
            className="bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-medium px-3 py-2 rounded-xl flex items-center gap-1 active:scale-95"
          >
            <Plus size={16} /> Novo item
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-3 overflow-x-auto">
        {(["Todos", ...CATEGORY_NAMES] as CatFilter[]).map((c) => (
          <button
            key={c}
            onClick={() => setCatFilter(c)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${catFilter === c ? "bg-slate-900 text-white" : "bg-white text-slate-600"}`}
          >
            {c === "Todos" ? "Todos" : `${CAT_EMOJI[c]} ${c}`}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {list.map((i) => (
          <div key={i.id} className="bg-white rounded-xl p-2.5 flex items-center gap-3 shadow-sm">
            <Img
              src={i.photo}
              emoji={i.emoji}
              gradient={catGrad(i.cat)}
              className="w-12 h-12 rounded-lg shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {i.name}{" "}
                {isPromo(i) && (
                  <span className="text-[10px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded-full ml-1">
                    -{pct(i)}%
                  </span>
                )}
              </p>
              <p className="text-xs text-slate-400">
                {i.cat} › {i.sub} · {money(i.price)}
                {isPromo(i) && (
                  <span className="line-through ml-1 text-slate-300">
                    {money(i.oldPrice as number)}
                  </span>
                )}
                {i.measure ? ` · ${String(i.measure).replace(".", ",")} ${i.unit}` : ""}
              </p>
            </div>
            <button
              onClick={() => setEditing(toForm(i))}
              aria-label={`Editar ${i.name}`}
              className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 active:scale-90"
            >
              <Edit3 size={15} />
            </button>
            <button
              onClick={() => del(i.id)}
              aria-label={`Excluir ${i.name}`}
              className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500 active:scale-90"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      {editing && <ItemEditor item={editing} onSave={save} onClose={() => setEditing(null)} />}

      {imp && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
          onClick={() => setImp(null)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-2xl p-5 w-full max-w-md max-h-[88vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <FileSpreadsheet size={20} className="text-cyan-500" /> Importar cardápio
              </h2>
              <button onClick={() => setImp(null)} aria-label="Fechar">
                <X size={22} className="text-slate-400" />
              </button>
            </div>
            {imp.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-slate-500 text-sm">Nenhum item válido encontrado na planilha.</p>
                <p className="text-[11px] text-slate-400 mt-2">
                  A 1ª linha precisa ter os títulos das colunas (nome, categoria, preco…). Baixe o
                  modelo se precisar.
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-slate-600 mb-3">
                  <b className="text-cyan-600">{imp.length}</b>{" "}
                  {imp.length === 1 ? "item encontrado" : "itens encontrados"}:
                </p>
                <div className="space-y-1.5 max-h-60 overflow-y-auto mb-4">
                  {imp.map((i) => (
                    <div
                      key={i.id}
                      className="flex items-center justify-between text-sm border border-slate-100 rounded-lg px-2.5 py-1.5"
                    >
                      <span className="truncate">
                        <span className="mr-1">{i.emoji}</span>
                        {i.name}{" "}
                        <span className="text-[11px] text-slate-400">
                          · {i.cat} › {i.sub}
                        </span>
                      </span>
                      <span className="font-semibold text-slate-700 shrink-0 pl-2">
                        {money(i.price)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => applyImport("append")}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 rounded-xl active:scale-95 text-sm"
                  >
                    Adicionar ao cardápio
                  </button>
                  <button
                    onClick={() => applyImport("replace")}
                    className="bg-slate-900 text-white font-semibold py-3 rounded-xl active:scale-95 text-sm"
                  >
                    Substituir tudo
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-2 text-center">
                  As fotos são adicionadas depois, item a item, pelo editor.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
