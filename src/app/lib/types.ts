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
  atsSource: "greenhouse" | "ashby" | "lever" | "indeed";
  scrapedAt: string;
}

export interface CompanyConfig {
  name: string;
  slug: string;
  ats: "greenhouse" | "ashby" | "lever";
  atsSlug: string;
  hq: string;
  h1bOverride?: SponsorshipStatus;
  enabled: boolean;
}

export interface ScrapeLog {
  timestamp: string;
  totalScraped: number;
  totalAfterFilter: number;
  companiesScraped: number;
  companiesFailed: number;
  errors: { company: string; error: string }[];
}

export interface JobsData {
  jobs: NormalizedJob[];
  lastUpdated: string;
  totalCompanies: number;
}
