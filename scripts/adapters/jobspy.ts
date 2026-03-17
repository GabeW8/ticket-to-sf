import { scrapeJobs } from "ts-jobspy";
import { createHash } from "crypto";
import { NormalizedJob } from "./types.js";

export interface JobspySearchConfig {
  id: string;
  searchTerm: string;
  location: string;
  country: string;
  region: "sf" | "sg";
}

function hashUrl(url: string): string {
  return createHash("md5").update(url).digest("hex").slice(0, 12);
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function fetchJobspyJobs(
  config: JobspySearchConfig
): Promise<NormalizedJob[]> {
  const now = new Date().toISOString();

  const results = await scrapeJobs({
    siteName: ["indeed"],
    searchTerm: config.searchTerm,
    location: config.location,
    resultsWanted: 50,
    hoursOld: 168, // 1 week
    countryIndeed: config.country,
  });

  if (!results || !Array.isArray(results)) {
    return [];
  }

  return results
    .filter((job) => job.title && job.company && job.jobUrl)
    .map((job) => {
      const locationStr = job.location || config.location;

      const company = job.company || "Unknown";

      return {
        id: `jobspy_indeed_${hashUrl(job.jobUrl)}`,
        title: job.title,
        company,
        companySlug: slugify(company),
        location: locationStr,
        locations: [locationStr],
        department: null,
        team: null,
        url: job.jobUrlDirect || job.jobUrl,
        postedAt: job.datePosted
          ? new Date(job.datePosted).toISOString()
          : now,
        updatedAt: now,
        isRemote: /remote/i.test(locationStr),
        experienceLevel: "unknown" as const,
        category: "other" as const,
        h1bSponsorship: "unknown" as const,
        atsSource: "indeed" as const,
        scrapedAt: now,
        _description: job.description || "",
      };
    });
}
