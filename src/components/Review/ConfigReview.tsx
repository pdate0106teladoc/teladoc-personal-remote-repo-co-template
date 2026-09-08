import React, { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FailSafePage, Loader, SideModal, showCustomToast } from "@ucc/common-ui";
import { useTaskComments } from "@/hooks/useTaskComments";
import type { ReviewApiResponse } from "./reviewFieldRegistry";
import {
  transformChangesToPages,
  transformFailedChangesToPages,
  getErrorCategory,
  countFailedReviewChanges,
  collectRejectedReviewFieldPathMap,
  collectPreviouslyMarkedFailedUiKeys,
} from "./reviewFieldRegistry";
import { buildAllFieldsPages } from "./allFieldsRegistry";
import useReviewStore from "@/store/useReviewStore";
import ReviewCommentsPanel from "./ReviewCommentsPanel";
import ReviewInProgressView from "./ReviewInProgressView";
import ReviewRejectedView from "./ReviewRejectedView";
import CompleteReviewModal from "./CompleteReviewModal";
import TaskDetailSidebar from "@/components/sidebar/TaskDetailSidebar";
import api from "@/api/apiService";
import { API_ENDPOINTS, ToastType } from "@/constants";
import {
  TASK_STATUS,
  PENDING_REVIEW_STATUSES,
  REVIEW_IN_PROGRESS_STATUSES,
} from "@/constants/taskStatus";
import { TASKS_DASHBOARD_PATH } from "@/router/routes";
import {
  getApproveSuccessMessage,
  getReviewModalCopy,
  isRebuttalReviewStatus,
} from "./reviewModalCopy";
import { getApiErrorMessage } from "@/utils";
import "./ConfigReview.scss";

const WORKFLOW_REVIEW_REFERENCE_TYPE = {
  REVIEW_ERROR_TYPE: "REVIEW_ERROR_TYPE",
  REBUTTAL_REASON: "REBUTTAL_REASON",
} as const;

interface ReviewReference {
  id: string;
  code: string;
  label: string;
  displayOrder: number;
  active: boolean;
}

interface WorkflowReviewReferencesResponse {
  type: string;
  reviewReferenceList: ReviewReference[];
}

const EditOppurtunities = lazy(() => import("@/pages/org-detail/pages/EditOppurtunities"));
const EditFiles = lazy(() => import("@/pages/org-detail/pages/EditFiles"));
const HistoryLogs = lazy(() => import("@/pages/org-detail/pages/HistoryLogs"));

export type ConfigReviewEntityType = "organization" | "group";

interface ConfigReviewProps {
  entityType?: ConfigReviewEntityType;
  taskDetails?: any;
  handleSaveChanges?: (
    pageName: string,
    changedPayload: Record<string, unknown>,
  ) => void;
  navigateWithoutBlock?: (url: string) => void;
  /** Full org/group metadata response — used to power "Show all fields" (read-only, irrespective of changes). */
  metadata?: Record<string, any> | null;
}

const normalizeStatus = (status?: string) =>
  status ? status.toUpperCase().replace(/\s+/g, "_") : "";

const isRejectedQualityReviewStatus = (status?: string) =>
  normalizeStatus(status) === TASK_STATUS.REJECTED_QUALITY_REVIEW;

interface ReferenceOption {
  label: string;
  value: string;
  code: string;
}

/** Active reference-list options for a workflow review reference type, in display order. */
const fetchWorkflowReviewReferences = async (
  taskUrl: string,
  type: string,
): Promise<ReferenceOption[]> => {
  const data = await api.get<WorkflowReviewReferencesResponse>(
    `${taskUrl}client-configurations/${type}/workflow-review-references`,
  );
  return [...data.reviewReferenceList]
    .filter((reference) => reference.active)
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((reference) => ({
      label: reference.label,
      value: reference.id,
      code: reference.code,
    }));
};

/** Codes may or may not carry the `REBUTTAL_REASON_` prefix, so compare on the bare suffix. */
const stripReasonPrefix = (code: string) =>
  code.toUpperCase().replace(/^REBUTTAL_REASON_/, "");

