import type { ReactNode } from "react";
import "./button.css";

type ButtonProps = {
  href: string;
  children: ReactNode;
  /** solid: white block, body type. label: compact white block, mono caps. text: mono caps, no block. */
  variant?: "solid" | "label" | "text";
};

/** A link styled as a button. Navigation only; actions would get a <button> variant. */
export function Button({ href, children, variant = "solid" }: ButtonProps) {
  return (
    <a className={`button button--${variant}`} href={href}>
      <span className="button__label">{children}</span>
    </a>
  );
}
