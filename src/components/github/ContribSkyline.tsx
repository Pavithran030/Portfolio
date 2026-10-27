import React from "react";
import { days, weekCount, bestDay, COLORS, DARK_LEVEL_0 } from "../../lib/github-data";
import { useCanvasAnimation, type DrawFn } from "../../lib/use-canvas-animation";
import ReplayButton from "./ReplayButton";

const T_UP = 6 * 120 + (weekCount - 1) * 6 + 500;
const DURATION = T_UP + 800;

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function blendColor(hex: string, towardWhite: boolean, amount: number) {
  if (hex.startsWith("rgba")) return hex;
  const { r, g, b } = hexToRgb(hex);
  const target = towardWhite ? 255 : 0;
  const nr = Math.round(r + (target - r) * amount);
  const ng = Math.round(g + (target - g) * amount);
  const nb = Math.round(b + (target - b) * amount);
  return `rgb(${nr}, ${ng}, ${nb})`;
}

const draw: DrawFn = (ctx, w, h, t) => {
  ctx.clearRect(0, 0, w, h);

  // Layout oblique grid
  // Width needed: weekCount * cs + 6 * ox
  // Height needed: 7 * oy + maxHgt
  const maxCount = Math.max(1, bestDay.count);
  const padX = Math.max(12, w * 0.04);
  const padBottom = Math.max(20, h * 0.12);

  const cs = Math.max(3.5, Math.min((w - padX * 2) / (weekCount + 6 * 0.45 + 1), (h * 0.35) / (7 * 0.35 + 1)));
  const ox = cs * 0.45;
  const oy = cs * 0.35;
  const gap = Math.max(1, cs * 0.15);
  const boxW = cs - gap;

  const maxHgt = Math.min(h * 0.45, Math.max(30, h * 0.4));
  const k = maxHgt / Math.sqrt(maxCount);

  const totalGridW = weekCount * cs + 6 * ox;
  const startX = padX + Math.max(0, (w - padX * 2 - totalGridW) / 2);
  const startY = h - padBottom - (7 * oy);

  let bestDayCoords: { topX: number; topY: number } | null = null;

  // Draw back rows first (dow = 6 down to 0) so nearer overlap farther
  for (let dow = 6; dow >= 0; dow--) {
    for (let week = 0; week < weekCount; week++) {
      const d = days.find((item) => item.week === week && item.dow === dow);
      if (!d) continue;

      const delay = (6 - dow) * 120 + week * 6;
      const u = isFinite(t) ? clamp((t - delay) / 500) : 1;
      if (u <= 0) continue;

      const eased = isFinite(t) ? easeOutCubic(u) : 1;
      const targetHgt = d.count > 0 ? Math.max(3, Math.sqrt(d.count) * k) : 1.5;
      const currentHgt = isFinite(t) ? targetHgt * eased : targetHgt;

      const baseX = startX + week * cs + (6 - dow) * ox;
      const baseY = startY + (dow * oy);

      const isZero = d.level === 0;
      const frontColor = isZero ? DARK_LEVEL_0 : COLORS[d.level];
      const topColor = isZero ? "rgba(255, 255, 255, 0.12)" : blendColor(COLORS[d.level], true, 0.28);
      const sideColor = isZero ? "rgba(255, 255, 255, 0.04)" : blendColor(COLORS[d.level], false, 0.28);

      // Record best day coordinates for leader line
      if (d.i === bestDay.i) {
        bestDayCoords = {
          topX: baseX + boxW / 2 + ox / 2,
          topY: baseY - currentHgt - oy / 2,
        };
      }

      // 1. Front face: (baseX, baseY) to (baseX + boxW, baseY) up by currentHgt
      ctx.beginPath();
      ctx.moveTo(baseX, baseY);
      ctx.lineTo(baseX + boxW, baseY);
      ctx.lineTo(baseX + boxW, baseY - currentHgt);
      ctx.lineTo(baseX, baseY - currentHgt);
      ctx.closePath();
      ctx.fillStyle = frontColor;
      ctx.fill();

      // 2. Right side face
      ctx.beginPath();
      ctx.moveTo(baseX + boxW, baseY);
      ctx.lineTo(baseX + boxW + ox, baseY - oy);
      ctx.lineTo(baseX + boxW + ox, baseY - currentHgt - oy);
      ctx.lineTo(baseX + boxW, baseY - currentHgt);
      ctx.closePath();
      ctx.fillStyle = sideColor;
      ctx.fill();

      // 3. Top face
      ctx.beginPath();
      ctx.moveTo(baseX, baseY - currentHgt);
      ctx.lineTo(baseX + boxW, baseY - currentHgt);
      ctx.lineTo(baseX + boxW + ox, baseY - currentHgt - oy);
      ctx.lineTo(baseX + ox, baseY - currentHgt - oy);
      ctx.closePath();
      ctx.fillStyle = topColor;
      ctx.fill();
    }
  }

  // Leader line to best day
  if (bestDayCoords && bestDay.count > 0 && (t > T_UP || !isFinite(t))) {
    const lineT = isFinite(t) ? clamp((t - T_UP) / 500) : 1;
    const labelT = isFinite(t) ? clamp((t - (T_UP + 500)) / 300) : 1;

    const { topX, topY } = bestDayCoords;
    const flipSide = topX > w * 0.65;
    const deltaX = flipSide ? -Math.min(90, w * 0.18) : Math.min(90, w * 0.18);
    const deltaY = -Math.min(45, h * 0.18);

    const endX = topX + deltaX * lineT;
    const endY = topY + deltaY * lineT;

    ctx.save();
    ctx.strokeStyle = COLORS[3];
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Small dot at origin of leader line
    ctx.fillStyle = COLORS[4];
    ctx.beginPath();
    ctx.arc(topX, topY, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Label fades in
    if (labelT > 0) {
      ctx.globalAlpha = labelT;
      const family = getComputedStyle(ctx.canvas).fontFamily || "monospace";
      ctx.font = `600 11px ${family}`;
      ctx.textAlign = flipSide ? "right" : "left";
      ctx.textBaseline = "middle";

      const finalEndX = topX + deltaX;
      const finalEndY = topY + deltaY;
      const labelOffsetX = flipSide ? -6 : 6;

      ctx.fillStyle = COLORS[2];
      ctx.fillText(`${bestDay.count} contributions`, finalEndX + labelOffsetX, finalEndY - 7);

      ctx.font = `400 10px ${family}`;
      ctx.fillStyle = getComputedStyle(ctx.canvas).color || "#ffffff";
      ctx.globalAlpha = labelT * 0.7;
      ctx.fillText(`Peak: ${bestDay.date}`, finalEndX + labelOffsetX, finalEndY + 7);
    }
    ctx.restore();
  }
};

export default function ContribSkyline() {
  const { canvasRef, replay } = useCanvasAnimation(draw, DURATION);

  return (
    <div className="relative w-full max-w-[840px] mx-auto aspect-[16/8] sm:aspect-[16/7] flex items-center justify-center">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="GitHub 3D contribution skyline"
        className="w-full h-full block touch-manipulation"
      />
      <ReplayButton onClick={replay} />
    </div>
  );
}
