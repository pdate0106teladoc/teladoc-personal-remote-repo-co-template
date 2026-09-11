import * as React from "react";
import { useEffect, useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { FailSafePage, SideModal } from "@ucc/common-ui";
import {
  AppliedClientOverviews,
  ClientOverviewBilling,
  ClientOverviewEligibility,
  ClientOverviewGeneralSettings,
  ClientOverviewMarketing,
  GroupGeneralSettings,
  OrganizationGeneralSettings,
  ProgramOverviewDetail,
  ProgramOverviews,
  DETAILS_BY_ID,
  dashDetail,
} from "@/pages/template/pages";
import type {
  ProgramOverviewSummary,
  TemplateDetail,
  TemplateSummary,
} from "@/pages/template/pages";
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
    render: ({ detail }) => <ClientOverviewGeneralSettings detail={detail} />,
  },
  {
    key: "billing",
    title: "Billing",
    render: ({ detail }) => <ClientOverviewBilling detail={detail} />,
  },
  {
    key: "marketing",
    title: "Marketing",
    render: ({ detail }) => <ClientOverviewMarketing detail={detail} />,
  },
  {
    key: "eligibility",
    title: "Eligibility",
    render: ({ detail }) => <ClientOverviewEligibility detail={detail} />,
  },
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

const ORGANIZATION_DETAIL_TABS: DetailTab[] = [
  {
    key: "general-settings",
    title: "General settings",
    render: () => <OrganizationGeneralSettings />,
  },
  ...[
    ["billing", "Billing"],
    ["marketing", "Marketing"],
    ["reporting", "Reporting"],
    ["opportunities", "Opportunities"],
    ["hierarchy", "Hierarchy"],
    ["contact", "Contact"],
  ].map(([key, title]) => ({
    key,
    title,
    render: () => <FailSafePage cardType="comingSoon" />,
  })),
  {
    key: "applied-organisation",
    title: "Applied Organisation",
    fillHeight: true,
    render: () => <AppliedClientOverviews variant="organisation" />,
  },
];

const GROUP_DETAIL_TABS: DetailTab[] = [
  {
    key: "general-settings",
    title: "General settings",
    render: () => <GroupGeneralSettings />,
  },
  ...[
    ["billing", "Billing"],
    ["marketing", "Marketing"],
    ["reporting", "Reporting"],
    ["eligibility-and-claims", "Eligibility and claims"],
    ["products", "Products"],
    ["hierarchy", "Hierarchy"],
    ["contacts", "Contacts"],
  ].map(([key, title]) => ({
    key,
    title,
    render: () => <FailSafePage cardType="comingSoon" />,
  })),
  {
    key: "applied-group",
    title: "Applied Group",
    fillHeight: true,
    render: () => <AppliedClientOverviews variant="group" />,
  },
];

interface TemplateDetailDrawerProps {
  show: boolean;
  template: TemplateSummary | null;
  scope?: "client-overview" | "organization" | "group";
  onHide: () => void;
}

const TemplateDetailDrawer: React.FC<TemplateDetailDrawerProps> = ({
  show,
  template,
  scope = "client-overview",
  onHide,
}) => {
  const [selectedOverview, setSelectedOverview] =
    useState<ProgramOverviewSummary | null>(null);
  const detail = (template && DETAILS_BY_ID[template.id]) || dashDetail();

  // Always land on the tab list when the drawer opens or switches template.
  useEffect(() => {
    setSelectedOverview(null);
  }, [show, template?.id, scope]);

  const detailTabs =
    scope === "organization"
      ? ORGANIZATION_DETAIL_TABS
      : scope === "group"
        ? GROUP_DETAIL_TABS
        : TEMPLATE_DETAIL_TABS;

  return (
    <SideModal
      show={show && Boolean(template)}
      onHide={onHide}
      title={template?.name}
      type="lg"
    >
      {template && (
        <div className="template-detail-drawer">
          {selectedOverview && scope === "client-overview" ? (
            <ProgramOverviewDetail
              overview={selectedOverview}
              onBack={() => setSelectedOverview(null)}
            />
          ) : (
            <Tabs
              defaultActiveKey={detailTabs[0].key}
              id={`${scope}-template-detail-tabs-${template.id}`}
              className="template-detail-tabs"
            >
              {detailTabs.map((tab) => (
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