const humaniseReasonCode = (code: string) => {
  const words = stripReasonPrefix(code).split("_").filter(Boolean);
  if (words.length === 0) return code;
  const [first, ...rest] = words;
  return [
    first.charAt(0) + first.slice(1).toLowerCase(),
    ...rest.map((word) => word.toLowerCase()),
  ].join(" ");
};

/** The summary returns reference codes; the UI shows their labels. */
const resolveRebuttalReasonLabels = (
  codes: string[] | undefined,
  options: ReferenceOption[],
): string[] =>
  (codes ?? []).map((code) => {
    const match = options.find(
      (option) => stripReasonPrefix(option.code ?? "") === stripReasonPrefix(code),
    );
    return match?.label ?? humaniseReasonCode(code);
  });

/**
 * Reviewer is looking at the task (peer, quality or rebuttal) — show the review
 * table rather than the configurator's fix-failed-fields view. Derived from the
 * shared status groups so it cannot drift as new review stages are added.
 */
const isReviewInProgress = (status?: string) => {
  const normalized = normalizeStatus(status);
  return (
    REVIEW_IN_PROGRESS_STATUSES.includes(normalized as never) ||
    PENDING_REVIEW_STATUSES.includes(normalized as never)
  );
};

/** Pending status → the in-progress status to claim it with on open. */
const PENDING_STATUS_ACTIONS: Record<string, string> = {
  [TASK_STATUS.PENDING_PEER_REVIEW]: TASK_STATUS.PEER_REVIEW_IN_PROGRESS,
  [TASK_STATUS.PENDING_QUALITY_REVIEW]: TASK_STATUS.QUALITY_REVIEW_IN_PROGRESS,
  [TASK_STATUS.PENDING_REBUTTAL_REVIEW]: TASK_STATUS.REBUTTAL_IN_PROGRESS,
};

const getPendingReviewAction = (status?: string): string | null =>
  PENDING_STATUS_ACTIONS[normalizeStatus(status)] ?? null;

/**
 * `${candidateId}:${action}` transitions already claimed in this session. Module scope
 * so a remount cannot re-post: the layout briefly swaps this view for a loader while
 * task details and metadata settle, which destroys any component-scoped guard.
 */
const claimedStatusTransitions = new Set<string>();

/** Exposed for tests; a page load naturally starts with an empty set. */
export const __resetClaimedStatusTransitions = () => claimedStatusTransitions.clear();

const RESOURCE_COMPONENTS: Record<string, React.LazyExoticComponent<React.FC<any>>> = {
  "opportunities-edit": EditOppurtunities,
  "files": EditFiles,
  "history-logs": HistoryLogs,
};

