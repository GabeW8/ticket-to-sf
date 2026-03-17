"use client";

import { useState } from "react";
import type { JobsData } from "../lib/types";
import RegionTabs, { Region } from "./RegionTabs";
import JobList from "./JobList";

const REGION_INFO: Record<Region, { title: string; flag: string; subtitle: string }> = {
  sf: {
    title: "Ticket to SF",
    flag: "🇺🇸",
    subtitle: "Entry-level AI & SWE positions from H-1B sponsoring companies",
  },
  sg: {
    title: "Ticket to SG",
    flag: "🇸🇬",
    subtitle: "Entry-level AI & SWE positions in Singapore",
  },
};

function ShareButton() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="inline-flex items-center gap-1.5 rounded-md border border-(--color-border) bg-(--color-card) px-3 py-1.5 text-xs font-medium transition-colors hover:bg-(--color-gray-bg)"
    >
      {copied ? (
        <>
          <svg className="h-3.5 w-3.5 text-(--color-green)" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
          </svg>
          Share
        </>
      )}
    </button>
  );
}

export default function PageContent({
  sfData,
  sgData,
}: {
  sfData: JobsData;
  sgData: JobsData;
}) {
  const [region, setRegion] = useState<Region>("sf");

  const data = region === "sf" ? sfData : sgData;
  const info = REGION_INFO[region];
  const lastUpdated = new Date(data.lastUpdated).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {info.flag} {info.title}
            </h1>
            <p className="mt-1 text-sm text-(--color-text-muted)">
              Curated entry-level tech jobs for new graduates. Updated daily.
            </p>
            <p className="mt-0.5 text-xs text-(--color-text-muted)">
              {data.jobs.length} jobs from {data.totalCompanies} companies · Updated {lastUpdated}
            </p>
          </div>
          <ShareButton />
        </div>
        <div className="mt-4">
          <RegionTabs
            active={region}
            onChange={setRegion}
            sfCount={sfData.jobs.length}
            sgCount={sgData.jobs.length}
          />
        </div>
      </header>

      <JobList
        key={region}
        jobs={data.jobs}
        totalCompanies={data.totalCompanies}
      />

      <footer className="mt-12 border-t border-(--color-border) pt-6 text-center text-xs text-(--color-text-muted)">
        <p>
          Data from Greenhouse, Ashby, Lever, Indeed & LinkedIn. Updated daily via GitHub Actions.
        </p>
        <p className="mt-1">
          Only showing 0-3 YOE positions. H-1B/H-1B1 sponsorship data from DOL OFLC.
        </p>
      </footer>
    </main>
  );
}
