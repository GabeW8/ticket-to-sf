import type { SponsorshipStatus } from "../lib/types";

const STATUS_CONFIG: Record<
  SponsorshipStatus,
  { label: string; className: string }
> = {
  confirmed: {
    label: "H-1B Sponsor",
    className: "bg-(--color-green-bg) text-(--color-green)",
  },
  likely: {
    label: "Likely Sponsor",
    className: "bg-(--color-yellow-bg) text-(--color-yellow)",
  },
  unknown: {
    label: "Unknown",
    className: "bg-(--color-gray-bg) text-(--color-gray)",
  },
};

export default function SponsorBadge({
  status,
}: {
  status: SponsorshipStatus;
}) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
