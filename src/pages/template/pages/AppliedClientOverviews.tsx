import * as React from "react";
import { useMemo, useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { CustomTable, PaginationView, TableColumn } from "@ucc/common-ui";
import RoundedLabel from "@/components/RoundedLabel/RoundedLabel";
import { OpenIcon } from "@/assets";
import { NO_OF_RECORDS_PER_PAGE_INDIVIDUAL } from "@/constants";
import {
  ACTIVE_CLIENT_OVERVIEWS,
  ACTIVE_ORGANISATIONS,
  AppliedClientOverviewRow,
  TERMINATED_CLIENT_OVERVIEWS,
  TERMINATED_ORGANISATIONS,
} from "./appliedClientOverviewData";
import "@/pages/template/style/AppliedClientOverviews.scss";

export type AppliedOverviewsVariant = "client-overview" | "organisation";

type StatusTab = "active" | "terminated";

interface AppliedClientOverviewsProps {
  variant?: AppliedOverviewsVariant;
}

const clientOverviewColumns: TableColumn<AppliedClientOverviewRow>[] = [
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

const organisationColumns: TableColumn<AppliedClientOverviewRow>[] = [
  {
    label: "Organisation",
    field: "name",
    width: "46%",
    render: (_value, row) => (
      <span className="overview-name">{row.name}</span>
    ),
  },
  clientOverviewColumns[1],
  clientOverviewColumns[2],
  {
    label: "Last updated on",
    field: "lastUpdatedOn",
    width: "24%",
  },
];

const AppliedClientOverviews: React.FC<AppliedClientOverviewsProps> = ({
  variant = "client-overview",
}) => {
  const [statusTab, setStatusTab] = useState<StatusTab>("active");
  const [page, setPage] = useState(0);
  const isOrganisation = variant === "organisation";

  const activeRows = isOrganisation
    ? ACTIVE_ORGANISATIONS
    : ACTIVE_CLIENT_OVERVIEWS;
  const terminatedRows = isOrganisation
    ? TERMINATED_ORGANISATIONS
    : TERMINATED_CLIENT_OVERVIEWS;
  const rows = statusTab === "active" ? activeRows : terminatedRows;
  const columns = isOrganisation ? organisationColumns : clientOverviewColumns;

  const pageRows = useMemo(
    () =>
      rows.slice(
        page * NO_OF_RECORDS_PER_PAGE_INDIVIDUAL,
        page * NO_OF_RECORDS_PER_PAGE_INDIVIDUAL +
          NO_OF_RECORDS_PER_PAGE_INDIVIDUAL,
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
        <Tab eventKey="active" title={`Active (${activeRows.length})`} />
        <Tab
          eventKey="terminated"
          title={`Terminated (${terminatedRows.length})`}
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
