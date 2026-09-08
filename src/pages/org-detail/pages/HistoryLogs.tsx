import { TimerIcon } from "@/assets";
import { API_ENDPOINTS, NO_OF_RECORDS_PER_PAGE_INDIVIDUAL, SERVICE_ACCOUNT } from "@/constants";
import {
  ClientConfigHistoryItem,
  ClientConfigHistoryResponse,
  Opportunity,
  OrgHistory,
} from "@/types/edit";
import {
  getSafeString,
  formatUTCtoDateOnly,
  downloadBase64File,
} from "@/utils";
import { extractDisplayValue } from "@/components/ExtractValue/ExtractDisplayValue";
import { ShapeIcon } from "@/assets";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import {
  Button,
  CustomTable,
  FilterButton,
  FilteredByBar,
  Loader,
  SideModal,
  TableColumn,
  showCustomToast,
  ToastType,
} from "@ucc/common-ui";
import {
  useHistoryFilterStore,
  type HistoryFilters,
} from "@/store/useHistoryFilterStore";
import HistoryLogsFilterSidebar from "@/components/sidebar/HistoryLogsFilterSidebar";
import CompareRestoreSidebar from "@/components/sidebar/CompareRestoreSidebar";
import api from "@/api/apiService";
import { ERROR_MESSAGES } from "@/constants";
import { useLocation, useParams } from "react-router-dom";
import {
  ChangeResponse,
  transformChangesToSections,
} from "@/data/fieldLabelRegistry";
import { GRP_DETAIL_PATH } from "@/router/routes";
import TaskDetailSidebar from "@/components/sidebar/TaskDetailSidebar";
import OpportunityDrawer from "@/components/sidebar/OpportunityDrawer";
import { tabData } from "@/pages/search-results/OpportunitiesTable";
import { OpportunityDetail, OpportunityDetails } from "@/types/search";

/** Same filter + sort query shape as the history list API (`fetchHistory`). */
function appendHistoryFilterSortParams(
  params: URLSearchParams,
  filters: HistoryFilters,
  sortBy: string,
  sortOrder: string,
) {
  if (sortBy.length > 0) {
    params.append("sortBy", sortBy);
    params.append("sortDir", sortOrder);
  }
  if (filters.fromEffectiveDateRange)
    params.append("versionFrom", filters.fromEffectiveDateRange);
  if (filters.toEffectiveDateRange)
    params.append("versionTo", filters.toEffectiveDateRange);
  if (filters.fromWorkflowStartDate)
    params.append("workflowStartFrom", filters.fromWorkflowStartDate);
  if (filters.toWorkflowStartDate)
    params.append("workflowStartTo", filters.toWorkflowStartDate);
  if (filters.typeOfEdit.length > 0)
    params.append("typeOfEdit", filters.typeOfEdit.join(","));
  const workfrontIds = Object.keys(filters.workflowId);
  if (workfrontIds.length > 0)
    params.append("workfrontId", workfrontIds.join(","));
  const opportunityIds = Object.keys(filters.opportunityId);
  if (opportunityIds.length > 0)
    params.append("opportunityId", opportunityIds.join(","));
  const changeRequestIds = Object.keys(filters.changeRequest);
  if (changeRequestIds.length > 0)
    params.append("changeRequestId", changeRequestIds.join(","));
  const updatedByIds = Object.keys(filters.updatedBy);
  if (updatedByIds.length > 0)
    params.append("updatedBy", updatedByIds.join(","));
}

function mapHistoryApiItemToRow(item: ClientConfigHistoryItem): OrgHistory {
  return {
    versionTimestamp: item.versionTimestamp ?? "",
    typeOfEdit: item.typeOfEdit ?? [],
    workfrontId: item.workfrontId ?? "",
    opportunity: item.opportunity ?? [],
    workflowStartDate: item.workflowStartDate ?? "",
    changeRequest: item.changeRequestId ?? item.changeRequest ?? "",
    updatedBy: item.updatedBy ?? "",
    changeSource: item.changeSource,
    versionMongoId: item.versionMongoId,
    versionId: item.versionId,
    restoreVersionId: item.restoreVersionId ?? "", // This will be set when user clicks "Compare & restore" and we know which version they want to restore to
    draftId: item.draftId ?? ""
  };
}

