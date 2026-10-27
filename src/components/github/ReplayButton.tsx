import React from "react";
import { RotateCcw } from "lucide-react";

export default function ReplayButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Replay animation"
      className="absolute top-2 right-2 z-10 flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-full border border-border/60 bg-background/70 backdrop-blur text-foreground/80 hover:text-foreground hover:border-accent hover:bg-accent/10 transition-colors shadow-sm"
      style={{
        lineHeight: 1,
        cursor: "pointer",
      }}
    >
      <RotateCcw className="w-3 h-3" />
      <span>Replay</span>
    </button>
  );
}
