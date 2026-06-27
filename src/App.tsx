import { useState } from "react";
import { Sun } from "lucide-react";
import { AppStoreProvider } from "@/store/AppStore";
import { Landing } from "@/features/landing/Landing";
import { Cliente } from "@/features/client/Cliente";
import { Restaurante } from "@/features/restaurant/Restaurante";
import { Admin } from "@/features/admin/Admin";

/** Áreas de alto nível navegáveis pela barra superior (demo). */
type View = "landing" | "cliente" | "restaurante" | "admin";

/** Ponto inicial da jornada do cliente. */
export type ClientStart = "menu" | "qr";

const NAV: { id: View; label: string }[] = [
  { id: "landing", label: "🌐 Site" },
  { id: "cliente", label: "📱 Cliente (QR)" },
  { id: "restaurante", label: "🏖️ Restaurante" },
  { id: "admin", label: "🛡️ Admin" },
];

export function App() {
  const [view, setView] = useState<View>("landing");
  const [clientStart, setClientStart] = useState<ClientStart>("menu");

  const enterClient = (start: ClientStart) => {
    setClientStart(start);
    setView("cliente");
  };

  return (
    <AppStoreProvider>
      <div
        className="min-h-screen bg-slate-100 text-slate-800"
        style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}
      >
        <header className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between sticky top-0 z-40">
          <button
            onClick={() => setView("landing")}
            className="flex items-center gap-2 font-bold tracking-tight"
          >
            <Sun size={18} className="text-amber-400" /> PedeAí{" "}
            <span className="text-slate-400 font-normal text-xs hidden sm:inline">· demo</span>
          </button>
          <nav className="flex gap-1 bg-slate-800 rounded-lg p-1 text-sm">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => (n.id === "cliente" ? enterClient("qr") : setView(n.id))}
                className={`px-3 py-1.5 rounded-md font-medium transition ${
                  view === n.id ? "bg-cyan-500 text-white" : "text-slate-300"
                }`}
              >
                {n.label}
              </button>
            ))}
          </nav>
        </header>

        {view === "landing" && (
          <Landing
            onEnter={() => enterClient("menu")}
            onForEstablishment={() => setView("restaurante")}
          />
        )}
        {view === "cliente" && <Cliente start={clientStart} />}
        {view === "restaurante" && <Restaurante />}
        {view === "admin" && <Admin />}
      </div>
    </AppStoreProvider>
  );
}
