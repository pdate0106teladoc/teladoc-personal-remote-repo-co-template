import * as React from "react";
import { useEffect, useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { FailSafePage, SideModal } from "@ucc/common-ui";
import AppliedClientOverviews from "./AppliedClientOverviews";
import ClientOverviewBilling from "./ClientOverviewBilling";
import ClientOverviewEligibility from "./ClientOverviewEligibility";
import ClientOverviewGeneralSettings from "./ClientOverviewGeneralSettings";
import ClientOverviewMarketing from "./ClientOverviewMarketing";
import GroupGeneralSettings from "./GroupGeneralSettings";
import OrganizationGeneralSettings from "./OrganizationGeneralSettings";
import ProgramOverviewDetail from "./ProgramOverviewDetail";
import ProgramOverviews from "./ProgramOverviews";
import { DETAILS_BY_ID, dashDetail } from "./detailData";
import type { ProgramOverviewSummary } from "./programOverviewData";
import type {
  TemplateDetail,
  TemplateScope,
  TemplateSummary,
} from "./templateTypes";
import "@/pages/template/style/TemplateDetailDrawer.scss";

interface ViewTab {
  key: string;
  title: string;
  fillHeight?: boolean;
  comingSoon?: boolean;
}

const VIEW_TABS: Record<TemplateScope, ViewTab[]> = {
  "client-overview": [
    { key: "general-settings", title: "General settings" },
    { key: "billing", title: "Billing" },
    { key: "marketing", title: "Marketing" },
    { key: "eligibility", title: "Eligibility" },
    {
      key: "program-overviews",
      title: "Program Overviews",
      fillHeight: true,
    },
    {
      key: "applied-client-overviews",
      title: "Applied Client Overviews",
      fillHeight: true,
    },
  ],
  organization: [
    { key: "general-settings", title: "General settings" },
    { key: "billing", title: "Billing", comingSoon: true },
    { key: "marketing", title: "Marketing", comingSoon: true },
    { key: "reporting", title: "Reporting", comingSoon: true },
    { key: "opportunities", title: "Opportunities", comingSoon: true },
    { key: "hierarchy", title: "Hierarchy", comingSoon: true },
    { key: "contact", title: "Contact", comingSoon: true },
    {
      key: "applied-organisation",
      title: "Applied Organisation",
      fillHeight: true,
    },
  ],
  group: [
    { key: "general-settings", title: "General settings" },
    { key: "billing", title: "Billing", comingSoon: true },
    { key: "marketing", title: "Marketing", comingSoon: true },
    { key: "reporting", title: "Reporting", comingSoon: true },
    {
      key: "eligibility-and-claims",
      title: "Eligibility and claims",
      comingSoon: true,
    },
    { key: "products", title: "Products", comingSoon: true },
    { key: "hierarchy", title: "Hierarchy", comingSoon: true },
    { key: "contacts", title: "Contacts", comingSoon: true },
    { key: "applied-group", title: "Applied Group", fillHeight: true },
  ],
};

interface ViewTemplateDrawerProps {
  show: boolean;
  template: TemplateSummary | null;
  scope?: TemplateScope;
  onHide: () => void;
}

const ViewTemplateDrawer: React.FC<ViewTemplateDrawerProps> = ({
  show,
  template,
  scope = "client-overview",
  onHide,
}) => {
  const [selectedOverview, setSelectedOverview] =
    useState<ProgramOverviewSummary | null>(null);
  const detail: TemplateDetail =
    (template && DETAILS_BY_ID[template.id]) || dashDetail();
  const tabs = VIEW_TABS[scope];

  useEffect(() => {
    setSelectedOverview(null);
  }, [show, template?.id, scope]);

  const renderTab = (tab: ViewTab) => {
    if (tab.comingSoon) {
      return <FailSafePage cardType="comingSoon" />;
    }
    if (scope === "organization") {
      if (tab.key === "applied-organisation") {
        return <AppliedClientOverviews variant="organisation" />;
      }
      return <OrganizationGeneralSettings />;
    }
    if (scope === "group") {
      if (tab.key === "applied-group") {
        return <AppliedClientOverviews variant="group" />;
      }
      return <GroupGeneralSettings />;
    }
    if (tab.key === "billing") {
      return <ClientOverviewBilling detail={detail} />;
    }
    if (tab.key === "marketing") {
      return <ClientOverviewMarketing detail={detail} />;
    }
    if (tab.key === "eligibility") {
      return <ClientOverviewEligibility detail={detail} />;
    }
    if (tab.key === "program-overviews") {
      return (
        <ProgramOverviews onSelectProgramOverview={setSelectedOverview} />
      );
    }
    if (tab.key === "applied-client-overviews") {
      return <AppliedClientOverviews />;
    }
    return <ClientOverviewGeneralSettings detail={detail} />;
  };

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
              defaultActiveKey={tabs[0].key}
              id={`${scope}-template-view-tabs-${template.id}`}
              className="template-detail-tabs"
            >
              {tabs.map((tab) => (
                <Tab
                  eventKey={tab.key}
                  title={tab.title}
                  key={tab.key}
                  className={tab.fillHeight ? "detail-pane-fill" : undefined}
                >
                  {renderTab(tab)}
                </Tab>
              ))}
            </Tabs>
          )}
        </div>
      )}
    </SideModal>
  );
};

export default ViewTemplateDrawer;
