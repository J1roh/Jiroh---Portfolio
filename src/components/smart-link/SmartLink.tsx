import type { AnchorHTMLAttributes } from "react";
import { Link } from "react-router";

type SmartLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

/** A link that stays in the app for site paths ("/work") and is a plain anchor for everything else (mailto, files, #). */
export function SmartLink({ href, ...rest }: SmartLinkProps) {
  if (href.startsWith("/")) return <Link to={href} {...rest} />;
  return <a href={href} {...rest} />;
}
