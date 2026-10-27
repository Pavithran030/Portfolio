import raw from "../data/github.json";

export const COLORS = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"] as const;
export const DARK_LEVEL_0 = "rgba(255, 255, 255, 0.07)";

export type Level = 0 | 1 | 2 | 3 | 4;
export type Day = {
  i: number;
  date: string;   // YYYY-MM-DD
  count: number;
  level: Level;
  week: number;
  dow: number;    // 0 = Sunday
};

export interface YearDataSet {
  start: string;
  total: number;
  counts: number[];
  levels: string;
}

function addDays(start: string, n: number): string {
  const d = new Date(start + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

const rawYears = (raw as { years?: Record<string, YearDataSet> }).years || {};
export const availableYears: string[] = Object.keys(rawYears).sort((a, b) => Number(b) - Number(a));

export function parseYearData(data: YearDataSet) {
  const startDate = new Date((data.start || "2026-01-01") + "T00:00:00Z");
  const startDow = startDate.getUTCDay();
  const firstSunday = new Date(startDate);
  firstSunday.setUTCDate(firstSunday.getUTCDate() - startDow);

  const parsedDays: Day[] = (data.counts || []).map((count, i) => {
    const dateStr = addDays(data.start, i);
    const d = new Date(dateStr + "T00:00:00Z");
    const diffDays = Math.round((d.getTime() - firstSunday.getTime()) / (1000 * 60 * 60 * 24));
    return {
      i,
      date: dateStr,
      count,
      level: (Number(data.levels?.[i]) || 0) as Level,
      week: Math.floor(diffDays / 7),
      dow: d.getUTCDay(),
    };
  });

  const maxWeek = parsedDays.length > 0 ? Math.max(...parsedDays.map((d) => d.week)) : 52;
  const parsedWeekCount = maxWeek + 1;

  const parsedWeeklyTotals: number[] = Array.from({ length: parsedWeekCount }, (_, w) =>
    parsedDays.filter((d) => d.week === w).reduce((s, d) => s + d.count, 0)
  );

  const parsedBestDay: Day = parsedDays.reduce(
    (a, b) => (b.count > a.count ? b : a),
    parsedDays[0] || {
      i: 0,
      date: data.start || "",
      count: 0,
      level: 0,
      week: 0,
      dow: 0,
    }
  );

  let maxStreak = 0;
  let curStreak = 0;
  for (const d of parsedDays) {
    if (d.count > 0) {
      curStreak++;
      if (curStreak > maxStreak) maxStreak = curStreak;
    } else {
      curStreak = 0;
    }
  }

  function getStreak() {
    if (parsedDays.length === 0) {
      return { startIndex: 0, endIndex: 0, length: 0, lastOff: null };
    }
    let end = parsedDays.length - 1;
    if (parsedDays[end].count === 0) end--;
    let start = end;
    while (start >= 0 && parsedDays[start].count > 0) start--;
    const lastOff = start >= 0 ? parsedDays[start] : null;
    return { startIndex: start + 1, endIndex: end, length: Math.max(0, end - start), lastOff };
  }

  return {
    total: data.total,
    days: parsedDays,
    weekCount: parsedWeekCount,
    weeklyTotals: parsedWeeklyTotals,
    bestDay: parsedBestDay,
    longestStreak: maxStreak,
    currentStreak: getStreak,
  };
}

// Default / fallback dataset (latest year or root dataset)
const defaultYearKey = availableYears[0];
const defaultDataSet: YearDataSet = (defaultYearKey && rawYears[defaultYearKey]) || {
  start: raw.start,
  total: raw.total,
  counts: raw.counts as number[],
  levels: raw.levels as string,
};

export function getYearData(year?: string) {
  if (year && rawYears[year]) {
    return parseYearData(rawYears[year]);
  }
  return parseYearData(defaultDataSet);
}

// Default exports for backwards compatibility
const defaultParsed = parseYearData(defaultDataSet);
export const total: number = defaultParsed.total;
export const days: Day[] = defaultParsed.days;
export const weekCount: number = defaultParsed.weekCount;
export const weeklyTotals: number[] = defaultParsed.weeklyTotals;
export const bestDay: Day = defaultParsed.bestDay;
export const currentStreak = defaultParsed.currentStreak;
