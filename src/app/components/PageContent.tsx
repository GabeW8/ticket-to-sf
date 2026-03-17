"use client";

import { useState } from "react";
import type { JobsData } from "../lib/types";
import RegionTabs, { Region } from "./RegionTabs";
import JobList from "./JobList";
import LastUpdated from "./LastUpdated";

const REGION_INFO: Record<Region, { title: string; subtitle: string }> = {
  sf: {
    title: "Ticket to SF",
    subtitle:
      "Entry-level AI & Software Engineering positions (0-3 YOE) from H-1B sponsoring companies",
  },
  sg: {
    title: "Ticket to SG",
    subtitle:
      "Entry-level AI & Software Engineering positions (0-3 YOE) in Singapore",
  },
};

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

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{info.title}</h1>
            <p className="mt-1 text-sm text-(--color-text-muted)">
              {info.subtitle}
            </p>
          </div>
          <LastUpdated date={data.lastUpdated} />
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
          Data from public ATS APIs (Greenhouse, Ashby, Lever). Updated daily.
          Only showing 0-3 YOE positions.
        </p>
        <p className="mt-1">
          H-1B sponsorship data from DOL OFLC Labor Condition Applications.
          H-1B1 (Singapore/Chile) uses the same sponsoring employers.
        </p>
      </footer>
    </main>
  );
}
