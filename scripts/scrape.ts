import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { CompanyConfig, NormalizedJob, SponsorshipStatus } from "./adapters/types.js";
import { fetchGreenhouseJobs } from "./adapters/greenhouse.js";
import { fetchAshbyJobs } from "./adapters/ashby.js";
import { fetchLeverJobs } from "./adapters/lever.js";
import { filterAndEnrichJobs, detectVisaSponsorship } from "./filters.js";
import { delay } from "./utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, "..");
const DATA_DIR = resolve(ROOT, "data");

interface KnownSponsor {
  companySlug: string;
  dolNames: string[];
  status: SponsorshipStatus;
}

interface KnownSponsorsFile {
  sponsors: KnownSponsor[];
}

function loadJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf-8"));
}

function buildSponsorMap(): Map<string, SponsorshipStatus> {
  const map = new Map<string, SponsorshipStatus>();

  // Load curated sponsor list
  try {
    const known = loadJson<KnownSponsorsFile>(
      resolve(DATA_DIR, "known-sponsors.json")
    );
    for (const sponsor of known.sponsors) {
      map.set(sponsor.companySlug, sponsor.status);
    }
  } catch {
    console.warn("Warning: known-sponsors.json not found or invalid");
  }

  // Load DOL-processed sponsor list (overrides with "confirmed" if present)
  try {
    const h1bSponsors = loadJson<string[]>(
      resolve(DATA_DIR, "h1b-sponsors.json")
    );
    // h1b-sponsors.json is an array of normalized company names
    // We need to match against company slugs - this is handled at enrichment time
    // For now, just mark that the file exists
    console.log(`Loaded ${h1bSponsors.length} H-1B sponsors from DOL data`);
  } catch {
    console.log("Note: h1b-sponsors.json not found - using known-sponsors.json only");
  }

  return map;
}

function enrichSponsorship(
  jobs: NormalizedJob[],
  sponsorMap: Map<string, SponsorshipStatus>
): NormalizedJob[] {
  let perJobSponsors = 0;
  let perJobNoSponsor = 0;

  const enriched = jobs.map((job) => {
    // Per-job detection from description (highest priority)
    const descriptionSignal = detectVisaSponsorship(job._description || "");

    let status: SponsorshipStatus;
    if (descriptionSignal === "no_sponsor") {
      status = "unknown"; // Explicitly says no sponsorship — mark unknown (not confirmed)
      perJobNoSponsor++;
    } else if (descriptionSignal === "sponsors") {
      status = "confirmed"; // Job description explicitly mentions sponsorship
      perJobSponsors++;
    } else {
      // Fall back to company-level data
      status = sponsorMap.get(job.companySlug) || "unknown";
    }

    return { ...job, h1bSponsorship: status };
  });

  console.log(`  Per-job visa detection: ${perJobSponsors} sponsor, ${perJobNoSponsor} no-sponsor, ${enriched.length - perJobSponsors - perJobNoSponsor} fallback to company-level`);

  return enriched;
}

async function scrapeCompany(
  company: CompanyConfig
): Promise<NormalizedJob[]> {
  if (company.ats === "greenhouse") {
    return fetchGreenhouseJobs(company);
  } else if (company.ats === "ashby") {
    return fetchAshbyJobs(company);
  } else if (company.ats === "lever") {
    return fetchLeverJobs(company);
  }
  throw new Error(`Unknown ATS type: ${company.ats}`);
}

async function main() {
  console.log("Starting job scrape...\n");

  const companies = loadJson<CompanyConfig[]>(
    resolve(DATA_DIR, "companies.json")
  ).filter((c) => c.enabled);

  console.log(`Scraping ${companies.length} companies...\n`);

  const sponsorMap = buildSponsorMap();
  const allJobs: NormalizedJob[] = [];
  const errors: { company: string; error: string }[] = [];
  let companiesScraped = 0;

  for (const company of companies) {
    try {
      const jobs = await scrapeCompany(company);
      allJobs.push(...jobs);
      companiesScraped++;
      console.log(
        `  ✓ ${company.name}: ${jobs.length} jobs (${company.ats})`
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);
      errors.push({ company: company.name, error: message });
      console.log(`  ✗ ${company.name}: ${message}`);
    }

    // Rate limit between requests
    await delay(200);
  }

  console.log(`\nTotal raw jobs: ${allJobs.length}`);

  // Filter and enrich
  const filtered = filterAndEnrichJobs(allJobs);
  console.log(`After location/role filter: ${filtered.length}`);

  // Enrich with H-1B sponsorship data
  const enriched = enrichSponsorship(filtered, sponsorMap);

  // Sort by posted date (newest first)
  enriched.sort(
    (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
  );

  // Deduplicate by id
  const seen = new Set<string>();
  const deduplicated = enriched.filter((job) => {
    if (seen.has(job.id)) return false;
    seen.add(job.id);
    return true;
  });

  console.log(`After dedup: ${deduplicated.length}`);

  // Strip _description before saving (used only for enrichment)
  const cleaned = deduplicated.map(({ _description, ...rest }) => rest);

  // Write jobs.json
  const jobsData = {
    jobs: cleaned,
    lastUpdated: new Date().toISOString(),
    totalCompanies: companiesScraped,
  };
  writeFileSync(
    resolve(DATA_DIR, "jobs.json"),
    JSON.stringify(jobsData, null, 2)
  );

  // Write scrape log
  const scrapeLog = {
    timestamp: new Date().toISOString(),
    totalScraped: allJobs.length,
    totalAfterFilter: deduplicated.length,
    companiesScraped,
    companiesFailed: errors.length,
    errors,
  };
  writeFileSync(
    resolve(DATA_DIR, "scrape-log.json"),
    JSON.stringify(scrapeLog, null, 2)
  );

  console.log(`\nDone! ${deduplicated.length} jobs written to data/jobs.json`);
  console.log(
    `Companies: ${companiesScraped} scraped, ${errors.length} failed`
  );

  // Fail if more than 50% of companies failed
  if (errors.length > companies.length * 0.5) {
    console.error("\nERROR: More than 50% of companies failed!");
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
