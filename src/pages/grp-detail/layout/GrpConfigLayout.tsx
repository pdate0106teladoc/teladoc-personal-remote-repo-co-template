import "@/pages/org-detail/styles/OrgConfigLayout.scss";
import { Outlet, useLocation, useParams, useNavigate } from "react-router-dom";
import ConfigHeader from "@/components/ConfigHeader/ConfigHeader";
import SidebarNav from "@/components/SidebarNavigation/SidebarNav";
import { GRP_DETAIL_PATH, TASKS_DASHBOARD_PATH } from "@/router/routes";
import useConfigStore from "@/store/configStore";
import useSyncStore from "@/store/useSyncStore";
import SyncRibbon from "@/components/SyncRibbon/SyncRibbon";
import SyncModal from "@/components/SyncModal/SyncModal";
import {
  formatRelativeTime,
  getTimeDiffInMinutes,
  isDateInPast,
  extractEntityData,
} from "@/utils";
import api from "@/api/apiService";
import {
  API_ENDPOINTS,
  ERROR_MESSAGES,
  LABELS,
  MODAL_MSSG,
  RIBBON_MSSG,
  ToastType,
} from "@/constants";
import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import useGroupStore from "@/store/useGroupStore";
import {
  GeneralSetting,
  Marketing,
  Billing,
  EligibilityAndClaims,
  GroupProductResponse,
  ProductDetailResponse,
  ProductBundleResponse,
} from "@/types/GrpView";
import { Reporting } from "@/types/OrgView";
import {
  ValidateRibbon,
  Loader,
  showCustomToast,
  FailSafePage,
  ActionButton,
  SideModal,
  ValidationSummarySlider,
  PlannedLaunchDateRibbon,
  extractDisplayValue,
  getUserPermissions,
  hasPermission,
  hasAllPermission,
} from "@ucc/common-ui";
import { formatUTCToEST } from "@/utils";
import EditConfig from "@/components/sidebar/TaskCreate";
import SubmitUpdateForm from "@/components/sidebar/SubmitUpdateParentForm";
import BasicModal from "@/components/Modal/BasicModal";
import useEditStore from "@/store/editStore";
import { CheckMarkCircle as SyncIcon } from "@ucc/common-ui";
import { OverlayTrigger, Spinner, Tooltip } from "react-bootstrap";
import apiService from "@/api/apiService";
import PendingRibbon from "@/components/PendingRibbon/PendingRibbon";
import RefreshRibbon from "@/components/RefreshRibbon/RefreshRibbon";
import { Task, TaskResponse, ValidationResponse } from "@/types/edit";
import UpdatePlannedLaunchDateModal from "@/components/Modal/UpdatePlannedLaunchDateModal";
import { useEditModeNavigationBlocker } from "@/hooks/useEditModeNavigationBlocker";
import {
  useAutoSavePatch,
  buildAutoSaveRetryToastMessage,
} from "@/hooks/useAutoSavePatch";
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

interface GrpPagesData {
  data: {
    groupGeneralSettings: GeneralSetting;
    groupMarketing: Marketing;
    groupBilling: Billing;
    groupReporting: Reporting;
    eligibilityAndClaims: EligibilityAndClaims;
    productBundleDto: GroupProductResponse;
    productDetailResponseDtoList: ProductDetailResponse[];
    productBundleDetailsDtos: ProductBundleResponse[];
  };
}

