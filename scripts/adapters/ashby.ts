import { NormalizedJob, CompanyConfig, RawAshbyJob } from "./types.js";
import { fetchWithRetry } from "../utils.js";

interface AshbyResponse {
  jobs: RawAshbyJob[];
}

export async function fetchAshbyJobs(
  company: CompanyConfig
): Promise<NormalizedJob[]> {
  const url = `https://api.ashbyhq.com/posting-api/job-board/${company.atsSlug}`;
  const response = await fetchWithRetry(url);

  if (!response.ok) {
    throw new Error(
      `Ashby API returned ${response.status} for ${company.name}`
    );
  }

  const data: AshbyResponse = await response.json();
  const now = new Date().toISOString();

  return data.jobs.map((job) => {
    const primaryLocation = job.location || "";
    const allLocations = [
      primaryLocation,
      ...(job.secondaryLocations || []),
    ].filter(Boolean);

    return {
      id: `${company.slug}_${job.id}`,
      title: job.title,
      company: company.name,
      companySlug: company.slug,
      location: primaryLocation,
      locations: allLocations,
      department: job.department || null,
      team: job.team || null,
      url: job.jobUrl || job.applyUrl,
      postedAt: job.publishedAt || now,
      updatedAt: job.updatedAt || job.publishedAt || now,
      isRemote: job.isRemote || /remote/i.test(primaryLocation),
      experienceLevel: "unknown" as const,
      category: "other" as const,
      h1bSponsorship: "unknown" as const,
      atsSource: "ashby" as const,
      scrapedAt: now,
      _description: job.descriptionPlain || "",
    };
  });
}
