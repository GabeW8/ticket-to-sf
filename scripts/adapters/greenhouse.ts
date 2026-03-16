import { NormalizedJob, CompanyConfig, RawGreenhouseJob } from "./types.js";
import { fetchWithRetry } from "../utils.js";

interface GreenhouseResponse {
  jobs: RawGreenhouseJob[];
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#\d+;/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function fetchGreenhouseJobs(
  company: CompanyConfig
): Promise<NormalizedJob[]> {
  const url = `https://boards-api.greenhouse.io/v1/boards/${company.atsSlug}/jobs?content=true`;
  const response = await fetchWithRetry(url);

  if (!response.ok) {
    throw new Error(
      `Greenhouse API returned ${response.status} for ${company.name}`
    );
  }

  const data: GreenhouseResponse = await response.json();
  const now = new Date().toISOString();

  return data.jobs.map((job) => {
    const locationName = job.location?.name || "";
    const locations = locationName
      .split(/[;|,]/)
      .map((l) => l.trim())
      .filter(Boolean);

    const departmentName =
      job.departments?.[0]?.name || getDepartmentFromMetadata(job.metadata);

    const description = job.content ? stripHtml(job.content) : "";

    return {
      id: `${company.slug}_${job.id}`,
      title: job.title,
      company: company.name,
      companySlug: company.slug,
      location: locationName,
      locations,
      department: departmentName,
      team: null,
      url: job.absolute_url,
      postedAt: job.updated_at || now,
      updatedAt: job.updated_at || now,
      isRemote: /remote/i.test(locationName),
      experienceLevel: "unknown" as const,
      category: "other" as const,
      h1bSponsorship: "unknown" as const,
      atsSource: "greenhouse" as const,
      scrapedAt: now,
      _description: description,
    };
  });
}

function getDepartmentFromMetadata(
  metadata: RawGreenhouseJob["metadata"]
): string | null {
  if (!metadata) return null;
  const dept = metadata.find(
    (m) =>
      m.name?.toLowerCase() === "department" ||
      m.name?.toLowerCase() === "team"
  );
  if (dept?.value && typeof dept.value === "string") return dept.value;
  return null;
}
