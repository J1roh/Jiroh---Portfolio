import { useEffect, useState, type CSSProperties } from "react";
import { traceOutline } from "./trace-outline";
import "./logo-outline.css";

type LogoOutlineProps = {
  /** Image whose opaque shape is outlined. */
  src: string;
  /** Box in px: where the outline sits and how big it is drawn. */
  box: { x: number; y: number; w: number; h: number };
  /** Stroke width in css px. */
  stroke?: number;
  className?: string;
};

/**
 * The logo as line art: its outline traced from the PNG at the box's exact size, so it can sit on top of
 * the ASCII logo. The trace is used as a CSS mask, so the colour follows the theme token without a redraw.
 */
export function LogoOutline({ src, box, stroke = 2, className }: LogoOutlineProps) {
  const [mask, setMask] = useState<string | null>(null);
  // Room for the half of the stroke that falls outside the box, so edges on the border are not cut.
  const pad = stroke;
  const width = Math.round((box.w + pad * 2) * devicePixelRatio);
  const height = Math.round((box.h + pad * 2) * devicePixelRatio);

  useEffect(() => {
    let current = true;
    void traceOutline(src, width, height, stroke * devicePixelRatio, pad * devicePixelRatio)
      .then((url) => { if (current) setMask(url); });
    return () => { current = false; };
  }, [src, width, height, stroke, pad]);

  const style: CSSProperties = {
    left: box.x - pad, top: box.y - pad, width: box.w + pad * 2, height: box.h + pad * 2,
    ...(mask ? { maskImage: `url(${mask})`, WebkitMaskImage: `url(${mask})` } : { visibility: "hidden" }),
  };
  return <div className={["logo-outline", className].filter(Boolean).join(" ")} style={style} aria-hidden="true" />;
}
