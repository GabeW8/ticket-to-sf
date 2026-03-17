"use client";

import type { NormalizedJob, ExperienceLevel, JobCategory } from "../lib/types";

export interface Filters {
  search: string;
  categories: JobCategory[];
  experienceLevels: ExperienceLevel[];
  companies: string[];
  h1bOnly: boolean;
  remoteOnly: boolean;
  sortBy: "newest" | "company";
}

export const DEFAULT_FILTERS: Filters = {
  search: "",
  categories: [],
  experienceLevels: [],
  companies: [],
  h1bOnly: true,
  remoteOnly: false,
  sortBy: "newest",
};

const CATEGORY_OPTIONS: { value: JobCategory; label: string }[] = [
  { value: "swe", label: "SWE" },
  { value: "ai_ml", label: "AI/ML" },
  { value: "data", label: "Data" },
  { value: "product", label: "Product" },
  { value: "other", label: "Other" },
];

const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string }[] = [
  { value: "intern", label: "Intern" },
  { value: "new_grad", label: "New Grad" },
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid (0-4 YOE)" },
  { value: "unknown", label: "Not Specified" },
];

function MultiSelect<T extends string>({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  selected: T[];
  onChange: (values: T[]) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-(--color-text-muted)">
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const isSelected = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() =>
                onChange(
                  isSelected
                    ? selected.filter((v) => v !== opt.value)
                    : [...selected, opt.value]
                )
              }
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                isSelected
                  ? "bg-(--color-primary) text-white"
                  : "bg-(--color-gray-bg) text-(--color-text-muted) hover:bg-(--color-border)"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function FilterBar({
  filters,
  onFiltersChange,
  jobs,
}: {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  jobs: NormalizedJob[];
}) {
  const companies = Array.from(new Set(jobs.map((j) => j.company))).sort();
  const companyOptions = companies.map((c) => ({ value: c, label: c }));

  const hasActiveFilters =
    filters.search ||
    filters.categories.length > 0 ||
    filters.experienceLevels.length > 0 ||
    filters.companies.length > 0 ||
    !filters.h1bOnly ||
    filters.remoteOnly;

  return (
    <div className="space-y-4 rounded-lg border border-(--color-border) bg-(--color-card) p-4">
      {/* Search */}
      <div>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-text-muted)"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search jobs, companies, keywords..."
            value={filters.search}
            onChange={(e) =>
              onFiltersChange({ ...filters, search: e.target.value })
            }
            className="w-full rounded-lg border border-(--color-border) bg-(--color-bg) py-2.5 pl-10 pr-4 text-sm outline-none focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary)"
          />
        </div>
      </div>

      {/* Filter pills */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MultiSelect
          label="Category"
          options={CATEGORY_OPTIONS}
          selected={filters.categories}
          onChange={(categories) =>
            onFiltersChange({ ...filters, categories })
          }
        />
        <MultiSelect
          label="Experience"
          options={EXPERIENCE_OPTIONS}
          selected={filters.experienceLevels}
          onChange={(experienceLevels) =>
            onFiltersChange({ ...filters, experienceLevels })
          }
        />
        <MultiSelect
          label="Company"
          options={companyOptions}
          selected={filters.companies}
          onChange={(companies) =>
            onFiltersChange({ ...filters, companies })
          }
        />
      </div>

      {/* Toggles and sort */}
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.h1bOnly}
            onChange={(e) =>
              onFiltersChange({ ...filters, h1bOnly: e.target.checked })
            }
            className="rounded border-(--color-border)"
          />
          <span>H-1B Sponsors Only</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.remoteOnly}
            onChange={(e) =>
              onFiltersChange({ ...filters, remoteOnly: e.target.checked })
            }
            className="rounded border-(--color-border)"
          />
          <span>Remote Only</span>
        </label>

        <div className="ml-auto flex items-center gap-2">
          <label className="text-xs text-(--color-text-muted)">Sort:</label>
          <select
            value={filters.sortBy}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                sortBy: e.target.value as Filters["sortBy"],
              })
            }
            className="rounded border border-(--color-border) bg-(--color-bg) px-2 py-1 text-xs"
          >
            <option value="newest">Newest First</option>
            <option value="company">Company A-Z</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={() => onFiltersChange(DEFAULT_FILTERS)}
            className="text-xs text-(--color-primary) hover:underline"
          >
            Clear All Filters
          </button>
        )}
      </div>
    </div>
  );
}
