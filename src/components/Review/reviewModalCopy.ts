import { MODAL_MSSG } from "@/constants";
import { normalizeTaskStatus, TASK_STATUS } from "@/constants/taskStatus";

/** Reviewer is looking at a rebuttal raised by the configurator. */
export const isRebuttalReviewStatus = (status?: string): boolean => {
  const normalized = normalizeTaskStatus(status);
  return (
    normalized === TASK_STATUS.PENDING_REBUTTAL_REVIEW ||
    normalized === TASK_STATUS.REBUTTAL_IN_PROGRESS
  );
};

/**
 * Copy overrides for the reviewer's "Complete review" modal.
 *
 * Reviewing a rebuttal is still a review — same modal, same approve/reject
 * actions — so only the wording changes. An empty object leaves the modal on its
 * own REVIEW_* defaults.
 */
export const getReviewModalCopy = (status?: string) =>
  isRebuttalReviewStatus(status)
    ? {
        successMessage: MODAL_MSSG.REBUTTAL_SUCCESS_MESSAGE,
        confirmText: MODAL_MSSG.REBUTTAL_CONFIRM_TEXT,
        checkboxLabel: MODAL_MSSG.REBUTTAL_CHECKBOX_LABEL,
        rejectConfirmText: MODAL_MSSG.REBUTTAL_REJECT_CONFIRM_TEXT,
        rejectCheckboxLabel: MODAL_MSSG.REBUTTAL_REJECT_CHECKBOX_LABEL,
      }
    : {};

export const REVIEW_APPROVED_TOAST = "Task approved successfully.";
export const REBUTTAL_APPROVED_TOAST = "Your rebuttal has been submitted";

/**
 * Approving a task in a rebuttal review confirms the configurator's rebuttal, so
 * the toast says so rather than reporting a plain approval.
 */
export const getApproveSuccessMessage = (status?: string): string =>
  isRebuttalReviewStatus(status) ? REBUTTAL_APPROVED_TOAST : REVIEW_APPROVED_TOAST;
