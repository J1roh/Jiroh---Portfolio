import { useEffect } from "react";
import { useLocation } from "react-router";

/** On every route change: jump to the #hash target when there is one, else (or for #top) to the top. */
export function useRouteScroll() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash || hash === "#top") { window.scrollTo(0, 0); return; }
    const id = requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView());
    return () => cancelAnimationFrame(id);
  }, [pathname, hash]);
}
