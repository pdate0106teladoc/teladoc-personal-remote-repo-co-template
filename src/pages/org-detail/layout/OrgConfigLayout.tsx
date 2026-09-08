import "@/pages/org-detail/styles/OrgConfigLayout.scss";
import { Outlet, useLocation, useParams, useNavigate } from "react-router-dom";
import ConfigHeader from "@/components/ConfigHeader/ConfigHeader";
import SidebarNav from "@/components/SidebarNavigation/SidebarNav";
import { ORG_DETAIL_PATH, TASKS_DASHBOARD_PATH } from "@/router/routes";
import useConfigStore from "@/store/configStore";
import SyncModal from "@/components/SyncModal/SyncModal";
import SyncRibbon from "@/components/SyncRibbon/SyncRibbon";
import {
  formatRelativeTime,
  getTimeDiffInMinutes,
  isDateInPast,
  extractEntityData,
} from "@/utils";
import api from "@/api/apiService";
import {
  FailSafePage,
  showCustomToast,
  ValidateRibbon,
  Loader,
  ActionButton,
  SideModal,
  ValidationSummarySlider,
  PlannedLaunchDateRibbon,
  extractDisplayValue,
  getUserPermissions,
  hasPermission,
  hasAllPermission,
} from "@ucc/common-ui";
import {
  API_ENDPOINTS,
  ERROR_MESSAGES,
  LABELS,
  MODAL_MSSG,
  RIBBON_MSSG,
  ToastType,
} from "@/constants";
import { Suspense, useCallback, useEffect, useState } from "react";
import useOrgStore from "@/store/useOrgStore";
import {
  GeneralSettings,
  Billing,
  Eligibility,
  Reporting,
  Marketing,
} from "@/types/OrgView";
import { formatUTCToEST } from "@/utils";
import { CheckMarkCircle as SyncIcon } from "@ucc/common-ui";
import EditConfig from "@/components/sidebar/TaskCreate";
import SubmitUpdateForm from "@/components/sidebar/SubmitUpdateParentForm";
import BasicModal from "@/components/Modal/BasicModal";
import useEditStore from "@/store/editStore";
import PendingRibbon from "@/components/PendingRibbon/PendingRibbon";
import RefreshRibbon from "@/components/RefreshRibbon/RefreshRibbon";
import { OverlayTrigger, Spinner, Tooltip } from "react-bootstrap";
import { Task, TaskResponse, ValidationResponse } from "@/types/edit";
import UpdatePlannedLaunchDateModal from "@/components/Modal/UpdatePlannedLaunchDateModal";
import { useEditModeNavigationBlocker } from "@/hooks/useEditModeNavigationBlocker";
import {
  useAutoSavePatch,
  buildAutoSaveRetryToastMessage,
} from "@/hooks/useAutoSavePatch";
import { getOrgConfigFromGeneralSettings } from "@/utils";
import ConfigReview from "@/components/Review/ConfigReview";
import useReviewStore from "@/store/useReviewStore";
import ReviewSummaryRibbon from "@/components/ReviewSummaryRibbon/ReviewSummaryRibbon";
import {
  shouldShowAutoSaveStatus,
  isRejectedReviewFixMode as checkRejectedReviewFixMode,
  isReviewerInProgressMode as checkReviewerInProgressMode,
} from "@/utils/configHeaderIndicator";
import { submitRejectedReviewCorrections } from "@/components/Review/submitRejectedReviewCorrections";
import { saveReviewerMarkedFailedFields } from "@/components/Review/saveReviewerMarkedFailedFields";
import { isTaskOwner } from "@/utils/taskAccess";
import ResolveConflictsModal from "@/components/sidebar/ResolveConflictSidebar";
import { hasPendingConflicts, hasProductionConflicts } from "@/data/conflictCards";
import type { ConflictResponse } from "@/data/conflictCards";
import { isRebuttalEligible } from "@/utils/rebuttalAccess";
import { getUserRoles } from "@/utils";

interface OrgPageData {
  data: {
    organizationGeneralSettings: GeneralSettings;
    organizationBilling: Billing;
    organizationEligibility: Eligibility;
    organizationMarketing: Marketing;
    organizationReporting: Reporting;
  };
}

