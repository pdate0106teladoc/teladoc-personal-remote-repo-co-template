import * as React from "react";
import { buildProgramOverviewMarketingSections } from "./programOverviewData";
import ProgramOverviewSections from "./ProgramOverviewSections";

const ProgramOverviewMarketing = () => (
  <ProgramOverviewSections sections={buildProgramOverviewMarketingSections()} />
);

export default ProgramOverviewMarketing;
