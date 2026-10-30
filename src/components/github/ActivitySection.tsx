import React, { useState } from "react";
import { GitCommit, Flame, Award, Calendar } from "lucide-react";
import {
  availableYears,
  getYearData,
  COLORS,
  DARK_LEVEL_0,
} from "../../lib/github-data";
import ContribRing from "./ContribRing";

function formatReadableDate(dateStr: string) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length < 3) return dateStr;
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  return `${monthNames[m] || parts[1]} ${d}, ${parts[0]}`;
}

export default function ActivitySection() {
  const currentYearStr = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState<string>(
    availableYears[0] || currentYearStr
  );

  const activeData = getYearData(selectedYear);
  const streak = activeData.currentStreak();
  const isCurrentYear = selectedYear === currentYearStr;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 pt-4 pb-0">
      {/* Top summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center gap-3.5 p-4 rounded-xl border border-border/60 bg-card/40 backdrop-blur-md shadow-sm">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <GitCommit className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold font-display text-foreground">
              {activeData.total}
            </div>
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              {selectedYear} Contributions
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-4 rounded-xl border border-border/60 bg-card/40 backdrop-blur-md shadow-sm">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold font-display text-foreground">
              {isCurrentYear ? `${streak.length} Days` : `${activeData.longestStreak} Days`}
            </div>
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              {isCurrentYear
                ? `Active Streak (Max: ${activeData.longestStreak}d)`
                : `Longest Streak in ${selectedYear}`}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-4 rounded-xl border border-border/60 bg-card/40 backdrop-blur-md shadow-sm">
          <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold font-display text-foreground">
              {activeData.bestDay.count} Commits
            </div>
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              Peak Day · {formatReadableDate(activeData.bestDay.date)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Ring Canvas + Year Timeline on the Right */}
      <div className="relative w-full rounded-2xl border border-border/60 bg-gradient-to-b from-card/50 to-card/20 backdrop-blur-md p-4 sm:p-8 shadow-xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left / Center: Ring Visualisation */}
        <div className="w-full flex-1 flex items-center justify-center">
          <ContribRing year={selectedYear} />
        </div>

        {/* Right side: Year Timeline */}
        <div className="w-full md:w-56 shrink-0 flex flex-col items-center md:items-start border-t md:border-t-0 md:border-l border-border/50 pt-6 md:pt-0 md:pl-8">
          <div className="flex items-center gap-2 mb-4 text-xs font-mono text-muted-foreground uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>Timeline</span>
          </div>

          {/* Timeline Nodes */}
          <div className="relative flex flex-col gap-2.5 sm:gap-3 w-full max-w-xs md:max-w-none">
            {/* Connecting Vertical Track passing through vertical center of the circle on all screen sizes */}
            <div className="absolute left-[25px] top-[22px] bottom-[22px] w-[2px] bg-gradient-to-b from-emerald-500/60 via-border/80 to-border/40 z-0 pointer-events-none" />

            {availableYears.map((yr) => {
              const isSelected = selectedYear === yr;
              const yrTotal = getYearData(yr).total;

              return (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setSelectedYear(yr)}
                  className={`group relative z-10 flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer w-full ${
                    isSelected
                      ? "bg-emerald-500/15 border border-emerald-500/40 shadow-sm"
                      : "hover:bg-muted/30 border border-transparent"
                  }`}
                >
                  {/* Timeline Dot Indicator */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-mono font-bold shrink-0 transition-all z-10 ${
                      isSelected
                        ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/30 scale-105"
                        : "bg-background border border-border text-muted-foreground group-hover:border-emerald-400 group-hover:text-foreground"
                    }`}
                  >
                    {isSelected ? "●" : "○"}
                  </div>

                  {/* Year Label and Total badge */}
                  <div className="flex flex-col">
                    <span
                      className={`font-mono text-sm font-semibold transition-colors ${
                        isSelected
                          ? "text-emerald-300"
                          : "text-foreground/80 group-hover:text-foreground"
                      }`}
                    >
                      {yr}
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {yrTotal} contributions
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Color Legend */}
      <div className="flex items-center justify-between mt-4 px-2 text-xs font-mono text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          GitHub Contributions Ring
        </span>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px]">Less</span>
          <div className="flex items-center gap-1">
            <span
              className="w-3 h-3 rounded-sm border border-white/10"
              style={{ backgroundColor: DARK_LEVEL_0 }}
            />
            {COLORS.slice(1).map((c, i) => (
              <span
                key={i}
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <span className="text-[11px]">More</span>
        </div>
      </div>
    </div>
  );
}
