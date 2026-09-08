import { describe, it, expect } from "vitest";
import { isRebuttalEligible, hasRebuttalRole } from "../rebuttalAccess";
import type { UserKey } from "@/types/user";

const CONFIGURATOR: UserKey[] = ["CONFIGURATOR"];

const eligible = {
  userName: "Ashish Tiwari",
  taskDetails: { status: "REJECTED_QUALITY_REVIEW", createdBy: "Ashish Tiwari" },
  userRoles: CONFIGURATOR,
  allowRebuttal: true,
};

describe("hasRebuttalRole", () => {
  it("accepts configurator, configurator manager and administrator", () => {
    expect(hasRebuttalRole(["CONFIGURATOR"])).toBe(true);
    expect(hasRebuttalRole(["CONFIGURATOR_MANAGER"])).toBe(true);
    expect(hasRebuttalRole(["ADMINISTRATOR"])).toBe(true);
  });

  it("rejects reviewer-only roles", () => {
    expect(hasRebuttalRole(["QUALITY_REVIEWER"])).toBe(false);
    expect(hasRebuttalRole(["QUALITY_MANAGER", "VIEWER"])).toBe(false);
    expect(hasRebuttalRole([])).toBe(false);
  });

  it("accepts a user who holds an eligible role alongside others", () => {
    expect(hasRebuttalRole(["QUALITY_REVIEWER", "CONFIGURATOR"])).toBe(true);
  });
});

describe("isRebuttalEligible", () => {
  it("allows the creating configurator on a quality-review rejection", () => {
    expect(isRebuttalEligible(eligible)).toBe(true);
  });

  it("accepts loosely formatted statuses", () => {
    expect(
      isRebuttalEligible({
        ...eligible,
        taskDetails: { ...eligible.taskDetails, status: "rejected quality review" },
      }),
    ).toBe(true);
  });

  it("rejects every status other than rejected quality review", () => {
    for (const status of [
      "REJECTED_PEER_REVIEW",
      "QUALITY_REVIEW_IN_PROGRESS",
      "PENDING_QUALITY_REVIEW",
      "DRAFT",
      "APPROVED",
    ]) {
      expect(
        isRebuttalEligible({
          ...eligible,
          taskDetails: { ...eligible.taskDetails, status },
        }),
      ).toBe(false);
    }
  });

  it("rejects a user who did not create the task", () => {
    expect(
      isRebuttalEligible({
        ...eligible,
        taskDetails: { ...eligible.taskDetails, createdBy: "Someone Else" },
      }),
    ).toBe(false);
  });

  it("matches the creator case-insensitively and ignores padding", () => {
    expect(
      isRebuttalEligible({
        ...eligible,
        taskDetails: { ...eligible.taskDetails, createdBy: "  ashish tiwari " },
      }),
    ).toBe(true);
  });

  it("rejects when the creator or user name is missing", () => {
    expect(isRebuttalEligible({ ...eligible, userName: null })).toBe(false);
    expect(
      isRebuttalEligible({
        ...eligible,
        taskDetails: { status: "REJECTED_QUALITY_REVIEW" },
      }),
    ).toBe(false);
  });

  it("rejects an ineligible role even for the creator", () => {
    expect(
      isRebuttalEligible({ ...eligible, userRoles: ["QUALITY_REVIEWER"] }),
    ).toBe(false);
  });

  it("rejects when task details have not loaded yet", () => {
    expect(isRebuttalEligible({ ...eligible, taskDetails: undefined })).toBe(false);
  });

  describe("allowRebuttal gate", () => {
    it("rejects when the backend has closed the rebuttal window", () => {
      expect(isRebuttalEligible({ ...eligible, allowRebuttal: false })).toBe(false);
    });

    it("fails closed while the review API has not resolved yet", () => {
      expect(isRebuttalEligible({ ...eligible, allowRebuttal: undefined })).toBe(false);
    });

    it("does not let allowRebuttal override the other checks", () => {
      expect(
        isRebuttalEligible({
          ...eligible,
          allowRebuttal: true,
          taskDetails: { status: "REJECTED_PEER_REVIEW", createdBy: "Ashish Tiwari" },
        }),
      ).toBe(false);
      expect(
        isRebuttalEligible({
          ...eligible,
          allowRebuttal: true,
          taskDetails: { ...eligible.taskDetails, createdBy: "Someone Else" },
        }),
      ).toBe(false);
      expect(
        isRebuttalEligible({
          ...eligible,
          allowRebuttal: true,
          userRoles: ["QUALITY_REVIEWER"],
        }),
      ).toBe(false);
    });
  });
});
