import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import * as XLSX from "xlsx";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, "..");
const DATA_DIR = resolve(ROOT, "data");

// DOL OFLC LCA disclosure data URLs
// These are updated quarterly - check https://www.dol.gov/agencies/eta/foreign-labor/performance
const LCA_URLS = [
  "https://www.dol.gov/sites/dolgov/files/ETA/oflc/pdfs/LCA_Disclosure_Data_FY2025_Q4.xlsx",
  "https://www.dol.gov/sites/dolgov/files/ETA/oflc/pdfs/LCA_Disclosure_Data_FY2025_Q3.xlsx",
];

function normalizeEmployerName(name: string): string {
  return name
    .toUpperCase()
    .replace(
      /,?\s*(INC|LLC|CORP|LTD|CO|COMPANY|INCORPORATED|CORPORATION|PBC)\.?\s*$/,
      ""
    )
    .replace(/[^A-Z0-9\s]/g, "")
    .trim();
}

async function downloadAndProcessLCA(url: string): Promise<Set<string>> {
  console.log(`Downloading: ${url}`);
  const sponsors = new Set<string>();

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(120000), // 2 min timeout for large file
    });

    if (!response.ok) {
      console.warn(`  Failed to download (${response.status}), skipping...`);
      return sponsors;
    }

    const buffer = await response.arrayBuffer();
    console.log(
      `  Downloaded ${(buffer.byteLength / 1024 / 1024).toFixed(1)}MB`
    );

    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);

    console.log(`  Processing ${rows.length} rows...`);

    for (const row of rows) {
      const visaClass =
        row["VISA_CLASS"] || row["visa_class"] || "";
      const caseStatus =
        row["CASE_STATUS"] || row["case_status"] || "";
      const employerName =
        row["EMPLOYER_NAME"] || row["employer_name"] || "";

      // Keep H-1B and H-1B1 with certified status
      if (
        (visaClass === "H-1B" || visaClass === "H-1B1") &&
        caseStatus === "Certified" &&
        employerName
      ) {
        sponsors.add(normalizeEmployerName(employerName));
      }
    }

    console.log(`  Found ${sponsors.size} unique H-1B sponsors`);
  } catch (error) {
    console.warn(
      `  Error processing ${url}:`,
      error instanceof Error ? error.message : error
    );
  }

  return sponsors;
}

async function main() {
  console.log("Processing H-1B sponsor data from DOL OFLC...\n");

  const allSponsors = new Set<string>();

  for (const url of LCA_URLS) {
    const sponsors = await downloadAndProcessLCA(url);
    for (const s of sponsors) {
      allSponsors.add(s);
    }
  }

  console.log(`\nTotal unique H-1B sponsors: ${allSponsors.size}`);

  // Write as sorted array
  const sorted = Array.from(allSponsors).sort();
  writeFileSync(
    resolve(DATA_DIR, "h1b-sponsors.json"),
    JSON.stringify(sorted, null, 2)
  );

  console.log(`Written to data/h1b-sponsors.json`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
