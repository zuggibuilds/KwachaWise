import { useEffect, useState } from 'react';

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = () => setReduced(mq.matches);
    setReduced(mq.matches);
    try {
      mq.addEventListener?.('change', handler);
    } catch (e) {
      // fallback for older browsers
      // @ts-ignore
      mq.addListener?.(handler);
    }
    return () => {
      try {
        mq.removeEventListener?.('change', handler);
      } catch (e) {
        // @ts-ignore
        mq.removeListener?.(handler);
      }
    };
  }, []);
  return reduced;
}
