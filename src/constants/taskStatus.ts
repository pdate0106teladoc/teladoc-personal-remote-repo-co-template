/** Task workflow statuses used across configurator and config layouts. */
export const TASK_STATUS = {
  DRAFT: "DRAFT",
  PENDING_PEER_REVIEW: "PENDING_PEER_REVIEW",
  PEER_REVIEW_IN_PROGRESS: "PEER_REVIEW_IN_PROGRESS",
  PENDING_QUALITY_REVIEW: "PENDING_QUALITY_REVIEW",
  QUALITY_REVIEW_IN_PROGRESS: "QUALITY_REVIEW_IN_PROGRESS",
  REJECTED_PEER_REVIEW: "REJECTED_PEER_REVIEW",
  REJECTED_QUALITY_REVIEW: "REJECTED_QUALITY_REVIEW",
  PENDING_REBUTTAL_REVIEW: "PENDING_REBUTTAL_REVIEW",
  REBUTTAL_IN_PROGRESS: "REBUTTAL_IN_PROGRESS",
  APPROVED: "APPROVED",
  SCHEDULED: "SCHEDULED",
  COMPLETED: "COMPLETED",
  ON_HOLD: "ON_HOLD",
  CANCELLED: "CANCELLED",
} as const;

export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];

export const REVIEW_IN_PROGRESS_STATUSES: readonly TaskStatus[] = [
  TASK_STATUS.PEER_REVIEW_IN_PROGRESS,
  TASK_STATUS.QUALITY_REVIEW_IN_PROGRESS,
  // A rebuttal is reviewed by the assigned reviewer, so it behaves like any other review.
  TASK_STATUS.REBUTTAL_IN_PROGRESS,
];

export const PENDING_REVIEW_STATUSES: readonly TaskStatus[] = [
  TASK_STATUS.PENDING_PEER_REVIEW,
  TASK_STATUS.PENDING_QUALITY_REVIEW,
  TASK_STATUS.PENDING_REBUTTAL_REVIEW,
];

export const REJECTED_REVIEW_STATUSES: readonly TaskStatus[] = [
  TASK_STATUS.REJECTED_PEER_REVIEW,
  TASK_STATUS.REJECTED_QUALITY_REVIEW,
];

export const normalizeTaskStatus = (status?: string): string => {
  if (!status) return "";
  return status.trim().toUpperCase().replace(/\s+/g, "_");
};

/** Task is in rejected peer/quality review — configurator is fixing failed fields. */
export const isRejectedReviewTaskStatus = (status?: string): boolean => {
  const normalized = normalizeTaskStatus(status);
  return (REJECTED_REVIEW_STATUSES as readonly string[]).includes(normalized);
};