const GrpConfigLayout = () => {
  const rulesUrl = import.meta.env.VITE_RULES_URL;
  const taskUrl = import.meta.env.VITE_TASK_URL;
  const editBaseUrl = import.meta.env.VITE_EDIT_URL;
  const [apiFailed, setApiFailed] = useState<boolean>(false);
  const [shouldShowSyncModal, setShouldShowSyncModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const excludedPaths = ["hierarchy", "comments", "history-logs"];
  const isExcludedPage = excludedPaths.some((path) =>
    location.pathname.includes(path),
  );
  const { id, candidateId } = useParams<{ id: string; candidateId?: string }>();
  const [groupData, setGroupData] = useState<any | null>(null);
  // useConfigStore values for Group (separate from Org)
  const groupName = useConfigStore((state) => state.groupName);
  const groupId = useConfigStore((state) => state.groupId);
  const groupShortId = useConfigStore((state) => state.groupShortId);
  const groupUpdatedAt = useConfigStore((state) => state.groupUpdatedAt);
  // Sync Store
  const { hydrateJob } = useSyncStore();
  const isEditMode = location.pathname.includes("/edit/");
  const isReviewMode = location.pathname.includes("/review/");
  const [showEditConfig, setShowEditConfig] = useState<boolean>(false);
  const [submitUpdate, setSubmitUpdate] = useState<boolean>(false);
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
  const [resolveConflictData, setResolveConflictData] = useState<
    ConflictResponse | undefined
  >();
  const setShowTaskDetailSidebar = useReviewStore((s) => s.setShowTaskDetailSidebar);
  const [validate, setValidate] = useState<boolean>(false);
  const [lastValidated, setLastValidated] = useState<string | null>(null);
  const [errors, setErrors] = useState<any[]>([]);
  const [warnings, setWarnings] = useState<any[]>([]);
  const generalSettings = useGroupStore((state) =>
    id ? state.generalSettingsCache[id] : undefined,
  );
  const setGeneralSettings = useGroupStore((state) => state.setGeneralSettings);
  const setMarketingData = useGroupStore((state) => state.setMarketingData);
  const userName = sessionStorage.getItem("name");
  const {
    setBillingData,
    getMarketingData,
    getGeneralSettings,
    getBillingData,
    getReportingData,
    getEligibilityData,
    getProductsData,
    getProductDetailData,
    getProductBundleDetailData,
  } = useGroupStore();
  const setReportingData = useGroupStore((state) => state.setReportingData);
  const setEligibilityData = useGroupStore((state) => state.setEligibilityData);
  const setProductData = useGroupStore((state) => state.setProductsData);
  const setProductDetailData = useGroupStore(
    (state) => state.setProductDetailData,
  );
  const setProductBundleData = useGroupStore(
    (state) => state.setProductBundleDetailData,
  );
  const [loading, setLoading] = useState<boolean>(!generalSettings);
  const clearEditState = useEditStore((state) => state.clearEditState);
  const setLiveEntityData = useEditStore((state) => state.setLiveEntityData);
  const liveEntityData = useEditStore((state) => state.liveEntityData);
  const clearSavePayload = useEditStore((state) => state.clearSavePayload);
  const setIsSaving = useEditStore((state) => state.setIsSaving);
  const setLastSavedAt = useEditStore((state) => state.setLastSavedAt);
  const setSaveTimerId = useEditStore((state) => state.setSaveTimerId);
  const isSaving = useEditStore((state) => state.isSaving);
  const lastSavedAt = useEditStore((state) => state.lastSavedAt);
  const [relativeTime, setRelativeTime] = useState<string>("");
  const [pendingChanges, setPendingChanges] = useState<Task[]>([]);
  const userPermission = getUserPermissions();
  const [entityId, setEntityId] = useState<string>("");
  const [continueRequired, setContinueRequired] = useState<boolean>(false);
  const [groupMetadata, setGroupMetadata] = useState<Record<
    string,
    any
  > | null>(null);
  const [tasKDetails, setTasksDetails] = useState<TaskResponse | undefined>();
  const [showPlannedLauncedModal, setShowPlannedLaunchedModal] =
    useState<boolean>(false);
  const setShowCompleteReviewModal = useReviewStore((s) => s.setShowCompleteReviewModal);
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
    entityType: "groups",
    entityId,
    editBaseUrl,
  });

  const setGroupName = useConfigStore((state) => state.setGroupName);
  const setGroupId = useConfigStore((state) => state.setGroupId);
  const setGroupShortId = useConfigStore((state) => state.setGroupShortId);

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
    const fetchGrpData = async () => {
      setLoading(true);
      try {
        const res: GrpPagesData = await api.get(
          `${API_ENDPOINTS.groups}/${id}`,
        );
        const groupData = res?.data || res;
        setGroupData(groupData);
        setLiveEntityData(groupData);
        setGeneralSettings(id!, groupData?.groupGeneralSettings || {});
        setMarketingData(id!, groupData?.groupMarketing || {});
        setBillingData(id!, groupData?.groupBilling || {});
        setReportingData(id!, groupData?.groupReporting || {});
        setEligibilityData(id!, groupData?.eligibilityAndClaims || {});
        setProductData(id!, groupData?.productBundleDto || {});
        setProductDetailData(
          id!,
          groupData?.productDetailResponseDtoList || [],
        );
        setProductBundleData(id!, groupData?.productBundleDetailsDtos || []);
        const grpOverview = groupData?.groupGeneralSettings?.overview?.groupOverview;
        setGroupName(grpOverview?.groupName || "");
        setGroupId(grpOverview?.legacyGroupId || "");
        setGroupShortId(grpOverview?.groupId || "");
      } catch (err) {
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
    if (!generalSettings) fetchGrpData();
    else {
      const groupData = {
        groupGeneralSettings: getGeneralSettings(id!),
        groupMarketing: getMarketingData(id!),
        groupBilling: getBillingData(id!),
        groupReporting: getReportingData(id!),
        eligibilityAndClaims: getEligibilityData(id!),
        productBundle: getProductsData(id!),
        productDetail: getProductDetailData(id!),
        productBundleDetail: getProductBundleDetailData(id!),
      };
      setGroupData(groupData);
      setLiveEntityData(groupData);
      const grpOverview = groupData?.groupGeneralSettings?.overview?.groupOverview;
      setGroupName(grpOverview?.groupName || "");
      setGroupId(grpOverview?.legacyGroupId || "");
      setGroupShortId(grpOverview?.groupId || "");
    }
  }, [id]);

  const fetchTaskDetails = async () => {
    if (!candidateId || (!isEditMode && !isReviewMode)) return;
    try {
      setLoading(true);
      const response: TaskResponse = await api.get(
        `${taskUrl}client-configurations/tasks/${candidateId}`,
      );
      if (response?.entities?.length > 0) {
        setEntityId(response.entities[0].draftId);
        setTasksDetails(response);
      }
    } catch (err) {
      console.error("Failed to fetch task details:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchTaskDetails();
  }, [candidateId, isEditMode, isReviewMode, taskUrl]);

  const fetchGroupMetadata = useCallback(
    async () => {
      if ((!isTaskEditLikeMode && !isReviewMode) || !id || !editBaseUrl) return;
      // Review mode renders its own loader and only needs metadata for the optional
      // "Show all fields" toggle. Blocking the content area here would unmount
      // ConfigReview mid-flight and re-run its one-shot status claim on remount.
      const blocksContentArea = !isReviewMode;
      try {
        if (blocksContentArea) setLoading(true);
        const metadataUrl = `${editBaseUrl}client-configurations/metadata/groups/${tasKDetails?.entities[0]?.draftId}`;
        const res: Record<string, any> = await api.get(metadataUrl);
        setGroupMetadata(res ?? null);
        if (res) {
          setLiveEntityData(extractEntityData(res));
        }
      } catch {
        setGroupMetadata(null);
        showCustomToast({
          type: ToastType.Error,
          title: "Failed",
          message: ERROR_MESSAGES.SOMETHINGS_WRONG,
        })
      } finally {
        if (blocksContentArea) setLoading(false);
      }
    },
    [isTaskEditLikeMode, id, editBaseUrl, tasKDetails, setLiveEntityData],
  );

  useEffect(() => {
    if (tasKDetails) {
      fetchGroupMetadata();
    }
  }, [isTaskEditLikeMode, isReviewMode, id, editBaseUrl, tasKDetails, fetchGroupMetadata]);

  const fetchPendingTask = async () => {
    try {
      const res: any = await api.get(
        `${taskUrl}client-configurations/tasks/pending/group/${id}`,
      );
      if (res?.length > 0) setPendingChanges(res);
    } catch {
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

  // Hydrate sync job
  useEffect(() => {
    if (groupShortId) {
      hydrateJob(groupShortId);
    }
  }, [groupShortId, hydrateJob]);

  const [dismissed, setDismissed] = useState(false);
  const [effectiveLastSynced, setEffectiveLastSynced] = useState<
    string | undefined
  >(undefined);

  // Reset dismissed state when effectiveLastSynced changes (new sync)
  useEffect(() => {
    setDismissed(false);
  }, [effectiveLastSynced]);

  // Refs to hold latest values for interval callback
  const groupUpdatedAtRef = useRef(groupUpdatedAt);
  const dismissedRef = useRef(dismissed);

  useEffect(() => {
    groupUpdatedAtRef.current = groupUpdatedAt;
    dismissedRef.current = dismissed;
  }, [groupUpdatedAt, dismissed]);

  const runCheck = useCallback(() => {
    if (!groupShortId) return;

    // Check local storage first
    const stored = localStorage.getItem(`syncJob_${groupShortId}`);
    let lastSynced = !stored
      ? getGeneralSettings(id!)?.updatedAt
      : groupUpdatedAtRef.current;
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.lastSynced) {
        lastSynced = parsed.lastSynced;
      }
    }

    setEffectiveLastSynced(lastSynced);

    if (!lastSynced) {
      setShouldShowSyncModal(true);
      return;
    }

    const diff = getTimeDiffInMinutes(lastSynced);

    if (diff === null || diff >= 10) {
      setShouldShowSyncModal(true);
    } else {
      setShouldShowSyncModal(false);
    }
  }, [groupShortId, groupData, id, getGeneralSettings]);

  // Initial check and check on updates (reactive)
  useEffect(() => {
    runCheck();
  }, [runCheck, groupUpdatedAt, groupData]);

  // Periodic check (stable interval)
  useEffect(() => {
    if (!groupShortId) return;

    const interval = setInterval(runCheck, 60 * 1000);

    return () => clearInterval(interval);
  }, [groupShortId, runCheck]);

  const getExitUrl = () => {
    if (isRejectedReviewFixMode) {
      return TASKS_DASHBOARD_PATH;
    }
    if (!id) return null;
    const { pageName, grpType } = getUrlParts();
    return `/CCC/${grpType}/${id}/${pageName}`;
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
  } = useEditModeNavigationBlocker({ isEditMode: shouldBlockNavigation, navigate });

  const persistReviewerProgressOnExit = useCallback(async (): Promise<boolean> => {
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

  // Use this for any intentional programmatic navigation out of edit mode.
  // It bypasses the blocker so no confirmation modal is shown.
  const navigateOutOfEditMode = useCallback((url: string) => {
    const currentTimerId = useEditStore.getState().saveTimerId;
    if (currentTimerId) clearTimeout(currentTimerId);
    navigateWithoutPrompt(url, onConfirmLeavePage);
  }, [navigateWithoutPrompt, onConfirmLeavePage]);

  useEffect(() => {
    if (!shouldBlockNavigation) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if ((window as Window & { __sessionTimingOut?: boolean }).__sessionTimingOut) return;
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
      {
        name: "Eligibility and claims",
        path: "eligibilty-claims",
        reqInEdit: "common",
      },
      { name: "Products", path: "products", reqInEdit: "common" },
      { name: "Contacts", path: "contacts", reqInEdit: "common" },
      { name: "Hierarchy", path: "hierarchy", reqInEdit: "common" },
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

  const hasSyncPermission = hasPermission(userPermission, "data:refresh");

  type ActionKey =
    | "edit-config"
    | "submit-update"
    | "validate"
    | "view-summary"
    | "exit-edit"
    | "complete-review"
    | "view-task-info"
    | "defer-peer-review"
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
            { key: "defer-peer-review", label: "Defer peer review" },
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
        let drifted = false;
        let pendingDrifted = false;
        const driftToastId = showCustomToast({
          type: ToastType.Loading,
          title: MODAL_MSSG.CHECKING_CONFLICTS_TITLE,
          message: MODAL_MSSG.CHECKING_CONFLICTS,
        });
        try {
          const res: any = await api.get(
            `${editBaseUrl}client-configurations/conflicts/check-production-drift?draftId=${entityId}&entityType=GROUP`,
          );
          drifted = Boolean(res?.drifted);
          pendingDrifted = Boolean(res?.hasPendingConflicts);
          setShowRefreshRibbon(drifted);
          setShowConflictsRibbon(pendingDrifted);
          setShowRefreshTooltip(drifted);
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
        if (drifted || pendingDrifted) break;
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
      case "defer-peer-review":
        break;
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
    const key =
      getActionSections()[sectionIdx]?.items[itemIdx]?.key ?? null;
    await dispatchAction(key);
  }

  const getUrlParts = () => {
    const pathParts = location.pathname.split("/");
    const pageName = pathParts[pathParts.length - 1];
    const grpType = location.pathname.includes("/org-detail/")
      ? "org-detail"
      : "groups";
    return { pageName, grpType };
  };

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

  const handleValidate = async (): Promise<
    | {
      errorInfo: ValidationResponse["errorInfo"];
      warningInfo: ValidationResponse["warningInfo"];
    }
    | null
    | undefined
  > => {
    try {
      const res = await apiService.postWithResponse<ValidationResponse>(
        `${rulesUrl}validate/group/${groupId}`,
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
      await api.post(`${taskUrl}validate/GROUP/${id}`, payload);
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
        `${rulesUrl}validate/summary?groupId=${groupShortId}`,
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

  const orgEdit = hasPermission(userPermission, "config:org:edit");
  const groupEdit = hasPermission(userPermission, "config:group:edit");
  const hasSimpleEditPermission = hasPermission(
    userPermission,
    "data:simple-edit",
  );
  const renderActionBasedOnPermissions = () => {
    const { grpType } = getUrlParts();
    if (grpType === "org-detail" && (orgEdit || hasSimpleEditPermission)) {
      return true;
    } else if (grpType === "groups" && (groupEdit || hasSimpleEditPermission)) {
      return true;
    } else {
      return false;
    }
  };

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
  }

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
      return <ConfigReview entityType="group" taskDetails={tasKDetails} handleSaveChanges={handleSaveChanges} navigateWithoutBlock={(url) => navigateWithoutPrompt(url)} metadata={groupMetadata} />;
    }

    return (
      <Suspense
        fallback={<Loader text="Loading..." className="content-area-loader" />}
      >
        <Outlet context={{ handleSaveChanges, groupMetadata }} />
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
        `${editBaseUrl}client-configurations/conflicts/refresh?draftId=${entityId}&entityType=GROUP`,
      );
      const prodConflictsFound = hasProductionConflicts(res);
      const pendingConflictsFound = hasPendingConflicts(res);
      setProdConflicts(prodConflictsFound);
      setPendingConflicts(pendingConflictsFound);
      setShowRefreshRibbon(false);
      setShowConflictsRibbon(false);
      if (!prodConflictsFound && !pendingConflictsFound) {
        setShowRefreshTooltip(false);
        await fetchGroupMetadata();
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
        name={groupName ?? ""}
        id={groupId ?? ""}
        label="Legacy Group ID"
        iconType="Group"
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
            {isReviewMode && !tasKDetails ? null : isReviewMode && !isRejectedReviewFixMode ? (
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
                      title={isTaskEditLikeMode ? "Submit update" : "Select action"}
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

      {/* Modal appears if last sync > 10 mins */}
      {shouldShowSyncModal && hasSyncPermission && !isEditMode && !isReviewMode && (
        <>
          <SyncModal
            type="group"
            id={groupShortId ?? ""}
            lastUpdatedAt={effectiveLastSynced ?? ""}
            onClose={() => setDismissed(true)}
          />
        </>
      )}

      {groupShortId && isReviewMode && <ReviewSummaryRibbon />}

      {groupShortId && !isReviewMode && (
        <>
          {hasSyncPermission && !isEditMode && (
            <SyncRibbon
              type="group"
              id={groupShortId}
              apiLastSynced={groupUpdatedAt}
            />
          )}
          {!isEditMode && (
            <>
              <ValidateRibbon
                type="group"
                id={groupShortId}
                data={groupData}
                apiService={api}
                apiEndpoints={rulesUrl}
                formatUTCToEST={formatUTCToEST}
              />
              {pendingChanges?.length > 0 && renderActionBasedOnPermissions() && (
                <PendingRibbon data={pendingChanges} />
              )}
            </>
          )}
          {isEditMode &&
            isDateInPast(tasKDetails?.plannedLaunchDate) && permissionToEditCandidate() && (
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
                  const { grpType } = getUrlParts();
                  navigate(
                    `/CCC/${grpType}/${id}/edit/${candidateId}/general-settings`,
                  );
                  await fetchPendingTask();
                }
              }}
              entity="group"
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
      {groupShortId && isTaskEditLikeMode && (
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
            ></ValidationSummarySlider>
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
          await fetchGroupMetadata();
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
        onBtnClick2={() => {
          setOpenConflictSidebar(true);
          setConflictPrompt(null);
        }}
      />
      <div className="org-config-main-layout d-flex">
        {!isReviewMode && <SidebarNav navItems={NavItems} basePath={GRP_DETAIL_PATH} />}
        <div
          className={`org-config-content ${isEditMode ? "edit-mode" : ""} ${isReviewMode ? "review-mode" : ""}`}
        >
          {renderContent()}
        </div>
      </div>
    </>
  );
};

export default GrpConfigLayout;
