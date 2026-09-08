import { ExclamationIcon } from '@/assets';
import { extractDisplayValue } from '@/components/ExtractValue/ExtractDisplayValue';
import { STATUS_AGE_ERROR, NO_OF_RECORDS_PER_PAGE_INDIVIDUAL, statusTextMap, statusClasses, ERROR_MESSAGES, ToastType, MODAL_MSSG } from '@/constants';
import { downloadBase64File, formatRelativeTime, formatUTCtoDateOnly, getApiErrorMessage, getInitials, getSafeString, USER_ROLES } from '@/utils';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./ConfiguratorDashboard.scss";
import { Tabs, Tab, OverlayTrigger } from 'react-bootstrap';
import api from '@/api/apiService';
import { UserKey } from '@/types/user';
import { GRP_DETAIL_PATH, ORG_DETAIL_PATH } from '@/router/routes';
import TaskDetailSidebar from '@/components/sidebar/TaskDetailSidebar';
import { contact } from '@/pages/contacts/ContactCards';
import { Group } from '@/types/Hierarchy';
import BasicModal from '@/components/Modal/BasicModal';
import TaskActionModal from '@/components/Modal/TaskActionModal';
import {
  ArrowDownload,
  Button,
  CustomTable,
  getUserPermissions,
  Loader,
  renderTooltip,
  showCustomToast,
  SideModal,
  TableColumn,
  WarningIcon
} from '@ucc/common-ui';
import AssignModal from '@/components/Modal/AssignTaskModal';
import { RowActionKey, visibleRowActions } from './rowActions';
import ProdScheduleModal from '@/components/Modal/ProdScheduleModal';
import ResolveConflictsModal from '@/components/sidebar/ResolveConflictSidebar';
import { hasAnyConflictOrChanges, type ConflictResponse } from '@/data/conflictCards';
import { TaskResponse } from '@/types/edit';

interface StatusBadgeProps {
  status: string[];
}
export interface Assignee {
  userId: string;
  role: string;
  userName: string;
}
export interface ConfiguratorTask {
  indicators: string;
  taskId: string;
  taskMongoId: string;
  organizationName: string;
  organizationId: string;
  orgUuid: string;
  groupName: string;
  groupUuid: string;
  groups?: Group[];
  typeOfEdit: string[];
  status: string[];
  overDue: boolean;
  statusAgeDays: number;
  assignee: string;
  priority: "High" | "Normal" | "Low" | "medium";
  lastSaved: string;
  plannedLaunchDate: string;
  workFrontId?: string;
  playbook?: string;
  typeOfChange?: string[];
  changedBy?: contact;
  daysSinceOpen?: number;
  createdBy: string;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const LaunchDateField: React.FC<{ plannedLaunchDate: string }> = ({ plannedLaunchDate }) => {
  const diffDays = Math.ceil(
    (new Date(plannedLaunchDate).getTime() - Date.now()) / MS_PER_DAY
  );

  const isOverdue = diffDays < 0;
  const isLaunchSoon = diffDays >= 0 && diffDays <= 7;

  const statusClass = isOverdue ? "overdue" : isLaunchSoon ? "launch-soon" : "";
  const statusClassName = statusClass ? `status-age-${statusClass}` : 'status-age';

  return (<span className={statusClassName}>{formatUTCtoDateOnly(plannedLaunchDate)}</span>);
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <span className="d-flex flex-row gap-1 flex-wrap">
      {status.map((s) => {
        const normalizedInput = s.replace(/_/g, " ").toLowerCase() as keyof typeof statusTextMap;
        const displayText = statusTextMap[normalizedInput] || s;
        const statusClass = statusClasses[normalizedInput] || "";
        return (
          <span key={s} className={`status status--${statusClass}`}>{displayText}</span>
        );
      })}
    </span>
  );
};

interface StatusIndicator {
  icon: React.ReactNode;
  tooltip: string;
  type: "error" | "warning";
}

const PUT_ON_HOLD_REASON_OPTIONS = [
  { label: "Delayed launch - Client initiated", value: "Delayed launch - Client initiated" },
  { label: "Delayed launch - Teladoc initiated", value: "Delayed launch - Teladoc initiated" },
  { label: "Contract pending", value: "Contract pending" },
  { label: "Other", value: "Other" },
];

const getDefaultParentTabIndex = (role: UserKey) => {
  switch (role) {
    case USER_ROLES.CONFIGURATOR:
    case USER_ROLES.QUALITY_REVIEWER:
      return 0;
    case USER_ROLES.CONFIGURATOR_MANAGER:
    case USER_ROLES.ADMINISTRATOR:
      return 1;
    case USER_ROLES.QUALITY_MANAGER:
      return 2;
    default:
      return 0;
  }
};

