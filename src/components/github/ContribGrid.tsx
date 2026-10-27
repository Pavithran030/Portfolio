import React, { useState, useCallback, useRef } from "react";
import { days, weekCount, total, COLORS, DARK_LEVEL_0, type Day } from "../../lib/github-data";
import { layoutGrid } from "../../lib/grid-layout";
import { useCanvasAnimation, type DrawFn } from "../../lib/use-canvas-animation";
import ReplayButton from "./ReplayButton";

const DURATION = (weekCount + 6) * 14 + 450 + 300;

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);

function easeOutBack(x: number) {
  const c1 = 1.4;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

const draw: DrawFn = (ctx, w, h, t) => {
  ctx.clearRect(0, 0, w, h);

  const { topHeader, cs, cellSize, startX, startY } = layoutGrid(w, h);
  const family = getComputedStyle(ctx.canvas).fontFamily || "inherit";
  const textColor = getComputedStyle(ctx.canvas).color || "#ffffff";

  // Big number header counting up
  const progress = isFinite(t) ? clamp(t / (DURATION - 200)) : 1;
  const currentTotal = Math.round(total * easeOutCubic(progress));

  ctx.fillStyle = textColor;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.font = `800 ${Math.max(20, Math.round(topHeader * 0.42))}px ${family}`;
  ctx.fillText(String(currentTotal), startX, 10);

  ctx.globalAlpha = 0.6;
  ctx.font = `500 ${Math.max(11, Math.round(topHeader * 0.22))}px ${family}`;
  ctx.fillText("contributions in the last year", startX, Math.max(20, Math.round(topHeader * 0.42)) + 14);
  ctx.globalAlpha = 1;

  // Cells drop in on a diagonal wave
  for (const d of days) {
    const delay = (d.week + d.dow) * 14;
    const u = isFinite(t) ? clamp((t - delay) / 450) : 1;
    if (u <= 0) continue;

    const eased = isFinite(t) ? easeOutBack(u) : 1;
    const targetX = startX + d.week * cs;
    const targetY = startY + d.dow * cs;

    // cell starts 24px above, settles into place, scales 0.6 to 1
    const offsetY = isFinite(t) ? (1 - eased) * 24 : 0;
    const scale = isFinite(t) ? 0.6 + 0.4 * clamp(eased, 0, 1.2) : 1;
    const alpha = isFinite(t) ? clamp(u * 1.5) : 1;

    ctx.save();
    ctx.globalAlpha = alpha;

    const cx = targetX + cellSize / 2;
    const cy = targetY + cellSize / 2 + offsetY;
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    const half = cellSize / 2;
    const r = Math.max(1, cellSize * 0.18);

    ctx.beginPath();
    ctx.roundRect(-half, -half, cellSize, cellSize, r);

    if (d.level === 0) {
      ctx.fillStyle = DARK_LEVEL_0;
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 0.5;
      ctx.stroke();
    } else {
      ctx.fillStyle = COLORS[d.level];
      ctx.fill();
    }

    ctx.restore();
  }
};

export default function ContribGrid() {
  const { canvasRef, replay } = useCanvasAnimation(draw, DURATION);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; day: Day } | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const handleReplay = useCallback(() => {
    startTimeRef.current = Date.now();
    setTooltip(null);
    replay();
  }, [replay]);

  const handlePointer = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const { cs, cellSize, startX, startY } = layoutGrid(rect.width, rect.height);
    const col = Math.floor((x - startX) / cs);
    const row = Math.floor((y - startY) / cs);

    if (col >= 0 && col < weekCount && row >= 0 && row < 7) {
      const cellLeft = startX + col * cs;
      const cellTop = startY + row * cs;
      // check if pointer is actually on the cell rectangle
      if (x >= cellLeft && x <= cellLeft + cellSize && y >= cellTop && y <= cellTop + cellSize) {
        const day = days.find((d) => d.week === col && d.dow === row);
        if (day) {
          setTooltip({ x: cellLeft + cellSize / 2, y: cellTop, day });
          return;
        }
      }
    }
    setTooltip(null);
  }, [canvasRef]);

  const handlePointerLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  return (
    <div className="relative w-full max-w-[840px] mx-auto aspect-[16/8] sm:aspect-[16/7] flex items-center justify-center">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`GitHub contribution grid: ${total} contributions`}
        className="w-full h-full block cursor-crosshair touch-manipulation"
        onPointerMove={handlePointer}
        onPointerDown={handlePointer}
        onPointerLeave={handlePointerLeave}
      />
      <ReplayButton onClick={handleReplay} />

      {tooltip && (
        <div
          className="pointer-events-none absolute z-20 px-2.5 py-1.5 text-xs font-mono rounded-md border border-border bg-popover/90 backdrop-blur text-popover-foreground shadow-lg -translate-x-1/2 -translate-y-full mb-2 whitespace-nowrap"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y - 6}px`,
          }}
        >
          <div className="font-semibold text-accent-ice">
            {tooltip.day.count === 0 ? "No contributions" : `${tooltip.day.count} contribution${tooltip.day.count === 1 ? "" : "s"}`}
          </div>
          <div className="text-[10px] text-muted-foreground">{tooltip.day.date}</div>
        </div>
      )}
    </div>
  );
}
