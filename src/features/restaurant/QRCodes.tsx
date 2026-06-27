import { useState } from "react";
import { Download, MapPin, Plus, Printer, QrCode, Trash2, X } from "lucide-react";
import { Img } from "@/components/Img";
import type { Restaurant } from "@/types";

export interface QRCodesProps {
  restaurant: Restaurant;
}

interface QrLocation {
  id: number;
  label: string;
}

const slugify = (name: string): string =>
  (name || "estabelecimento")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const escapeHtml = (s: string): string =>
  String(s).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string,
  );

/** Gera, baixa e imprime QR Codes que vinculam cada local ao cardápio. */
export function QRCodes({ restaurant }: QRCodesProps) {
  const slug = slugify(restaurant.name);
  const [label, setLabel] = useState("");
  const [list, setList] = useState<QrLocation[]>([
    { id: 1, label: "Guarda-sol nº 14" },
    { id: 2, label: "Mesa 07" },
  ]);
  const [seq, setSeq] = useState(3);
  const [zoom, setZoom] = useState<QrLocation | null>(null);

  const qrUrl = (l: string) => `https://pedeai.com.br/${slug}?local=${encodeURIComponent(l)}`;
  const qrImg = (l: string, size: number) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=10&data=${encodeURIComponent(qrUrl(l))}`;

  const add = () => {
    const t = label.trim();
    if (!t) return;
    if (list.some((e) => e.label.toLowerCase() === t.toLowerCase())) {
      setLabel("");
      return;
    }
    setList((x) => [...x, { id: seq, label: t }]);
    setSeq((s) => s + 1);
    setLabel("");
  };
  const del = (id: number) => setList((x) => x.filter((e) => e.id !== id));

  const printQR = (e: QrLocation) => {
    const w = window.open("", "_blank", "width=440,height=620");
    if (!w) return;
    w.document.write(
      `<!doctype html><html><head><title>QR ${escapeHtml(e.label)} — ${escapeHtml(restaurant.name)}</title><meta charset="utf-8"><style>body{font-family:ui-sans-serif,system-ui,sans-serif;text-align:center;padding:32px;color:#0f172a;margin:0}img{width:320px;height:320px}.est{color:#64748b;font-size:14px;margin:0 0 12px}.loc{font-size:24px;font-weight:800;margin:14px 0 4px}.cta{color:#64748b;font-size:13px}</style></head><body><p class="est">${escapeHtml(restaurant.name)}</p><img src="${qrImg(e.label, 600)}" onload="window.focus();window.print()" /><div class="loc">${escapeHtml(e.label)}</div><p class="cta">Escaneie para ver o cardápio e pedir 🍹</p></body></html>`,
    );
    w.document.close();
  };

  return (
    <div>
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <h2 className="font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
          <QrCode size={16} className="text-cyan-500" /> Gerar QR Code por mesa/guarda-sol
        </h2>
        <p className="text-xs text-slate-400 mb-3">
          Cada QR abre o cardápio já identificando o local — assim o pedido chega com a
          mesa/guarda-sol de origem.
        </p>
        <div className="flex gap-2">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            maxLength={40}
            placeholder="Ex: Guarda-sol nº 22, Mesa 12, Deck 03…"
            className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none"
          />
          <button
            onClick={add}
            disabled={!label.trim()}
            className="bg-cyan-500 disabled:bg-slate-300 hover:bg-cyan-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl flex items-center gap-1 active:scale-95 shrink-0"
          >
            <Plus size={16} /> Gerar
          </button>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <QrCode size={40} className="mx-auto mb-3 opacity-40" />
          <p>Nenhum QR Code ainda. Digite um local acima para gerar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {list.map((e) => (
            <div
              key={e.id}
              className="bg-white rounded-2xl p-3 shadow-sm flex flex-col items-center text-center"
            >
              <button
                onClick={() => setZoom(e)}
                className="rounded-xl overflow-hidden border border-slate-100 active:scale-95 transition"
              >
                <Img src={qrImg(e.label, 220)} emoji="🔳" className="w-full aspect-square" />
              </button>
              <p className="font-semibold text-sm text-slate-700 mt-2 flex items-center gap-1">
                <MapPin size={12} className="text-cyan-500 shrink-0" /> {e.label}
              </p>
              <div className="flex gap-1.5 mt-2 w-full">
                <a
                  href={qrImg(e.label, 600)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium py-2 rounded-lg flex items-center justify-center gap-1 active:scale-95"
                >
                  <Download size={13} /> Baixar
                </a>
                <button
                  onClick={() => printQR(e)}
                  aria-label="Imprimir"
                  className="w-8 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg flex items-center justify-center active:scale-90 shrink-0"
                >
                  <Printer size={14} />
                </button>
                <button
                  onClick={() => del(e.id)}
                  aria-label="Excluir"
                  className="w-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center active:scale-90 shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {zoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setZoom(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-xs text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-slate-800">{restaurant.name}</span>
              <button onClick={() => setZoom(null)} aria-label="Fechar">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <Img
              src={qrImg(zoom.label, 320)}
              emoji="🔳"
              className="w-full aspect-square rounded-xl border border-slate-100"
            />
            <p className="font-bold text-lg mt-3 flex items-center justify-center gap-1.5">
              <MapPin size={16} className="text-cyan-500" /> {zoom.label}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 break-all">{qrUrl(zoom.label)}</p>
            <p className="text-xs text-slate-500 mt-3">
              Imprima e fixe no local. Ao escanear, o cliente abre o cardápio já vinculado a{" "}
              <b>{zoom.label}</b>.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => printQR(zoom)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-xl active:scale-95 transition flex items-center justify-center gap-2"
              >
                <Printer size={16} /> Imprimir
              </button>
              <a
                href={qrImg(zoom.label, 600)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2.5 rounded-xl active:scale-95 transition flex items-center justify-center gap-2"
              >
                <Download size={16} /> Baixar
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
