"use client";

import { useState, useEffect } from "react";

export default function CountUp({ value, dur = 850 }: { value: number; dur?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf: number;
    const s = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - s) / dur);
      setN(value * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, dur]);
  return <>{Math.round(n)}</>;
}
