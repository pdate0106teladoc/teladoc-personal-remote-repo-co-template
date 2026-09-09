import * as React from "react";
import { Tab, Tabs } from "react-bootstrap";
import { ArrowLeft } from "@/assets";
import type { ProgramOverviewSummary } from "@/components/template/view";
import Billing from "./Billing";
import Eligibility from "./Eligibility";
import EngagementCriteria from "./EngagementCriteria";
import Marketing from "./Marketing";
import ProgramOverviewGeneralSettings from "./ProgramOverviewGeneralSettings";
import { buildProgramOverviewContext } from "./programOverviewForm";
import type {
  ProgramOverviewEditField,
  ProgramOverviewEditForm,
} from "./programOverviewForm";
import "./ProgramOverviewDetail.scss";

const PROGRAM_DETAIL_TABS = [
  { key: "general-settings", title: "General settings" },
  { key: "billing", title: "Billing", Component: Billing },
  { key: "marketing", title: "Marketing", Component: Marketing },
  { key: "eligibility", title: "Eligibility", Component: Eligibility },
  {
    key: "engagement-criteria",
    title: "Engagement criteria",
    Component: EngagementCriteria,
  },
] as const;

interface ProgramOverviewDetailProps {
  overview: ProgramOverviewSummary;
  form: ProgramOverviewEditForm;
  onChange: (field: ProgramOverviewEditField, value: string | boolean) => void;
  onBack: () => void;
}

const ProgramOverviewDetail: React.FC<ProgramOverviewDetailProps> = ({
  overview,
  form,
  onChange,
  onBack,
}) => {
  const context = React.useMemo(
    () => buildProgramOverviewContext(overview),
    [overview],
  );

  return (
    <div className="edit-program-overview-detail">
      <button type="button" className="program-overview-back" onClick={onBack}>
        <ArrowLeft className="back-icon" aria-hidden />
        Back
      </button>
      <h3 className="program-overview-title">
        {`Program Overview: ${overview.name}`}
      </h3>
      <Tabs
        defaultActiveKey={PROGRAM_DETAIL_TABS[0].key}
        id={`edit-program-overview-tabs-${overview.id}`}
        className="edit-program-detail-tabs"
      >
        {PROGRAM_DETAIL_TABS.map((tab) => (
          <Tab eventKey={tab.key} title={tab.title} key={tab.key}>
            {"Component" in tab ? (
              <tab.Component />
            ) : (
              <ProgramOverviewGeneralSettings
                form={form}
                context={context}
                onChange={onChange}
              />
            )}
          </Tab>
        ))}
      </Tabs>
    </div>
  );
};

export default ProgramOverviewDetail;
