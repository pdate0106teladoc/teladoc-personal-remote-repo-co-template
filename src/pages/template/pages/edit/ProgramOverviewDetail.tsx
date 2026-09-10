import * as React from "react";
import { Tab, Tabs } from "react-bootstrap";
import { ArrowLeft } from "@/assets";
import type { ProgramOverviewSummary } from "@/pages/template/pages/view";
import EngagementCriteria from "./EngagementCriteria";
import ProgramOverviewBilling from "./ProgramOverviewBilling";
import ProgramOverviewEligibility from "./ProgramOverviewEligibility";
import ProgramOverviewGeneralSettings from "./ProgramOverviewGeneralSettings";
import ProgramOverviewMarketing from "./ProgramOverviewMarketing";
import { buildProgramOverviewContext } from "./programOverviewForm";
import type {
  ProgramOverviewEditField,
  ProgramOverviewEditForm,
} from "./programOverviewForm";
import "@/pages/template/style/EditProgramOverviewDetail.scss";

const PROGRAM_DETAIL_TABS = [
  { key: "general-settings", title: "General settings" },
  { key: "billing", title: "Billing" },
  { key: "marketing", title: "Marketing" },
  { key: "eligibility", title: "Eligibility" },
  { key: "engagement-criteria", title: "Engagement criteria" },
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
            {tab.key === "billing" ? (
              <ProgramOverviewBilling form={form} onChange={onChange} />
            ) : tab.key === "marketing" ? (
              <ProgramOverviewMarketing form={form} onChange={onChange} />
            ) : tab.key === "eligibility" ? (
              <ProgramOverviewEligibility form={form} onChange={onChange} />
            ) : tab.key === "engagement-criteria" ? (
              <EngagementCriteria form={form} onChange={onChange} />
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
