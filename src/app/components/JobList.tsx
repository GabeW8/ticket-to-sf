"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import type { NormalizedJob } from "../lib/types";
import JobCard from "./JobCard";
import FilterBar, { Filters, DEFAULT_FILTERS } from "./FilterBar";
import StatsBar from "./StatsBar";

const JOBS_PER_PAGE = 30;
const STORAGE_KEY = "ticket-saved-jobs";

function loadSavedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return new Set();
}

function persistSavedIds(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {}
}

function applyFilters(
  jobs: NormalizedJob[],
  filters: Filters,
  savedIds: Set<string>
): NormalizedJob[] {
  let result = jobs;

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

  if (filters.categories.length > 0) {
    result = result.filter((j) => filters.categories.includes(j.category));
  }

  if (filters.experienceLevels.length > 0) {
    result = result.filter((j) =>
      filters.experienceLevels.includes(j.experienceLevel)
    );
  }

  if (filters.companies.length > 0) {
    result = result.filter((j) => filters.companies.includes(j.company));
  }

  if (filters.h1bOnly) {
    result = result.filter(
      (j) => j.h1bSponsorship === "confirmed" || j.h1bSponsorship === "likely"
    );
  }

  if (filters.remoteOnly) {
    result = result.filter((j) => j.isRemote);
  }

  if (filters.savedOnly) {
    result = result.filter((j) => savedIds.has(j.id));
  }

  if (filters.sortBy === "company") {
    result = [...result].sort((a, b) => a.company.localeCompare(b.company));
  } else if (filters.sortBy === "salary") {
    result = [...result].sort(
      (a, b) => (b.salaryMax || b.salaryMin || 0) - (a.salaryMax || a.salaryMin || 0)
    );
  }

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
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSavedIds(loadSavedIds());
  }, []);

  const toggleSave = useCallback((id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      persistSavedIds(next);
      return next;
    });
  }, []);

  const filtered = useMemo(
    () => applyFilters(jobs, filters, savedIds),
    [jobs, filters, savedIds]
  );

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="space-y-4">
      <FilterBar
        filters={filters}
        onFiltersChange={setFilters}
        jobs={jobs}
        savedCount={savedIds.size}
      />

      <StatsBar
        showing={Math.min(visibleCount, filtered.length)}
        total={jobs.length}
        totalCompanies={totalCompanies}
      />

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-(--color-border) bg-(--color-card) p-12 text-center">
          <p className="text-lg font-medium">No jobs match your filters</p>
          <p className="mt-2 text-sm text-(--color-text-muted)">
            Try removing some filters or search for different keywords like &ldquo;AI
            engineer&rdquo; or &ldquo;backend&rdquo;
          </p>
          <button
            onClick={() => setFilters(DEFAULT_FILTERS)}
            className="mt-4 rounded-md bg-(--color-primary) px-4 py-2 text-sm font-medium text-white hover:bg-(--color-primary-hover)"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSaved={savedIds.has(job.id)}
                onToggleSave={toggleSave}
              />
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
