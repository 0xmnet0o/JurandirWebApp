import { useState } from "react";

export interface ImgProps {
  /** URL ou data-URL da imagem. Se ausente ou falhar, exibe o emoji de fallback. */
  src?: string;
  emoji?: string;
  /** Classe(s) Tailwind de gradiente para o fundo de fallback. */
  gradient?: string;
  className?: string;
}

/**
 * Imagem com fallback gracioso: enquanto não há `src` ou se o carregamento
 * falhar, mostra um bloco com gradiente e um emoji centralizado.
 */
export function Img({ src, emoji, gradient, className }: ImgProps) {
  const [err, setErr] = useState(false);

  if (!src || err) {
    return (
      <div
        className={`${className ?? ""} ${gradient ?? "bg-gradient-to-br from-slate-200 to-slate-300"} flex items-center justify-center`}
      >
        <span className="text-5xl drop-shadow-sm">{emoji}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      onError={() => setErr(true)}
      className={`${className ?? ""} object-cover`}
    />
  );
}
