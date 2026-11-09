import type { ReactNode } from "react";
import { SmartLink } from "../smart-link";
import "./button.css";

type ButtonProps = {
  href: string;
  children: ReactNode;
  /** solid: white pill. quiet: outlined pill. label: compact white pill. text: no block. */
  variant?: "solid" | "quiet" | "label" | "text";
  /** Figma v4.1 pills end in a round chip with ↗. */
  arrow?: boolean;
  /** Opens in a new tab (external files, mail). */
  external?: boolean;
};

/** A link styled as a button. Navigation only; actions use a <button>. */
export function Button({ href, children, variant = "solid", arrow = false, external = false }: ButtonProps) {
  return (
    <SmartLink
      className={`button button--${variant}${arrow ? " button--arrow" : ""}`} href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      <span className="button__label">{children}</span>
      {arrow && <span className="button__chip" aria-hidden="true">↗</span>}
    </SmartLink>
  );
}
