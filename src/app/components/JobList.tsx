"use client";

import { useState, useMemo } from "react";
import type { NormalizedJob } from "../lib/types";
import JobCard from "./JobCard";
import FilterBar, { Filters, DEFAULT_FILTERS } from "./FilterBar";
import StatsBar from "./StatsBar";

const JOBS_PER_PAGE = 30;

function applyFilters(jobs: NormalizedJob[], filters: Filters): NormalizedJob[] {
  let result = jobs;

  // Text search
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        (j.department && j.department.toLowerCase().includes(q)) ||
        (j.team && j.team.toLowerCase().includes(q))
    );
  }

  // Category filter
  if (filters.categories.length > 0) {
    result = result.filter((j) => filters.categories.includes(j.category));
  }

  // Experience level filter
  if (filters.experienceLevels.length > 0) {
    result = result.filter((j) =>
      filters.experienceLevels.includes(j.experienceLevel)
    );
  }

  // Company filter
  if (filters.companies.length > 0) {
    result = result.filter((j) => filters.companies.includes(j.company));
  }

  // H-1B only
  if (filters.h1bOnly) {
    result = result.filter(
      (j) => j.h1bSponsorship === "confirmed" || j.h1bSponsorship === "likely"
    );
  }

  // Remote only
  if (filters.remoteOnly) {
    result = result.filter((j) => j.isRemote);
  }

  // Sort
  if (filters.sortBy === "company") {
    result = [...result].sort((a, b) =>
      a.company.localeCompare(b.company)
    );
  }
  // Default is already sorted by newest in the data

  return result;
}

export default function JobList({
  jobs,
  totalCompanies,
}: {
  jobs: NormalizedJob[];
  totalCompanies: number;
}) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [visibleCount, setVisibleCount] = useState(JOBS_PER_PAGE);

  const filtered = useMemo(() => applyFilters(jobs, filters), [jobs, filters]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="space-y-4">
      <FilterBar filters={filters} onFiltersChange={setFilters} jobs={jobs} />

      <StatsBar
        showing={Math.min(visibleCount, filtered.length)}
        total={jobs.length}
        totalCompanies={totalCompanies}
      />

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-(--color-border) bg-(--color-card) p-12 text-center">
          <p className="text-lg font-medium">No jobs match your filters</p>
          <p className="mt-1 text-sm text-(--color-text-muted)">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => setVisibleCount((c) => c + JOBS_PER_PAGE)}
                className="rounded-lg border border-(--color-border) bg-(--color-card) px-6 py-2.5 text-sm font-medium transition-colors hover:bg-(--color-gray-bg)"
              >
                Load More ({filtered.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
