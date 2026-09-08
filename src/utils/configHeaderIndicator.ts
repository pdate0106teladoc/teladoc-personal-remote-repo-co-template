import {
  normalizeTaskStatus,
  PENDING_REVIEW_STATUSES,
  REJECTED_REVIEW_STATUSES,
  REVIEW_IN_PROGRESS_STATUSES,
} from "@/constants/taskStatus";

export type ConfigHeaderIndicatorType = "breadcrumb" | "editing" | "reviewing";

export interface ConfigHeaderIndicator {
  type: ConfigHeaderIndicatorType;
  taskId?: string;
}

export const resolveConfigHeaderIndicator = ({
  pathname,
  taskId,
  taskStatus,
}: {
  pathname: string;
  taskId?: string;
  taskStatus?: string;
}): ConfigHeaderIndicator => {
  const isEditUrl = pathname.includes("/edit/");
  const isReviewUrl = pathname.includes("/review/");
  const normalizedStatus = normalizeTaskStatus(taskStatus);

  if (REJECTED_REVIEW_STATUSES.includes(normalizedStatus as never)) {
    return { type: "editing" };
  }

  if (isEditUrl) {
    return { type: "editing" };
  }

  if (
    isReviewUrl &&
    taskId &&
    (REVIEW_IN_PROGRESS_STATUSES.includes(normalizedStatus as never) ||
      PENDING_REVIEW_STATUSES.includes(normalizedStatus as never) ||
      !normalizedStatus)
  ) {
    return { type: "reviewing", taskId };
  }

  if (!isEditUrl && !isReviewUrl) {
    return { type: "breadcrumb" };
  }

  return { type: "editing" };
};

/** Review URL while task is rejected — configurator fixes failed fields (not future rebuttal flow). */
export const isRejectedReviewFixMode = ({
  isReviewMode,
  taskStatus,
}: {
  isReviewMode: boolean;
  taskStatus?: string;
}): boolean => {
  if (!isReviewMode) return false;

  const normalizedStatus = normalizeTaskStatus(taskStatus);
  return REJECTED_REVIEW_STATUSES.includes(normalizedStatus as never);
};

/** Review URL while a peer/quality reviewer is actively reviewing changes. */
export const isReviewerInProgressMode = ({
  isReviewMode,
  taskStatus,
}: {
  isReviewMode: boolean;
  taskStatus?: string;
}): boolean => {
  if (!isReviewMode) return false;

  const normalizedStatus = normalizeTaskStatus(taskStatus);
  if (REJECTED_REVIEW_STATUSES.includes(normalizedStatus as never)) {
    return false;
  }

  return (
    REVIEW_IN_PROGRESS_STATUSES.includes(normalizedStatus as never) ||
    PENDING_REVIEW_STATUSES.includes(normalizedStatus as never)
  );
};

export const shouldShowAutoSaveStatus = ({
  isEditMode,
  isReviewMode,
  taskStatus,
}: {
  isEditMode: boolean;
  isReviewMode: boolean;
  taskStatus?: string;
}): boolean => {
  if (isEditMode) return true;
  return isRejectedReviewFixMode({ isReviewMode, taskStatus });
};
