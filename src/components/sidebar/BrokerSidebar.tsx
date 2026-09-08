import React, { useState, useCallback } from "react";
import DisplayRow from "@/components/DisplayRow/DisplayRow";
import { InfoIcon, SidebarRowWrapper } from "@ucc/common-ui";
import { Tabs, Tab, Dropdown } from "react-bootstrap";
import "./BrokerSidebar.scss";
import { BsChevronDown } from "react-icons/bs";


interface TabContentProps {
  tabs: Array<{
    title: string;
    eventKey: string;
    fields?: Array<{ key: string; label: string; lastChild?: boolean }>;
  }>;
  data?: Record<string, any> | null;
}

type DisplayRowFormat = "boolean" | "date" | "img" | "link" | "text" | "person";

const BrokerSidebar: React.FC<TabContentProps> = ({ tabs, data }) => {
  const [dropdownValue, setDropdownValue] = useState<number | null>(null);

  const getFieldData = useCallback((fieldKey: string, dropdownType: string, index: number) => {
    if (!data) return "-";
    if (!dropdownType) return data[fieldKey] ?? "-";
    const section = dropdownType === "location" ? "brokerLocationDetails" : "commissionVariants";
    return data[section]?.[index]?.[fieldKey] ?? "-";
  }, [data]);

  const getDropdownOptions = (tab: any) => {
    const section = tab.eventKey === "locations" ? "brokerLocationDetails" : "commissionVariants";
    if (Array.isArray(data?.[section]) === false) return [];
    return data?.[section]?.map((item: any, idx: number) => ({
      label: item[tab.eventKey === "locations" ? "locationName" : "commissionName"] || `Option ${idx + 1}`,
      value: idx,
    })) || [];
  }

  const renderContent = (
    fieldsOrder: Array<{ key: string; label: string; lastChild?: boolean; format?: DisplayRowFormat }> | null,
    dropdownType?: "location" | "commission",
    dropdownValue?: number | null
  ) => (
    <div className={`details-sidebar-content ${!dropdownType ? "normal-div" : ""}`}>
      {fieldsOrder?.map((item) => (
        <SidebarRowWrapper key={item.key}>
          <DisplayRow
            label={item.label}
            value={getFieldData(item.key, dropdownType ?? "", dropdownValue ?? 0)}
            lastChild={item.lastChild}
            format={item.format}
          />
        </SidebarRowWrapper>
      ))}
    </div>
  );

  const renderTabContent = (tab: any, index: number) => {
    const tabType = tab.eventKey === "locations" ? "location" : "commission";

    return tab.title === "Additional Information" && tab.fields ? (
      <Tab eventKey={tab.title} title={tab.title} key={index}>
        <div className="tab-content-section">
          {renderContent(tab.fields)}
        </div>
      </Tab>
    ) : (
      <Tab eventKey={tab.eventKey} title={tab.title} key={index}>
        <div className="tab-content-section">
          <div className="info-box d-flex flex-row align-items-start gap-2 mb-3">
            <InfoIcon />
            <span className="bold-text">Select a {tab.title.toLowerCase()} to view details</span>
          </div>
          <span className="dropdown-label">{tab.title} </span>
          <Dropdown className="custom-dropdown">
            <Dropdown.Toggle variant="secondary" id="dropdown-basic-button" className="d-flex align-items-center gap-2">
              {dropdownValue === null ? `Select ${tab.title.toLowerCase()} name` : getDropdownOptions(tab).find((option: { label: string; value: number }) => option.value === dropdownValue)?.label}
              <BsChevronDown />
            </Dropdown.Toggle>

            <Dropdown.Menu className="broker-sidebar-dropdown-menu">
              {getDropdownOptions(tab).length === 0 ? (
                <Dropdown.Item disabled>No options available</Dropdown.Item>
              ) : (
                getDropdownOptions(tab)?.map((option: { label: string; value: number }) => (
                  <Dropdown.Item
                    key={option.value}
                    onClick={() => setDropdownValue(option.value)}
                    data-testid={`dropdown-option-${option.value}`}
                  >
                    {option.label}
                  </Dropdown.Item>
                ))
              )}
            </Dropdown.Menu>
          </Dropdown>
          {renderContent(tab.fields, tabType, dropdownValue)}
        </div>
      </Tab>
    );
  };

  return (
    <div className="broker-content-container">
      <Tabs id="uncontrolled-tab-example-sidebar" defaultActiveKey={tabs[0]?.eventKey} className="mb-3">
        {tabs.map(renderTabContent)}
      </Tabs>
    </div>
  );
};

export default BrokerSidebar;
