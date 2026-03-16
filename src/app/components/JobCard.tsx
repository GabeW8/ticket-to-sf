import type { NormalizedJob } from "../lib/types";
import SponsorBadge from "./SponsorBadge";

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

export default function JobCard({ job }: { job: NormalizedJob }) {
  const locationDisplay =
    job.locations.length > 0
      ? job.locations.slice(0, 2).join(" / ")
      : job.location;

  return (
    <div className="rounded-lg border border-(--color-border) bg-(--color-card) p-4 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm text-(--color-text-muted)">
            <span className="font-semibold text-(--color-text)">
              {job.company}
            </span>
            <SponsorBadge status={job.h1bSponsorship} />
          </div>
          <h3 className="mt-1 text-base font-medium leading-snug">
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-(--color-primary) hover:underline"
            >
              {job.title}
            </a>
          </h3>
        </div>
        <span className="shrink-0 text-xs text-(--color-text-muted)">
          {timeAgo(job.postedAt)}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1 text-(--color-text-muted)">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          {locationDisplay}
        </span>

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

        {job.department && (
          <span className="text-(--color-text-muted)">
            {job.department}
          </span>
        )}
      </div>

      <div className="mt-3 flex justify-end">
        <a
          href={job.url}
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
