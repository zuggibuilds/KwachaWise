import { useEffect, useRef, useState } from 'react';
import { motion } from '../lib/motion';

export function useCountUp(target: number, options?: { duration?: number; enabled?: boolean }) {
  const { duration = parseInt(motion.durations.medium, 10), enabled = true } = options || {};
  const [value, setValue] = useState(target);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef<number>(target);

  useEffect(() => {
    if (!enabled) {
      setValue(target);
      return;
    }
    const start = performance.now();
    startRef.current = start;
    fromRef.current = value;
    const dur = duration;

    const tick = (t: number) => {
      if (startRef.current === null) return;
      const elapsed = t - startRef.current;
      const pct = Math.min(1, elapsed / dur);
      const next = Math.round((target - fromRef.current) * pct + fromRef.current);
      setValue(next);
      if (pct < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      startRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration, enabled]);

  return value;
}
