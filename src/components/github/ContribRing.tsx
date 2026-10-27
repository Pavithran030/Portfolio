import React, { useState, useCallback, useMemo, useEffect } from "react";
import { getYearData, COLORS, DARK_LEVEL_0, type Day } from "../../lib/github-data";
import { useCanvasAnimation, type DrawFn } from "../../lib/use-canvas-animation";
import ReplayButton from "./ReplayButton";

const SWEEP = 2600;
const DURATION = SWEEP + 400;
const TAU = Math.PI * 2;

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);

function getRingMetrics(w: number, h: number, weekCount: number) {
  const cx = w / 2;
  const cy = h / 2;
  const R = Math.max(10, Math.min(w, h) / 2 - 12);
  const inner = R * 0.32;
  const ringW = (R - inner) / 7;
  const gap = 1.5;
  const spokeAngle = TAU / Math.max(1, weekCount);
  const spokeGap = Math.min(0.012, spokeAngle * 0.15);
  return { cx, cy, R, inner, ringW, gap, spokeAngle, spokeGap };
}

interface ContribRingProps {
  year?: string;
}

export default function ContribRing({ year }: ContribRingProps) {
  const displayYear = year || new Date().getFullYear().toString();
  const yearData = useMemo(() => getYearData(displayYear), [displayYear]);
  const { days, weekCount, total } = yearData;

  const [tooltip, setTooltip] = useState<{ x: number; y: number; day: Day } | null>(null);

  const draw: DrawFn = useCallback(
    (ctx, w, h, t) => {
      ctx.clearRect(0, 0, w, h);

      const { cx, cy, R, inner, ringW, gap, spokeAngle, spokeGap } = getRingMetrics(w, h, weekCount);
      const p = isFinite(t) ? clamp(t / SWEEP) : 1;
      const sweep = easeOutCubic(p) * TAU;

      // Cells
      for (const d of days) {
        const a0 = d.week * spokeAngle;
        const fade = isFinite(t) ? clamp((sweep - a0) / 0.12) : 1;
        if (fade <= 0) continue;

        const r0 = inner + d.dow * ringW;
        const start = a0 - Math.PI / 2 + spokeGap / 2;
        const end = a0 + spokeAngle - Math.PI / 2 - spokeGap / 2;

        ctx.globalAlpha = fade;
        ctx.beginPath();
        ctx.arc(cx, cy, r0 + ringW - gap, start, end);
        ctx.arc(cx, cy, r0, end, start, true);
        ctx.closePath();

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
      }
      ctx.globalAlpha = 1;

      // Sweeping hand (only while sweeping)
      if (p < 1 && isFinite(t)) {
        const a = sweep - Math.PI / 2;
        ctx.save();
        ctx.strokeStyle = COLORS[3];
        ctx.shadowColor = COLORS[2];
        ctx.shadowBlur = 8;
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * inner * 0.6, cy + Math.sin(a) * inner * 0.6);
        ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
        ctx.stroke();
        ctx.restore();
      }

      // Centre display: Year tag + Count + "contributions"
      const shown = Math.round(total * easeOutCubic(p));
      const family = getComputedStyle(ctx.canvas).fontFamily || "inherit";
      const textColor = getComputedStyle(ctx.canvas).color || "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Year badge
      ctx.fillStyle = "#34d399"; // Emerald accent
      ctx.font = `700 ${Math.max(10, Math.round(inner * 0.26))}px ${family}`;
      ctx.fillText(displayYear, cx, cy - inner * 0.44);

      // Total count
      ctx.fillStyle = textColor;
      ctx.font = `800 ${Math.round(inner * 0.62)}px ${family}`;
      ctx.fillText(String(shown), cx, cy - inner * 0.04);

      // Subtitle
      ctx.globalAlpha = 0.65;
      ctx.font = `500 ${Math.max(9, Math.round(inner * 0.22))}px ${family}`;
      ctx.fillText("contributions", cx, cy + inner * 0.42);
      ctx.globalAlpha = 1;
    },
    [days, weekCount, total, displayYear]
  );

  const { canvasRef, replay } = useCanvasAnimation(draw, DURATION);
  const isFirstMount = React.useRef(true);

  // When selected year changes, restart the animation
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setTooltip(null);
    replay();
  }, [displayYear, replay]);

  const handlePointer = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const { cx, cy, inner, ringW, R, spokeAngle } = getRingMetrics(rect.width, rect.height, weekCount);
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.hypot(dx, dy);

      if (dist < inner || dist > R) {
        setTooltip(null);
        return;
      }

      const dow = Math.floor((dist - inner) / ringW);
      if (dow < 0 || dow > 6) {
        setTooltip(null);
        return;
      }

      // Angle clockwise from 12 o'clock
      let angle = Math.atan2(dy, dx) + Math.PI / 2;
      if (angle < 0) angle += TAU;

      const week = Math.floor(angle / spokeAngle);
      const day = days.find((d) => d.week === week && d.dow === dow);

      if (day) {
        setTooltip({ x, y, day });
      } else {
        setTooltip(null);
      }
    },
    [canvasRef, days, weekCount]
  );

  const handlePointerLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  return (
    <div className="relative w-full max-w-[440px] aspect-square flex items-center justify-center">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`Contribution ring: ${total} contributions in ${displayYear}`}
        className="w-full h-full block cursor-crosshair touch-manipulation"
        onPointerMove={handlePointer}
        onPointerDown={handlePointer}
        onPointerLeave={handlePointerLeave}
      />
      <ReplayButton onClick={replay} />

      {tooltip && (
        <div
          className="pointer-events-none absolute z-20 px-2.5 py-1.5 text-xs font-mono rounded-md border border-border bg-popover/90 backdrop-blur text-popover-foreground shadow-lg -translate-x-1/2 -translate-y-full mb-2 whitespace-nowrap"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y - 8}px`,
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
