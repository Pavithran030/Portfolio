import React from "react";
import { days, weekCount, weeklyTotals, COLORS, DARK_LEVEL_0 } from "../../lib/github-data";
import { useCanvasAnimation, type DrawFn } from "../../lib/use-canvas-animation";
import ReplayButton from "./ReplayButton";

const LINE_TIME = 1600;
const DURATION = 1600 + weekCount * 22 + 7 * 35 + 500;

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);

function layoutPulse(w: number, h: number) {
  const padX = Math.max(12, w * 0.035);
  const availW = w - padX * 2;
  const cs = Math.max(3.5, availW / Math.max(1, weekCount));
  const cellGap = Math.max(1.5, cs * 0.18);
  const cellSize = cs - cellGap;

  const totalGridW = weekCount * cs;
  const startX = padX + (availW - totalGridW) / 2;

  // Upper 40% for line chart, lower 55% for grid
  const lineTopY = 24;
  const lineBottomY = h * 0.38;
  const gridStartY = h * 0.44;

  const maxWeekly = Math.max(1, ...weeklyTotals);

  return { padX, cs, cellGap, cellSize, startX, lineTopY, lineBottomY, gridStartY, maxWeekly };
}

const draw: DrawFn = (ctx, w, h, t) => {
  ctx.clearRect(0, 0, w, h);

  const { cs, cellSize, startX, lineTopY, lineBottomY, gridStartY, maxWeekly } = layoutPulse(w, h);

  // Calculate line points
  const points: { x: number; y: number }[] = [];
  for (let week = 0; week < weekCount; week++) {
    const x = startX + week * cs + cellSize / 2;
    const count = weeklyTotals[week] || 0;
    const ratio = count / maxWeekly;
    const y = lineBottomY - ratio * (lineBottomY - lineTopY);
    points.push({ x, y });
  }

  // Phase 1: Draw weekly totals line
  const lineProgress = isFinite(t) ? clamp(t / LINE_TIME) : 1;
  const activePointCount = lineProgress * (points.length - 1);
  const lastFullIndex = Math.min(points.length - 1, Math.floor(activePointCount));
  const frac = activePointCount - lastFullIndex;

  if (points.length > 0) {
    // Faint area fill under line
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, lineBottomY);
    for (let i = 0; i <= lastFullIndex; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    if (frac > 0 && lastFullIndex < points.length - 1) {
      const p1 = points[lastFullIndex];
      const p2 = points[lastFullIndex + 1];
      const curX = p1.x + (p2.x - p1.x) * frac;
      const curY = p1.y + (p2.y - p1.y) * frac;
      ctx.lineTo(curX, curY);
      ctx.lineTo(curX, lineBottomY);
    } else {
      ctx.lineTo(points[lastFullIndex].x, lineBottomY);
    }
    ctx.closePath();
    ctx.fillStyle = "rgba(64, 196, 99, 0.08)";
    ctx.fill();

    // Line stroke
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i <= lastFullIndex; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    let headX = points[0].x;
    let headY = points[0].y;
    if (frac > 0 && lastFullIndex < points.length - 1) {
      const p1 = points[lastFullIndex];
      const p2 = points[lastFullIndex + 1];
      headX = p1.x + (p2.x - p1.x) * frac;
      headY = p1.y + (p2.y - p1.y) * frac;
      ctx.lineTo(headX, headY);
    } else if (lastFullIndex >= 0) {
      headX = points[lastFullIndex].x;
      headY = points[lastFullIndex].y;
    }
    ctx.strokeStyle = COLORS[2];
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = COLORS[1];
    ctx.shadowBlur = 6;
    ctx.stroke();
    ctx.restore();

    // Riding dot at the head of the line (during phase 1)
    if (lineProgress < 1 && isFinite(t)) {
      ctx.save();
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = COLORS[2];
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(headX, headY, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Phase 2: Pouring cells down from line points to grid below
  for (const d of days) {
    const originPoint = points[d.week] || { x: startX + d.week * cs, y: lineBottomY };
    const targetX = startX + d.week * cs;
    const targetY = gridStartY + d.dow * cs;

    const startDropTime = LINE_TIME + d.week * 22 + d.dow * 35;
    const dropDuration = 420;

    let progress = 1;
    if (isFinite(t)) {
      if (t < startDropTime) continue;
      progress = clamp((t - startDropTime) / dropDuration);
    }

    const eased = isFinite(t) ? easeOutCubic(progress) : 1;
    const curX = targetX;
    const curY = originPoint.y + (targetY - originPoint.y) * eased;
    const alpha = isFinite(t) ? clamp(0.3 + 0.7 * progress) : 1;

    ctx.save();
    ctx.globalAlpha = alpha;

    const r = Math.max(1, cellSize * 0.18);
    ctx.beginPath();
    ctx.roundRect(curX, curY, cellSize, cellSize, r);

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

export default function ContribPulse() {
  const { canvasRef, replay } = useCanvasAnimation(draw, DURATION);

  return (
    <div className="relative w-full max-w-[840px] mx-auto aspect-[16/8] sm:aspect-[16/7] flex items-center justify-center">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="GitHub weekly pulse & pour animation"
        className="w-full h-full block touch-manipulation"
      />
      <ReplayButton onClick={replay} />
    </div>
  );
}
