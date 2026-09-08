import * as React from "react";
import { Tabs, Tab } from "react-bootstrap";
import DisplayRow from "@/components/DisplayRow/DisplayRow";
import { CustomTable, FailSafePage, SidebarRowWrapper, TableColumn } from "@ucc/common-ui";

import { ProductDetailRTE } from "@/types/GrpView";
import "./OpportunityDrawser.scss";

type DisplayRowFormat = "boolean" | "date" | "img" | "link" | "text" | "person";

type TableDataType = ProductDetailRTE;
interface TabContentProps {
  tabs: Array<{
    eventKey: string;
    title: string;
    fields: Array<{ key: string; label: string; lastChild?: boolean }>;
    tabWithBox?: boolean;
    disabled?: boolean;
    tableRequired?: boolean;
    tableData?: TableDataType[];
    tableColumns?: TableColumn<TableDataType>[];
    tableHeader?: string;
  }>;
  data?: Record<string, any> | null;
}

const OpportunityDrawer: React.FC<TabContentProps> = ({ tabs, data }) => {
  const renderContent = (
    fieldsOrder?: Array<{
      key: string;
      label: string;
      lastChild?: boolean;
      format?: DisplayRowFormat;
    }> | null,
  ) => (
    <div className="details-sidebar-content">
      {fieldsOrder?.map((item) => (
        <SidebarRowWrapper key={item.key}>
          <DisplayRow
            label={item.label}
            value={data && data[item.key] ? data[item.key] : "-"}
            lastChild={item.lastChild}
            format={item.format}
          />
        </SidebarRowWrapper>
      ))}
    </div>
  );

  return (
    <div className="tab-container">
      <Tabs id="uncontrolled-tab-example-sidebar">
        {tabs.map((tab) => (
          <Tab eventKey={tab.eventKey} title={tab.title} key={tab.eventKey}>
            {!tab.tabWithBox ? (
              <>
                {renderContent(tab.fields)}
                {tab.tableRequired && (
                  <div className="table-container ">
                    <div className="label">
                      <span>{tab.tableHeader}</span>
                    </div>
                    <CustomTable
                      data={tab.tableData || []}
                      columns={tab.tableColumns || []}
                      showPagination={false}
                    />
                  </div>
                )}
              </>
            ) : (
              <FailSafePage cardType="comingSoon" />
            )}
          </Tab>
        ))}
      </Tabs>
    </div>
  );
};

export default OpportunityDrawer;
