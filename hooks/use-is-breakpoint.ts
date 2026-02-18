import { useSyncExternalStore } from "react";

type BreakPointMode = "min" | "max";

/**
 * Hook to detect whether the current viewport matches a given breakpoint rule.
 * Example:
 *   useIsBreakpoint("max", 768)   // true when width < 768
 *   useIsBreakpoint("min", 1024)  // true when width >= 1024
 */
export function useIsBreakpoint(
  mode: BreakPointMode = "max",
  breakpoint = 768,
) {
  const query =
    mode === "min"
      ? `(min-width : ${breakpoint}px)`
      : `(max-width : ${breakpoint - 1}px)`;

  return useSyncExternalStore(
    (cb) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", cb);
      return () => mql.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
