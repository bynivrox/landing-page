"use client";

import type { MotionValue } from "motion/react";
import { useEffect, useRef } from "react";

/**
 * motion's useMotionValueEvent(value, "change", ...), but subscribed after mount. motion subscribes in an insertion
 * effect, so a scroll value measured during hydration would set state on a component that has not mounted yet.
 * Runs once on mount with the current value, so a page loaded mid-scroll starts in the right state.
 */
export function useMotionValueChange<T>(value: MotionValue<T>, onChange: (latest: T) => void) {
  const callback = useRef(onChange);

  useEffect(() => {
    callback.current = onChange;
  });

  useEffect(() => {
    callback.current(value.get());
    return value.on("change", (latest) => callback.current(latest));
  }, [value]);
}
