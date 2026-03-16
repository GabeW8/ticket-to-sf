import { getJobsData } from "./lib/jobs";
import JobList from "./components/JobList";
import LastUpdated from "./components/LastUpdated";

export default function Home() {
  const { jobs, lastUpdated, totalCompanies } = getJobsData();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          SF Tech Jobs
        </h1>
        <p className="mt-1 text-(--color-text-muted)">
          AI & Software Engineering positions from H-1B sponsoring companies
        </p>
        <div className="mt-2">
          <LastUpdated date={lastUpdated} />
        </div>
      </header>

      <JobList jobs={jobs} totalCompanies={totalCompanies} />

      <footer className="mt-12 border-t border-(--color-border) pt-6 text-center text-xs text-(--color-text-muted)">
        <p>
          Data from public ATS APIs (Greenhouse, Ashby). Updated daily via
          GitHub Actions.
        </p>
        <p className="mt-1">
          H-1B sponsorship data from DOL OFLC Labor Condition Applications.
        </p>
        <p className="mt-1">
          H-1B1 (Singapore/Chile) uses the same sponsoring employers as H-1B.
        </p>
      </footer>
    </main>
  );
}
