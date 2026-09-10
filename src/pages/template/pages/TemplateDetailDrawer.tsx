import * as React from "react";
import { useEffect, useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { SideModal } from "@ucc/common-ui";
import {
  AppliedClientOverviews,
  Billing,
  Eligibility,
  GeneralSettings,
  Marketing,
  ProgramOverviewDetail,
  ProgramOverviews,
  DETAILS_BY_ID,
  dashDetail,
} from "@/pages/template/pages/view";
import type {
  ProgramOverviewSummary,
  TemplateDetail,
  TemplateSummary,
} from "@/pages/template/pages/view";
import "@/pages/template/style/TemplateDetailDrawer.scss";

interface DetailTabContext {
  detail: TemplateDetail;
  onSelectProgramOverview: (overview: ProgramOverviewSummary) => void;
}

interface DetailTab {
  key: string;
  title: string;
  /** Panes that manage their own scroll area rather than growing the drawer. */
  fillHeight?: boolean;
  render: (context: DetailTabContext) => React.ReactNode;
}

const TEMPLATE_DETAIL_TABS: DetailTab[] = [
  {
    key: "general-settings",
    title: "General settings",
    render: ({ detail }) => <GeneralSettings detail={detail} />,
  },
  { key: "billing", title: "Billing", render: () => <Billing /> },
  { key: "marketing", title: "Marketing", render: () => <Marketing /> },
  { key: "eligibility", title: "Eligibility", render: () => <Eligibility /> },
  {
    key: "program-overviews",
    title: "Program Overviews",
    fillHeight: true,
    render: ({ onSelectProgramOverview }) => (
      <ProgramOverviews onSelectProgramOverview={onSelectProgramOverview} />
    ),
  },
  {
    key: "applied-client-overviews",
    title: "Applied Client Overviews",
    fillHeight: true,
    render: () => <AppliedClientOverviews />,
  },
];

interface TemplateDetailDrawerProps {
  show: boolean;
  template: TemplateSummary | null;
  onHide: () => void;
}

const TemplateDetailDrawer: React.FC<TemplateDetailDrawerProps> = ({
  show,
  template,
  onHide,
}) => {
  const [selectedOverview, setSelectedOverview] =
    useState<ProgramOverviewSummary | null>(null);
  const detail = (template && DETAILS_BY_ID[template.id]) || dashDetail();

  // Always land on the tab list when the drawer opens or switches template.
  useEffect(() => {
    setSelectedOverview(null);
  }, [show, template?.id]);

  return (
    <SideModal
      show={show && Boolean(template)}
      onHide={onHide}
      title={template?.name}
      type="lg"
    >
      {template && (
        <div className="template-detail-drawer">
          {selectedOverview ? (
            <ProgramOverviewDetail
              overview={selectedOverview}
              onBack={() => setSelectedOverview(null)}
            />
          ) : (
            <Tabs
              defaultActiveKey={TEMPLATE_DETAIL_TABS[0].key}
              id={`template-detail-tabs-${template.id}`}
              className="template-detail-tabs"
            >
              {TEMPLATE_DETAIL_TABS.map((tab) => (
                <Tab
                  eventKey={tab.key}
                  title={tab.title}
                  key={tab.key}
                  className={tab.fillHeight ? "detail-pane-fill" : undefined}
                >
                  {tab.render({
                    detail,
                    onSelectProgramOverview: setSelectedOverview,
                  })}
                </Tab>
              ))}
            </Tabs>
          )}
        </div>
      )}
    </SideModal>
  );
};

export default TemplateDetailDrawer;
