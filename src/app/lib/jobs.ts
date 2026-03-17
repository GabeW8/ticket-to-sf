import type { JobsData } from "./types";
import sfData from "../../../data/jobs-sf.json";
import sgData from "../../../data/jobs-sg.json";

export function getSfJobsData(): JobsData {
  return sfData as JobsData;
}

export function getSgJobsData(): JobsData {
  return sgData as JobsData;
}
