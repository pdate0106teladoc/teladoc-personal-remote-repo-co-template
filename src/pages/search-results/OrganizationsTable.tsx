import * as React from "react";
import { useEffect, useState } from "react";
import { Organization } from "@/types/search";
import { CustomTable, TableColumn } from "@ucc/common-ui";
import { IconHierarchy } from "@/assets";
import { useNavigate } from "react-router-dom";
import { ORG_DETAIL_PATH } from "@/router/routes";
import { SideModal } from "@ucc/common-ui";
import useConfigStore from "@/store/configStore";
import { OrgTree } from "@/components/HierarchyTree/OrgTree";
import api from "@/api/apiService";
import { API_ENDPOINTS, ERROR_MESSAGES, ToastType } from "@/constants";
import { showCustomToast } from "@ucc/common-ui";
import { OrgData } from "@/types/Hierarchy";

interface OrganizationsTableProps {
  pageSize?: number;
  showPagination: boolean;
  organizations: Organization[];
  totalRecords?: number;
  page?: number;
  onPageChange?: (page: number) => void;
  onChangeSortParams?: (
    sortBy: keyof Organization | null,
    sortOrder: boolean,
    currentFilters?: Record<string, string | string[]>,
  ) => void;
}

interface HierarchyPageData {
  data: OrgData[];
}

const OrganizationsTable: React.FC<OrganizationsTableProps> = ({
  pageSize,
  showPagination,
  organizations,
  totalRecords = 0,
  page = 0,
  onPageChange = () => { },
  onChangeSortParams,
}) => {
  const navigate = useNavigate();
  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);
  const [hierarchyData, setHierarchyData] = useState<OrgData | null>(null);
  const setOrgName = useConfigStore((state) => state.setOrg);
  const setSearchParams = useConfigStore((state) => state.setSearchParams);
  const setBreadCrumbVisible = useConfigStore(
    (state) => state.setBreadCrumbVisible,
  );

  const userColumns: TableColumn<Organization>[] = [
    {
      label: "Organization name",
      field: "organizationName",
      hasToggleMenu: true,
      width: "26%",
      render: (_val, row) =>
        row.organizationName ? (
          <a
            href={`${ORG_DETAIL_PATH}/${row.id}`}
            className="text-primary ellipsis-cell"
            onClick={(e) => {
              if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) {
                return;
              }
              setOrgName({
                orgName: row.organizationName,
                orgId: row.organizationId,
              });
              setSearchParams(location.search);
              setBreadCrumbVisible(true);
              e.preventDefault();
              navigate(`${ORG_DETAIL_PATH}/${row.id}`);
            }}
            onContextMenu={() => {
              setOrgName({
                orgName: row.organizationName,
                orgId: row.organizationId,
              });
              setSearchParams(location.search);
              setBreadCrumbVisible(true);
            }}
            onAuxClick={() => {
              setOrgName({
                orgName: row.organizationName,
                orgId: row.organizationId,
              });
              setSearchParams(location.search);
              setBreadCrumbVisible(true);
            }}
            onMouseDown={(e: React.MouseEvent<HTMLAnchorElement>) => {
              if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) {
                setOrgName({
                  orgName: row.organizationName,
                  orgId: row.organizationId,
                });
                setSearchParams(location.search);
                setBreadCrumbVisible(true);
              }
            }}
          >
            {row.organizationName}
          </a>
        ) : (
          "-"
        ),
    },
    {
      label: "Organization ID",
      field: "organizationId",
      hasToggleMenu: true,
      width: "11%",
    },
    {
      label: "Account name",
      field: "accountName",
      hasToggleMenu: true,
      width: "17%",
    },
    {
      label: "Account GUID",
      field: "accountGuid",
      hasToggleMenu: true,
      width: "24%",
    },
    {
      label: "Billing org",
      field: "billingOrg",
      hasToggleMenu: true,
      width: "17%",
      render: (_val, row) =>
        row.billingOrg ? (
          <a
            href={`${ORG_DETAIL_PATH}/${row.billingOrgId}`}
            onClick={(e) => {
              if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) {
                return;
              }
              e.preventDefault();
              navigate(`${ORG_DETAIL_PATH}/${row.billingOrgId}`);
            }}
            className="text-primary ellipsis-cell"
          >
            {row.billingOrg}
          </a>
        ) : (
          "-"
        ),
    },
    {
      label: "Hierarchy",
      field: "hierarchyIcon" as keyof Organization,
      hasToggleMenu: false,
      cellStyle: () => "text-center",
      render: (_val, row) => (
        <button
          className="hierarchy-button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedOrganization(row);
          }}
          aria-label="View hierarchy"
        >
          <span className="hierarchy-icon">
            <IconHierarchy />
          </span>
        </button>
      ),
      width: "5%",
    },
  ];

  useEffect(() => {
    const fetchHierarchyData = async () => {
      try {
        const response: HierarchyPageData = await api.get(
          `${API_ENDPOINTS.organization}/${selectedOrganization?.id}${API_ENDPOINTS.hierarchy}`,
        );
        const responseData = response?.data || response || [];
        setHierarchyData(responseData[0]);
      } catch {
        setHierarchyData(null);
        showCustomToast({
          type: ToastType.Error,
          title: "Failed",
          message: ERROR_MESSAGES.SOMETHINGS_WRONG,
        });
      }
    };
    if (selectedOrganization?.id) {
      fetchHierarchyData();
    }
  }, [selectedOrganization?.id]);

  const renderHierarchy = () => {
    if (hierarchyData) {
      return <OrgTree key={hierarchyData.org?.id} data={hierarchyData} showBillingColumn={false} />;
    }
    return <div>No hierarchy data available</div>;
  };

  // if (loading) return <Loader text="Loading..." />;
  return (
    organizations && (
      <>
        <div className="custom-table-wrapper relative w-full">
          <CustomTable
            key={page}
            data={organizations}
            columns={userColumns}
            rowsPerPage={pageSize}
            showPagination={showPagination}
            totalRecords={totalRecords}
            page={page}
            onPageChange={onPageChange}
            onChangeSortParams={onChangeSortParams}
          />
        </div>
        <SideModal
          show={!!selectedOrganization}
          onHide={() => setSelectedOrganization(null)}
          title="Hierarchy"
        >
          <div className="hierarchy-content">
            <div className="hierarchy-section">{renderHierarchy()}</div>
          </div>
        </SideModal>
      </>
    )
  );
};

export default OrganizationsTable;
