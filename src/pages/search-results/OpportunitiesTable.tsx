import * as React from "react";
import { useEffect, useState } from "react";
import { Opportunity, OpportunityDetail } from "@/types/search";
import { CustomTable, TableColumn } from "@ucc/common-ui";
import { SideModal } from "@ucc/common-ui";
import OpportunityDrawer from "@/components/sidebar/OpportunityDrawer";
import { extractDisplayValue } from "@/components/ExtractValue/ExtractDisplayValue";
import api from "../../api/apiService";
import { API_ENDPOINTS, ERROR_MESSAGES, ToastType } from "../../constants";
import { OpportunityDetails } from "../../types/search";
import { showCustomToast } from "@ucc/common-ui";

interface OpportunitiesTableProps {
  pageSize?: number;
  showPagination: boolean;
  opportunities: Opportunity[];
  totalRecords?: number;
  page?: number;
  onPageChange?: (page: number) => void;
  searchPage?: boolean;
  oppIdToOpen?: string;
  onModalClose?: () => void;
  onChangeSortParams?: (
    sortBy: keyof Opportunity | null,
    sortOrder: boolean,
    currentFilters?: Record<string, string | string[]>,
  ) => void;
}

const fieldsOrderGeneralInformation = [
  { key: "name", label: "Opportunity name", lastChild: true },
  { key: "accountName", label: "Account name", lastChild: true },
  { key: "accountGuid", label: "Account GUID", lastChild: true },
  { key: "opportunityGuid", label: "Opportunity GUID", lastChild: true },
  {
    key: "earlyImplementation",
    label: "Early Implementation",
    lastChild: true,
  },
  { key: "stage", label: "Stage", lastChild: true },
  { key: "type", label: "Type", lastChild: true },
  { key: "subType", label: "Sub-type", lastChild: true },
  { key: "subTypeDetail", label: "Sub-type detail", lastChild: true },
  { key: "businessRegion", label: "Business region", lastChild: true },
  { key: "gcrmContractPath", label: "GCRM contract path", lastChild: true },
  {
    key: "gcrmContractAccount",
    label: "GCRM contracting account",
    lastChild: true,
  },
  { key: "lineOfBusiness", label: "Line of business", lastChild: true },
  {
    key: "revenueEffectiveDate",
    label: "Revenue effective date",
    lastChild: true,
    format: "date",
  },
  { key: "closeDate", label: "Close date", lastChild: true, format: "date" },
  { key: "livesCount", label: "Number of lives", lastChild: true },
  { key: "populationType", label: "Population type", lastChild: true },
  { key: "requestCimFlag", label: "Request CIM flag", lastChild: true },
  { key: "opportunityUrl", label: "Opportunity URL", lastChild: true, format: "link" },
];

const fieldsOrderProductAndPricing = [
  { key: "feeType", label: "Fee Type", lastChild: true },
  { key: "startDate", label: "Start Date", lastChild: true },
  {
    key: "currentMembershipFee",
    label: "Current Membership Fee",
    lastChild: true,
  },
  { key: "totalVisitFee", label: "Total Visit Fee", lastChild: true },
  { key: "productRollup", label: "Product Rollup", lastChild: true },
  { key: "bundleType", label: "Bundle Type", lastChild: true },
];
export const tabData = [
  {
    eventKey: "general-information",
    title: "General Information",
    fields: fieldsOrderGeneralInformation,
    tabWithBox: false,
    disabled: false,
  },
  {
    eventKey: "product-n-pricing",
    title: "Product & Pricing",
    fields: fieldsOrderProductAndPricing,
    tabWithBox: true,
    disabled: true,
  },
];

