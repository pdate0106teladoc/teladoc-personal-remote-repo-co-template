import * as React from "react";
import { useEffect, useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { Modal } from "@ucc/common-ui";
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
} from "@/components/template/view";
import type {
  ProgramOverviewSummary,
  TemplateDetail,
  TemplateSummary,
} from "@/components/template/view";
import "./TemplateDetailModal.scss";

interface DetailTabContext {
  detail: TemplateDetail;
  onSelectProgramOverview: (overview: ProgramOverviewSummary) => void;
}

interface DetailTab {
  key: string;
  title: string;
  /** Panes that manage their own scroll area rather than growing the modal. */
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

interface TemplateDetailModalProps {
  show: boolean;
  template: TemplateSummary | null;
  onHide: () => void;
}

const TemplateDetailModal: React.FC<TemplateDetailModalProps> = ({
  show,
  template,
  onHide,
}) => {
  const [selectedOverview, setSelectedOverview] =
    useState<ProgramOverviewSummary | null>(null);
  const detail = (template && DETAILS_BY_ID[template.id]) || dashDetail();

  // Always land on the tab list when the modal opens or switches template.
  useEffect(() => {
    setSelectedOverview(null);
  }, [show, template?.id]);

  return (
    <Modal
      show={show && Boolean(template)}
      onHide={onHide}
      title={template?.name}
      size="xl"
      centered
      dialogClassName="template-detail-modal"
    >
      {template && selectedOverview && (
        <ProgramOverviewDetail
          overview={selectedOverview}
          onBack={() => setSelectedOverview(null)}
        />
      )}
      {template && !selectedOverview && (
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
    </Modal>
  );
};

export default TemplateDetailModal;
