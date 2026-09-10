import * as React from "react";
import { Tab, Tabs } from "react-bootstrap";
import { ArrowLeft } from "@/assets";
import EngagementCriteria from "./EngagementCriteria";
import ProgramOverviewBilling from "./ProgramOverviewBilling";
import ProgramOverviewEligibility from "./ProgramOverviewEligibility";
import ProgramOverviewGeneralSettings from "./ProgramOverviewGeneralSettings";
import ProgramOverviewMarketing from "./ProgramOverviewMarketing";
import { ProgramOverviewSummary } from "./programOverviewData";
import "@/pages/template/style/ProgramOverviewDetail.scss";

const PROGRAM_DETAIL_TABS = [
  { key: "general-settings", title: "General settings" },
  { key: "billing", title: "Billing", Component: ProgramOverviewBilling },
  { key: "marketing", title: "Marketing", Component: ProgramOverviewMarketing },
  {
    key: "eligibility",
    title: "Eligibility",
    Component: ProgramOverviewEligibility,
  },
  {
    key: "engagement-criteria",
    title: "Engagement criteria",
    Component: EngagementCriteria,
  },
] as const;

interface ProgramOverviewDetailProps {
  overview: ProgramOverviewSummary;
  onBack: () => void;
}

const ProgramOverviewDetail: React.FC<ProgramOverviewDetailProps> = ({
  overview,
  onBack,
}) => (
  <div className="program-overview-detail">
    <button type="button" className="program-overview-back" onClick={onBack}>
      <ArrowLeft className="back-icon" aria-hidden />
      Back
    </button>
    <h3 className="program-overview-title">{overview.name}</h3>
    <Tabs
      defaultActiveKey={PROGRAM_DETAIL_TABS[0].key}
      id={`program-overview-tabs-${overview.id}`}
      className="program-detail-tabs"
    >
      {PROGRAM_DETAIL_TABS.map((tab) => (
        <Tab eventKey={tab.key} title={tab.title} key={tab.key}>
          {"Component" in tab ? (
            <tab.Component />
          ) : (
            <ProgramOverviewGeneralSettings overview={overview} />
          )}
        </Tab>
      ))}
    </Tabs>
  </div>
);

export default ProgramOverviewDetail;
