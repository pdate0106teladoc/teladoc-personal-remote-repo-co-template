import * as React from "react";
import { buildProgramOverviewEligibilitySections } from "./programOverviewData";
import ProgramOverviewSections from "./ProgramOverviewSections";

const ProgramOverviewEligibility = () => (
  <ProgramOverviewSections
    sections={buildProgramOverviewEligibilitySections()}
  />
);

export default ProgramOverviewEligibility;