const HistoryLogs = () => {
  const taskUrl = import.meta.env.VITE_TASK_URL;
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isGroup = location.pathname.startsWith(GRP_DETAIL_PATH);
  const entityApiType = isGroup ? "GROUP" : "ORGANIZATION";

  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<OrgHistory[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<OrgHistory | null>(null);
  const [orgVersion, setOrgVersion] = useState<string>("");

  const [sortBy, setSortBy] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("asc");
  const [selectedVersionId, setSelectedVersionId] = useState<string>("");
  const [updatedBy, setUpdatedBy] = useState<string>("");
  const [modalData, setModalData] = useState<OpportunityDetail | null>(null);
  const [showId, setShowId] = useState<string | null>(null);
  const [restoreVersion, setRestoreVersion] = useState<string | null>(null);

  const filters = useHistoryFilterStore((s) => s.filters);
  const { filterApplied, filteredAppliedKeys } = useHistoryFilterStore(
    (s) => s.applied,
  );
  const clearFilters = useHistoryFilterStore((s) => s.clear);

  useEffect(() => {
    return () => {
      clearFilters();
    };
  }, []);

  useLayoutEffect(() => {
    setPage(0);
  }, [filters]);
  const clearRef = useRef<() => void>(null);

  const handleSortChange = useCallback(
    (sortKey: keyof OrgHistory | null, sortAsc: boolean) => {
      setSortBy(sortKey ? String(sortKey) : "");
      setSortOrder(sortAsc ? "asc" : "desc");
      setPage(0);
    },
    [],
  );

  const handleClearAll = useCallback(() => {
    clearRef.current?.();
    setPage(0);
  }, []);

  const pageSize = NO_OF_RECORDS_PER_PAGE_INDIVIDUAL;
  const prevIdRef = useRef<string | undefined>(id);
  if (prevIdRef.current !== id) {
    prevIdRef.current = id;
    if (page !== 0) {
      setPage(0);
    }
  }

  const fetchHistory = useCallback(
    async (signal: AbortSignal) => {
      if (!id) {
        setRows([]);
        setTotalRecords(0);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("page", String(page));
        params.append("pageSize", String(pageSize));
        appendHistoryFilterSortParams(params, filters, sortBy, sortOrder);
        const url = `${taskUrl}client-configurations/${entityApiType}/${encodeURIComponent(id)}/history?${params.toString()}`;
        const res = await api.get<ClientConfigHistoryResponse>(url, undefined, {
          signal,
        });
        if (signal.aborted) return;
        setRows((res.data ?? []).map(mapHistoryApiItemToRow));
        setTotalRecords(res.total ?? 0);
      } catch (err) {
        if (
          (err as { name?: string })?.name === "AbortError" ||
          (err as { name?: string })?.name === "CanceledError"
        )
          return;
        showCustomToast({
          type: ToastType.Error,
          title: "Failed",
          message: (closeToast: () => void) => (
                <div>
                  <div>{ERROR_MESSAGES.AUTO_SAVE_RETRY_OR_SERVICE_DESK}</div>
                  <button
                    type="button"
                    className="text-primary ellipsis-cell toast-link"
                    onClick={() => {
                      const controller = new AbortController();
                      void fetchHistory(controller.signal);
                      closeToast();
                    }}
                  >
                    Try Again
                  </button>
                </div>
              ),
        });
        setRows([]);
        setTotalRecords(0);
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    },
    [id, entityApiType, page, pageSize, sortBy, sortOrder, taskUrl, filters],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchHistory(controller.signal);
    return () => controller.abort();
  }, [fetchHistory]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const history_logs: TableColumn<OrgHistory>[] = [
    {
      label: "Version",
      field: "versionTimestamp",
      headerClassName: "custom-header",
      hasToggleMenu: false,
      render: (val: string, row) => (
        <div
          className="render-cell-style text-link-none cursor-pointer"
          onClick={() => {
            setOrgVersion(val);
            setSelectedVersionId(row.versionId);
            setRestoreVersion(row.restoreVersionId ?? null);
            setUpdatedBy(row?.updatedBy);
            setShowModal(true);
          }}
        >
          {formatUTCtoDateOnly(val, true, true)}
        </div>
      ),
    },
    {
      label: "Type of edit",
      field: "typeOfEdit",

      headerClassName: "custom-header",
      render: (val: string[]) => (
        <div className="render-cell-style">
          {Array.isArray(val)
            ? getSafeString(val.join(";"))
            : getSafeString(String(val))}
        </div>
      ),
    },
    {
      label: "Workfront link",
      field: "workfrontId",
      headerClassName: "custom-header",
      render: (val) => {
        const hasWorkfront = val != null && String(val).trim() !== "";
        return (
          <div className="render-cell-style workfrontid ">
            {!hasWorkfront && getSafeString(val)}
            {hasWorkfront ? (
              <>
                <a href="/">{getSafeString(val)}</a>
                <ShapeIcon />
              </>
            ) : null}
          </div>
        );
      },
    },
    {
      label: "Opportunity ID",
      field: "opportunity",

      headerClassName: "custom-header",
      render: (val) => {
        const opportunities = val as Opportunity[];
        const hasMultiple = opportunities.length > 1;

        const content = (
          <div
            className="render-cell-style text-link-none cursor-pointer"
            onClick={() => {
              setShowId(opportunities[0]?.id ?? null);
            }}
          >
            {opportunities.length > 1
              ? `${opportunities[0].opportunityGuid};...`
              : (opportunities[0]?.opportunityGuid ?? "")}
          </div>
        );

        return (
          <>
            {hasMultiple ? (
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id={`opportunity-tooltip-${opportunities[0]?.id}`}>
                    <div>
                      <br />
                      {opportunities.map((opp, idx) => (
                        <div key={idx}>{opp.opportunityGuid}</div>
                      ))}
                    </div>
                  </Tooltip>
                }
              >
                {content}
              </OverlayTrigger>
            ) : (
              content
            )}
            {opportunities.length === 0 && <div>-</div>}
          </>
        );
      },
    },
    {
      label: "Workflow start date",
      field: "workflowStartDate",
      headerClassName: "custom-header",
      hasToggleMenu: false,
      render: (val) => (
        <div className="render-cell-style">
          {val instanceof Date
            ? formatUTCtoDateOnly(val?.toISOString())?.toString()
            : formatUTCtoDateOnly(String(val))?.toString()}
        </div>
      ),
    },
    {
      label: "Change request",
      field: "changeRequest",

      headerClassName: "custom-header",
      render: (val) => (
        <div className="render-cell-style">{getSafeString(val)}</div>
      ),
    },

    {
      label: "Updated by",
      field: "updatedBy",
      headerClassName: "custom-header",
      render: (_val, row) => (
        <div className="render-cell-style">
          {extractDisplayValue(row.updatedBy, "person").jsx}
        </div>
      ),
    },
  ];

  const handleDownload = async (taskId: string, draftId: string) => {
    try {
      setLoading(true);
      let body = {};
      if (draftId) {
        const diffRes: any = await api.get(
          `${taskUrl}${API_ENDPOINTS.diffLibrary}?draftId=${draftId}&entityType=${entityApiType}`,
        );
        const changedFieldsData: ChangeResponse = diffRes?.data ?? diffRes;
        const { sections, arrayChangeSections } =
          transformChangesToSections(changedFieldsData);
        body = { changedFields: sections, changeArrays: arrayChangeSections };
      }
      const url = `${taskUrl}client-configurations/tasks/${taskId}/type/history/download`;
      const response: any = await api.post(url, body);
      const responseData = response?.data || response;
      downloadBase64File(responseData.filename, responseData.content);
    } catch {
      showCustomToast({
        type: ToastType.Error,
        title: "Failed",
        message: ERROR_MESSAGES.SOMETHINGS_WRONG,
      });
    } finally {
      setLoading(false);
    }
  };

  const latestVersionTimestamp = rows.reduce<string>(
    (latest, row) =>
      row.versionTimestamp > latest ? row.versionTimestamp : latest,
    "",
  );

  function actions(row: any) {
    const isLatestVersion = row.versionTimestamp === latestVersionTimestamp;
    return [
      {
        label: "View details",
        onClick: () => {
          setOrgVersion(row.versionTimestamp);
          setSelectedVersionId(row.versionId);
          setRestoreVersion(row.restoreVersionId ?? null);
          setUpdatedBy(row?.updatedBy)
          setShowModal(true);
        },
      },
      {
        label: "Compare & restore",
        disabled: (isLatestVersion || row?.updatedBy === SERVICE_ACCOUNT),
        onClick: () => {
          setSelectedRow(row);
          setShowCompareModal(true);
        },
      },
      {
        label: "Download version",
        onClick: () => {
          handleDownload(row?.versionId, row?.draftId);
        },
      },
    ];
  }

  useEffect(() => {
    if (showId) {
      fetchOpportunityDetails(showId);
    }
  }, [showId]);

  if (!id) {
    return null;
  }

  const handleDownloadVersion = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      appendHistoryFilterSortParams(params, filters, sortBy, sortOrder);
      const qs = params.toString();
      const url = `${taskUrl}client-configurations/${entityApiType}/${encodeURIComponent(id)}/history/download${qs ? `?${qs}` : ""}`;
      const response: any = await api.get(url);
      const responseData = response?.data || response;
      downloadBase64File(responseData.filename, responseData.content);
    } catch {
      showCustomToast({
        type: ToastType.Error,
        title: "Failed",
        message: ERROR_MESSAGES.SOMETHINGS_WRONG,
      });
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return <Loader text="Loading..." />;
  }

  return (
    <div className="history-logs-page pt-3">
      <div className="history-header-row">
        <div className="history-title">
          <div>
            <TimerIcon className="history-title-icon" />
            <span className="history-header">
              {isGroup ? "Group History" : "Org History"}
            </span>
          </div>
          <div>
            <Button variant="secondary" onClick={handleDownloadVersion}>
              Download all history
            </Button>
          </div>
        </div>
      </div>

      <div className="history-filter-row">
        <FilterButton
          count={filterApplied}
          className="history-filter "
          onClick={() => setShowFilterModal(true)}
        />
        {filteredAppliedKeys.length > 0 && (
          <>
            <FilteredByBar filters={filteredAppliedKeys} />
            <Button
              className="fbb-clear"
              type="button"
              variant="secondary"
              onClick={handleClearAll}
            >
              Clear all
            </Button>
          </>
        )}
      </div>

      <div className="history-table-wrapper">
        <CustomTable
          key={page}
          data={rows}
          columns={history_logs}
          showPagination
          totalRecords={totalRecords}
          rowsPerPage={pageSize}
          page={page}
          onPageChange={handlePageChange}
          onChangeSortParams={handleSortChange}
          ellipsisOptions={(row) => actions(row)}
          showEllipsisColumn
        />
      </div>
      <SideModal
        show={showFilterModal}
        onHide={() => setShowFilterModal(false)}
        title="Filters"
      >
        <HistoryLogsFilterSidebar
          setOpenModal={setShowFilterModal}
          onExposeClear={(fn) => (clearRef.current = fn)}
          onFiltersApplied={() => setPage(0)}
        />
      </SideModal>

      <SideModal
        show={showCompareModal}
        onHide={() => setShowCompareModal(false)}
        title="Compare and restore"
      >
        <CompareRestoreSidebar
          entityType={entityApiType}
          selectedRow={selectedRow}
          onCancel={() => setShowCompareModal(false)}
          onRestoreSuccess={() => {
            setShowCompareModal(false);
            const controller = new AbortController();
            fetchHistory(controller.signal);
          }}
        />
      </SideModal>

      <SideModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setOrgVersion("");
        }}
        title={`Version: ${formatUTCtoDateOnly(orgVersion, true, true)}`}
      >
        <TaskDetailSidebar
          groupsRequired={false}
          taskId={selectedVersionId}
          versionWarning={restoreVersion ?? undefined}
          downloadFunctionality={true}
          downloadType="history"
          opportunityId={true}
          serviceAccount = {updatedBy === SERVICE_ACCOUNT}
          history={true}
        />
      </SideModal>
      <SideModal
        show={!!modalData && showId !== null}
        title={modalData?.name ?? ""}
        onHide={() => {
          setShowId(null);
          setModalData(null);
          setRestoreVersion(null);
        }}
      >
        <OpportunityDrawer tabs={tabData} data={modalData} />
      </SideModal>
    </div>
  );
};

export default HistoryLogs;
