import { useState, type ChangeEvent } from "react";
import { Camera, X } from "lucide-react";
import { Img } from "@/components/Img";
import { CATS, CATEGORY_NAMES, catGrad } from "@/data/categories";
import type { CategoryName, MeasureUnit, MenuItemForm } from "@/types";

export interface ItemEditorProps {
  item: MenuItemForm;
  onSave: (item: MenuItemForm) => void;
  onClose: () => void;
}

const EMOJIS = [
  "🍱",
  "🍹",
  "🍺",
  "🥂",
  "🥤",
  "💧",
  "🥥",
  "🍊",
  "🍤",
  "🍟",
  "🍲",
  "🥩",
  "🥗",
  "🍇",
  "🥜",
  "🍿",
  "🥔",
  "🍦",
  "🍧",
  "🍨",
  "🍫",
  "🍩",
  "🍰",
  "☕",
];
const PHOTO_KEYS: ("photo" | "photo2")[] = ["photo", "photo2"];

/** Editor (modal) de um item do cardápio — cria ou edita. */
export function ItemEditor({ item, onSave, onClose }: ItemEditorProps) {
  const [f, setF] = useState<MenuItemForm>(item);

  const upd = <K extends keyof MenuItemForm>(k: K, v: MenuItemForm[K]) =>
    setF((p) => ({ ...p, [k]: v }));

  const onFile = (key: "photo" | "photo2") => (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => upd(key, typeof r.result === "string" ? r.result : "");
    r.readAsDataURL(file);
  };

  const onlyNum = (v: string) => v.replace(/[^0-9.]/g, "");

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-2xl p-5 w-full max-w-md max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">{item.id ? "Editar item" : "Novo item"}</h2>
          <button onClick={onClose} aria-label="Fechar">
            <X size={22} className="text-slate-400" />
          </button>
        </div>

        <label className="text-xs font-medium text-slate-500">
          Fotos do produto <span className="text-slate-400 font-normal">(até 2)</span>
        </label>
        <div className="grid grid-cols-2 gap-3 mt-1 mb-1">
          {PHOTO_KEYS.map((key, n) => (
            <div key={key} className="flex flex-col gap-2">
              <Img
                src={f[key]}
                emoji={f.emoji}
                gradient={catGrad(f.cat)}
                className="w-full h-24 rounded-xl"
              />
              <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium px-2 py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition">
                <Camera size={14} /> Foto {n + 1}
                <input type="file" accept="image/*" onChange={onFile(key)} className="hidden" />
              </label>
              {f[key] && (
                <button
                  onClick={() => upd(key, "")}
                  className="text-[11px] text-slate-400 underline"
                >
                  remover
                </button>
              )}
            </div>
          ))}
        </div>
        <p className="text-[11px] text-slate-400 mb-3">
          A 1ª foto é a capa. Com 2 fotos, o cliente desliza entre elas no cardápio.
        </p>

        <label className="text-xs font-medium text-slate-500">
          Ícone (usado se não houver foto)
        </label>
        <div className="flex gap-1.5 flex-wrap mt-1 mb-3">
          {EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => upd("emoji", e)}
              className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center ${f.emoji === e ? "bg-cyan-100 ring-2 ring-cyan-500" : "bg-slate-100"}`}
            >
              {e}
            </button>
          ))}
        </div>

        <label className="text-xs font-medium text-slate-500">Nome</label>
        <input
          value={f.name}
          onChange={(e) => upd("name", e.target.value)}
          className="w-full mt-1 mb-3 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none"
          placeholder="Ex: Caipirinha de Limão"
        />

        <label className="text-xs font-medium text-slate-500">Descrição</label>
        <textarea
          value={f.desc}
          onChange={(e) => upd("desc", e.target.value)}
          rows={2}
          className="w-full mt-1 mb-3 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none resize-none"
          placeholder="Ingredientes, porção…"
        />

        <label className="text-xs font-medium text-slate-500">
          Quantidade / medida (mostrada ao cliente)
        </label>
        <div className="grid grid-cols-2 gap-3 mt-1 mb-3">
          <input
            value={f.measure}
            onChange={(e) => upd("measure", onlyNum(e.target.value))}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none"
            placeholder="Ex: 300 (deixe vazio em combos)"
            inputMode="decimal"
          />
          <select
            value={f.unit}
            onChange={(e) => upd("unit", e.target.value as MeasureUnit)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white outline-none"
          >
            <option value="g">gramas (g)</option>
            <option value="kg">quilos (kg)</option>
            <option value="ml">mililitros (ml)</option>
            <option value="L">litros (L)</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs font-medium text-slate-500">Preço (R$)</label>
            <input
              value={f.price}
              onChange={(e) => upd("price", onlyNum(e.target.value))}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none"
              placeholder="0,00"
              inputMode="decimal"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Preço “de” (promoção)</label>
            <input
              value={f.oldPrice}
              onChange={(e) => upd("oldPrice", onlyNum(e.target.value))}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none"
              placeholder="opcional"
              inputMode="decimal"
            />
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mb-3">
          💡 Preencha o “de” maior que o preço para o item entrar nas <b>Ofertas do dia</b>.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs font-medium text-slate-500">Categoria</label>
            <select
              value={f.cat}
              onChange={(e) => {
                const cat = e.target.value as CategoryName;
                setF((p) => ({ ...p, cat, sub: CATS[cat][0] }));
              }}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white outline-none"
            >
              {CATEGORY_NAMES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Subcategoria</label>
            <select
              value={f.sub}
              onChange={(e) => upd("sub", e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white outline-none"
            >
              {CATS[f.cat].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          disabled={!f.name || !f.price}
          onClick={() => onSave(f)}
          className="w-full bg-cyan-500 disabled:bg-slate-300 text-white font-semibold py-3 rounded-xl active:scale-95"
        >
          Salvar item
        </button>
      </div>
    </div>
  );
}
