import { useEffect, type RefObject } from "react";

/** Calls `callback` when a click occurs outside the given ref element. */
export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  callback: () => void,
  active = true
) {
  useEffect(() => {
    if (!active) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callback();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, callback, active]);
}
