import { describe, expect, it } from "vitest";
import {
  normalizeReviewDiffToChangeResponse,
  transformChangesToSections,
} from "../fieldLabelRegistry";

describe("normalizeReviewDiffToChangeResponse", () => {
  const sampleDiff = {
    changes: [
      {
        fieldPath:
          "organizationGeneralSettings.permissions.groupPermissions.sendProblemMemberLetter",
        change: {
          oldValue: true,
          newValue: false,
          status: "FAILED",
          correctedBy: null,
          correctedAt: null,
          rejectCount: 1,
        },
      },
      {
        fieldPath: "organizationGeneralSettings.overview.address.state",
        change: {
          oldValue: "IL",
          newValue: "Colorado",
          status: "CORRECTED",
          correctedBy: "user-1",
          correctedAt: "2026-08-07T18:02:27.098Z",
          rejectCount: 1,
        },
      },
      {
        fieldPath: "organizationGeneralSettings.overview.accountDetails.coveredLives",
        change: {
          oldValue: "25",
          newValue: "30",
          status: "PENDING",
          correctedBy: null,
          correctedAt: null,
          rejectCount: null,
        },
      },
    ],
    errors: [],
  };

  it("maps all review diff entries when no status filter is applied", () => {
    const result = normalizeReviewDiffToChangeResponse(sampleDiff);

    expect(Object.keys(result?.changes ?? {})).toHaveLength(3);
    expect(result?.changes?.["organizationGeneralSettings.overview.address.state"]).toEqual({
      oldValue: "IL",
      newValue: "Colorado",
    });
  });

  it("includes only CORRECTED scalar changes when status filter is set", () => {
    const result = normalizeReviewDiffToChangeResponse(sampleDiff, {
      scalarStatusFilter: "CORRECTED",
    });

    expect(result?.changes).toEqual({
      "organizationGeneralSettings.overview.address.state": {
        oldValue: "IL",
        newValue: "Colorado",
      },
    });
  });

  it("feeds ConfirmationForm transform with CORRECTED review diff only", () => {
    const changeResponse = normalizeReviewDiffToChangeResponse(
      {
        changes: [
          {
            fieldPath:
              "organizationGeneralSettings.permissions.groupPermissions.sendProblemMemberLetter",
            change: { oldValue: true, newValue: false, status: "FAILED" },
          },
          {
            fieldPath:
              "organizationGeneralSettings.permissions.groupPermissions.sendFraudWasteAndAbuseTermLetter",
            change: { oldValue: true, newValue: false, status: "CORRECTED" },
          },
        ],
      },
      { scalarStatusFilter: "CORRECTED" },
    );

    const { sections } = transformChangesToSections(changeResponse);
    expect(sections).toHaveLength(1);
    expect(sections[0].rows).toHaveLength(1);
    expect(sections[0].rows[0].previousValue).toBe("Yes");
    expect(sections[0].rows[0].updatedValue).toBe("No");
  });
});
