import { getSfJobsData, getSgJobsData } from "./lib/jobs";
import PageContent from "./components/PageContent";

export default function Home() {
  const sfData = getSfJobsData();
  const sgData = getSgJobsData();

  return <PageContent sfData={sfData} sgData={sgData} />;
}
