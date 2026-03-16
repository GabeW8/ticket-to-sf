import type { JobsData } from "./types";
import jobsDataRaw from "../../../data/jobs.json";

export function getJobsData(): JobsData {
  return jobsDataRaw as JobsData;
}
