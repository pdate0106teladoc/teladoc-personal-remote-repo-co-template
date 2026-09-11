import * as React from "react";
import { useMemo, useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { CustomTable, PaginationView, TableColumn } from "@ucc/common-ui";
import RoundedLabel from "@/components/RoundedLabel/RoundedLabel";
import { OpenIcon } from "@/assets";
import { NO_OF_RECORDS_PER_PAGE_INDIVIDUAL } from "@/constants";
import {
  ACTIVE_CLIENT_OVERVIEWS,
  AppliedClientOverviewRow,
  TERMINATED_CLIENT_OVERVIEWS,
} from "./appliedClientOverviewData";
import "@/pages/template/style/AppliedClientOverviews.scss";

type StatusTab = "active" | "terminated";

const columns: TableColumn<AppliedClientOverviewRow>[] = [
  {
    label: "Client Overview",
    field: "name",
    width: "46%",
    render: (_value, row) => (
      <div className="overview-cell">
        <span className="overview-name">{row.name}</span>
        <span className="overview-contract">{`Contract number: ${row.contractNumber}`}</span>
      </div>
    ),
  },
  {
    label: "Status",
    field: "status",
    width: "16%",
    render: (value) => (
      <RoundedLabel
        text={value}
        variant={value === "Active" ? "success" : "grey"}
      />
    ),
  },
  {
    label: "Groups",
    field: "groups",
    width: "14%",
    render: (value) => `${value} groups`,
  },
  {
    label: "Last updated in",
    field: "lastUpdatedIn",
    width: "24%",
    render: (value) => (
      <button type="button" className="entity-link">
        {value}
        <OpenIcon className="entity-link-icon" aria-hidden />
      </button>
    ),
  },
];

const AppliedClientOverviews: React.FC = () => {
  const [statusTab, setStatusTab] = useState<StatusTab>("active");
  const [page, setPage] = useState(0);

  const rows =
    statusTab === "active" ? ACTIVE_CLIENT_OVERVIEWS : TERMINATED_CLIENT_OVERVIEWS;

  const pageRows = useMemo(
    () =>
      rows.slice(
        page * NO_OF_RECORDS_PER_PAGE_INDIVIDUAL,
        page * NO_OF_RECORDS_PER_PAGE_INDIVIDUAL + NO_OF_RECORDS_PER_PAGE_INDIVIDUAL,
      ),
    [page, rows],
  );

  return (
    <div className="applied-client-overviews">
      <Tabs
        activeKey={statusTab}
        onSelect={(key) => {
          setStatusTab((key as StatusTab) || "active");
          setPage(0);
        }}
        id="applied-overview-status-tabs"
        className="status-tabs"
      >
        <Tab eventKey="active" title={`Active (${ACTIVE_CLIENT_OVERVIEWS.length})`} />
        <Tab
          eventKey="terminated"
          title={`Terminated (${TERMINATED_CLIENT_OVERVIEWS.length})`}
        />
      </Tabs>
      <CustomTable
        data={pageRows}
        columns={columns}
        showPagination={false}
      />
      <PaginationView
        currentPage={page}
        rowsPerPage={NO_OF_RECORDS_PER_PAGE_INDIVIDUAL}
        displayTotal={rows.length}
        onPageChange={setPage}
      />
    </div>
  );
};

export default AppliedClientOverviews;