const ConfiguratorDashboard: React.FC<{ userName: string, role: UserKey }> = ({ userName, role }) => {
  const navigate = useNavigate();
  const [activeParentTabIndex, setActiveParentTabIndex] = useState(() => getDefaultParentTabIndex(role));
  const [activeChildTabIndex, setActiveChildTabIndex] = useState(0);
  const tabStatesRef = useRef<Record<string, { page: number; sortField: string; sortOrder: "ASC" | "DESC"; filter: Record<string, string | string[]> }>>({});
  const getTabKey = (parentIdx: number, childIdx: number) => `${parentIdx}-${childIdx}`;
  const [cancelTask, setCancelTask] = useState<boolean>(false);
  const [putOnHoldTask, setPutOnHoldTask] = useState<boolean>(false);
  const [removeHoldTask, setRemoveHoldTask] = useState<boolean>(false);
  const [revertToDraftTask, setRevertToDraftTask] = useState<boolean>(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [sidebarState, setSidebarState] = useState<{ taskId: string; tabKey: string } | null>(null);
  const openSidebar = (taskId: string, tabKey: string) => setSidebarState({ taskId, tabKey });
  const closeSidebar = () => setSidebarState(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [countsBySubTab, setCountsBySubTab] = useState<Record<string, number>>({});
  const [sortField, setSortField] = useState<string>("");
  const [filter, setFilter] = useState<Record<string, string | string[]>>({});
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [selectedRow, setSelectedRow] = useState<ConfiguratorTask | null>(null);
  const [assignTask, setAssignTask] = useState<boolean>(false);
  const [prodScheduledTask, setProdScheduledTask] = useState<boolean>(false);
  const [data, setData] = useState<ConfiguratorTask[]>([]);
  const [openConflictSidebar, setOpenConflictSidebar] = useState<boolean>(false);
  const [scheduleBlocked, setScheduleBlocked] = useState<boolean>(false);
  const [resolveConflictData, setResolveConflictData] = useState<ConflictResponse | undefined>();
  const parentTabs = ["My tasks", "All configuration tasks", "All review tasks"];
  const taskUrl = import.meta.env.VITE_TASK_URL;
  const editBaseUrl = import.meta.env.VITE_EDIT_URL;
  const userPermissions = useMemo(() => getUserPermissions(), []);
  const TABS = [
    {
      label: "My tasks",
      value: "myTasks",
      statuses: [
        { label: "Needs attention", value: "needsAttention" },
        { label: "In progress", value: "inProgress" },
        { label: "Scheduled or completed", value: "scheduledOrCompleted" },
        { label: "Inactive", value: "inactive" },
      ],
    },
    {
      label: "All configuration tasks",
      value: "allConfigurationTasks",
      statuses: [
        { label: "Needs attention", value: "needsAttention" },
        { label: "In progress", value: "inProgress" },
        { label: "Scheduled or completed", value: "scheduledOrCompleted" },
        { label: "Inactive", value: "inactive" },
      ],
    },
    {
      label: "All review tasks",
      value: "allReviewTasks",
      statuses: [
        { label: "Needs attention", value: "needsAttention" },
        { label: "In progress", value: "inProgress" },
      ],
    }
  ]

  const fetchData = async (
    currentPage: number,
    currentSortField: string,
    currentSortOrder: "ASC" | "DESC",
    currentFilters: Record<string, string | string[]>,
    parentTabIndex: number,
    childTabIndex: number,
  ) => {
    const tab = TABS[parentTabIndex];
    const subTab = tab.statuses[childTabIndex];
    const remappedFilters: Record<string, string | string[]> = {};
    for (const [k, v] of Object.entries(currentFilters)) {
      if (k === 'groupName') {
        remappedFilters['group'] = v;
      } else if (k === 'statusAgeDays' || k === 'daysSinceOpen') {
        const num = typeof v === 'string' ? v.match(/^\d+/)?.[0] : undefined;
        if (num) {
          const d = new Date();
          d.setDate(d.getDate() - Number(num));
          remappedFilters[k === 'statusAgeDays' ? 'statusChangedAt' : 'createdAt'] = d.toISOString();
        }
      } else if (k === 'plannedLaunchDate') {
        if (typeof v === 'string' && v) {
          const [mm, dd, yyyy] = v.split('/');
          remappedFilters['plannedLaunchDate'] = new Date(`${yyyy}-${mm}-${dd}T00:00:00.000Z`).toISOString();
        }
      } else {
        remappedFilters[k] = v;
      }
    }
    const request = {
      "tab": tab.value,
      "subTab": subTab.value,
      "page": currentPage,
      "pageSize": NO_OF_RECORDS_PER_PAGE_INDIVIDUAL,
      "sort": {
        "field": currentSortField,
        "order": currentSortOrder,
      },
      "filters": remappedFilters,
    };
    const url = `${taskUrl}client-configurations/tasks`;
    try {
      setLoading(true);
      const res: any = await api.post(url, request);
      setData(res?.tasks ?? []);
      setTotalResults(res?.totalResults ?? 0);
      setCountsBySubTab(res?.countsBySubTab ?? {});
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

  useEffect(() => {
    fetchData(page, sortField, sortOrder, filter, activeParentTabIndex, activeChildTabIndex);
  }, [activeParentTabIndex, activeChildTabIndex, page, sortField, sortOrder, filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const getRowStatusIndicators = (row: ConfiguratorTask, parentIdx: number, childIdx: number): StatusIndicator[] => {
    if (childIdx !== 0) return [];
    if (parentIdx === 2 && childIdx === 0) return [];

    const indicators: StatusIndicator[] = [];
    const statuses = row?.status ?? [];

    if (statuses.includes("ERRORED")) {
      indicators.push({
        icon: <ExclamationIcon />,
        tooltip: "Processing error",
        type: "error",
      });
    }

    if (statuses.includes("CONFLICT")) {
      indicators.push({
        icon: <ExclamationIcon />,
        tooltip: "This task contains a potential conflict",
        type: "error",
      });
    }

    const OVERDUE_EXCLUDED = ["DRAFT", "ON_HOLD", "CANCELLED"];
    const STS_AGE_EXCLUDED = ["DRAFT", "SCHEDULED", "COMPLETED", "ON_HOLD", "CANCELLED"];

    const isOverdueExcluded = statuses.some(s => OVERDUE_EXCLUDED.includes(s));
    const isStsAgeExcluded = statuses.some(s => STS_AGE_EXCLUDED.includes(s));

    let isOverdue = false;
    let isLaunchSoon = false;

    if (row?.plannedLaunchDate) {
      const diffDays = Math.ceil(
        (new Date(row.plannedLaunchDate).getTime() - Date.now()) / MS_PER_DAY
      );
      isOverdue = !isOverdueExcluded && diffDays < 0;
      isLaunchSoon = !isStsAgeExcluded && diffDays >= 0 && diffDays <= 7;
    }

    if (!isStsAgeExcluded && !isOverdue && row?.statusAgeDays > STATUS_AGE_ERROR) {
      indicators.push({
        icon: <WarningIcon />,
        tooltip: "Same status for over 7 days",
        type: "warning",
      });
    }

    if (isOverdue) {
      indicators.push({
        icon: <ExclamationIcon />,
        tooltip: "Overdue",
        type: "error",
      });
    } else if (isLaunchSoon) {
      indicators.push({
        icon: <WarningIcon />,
        tooltip: "Launch soon",
        type: "warning",
      });
    }

    return indicators;
  };

  const downloadTableData = async () => {
    const tabValue = TABS[activeParentTabIndex]?.value;
    const url = `${taskUrl}client-configurations/tasks/${tabValue}/download`;
    try {
      setDownloading(true);
      const response: any = await api.get(url);
      const res: any = response?.data || response;
      const name = res?.filename ?? "-";
      downloadBase64File(name, res?.content);
    } catch {
      showCustomToast({
        type: ToastType.Error,
        title: "Failed",
        message: ERROR_MESSAGES.SOMETHINGS_WRONG,
      });
    } finally {
      setDownloading(false);
    }
  }

  const typeOfEditFilterOptions = [
    "General settings",
    "Billing",
    "Marketing",
    "Reporting",
    "Contacts",
    "Eligibility",
    "Client overview",
    "Program overview",
  ];

  const statusFilterOptions = [
    "DRAFT",
    "PENDING_PEER_REVIEW",
    "APPROVED",
    "SCHEDULED",
    "COMPLETED",
    "CANCELLED",
    "ARCHIVED",
    "OVERDUE",
    "ON_HOLD",
    "PEER_REVIEW_IN_PROGRESS",
    "QUALITY_REVIEW_IN_PROGRESS",
    "PENDING_QUALITY_REVIEW",
    "REJECTED_PEER_REVIEW",
    "REJECTED_QUALITY_REVIEW",
    "PROCESSING_ERROR",
    "PROCESSING",
    "CONFLICT",
  ];

  const priorityOptions = [
    "Normal",
    "High",
    "Urgent"
  ];

  const dataColumns = useMemo<TableColumn<ConfiguratorTask>[]>(() => [
    {
      label: "",
      field: "indicators",
      headerClassName: "custom-header",
      render: (_val, row) => {
        const indicators = getRowStatusIndicators(row, activeParentTabIndex, activeChildTabIndex);
        return (
          <div className="d-flex gap-2">
            {indicators.map((indicator, index) => (
              <OverlayTrigger
                key={index}
                placement="bottom-start"
                overlay={renderTooltip(indicator.tooltip, `indicator-tooltip-${row?.taskId}-${index}`)}
              >
                <span className="info-icon text-center" style={{ cursor: "pointer" }}>
                  {indicator.icon}
                </span>
              </OverlayTrigger>
            ))}
            {indicators.length === 0 && <span>&nbsp;</span>}
          </div>
        );
      },
    },
    {
      label: "ID",
      subLabel: "Task",
      field: "taskId",
      headerClassName: "custom-header",
      hasToggleMenu: true,
      render: (_val, row) => <span className='navigate-field' onClick={() => handleRowClick(row)}>{getSafeString(row?.taskId)}</span>,
    },
    {
      label: "Organization",
      subLabel: "name",
      field: "organizationName",
      headerClassName: "custom-header name-col",
      hasToggleMenu: true,
      cellStyle: () => "name-col-cell",
      render: (_val, row) => row?.organizationName ?
        <a href={`${ORG_DETAIL_PATH}/${row?.orgUuid}`}
          className="text-primary">
          {getSafeString(row?.organizationName)}
        </a> : "-",
    },
    {
      label: "ID",
      subLabel: "Org",
      field: "organizationId",
      headerClassName: "custom-header",
      hasToggleMenu: true,
      render: (_val, row) => <span>{getSafeString(row?.organizationId)}</span>,
    },
    {
      label: "Group",
      field: "groupName",
      headerClassName: "custom-header name-col",
      hasToggleMenu: true,
      cellStyle: () => "name-col-cell",
      render: (_val, row) => {
        if (!row?.groupUuid) {
          if (row?.groupName && /^\d+$/.test(row?.groupName)) {
            return <span className='text-primary' onClick={() => openSidebar(row?.taskId, "groups")}>{getSafeString(row?.groupName)}</span>;
          }
          return <span>{getSafeString(row?.groupName)}</span>;
        }
        if (row?.groupName)
          return <a href={`${GRP_DETAIL_PATH}/${row?.groupUuid}`}
            className="text-primary">
            {getSafeString(row?.groupName)}
          </a>;
        else return <span>-</span>;
      },
    },
    {
      label: "Type of",
      subLabel: "edit",
      field: "typeOfEdit",
      headerClassName: "custom-header type-of-edit-col",
      cellStyle: () => "type-of-edit-col-cell",
      hasToggleMenu: true,
      isMultiSelect: true,
      filterOptions: typeOfEditFilterOptions,
      render: (_val, row) => <span>{getSafeString(row?.typeOfEdit?.join(", "))}</span>,
    },
    {
      label: "Status",
      field: "status",
      headerClassName: "custom-header status-col",
      hasToggleMenu: true,
      isMultiSelect: true,
      filterOptions: statusFilterOptions,
      cellStyle: () => "status-col-cell",
      render: (_val, row) => <StatusBadge status={row?.status} />,
    },
    {
      label: "Status",
      subLabel: "age (days)",
      field: "statusAgeDays",
      headerClassName: "custom-header",
      hasToggleMenu: true,
      render: (_val, row) => (
        <span className={`status-age ${row?.statusAgeDays > STATUS_AGE_ERROR ? "status-age-error-text" : ""}`}>{row?.statusAgeDays}</span>
      ),
    },
    {
      label: "Assignee",
      field: "assignee",
      headerClassName: "custom-header",
      hasToggleMenu: true,
      render: (_val, row) => (
        <div className='contact-text-black'>
          {
            extractDisplayValue(row?.assignee, "person", {
              name: row?.assignee,
              initials: getInitials(row?.assignee?.toLowerCase()),
            }).jsx
          }
        </div>
      ),
    },
    {
      label: "Priority",
      field: "priority",
      headerClassName: "custom-header",
      hasToggleMenu: true,
      filterOptions: priorityOptions,
      render: (_val, row) => (
        <div>
          {
            <>
              <span className={`priority priority--${row?.priority?.toLowerCase() === "medium" ? "normal" : row?.priority?.toLowerCase()}`}></span>
              <span>{row?.priority?.toLowerCase() === "medium" ? "Normal" : row?.priority}</span>
            </>
          }
        </div>
      ),
    },
    {
      label: "Last saved",
      field: "lastSaved",
      headerClassName: "custom-header",
      hasToggleMenu: true,
      showFiltering: false,
      render: (_val, row) => (
        <span>{formatRelativeTime(row?.lastSaved, undefined, false)}</span>
      ),
    },
    {
      label: "Day since",
      subLabel: "open",
      field: "daysSinceOpen",
      headerClassName: "custom-header",
      hasToggleMenu: true,
      render: (_val, row) => (
        <span>{`${row?.daysSinceOpen} days`}</span>
      ),
    },
    {
      label: `${activeChildTabIndex === 2 ? "Launch" : "Planned"}`,
      subLabel: `${activeChildTabIndex === 2 ? "date" : "launch date"}`,
      field: "plannedLaunchDate",
      headerClassName: "custom-header",
      hasToggleMenu: true,
      placeholder: "mm/dd/yyyy",
      render: (_val, row) => (
        <>
          <LaunchDateField plannedLaunchDate={row?.plannedLaunchDate} />
        </>
      ),
    },
  ], [activeParentTabIndex, activeChildTabIndex]);

  const handleAssignTask = async (row: ConfiguratorTask, method: "saveAndStart" | "save", id: string) => {
    const { taskId } = row;
    try {
      const url = `${taskUrl}client-configurations/tasks/${taskId}/actions/assign`;
      const payload = {
        "assignee": id,
        "action": `${method == "saveAndStart" ? "SAVE_AND_START" : "SAVE"}`
      }
      await api.post(url, payload);
      if (method === "saveAndStart") navigateToEditOrReview(row, "review");
      else fetchData(page, sortField, sortOrder, filter, activeParentTabIndex, activeChildTabIndex);
    }
    catch (err: unknown) {
      showCustomToast({
        type: ToastType.Error,
        title: "Failed",
        message: getApiErrorMessage(err),
      });
    }
  }

  const handleProdSchedule = async (taskId: string, plannedLaunchDate: string) => {
    try {
      await api.post(`${taskUrl}client-configurations/tasks/${taskId}/statusUpdate`, {
        action: "SCHEDULED",
        plannedLaunchDate: plannedLaunchDate,
        acknowledgementConfirmed: true
      });
      fetchData(page, sortField, sortOrder, filter, activeParentTabIndex, activeChildTabIndex);
    } catch {
      showCustomToast({
        type: ToastType.Error,
        title: "Failed",
        message: ERROR_MESSAGES.SOMETHINGS_WRONG,
      });
    }
  };

  const navigateToEditOrReview = (row: ConfiguratorTask, mode: "edit" | "review" = "edit") => {
    const { taskId, groupUuid, orgUuid } = row;
    if (!taskId) return;
    if (taskId?.toLowerCase()?.startsWith("g") && groupUuid) {
      navigate(`/CCC/groups/${groupUuid}/${mode}/${taskId}/general-settings`);
    } else if (taskId?.toLowerCase()?.startsWith("o") && orgUuid) {
      navigate(`/CCC/org-detail/${orgUuid}/${mode}/${taskId}/general-settings`);
    }
  };

  const isL1Role = [USER_ROLES.CONFIGURATOR, USER_ROLES.CONFIGURATOR_MANAGER, USER_ROLES.ADMINISTRATOR].includes(role);
  const isL2Role = [USER_ROLES.QUALITY_REVIEWER, USER_ROLES.QUALITY_MANAGER, USER_ROLES.ADMINISTRATOR].includes(role);
  const DRAWER_STATUSES = ["ON_HOLD", "APPROVED", "SCHEDULED", "COMPLETED"];
  const ROW_CLICK_RULES: { status: string; mode: "edit" | "review" | "none"; level?: "L1" | "L2" }[] = [
    { status: "PENDING_PEER_REVIEW", mode: "review", level: "L1" },
    { status: "DRAFT", mode: "edit" },
    { status: "PEER_REVIEW_IN_PROGRESS", mode: "review", level: "L1" },
    { status: "PENDING_QUALITY_REVIEW", mode: "review", level: "L2" },
    { status: "QUALITY_REVIEW_IN_PROGRESS", mode: "review", level: "L2" },
    { status: "REJECTED_PEER_REVIEW", mode: "review" },
    { status: "REJECTED_QUALITY_REVIEW", mode: "review" },
    { status: "PENDING_REBUTTAL_REVIEW", mode: "review" },
    { status: "REBUTTAL_IN_PROGRESS", mode: "review" },
  ];

  const handleRowClick = useCallback((row: ConfiguratorTask) => {
    const statuses = row?.status ?? [];
    const drawer = () => openSidebar(row?.taskId, "overview");

    if (row?.assignee !== userName || (DRAWER_STATUSES.some(s => statuses.includes(s)) && !statuses.includes("PENDING_PEER_REVIEW")))
      return drawer();

    const allowed = { L1: isL1Role, L2: isL2Role };
    const rule = ROW_CLICK_RULES.find(r => statuses.includes(r.status) && (!r.level || allowed[r.level]));

    if (!rule) return drawer();
    if (rule.mode !== "none") navigateToEditOrReview(row, rule.mode);
  }, [role, openSidebar, navigate]);


  const getTaskActionUrl = (taskId: string) => {
    return `${taskUrl}client-configurations/tasks/${taskId}/action`;
  };

  const handleCancelTask = async (reasonCode: string, comments: string) => {
    try {
      await api.put(getTaskActionUrl(selectedTaskId), {
        action: "CANCEL",
        reasonCode,
        comments,
        confirmPutOnHold: true,
      });
      showCustomToast({ type: ToastType.Success, title: "Success", message: "Task has been canceled." });
      fetchData(page, sortField, sortOrder, filter, activeParentTabIndex, activeChildTabIndex);
    } catch (e) {
      showCustomToast({
        type: ToastType.Error,
        title: "Failed",
        message: ERROR_MESSAGES.SOMETHINGS_WRONG,
      });
      throw e;
    }
  };

  const handlePutOnHold = async (reasonCode: string, comments: string) => {
    try {
      await api.put(getTaskActionUrl(selectedTaskId), {
        action: "PUT_ON_HOLD",
        reasonCode,
        comments,
        confirmPutOnHold: true,
      });
      showCustomToast({ type: ToastType.Success, title: "Success", message: "Task has been put on hold." });
      fetchData(page, sortField, sortOrder, filter, activeParentTabIndex, activeChildTabIndex);
    } catch (e) {
      showCustomToast({
        type: ToastType.Error,
        title: "Failed",
        message: ERROR_MESSAGES.SOMETHINGS_WRONG,
      });
      throw e;
    }
  };

  /** Unlike the hold/cancel actions this hits `statusUpdate` and is keyed by the display task id. */
  const handleRevertToDraft = async () => {
    try {
      await api.post(
        `${taskUrl}client-configurations/tasks/${selectedTaskId}/statusUpdate`,
        { action: "REVERT_TO_DRAFT" },
      );
      setRevertToDraftTask(false);
      showCustomToast({
        type: ToastType.Success,
        title: "Success",
        message: "Task has been reverted to draft.",
      });
      fetchData(page, sortField, sortOrder, filter, activeParentTabIndex, activeChildTabIndex);
    } catch {
      showCustomToast({
        type: ToastType.Error,
        title: "Failed",
        message: ERROR_MESSAGES.SOMETHINGS_WRONG,
      });
    }
  };

  const handleRemoveHold = async () => {
    try {
      await api.put(getTaskActionUrl(selectedTaskId), { action: "RESUME_HOLD" });
      setRemoveHoldTask(false);
      showCustomToast({ type: ToastType.Success, title: "Success", message: "Hold has been removed." });
      fetchData(page, sortField, sortOrder, filter, activeParentTabIndex, activeChildTabIndex);
    } catch {
      showCustomToast({
        type: ToastType.Error,
        title: "Failed",
        message: ERROR_MESSAGES.SOMETHINGS_WRONG,
      });
    }
  };

  const refreshConflicts = async (row: ConfiguratorTask): Promise<ConflictResponse> => {
    const entityType = row?.taskId?.toLowerCase()?.startsWith("o") ? "ORGANIZATION" : "GROUP";
    const task: TaskResponse = await api.get(`${taskUrl}client-configurations/tasks/${row?.taskId}`);
    const draftId = task?.entities?.[0]?.draftId;
    if (!draftId) throw new Error("Missing draftId");
    return api.post(
      `${editBaseUrl}client-configurations/conflicts/refresh?draftId=${draftId}&entityType=${entityType}`,
    );
  };

  const handleResolveConflicts = async (row: ConfiguratorTask) => {
    try {
      setLoading(true);
      const res = await refreshConflicts(row);
      if (!hasAnyConflictOrChanges(res)) {
        showCustomToast({ type: ToastType.Success, title: "Success", message: "No conflicts to resolve." });
        fetchData(page, sortField, sortOrder, filter, activeParentTabIndex, activeChildTabIndex);
        return;
      }
      setResolveConflictData(res);
      setOpenConflictSidebar(true);
    } catch {
      showCustomToast({
        type: ToastType.Error,
        title: "Failed",
        message: ERROR_MESSAGES.CHECK_CONFLICTS_FAILED,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleForProduction = async (row: ConfiguratorTask) => {
    setSelectedTaskId(row?.taskId);
    setSelectedRow(row);
    try {
      setLoading(true);
      const res = await refreshConflicts(row);
      if (hasAnyConflictOrChanges(res)) {
        setResolveConflictData(res);
        setScheduleBlocked(true);
        return;
      }
      setProdScheduledTask(true);
    } catch {
      showCustomToast({
        type: ToastType.Error,
        title: "Failed",
        message: ERROR_MESSAGES.CHECK_CONFLICTS_FAILED,
      });
    } finally {
      setLoading(false);
    }
  };

  const closeConflictSidebar = () => {
    setOpenConflictSidebar(false);
    setResolveConflictData(undefined);
  };

  const rowActionHandlers = useMemo<Record<RowActionKey, (row: ConfiguratorTask) => void>>(() => ({
    view_details: (row) => openSidebar(row?.taskId, "overview"),
    view_work_log: (row) => openSidebar(row?.taskId, "worklogs"),
    resolve_conflicts: (row) => { handleResolveConflicts(row); },
    schedule_for_production: (row) => { handleScheduleForProduction(row); },
    assign_task: (row) => { setSelectedTaskId(row?.taskId); setSelectedRow(row); setAssignTask(true); },
    put_on_hold: (row) => { setSelectedTaskId(row?.taskMongoId); setPutOnHoldTask(true); },
    remove_hold: (row) => { setSelectedTaskId(row?.taskMongoId); setRemoveHoldTask(true); },
    cancel_task: (row) => { setSelectedTaskId(row?.taskMongoId); setCancelTask(true); },
    revert_to_draft: (row) => { setSelectedTaskId(row?.taskId); setRevertToDraftTask(true); },
  }), [handleResolveConflicts, handleScheduleForProduction]);

  const getRowActions = useCallback((row: ConfiguratorTask) =>
    visibleRowActions({ row, role, userName, permissions: userPermissions })
      .map(({ key, label }) => ({ label, onClick: rowActionHandlers[key] })),
    [role, userName, userPermissions, rowActionHandlers]);

  useEffect(() => {
    const tab = getDefaultParentTabIndex(role);
    tabStatesRef.current = {};
    setActiveParentTabIndex(tab);
    setActiveChildTabIndex(0);
    setPage(0);
    setSortField("");
    setSortOrder("DESC");
    setFilter({});
  }, [role]);

  const getChildTabs = (role: UserKey, parentTab: string): { label: string; value: string }[] => {
    const tab = TABS.find((t) => t.label === parentTab);
    if (!tab) return [];
    if ((parentTab === "My tasks" || parentTab === "All configuration tasks") && (role === USER_ROLES.QUALITY_REVIEWER || role === USER_ROLES.QUALITY_MANAGER)) {
      return tab.statuses.filter((s) => s.value === "needsAttention" || s.value === "inProgress");
    }
    return tab.statuses;
  };


  const handleParentTabSelect = (key: string | null) => {
    if (key === null) return;
    const newParentIdx = Number(key);
    tabStatesRef.current[getTabKey(activeParentTabIndex, activeChildTabIndex)] = { page, sortField, sortOrder, filter };
    const savedState = tabStatesRef.current[getTabKey(newParentIdx, 0)] ?? { page: 0, sortField: "", sortOrder: "DESC" as const, filter: {} };
    setActiveParentTabIndex(newParentIdx);
    setActiveChildTabIndex(0);
    setPage(savedState.page);
    setSortField(savedState.sortField);
    setSortOrder(savedState.sortOrder);
    setFilter(savedState.filter);
  };

  const handleChildTabSelect = (key: string | null) => {
    if (key === null) return;
    const newChildIdx = Number(key);
    tabStatesRef.current[getTabKey(activeParentTabIndex, activeChildTabIndex)] = { page, sortField, sortOrder, filter };
    const savedState = tabStatesRef.current[getTabKey(activeParentTabIndex, newChildIdx)] ?? { page: 0, sortField: "", sortOrder: "DESC" as const, filter: {} };
    setActiveChildTabIndex(newChildIdx);
    setPage(savedState.page);
    setSortField(savedState.sortField);
    setSortOrder(savedState.sortOrder);
    setFilter(savedState.filter);
  };

  const selectedParentTab = parentTabs[activeParentTabIndex];
  const childTabs = getChildTabs(role, selectedParentTab);

  return (
    <main className="dashboard configurator">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <h2>Welcome, {userName}!</h2>
      </div>
      <Tabs
        id="parent-tab"
        activeKey={activeParentTabIndex}
        onSelect={handleParentTabSelect}
      >
        {parentTabs.map((tab, index) => (
          <Tab
            key={tab}
            eventKey={index}
            title={tab}
          />
        ))}
      </Tabs>

      <section className="table-section">
        <div className="d-flex justify-content-between align-items-center">
          <Tabs
            id="child-tab"
            activeKey={activeChildTabIndex}
            onSelect={handleChildTabSelect}
            className="mt-3"
          >
            {childTabs.map((tab, index) => {
              const count = countsBySubTab[tab.value];
              return (
                <Tab
                  key={tab.value}
                  eventKey={index}
                  title={count !== undefined ? `${tab.label} (${count})` : tab.label}
                />
              );
            })}
          </Tabs>

          <div>
            <Button variant="secondary" className="button button-transparent btn-download" disabled={data?.length === 0 || loading || downloading} onClick={downloadTableData}>
              <>
                <ArrowDownload className="mr-2" />Download CSV
              </>
            </Button>
          </div>
        </div>
        {loading ? <Loader text="Loading" /> : <div className="custom-table-wrapper relative w-full">
          <CustomTable
            key={0}
            data={data || []}
            columns={dataColumns}
            showEllipsisColumn
            ellipsisOptions={(row) => getRowActions(row)}
            rowsPerPage={NO_OF_RECORDS_PER_PAGE_INDIVIDUAL}
            showPagination={true}
            totalRecords={totalResults}
            page={page}
            onPageChange={(newPage) => setPage(newPage)}
            serverSideFiltering
            controlledServerFilters={filter}
            onServerFilterChange={(filters) => {
              setFilter(filters)
              setPage(0)
            }}
            onChangeSortParams={(field, order) => {
              setSortField(field || "");
              setSortOrder(order ? "ASC" : "DESC");
              setPage(0);
            }}
          />
        </div>}
      </section>
      <TaskActionModal
        show={putOnHoldTask}
        handleClose={() => setPutOnHoldTask(false)}
        onConfirm={handlePutOnHold}
        title="Put on hold"
        confirmLabel="Put on hold"
        reasonOptions={PUT_ON_HOLD_REASON_OPTIONS}
        commentsPlaceholder={MODAL_MSSG.PUT_ON_HOLD_REASON}
        showConfirmCheckbox
        checkboxLabel={MODAL_MSSG.CONFIRM_HOLD_TASK}
      />
      <TaskActionModal
        show={cancelTask}
        handleClose={() => setCancelTask(false)}
        onConfirm={handleCancelTask}
        title="Cancel task"
        confirmLabel="Submit Cancellation"
        reasonOptions={PUT_ON_HOLD_REASON_OPTIONS}
        commentsPlaceholder={MODAL_MSSG.CANCELATION_REASON}
        showConfirmCheckbox
        checkboxLabel={MODAL_MSSG.CONFIRM_CANCEL_TASK}
      />
      <AssignModal
        createdBy={selectedRow?.createdBy}
        show={assignTask}
        taskId={selectedTaskId}
        handleClose={() => setAssignTask(false)}
        handleAssign={(method, id) => {
          setAssignTask(false);
          if (selectedRow) handleAssignTask(selectedRow, method, id);
        }}
      />
      <BasicModal
        show={removeHoldTask}
        handleClose={() => setRemoveHoldTask(false)}
        title="Remove hold?"
        button1="Cancel" button2="Remove hold"
        content="This resumes the task and notifies assignees."
        onBtnClick2={handleRemoveHold}
      />
      <BasicModal
        show={revertToDraftTask}
        handleClose={() => setRevertToDraftTask(false)}
        title={MODAL_MSSG.REVERT_TO_DRAFT_TITLE}
        button1="Cancel" button2="Revert to draft"
        content={MODAL_MSSG.REVERT_TO_DRAFT_CONTENT}
        onBtnClick2={handleRevertToDraft}
      />
      <BasicModal
        show={scheduleBlocked}
        handleClose={() => { setScheduleBlocked(false); setResolveConflictData(undefined); }}
        title={MODAL_MSSG.CANNOT_SCHEDULE_TITLE}
        content={
          <span>
            {MODAL_MSSG.CANNOT_SCHEDULE_CONFLICT}
            <br />
            {MODAL_MSSG.CANNOT_SCHEDULE_RESOLVE_FIRST}
          </span>
        }
        button1="Cancel"
        button2="Resolve conflicts"
        onBtnClick2={() => {
          setScheduleBlocked(false);
          setOpenConflictSidebar(true);
        }}
      />
      <ProdScheduleModal
        show={prodScheduledTask}
        onClose={() => setProdScheduledTask(false)}
        taskPlannedLaunchDate={selectedRow?.plannedLaunchDate}
        schedule={(plannedLaunchDate: string) => {
          handleProdSchedule(selectedTaskId, plannedLaunchDate);
          setProdScheduledTask(false);
        }}
      />
      <SideModal
        title={`Task ID: ${sidebarState?.taskId}`}
        show={sidebarState !== null}
        onHide={closeSidebar}
      >
        <TaskDetailSidebar
          key={`${sidebarState?.taskId}-${sidebarState?.tabKey}`}
          tabKey={sidebarState?.tabKey}
          taskId={sidebarState?.taskId}
          data={data?.find(task => task?.taskId === sidebarState?.taskId)}
          downloadFunctionality={true}
        />
      </SideModal>
      <ResolveConflictsModal
        show={openConflictSidebar}
        data={resolveConflictData}
        onBackToEditing={closeConflictSidebar}
        onSaveConflict={() => {
          closeConflictSidebar();
          fetchData(page, sortField, sortOrder, filter, activeParentTabIndex, activeChildTabIndex);
        }}
      />
    </main>
  )
};
export default ConfiguratorDashboard;
