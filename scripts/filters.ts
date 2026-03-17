import { NormalizedJob, ExperienceLevel, JobCategory, SponsorshipStatus } from "./adapters/types.js";

const SF_LOCATION_PATTERNS = [
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

const SG_LOCATION_PATTERNS = [
  /singapore/i,
  /\bsg\b/,
  /\bapac\b/i,
  /asia[- ]pacific/i,
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

// --- Visa sponsorship detection ---

const VISA_POSITIVE_PATTERNS = [
  /\bvisa sponsorship\b/i,
  /\bsponsor(?:s|ing|ed)?\s+(?:h-?1b|visa|work)/i,
  /\bh-?1b\s+sponsor/i,
  /\bh-?1b1?\b/i,
  /\bimmigration sponsorship\b/i,
  /\bwill(?:ing to)?\s+sponsor\b/i,
  /\bopen to sponsoring\b/i,
  /\bprovide(?:s)?\s+(?:visa|immigration)\s+sponsor/i,
  /\bwork authorization.*sponsor/i,
  /\bsponsorship(?:\s+is)?\s+available\b/i,
];

const VISA_NEGATIVE_PATTERNS = [
  /\bunable to sponsor\b/i,
  /\bwill not sponsor\b/i,
  /\bcannot sponsor\b/i,
  /\bdo(?:es)? not sponsor\b/i,
  /\bno(?:t)?\s+(?:visa|immigration)\s+sponsor/i,
  /\bwithout\s+(?:visa|immigration)\s+sponsor/i,
  /\bnot\s+(?:able|willing)\s+to\s+sponsor\b/i,
  /\bmust\s+be\s+(?:legally\s+)?authorized\s+to\s+work\b/i,
  /\bauthoriz(?:ed|ation)\s+to\s+work\s+(?:in\s+the\s+)?(?:us|united states)(?:\s+(?:is\s+)?required)/i,
  /\bus\s+citizen(?:s)?\s+(?:or|and)\s+(?:permanent\s+)?resident/i,
  /\bsponsorship\s+(?:is\s+)?not\s+available\b/i,
  /\bdoes not provide sponsorship\b/i,
];

export function detectVisaSponsorship(description: string): "sponsors" | "no_sponsor" | "unmentioned" {
  if (!description) return "unmentioned";

  const hasNegative = VISA_NEGATIVE_PATTERNS.some((p) => p.test(description));
  if (hasNegative) return "no_sponsor";

  const hasPositive = VISA_POSITIVE_PATTERNS.some((p) => p.test(description));
  if (hasPositive) return "sponsors";

  return "unmentioned";
}

// --- Experience level detection (title + description) ---

function extractYearsFromDescription(description: string): number | null {
  if (!description) return null;

  // Try range pattern first: "2-8 years" → use the LOWER bound as minimum requirement
  // But for ranges like "2-8", the midpoint is more representative
  const rangeMatch = description.match(
    /(\d+)\s*[-–]\s*(\d+)\s*(?:years?|yrs?)(?:\s+of)?\s+(?:relevant\s+|professional\s+|industry\s+|hands[- ]on\s+|practical\s+)?(?:experience|work)/i
  );
  if (rangeMatch) {
    const low = parseInt(rangeMatch[1], 10);
    const high = parseInt(rangeMatch[2], 10);
    // Use midpoint of range for classification
    return Math.round((low + high) / 2);
  }

  // Single number patterns: "5+ years", "at least 3 years", "minimum 2 years"
  const patterns = [
    /(\d+)\+?\s*(?:years?|yrs?)(?:\s+of)?\s+(?:relevant\s+|professional\s+|industry\s+|hands[- ]on\s+|practical\s+)?(?:experience|work)/i,
    /(?:at\s+least|minimum|min\.?)\s+(\d+)\s*(?:years?|yrs?)/i,
    /(?:experience|background)(?:\s+of)?\s+(\d+)\+?\s*(?:years?|yrs?)/i,
  ];

  for (const pattern of patterns) {
    const match = description.match(pattern);
    if (match) {
      return parseInt(match[1], 10);
    }
  }

  return null;
}

function yearsToLevel(years: number): ExperienceLevel {
  if (years === 0) return "new_grad";
  if (years <= 2) return "new_grad";
  if (years <= 4) return "mid";
  if (years <= 7) return "senior";
  return "staff";
}

export function deriveExperienceLevel(title: string, description?: string): ExperienceLevel {
  const t = title.toLowerCase();

  // 1. Check for explicit YOE in the title first (e.g., "(8+ YOE)", "(2-8 YOE)")
  const titleRangeMatch = t.match(/(\d+)\s*[-–]\s*(\d+)\s*(?:yoe|years?|yrs?)/);
  if (titleRangeMatch) {
    const mid = Math.round((parseInt(titleRangeMatch[1]) + parseInt(titleRangeMatch[2])) / 2);
    return yearsToLevel(mid);
  }
  const titleYoeMatch = t.match(/(\d+)\+?\s*(?:yoe|years?\s+(?:of\s+)?experience)/);
  if (titleYoeMatch) {
    return yearsToLevel(parseInt(titleYoeMatch[1]));
  }

  // 2. Title keyword-based detection
  if (/\bintern\b/.test(t)) return "intern";
  if (
    /\b(new grad|new graduate|entry level|entry-level|early career|university grad|fresh graduate|junior)\b/.test(t)
  )
    return "new_grad";
  // "Engineer I" / "Engineer 1" / "SWE I" — match roman numeral I or digit 1 at end of title
  if (/\b(engineer|developer|scientist)\s+(i|1)\s*$/i.test(t) || /\bassociate\b/.test(t) || /\bl3\b/.test(t) || /\be3\b/.test(t))
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

  // 3. Description-based detection (for titles that don't specify level)
  if (description) {
    const desc = description.toLowerCase();

    // Parse years of experience from description (most reliable signal)
    const years = extractYearsFromDescription(description);
    if (years !== null) {
      return yearsToLevel(years);
    }

    // Check for explicit new grad / entry level mentions
    if (
      /\b(new grad|new graduate|recent graduate|early[- ]career|early in your career|no prior experience|no experience required|0 years)\b/.test(desc)
    )
      return "new_grad";

    // "Bachelor's degree" or "BS/MS" mentioned without years of experience → likely new_grad
    if (
      /\b(bachelor'?s?\s+degree|bs\s*\/\s*ms|b\.?s\.?\s+in)\b/.test(desc) &&
      !/\byears?\b/.test(desc)
    )
      return "new_grad";
  }

  return "unknown";
}

export type Region = "sf" | "sg";

export function matchesLocation(job: NormalizedJob, region: Region): boolean {
  const allLocations = [job.location, ...job.locations].join(" ");
  const patterns = region === "sf" ? SF_LOCATION_PATTERNS : SG_LOCATION_PATTERNS;
  return patterns.some((p) => p.test(allLocations));
}

export function matchesRole(job: NormalizedJob): boolean {
  const title = job.title;
  if (ROLE_EXCLUDE_PATTERNS.some((p) => p.test(title))) {
    if (/engineering manager/i.test(title)) return true;
    return false;
  }
  return ROLE_INCLUDE_PATTERNS.some((p) => p.test(title));
}

export function deriveCategory(title: string): JobCategory {
  const t = title.toLowerCase();

  if (
    /\b(ml|machine learning|ai|artificial intelligence|research scientist|research engineer|applied scientist|nlp|computer vision|deep learning|llm)\b/.test(t)
  )
    return "ai_ml";
  if (/\b(data scientist|data engineer|data analytics|analytics engineer)\b/.test(t))
    return "data";
  if (/\b(product manager|product engineer|product lead)\b/.test(t))
    return "product";
  if (
    /\b(software|swe|frontend|front-end|backend|back-end|full[- ]?stack|developer|platform|infrastructure|devops|sre|mobile|ios|android|security|cloud|systems|engineering manager|solutions engineer)\b/.test(t)
  )
    return "swe";

  return "other";
}

function departmentToExperience(department: string | null, team: string | null): ExperienceLevel | null {
  const combined = [department, team].filter(Boolean).join(" ").toLowerCase();
  if (/\b(university|new grad|early career|campus|graduate)\b/.test(combined)) return "new_grad";
  if (/\bintern\b/.test(combined)) return "intern";
  return null;
}

const JUNIOR_LEVELS: Set<ExperienceLevel> = new Set(["intern", "new_grad", "junior", "mid", "unknown"]);

export function filterAndEnrichJobs(jobs: NormalizedJob[], region: Region): NormalizedJob[] {
  return jobs
    .filter((job) => matchesLocation(job, region))
    .filter(matchesRole)
    .map((job) => {
      let experienceLevel = deriveExperienceLevel(job.title, job._description);

      // If still unknown, check department/team signals
      if (experienceLevel === "unknown") {
        const deptLevel = departmentToExperience(job.department, job.team);
        if (deptLevel) experienceLevel = deptLevel;
      }

      return {
        ...job,
        experienceLevel,
        category: deriveCategory(job.title),
      };
    })
    .filter((job) => JUNIOR_LEVELS.has(job.experienceLevel));
}
