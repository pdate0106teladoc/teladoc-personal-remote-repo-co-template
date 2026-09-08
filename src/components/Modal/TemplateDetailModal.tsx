import * as React from "react";
import { Tab, Tabs } from "react-bootstrap";
import { Modal } from "@ucc/common-ui";
import {
  AppliedClientOverviews,
  Billing,
  Eligibility,
  GeneralSettings,
  Marketing,
  ProgramOverviews,
  DETAILS_BY_ID,
  dashDetail,
} from "@/components/template/view";
import type { TemplateSummary } from "@/components/template/view";
import "./TemplateDetailModal.scss";

const TEMPLATE_DETAIL_TABS = [
  { key: "general-settings", title: "General settings" },
  { key: "billing", title: "Billing", Component: Billing },
  { key: "marketing", title: "Marketing", Component: Marketing },
  { key: "eligibility", title: "Eligibility", Component: Eligibility },
  { key: "program-overviews", title: "Program Overviews", Component: ProgramOverviews },
  {
    key: "applied-client-overviews",
    title: "Applied Client Overviews",
    Component: AppliedClientOverviews,
  },
] as const;

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
  const detail = (template && DETAILS_BY_ID[template.id]) || dashDetail();

  return (
    <Modal
      show={show && Boolean(template)}
      onHide={onHide}
      title={template?.name}
      size="xl"
      centered
      dialogClassName="template-detail-modal"
    >
      {template && (
        <Tabs
          defaultActiveKey={TEMPLATE_DETAIL_TABS[0].key}
          id={`template-detail-tabs-${template.id}`}
          className="template-detail-tabs"
        >
          {TEMPLATE_DETAIL_TABS.map((tab) => (
            <Tab eventKey={tab.key} title={tab.title} key={tab.key}>
              {"Component" in tab ? <tab.Component /> : <GeneralSettings detail={detail} />}
            </Tab>
          ))}
        </Tabs>
      )}
    </Modal>
  );
};

export default TemplateDetailModal;