const ConfigReview: React.FC<ConfigReviewProps> = ({
  taskDetails,
  handleSaveChanges,
  navigateWithoutBlock,
  metadata,
}) => {
  const { candidateId } = useParams<{ candidateId?: string }>();
  const navigate = useNavigate();
  const taskUrl = import.meta.env.VITE_TASK_URL;
  const { comments, isLoading, isSubmitting, sendComment } =
    useTaskComments(candidateId);
  const [activeResource, setActiveResource] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showAllFields, setShowAllFields] = useState(false);
  const [reviewData, setReviewData] = useState<ReviewApiResponse | null>(null);
  const [isLoadingReview, setIsLoadingReview] = useState(true);
  const [reviewApiFailed, setReviewApiFailed] = useState(false);
  const [errorTypeOptions, setErrorTypeOptions] = useState<ReferenceOption[]>([]);
  const [rebuttalReasonOptions, setRebuttalReasonOptions] = useState<ReferenceOption[]>([]);
  const [isSendingRebuttal, setIsSendingRebuttal] = useState(false);
  // Claiming a pending review is a one-shot, non-idempotent transition: a second call
  // is rejected because the status is no longer pending. The guard lives at module
  // scope (see claimedStatusTransitions) because a component-scoped ref dies with the
  // component, and the layout can swap this view for a loader while data settles.
  useEffect(() => {
    const action = getPendingReviewAction(taskDetails?.status);
    if (!action || !candidateId) return;

    const claimKey = `${candidateId}:${action}`;
    if (claimedStatusTransitions.has(claimKey)) return;
    claimedStatusTransitions.add(claimKey);

    api.post(
      `${taskUrl}${API_ENDPOINTS.approveTask}/${candidateId}/statusUpdate`,
      { action },
    ).then(() => {
      showCustomToast({
        type: ToastType.Success,
        title: "Success",
        message: "Review is in progress.",
      });
    }).catch(() => {
      showCustomToast({
        type: ToastType.Error,
        title: "Failed",
        message: "Failed to update review status.",
      });
    });
  }, [candidateId, taskDetails?.status, taskUrl]);

  useEffect(() => {
    if (!candidateId) return;
    setIsLoadingReview(true);
    api.get<ReviewApiResponse>(
      `${taskUrl}${API_ENDPOINTS.approveTask}/${candidateId}/review`,
    ).then((res) => {
      setReviewData(res);
    }).catch(() => {
      setReviewApiFailed(true);
      showCustomToast({
        type: ToastType.Error,
        title: "Failed",
        message: "Failed to fetch review data.",
      });
    }).finally(() => {
      setIsLoadingReview(false);
    });
  }, [candidateId, taskUrl]);

  useEffect(() => {
    fetchWorkflowReviewReferences(
      taskUrl,
      WORKFLOW_REVIEW_REFERENCE_TYPE.REVIEW_ERROR_TYPE,
    ).then(setErrorTypeOptions).catch(() => {
      showCustomToast({
        type: ToastType.Error,
        title: "Failed",
        message: "Failed to fetch error types.",
      });
    });
  }, [taskUrl]);

  // Needed for the configurator to raise a rebuttal, and for the reviewer to
  // resolve the reason codes on an incoming rebuttal into display labels.
  useEffect(() => {
    if (
      !isRejectedQualityReviewStatus(taskDetails?.status) &&
      !isRebuttalReviewStatus(taskDetails?.status)
    ) {
      return;
    }
    fetchWorkflowReviewReferences(
      taskUrl,
      WORKFLOW_REVIEW_REFERENCE_TYPE.REBUTTAL_REASON,
    ).then(setRebuttalReasonOptions).catch(() => {
      showCustomToast({
        type: ToastType.Error,
        title: "Failed",
        message: "Failed to fetch rebuttal reasons.",
      });
    });
  }, [taskUrl, taskDetails?.status]);

  const reviewerInProgress = isReviewInProgress(taskDetails?.status);

  const { pages: reviewPages, fieldPathMap } = useMemo(
    () => transformChangesToPages(reviewData?.diff),
    [reviewData?.diff],
  );

  const { pages: failedPages } = useMemo(
    () => transformFailedChangesToPages(reviewData?.diff),
    [reviewData?.diff],
  );

  const allFieldsPages = useMemo(
    () => buildAllFieldsPages(metadata),
    [metadata],
  );

  const showCompleteReviewModal = useReviewStore((s) => s.showCompleteReviewModal);
  const setShowCompleteReviewModal = useReviewStore((s) => s.setShowCompleteReviewModal);
  const showRebuttalModal = useReviewStore((s) => s.showRebuttalModal);
  const setShowRebuttalModal = useReviewStore((s) => s.setShowRebuttalModal);
  const showTaskDetailSidebar = useReviewStore((s) => s.showTaskDetailSidebar);
  const setShowTaskDetailSidebar = useReviewStore((s) => s.setShowTaskDetailSidebar);
  const setLatestReviewSummary = useReviewStore((s) => s.setLatestReviewSummary);
  const setLatestRebuttalSummary = useReviewStore((s) => s.setLatestRebuttalSummary);
  const setRebuttalWindow = useReviewStore((s) => s.setRebuttalWindow);
  const rebuttalWindow = useReviewStore((s) => s.rebuttalWindow);
  const setRejectedReviewFieldPathByFormKey = useReviewStore(
    (s) => s.setRejectedReviewFieldPathByFormKey,
  );
  const setReviewFieldPathByUiKey = useReviewStore((s) => s.setReviewFieldPathByUiKey);
  const setFailedFields = useReviewStore((s) => s.setFailedFields);
  const resetReviewState = useReviewStore((s) => s.resetReviewState);
  const failedFields = useReviewStore((s) => s.failedFields);
  const hasFailedItems = failedFields.size > 0;

  useEffect(() => {
    if (!reviewerInProgress || !reviewData?.diff) return;
    setFailedFields(
      collectPreviouslyMarkedFailedUiKeys(fieldPathMap, reviewData.diff),
    );
  }, [reviewerInProgress, reviewData?.diff, fieldPathMap, setFailedFields]);

  useEffect(() => {
    if (!reviewerInProgress) {
      setReviewFieldPathByUiKey({});
      return;
    }
    setReviewFieldPathByUiKey(fieldPathMap);
  }, [reviewerInProgress, fieldPathMap, setReviewFieldPathByUiKey]);

  useEffect(() => {
    if (reviewerInProgress || !reviewData?.latestReviewSummary) {
      setLatestReviewSummary(null);
      return;
    }

    setLatestReviewSummary(
      reviewData.latestReviewSummary,
      countFailedReviewChanges(reviewData.diff),
    );
  }, [reviewData, reviewerInProgress, setLatestReviewSummary]);

  // The backend owns the rebuttal window; the layouts read it to gate the
  // "Send rebuttal" action and the modal shows the remaining days.
  useEffect(() => {
    if (!reviewData) {
      setRebuttalWindow(null);
      return;
    }
    setRebuttalWindow({
      allowRebuttal: reviewData.allowRebuttal === true,
      daysRemaining: reviewData.daysRemaining ?? null,
    });
  }, [reviewData, setRebuttalWindow]);

  // Reviewer-side rebuttal ribbon: only while the rebuttal is awaiting review.
  useEffect(() => {
    const summary = reviewData?.latestRebuttalSummary;
    if (!summary || !isRebuttalReviewStatus(taskDetails?.status)) {
      setLatestRebuttalSummary(null);
      return;
    }

    setLatestRebuttalSummary({
      ...summary,
      rebuttalReason: resolveRebuttalReasonLabels(
        summary.rebuttalReason,
        rebuttalReasonOptions,
      ),
    });
  }, [
    reviewData?.latestRebuttalSummary,
    taskDetails?.status,
    rebuttalReasonOptions,
    setLatestRebuttalSummary,
  ]);

  useEffect(() => {
    if (reviewerInProgress) {
      setRejectedReviewFieldPathByFormKey({});
      return;
    }
    setRejectedReviewFieldPathByFormKey(collectRejectedReviewFieldPathMap(failedPages));
  }, [failedPages, reviewerInProgress, setRejectedReviewFieldPathByFormKey]);

  useEffect(() => () => resetReviewState(), [resetReviewState]);

  const errorCategories = useMemo(() => {
    if (!hasFailedItems) return [];
    const categories = new Set(
      [...failedFields]
        .map((uiKey) => fieldPathMap[uiKey])
        .filter(Boolean)
        .map((fp) => getErrorCategory(fp)),
    );
    return [...categories];
  }, [failedFields, fieldPathMap, hasFailedItems]);

  const handleResourceSelect = (key: string) => {
    setActiveResource(key);
  };

  const handlePageSelect = () => {
    setActiveResource(null);
  };

  const handleCompleteReview = async (errorTypes: string[], comments: string) => {
    setIsCompleting(true);
    try {
      if (!hasFailedItems) {
        await api.post(
          `${taskUrl}${API_ENDPOINTS.approveTask}/${candidateId}/approve`,
          { acknowledgementConfirmed: true },
        );
        showCustomToast({
          type: ToastType.Success,
          title: "Success",
          message: getApproveSuccessMessage(taskDetails?.status),
        });
      } else {
        const failedFieldPaths = [...useReviewStore.getState().failedFields]
          .map((uiKey) => fieldPathMap[uiKey])
          .filter(Boolean);

        await api.post(
          `${taskUrl}${API_ENDPOINTS.approveTask}/${candidateId}/reject`,
          {
            acknowledgementConfirmed: true,
            errorCategory: errorCategories,
            errorTypes,
            failedFields: failedFieldPaths,
            comment: comments,
          },
        );
        showCustomToast({
          type: ToastType.Success,
          title: "Success",
          message: "Task rejected successfully.",
        });
      }
      setShowCompleteReviewModal(false);
      if (navigateWithoutBlock) {
        navigateWithoutBlock(TASKS_DASHBOARD_PATH);
      } else {
        navigate(TASKS_DASHBOARD_PATH);
      }
    } catch {
      showCustomToast({
        type: ToastType.Error,
        title: "Failed",
        message: "Failed to complete review. Please try again.",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  const handleSendRebuttal = async (rebuttalReasons: string[], comments: string) => {
    setIsSendingRebuttal(true);
    try {
      await api.post(
        `${taskUrl}${API_ENDPOINTS.approveTask}/${candidateId}/rebuttal`,
        {
          acknowledgementConfirmed: true,
          rebuttalReasons,
          comments,
        },
      );
      showCustomToast({
        type: ToastType.Success,
        title: "Success",
        message: "Rebuttal sent successfully.",
      });
      setShowRebuttalModal(false);
      if (navigateWithoutBlock) {
        navigateWithoutBlock(TASKS_DASHBOARD_PATH);
      } else {
        navigate(TASKS_DASHBOARD_PATH);
      }
    } catch (err: unknown) {
      showCustomToast({
        type: ToastType.Error,
        title: "Failed",
        message: getApiErrorMessage(err, "Failed to send rebuttal. Please try again."),
      });
    } finally {
      setIsSendingRebuttal(false);
    }
  };

  const renderResourceContent = () => {
    if (!activeResource) return null;
    const ResourceComponent = RESOURCE_COMPONENTS[activeResource];
    if (!ResourceComponent) {
      return <FailSafePage cardType="comingSoon" />;
    }
    return (
      <Suspense fallback={<Loader text="Loading..." />}>
        <ResourceComponent />
      </Suspense>
    );
  };

  if (isLoadingReview) {
    return <Loader text="Loading review..." />;
  }

  if (reviewApiFailed) {
    return <FailSafePage cardType="dataFailed" />;
  }

  if (!reviewData) {
    return <FailSafePage cardType="noData" />;
  }

  return (
    <div className="config-review" data-testid="config-review">
      {reviewerInProgress ? (
        <ReviewInProgressView
          pages={reviewPages}
          activeResource={activeResource}
          onResourceSelect={handleResourceSelect}
          onPageSelect={handlePageSelect}
          resourceContent={renderResourceContent()}
          allFieldsPages={allFieldsPages}
          showAllFields={showAllFields}
          onToggleShowAllFields={setShowAllFields}
        />
      ) : reviewData ? (
        <ReviewRejectedView
          pages={failedPages}
          handleSaveChanges={handleSaveChanges}
          activeResource={activeResource}
          onResourceSelect={handleResourceSelect}
          onPageSelect={handlePageSelect}
          resourceContent={renderResourceContent()}
          allFieldsPages={allFieldsPages}
          showAllFields={showAllFields}
          onToggleShowAllFields={setShowAllFields}
        />
      ) : null}

      {isLoading ? (
        <aside
          className="review-comments-panel review-comments-panel--loading"
          data-testid="review-comments-loading"
        >
          <Loader text="Loading comments..." />
        </aside>
      ) : (
        <ReviewCommentsPanel
          comments={comments}
          onSendComment={sendComment}
          isSubmitting={isSubmitting}
        />
      )}

      <CompleteReviewModal
        show={showCompleteReviewModal}
        handleClose={() => setShowCompleteReviewModal(false)}
        hasFailedItems={hasFailedItems}
        onConfirm={handleCompleteReview}
        isSubmitting={isCompleting}
        errorCategories={errorCategories}
        errorTypeOptions={errorTypeOptions.length > 0 ? errorTypeOptions : undefined}
        {...getReviewModalCopy(taskDetails?.status)}
      />

      <CompleteReviewModal
        variant="rebuttal"
        show={showRebuttalModal}
        handleClose={() => setShowRebuttalModal(false)}
        onConfirm={handleSendRebuttal}
        isSubmitting={isSendingRebuttal}
        // Passed as-is: falling back to the review error types would list the wrong reasons.
        errorTypeOptions={rebuttalReasonOptions}
        rebuttalDaysLeft={rebuttalWindow?.daysRemaining ?? null}
      />

      <SideModal
        show={showTaskDetailSidebar}
        onHide={() => setShowTaskDetailSidebar(false)}
        title="Task information"
      >
        <TaskDetailSidebar
          taskId={candidateId}
          data={taskDetails}
          onBack={() => setShowTaskDetailSidebar(false)}
        />
      </SideModal>
    </div>
  );
};

export default ConfigReview;
