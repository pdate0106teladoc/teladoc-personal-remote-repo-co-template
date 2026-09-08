import { describe, expect, it } from "vitest";
import { canOpenTaskForEdit, isTaskOwner } from "../taskAccess";
import { TASK_STATUS } from "@/constants/taskStatus";

describe("isTaskOwner", () => {
  it("uses assignee when fixing rejected review fields", () => {
    expect(
      isTaskOwner({
        userName: "Alice",
        taskDetails: { assignee: "Alice", updatedBy: "Reviewer" },
        isRejectedReviewFixMode: true,
      }),
    ).toBe(true);
  });

  it("uses updatedBy for edit mode", () => {
    expect(
      isTaskOwner({
        userName: "Alice",
        taskDetails: { assignee: "Bob", updatedBy: "Alice" },
        isRejectedReviewFixMode: false,
      }),
    ).toBe(true);
  });

  it("matches names case-insensitively", () => {
    expect(
      isTaskOwner({
        userName: "alice",
        taskDetails: { assignee: "Alice" },
        isRejectedReviewFixMode: true,
      }),
    ).toBe(true);
  });

  it("returns false when owner does not match", () => {
    expect(
      isTaskOwner({
        userName: "Alice",
        taskDetails: { assignee: "Bob", updatedBy: "Reviewer" },
        isRejectedReviewFixMode: true,
      }),
    ).toBe(false);
  });
});

describe("canOpenTaskForEdit", () => {
  it("allows the owner of a draft", () => {
    expect(
      canOpenTaskForEdit({
        userName: "Jane Doe",
        ownerName: "Jane Doe",
        taskStatus: TASK_STATUS.DRAFT,
      }),
    ).toBe(true);
  });

  it("ignores name casing, as the sidebars did before", () => {
    expect(
      canOpenTaskForEdit({
        userName: "jane doe",
        ownerName: "Jane Doe",
        taskStatus: "draft",
      }),
    ).toBe(true);
  });

  it.each([
    TASK_STATUS.PENDING_PEER_REVIEW,
    TASK_STATUS.PEER_REVIEW_IN_PROGRESS,
    TASK_STATUS.PENDING_QUALITY_REVIEW,
    TASK_STATUS.QUALITY_REVIEW_IN_PROGRESS,
    TASK_STATUS.REJECTED_PEER_REVIEW,
    TASK_STATUS.REJECTED_QUALITY_REVIEW,
    TASK_STATUS.PENDING_REBUTTAL_REVIEW,
    TASK_STATUS.REBUTTAL_IN_PROGRESS,
    TASK_STATUS.APPROVED,
    TASK_STATUS.SCHEDULED,
    TASK_STATUS.COMPLETED,
    TASK_STATUS.ON_HOLD,
    TASK_STATUS.CANCELLED,
  ])("refuses the owner of a %s task", (taskStatus) => {
    expect(
      canOpenTaskForEdit({ userName: "Jane Doe", ownerName: "Jane Doe", taskStatus }),
    ).toBe(false);
  });

  it("refuses someone who does not own the draft", () => {
    expect(
      canOpenTaskForEdit({
        userName: "Jane Doe",
        ownerName: "John Smith",
        taskStatus: TASK_STATUS.DRAFT,
      }),
    ).toBe(false);
  });

  it("refuses when the owner or status is missing", () => {
    expect(
      canOpenTaskForEdit({ userName: "Jane Doe", taskStatus: TASK_STATUS.DRAFT }),
    ).toBe(false);
    expect(
      canOpenTaskForEdit({ userName: "Jane Doe", ownerName: "Jane Doe" }),
    ).toBe(false);
    expect(
      canOpenTaskForEdit({ userName: null, ownerName: "Jane Doe", taskStatus: TASK_STATUS.DRAFT }),
    ).toBe(false);
  });
});
