import React from "react";
import { days, weekCount, currentStreak, COLORS, DARK_LEVEL_0 } from "../../lib/github-data";
import { layoutGrid } from "../../lib/grid-layout";
import { useCanvasAnimation, type DrawFn } from "../../lib/use-canvas-animation";
import ReplayButton from "./ReplayButton";

const streakInfo = currentStreak();
const streakLen = streakInfo.length;
const STEP_MS = streakLen > 0 ? Math.max(25, Math.min(100, Math.round(1800 / streakLen))) : 50;
const TRACE_TIME = streakLen * STEP_MS;
const DURATION = TRACE_TIME + 700;

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));

const draw: DrawFn = (ctx, w, h, t) => {
  ctx.clearRect(0, 0, w, h);

  const { cs, cellSize, startX, startY, topHeader } = layoutGrid(w, h);
  const family = getComputedStyle(ctx.canvas).fontFamily || "inherit";
  const textColor = getComputedStyle(ctx.canvas).color || "#ffffff";

  // Streak days
  const streakDays = streakLen > 0 ? days.slice(streakInfo.startIndex, streakInfo.endIndex + 1) : [];

  // Active step in streak
  const activeStep = isFinite(t) ? Math.min(streakLen, Math.floor(t / STEP_MS)) : streakLen;
  const isFinished = !isFinite(t) || t >= TRACE_TIME;

  // 1. Draw all cells dimmed
  for (const d of days) {
    const cx = startX + d.week * cs;
    const cy = startY + d.dow * cs;
    const r = Math.max(1, cellSize * 0.18);

    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.beginPath();
    ctx.roundRect(cx, cy, cellSize, cellSize, r);

    if (d.level === 0) {
      ctx.fillStyle = DARK_LEVEL_0;
      ctx.fill();
    } else {
      ctx.fillStyle = COLORS[d.level];
      ctx.fill();
    }
    ctx.restore();
  }

  // 2. Highlight streak cells up to activeStep
  for (let idx = 0; idx < activeStep; idx++) {
    const d = streakDays[idx];
    if (!d) continue;

    const cx = startX + d.week * cs;
    const cy = startY + d.dow * cs;
    const r = Math.max(1, cellSize * 0.18);

    ctx.save();
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.roundRect(cx, cy, cellSize, cellSize, r);
    ctx.fillStyle = COLORS[d.level > 0 ? d.level : 2];
    ctx.fill();
    ctx.restore();
  }

  // 3. Trail behind active streak head
  if (activeStep > 0 && activeStep <= streakLen) {
    const tailCount = Math.min(8, activeStep);
    const trailStart = activeStep - tailCount;

    for (let i = trailStart; i < activeStep - 1; i++) {
      const d1 = streakDays[i];
      const d2 = streakDays[i + 1];
      if (!d1 || !d2) continue;

      const x1 = startX + d1.week * cs + cellSize / 2;
      const y1 = startY + d1.dow * cs + cellSize / 2;
      const x2 = startX + d2.week * cs + cellSize / 2;
      const y2 = startY + d2.dow * cs + cellSize / 2;

      const alpha = ((i - trailStart + 1) / tailCount) * 0.85;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = COLORS[3];
      ctx.lineWidth = Math.max(1.5, cellSize * 0.35);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.restore();
    }

    // Glowing head dot
    const headDay = streakDays[activeStep - 1];
    if (headDay && !isFinished) {
      const hx = startX + headDay.week * cs + cellSize / 2;
      const hy = startY + headDay.dow * cs + cellSize / 2;

      ctx.save();
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = COLORS[1];
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(hx, hy, Math.max(3, cellSize * 0.4), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // 4. When completed: show streak stats & last day off
  if (isFinished) {
    const fade = isFinite(t) ? clamp((t - TRACE_TIME) / 300) : 1;
    ctx.save();
    ctx.globalAlpha = fade;

    // Header stats
    ctx.fillStyle = textColor;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.font = `800 ${Math.max(22, Math.round(topHeader * 0.45))}px ${family}`;
    ctx.fillText(`${streakLen} Days`, startX, 10);

    ctx.fillStyle = COLORS[2];
    ctx.font = `600 ${Math.max(11, Math.round(topHeader * 0.22))}px ${family}`;
    ctx.fillText(streakLen > 0 ? "Current Contribution Streak 🔥" : "No active streak yet", startX, Math.max(22, Math.round(topHeader * 0.45)) + 14);

    // Mark last day off if available
    if (streakInfo.lastOff) {
      const off = streakInfo.lastOff;
      const ox = startX + off.week * cs + cellSize / 2;
      const oy = startY + off.dow * cs + cellSize / 2;

      ctx.strokeStyle = "rgba(239, 68, 68, 0.85)"; // Red accent for day off
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ox, oy, Math.max(4, cellSize * 0.7), 0, Math.PI * 2);
      ctx.stroke();

      // Small label below or beside
      ctx.fillStyle = "rgba(239, 68, 68, 0.85)";
      ctx.font = `500 10px ${family}`;
      ctx.textAlign = ox > w * 0.7 ? "right" : "left";
      ctx.textBaseline = "middle";
      const labelX = ox > w * 0.7 ? ox - cellSize - 6 : ox + cellSize + 6;
      ctx.fillText(`Last day off: ${off.date}`, labelX, oy);
    }

    ctx.restore();
  } else {
    // During tracing header
    ctx.fillStyle = textColor;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.font = `800 ${Math.max(22, Math.round(topHeader * 0.45))}px ${family}`;
    ctx.fillText("Tracing Streak...", startX, 10);
  }
};

export default function ContribStreak() {
  const { canvasRef, replay } = useCanvasAnimation(draw, DURATION);

  return (
    <div className="relative w-full max-w-[840px] mx-auto aspect-[16/8] sm:aspect-[16/7] flex items-center justify-center">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="GitHub current streak trace animation"
        className="w-full h-full block touch-manipulation"
      />
      <ReplayButton onClick={replay} />
    </div>
  );
}
