"use client";

export type Region = "sf" | "sg";

export default function RegionTabs({
  active,
  onChange,
  sfCount,
  sgCount,
}: {
  active: Region;
  onChange: (region: Region) => void;
  sfCount: number;
  sgCount: number;
}) {
  return (
    <div className="flex gap-1 rounded-lg border border-(--color-border) bg-(--color-card) p-1">
      <button
        onClick={() => onChange("sf")}
        className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
          active === "sf"
            ? "bg-(--color-primary) text-white"
            : "text-(--color-text-muted) hover:bg-(--color-gray-bg)"
        }`}
      >
        <span className="text-base">🇺🇸</span>
        San Francisco
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${
            active === "sf"
              ? "bg-white/20 text-white"
              : "bg-(--color-gray-bg) text-(--color-text-muted)"
          }`}
        >
          {sfCount}
        </span>
      </button>
      <button
        onClick={() => onChange("sg")}
        className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
          active === "sg"
            ? "bg-(--color-primary) text-white"
            : "text-(--color-text-muted) hover:bg-(--color-gray-bg)"
        }`}
      >
        <span className="text-base">🇸🇬</span>
        Singapore
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${
            active === "sg"
              ? "bg-white/20 text-white"
              : "bg-(--color-gray-bg) text-(--color-text-muted)"
          }`}
        >
          {sgCount}
        </span>
      </button>
    </div>
  );
}
