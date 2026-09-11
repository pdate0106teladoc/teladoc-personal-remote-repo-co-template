import * as React from "react";
import { Tab, Tabs } from "react-bootstrap";
import { ArrowLeft } from "@/assets";
import { ReadOnlyProgramSections } from "./TemplateSections";
import ProgramOverviewEngagementCriteria from "./ProgramOverviewEngagementCriteria";
import ProgramOverviewBilling from "./ProgramOverviewBilling";
import ProgramOverviewEligibility from "./ProgramOverviewEligibility";
import ProgramOverviewGeneralSettings from "./ProgramOverviewGeneralSettings";
import ProgramOverviewMarketing from "./ProgramOverviewMarketing";
import {
  buildProgramOverviewBillingSections,
  buildProgramOverviewEligibilitySections,
  buildProgramOverviewEngagementSections,
  buildProgramOverviewGeneralSettingsSections,
  buildProgramOverviewMarketingSections,
} from "./programOverviewData";
import type {
  ProgramOverviewFieldSection,
  ProgramOverviewSummary,
} from "./programOverviewData";
import {
  buildProgramOverviewContext,
  type ProgramOverviewEditField,
  type ProgramOverviewEditForm,
} from "./form";
import "@/pages/template/style/EditProgramOverviewDetail.scss";
import "@/pages/template/style/ProgramOverviewDetail.scss";

const PROGRAM_DETAIL_TABS = [
  { key: "general-settings", title: "General settings" },
  { key: "billing", title: "Billing" },
  { key: "marketing", title: "Marketing" },
  { key: "eligibility", title: "Eligibility" },
  { key: "engagement-criteria", title: "Engagement criteria" },
] as const;

type ProgramOverviewTabKey = (typeof PROGRAM_DETAIL_TABS)[number]["key"];

interface ProgramOverviewDetailBaseProps {
  overview: ProgramOverviewSummary;
  onBack: () => void;
}

interface ProgramOverviewDetailEditProps
  extends ProgramOverviewDetailBaseProps {
  form: ProgramOverviewEditForm;
  onChange: (field: ProgramOverviewEditField, value: string | boolean) => void;
}

type ProgramOverviewDetailProps =
  | ProgramOverviewDetailBaseProps
  | ProgramOverviewDetailEditProps;

const getViewSections = (
  key: ProgramOverviewTabKey,
  overview: ProgramOverviewSummary,
): ProgramOverviewFieldSection[] => {
  switch (key) {
    case "general-settings":
      return buildProgramOverviewGeneralSettingsSections(overview);
    case "billing":
      return buildProgramOverviewBillingSections();
    case "marketing":
      return buildProgramOverviewMarketingSections();
    case "eligibility":
      return buildProgramOverviewEligibilitySections();
    case "engagement-criteria":
      return buildProgramOverviewEngagementSections();
  }
};

const ProgramOverviewDetail: React.FC<ProgramOverviewDetailProps> = (props) => {
  const { overview, onBack } = props;
  const editable = "form" in props;
  const context = React.useMemo(
    () => buildProgramOverviewContext(overview),
    [overview],
  );

  return (
    <div
      className={
        editable
          ? "edit-program-overview-detail"
          : "program-overview-detail"
      }
    >
      <button type="button" className="program-overview-back" onClick={onBack}>
        <ArrowLeft className="back-icon" aria-hidden />
        Back
      </button>
      <h3 className="program-overview-title">
        {editable ? `Program Overview: ${overview.name}` : overview.name}
      </h3>
      <Tabs
        defaultActiveKey={PROGRAM_DETAIL_TABS[0].key}
        id={`${editable ? "edit-" : ""}program-overview-tabs-${overview.id}`}
        className={
          editable ? "edit-program-detail-tabs" : "program-detail-tabs"
        }
      >
        {PROGRAM_DETAIL_TABS.map((tab) => (
          <Tab eventKey={tab.key} title={tab.title} key={tab.key}>
            {!editable ? (
              <ReadOnlyProgramSections
                sections={getViewSections(tab.key, overview)}
              />
            ) : tab.key === "billing" ? (
              <ProgramOverviewBilling
                form={props.form}
                onChange={props.onChange}
              />
            ) : tab.key === "marketing" ? (
              <ProgramOverviewMarketing
                form={props.form}
                onChange={props.onChange}
              />
            ) : tab.key === "eligibility" ? (
              <ProgramOverviewEligibility
                form={props.form}
                onChange={props.onChange}
              />
            ) : tab.key === "engagement-criteria" ? (
              <ProgramOverviewEngagementCriteria
                form={props.form}
                onChange={props.onChange}
              />
            ) : (
              <ProgramOverviewGeneralSettings
                form={props.form}
                context={context}
                onChange={props.onChange}
              />
            )}
          </Tab>
        ))}
      </Tabs>
    </div>
  );
};

export default ProgramOverviewDetail;
