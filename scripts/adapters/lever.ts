import { NormalizedJob, CompanyConfig, RawLeverJob } from "./types.js";
import { fetchWithRetry } from "../utils.js";

export async function fetchLeverJobs(
  company: CompanyConfig
): Promise<NormalizedJob[]> {
  const url = `https://api.lever.co/v0/postings/${company.atsSlug}`;
  const response = await fetchWithRetry(url);

  if (!response.ok) {
    throw new Error(
      `Lever API returned ${response.status} for ${company.name}`
    );
  }

  const data: RawLeverJob[] = await response.json();
  const now = new Date().toISOString();

  return data.map((job) => {
    const locationName = job.categories?.location || "";
    const commitment = job.categories?.commitment || "";
    const department = job.categories?.department || null;
    const team = job.categories?.team || null;

    return {
      id: `${company.slug}_${job.id}`,
      title: job.text,
      company: company.name,
      companySlug: company.slug,
      location: locationName,
      locations: locationName ? [locationName] : [],
      department,
      team,
      url: job.hostedUrl || job.applyUrl,
      postedAt: job.createdAt ? new Date(job.createdAt).toISOString() : now,
      updatedAt: job.updatedAt ? new Date(job.updatedAt).toISOString() : now,
      isRemote: /remote/i.test(locationName) || /remote/i.test(commitment),
      experienceLevel: "unknown" as const,
      category: "other" as const,
      h1bSponsorship: "unknown" as const,
      atsSource: "lever" as const,
      scrapedAt: now,
      _description: job.descriptionPlain || "",
    };
  });
}