const OrgConfigLayout = () => {
  const rulesUrl = import.meta.env.VITE_RULES_URL;
  const taskUrl = import.meta.env.VITE_TASK_URL;
  const editBaseUrl = import.meta.env.VITE_EDIT_URL;
  const [apiFailed, setApiFailed] = useState<boolean>(false);
  const [shouldShowSyncModal, setShouldShowSyncModal] =
    useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();
  const excludedPaths = [
    "opportunities",
    "hierarchy",
    "comments",
    "history-logs",
  ];
  const isExcludedPage = excludedPaths.some((path) =>
    location.pathname.includes(path),
  );
  const { id, candidateId } = useParams<{ id: string; candidateId?: string }>();
  const [orgData, setOrgData] = useState<any | null>(null);
  const orgName = useConfigStore((state) => state.org.orgName);
  const orgId = useConfigStore((state) => state.org.orgId);
  const orgUpdatedAt = useConfigStore((state) => state.org.updatedAt);
  const setOrg = useConfigStore((state) => state.setOrg);
  const clearSavePayload = useEditStore((state) => state.clearSavePayload);
  const setIsSaving = useEditStore((state) => state.setIsSaving);
  const setLastSavedAt = useEditStore((state) => state.setLastSavedAt);
  const setSaveTimerId = useEditStore((state) => state.setSaveTimerId);
  const isSaving = useEditStore((state) => state.isSaving);
  const lastSavedAt = useEditStore((state) => state.lastSavedAt);
  const isEditMode = location.pathname.includes("/edit/");
  const isReviewMode = location.pathname.includes("/review/");
  const [showRefreshTooltip, setShowRefreshTooltip] = useState<boolean>(false);
  const [showRefreshRibbon, setShowRefreshRibbon] = useState<boolean>(false);
  const [showConflictsRibbon, setShowConflictsRibbon] = useState<boolean>(false);
  const [openRefreshModal, setOpenRefreshModal] = useState<boolean>(false);
  const [prodConflicts, setProdConflicts] = useState<boolean>(false);
  const [pendingConflicts, setPendingConflicts] = useState<boolean>(false);
  const hasConflicts = prodConflicts || pendingConflicts;
  const [openConflictSidebar, setOpenConflictSidebar] = useState<boolean>(false);
  const [conflictPrompt, setConflictPrompt] = useState<
    "production" | "pending" | null
  >(null);
  const [resolveConflictData, setResolveConflictData] = useState<ConflictResponse | undefined>();
  const [showEditConfig, setShowEditConfig] = useState<boolean>(false);
  const [submitUpdate, setSubmitUpdate] = useState<boolean>(false);
  const setShowTaskDetailSidebar = useReviewStore(
    (s) => s.setShowTaskDetailSidebar,
  );
  const userName = sessionStorage.getItem("name");
  const {
    setGeneralSettings,
    setBillingData,
    setEligibilityData,
    setMarketingData,
    setReportingData,
    getGeneralSettings,
    getBillingData,
    getEligibilityData,
    getMarketingData,
    getReportingData,
  } = useOrgStore();
  const data = getGeneralSettings(id!);
  const [loading, setLoading] = useState<boolean>(!data);
  const clearEditState = useEditStore((state) => state.clearEditState);
  const setLiveEntityData = useEditStore((state) => state.setLiveEntityData);
  const [relativeTime, setRelativeTime] = useState<string>("");
  const [validate, setValidate] = useState<boolean>(false);
  const [lastValidated, setLastValidated] = useState<string | null>(null);
  const [errors, setErrors] = useState<any[]>([]);
  const [warnings, setWarnings] = useState<any[]>([]);
  const [pendingChanges, setPendingChanges] = useState<any[]>([]);
  const liveEntityData = useEditStore((state) => state.liveEntityData);
  const userPermission = getUserPermissions();
  const [entityId, setEntityId] = useState<string>("");
  const [continueRequired, setContinueRequired] = useState<boolean>(false);
  const [orgMetadata, setOrgMetadata] = useState<Record<string, any> | null>(
    null,
  );
  const [tasKDetails, setTasksDetails] = useState<TaskResponse | undefined>();
  const [showPlannedLauncedModal, setShowPlannedLaunchedModal] =
    useState<boolean>(false);
  const setShowCompleteReviewModal = useReviewStore(
    (s) => s.setShowCompleteReviewModal,
  );
  const isRejectedReviewFixMode = checkRejectedReviewFixMode({
    isReviewMode,
    taskStatus: tasKDetails?.status,
  });
  const isReviewerInProgressMode = checkReviewerInProgressMode({
    isReviewMode,
    taskStatus: tasKDetails?.status,
  });
  const setShowRebuttalModal = useReviewStore((s) => s.setShowRebuttalModal);
  // Populated by ConfigReview from the review API response.
  const rebuttalWindow = useReviewStore((s) => s.rebuttalWindow);
  const canSendRebuttal = isRebuttalEligible({
    userName,
    taskDetails: tasKDetails,
    userRoles: getUserRoles(),
    allowRebuttal: rebuttalWindow?.allowRebuttal,
  });
  const isTaskEditLikeMode = isEditMode || isRejectedReviewFixMode;
  const shouldBlockNavigation = isTaskEditLikeMode || isReviewerInProgressMode;

  const { handleSaveChanges, flushPendingSave } = useAutoSavePatch({
    entityType: "organizations",
    entityId,
    editBaseUrl,
  });

  useEffect(() => {
    if (!showRefreshTooltip) return;
    const timer = setTimeout(() => setShowRefreshTooltip(false), 6000);
    return () => clearTimeout(timer);
  }, [showRefreshTooltip]);

  useEffect(() => {
    setShowRefreshRibbon(false);
    setShowConflictsRibbon(false);
    setShowRefreshTooltip(false);
    setProdConflicts(false);
    setPendingConflicts(false);
    setConflictPrompt(null);
    setResolveConflictData(undefined);
  }, [id, candidateId]);

  useEffect(() => {
    const fetchOrgData = async () => {
      setLoading(true);
      try {
        const res: OrgPageData = await api.get(
          `${API_ENDPOINTS.organization}/${id}`,
        );
        const responseData = res?.data || res;
        setOrgData(responseData);
        setLiveEntityData(responseData);
        setGeneralSettings(
          id!,
          responseData?.organizationGeneralSettings || {},
        );
        setBillingData(id!, responseData?.organizationBilling || {});
        setEligibilityData(id!, responseData?.organizationEligibility || {});
        setMarketingData(id!, responseData?.organizationMarketing || {});
        setReportingData(id!, responseData?.organizationReporting || {});
        setOrg(
          getOrgConfigFromGeneralSettings(
            responseData?.organizationGeneralSettings,
            responseData?.organizationGeneralSettings?.updatedAt,
          ),
        );
      } catch {
        showCustomToast({
          type: ToastType.Error,
          title: "Failed",
          message: ERROR_MESSAGES.SOMETHINGS_WRONG,
        });
        setApiFailed(true);
        return null;
      } finally {
        setLoading(false);
      }
    };
    if (!data) fetchOrgData();
    else {
      const orgData = {
        organizationGeneralSettings: getGeneralSettings(id!),
        organizationBilling: getBillingData(id!),
        organizationEligibility: getEligibilityData(id!) ?? {},
        organizationMarketing: getMarketingData(id!),
        organizationReporting: getReportingData(id!),
      };
      setOrgData(orgData);
      setLiveEntityData(orgData);
      setOrg(getOrgConfigFromGeneralSettings(data));
    }
  }, [id]);

  const fetchOrgMetadata = useCallback(
    async () => {
      if ((!isTaskEditLikeMode && !isReviewMode) || !id || !editBaseUrl) return;
      // Review mode renders its own loader and only needs metadata for the optional
      // "Show all fields" toggle. Blocking the content area here would unmount
      // ConfigReview mid-flight and re-run its one-shot status claim on remount.
      const blocksContentArea = !isReviewMode;
      try {
        if (blocksContentArea) setLoading(true);
        const metadataUrl = `${editBaseUrl}client-configurations/metadata/organizations/${tasKDetails?.entities[0]?.draftId}`;
        const res: Record<string, any> = await api.get(metadataUrl);
        setOrgMetadata(res ?? null);
        if (res) {
          setLiveEntityData(extractEntityData(res));
        }
      } catch {
        setOrgMetadata(null);
        showCustomToast({
          type: ToastType.Error,
          title: "Failed",
          message: ERROR_MESSAGES.SOMETHINGS_WRONG,
        });
      } finally {
        if (blocksContentArea) setLoading(false);
      }
    },
    [isTaskEditLikeMode, id, editBaseUrl, tasKDetails, setLiveEntityData],
  );

  useEffect(() => {
    if (tasKDetails) {
      fetchOrgMetadata();
    }
  }, [isTaskEditLikeMode, isReviewMode, id, editBaseUrl, tasKDetails, fetchOrgMetadata]);

  const fetchPendingTask = async () => {
    try {
      const res: Task[] = await api.get(
        `${taskUrl}client-configurations/tasks/pending/organization/${id}`,
      );
      if (res?.length > 0) {
        setPendingChanges(res);
      }
    } catch (err) {
      showCustomToast({
        type: ToastType.Error,
        title: "Failed",
        message: ERROR_MESSAGES.SOMETHINGS_WRONG,
      });
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchPendingTask();
  }, [id]);

  const fetchTaskDetails = async () => {
    if (!candidateId || (!isEditMode && !isReviewMode)) return;
    try {
      const response: TaskResponse = await api.get(
        `${taskUrl}client-configurations/tasks/${candidateId}`,
      );
      if (response?.entities?.length > 0) {
        setEntityId(response.entities[0].draftId);
        setTasksDetails(response);
      }
    } catch (err) {
      console.error("Failed to fetch task details:", err);
    }
  };
  useEffect(() => {
    fetchTaskDetails();
  }, [candidateId, isEditMode, isReviewMode, taskUrl]);

  useEffect(() => {
    if (!orgId) return;

    const checkSyncStatus = () => {
      const stored = localStorage.getItem(`syncJob_${orgId}`);

      if (!stored) {
        setShouldShowSyncModal(true);
        return;
      }

      const parsed = JSON.parse(stored);
      const last = parsed?.lastSynced;

      if (!last) {
        setShouldShowSyncModal(true);
        return;
      }

      const diff = getTimeDiffInMinutes(last);

      if (diff === null || diff >= 10) {
        setShouldShowSyncModal(true);
      } else {
        setShouldShowSyncModal(false);
      }
    };

    checkSyncStatus();

    const interval = setInterval(checkSyncStatus, 60 * 1000);

    return () => clearInterval(interval);
  }, [orgId, orgUpdatedAt]);

  const NavItems: {
    name: string;
    path: string;
    type?: string;
    reqInEdit: "required" | "not-required" | "common";
  }[] = [
      { name: "General settings", path: "general-settings", reqInEdit: "common" },
      { name: "Billing", path: "billing", reqInEdit: "common" },
      { name: "Marketing", path: "marketing", reqInEdit: "common" },
      { name: "Reporting", path: "reporting", reqInEdit: "common" },
      { name: "Eligibility", path: "eligibility", reqInEdit: "common" },
      { name: "Opportunities", path: "opportunities", reqInEdit: "not-required" },
      { name: "Hierarchy", path: "hierarchy", reqInEdit: "common" },
      { name: "Contacts", path: "contacts", reqInEdit: "common" },
      {
        name: "Comments",
        path: "comments",
        type: "border-bottom",
        reqInEdit: "not-required",
      },
      { name: "History", path: "history-logs", reqInEdit: "not-required" },
      {
        name: "Opportunities",
        path: "opportunities-edit",
        type: "border-bottom",
        reqInEdit: "required",
      },
      { name: "Change requests", path: "change-requests", reqInEdit: "required" },
      { name: "Files", path: "files", reqInEdit: "required" },
      { name: "History", path: "history-logs", reqInEdit: "required" },
    ];

  type ActionKey =
    | "edit-config"
    | "submit-update"
    | "validate"
    | "view-summary"
    | "exit-edit"
    | "complete-review"
    | "view-task-info"
    // | "defer-peer-review"
    | "exit-review"
    | "send-rebuttal";

  const getActionSections = (): Array<{
    section: string;
    items: Array<{ key: ActionKey; label: string }>;
  }> => {
    if (isReviewMode && !isRejectedReviewFixMode) {
      return [
        {
          section: "review",
          items: [
            { key: "view-task-info", label: "View task information" },
            // { key: "defer-peer-review", label: "Defer peer review" },
          ],
        },
        {
          section: "exit",
          items: [{ key: "exit-review", label: "Exit" }],
        },
      ];
    }
    if (!isTaskEditLikeMode) {
      return [
        {
          section: "edit",
          items: [{ key: "edit-config", label: "Edit configuration" }],
        },
      ];
    }
    return [
      {
        section: "edit-mode",
        items: [
          { key: "validate", label: "Validate" },
          { key: "view-summary", label: "View validation summary" },
        ],
      },
      ...(canSendRebuttal
        ? [
          {
            section: "rebuttal",
            items: [
              { key: "send-rebuttal" as ActionKey, label: "Send rebuttal" },
            ],
          },
        ]
        : []),
      {
        section: "exit",
        items: [{ key: "exit-edit", label: "Exit edit mode" }],
      },
    ];
  };

  const renderActionItems = (): Record<
    string,
    { label: string; disabled: boolean }[]
  > => {
    return Object.fromEntries(
      getActionSections().map(({ section, items }) => [
        section,
        items.map(({ label }) => ({ label, disabled: false })),
      ]),
    );
  };

  const renderReviewItems = (): Record<
    string,
    { label: string; disabled: boolean }[]
  > => {
    return Object.fromEntries(
      getActionSections().map(({ section, items }) => [
        section,
        items.map(({ label }) => ({ label, disabled: false })),
      ]),
    );
  };

  const getUrlParts = () => {
    const pathParts = location.pathname.split("/");
    const pageName = pathParts[pathParts.length - 1];
    const orgType = location.pathname.includes("/org-detail/")
      ? "org-detail"
      : "groups";
    return { pageName, orgType };
  };

  const getExitUrl = () => {
    if (isRejectedReviewFixMode) {
      return TASKS_DASHBOARD_PATH;
    }
    if (!id) return null;
    const { pageName, orgType } = getUrlParts();
    return `/CCC/${orgType}/${id}/${pageName}`;
  };

  const onConfirmLeavePage = useCallback(() => {
    setLastSavedAt(null);
    setSaveTimerId(null);
    setIsSaving(false);
    clearSavePayload();
    clearEditState();
  }, [
    clearEditState,
    clearSavePayload,
    setIsSaving,
    setLastSavedAt,
    setSaveTimerId,
  ]);

  const {
    isExitModalOpen,
    cancelBlockedNavigation,
    confirmBlockedNavigation,
    navigateWithoutPrompt,
    requestExitConfirmation,
  } = useEditModeNavigationBlocker({
    isEditMode: shouldBlockNavigation,
    navigate,
  });

  const persistReviewerProgressOnExit =
    useCallback(async (): Promise<boolean> => {
      if (!isReviewerInProgressMode || !candidateId) return true;
      if (useReviewStore.getState().failedFields.size === 0) return true;

      try {
        await saveReviewerMarkedFailedFields({ candidateId, taskUrl });
        return true;
      } catch {
        showCustomToast({
          type: ToastType.Error,
          title: "Failed",
          message: "Failed to save review progress. Please try again.",
        });
        return false;
      }
    }, [candidateId, isReviewerInProgressMode, taskUrl]);

  async function handleExit() {
    if (!(await persistReviewerProgressOnExit())) return;

    confirmBlockedNavigation({
      fallbackUrl: getExitUrl(),
      onBeforeNavigate: isTaskEditLikeMode ? onConfirmLeavePage : undefined,
    });
  }

  const navigateOutOfEditMode = useCallback(
    (url: string) => {
      const currentTimerId = useEditStore.getState().saveTimerId;
      if (currentTimerId) clearTimeout(currentTimerId);
      navigateWithoutPrompt(url, onConfirmLeavePage);
    },
    [navigateWithoutPrompt, onConfirmLeavePage],
  );

  useEffect(() => {
    if (!shouldBlockNavigation) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (
        (window as Window & { __sessionTimingOut?: boolean }).__sessionTimingOut
      )
        return;
      e.preventDefault();
    };
    const onUnload = () => {
      if (isTaskEditLikeMode) {
        onConfirmLeavePage();
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("unload", onUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("unload", onUnload);
    };
  }, [shouldBlockNavigation, isTaskEditLikeMode, onConfirmLeavePage]);

  useEffect(() => {
    if (!lastSavedAt) {
      setRelativeTime("");
      return;
    }

    const updateTime = () => {
      const formatted = formatRelativeTime(lastSavedAt, {
        omitZeroMinutes: true,
      });
      setRelativeTime(formatted === "-" ? "" : formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [lastSavedAt]);

  const handleValidate = async (): Promise<
    | {
      errorInfo: ValidationResponse["errorInfo"];
      warningInfo: ValidationResponse["warningInfo"];
    }
    | null
    | undefined
  > => {
    try {
      const res = await api.postWithResponse<ValidationResponse>(
        `${rulesUrl}validate/organization/${orgId}`,
        liveEntityData,
      );
      if (res.status === 204) return undefined;
      const responseData = res.data || res;
      const errorInfo = responseData.errorInfo || [];
      const warningInfo = responseData.warningInfo || [];
      setErrors(errorInfo);
      setWarnings(warningInfo);
      setLastValidated(responseData?.timestamp ?? new Date().toISOString());
      const nextRuleSetIds = responseData?.ruleSetIds ?? [];
      await updateValidationResult(errorInfo, nextRuleSetIds);
      if (errorInfo.length === 0 && warningInfo.length === 0) {
        showCustomToast({
          type: ToastType.Success,
          title: "Validation successful",
          message: "Validation completed with no errors or warnings.",
        });
      }
      return { errorInfo, warningInfo };
    } catch {
      showCustomToast({
        type: ToastType.Error,
        title: "Failed",
        message: "Failed to validate",
      });
      return null;
    }
  };

  const updateValidationResult = async (
    errorInfo: ValidationResponse["errorInfo"],
    idsForPayload: string[],
  ) => {
    try {
      const validationState = errorInfo.length > 0 ? "FAILED" : "PASSED";
      const payload = {
        draftId: entityId,
        validationState: validationState,
        ruleSetIds: idsForPayload,
      };
      await api.post(`${taskUrl}validate/ORGANIZATION/${id}`, payload);
    } catch {
      showCustomToast({
        type: ToastType.Error,
        title: "Failed",
        message: "Failed to update validation result",
      });
    }
  };

  const fetchValidationSummary = async () => {
    try {
      const res: any = await api.get(
        `${rulesUrl}validate/summary?orgId=${orgId}`,
      );
      const responseData = res?.data || res;
      setErrors(responseData.errorInfo || []);
      setWarnings(responseData.warningInfo || []);
      setLastValidated(
        responseData.metadata?.timestamp ?? new Date().toISOString(),
      );
    } catch {
      showCustomToast({
        type: ToastType.Error,
        title: "Failed",
        message: "Failed to fetch validation summary",
      });
    }
  };

  async function dispatchAction(key: ActionKey | null) {
    switch (key) {
      case "edit-config":
        setShowEditConfig(true);
        break;
      case "submit-update": {
        if (hasConflicts) {
          setConflictPrompt(prodConflicts ? "production" : "pending");
          break;
        }
        let prodDrifted = false;
        let pendingDrifted = false;
        const driftToastId = showCustomToast({
          type: ToastType.Loading,
          title: MODAL_MSSG.CHECKING_CONFLICTS_TITLE,
          message: MODAL_MSSG.CHECKING_CONFLICTS,
        });
        try {
          const res: any = await api.get(
            `${editBaseUrl}client-configurations/conflicts/check-production-drift?draftId=${entityId}&entityType=ORGANIZATION`,
          );
          prodDrifted = Boolean(res?.drifted);
          pendingDrifted = Boolean(res?.hasPendingConflicts);
          setShowRefreshRibbon(prodDrifted);
          setShowConflictsRibbon(pendingDrifted);
          setShowRefreshTooltip(prodDrifted);
        } catch {
          showCustomToast({
            type: ToastType.Error,
            title: "Failed",
            message: ERROR_MESSAGES.CHECK_CONFLICTS_FAILED,
          });
          break;
        } finally {
          showCustomToast.dismiss(driftToastId);
        }
        if (prodDrifted || pendingDrifted) break;
        const saved = await flushPendingSave();
        if (!saved) {
          showCustomToast({
            type: ToastType.Error,
            title: "Unable to save your changes",
            message: buildAutoSaveRetryToastMessage(() => {
              void dispatchAction("submit-update");
            }),
          });
          break;
        }
        if (isRejectedReviewFixMode && candidateId) {
          try {
            await submitRejectedReviewCorrections({ candidateId, taskUrl });
          } catch {
            showCustomToast({
              type: ToastType.Error,
              title: "Failed",
              message: "Failed to save corrected fields. Please try again.",
            });
            break;
          }
        }
        const result = await handleValidate();
        if (result === null) break;
        const hasIssues = (result?.errorInfo?.length ?? 0) > 0;
        setContinueRequired(true);
        if (!hasIssues) setSubmitUpdate(true);
        else setValidate(true);
        break;
      }
      case "validate": {
        const saved = await flushPendingSave();
        if (!saved) {
          showCustomToast({
            type: ToastType.Error,
            title: "Unable to save your changes",
            message: buildAutoSaveRetryToastMessage(() => {
              void dispatchAction("validate");
            }),
          });
          break;
        }
        const result = await handleValidate();
        if (result === null) break;
        const hasIssues = (result?.errorInfo?.length ?? 0) > 0;
        setContinueRequired(false);
        if (hasIssues) setValidate(true);
        break;
      }
      case "view-summary":
        setContinueRequired(false);
        await fetchValidationSummary();
        setValidate(true);
        break;
      case "exit-edit":
        requestExitConfirmation(getExitUrl());
        break;
      case "complete-review":
        setShowCompleteReviewModal(true);
        break;
      case "send-rebuttal":
        setShowRebuttalModal(true);
        break;
      case "view-task-info":
        setShowTaskDetailSidebar(true);
        break;
      // case "defer-peer-review":
      //   break;
      case "exit-review": {
        if (!(await persistReviewerProgressOnExit())) break;
        navigate(TASKS_DASHBOARD_PATH);
        break;
      }
      default:
        break;
    }
  }

  async function handleActionSelect(eventKey: string | null) {
    if (!eventKey) return;
    const [sectionIdx, itemIdx] = eventKey.split("-").map(Number);
    const key = getActionSections()[sectionIdx]?.items[itemIdx]?.key ?? null;
    await dispatchAction(key);
  }

  const SyncRender = () => {
    return (
      <>
        {isSaving ? (
          <div className="d-flex align-items-center gap-2">
            <Spinner
              animation="border"
              role="status"
              className="saving-spinner"
            />
            <span className="text-muted">{LABELS.editConfig.SAVING}</span>
          </div>
        ) : lastSavedAt ? (
          <div className="d-flex align-items-center gap-2">
            <SyncIcon />
            <span className="draft-save">
              {relativeTime
                ? `${LABELS.editConfig.SAVED} ${relativeTime}`
                : LABELS.editConfig.SAVED}
            </span>
          </div>
        ) : null}
      </>
    );
  };

  const orgEdit = hasPermission(userPermission, "config:org:edit");
  const groupEdit = hasPermission(userPermission, "config:group:edit");
  const hasSyncPermission = hasPermission(userPermission, "data:refresh");
  const hasSimpleEditPermission = hasPermission(
    userPermission,
    "data:simple-edit",
  );

  const hasReadPermissions = hasAllPermission(userPermission, [
    "config:co-po:read",
    "config:group:read",
    "config:opportunity:read",
    "config:org:read",
    "config:product:read",
  ]);

  const permissionToEditCandidate = (): boolean | null => {
    if (isTaskEditLikeMode && !tasKDetails) return null; // task details still in-flight
    if (!isTaskEditLikeMode) return true;
    return isTaskOwner({
      userName,
      taskDetails: tasKDetails,
      isRejectedReviewFixMode,
    });
  };

  const renderActionBasedOnPermissions = () => {
    const { orgType } = getUrlParts();
    if (orgType === "org-detail" && (orgEdit || hasSimpleEditPermission)) {
      return true;
    } else if (orgType === "groups" && (groupEdit || hasSimpleEditPermission)) {
      return true;
    } else {
      return false;
    }
  };

  const renderContent = () => {
    const editPermission = permissionToEditCandidate();

    if (loading || editPermission === null) {
      return <Loader text="Loading..." className="content-area-loader" />;
    }

    if (!hasReadPermissions || editPermission === false) {
      return <FailSafePage cardType="unauthorized" />;
    }

    if (apiFailed && !isExcludedPage) {
      return <FailSafePage cardType="dataFailed" />;
    }

    if (isReviewMode) {
      return (
        <ConfigReview
          entityType="organization"
          taskDetails={tasKDetails}
          handleSaveChanges={handleSaveChanges}
          navigateWithoutBlock={(url) => navigateWithoutPrompt(url)}
          metadata={orgMetadata}
        />
      );
    }

    return (
      <Suspense
        fallback={<Loader text="Loading..." className="content-area-loader" />}
      >
        <Outlet context={{ handleSaveChanges, orgMetadata }} />
      </Suspense>
    );
  };

  const handleUpdatePlannedLaunchedDate = async (newDate: Date) => {
    setShowPlannedLaunchedModal(false);
    const payload = {
      priority: tasKDetails?.priority?.toLocaleUpperCase(),
      plannedLaunchDate: newDate.toISOString(),
    };
    try {
      await api.patch(
        `${taskUrl}client-configurations/tasks/${candidateId}`,
        payload,
      );
      showCustomToast({
        type: ToastType.Success,
        title: "Success",
        message: "Update submitted successfully.",
      });
      await fetchTaskDetails();
    } catch {
      showCustomToast({
        type: ToastType.Error,
        title: "Failed",
        message: "Failed to update task. Please try again.",
      });
    }
  };

  const handleRefreshProductionData = async (forConflicts?: boolean) => {
    try {
      const res: any = await api.post(
        `${editBaseUrl}client-configurations/conflicts/refresh?draftId=${entityId}&entityType=ORGANIZATION`,
      );
      const prodConflictsFound = hasProductionConflicts(res);
      const pendingConflictsFound = hasPendingConflicts(res);
      setProdConflicts(prodConflictsFound);
      setPendingConflicts(pendingConflictsFound);
      setShowRefreshRibbon(false);
      setShowConflictsRibbon(false);
      if (!prodConflictsFound && !pendingConflictsFound) {
        setShowRefreshTooltip(false);
        await fetchOrgMetadata();
      } else {
        setShowRefreshTooltip(prodConflictsFound);
        if (forConflicts) setConflictPrompt(prodConflictsFound ? "production" : "pending");
        setResolveConflictData(res);
      }
    } catch {
      showCustomToast({
        type: ToastType.Error,
        title: "Failed",
        message: ERROR_MESSAGES.SOMETHINGS_WRONG,
      });
      if (!forConflicts) setShowRefreshRibbon(true);
    } finally {
      setOpenRefreshModal(false);
    }
  };

  return (
    <>
      <ConfigHeader
        name={orgName ?? ""}
        id={orgId ?? ""}
        label="Org hierarchy ID"
        iconType="Org"
        taskStatus={tasKDetails?.status}
        syncStatus={
          shouldShowAutoSaveStatus({
            isEditMode,
            isReviewMode,
            taskStatus: tasKDetails?.status,
          }) ? (
            <SyncRender />
          ) : null
        }
        actions={
          <>
            {isReviewMode && !tasKDetails ? null : isReviewMode &&
              !isRejectedReviewFixMode ? (
              <ActionButton
                title="Complete review"
                sectionItems={renderReviewItems()}
                onSelect={handleActionSelect}
                plusIcon={false}
                className="action-button-spacing"
                onMainAction={() => void dispatchAction("complete-review")}
              />
            ) : (
              renderActionBasedOnPermissions() && (
                <OverlayTrigger
                  placement="top-end"
                  trigger={[]}
                  show={showRefreshTooltip}
                  overlay={
                    isTaskEditLikeMode ? (
                      <Tooltip id={`refresh-tooltip`} className="tooltip">
                        <span>{prodConflicts ? RIBBON_MSSG.MUST_RESOLVE_BEFORE_SUBMIT :
                          RIBBON_MSSG.MUST_REFRESH_BEFORE_SUBMIT}</span>
                      </Tooltip>
                    ) : (
                      <></>
                    )
                  }
                >
                  <div className="d-inline-block pt-4">
                    <ActionButton
                      title={
                        isTaskEditLikeMode ? "Submit update" : "Select action"
                      }
                      sectionItems={renderActionItems()}
                      onSelect={handleActionSelect}
                      plusIcon={false}
                      className="action-button-spacing"
                      onMainAction={
                        isTaskEditLikeMode
                          ? () => {
                            void dispatchAction("submit-update");
                          }
                          : undefined
                      }
                      mainActionDisabled={entityId === ""}
                    />
                  </div>
                </OverlayTrigger>
              )
            )}
          </>
        }
      />
      {shouldShowSyncModal &&
        hasSyncPermission &&
        !isEditMode &&
        !isReviewMode && (
          <SyncModal
            type="organization"
            id={orgId}
            lastUpdatedAt={orgUpdatedAt}
          />
        )}

      {orgId && isReviewMode && <ReviewSummaryRibbon />}

      {orgId && !isReviewMode && (
        <>
          {hasSyncPermission && !isEditMode && (
            <SyncRibbon
              type="organization"
              id={orgId}
              apiLastSynced={orgUpdatedAt}
            />
          )}
          {!isEditMode && (
            <>
              <ValidateRibbon
                type="organization"
                id={orgId}
                data={orgData}
                apiService={api}
                apiEndpoints={rulesUrl}
                formatUTCToEST={formatUTCToEST}
              />
              {pendingChanges?.length > 0 &&
                renderActionBasedOnPermissions() && (
                  <PendingRibbon data={pendingChanges} />
                )}
            </>
          )}
          {isEditMode &&
            isDateInPast(tasKDetails?.plannedLaunchDate) &&
            permissionToEditCandidate() && (
              <PlannedLaunchDateRibbon
                onAction={() => {
                  setShowPlannedLaunchedModal(true);
                }}
                plannedLaunchDate={
                  extractDisplayValue(tasKDetails?.plannedLaunchDate, "date")
                    .jsx
                }
              />
            )}
          {isEditMode && showRefreshRibbon && (
            <RefreshRibbon buttonLabel="Refresh" onRefresh={() => setOpenRefreshModal(true)} />
          )}
          {isEditMode && showConflictsRibbon && (
            <RefreshRibbon
              title={RIBBON_MSSG.CONFLICT_WITH_PENDING_TITLE}
              message={RIBBON_MSSG.CONFLICT_WITH_PENDING_MESSAGE}
              buttonLabel={RIBBON_MSSG.RESOLVE_CONFLICTS_BUTTON}
              variant="error"
              onRefresh={() => handleRefreshProductionData(true)} />
          )}
          {isEditMode && prodConflicts && (
            <RefreshRibbon
              title={RIBBON_MSSG.CONFLICT_WITH_PRODUCTION_TITLE}
              message={RIBBON_MSSG.CONFLICT_WITH_PRODUCTION_MESSAGE}
              buttonLabel={RIBBON_MSSG.RESOLVE_CONFLICTS_BUTTON}
              onRefresh={() => setOpenConflictSidebar(true)}
            />
          )}
          {isEditMode && pendingConflicts && (
            <RefreshRibbon
              title={RIBBON_MSSG.CONFLICT_WITH_PENDING_TITLE}
              message={RIBBON_MSSG.CONFLICT_WITH_PENDING_MESSAGE}
              buttonLabel={RIBBON_MSSG.RESOLVE_CONFLICTS_BUTTON}
              variant="error"
              onRefresh={() => setOpenConflictSidebar(true)}
            />
          )}
          <SideModal
            show={showEditConfig}
            onHide={() => setShowEditConfig(false)}
            title="Edit configuration"
          >
            <EditConfig
              setOpen={setShowEditConfig}
              onClose={async (response) => {
                setShowEditConfig(false);
                if (response?.entityId) {
                  setEntityId(response.entityId);
                }
                if (id) {
                  const candidateId =
                    response?.taskId ?? `candidate-${Date.now()}`;
                  const { orgType } = getUrlParts();
                  navigate(
                    `/CCC/${orgType}/${id}/edit/${candidateId}/general-settings`,
                  );
                  await fetchPendingTask();
                }
              }}
              entity="organization"
              pendingChanges={pendingChanges}
            />
          </SideModal>
          <UpdatePlannedLaunchDateModal
            show={showPlannedLauncedModal}
            handleClose={() => setShowPlannedLaunchedModal(false)}
            plannedLaunchDate={String(
              extractDisplayValue(tasKDetails?.plannedLaunchDate, "date").raw,
            )}
            onUpdate={handleUpdatePlannedLaunchedDate}
          />
        </>
      )}
      {orgId && isTaskEditLikeMode && (
        <>
          <SideModal
            show={submitUpdate}
            onHide={() => setSubmitUpdate(false)}
            title="Submit Update"
          >
            <SubmitUpdateForm
              flushPendingSave={flushPendingSave}
              onSubmitSuccess={() => {
                setSubmitUpdate(false);
                if (isTaskEditLikeMode && id) {
                  navigateOutOfEditMode(`${TASKS_DASHBOARD_PATH}`);
                }
              }}
            />
          </SideModal>
          <SideModal
            show={validate}
            title="Validation summary"
            onHide={() => setValidate(false)}
            data-testid="extract-jsx"
          >
            <ValidationSummarySlider
              errors={errors}
              warnings={warnings}
              lastValidated={lastValidated}
              onClose={() => setValidate(false)}
              onContinue={() => {
                setSubmitUpdate(true);
                setValidate(false);
              }}
              continureRequired={continueRequired}
            />
          </SideModal>
        </>
      )}
      <ResolveConflictsModal
        show={openConflictSidebar}
        onBackToEditing={() => setOpenConflictSidebar(false)}
        onSaveConflict={async () => {
          setProdConflicts(false);
          setPendingConflicts(false);
          setShowRefreshTooltip(false);
          setResolveConflictData(undefined);
          await fetchOrgMetadata();
        }}
        data={resolveConflictData}
      />
      <BasicModal
        show={isExitModalOpen}
        handleClose={cancelBlockedNavigation}
        title={MODAL_MSSG.EXIT_EDIT_TITLE}
        content={MODAL_MSSG.EXIT_EDIT_MODAL_WARNING}
        button1="Cancel"
        button2="Exit"
        onBtnClick2={handleExit}
      />
      <BasicModal
        show={openRefreshModal}
        handleClose={() => setOpenRefreshModal(false)}
        title={MODAL_MSSG.REFRESH_DATA_TITLE}
        content={
          <span>
            {MODAL_MSSG.REFRESH_DATA_KEEPS_CHANGES}
            <br />
            {MODAL_MSSG.REFRESH_DATA_REVIEW_CONFLICTS}
          </span>
        }
        button1="Cancel"
        button2="Refresh"
        onBtnClick2={handleRefreshProductionData}
      />
      <BasicModal
        show={conflictPrompt !== null}
        handleClose={() => setConflictPrompt(null)}
        title={MODAL_MSSG.RESOLVE_CONFLICTS_TITLE}
        content={
          <span className="conflict-prompt-content">
            {conflictPrompt === "pending"
              ? MODAL_MSSG.CONFLICT_WITH_PENDING_CHANGES
              : MODAL_MSSG.CONFLICT_WITH_LATEST_PRODUCTION}
            <br />
            {MODAL_MSSG.CONFLICT_REVIEW_AND_SELECT}
          </span>
        }
        button1="Cancel"
        button2="Review and select"
        onBtnClick2={() => { setOpenConflictSidebar(true); setConflictPrompt(null); }}
      />
      <div className="org-config-main-layout d-flex">
        {!isReviewMode && (
          <SidebarNav navItems={NavItems} basePath={ORG_DETAIL_PATH} />
        )}
        <div
          className={`org-config-content ${isEditMode ? "edit-mode" : ""} ${isReviewMode ? "review-mode" : ""}`}
        >
          {renderContent()}
        </div>
      </div>
    </>
  );
};

export default OrgConfigLayout;
// This component is responsible for rendering the layout of the organization configuration page.
