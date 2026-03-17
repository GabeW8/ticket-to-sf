import type { NormalizedJob } from "../lib/types";
import SponsorBadge from "./SponsorBadge";

function safeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") return url;
  } catch {}
  return "#";
}

const CATEGORY_LABELS: Record<string, string> = {
  swe: "SWE",
  ai_ml: "AI/ML",
  data: "Data",
  product: "Product",
  other: "Other",
};

const EXPERIENCE_LABELS: Record<string, string> = {
  intern: "Intern",
  new_grad: "New Grad",
  junior: "Junior",
  mid: "Mid",
  senior: "Senior",
  staff: "Staff+",
  unknown: "Not Specified",
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const posted = new Date(dateStr).getTime();
  const diffMs = now - posted;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1d ago";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

function isNew(dateStr: string): boolean {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  return diffMs < 3 * 24 * 60 * 60 * 1000; // 3 days
}

function formatSalary(job: NormalizedJob): string | null {
  if (!job.salaryMin && !job.salaryMax) return null;
  const currency = job.salaryCurrency === "SGD" ? "S$" : "$";
  const interval = job.salaryInterval;
  const isYearly = !interval || interval === "yearly" || interval === "year";
  const fmt = (n: number) => {
    if (isYearly && n >= 1000) return `${currency}${Math.round(n / 1000)}K`;
    return `${currency}${n.toLocaleString()}`;
  };
  if (job.salaryMin && job.salaryMax) {
    const range = `${fmt(job.salaryMin)} - ${fmt(job.salaryMax)}`;
    return isYearly ? range : `${range}/${interval === "monthly" || interval === "month" ? "mo" : "hr"}`;
  }
  if (job.salaryMin) return `From ${fmt(job.salaryMin)}`;
  if (job.salaryMax) return `Up to ${fmt(job.salaryMax)}`;
  return null;
}

export default function JobCard({
  job,
  isSaved,
  onToggleSave,
}: {
  job: NormalizedJob;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
}) {
  const locationDisplay =
    job.locations.length > 0
      ? job.locations.slice(0, 2).join(" / ")
      : job.location;
  const salary = formatSalary(job);
  const fresh = isNew(job.postedAt);

  return (
    <div className="rounded-lg border border-(--color-border) bg-(--color-card) p-4 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm text-(--color-text-muted)">
            <span className="font-semibold text-(--color-text)">
              {job.company}
            </span>
            <SponsorBadge status={job.h1bSponsorship} />
            {fresh && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600 dark:bg-red-900/30 dark:text-red-400">
                NEW
              </span>
            )}
          </div>
          <h3 className="mt-1 text-base font-medium leading-snug">
            <a
              href={safeUrl(job.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-(--color-primary) hover:underline"
            >
              {job.title}
            </a>
          </h3>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs text-(--color-text-muted)">
            {timeAgo(job.postedAt)}
          </span>
          <button
            onClick={() => onToggleSave(job.id)}
            className="p-1 transition-colors hover:text-red-500"
            aria-label={isSaved ? "Unsave job" : "Save job"}
          >
            {isSaved ? (
              <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
            ) : (
              <svg className="h-4 w-4 text-(--color-text-muted)" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1 text-(--color-text-muted)">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          {locationDisplay}
        </span>

        {salary && (
          <span className="font-medium text-(--color-green)">
            {salary}
          </span>
        )}

        <span className="rounded-full bg-(--color-blue-bg) px-2 py-0.5 font-medium text-(--color-primary)">
          {CATEGORY_LABELS[job.category] || job.category}
        </span>

        <span className="rounded-full bg-(--color-purple-bg) px-2 py-0.5 font-medium text-purple-600 dark:text-purple-400">
          {EXPERIENCE_LABELS[job.experienceLevel] || job.experienceLevel}
        </span>

        {job.isRemote && (
          <span className="rounded-full bg-(--color-green-bg) px-2 py-0.5 font-medium text-(--color-green)">
            Remote
          </span>
        )}
      </div>

      <div className="mt-3 flex justify-end">
        <a
          href={safeUrl(job.url)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-md bg-(--color-primary) px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-(--color-primary-hover)"
        >
          Apply
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
          </svg>
        </a>
      </div>
    </div>
  );
}
