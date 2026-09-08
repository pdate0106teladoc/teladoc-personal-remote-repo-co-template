import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./TaskDetailSidebar.scss";
import { Tabs, Tab } from "react-bootstrap";
import { ConfiguratorTask } from "@/views/ConfiguratorDashboard/ConfiguratorDashboard";
import {
  DisplayType,
  extractDisplayValue,
} from "../ExtractValue/ExtractDisplayValue";
import { GRP_DETAIL_PATH } from "@/router/routes";
import {
  downloadBase64File,
  formatFileSize,
  formatUTCtoDateOnly,
  getSafeString,
  normalizeFileLinkEntry,
  removeTrailingTimestamp,
} from "@/utils";
import {
  Button,
  CustomTable,
  FailSafePage,
  GroupIcon,
  Loader,
  showCustomToast,
  SideModal,
  TableColumn,
  ToastType,
} from "@ucc/common-ui";
import WorkflowHistory from "./WorkflowHistory";
import { ArrowLeft } from "@/assets";
import ExpandCollapse from "../ExpandCollapse/ExpandCollapse";
import api from "@/api/apiService";
import { TaskResponse } from "@/types/edit";
import { API_ENDPOINTS, ERROR_MESSAGES } from "@/constants";
import { OpportunityDetail, OpportunityDetails } from "@/types/search";
import OpportunityDrawer from "@/components/sidebar/OpportunityDrawer";
import { tabData } from "@/pages/search-results/OpportunitiesTable";
import { useNavigate, useParams } from "react-router-dom";
import { FaTriangleExclamation } from "react-icons/fa6";
import {
  ChangedFieldRow as RegistryChangedFieldRow,
  ChangeResponse,
  transformChangesToSections,
} from "@/data/fieldLabelRegistry";
import RoundedLabel from "@/components/RoundedLabel/RoundedLabel";
import { canOpenTaskForEdit } from "@/utils/taskAccess";

type tabkeys = "overview" | "changedFields" | "groups" | "worklogs" | "files";

type taskDetailsData = Record<tabkeys, any>;
interface TaskDetailSidebarProps {
  taskId?: string;
  tabKey?: string;
  data?: ConfiguratorTask;
  onDownload?: () => void;
  onBack?: () => void;
  groupsRequired?: boolean;
  downloadType?: "task" | "history";
  versionWarning?: string;
  downloadFunctionality?: boolean;
  opportunityId?: boolean;
  serviceAccount?: boolean;
  history?: boolean;
}

interface InfoTabType {
  label: string;
  value: string;
  format?: DisplayType;
  href?: string;
  linkAppearance?: boolean;
  onClick?: () => void;
}

interface FileRow {
  name: string;
  storageName: string;
  sizeBytes: number;
  url?: string;
}

function fileLinkToRows(fileLink: TaskResponse["fileLink"]): FileRow[] {
  if (!fileLink?.length) return [];
  return fileLink
    .map((entry) => {
      const { storageName, sizeBytes } = normalizeFileLinkEntry(entry);
      return {
        name: removeTrailingTimestamp(storageName),
        storageName,
        sizeBytes,
      };
    })
    .filter((row) => row.storageName);
}

const CHANGED_FIELDS_COLUMNS: TableColumn<RegistryChangedFieldRow>[] = [
  { label: "", field: "field" },
  { label: "Previous value", field: "previousValue" },
  { label: "Updated value", field: "updatedValue" },
];


const isHttpUrl = (v: string) => /^https?:\/\//i.test(String(v).trim());

