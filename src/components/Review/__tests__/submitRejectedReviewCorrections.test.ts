import { describe, it, expect, vi, beforeEach } from "vitest";
import { submitRejectedReviewCorrections } from "../submitRejectedReviewCorrections";

const mockPut = vi.fn();
const mockGet = vi.fn();

vi.mock("@/api/apiService", () => ({
  default: {
    put: (...args: unknown[]) => mockPut(...args),
    get: (...args: unknown[]) => mockGet(...args),
  },
}));

const mockEditFormData: Record<string, unknown> = {};
vi.mock("@/store/editStore", () => ({
  default: {
    getState: () => ({ editFormData: mockEditFormData }),
  },
}));

const mockRejectedReviewPathMap: Record<string, string> = {};
vi.mock("@/store/useReviewStore", () => ({
  default: {
    getState: () => ({
      rejectedReviewFieldPathByFormKey: mockRejectedReviewPathMap,
      setRejectedReviewFieldPathByFormKey: (map: Record<string, string>) => {
        Object.keys(mockRejectedReviewPathMap).forEach(
          (key) => delete mockRejectedReviewPathMap[key],
        );
        Object.assign(mockRejectedReviewPathMap, map);
      },
    }),
  },
}));

describe("submitRejectedReviewCorrections", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(mockEditFormData).forEach((key) => delete mockEditFormData[key]);
    Object.keys(mockRejectedReviewPathMap).forEach(
      (key) => delete mockRejectedReviewPathMap[key],
    );
    mockPut.mockResolvedValue({});
    mockGet.mockResolvedValue({ diff: { changes: [] } });
    import.meta.env.VITE_TASK_URL = "http://task.test/";
  });

  it("PUTs corrected fields using the review store path map", async () => {
    mockRejectedReviewPathMap["permissions.groupPermissions.sendProblemMemberLetter"] =
      "organizationGeneralSettings.permissions.groupPermissions.sendProblemMemberLetter";
    mockEditFormData["permissions.groupPermissions.sendProblemMemberLetter"] = false;

    await submitRejectedReviewCorrections({
      candidateId: "O-00624",
      taskUrl: "http://task.test/",
    });

    expect(mockPut).toHaveBeenCalledWith(
      "http://task.test/client-configurations/tasks/O-00624/review",
      {
        correctedFields: [
          {
            fieldPath:
              "organizationGeneralSettings.permissions.groupPermissions.sendProblemMemberLetter",
            correctedValue: "false",
          },
        ],
      },
    );
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("fetches review diff when store path map is empty", async () => {
    mockGet.mockResolvedValue({
      diff: {
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
            metadata: {
              dataType: "BOOLEAN",
              allowedValues: null,
              mandatory: false,
              regex: "",
              defaultValue: true,
              uiComponentType: "checkbox",
            },
          },
        ],
      },
    });
    mockEditFormData["permissions.groupPermissions.sendProblemMemberLetter"] = false;

    await submitRejectedReviewCorrections({
      candidateId: "O-00624",
      taskUrl: "http://task.test/",
    });

    expect(mockGet).toHaveBeenCalledWith(
      "http://task.test/client-configurations/tasks/O-00624/review",
    );
    expect(mockPut).toHaveBeenCalled();
  });
});
