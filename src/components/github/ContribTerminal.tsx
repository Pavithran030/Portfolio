import React from "react";
import { days, weekCount, total, COLORS } from "../../lib/github-data";
import { useCanvasAnimation, type DrawFn } from "../../lib/use-canvas-animation";
import ReplayButton from "./ReplayButton";

const COMMAND = "$ gh contributions --year";
const CHAR_MS = 45;
const TYPE_TIME = COMMAND.length * CHAR_MS;
const PHASE2_START = TYPE_TIME + 250;
const DURATION = PHASE2_START + weekCount * 18 + 7 * 4 + 400;

const GLYPHS = [".", ":", "+", "#", "@"];
const LEVEL_GLYPHS = [".", ":", "+", "#", "@"];

function deterministicGlyph(i: number, tick: number): string {
  const hash = Math.abs(Math.sin(i * 12.9898 + tick * 78.233) * 43758.5453);
  return GLYPHS[Math.floor(hash) % GLYPHS.length];
}

const draw: DrawFn = (ctx, w, h, t) => {
  ctx.clearRect(0, 0, w, h);

  // Terminal box styling
  const pad = Math.max(12, w * 0.035);
  const termX = pad;
  const termY = 10;
  const termW = w - pad * 2;
  const termH = h - 20;

  // Background card
  ctx.save();
  ctx.fillStyle = "rgba(10, 15, 24, 0.85)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(termX, termY, termW, termH, 8);
  ctx.fill();
  ctx.stroke();

  // Top terminal header dots
  const dotY = termY + 14;
  const dotR = 3.5;
  const dotColors = ["#ef4444", "#eab308", "#22c55e"];
  dotColors.forEach((color, i) => {
    ctx.beginPath();
    ctx.arc(termX + 16 + i * 12, dotY, dotR, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.8;
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  // Monospace font
  const monoFont = "'Fira Code', 'JetBrains Mono', 'Courier New', monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  // Phase 1: Typing command
  const typedChars = isFinite(t) ? Math.min(COMMAND.length, Math.floor(t / CHAR_MS)) : COMMAND.length;
  const currentCommand = COMMAND.slice(0, typedChars);
  const showCaret = isFinite(t) ? (Math.floor(t / 350) % 2 === 0) : false;

  ctx.font = `500 12px ${monoFont}`;
  ctx.fillStyle = "#38bdf8"; // Light cyan prompt
  ctx.fillText(currentCommand + (showCaret && t < PHASE2_START ? " ▋" : ""), termX + 16, termY + 36);

  // Phase 2: Matrix of glyphs
  if (t >= PHASE2_START || !isFinite(t)) {
    const gridTop = termY + 58;
    const gridAvailW = termW - 32;
    const charW = Math.max(5, gridAvailW / Math.max(1, weekCount));
    const charH = Math.max(8, (termH - 85) / 7);
    const fontSize = Math.max(8, Math.min(13, charW * 1.4, charH * 0.9));
    const tick = isFinite(t) ? Math.floor(t / 60) : 0;

    ctx.font = `600 ${fontSize}px ${monoFont}`;

    for (const d of days) {
      const settleAt = PHASE2_START + d.week * 18 + d.dow * 4;
      const isSettled = !isFinite(t) || t >= settleAt;

      const charX = termX + 16 + d.week * charW;
      const charY = gridTop + d.dow * charH + charH / 2;

      let glyph: string;
      let color: string;

      if (isSettled) {
        glyph = LEVEL_GLYPHS[d.level] || ".";
        color = d.level === 0 ? "rgba(255, 255, 255, 0.2)" : COLORS[d.level];
      } else {
        glyph = deterministicGlyph(d.i, tick);
        color = COLORS[Math.min(4, Math.max(1, d.level))];
      }

      ctx.fillStyle = color;
      ctx.fillText(glyph, charX, charY);
    }

    // Terminal footer status
    const isCompleted = !isFinite(t) || t >= DURATION - 200;
    if (isCompleted) {
      ctx.fillStyle = "#94a3b8";
      ctx.font = `400 11px ${monoFont}`;
      ctx.fillText(
        `✓ ${total} contributions loaded in 52 weeks (level symbols: . : + # @)`,
        termX + 16,
        termY + termH - 14
      );
    }
  }

  ctx.restore();
};

export default function ContribTerminal() {
  const { canvasRef, replay } = useCanvasAnimation(draw, DURATION);

  return (
    <div className="relative w-full max-w-[840px] mx-auto aspect-[16/8] sm:aspect-[16/7] flex items-center justify-center">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="GitHub contribution terminal view"
        className="w-full h-full block touch-manipulation"
      />
      <ReplayButton onClick={replay} />
    </div>
  );
}
