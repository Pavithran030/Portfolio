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

    // On resize: keep the current progress, just redraw (do not restart).
    const ro = new ResizeObserver(() => {
      sizeCanvas();
      if (s.current.started) {
        cancelAnimationFrame(s.current.raf);
        s.current.raf = requestAnimationFrame(frame);
      }
    });
    ro.observe(c);

    const io = new IntersectionObserver(
      ([entry]) => {
        s.current.visible = entry.isIntersecting;
        if (entry.isIntersecting) {
          if (!s.current.started) replay();
          else {
            cancelAnimationFrame(s.current.raf);
            s.current.raf = requestAnimationFrame(frame); // resume or redraw
          }
        } else {
          cancelAnimationFrame(s.current.raf); // stop rAF while off-screen
        }
      },
      { threshold: 0.4 }
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
