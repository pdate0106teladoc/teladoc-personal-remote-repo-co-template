import * as React from "react";
import { useEffect, useState } from "react";
import { Group } from "@/types/search";
import { CustomTable, TableColumn } from "@ucc/common-ui";
import { IconHierarchy } from "@/assets";
import { useNavigate } from "react-router-dom";
import { GRP_DETAIL_PATH, ORG_DETAIL_PATH } from "@/router/routes";
import { SideModal } from "@ucc/common-ui";
import { OrgTree } from "@/components/HierarchyTree/OrgTree";
import useConfigStore from "@/store/configStore";
import { API_ENDPOINTS, ERROR_MESSAGES, ToastType } from "@/constants";
import api from "@/api/apiService";
import { showCustomToast } from "@ucc/common-ui";
import { OrgData } from "@/types/Hierarchy";

interface GroupsTableProps {
  pageSize?: number;
  showPagination: boolean;
  groups: Group[];
  totalRecords?: number;
  page?: number;
  onPageChange?: (page: number) => void;
  onChangeSortParams?: (sortBy: keyof Group | null, sortOrder: boolean, currentFilters?: Record<string, string | string[]>) => void;
}

interface HierarchyPageData {
  data: OrgData[];
}

const GroupsTable: React.FC<GroupsTableProps> = ({
  pageSize,
  showPagination,
  groups,
  totalRecords = 0,
  page = 0,
  onPageChange,
  onChangeSortParams,
}) => {
  const navigate = useNavigate();
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [hierarchyData, setHierarchyData] = useState<OrgData | null>(null);
  const setSearchParams = useConfigStore((state) => state.setSearchParams);
  const setGroupName = useConfigStore((state) => state.setGroupName);
  const setOrgName = useConfigStore((state) => state.setOrg);
  const setGroupId = useConfigStore((state) => state.setGroupId);
  const setGroupShortId = useConfigStore((state) => state.setGroupShortId);
  const setBreadCrumbVisible = useConfigStore(
    (state) => state.setBreadCrumbVisible,
  );
  const userColumns: TableColumn<Group>[] = [
    {
      label: "Group name",
      field: "groupName",
      hasToggleMenu: true,
      width: "25.5%",
      render: (_val, row) =>
        row.groupName ? (
          <a
            href={`${GRP_DETAIL_PATH}/${row.id}`}
            onClick={(e) => {
              if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) {
                return;
              }
              e.preventDefault();
              setGroupName(row.groupName);
              setOrgName({
                orgName: row.organizationName,
                orgId: row.organizationId,
              });
              setGroupId(row.legacyGroupId);
              setGroupShortId(row.groupId);
              setSearchParams(location.search);
              setBreadCrumbVisible(true);
              navigate(`${GRP_DETAIL_PATH}/${row.id}`);
            }}
            onContextMenu={() => {
              setGroupName(row.groupName);
              setOrgName({
                orgName: row.organizationName,
                orgId: row.organizationId,
              });
              setGroupId(row.legacyGroupId);
              setGroupShortId(row.groupId);
              setSearchParams(window.location.search);
              setBreadCrumbVisible(true);
            }}
            onAuxClick={(e) => {
              if ((e as React.MouseEvent<HTMLAnchorElement>).button === 1) {
                setGroupName(row.groupName);
                setOrgName({
                  orgName: row.organizationName,
                  orgId: row.organizationId,
                });
                setGroupId(row.legacyGroupId);
                setGroupShortId(row.groupId);
                setSearchParams(window.location.search);
                setBreadCrumbVisible(true);
              }
            }}
            onMouseDown={(e: React.MouseEvent<HTMLAnchorElement>) => {
              if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) {
                setGroupName(row.groupName);
                setOrgName({
                  orgName: row.organizationName,
                  orgId: row.organizationId,
                });
                setGroupId(row.legacyGroupId);
                setGroupShortId(row.groupId);
                setSearchParams(window.location.search);
                setBreadCrumbVisible(true);
              }
            }}
            className="text-primary"
          >
            {row.groupName}
          </a>
        ) : (
          "-"
        ),
    },
    {
      label: "Legacy group ID",
      field: "legacyGroupId",
      hasToggleMenu: true,
      width: "11.5%",
      render: (_val, row) =>
        row.legacyGroupId ? <div>{row.legacyGroupId}</div> : "-",
    },
    {
      label: "Organization name",
      field: "organizationName",
      hasToggleMenu: true,
      width: "17%",
      render: (_val, row) =>
        row.organizationName ? (
          <a
            href={`${ORG_DETAIL_PATH}/${row.organizationUuid}`}
            onClick={(e) => {
              if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) {
                return;
              }
              e.preventDefault();
              navigate(`${ORG_DETAIL_PATH}/${row.organizationUuid}`);
            }}
            className="text-primary"
          >
            {row.organizationName}
          </a>
        ) : (
          "-"
        ),
    },
    {
      label: "Status",
      field: "status",
      hasToggleMenu: true,
      width: "7%",
      render: (_val, row) => (row.status ? <div>{row.status}</div> : "-"),
    },
    {
      label: "Reg code",
      field: "registrationCode",
      hasToggleMenu: true,
      width: "10%",
      render: (_val, row) =>
        row.registrationCode ? <div>{row.registrationCode}</div> : "-",
    },
    {
      label: "CMC code",
      field: "clientMemberCode",
      hasToggleMenu: true,
      width: "10%",
      render: (_val, row) =>
        row.clientMemberCode ? <div>{row.clientMemberCode}</div> : "-",
    },
    {
      label: "Account name",
      field: "accountName",
      hasToggleMenu: true,
      width: "13%",
      render: (_val, row) =>
        row.accountName ? <div>{row.accountName}</div> : "-",
    },
    {
      label: "Hierarchy",
      field: "hierarchyIcon" as keyof Group,
      hasToggleMenu: false,
      render: (_val, row) => (
        <button
          className="hierarchy-button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedGroup(row);
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
          `${API_ENDPOINTS.groups}/${selectedGroup?.id}${API_ENDPOINTS.hierarchy}`,
        );
        const responseData = response?.data || response || [];
        setHierarchyData(responseData?.[0] );
      } catch {
        setHierarchyData(null);
        showCustomToast({
          type: ToastType.Error,
          title: "Failed",
          message: ERROR_MESSAGES.SOMETHINGS_WRONG,
        });
      }
    };
    if (selectedGroup?.id) {
      fetchHierarchyData();
    }
  }, [selectedGroup?.id]);

  const renderHierarchy = () => {
    if (hierarchyData) {
      return <OrgTree key={hierarchyData.org?.id} data={hierarchyData} showBillingColumn={false} />;
    } else {
      return <div>No hierarchy data available</div>;
    }
  };

  return (
    groups && (
      <>
        <div className="custom-table-wrapper relative w-full">
          <CustomTable
            key={page}
            data={groups}
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
          show={!!selectedGroup}
          onHide={() => setSelectedGroup(null)}
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

export default GroupsTable;
