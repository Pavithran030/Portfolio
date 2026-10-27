import { weekCount } from "./github-data";

export function layoutGrid(w: number, h: number) {
  const padX = Math.max(12, w * 0.03);
  const padBottom = 16;
  const topHeader = Math.max(50, h * 0.28);
  const availW = w - padX * 2;
  const availH = h - topHeader - padBottom;

  const rawCsW = availW / Math.max(1, weekCount);
  const rawCsH = availH / 7;
  const cs = Math.max(4, Math.min(rawCsW, rawCsH));
  const cellGap = Math.max(1.5, cs * 0.18);
  const cellSize = cs - cellGap;

  const totalGridW = weekCount * cs;
  const totalGridH = 7 * cs;
  const startX = padX + (availW - totalGridW) / 2;
  const startY = topHeader + (availH - totalGridH) / 2;

  return { padX, topHeader, cs, cellGap, cellSize, startX, startY };
}
