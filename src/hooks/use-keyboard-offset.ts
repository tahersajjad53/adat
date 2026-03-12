import { useState, useEffect, useRef, type RefObject } from 'react';

interface UseKeyboardOffsetOptions {
  enabled?: boolean;
  containerRef?: RefObject<HTMLElement | null>;
}

export function useKeyboardOffset(options?: UseKeyboardOffsetOptions) {
  const { enabled = true, containerRef } = options || {};
  const [offset, setOffset] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) {
      setOffset(0);
      return;
    }

    const viewport = window.visualViewport;
    if (!viewport) return;

    const update = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const viewportBottom = viewport.offsetTop + viewport.height;

        if (containerRef?.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const overlap = rect.bottom - viewportBottom;
          // Only apply if overlap is meaningful (>30px threshold to avoid jitter)
          setOffset(overlap > 30 ? overlap : 0);
        } else {
          // Fallback: raw keyboard height estimate
          const kbHeight = window.innerHeight - viewport.height;
          setOffset(kbHeight > 50 ? kbHeight : 0);
        }
      });
    };

    viewport.addEventListener('resize', update);
    viewport.addEventListener('scroll', update);
    return () => {
      viewport.removeEventListener('resize', update);
      viewport.removeEventListener('scroll', update);
      cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, containerRef]);

  return offset;
}
