import { useState, type MouseEvent } from "react";
import { ArrowLeft } from "lucide-react";
import { Img } from "@/components/Img";
import { catGrad } from "@/data/categories";
import type { MenuItem } from "@/types";

export interface GalleryProps {
  item: MenuItem;
  className?: string;
}

/**
 * Galeria de fotos de um item. Com uma única foto, comporta-se como {@link Img};
 * com duas, permite deslizar entre elas com setas e mostra indicadores.
 */
export function Gallery({ item, className }: GalleryProps) {
  const photos = [item.photo, item.photo2].filter(Boolean) as string[];
  const [idx, setIdx] = useState(0);

  if (photos.length <= 1) {
    return (
      <Img src={item.photo} emoji={item.emoji} gradient={catGrad(item.cat)} className={className} />
    );
  }

  const go = (e: MouseEvent, d: number) => {
    e.stopPropagation();
    setIdx((p) => (p + d + photos.length) % photos.length);
  };

  return (
    <div className="relative">
      <Img
        src={photos[idx]}
        emoji={item.emoji}
        gradient={catGrad(item.cat)}
        className={className}
      />
      <button
        onClick={(e) => go(e, -1)}
        aria-label="Foto anterior"
        className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/35 text-white flex items-center justify-center backdrop-blur active:scale-90"
      >
        <ArrowLeft size={15} />
      </button>
      <button
        onClick={(e) => go(e, 1)}
        aria-label="Próxima foto"
        className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/35 text-white flex items-center justify-center backdrop-blur active:scale-90"
      >
        <ArrowLeft size={15} className="rotate-180" />
      </button>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {photos.map((_, k) => (
          <span
            key={k}
            className={`w-1.5 h-1.5 rounded-full transition ${k === idx ? "bg-white" : "bg-white/50"}`}
          />
        ))}
      </div>
    </div>
  );
}
