export type ExperienceLevel =
  | "intern"
  | "new_grad"
  | "junior"
  | "mid"
  | "senior"
  | "staff"
  | "unknown";

export type JobCategory = "swe" | "ai_ml" | "data" | "product" | "other";

export type SponsorshipStatus = "confirmed" | "likely" | "unknown";

export interface NormalizedJob {
  id: string;
  title: string;
  company: string;
  companySlug: string;
  location: string;
  locations: string[];
  department: string | null;
  team: string | null;
  url: string;
  postedAt: string;
  updatedAt: string;
  isRemote: boolean;
  experienceLevel: ExperienceLevel;
  category: JobCategory;
  h1bSponsorship: SponsorshipStatus;
  atsSource: "greenhouse" | "ashby";
  scrapedAt: string;
}

export interface CompanyConfig {
  name: string;
  slug: string;
  ats: "greenhouse" | "ashby";
  atsSlug: string;
  hq: string;
  h1bOverride?: SponsorshipStatus;
  enabled: boolean;
}

export interface RawGreenhouseJob {
  id: number;
  title: string;
  absolute_url: string;
  location: { name: string };
  metadata: { id: number; name: string; value: string | string[] | null }[];
  departments: { id: number; name: string }[];
  updated_at: string;
  requisition_id: string | null;
}

export interface RawAshbyJob {
  id: string;
  title: string;
  location: string;
  secondaryLocations: string[];
  department: string;
  team: string;
  employmentType: string;
  isRemote: boolean;
  jobUrl: string;
  applyUrl: string;
  publishedAt: string;
  updatedAt: string;
  descriptionPlain: string;
}
