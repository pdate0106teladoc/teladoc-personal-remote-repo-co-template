import * as React from "react";
import { buildProgramOverviewEngagementSections } from "./programOverviewData";
import ProgramOverviewSections from "./ProgramOverviewSections";

const EngagementCriteria = () => (
  <ProgramOverviewSections
    sections={buildProgramOverviewEngagementSections()}
  />
);

export default EngagementCriteria;
