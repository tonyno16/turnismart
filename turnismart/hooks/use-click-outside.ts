import { useEffect, useRef, type RefObject } from "react";

/** Calls `callback` when a click occurs outside the given ref element(s). */
export function useClickOutside(
  ref: RefObject<HTMLElement | null> | RefObject<HTMLElement | null>[],
  callback: () => void,
  active = true
) {
  const refsRef = useRef(ref);
  refsRef.current = ref;
  useEffect(() => {
    if (!active) return;
    const handler = (e: MouseEvent) => {
      const refs = Array.isArray(refsRef.current) ? refsRef.current : [refsRef.current];
      const target = e.target as Node;
      const isInside = refs.some((r) => r.current && r.current.contains(target));
      if (!isInside) callback();
    };
    // Use 'click' (capture) instead of 'mousedown' to avoid closing on the same interaction that opened
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [callback, active]);
}
