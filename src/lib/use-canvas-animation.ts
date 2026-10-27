import { useCallback, useEffect, useRef } from "react";

export type DrawFn = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void;

/**
 * duration: total ms the animation needs to reach its final frame.
 * Returns a ref for the <canvas> and a replay() function for the Replay button.
 */
export function useCanvasAnimation(draw: DrawFn, duration: number) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef(draw);
  drawRef.current = draw;

  const s = useRef({ start: 0, raf: 0, visible: false, started: false });

  const frame = useCallback(
    (now: number) => {
      const c = canvasRef.current;
      if (!c) return;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const t = reduced ? Infinity : now - s.current.start;
      const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawRef.current(ctx, c.clientWidth, c.clientHeight, t);
      // Only keep the loop alive while unfinished AND visible.
      if (t < duration && s.current.visible) {
        s.current.raf = requestAnimationFrame(frame);
      }
    },
    [duration]
  );

  const replay = useCallback(() => {
    cancelAnimationFrame(s.current.raf);
    s.current.started = true;
    s.current.visible = true;
    s.current.start = performance.now();
    s.current.raf = requestAnimationFrame(frame);
  }, [frame]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;

    const sizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = Math.max(1, Math.round(c.clientWidth * dpr));
      c.height = Math.max(1, Math.round(c.clientHeight * dpr));
    };
    sizeCanvas();

    // On resize: redraw current state
    const ro = new ResizeObserver(() => {
      sizeCanvas();
      if (s.current.started) {
        cancelAnimationFrame(s.current.raf);
        s.current.raf = requestAnimationFrame(frame);
      }
    });
    ro.observe(c);

    // Check if element is already in viewport on mount (e.g. if loaded scrolled down)
    const rect = c.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (inView) {
      s.current.visible = true;
      replay();
    }

    // Trigger animation whenever scrolled into view
    const io = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        s.current.visible = isVisible;
        if (isVisible) {
          replay();
        } else {
          cancelAnimationFrame(s.current.raf);
        }
      },
      { threshold: 0.15 }
    );
    io.observe(c);

    const currentRaf = s.current;
    return () => {
      ro.disconnect();
      io.disconnect();
      cancelAnimationFrame(currentRaf.raf);
    };
  }, [frame, replay]);

  return { canvasRef, replay };
}
