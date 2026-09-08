import React from "react";
import { Tabs, Tab } from "react-bootstrap";
import RenderAllSections from "@/components/RenderAllSection/RenderAllSection";
import AccountRltnCard from "@/components/Cards/AccountRltnCard";
import ReportingDetails from "@/components/ReportingPage/ReportingDetails";
import type { AllFieldsPageData, AllFieldsTabData } from "./allFieldsRegistry";

interface AllFieldsViewProps {
  page?: AllFieldsPageData;
}

const AllFieldsTabContent: React.FC<{ tab: AllFieldsTabData }> = ({ tab }) => {
  if (tab.accountRelationships) {
    return <AccountRltnCard data={tab.accountRelationships} mode="view" />;
  }

  // RenderAllSections walks the object directly, so never hand it undefined.
  return <RenderAllSections data={(tab.sectionData ?? {}) as any} mode="view" />;
};

const AllFieldsView: React.FC<AllFieldsViewProps> = ({ page }) => {
  if (!page) {
    return (
      <div className="config-review__content--empty">
        <p>No field data available for this page.</p>
      </div>
    );
  }

  // Reporting owns its own tab layout (one tab per report), so it renders unwrapped.
  if (page.reporting) {
    return (
      <ReportingDetails
        data={page.reporting.data}
        isGroup={page.reporting.isGroup}
        mode="view"
      />
    );
  }

  if (page.tabs.length === 0) {
    return (
      <div className="config-review__content--empty">
        <p>No field data available for this page.</p>
      </div>
    );
  }

  return (
    <Tabs
      id="review-all-fields-tabs"
      defaultActiveKey={page.tabs[0]?.tabName}
      key={page.pageKey}
    >
      {page.tabs.map((tab) => (
        <Tab key={tab.tabName} eventKey={tab.tabName} title={tab.tabName}>
          <div className="config-review__tab-content">
            <AllFieldsTabContent tab={tab} />
          </div>
        </Tab>
      ))}
    </Tabs>
  );
};

export default AllFieldsView;