const OpportunitiesTable: React.FC<OpportunitiesTableProps> = ({
  pageSize,
  showPagination,
  opportunities,
  totalRecords = 0,
  page = 0,
  onPageChange = () => { },
  searchPage = true,
  oppIdToOpen,
  onModalClose = () => { },
  onChangeSortParams,
}) => {
  const [showId, setShowId] = useState<string | null>(null);
  const [modalData, setModalData] = useState<OpportunityDetail | null>(null);

  const fetchOpportunityDetails = async (guid: string) => {
    try {
      const response = await api.get<OpportunityDetails>(
        `${API_ENDPOINTS.opportunity}/${guid}`,
      );
      setModalData(response?.data || response);
    } catch {
      showCustomToast({
        type: ToastType.Error,
        title: "Failed",
        message: ERROR_MESSAGES.SOMETHINGS_WRONG,
      });
    }
  };

  useEffect(() => {
    if (oppIdToOpen) {
      setShowId(oppIdToOpen);
      fetchOpportunityDetails(oppIdToOpen);
    }
  }, [oppIdToOpen]);

  const userColumns: TableColumn<Opportunity>[] = [
    {
      label: "Opportunity name and GUID",
      field: "opportunityName",
      hasToggleMenu: true,
      render: (_val, row) =>
        row.opportunityName ? (
          <div>
            <div className="text-primary">
              <a
                href=""
                className="text-primary"
                onClick={(e) => {
                  e.preventDefault();
                  setShowId(row.opportunityGuid);
                  fetchOpportunityDetails(row.id);
                }}
              >
                {row.opportunityName}
              </a>
            </div>
            <div>{row.opportunityGuid || "-"}</div>
          </div>
        ) : (
          "-"
        ),
      width: "26%",
    },
    {
      label: "Account name and GUID",
      field: "accountName",
      hasToggleMenu: true,
      render: (_val, row) =>
        row.accountName ? (
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div>{row.accountName}</div>
            <div>{row.accountGuid}</div>
          </div>
        ) : (
          "-"
        ),
      width: "21%",
    },
    {
      label: "Contract path",
      field: "contractPath",
      hasToggleMenu: true,
      width: "11%",
      render: (_val, row) =>
        row.contractPath ? <div>{row.contractPath}</div> : "-",
    },
    {
      label: "Contracting account",
      field: "contractingAccount",
      hasToggleMenu: true,
      width: "18%",
      render: (_val, row) =>
        row.contractingAccount ? <div>{row.contractingAccount}</div> : "-",
    },
    {
      label: "Rev effective date",
      field: "revenueEffectiveDate",
      hasToggleMenu: true,
      width: "12%",
      render: (_val, row) => (
        <div>{extractDisplayValue(row.revenueEffectiveDate, "date").jsx}</div>
      ),
    },
    {
      label: "End date",
      field: "closeDate",
      hasToggleMenu: true,
      width: "12%",
      render: (_val, row) => (
        <div>{extractDisplayValue(row.closeDate, "date").jsx}</div>
      ),
    },
    {
      label: "Type",
      field: "type",
      hasToggleMenu: true,
      width: "12%",
      render: (_val, row) => (row.type ? <div>{row.type}</div> : "-"),
    },
  ];

  const userColumnsForOrg = userColumns.filter(
    (col) => col.field != "accountName",
  );

  const userColumnsForSearch = userColumns.filter(
    (col) => col.field != "closeDate",
  );

  return (
    opportunities && (
      <>
        <div className="custom-table-wrapper relative w-full">
          <CustomTable
            key={page}
            data={opportunities}
            columns={searchPage ? userColumnsForSearch : userColumnsForOrg}
            rowsPerPage={pageSize}
            showPagination={showPagination}
            totalRecords={totalRecords}
            page={page}
            onPageChange={onPageChange}
            onChangeSortParams={onChangeSortParams}
          />
        </div>
        <SideModal
          show={!!modalData && showId !== null}
          title={modalData?.name ?? ""}
          onHide={() => {
            setShowId(null);
            setModalData(null);
            onModalClose(); // optional callback to clean up URL
          }}
        >
          <OpportunityDrawer tabs={tabData} data={modalData} />
        </SideModal>
      </>
    )
  );
};

export default OpportunitiesTable;
