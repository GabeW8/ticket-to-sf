import { NormalizedJob, ExperienceLevel, JobCategory } from "./adapters/types.js";

const LOCATION_PATTERNS = [
  /san francisco/i,
  /\bsf\b/i,
  /bay area/i,
  /\bremote\b/i,
  /united states/i,
  /\bus\b/,
  /california/i,
  /\bca\b/,
  /new york/i,
  /\bnyc?\b/i,
  /seattle/i,
  /\bwa\b/,
  /los angeles/i,
  /\bla\b/,
  /austin/i,
  /\btx\b/,
];

const ROLE_INCLUDE_PATTERNS = [
  /software engineer/i,
  /\bswe\b/i,
  /frontend|front[- ]end/i,
  /backend|back[- ]end/i,
  /full[- ]?stack/i,
  /machine learning|ml engineer/i,
  /\bai engineer/i,
  /research engineer/i,
  /research scientist/i,
  /applied scientist/i,
  /data scientist/i,
  /data engineer/i,
  /platform engineer/i,
  /infrastructure engineer/i,
  /devops|sre|site reliability/i,
  /\bdeveloper\b/i,
  /systems engineer/i,
  /security engineer/i,
  /cloud engineer/i,
  /mobile engineer/i,
  /ios engineer|android engineer/i,
  /engineering manager/i,
  /solutions engineer/i,
];

const ROLE_EXCLUDE_PATTERNS = [
  /\b(director|vp|vice president|head of|chief|cto|ceo|cfo)\b/i,
  /\brecruiter\b/i,
  /\bcoordinator\b/i,
  /\boperations\b/i,
  /\bsales\b/i,
  /\bmarketing\b/i,
  /\blegal\b/i,
  /\bfinance\b/i,
  /\baccountant\b/i,
  /\bdesigner\b/i,
  /\bwriter\b/i,
  /\bcopywriter\b/i,
  /\bhr\b/i,
  /\bhuman resources\b/i,
  /\bcustomer success\b/i,
  /\baccount executive\b/i,
  /\bbusiness development\b/i,
];

export function matchesLocation(job: NormalizedJob): boolean {
  const allLocations = [job.location, ...job.locations].join(" ");
  return LOCATION_PATTERNS.some((p) => p.test(allLocations));
}

export function matchesRole(job: NormalizedJob): boolean {
  const title = job.title;
  if (ROLE_EXCLUDE_PATTERNS.some((p) => p.test(title))) {
    // Exception: keep "engineering manager"
    if (/engineering manager/i.test(title)) return true;
    return false;
  }
  return ROLE_INCLUDE_PATTERNS.some((p) => p.test(title));
}

export function deriveExperienceLevel(title: string): ExperienceLevel {
  const t = title.toLowerCase();

  if (/\bintern\b/.test(t)) return "intern";
  if (
    /\b(new grad|new graduate|entry level|entry-level|early career|university|fresh graduate|junior)\b/.test(
      t
    )
  )
    return "new_grad";
  if (/\bassociate\b/.test(t) || /\b[, ]i\b/.test(t) || /\bl3\b/.test(t) || /\be3\b/.test(t))
    return "junior";
  if (
    /\b(senior|sr\.?|sr )\b/.test(t) ||
    /\biii\b/.test(t) ||
    /\bl5\b/.test(t) ||
    /\be5\b/.test(t)
  )
    return "senior";
  if (
    /\b(staff|principal|distinguished)\b/.test(t) ||
    /\biv\b/.test(t) ||
    /\bl6\b/.test(t) ||
    /\be6\b/.test(t)
  )
    return "staff";
  if (/\bii\b/.test(t) || /\bl4\b/.test(t) || /\be4\b/.test(t) || /\bmid[- ]level\b/.test(t))
    return "mid";

  return "unknown";
}

export function deriveCategory(title: string): JobCategory {
  const t = title.toLowerCase();

  if (
    /\b(ml|machine learning|ai|artificial intelligence|research scientist|research engineer|applied scientist|nlp|computer vision|deep learning|llm)\b/.test(
      t
    )
  )
    return "ai_ml";
  if (/\b(data scientist|data engineer|data analytics|analytics engineer)\b/.test(t))
    return "data";
  if (
    /\b(product manager|product engineer|product lead)\b/.test(t)
  )
    return "product";
  if (
    /\b(software|swe|frontend|front-end|backend|back-end|full[- ]?stack|developer|platform|infrastructure|devops|sre|mobile|ios|android|security|cloud|systems|engineering manager|solutions engineer)\b/.test(
      t
    )
  )
    return "swe";

  return "other";
}

export function filterAndEnrichJobs(jobs: NormalizedJob[]): NormalizedJob[] {
  return jobs
    .filter(matchesLocation)
    .filter(matchesRole)
    .map((job) => ({
      ...job,
      experienceLevel: deriveExperienceLevel(job.title),
      category: deriveCategory(job.title),
    }));
}
