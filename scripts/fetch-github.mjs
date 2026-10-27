import { mkdirSync, writeFileSync } from "node:fs";

const USER = process.env.GITHUB_USER || process.argv[2] || "Pavithran030";

async function fetchYearContributions(username, year) {
  const url = `https://github.com/users/${username}/contributions?from=${year}-01-01&to=${year}-12-31`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      Accept: "text/html,application/xhtml+xml",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch for ${year}: ${res.status} ${res.statusText}`);
  }

  const html = await res.text();

  // Extract total contributions for this year from header
  const totalMatch =
    html.match(/([0-9,]+)\s+contributions?\s+in\s+\d{4}/i) ||
    html.match(/([0-9,]+)\s+contributions/i);

  let headerTotal = 0;
  if (totalMatch) {
    headerTotal = parseInt(totalMatch[1].replace(/,/g, ""), 10);
  }

  // 1. Map tooltips by element ID to exact contribution counts
  const tipMap = new Map();
  const tipMatches = [...html.matchAll(/<tool-tip[^>]*for="([^"]+)"[^>]*>([\s\S]*?)<\/tool-tip>/gs)];
  for (const m of tipMatches) {
    const forId = m[1];
    const text = m[2].trim();
    const countMatch = text.match(/^([0-9,]+)\s+contribution/i);
    const count = countMatch ? parseInt(countMatch[1].replace(/,/g, ""), 10) : 0;
    tipMap.set(forId, count);
  }

  // 2. Parse all contribution calendar day cells
  const tdTags = html.match(/<td[^>]+class="[^"]*ContributionCalendar-day[^"]*"[^>]*>/g) || [];
  const days = [];
  let sumCount = 0;

  for (const td of tdTags) {
    const dateMatch = td.match(/data-date="(\d{4}-\d{2}-\d{2})"/);
    const levelMatch = td.match(/data-level="(\d+)"/);
    const idMatch = td.match(/id="([^"]+)"/);

    if (dateMatch && levelMatch) {
      const date = dateMatch[1];
      const level = parseInt(levelMatch[1], 10);
      const id = idMatch ? idMatch[1] : "";
      const count = tipMap.has(id) ? tipMap.get(id) : 0;

      days.push({ date, level, count });
      sumCount += count;
    }
  }

  days.sort((a, b) => a.date.localeCompare(b.date));

  const total = headerTotal > 0 ? headerTotal : sumCount;

  return {
    start: days[0]?.date || `${year}-01-01`,
    total,
    counts: days.map((d) => d.count),
    levels: days.map((d) => d.level).join(""),
    dayCount: days.length,
  };
}

async function main() {
  console.log(`Fetching exact GitHub contributions for @${USER}...`);

  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];
  const yearsData = {};

  for (const year of years) {
    try {
      const data = await fetchYearContributions(USER, year);
      console.log(`  ✓ ${year}: ${data.total} contributions (${data.dayCount} days)`);
      yearsData[String(year)] = {
        start: data.start,
        total: data.total,
        counts: data.counts,
        levels: data.levels,
      };
    } catch (e) {
      console.warn(`  ⚠ Warning: Could not fetch ${year}:`, e.message);
    }
  }

  const defaultYear = yearsData[String(currentYear)] || Object.values(yearsData)[0];
  const output = {
    ...defaultYear,
    years: yearsData,
  };

  mkdirSync("data", { recursive: true });
  writeFileSync("data/github.json", JSON.stringify(output, null, 2));

  mkdirSync("src/data", { recursive: true });
  writeFileSync("src/data/github.json", JSON.stringify(output, null, 2));

  console.log(`\nSUCCESS: Saved exact contribution data for @${USER} to data/github.json and src/data/github.json.`);
}

main();
