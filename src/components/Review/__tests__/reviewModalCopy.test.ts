import { describe, expect, it } from "vitest";
import {
  getApproveSuccessMessage,
  getReviewModalCopy,
  isRebuttalReviewStatus,
  REBUTTAL_APPROVED_TOAST,
  REVIEW_APPROVED_TOAST,
} from "../reviewModalCopy";
import { MODAL_MSSG } from "@/constants";
import { TASK_STATUS } from "@/constants/taskStatus";

describe("isRebuttalReviewStatus", () => {
  it.each([
    TASK_STATUS.PENDING_REBUTTAL_REVIEW,
    TASK_STATUS.REBUTTAL_IN_PROGRESS,
    // The task API sends spaces, not underscores.
    "REBUTTAL IN PROGRESS",
    "Pending Rebuttal Review",
  ])("accepts %s", (status) => {
    expect(isRebuttalReviewStatus(status)).toBe(true);
  });

  it.each([
    TASK_STATUS.PEER_REVIEW_IN_PROGRESS,
    TASK_STATUS.QUALITY_REVIEW_IN_PROGRESS,
    TASK_STATUS.REJECTED_QUALITY_REVIEW,
    TASK_STATUS.APPROVED,
    undefined,
  ])("rejects %s", (status) => {
    expect(isRebuttalReviewStatus(status)).toBe(false);
  });
});

describe("getReviewModalCopy", () => {
  it("switches the reviewer's modal to rebuttal wording", () => {
    expect(getReviewModalCopy("REBUTTAL IN PROGRESS")).toEqual({
      successMessage: MODAL_MSSG.REBUTTAL_SUCCESS_MESSAGE,
      confirmText: MODAL_MSSG.REBUTTAL_CONFIRM_TEXT,
      checkboxLabel: MODAL_MSSG.REBUTTAL_CHECKBOX_LABEL,
      rejectConfirmText: MODAL_MSSG.REBUTTAL_REJECT_CONFIRM_TEXT,
      rejectCheckboxLabel: MODAL_MSSG.REBUTTAL_REJECT_CHECKBOX_LABEL,
    });
  });

  it("every override mentions the rebuttal, not the update", () => {
    for (const copy of Object.values(getReviewModalCopy("REBUTTAL_IN_PROGRESS"))) {
      expect(copy.toLowerCase()).toContain("rebuttal");
    }
  });

  it("leaves an ordinary review on the modal's own defaults", () => {
    expect(getReviewModalCopy(TASK_STATUS.QUALITY_REVIEW_IN_PROGRESS)).toEqual({});
    expect(getReviewModalCopy(undefined)).toEqual({});
  });

  it("keeps the send-rebuttal copy separate from the reviewer's", () => {
    expect(MODAL_MSSG.SEND_REBUTTAL_CONFIRM_TEXT).not.toBe(
      MODAL_MSSG.REBUTTAL_CONFIRM_TEXT,
    );
    expect(MODAL_MSSG.SEND_REBUTTAL_CHECKBOX_LABEL).not.toBe(
      MODAL_MSSG.REBUTTAL_CHECKBOX_LABEL,
    );
  });
});

describe("getApproveSuccessMessage", () => {
  it.each([
    TASK_STATUS.REBUTTAL_IN_PROGRESS,
    // The task API sends spaces; and the status can still read as pending because
    // task details are not refetched after the open claims the review.
    "REBUTTAL IN PROGRESS",
    TASK_STATUS.PENDING_REBUTTAL_REVIEW,
  ])("confirms the rebuttal for %s", (status) => {
    expect(getApproveSuccessMessage(status)).toBe("Your rebuttal has been submitted");
    expect(getApproveSuccessMessage(status)).toBe(REBUTTAL_APPROVED_TOAST);
  });

  it.each([
    TASK_STATUS.PEER_REVIEW_IN_PROGRESS,
    TASK_STATUS.QUALITY_REVIEW_IN_PROGRESS,
    undefined,
  ])("keeps the plain approval message for %s", (status) => {
    expect(getApproveSuccessMessage(status)).toBe(REVIEW_APPROVED_TOAST);
  });
});
