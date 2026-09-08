import { describe, it, expect, vi, beforeEach } from "vitest";
import { saveReviewerMarkedFailedFields } from "../saveReviewerMarkedFailedFields";

const mockPut = vi.fn();
const mockGet = vi.fn();

vi.mock("@/api/apiService", () => ({
  default: {
    put: (...args: unknown[]) => mockPut(...args),
    get: (...args: unknown[]) => mockGet(...args),
  },
}));

const mockFailedFields = new Set<string>();
const mockReviewFieldPathByUiKey: Record<string, string> = {};

vi.mock("@/store/useReviewStore", () => ({
  default: {
    getState: () => ({
      failedFields: mockFailedFields,
      reviewFieldPathByUiKey: mockReviewFieldPathByUiKey,
      setReviewFieldPathByUiKey: (map: Record<string, string>) => {
        Object.keys(mockReviewFieldPathByUiKey).forEach(
          (key) => delete mockReviewFieldPathByUiKey[key],
        );
        Object.assign(mockReviewFieldPathByUiKey, map);
      },
    }),
  },
}));

describe("saveReviewerMarkedFailedFields", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFailedFields.clear();
    Object.keys(mockReviewFieldPathByUiKey).forEach(
      (key) => delete mockReviewFieldPathByUiKey[key],
    );
    mockPut.mockResolvedValue({});
    mockGet.mockResolvedValue({ diff: { changes: [] } });
    import.meta.env.VITE_TASK_URL = "http://task.test/";
  });

  it("does not call PUT when no fields are marked failed", async () => {
    await saveReviewerMarkedFailedFields({
      candidateId: "O-00614",
      taskUrl: "http://task.test/",
    });

    expect(mockPut).not.toHaveBeenCalled();
  });

  it("PUTs failedFields payload when reviewer marked fields as failed", async () => {
    const uiKey =
      "organizationGeneralSettings::Permissions::Group permissions::0";
    mockFailedFields.add(uiKey);
    mockReviewFieldPathByUiKey[uiKey] =
      "organizationGeneralSettings.overview.accountOverview.benefitRestrictionCode";

    await saveReviewerMarkedFailedFields({
      candidateId: "O-00614",
      taskUrl: "http://task.test/",
    });

    expect(mockPut).toHaveBeenCalledWith(
      "http://task.test/client-configurations/tasks/O-00614/review",
      {
        failedFields: [
          "organizationGeneralSettings.overview.accountOverview.benefitRestrictionCode",
        ],
      },
    );
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("fetches review diff to resolve field paths when store map is empty", async () => {
    const uiKey =
      "organizationGeneralSettings::Permissions::Group permissions::0";
    mockFailedFields.add(uiKey);

    mockGet.mockResolvedValue({
      diff: {
        changes: [
          {
            fieldPath:
              "organizationGeneralSettings.permissions.groupPermissions.sendProblemMemberLetter",
            change: {
              oldValue: true,
              newValue: false,
              status: "PENDING",
              correctedBy: null,
              correctedAt: null,
              rejectCount: null,
            },
          },
        ],
      },
    });

    await saveReviewerMarkedFailedFields({
      candidateId: "O-00614",
      taskUrl: "http://task.test/",
    });

    expect(mockGet).toHaveBeenCalledWith(
      "http://task.test/client-configurations/tasks/O-00614/review",
    );
    expect(mockPut).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        failedFields: expect.arrayContaining([
          "organizationGeneralSettings.permissions.groupPermissions.sendProblemMemberLetter",
        ]),
      }),
    );
  });
});
