import { describe, expect, it } from "vitest";
import { TASK_STATUS } from "@/constants/taskStatus";
import {
  resolveConfigHeaderIndicator,
  shouldShowAutoSaveStatus,
  isRejectedReviewFixMode,
  isReviewerInProgressMode,
} from "../configHeaderIndicator";

describe("resolveConfigHeaderIndicator", () => {
  it("shows breadcrumb in view mode", () => {
    expect(
      resolveConfigHeaderIndicator({
        pathname: "/CCC/org-detail/org-1/general-settings",
      }),
    ).toEqual({ type: "breadcrumb" });
  });

  it("shows editing in edit url", () => {
    expect(
      resolveConfigHeaderIndicator({
        pathname: "/CCC/org-detail/org-1/edit/O-001/general-settings",
        taskId: "O-001",
      }),
    ).toEqual({ type: "editing" });
  });

  it("shows reviewing task id in review url with peer review in progress", () => {
    expect(
      resolveConfigHeaderIndicator({
        pathname: "/CCC/org-detail/org-1/review/O-01234/general-settings",
        taskId: "O-01234",
        taskStatus: TASK_STATUS.PEER_REVIEW_IN_PROGRESS,
      }),
    ).toEqual({ type: "reviewing", taskId: "O-01234" });
  });

  it("shows reviewing for quality review in progress", () => {
    expect(
      resolveConfigHeaderIndicator({
        pathname: "/CCC/groups/grp-1/review/G-001/general-settings",
        taskId: "G-001",
        taskStatus: "Quality Review In Progress",
      }),
    ).toEqual({ type: "reviewing", taskId: "G-001" });
  });

  it("shows editing for rejected peer review", () => {
    expect(
      resolveConfigHeaderIndicator({
        pathname: "/CCC/org-detail/org-1/edit/O-001/general-settings",
        taskId: "O-001",
        taskStatus: TASK_STATUS.REJECTED_PEER_REVIEW,
      }),
    ).toEqual({ type: "editing" });
  });

  it("shows reviewing while task status is loading on review url", () => {
    expect(
      resolveConfigHeaderIndicator({
        pathname: "/CCC/org-detail/org-1/review/O-01234/general-settings",
        taskId: "O-01234",
      }),
    ).toEqual({ type: "reviewing", taskId: "O-01234" });
  });
});

describe("isRejectedReviewFixMode", () => {
  it("returns true for rejected peer review in review url", () => {
    expect(
      isRejectedReviewFixMode({
        isReviewMode: true,
        taskStatus: TASK_STATUS.REJECTED_PEER_REVIEW,
      }),
    ).toBe(true);
  });

  it("returns false for active peer review", () => {
    expect(
      isRejectedReviewFixMode({
        isReviewMode: true,
        taskStatus: TASK_STATUS.PEER_REVIEW_IN_PROGRESS,
      }),
    ).toBe(false);
  });
});

describe("isReviewerInProgressMode", () => {
  it("returns true for peer review in progress on review url", () => {
    expect(
      isReviewerInProgressMode({
        isReviewMode: true,
        taskStatus: TASK_STATUS.PEER_REVIEW_IN_PROGRESS,
      }),
    ).toBe(true);
  });

  it("returns true for pending quality review", () => {
    expect(
      isReviewerInProgressMode({
        isReviewMode: true,
        taskStatus: TASK_STATUS.PENDING_QUALITY_REVIEW,
      }),
    ).toBe(true);
  });

  it("returns false for rejected peer review", () => {
    expect(
      isReviewerInProgressMode({
        isReviewMode: true,
        taskStatus: TASK_STATUS.REJECTED_PEER_REVIEW,
      }),
    ).toBe(false);
  });

  it("returns false outside review url", () => {
    expect(
      isReviewerInProgressMode({
        isReviewMode: false,
        taskStatus: TASK_STATUS.PEER_REVIEW_IN_PROGRESS,
      }),
    ).toBe(false);
  });
});

describe("shouldShowAutoSaveStatus", () => {
  it("shows auto-save status in edit mode", () => {
    expect(
      shouldShowAutoSaveStatus({
        isEditMode: true,
        isReviewMode: false,
      }),
    ).toBe(true);
  });

  it("shows auto-save status when fixing rejected review fields", () => {
    expect(
      shouldShowAutoSaveStatus({
        isEditMode: false,
        isReviewMode: true,
        taskStatus: TASK_STATUS.REJECTED_PEER_REVIEW,
      }),
    ).toBe(true);
  });

  it("hides auto-save status during active peer review", () => {
    expect(
      shouldShowAutoSaveStatus({
        isEditMode: false,
        isReviewMode: true,
        taskStatus: TASK_STATUS.PEER_REVIEW_IN_PROGRESS,
      }),
    ).toBe(false);
  });
});

describe("rebuttal review statuses", () => {
  const REBUTTAL_STATUSES = [
    TASK_STATUS.PENDING_REBUTTAL_REVIEW,
    TASK_STATUS.REBUTTAL_IN_PROGRESS,
  ];

  it.each(REBUTTAL_STATUSES)(
    "treats %s as an active reviewer session",
    (taskStatus) => {
      // Drives ConfigReview to render ReviewInProgressView, and gates
      // persistReviewerProgressOnExit so fail marks survive an exit.
      expect(isReviewerInProgressMode({ isReviewMode: true, taskStatus })).toBe(true);
      expect(isRejectedReviewFixMode({ isReviewMode: true, taskStatus })).toBe(false);
    },
  );

  it.each(REBUTTAL_STATUSES)("shows the reviewing header for %s", (taskStatus) => {
    expect(
      resolveConfigHeaderIndicator({
        pathname: "/CCC/org-detail/1/review/T-1/general-settings",
        taskId: "T-1",
        taskStatus,
      }),
    ).toEqual({ type: "reviewing", taskId: "T-1" });
  });

  it.each(REBUTTAL_STATUSES)("hides auto-save status for %s", (taskStatus) => {
    expect(
      shouldShowAutoSaveStatus({ isEditMode: false, isReviewMode: true, taskStatus }),
    ).toBe(false);
  });

  it("keeps quality-review rejection on the configurator fix path", () => {
    const taskStatus = TASK_STATUS.REJECTED_QUALITY_REVIEW;
    expect(isRejectedReviewFixMode({ isReviewMode: true, taskStatus })).toBe(true);
    expect(isReviewerInProgressMode({ isReviewMode: true, taskStatus })).toBe(false);
  });
});