const ExternalLinkGlyph = () => (
  <svg
    className="task-detail-overview-external-icon"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TaskDetailSidebar: React.FC<TaskDetailSidebarProps> = ({
  tabKey = "overview",
  onBack,
  groupsRequired = true,
  taskId,
  data,
  downloadType = "task",
  versionWarning,
  downloadFunctionality = false,
  opportunityId = false,
  serviceAccount = false,
  history=false
}) => {
  const [allData, setAllData] = useState<Partial<taskDetailsData>>({});
  const allDataRef = useRef(allData);
  allDataRef.current = allData;
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [tasksDetails, setTasksDetails] = useState<TaskResponse | undefined>();
  const [modalData, setModalData] = useState<OpportunityDetail | null>(null);
  const [showId, setShowId] = useState<string | null>(null);
  const taskUrl = import.meta.env.VITE_TASK_URL;
  const userName = sessionStorage.getItem("name");
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const grpType = taskId?.toLowerCase()?.startsWith("g") ? "groups" : "org-detail";
  const resolvedId = (taskId?.toLowerCase()?.startsWith("g") ? data?.groupUuid : data?.orgUuid) ?? paramId;
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [changedFieldsData, setChangedFieldsData] = useState<ChangeResponse | undefined>();
  const [changedFieldsLoading, setChangedFieldsLoading] = useState(false);

  const fetchChangedFields = useCallback(async () => {
    if (!tasksDetails?.entities?.length) return;
    const entity = tasksDetails.entities[0];
    const entityType = entity.type?.toUpperCase() === "GROUP" ? "GROUP" : "ORGANIZATION";
    try {
      setChangedFieldsLoading(true);
      const res: any = await api.post(
        `${taskUrl}${API_ENDPOINTS.diffLibrary}?draftId=${entity.draftId}&entityType=${entityType}&context=TASK_DASHBOARD`,
      );
      setChangedFieldsData(res?.data ?? res);
    } catch {
      showCustomToast({
        type: ToastType.Error,
        title: "Failed",
        message: ERROR_MESSAGES.SOMETHINGS_WRONG,
      });
    } finally {
      setChangedFieldsLoading(false);
    }
  }, [tasksDetails, taskUrl]);

  useEffect(() => {
    if (!serviceAccount && tasksDetails?.entities?.length && !changedFieldsData) {
      void fetchChangedFields();
    }
  }, [tasksDetails, changedFieldsData, fetchChangedFields, serviceAccount]);

  const renderChangedFields = () => {
    if (changedFieldsLoading) return <Loader text="Loading..." />;
    const { sections, arrayChangeSections } = transformChangesToSections(changedFieldsData);
    return (
      <div className="changed-fields-wrapper">
        {sections.length === 0 && arrayChangeSections.length === 0 ? (
          <div className="changed-fields-empty"><FailSafePage cardType="noData"/></div>
        ) : (
          <>
            {sections.map(({ title, rows }) => (
              <ExpandCollapse
                key={title}
                title={title}
                defaultExpanded={false}
                data={rows}
                columns={CHANGED_FIELDS_COLUMNS}
                contentClassName="changed-fields-table"
              />
            ))}
            {arrayChangeSections.map(({ tabLabel, items }) => (
              <div key={tabLabel} className="array-change-section">
                {items.map((item) => (
                  <div key={item.id} className="array-change-item">
                    <div className="array-change-item-header">
                      <RoundedLabel text={tabLabel} variant="grey" />
                      <span className="array-change-item-id">{item.id}</span>
                    </div>
                    <CustomTable
                      data={item.rows}
                      columns={CHANGED_FIELDS_COLUMNS}
                      showPagination={false}
                    />
                  </div>
                ))}
              </div>
            ))}
          </>
        )}
      </div>
    );
  };

  const renderOverviewValueCell = (item: InfoTabType) => {
    if (item.format === "date") {
      return (
        <span className="task-detail-overview-value-inner">
          {formatUTCtoDateOnly(item.value)}
        </span>
      );
    }
    const href =
      item.href ?? (isHttpUrl(item.value) ? item.value.trim() : undefined);
    const display = extractDisplayValue(item.value, item.format ?? "text").jsx;

    if (href && item.value && item.value !== "-") {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="task-detail-overview-link"
        >
          {display}
          <ExternalLinkGlyph />
        </a>
      );
    }

    if (item.onClick && item.value && item.value !== "-") {
      return (
        <span
          className="task-detail-overview-link task-detail-overview-link--text cursor-pointer"
          onClick={item.onClick}
        >
          {display}
        </span>
      );
    }

    if (item.linkAppearance && item.value && item.value !== "-") {
      const handleClick = () => {
        const url = isHttpUrl(item.value) ? item.value.trim() : `https://${item.value.trim()}`;
        window.open(url, "_blank", "noopener,noreferrer");
      };
      return (
        <span
          className="task-detail-overview-link task-detail-overview-link--text cursor-pointer"
          onClick={handleClick}
        >
          {display}
          <ExternalLinkGlyph />
        </span>
      );
    }
    return <span className="task-detail-overview-value-inner">{display}</span>;
  };

  const renderOverviewTab = (data: InfoTabType[]) => (
    <div className="task-detail-overview-list" role="list">
      {data.map((item, idx) => (
        <div
          key={`${item.label}-${idx}`}
          className={
            versionWarning
              ? "task-detail-overview-row-history"
              : "task-detail-overview-row"
          }
          role="listitem"
        >
          <span className="task-detail-overview-label">{item.label}</span>
          <div className="task-detail-overview-value">
            {renderOverviewValueCell(item)}
          </div>
        </div>
      ))}
    </div>
  );

  const callApiFor = useCallback(
    async (tabKey: tabkeys, id: string) => {
      let apiMethod = "";

      switch (tabKey) {
        case "worklogs": {
          const overview = allDataRef.current?.overview as
            | TaskResponse
            | undefined;
          const worklogId = overview?.id;
          if (!worklogId) {
            return null;
          }
          apiMethod = `worklog/${worklogId}`;
          break;
        }
        case "overview":
          apiMethod = `tasks/${id}`;
          break;
        case "groups":
          apiMethod = `tasks/${id}/groups`;
          break;
        default:
          return null;
      }

      try {
        const res: any = await api.get(
          `${taskUrl}client-configurations/${apiMethod}`,
        );
        return res;
      } catch {
        showCustomToast({
          type: ToastType.Error,
          title: "Failed",
          message: (closeToast: () => void) => (
                <div>
                  <div>{ERROR_MESSAGES.AUTO_SAVE_RETRY_OR_SERVICE_DESK}</div>
                  <button
                    type="button"
                    className="text-primary ellipsis-cell toast-link"
                    onClick={async () => {
                      const res: any = await api.get(`${taskUrl}client-configurations/${apiMethod}`);
                      if (res) {
                        setAllData((prev) => ({ ...prev, [tabKey]: res }));
                        if (tabKey === "overview") {
                          setTasksDetails(res as TaskResponse);
                        }
                      }
                      closeToast();
                    }}
                  >
                    Try Again
                  </button>
                </div>
              ),
        });
        return null;
      }
    },
    [taskUrl],
  );

  const getData = useCallback(
    async (tabType: tabkeys) => {
      if (!taskId) return null;
      if (allDataRef.current?.[tabType]) return allDataRef.current[tabType];

      try {
        setLoading((prev) => ({ ...prev, [tabType]: true }));

        const res = await callApiFor(tabType, taskId);
        setAllData((prev) => ({
          ...prev,
          [tabType]: res,
        }));

        if (tabType === "overview" && res) {
          setTasksDetails(res as TaskResponse);
        }

        return res;
      } catch {
        return null;
      } finally {
        setLoading((prev) => ({ ...prev, [tabType]: false }));
      }
    },
    [taskId, callApiFor],
  );

  useEffect(() => {
    if (!taskId) return;
    void getData("overview");
  }, [taskId, getData]);

  useEffect(() => {
    if (!taskId) return;
    if (tabKey === "groups")
      void getData("groups");
  }, [taskId, getData, tabKey]);
 
  useEffect(() => {
    if (tabKey === "worklogs" && allData.overview && !allData.worklogs) {
      void getData("worklogs");
    }
  }, [tabKey, allData.overview, allData.worklogs, getData]);

  useEffect(() => {
    if (showId) {
      void fetchOpportunityDetails(showId);
    }
  }, [showId]);

  const fetchOpportunityDetails = async (oppId: string) => {
    try {
      const response = await api.get<OpportunityDetails>(
        `${API_ENDPOINTS.opportunity}/${oppId}`,
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

  const overviewPayload =
    (allData.overview as TaskResponse | undefined) ?? tasksDetails;

  const opportunityRaw = overviewPayload?.opportunity ?? [];
  const workfrontRaw = overviewPayload?.workfrontId ?? "";

  const filesTableData = useMemo(
    () => fileLinkToRows(overviewPayload?.fileLink),
    [overviewPayload?.fileLink],
  );

  const infoTabHistoryData: InfoTabType[] = [
    {
      label: "Type of edit",
      value: overviewPayload?.typeOfEdit?.join(", ") ?? "-",
    },
    {
      label: "Updated by",
      value: overviewPayload?.updatedBy ?? "-",
      format: "person",
    },
    {
      label: "Launch date",
      value: overviewPayload?.plannedLaunchDate ?? "-",
      format: "date",
    },
    {
      label: "Workfront link",
      value: workfrontRaw || "-",
      href: isHttpUrl(workfrontRaw) ? workfrontRaw.trim() : undefined,
      linkAppearance:
        Boolean(workfrontRaw && workfrontRaw !== "-") &&
        !isHttpUrl(workfrontRaw),
    },
    ...(opportunityRaw.length === 0
      ? [{ label: opportunityId ? "Opportunity ID" : "Opportunity", value: "-" }]
      : opportunityRaw.map((opp, idx) => ({
          label: idx === 0 ? (opportunityId ? "Opportunity ID" : "Opportunity") : "",
          value: opportunityId ? opp.opportunityGuid : opp.opportunityName,
          onClick: () => setShowId(opp.id),
        }))),
    {
      label: "Change Source",
      value: overviewPayload?.changeSource ?? "-",
    },
  ];

  const infoTabData: InfoTabType[] = [
    {
      label: "Task ID",
      value: overviewPayload?.taskId ?? "-",
      onClick: canOpenTaskForEdit({
        userName,
        ownerName: overviewPayload?.assignee,
        taskStatus: overviewPayload?.status,
      })
        ? () => navigate(`/CCC/${grpType}/${resolvedId}/edit/${taskId}/general-settings`)
        : undefined,
    },
    {
      label: "Type of edit",
      value: overviewPayload?.typeOfEdit?.join(", ") ?? "-",
    },
    {
      label: "Priority",
      value: overviewPayload?.priority ?? "-",
      format: "priority",
    },
    {
      label: "Updated by",
      value: overviewPayload?.updatedBy ?? "-",
      format: "person",
    },
    {
      label: "Planned launch date",
      value: overviewPayload?.plannedLaunchDate ?? "-",
      format: "date",
    },
    {
      label: "Workfront link",
      value: workfrontRaw || "-",
      href: isHttpUrl(workfrontRaw) ? workfrontRaw.trim() : undefined,
      linkAppearance:
        Boolean(workfrontRaw && workfrontRaw !== "-") &&
        !isHttpUrl(workfrontRaw),
    },
    ...(opportunityRaw.length === 0
      ? [{ label: opportunityId ? "Opportunity ID" : "Opportunity", value: "-" }]
      : opportunityRaw.map((opp, idx) => ({
          label: idx === 0 ? (opportunityId ? "Opportunity ID" : "Opportunity") : "",
          value: opportunityId ? opp.opportunityGuid : `${opp.opportunityName} - ${opp.opportunityGuid}`,
          onClick: () => setShowId(opp.id),
        }))),

    {
      label: "Playbook",
      value: overviewPayload?.playbookURL ?? "-",
      href: isHttpUrl(overviewPayload?.playbookURL ?? "")
        ? String(overviewPayload?.playbookURL).trim()
        : undefined,
    },
  ];

  const download = async (filename: string) => {
    try {
      const response: any = await api.get(
        `${taskUrl}client-configurations/file/upload/${filename}`,
      );
      const res: any = response?.data || response;
      const name = res?.filename ?? "-";
      downloadBase64File(name, res?.content);
    } catch {
      showCustomToast({
        type: ToastType.Error,
        title: "Failed",
        message: ERROR_MESSAGES.SOMETHINGS_WRONG,
      });
    }
  };

  const FILES_COLUMNS: TableColumn<FileRow>[] = [
    {
      label: "Title",
      field: "name",
      render(value, row) {
        const label = value as string;
        if (row?.url) {
          return (
            <a
              href={row.url}
              target="_blank"
              rel="noopener noreferrer"
              className="stacked-label text-blue"
            >
              {label}
            </a>
          );
        }
        return (
          <span
            className="text-blue"
            role="button"
            tabIndex={0}
            onClick={() => download(row.storageName)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                void download(row.storageName);
              }
            }}
          >
            {label}
          </span>
        );
      },
    },
    {
      label: "Size",
      field: "sizeBytes",
      render(value) {
        return <span>{formatFileSize(value)}</span>;
      },
    },
  ];

  const handleDownload = async () => {
    try {
      setDownloadLoading(true);
      const { sections, arrayChangeSections } = transformChangesToSections(changedFieldsData);
      const url = `${taskUrl}client-configurations/tasks/${taskId}/type/${downloadType}/download`;
      const response: any = await api.post(url, {
        changedFields: sections,
        changeArrays: arrayChangeSections,
      });
      const responseData = response?.data || response;
      downloadBase64File(responseData.filename, responseData.content);
    } catch {
      showCustomToast({
        type: ToastType.Error,
        title: "Failed",
        message: ERROR_MESSAGES.SOMETHINGS_WRONG,
      });
    } finally {
      setDownloadLoading(false);
    }
  };

  if (downloadLoading) return <Loader text="Downloading..." />;

  return (
    <div className="task-detail-sidebar">
      {onBack && (
        <div className="back-button-container mb-3">
          <Button
            className="back-button secondary d-flex align-items-center"
            onClick={onBack}
          >
            <ArrowLeft height={14} width={14} />
            &nbsp; Back
          </Button>
        </div>
      )}
      <div className="tab-container">
        {versionWarning && (
          <div className="version-restored-banner" role="status">
            <FaTriangleExclamation
              className="version-restored-banner__icon"
              aria-hidden
            />
            <div className="version-restored-banner__content">
              <strong className="version-restored-banner__title">
                Version restored
              </strong>
              <p className="version-restored-banner__description mb-0">
                This version is being restored from the Version:{" "}
                {formatUTCtoDateOnly(versionWarning, true, true)}
              </p>
            </div>
          </div>
        )}

        <Tabs
          id="uncontrolled-tab-example-sidebar"
          defaultActiveKey={tabKey}
          className="mb-3"
          onSelect={(key) => {
            if (key && key !== "files") void getData(key as tabkeys);
          }}
        >
          <Tab eventKey="overview" title="Overview">
            <div className="tab-content-section ms-3">
              {loading["overview"] ? (
                <Loader text="Loading..." />
              ) : (
                renderOverviewTab(
                  history ? infoTabHistoryData : infoTabData,
                )
              )}
            </div>
          </Tab>
          <Tab eventKey="changedFields" title="Changed fields">
            <div className="tab-content-section ms-3">
              {renderChangedFields()}
            </div>
          </Tab>
          {groupsRequired && (
            <Tab eventKey="groups" title="Group">
              <div className="tab-content-section m-3 custom-tab-wrapper">
                <span className="grp-heading">{ allData.groups?.groups?.length > 0 && allData?.groups?.orgName}</span> 
                <div className="d-flex flex-column align-items-start gap-2 mb-3">
                  {loading["groups"] ? (
                    <Loader text="Loading..." className="align-self-center"/>
                  ) : allData.groups?.groups?.length > 0 ? (
                    allData.groups.groups.map((grp: any, index: number) => (
                      <div
                        key={index}
                        className="grp-info-box d-flex flex-row align-items-center gap-2"
                      >
                        <GroupIcon />
                        <a
                          href={`${GRP_DETAIL_PATH}/${grp?.groupMongoId}`}
                          className="text-primary"
                        >
                          <span className="text-primary">{grp?.groupId}</span>
                          {" - "}
                          {getSafeString(grp?.groupName)}
                        </a>
                      </div>
                    ))
                  ) : (
                    <div className="d-flex justify-content-center w-100">
                      <FailSafePage cardType="noData" />
                    </div>
                  )}
                </div>
              </div>
            </Tab>
          )}
          <Tab eventKey="worklogs" title="Work log">
            <div className="tab-content-section mt-3">
              {loading["worklogs"] ? (
                <Loader text="Loading..." />
              ) : (
                <WorkflowHistory items={allData?.worklogs?.workLog || []} />
              )}
            </div>
          </Tab>
          <Tab eventKey="files" title="Files">
            <div className="tab-content-section mt-3">
              {loading["overview"] && !overviewPayload ? (
                <Loader text="Loading..." />
              ) : filesTableData.length === 0 ? (
                <FailSafePage cardType="noData" />
              ) : (
                <>
                  <span className="section-title">
                    Files ({filesTableData.length})
                  </span>
                  <CustomTable
                    data={filesTableData}
                    columns={FILES_COLUMNS}
                    showPagination={false}
                  />
                </>
              )}
            </div>
          </Tab>
        </Tabs>
      </div>

      {downloadFunctionality && (
        <div className="task-detail-sidebar-footer">
          <Button variant="secondary" onClick={handleDownload}>
            Download
          </Button>
        </div>
      )}
      <SideModal
        show={!!modalData && showId !== null}
        title={modalData?.name ?? ""}
        onHide={() => {
          setShowId(null);
          setModalData(null);
        }}
      >
        <OpportunityDrawer tabs={tabData} data={modalData} />
      </SideModal>
    </div>
  );
};

export default TaskDetailSidebar;
