import type { ElementType, ReactNode } from "react";
import "./surface-panel.css";

type SurfacePanelProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Accessible name, for when the panel is a landmark such as <nav>. */
  label?: string;
};

/** A raised navy panel with a hairline edge that lightly blurs what scrolls under it. */
export function SurfacePanel({ children, as: Tag = "div", className = "", label }: SurfacePanelProps) {
  return <Tag className={`surface-panel ${className}`.trim()} aria-label={label}>{children}</Tag>;
}
