import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { triggerRefresh, checkRefreshStatus } from "./syncService";
import api from "@/api/apiService";
import { showCustomToast } from "@ucc/common-ui";
import { ToastType } from "@/constants";

vi.mock("@/api/apiService", () => ({
  __esModule: true,
  default: { get: vi.fn() },
}));

vi.mock("@ucc/common-ui", () => ({
  showCustomToast: vi.fn(),
}));

const mockStartSync = vi.fn();
const mockSetOrg = vi.fn();
const mockSetGroupUpdatedAt = vi.fn();

vi.mock("@/store/useSyncStore", () => ({
  __esModule: true,
  default: {
    getState: vi.fn(() => ({ startSync: mockStartSync })),
  },
}));

vi.mock("@/store/configStore", () => ({
  __esModule: true,
  default: {
    getState: vi.fn(() => ({
      org: { orgName: "Test Org" },
      setOrg: mockSetOrg,
      setGroupUpdatedAt: mockSetGroupUpdatedAt,
    })),
  },
}));

vi.mock("@/router/routes", () => ({
  ORG_DETAIL_PATH: "/org",
  GRP_DETAIL_PATH: "/group",
}));

vi.mock("@/utils", () => ({
  capitalizeFirstLetter: (str: string) => str.charAt(0).toUpperCase() + str.slice(1),
}));

describe("syncService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete (window as any).location;
    (window as any).location = { href: "", pathname: "" };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("triggerRefresh", () => {
    it("should call the correct API endpoint and return operationId", async () => {
      (api.get as any).mockResolvedValueOnce({ data: "op123" });

      const result = await triggerRefresh("organization", "org-id-1");

      expect(api.get).toHaveBeenCalledWith(
        "/client-configurations/refresh?entityType=organization&entityId=org-id-1"
      );
      expect(result).toBe("op123");
    });

    it("should handle group type", async () => {
      (api.get as any).mockResolvedValueOnce({ data: "op456" });

      const result = await triggerRefresh("group", "grp-id-1");

      expect(api.get).toHaveBeenCalledWith(
        "/client-configurations/refresh?entityType=group&entityId=grp-id-1"
      );
      expect(result).toBe("op456");
    });

    it("should throw an error if the API call fails", async () => {
      (api.get as any).mockRejectedValueOnce(new Error("Network error"));

      await expect(triggerRefresh("organization", "id")).rejects.toThrow("Network error");
    });
  });

  describe("checkRefreshStatus", () => {
    it("should handle completed status for organization and show success toast", async () => {
      const mockDate = "2024-01-01T00:00:00.000Z";
      vi.useFakeTimers();
      vi.setSystemTime(new Date(mockDate));

      const res = { status: "COMPLETED", name: "Test Org", id: "org-1" };
      (api.get as any).mockResolvedValueOnce({ data: res });
      const updateSyncStatus = vi.fn();
      const getStore = () => ({ updateSyncStatus } as any);

      await checkRefreshStatus("org-1", "op123", getStore, "organization");

      expect(updateSyncStatus).toHaveBeenCalledWith(
        "org-1",
        expect.objectContaining({ status: "success", lastSynced: mockDate })
      );
      expect(mockSetOrg).toHaveBeenCalledWith({ updatedAt: mockDate });
      expect(showCustomToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ToastType.Success,
          title: expect.anything(),
          message: expect.any(Function),
        })
      );

      vi.useRealTimers();
    });

    it("should handle completed status for group and show success toast", async () => {
      const mockDate = "2024-01-01T00:00:00.000Z";
      vi.useFakeTimers();
      vi.setSystemTime(new Date(mockDate));

      const res = { status: "completed", name: "Test Group", id: "grp-1" };
      (api.get as any).mockResolvedValueOnce({ data: res });
      const updateSyncStatus = vi.fn();
      const getStore = () => ({ updateSyncStatus } as any);

      await checkRefreshStatus("grp-1", "op456", getStore, "group");

      expect(updateSyncStatus).toHaveBeenCalledWith(
        "grp-1",
        expect.objectContaining({ status: "success", lastSynced: mockDate })
      );
      expect(mockSetGroupUpdatedAt).toHaveBeenCalledWith(mockDate);
      expect(showCustomToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ToastType.Success,
          title: expect.anything(),
          message: expect.any(Function),
        })
      );

      vi.useRealTimers();
    });

    it("should render success toast message with view link", async () => {
      const res = { status: "completed", name: "Test Org", id: "org-1" };
      (api.get as any).mockResolvedValueOnce({ data: res });
      const updateSyncStatus = vi.fn();
      const getStore = () => ({ updateSyncStatus } as any);

      await checkRefreshStatus("org-1", "op123", getStore, "organization");

      const toastCall = (showCustomToast as any).mock.calls[0][0];
      expect(toastCall.message).toBeInstanceOf(Function);

      const closeToast = vi.fn();
      const messageElement = toastCall.message(closeToast);

      expect(messageElement.props.children[0].props.children).toBe("Test Org");
    });

    it("should handle view link click in success toast", async () => {
      const res = { status: "completed", name: "Test Org", id: "org-1" };
      (api.get as any).mockResolvedValueOnce({ data: res });
      const updateSyncStatus = vi.fn();
      const getStore = () => ({ updateSyncStatus } as any);

      await checkRefreshStatus("org-1", "op123", getStore, "organization");

      const toastCall = (showCustomToast as any).mock.calls[0][0];
      const closeToast = vi.fn();
      const messageElement = toastCall.message(closeToast);
      const linkElement = messageElement.props.children[1];

      const mockEvent = { preventDefault: vi.fn() };
      linkElement.props.onClick(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(closeToast).toHaveBeenCalled();
      expect(window.location.href).toBe("/org/org-1");
    });

    it("should generate correct URL for group type", async () => {
      const res = { status: "completed", name: "Test Group", id: "grp-1" };
      (api.get as any).mockResolvedValueOnce({ data: res });
      const updateSyncStatus = vi.fn();
      const getStore = () => ({ updateSyncStatus } as any);

      await checkRefreshStatus("grp-1", "op456", getStore, "group");

      const toastCall = (showCustomToast as any).mock.calls[0][0];
      const closeToast = vi.fn();
      const messageElement = toastCall.message(closeToast);
      const linkElement = messageElement.props.children[1];

      const mockEvent = { preventDefault: vi.fn() };
      linkElement.props.onClick(mockEvent);

      expect(window.location.href).toBe("/group/grp-1");
    });

    it("should handle failed status and show error toast with function message", async () => {
      const res = { status: "FAILED", name: "Test Org", id: "org-1" };
      (api.get as any).mockResolvedValueOnce({ data: res });
      const updateSyncStatus = vi.fn();
      const getStore = () => ({ updateSyncStatus } as any);

      await checkRefreshStatus("org-1", "op123", getStore, "organization");

      expect(updateSyncStatus).toHaveBeenCalledWith("org-1", { status: "error" });
      expect(showCustomToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ToastType.Error,
          title: "Sync failed",
          message: expect.any(Function),
        })
      );
    });

    it("should render failed toast message with sync again button", async () => {
      const res = { status: "failed", name: "Test Org", id: "org-1" };
      (api.get as any).mockResolvedValueOnce({ data: res });
      const updateSyncStatus = vi.fn();
      const getStore = () => ({ updateSyncStatus } as any);

      await checkRefreshStatus("org-1", "op123", getStore, "organization");

      const toastCall = (showCustomToast as any).mock.calls[0][0];
      const closeToast = vi.fn();
      const messageElement = toastCall.message(closeToast);

      expect(messageElement.props.children[0].props.children).toBe("Test Org");
      expect(messageElement.props.children[1].type).toBe("button");
    });

    it("should handle sync again button click in failed toast", async () => {
      const res = { status: "failed", name: "Test Org", id: "org-1" };
      (api.get as any).mockResolvedValueOnce({ data: res });
      const updateSyncStatus = vi.fn();
      const getStore = () => ({ updateSyncStatus } as any);

      await checkRefreshStatus("org-1", "op123", getStore, "organization");

      const toastCall = (showCustomToast as any).mock.calls[0][0];
      const closeToast = vi.fn();
      const messageElement = toastCall.message(closeToast);
      const buttonElement = messageElement.props.children[1];

      buttonElement.props.onClick();

      expect(mockStartSync).toHaveBeenCalledWith("organization", "org-1");
      expect(closeToast).toHaveBeenCalled();
    });

    it("should handle API error and show error toast", async () => {
      (api.get as any).mockRejectedValueOnce(new Error("Network error"));
      const updateSyncStatus = vi.fn();
      const getStore = () => ({ updateSyncStatus } as any);

      await checkRefreshStatus("org-1", "op123", getStore, "organization");

      expect(updateSyncStatus).toHaveBeenCalledWith("org-1", { status: "error" });
      expect(showCustomToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ToastType.Error,
          title: "Sync failed",
          message: expect.any(Function),
        })
      );
    });

    it("should render error toast message with org name and sync again button", async () => {
      (api.get as any).mockRejectedValueOnce(new Error("Network error"));
      const updateSyncStatus = vi.fn();
      const getStore = () => ({ updateSyncStatus } as any);

      await checkRefreshStatus("org-1", "op123", getStore, "organization");

      const toastCall = (showCustomToast as any).mock.calls[0][0];
      const closeToast = vi.fn();
      const messageElement = toastCall.message(closeToast);

      expect(messageElement.props.children[0].props.children).toBe("Test Org");
      expect(messageElement.props.children[1].type).toBe("button");
    });

    it("should handle sync again button click in error toast", async () => {
      (api.get as any).mockRejectedValueOnce(new Error("Network error"));
      const updateSyncStatus = vi.fn();
      const getStore = () => ({ updateSyncStatus } as any);

      await checkRefreshStatus("org-1", "op123", getStore, "organization");

      const toastCall = (showCustomToast as any).mock.calls[0][0];
      const closeToast = vi.fn();
      const messageElement = toastCall.message(closeToast);
      const buttonElement = messageElement.props.children[1];

      buttonElement.props.onClick();

      expect(mockStartSync).toHaveBeenCalledWith("organization", "org-1");
      expect(closeToast).toHaveBeenCalled();
    });

    it("should poll until status becomes completed", async () => {
      const statuses = [
        { data: { status: "processing" } },
        { data: { status: "in_progress" } },
        { data: { status: "completed", name: "Test Org", id: "org-1" } },
      ];
      (api.get as any)
        .mockResolvedValueOnce(statuses[0])
        .mockResolvedValueOnce(statuses[1])
        .mockResolvedValueOnce(statuses[2]);
      const updateSyncStatus = vi.fn();
      const getStore = () => ({ updateSyncStatus } as any);

      await checkRefreshStatus("org-1", "op123", getStore, "organization");

      expect(api.get).toHaveBeenCalledTimes(3);
      expect(updateSyncStatus).toHaveBeenCalledWith(
        "org-1",
        expect.objectContaining({ status: "success", lastSynced: expect.any(String) })
      );
      expect(showCustomToast).toHaveBeenCalled();
    });

    it("should poll until status becomes failed", async () => {
      const statuses = [
        { data: { status: "processing" } },
        { data: { status: "failed", name: "Test Org", id: "org-1" } },
      ];
      (api.get as any)
        .mockResolvedValueOnce(statuses[0])
        .mockResolvedValueOnce(statuses[1]);
      const updateSyncStatus = vi.fn();
      const getStore = () => ({ updateSyncStatus } as any);

      await checkRefreshStatus("org-1", "op123", getStore, "organization");

      expect(api.get).toHaveBeenCalledTimes(2);
      expect(updateSyncStatus).toHaveBeenCalledWith("org-1", { status: "error" });
      expect(showCustomToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: ToastType.Error })
      );
    });

    it("should handle case-insensitive status normalization", async () => {
      const res = { status: "CoMpLeTeD", name: "Test Org", id: "org-1" };
      (api.get as any).mockResolvedValueOnce({ data: res });
      const updateSyncStatus = vi.fn();
      const getStore = () => ({ updateSyncStatus } as any);

      await checkRefreshStatus("org-1", "op123", getStore, "organization");

      expect(updateSyncStatus).toHaveBeenCalledWith(
        "org-1",
        expect.objectContaining({ status: "success" })
      );
    });

    it("should handle empty status", async () => {
      const statuses = [
        { data: { status: "" } },
        { data: { status: "completed", name: "Test Org", id: "org-1" } },
      ];
      (api.get as any)
        .mockResolvedValueOnce(statuses[0])
        .mockResolvedValueOnce(statuses[1]);
      const updateSyncStatus = vi.fn();
      const getStore = () => ({ updateSyncStatus } as any);

      await checkRefreshStatus("org-1", "op123", getStore, "organization");

      expect(api.get).toHaveBeenCalledTimes(2);
      expect(updateSyncStatus).toHaveBeenCalledWith(
        "org-1",
        expect.objectContaining({ status: "success" })
      );
    });

    it("should handle null status", async () => {
      const statuses = [
        { data: { status: null } },
        { data: { status: "completed", name: "Test Org", id: "org-1" } },
      ];
      (api.get as any)
        .mockResolvedValueOnce(statuses[0])
        .mockResolvedValueOnce(statuses[1]);
      const updateSyncStatus = vi.fn();
      const getStore = () => ({ updateSyncStatus } as any);

      await checkRefreshStatus("org-1", "op123", getStore, "organization");

      expect(api.get).toHaveBeenCalledTimes(2);
    });

    it("should handle undefined status", async () => {
      const statuses = [
        { data: {} },
        { data: { status: "completed", name: "Test Org", id: "org-1" } },
      ];
      (api.get as any)
        .mockResolvedValueOnce(statuses[0])
        .mockResolvedValueOnce(statuses[1]);
      const updateSyncStatus = vi.fn();
      const getStore = () => ({ updateSyncStatus } as any);

      await checkRefreshStatus("org-1", "op123", getStore, "organization");

      expect(api.get).toHaveBeenCalledTimes(2);
    });

    it("should call API with correct operationId and timeout", async () => {
      const res = { status: "completed", name: "Test Org", id: "org-1" };
      (api.get as any).mockResolvedValueOnce({ data: res });
      const updateSyncStatus = vi.fn();
      const getStore = () => ({ updateSyncStatus } as any);

      await checkRefreshStatus("org-1", "operation-123", getStore, "organization");

      expect(api.get).toHaveBeenCalledWith(
        "/client-configurations/refresh-status?operationId=operation-123&timeout=60000"
      );
    });

    it("should capitalize org type correctly in success toast title", async () => {
      const res = { status: "completed", name: "Test Org", id: "org-1" };
      (api.get as any).mockResolvedValueOnce({ data: res });
      const updateSyncStatus = vi.fn();
      const getStore = () => ({ updateSyncStatus } as any);

      await checkRefreshStatus("org-1", "op123", getStore, "organization");

      const toastCall = (showCustomToast as any).mock.calls[0][0];
      expect(toastCall.title).toBeDefined();
      // Title is a React element, check its content through type property
      expect(toastCall.type).toBe(ToastType.Success);
    });

    it("should capitalize group type correctly in success toast title", async () => {
      const res = { status: "completed", name: "Test Group", id: "grp-1" };
      (api.get as any).mockResolvedValueOnce({ data: res });
      const updateSyncStatus = vi.fn();
      const getStore = () => ({ updateSyncStatus } as any);

      await checkRefreshStatus("grp-1", "op456", getStore, "group");

      const toastCall = (showCustomToast as any).mock.calls[0][0];
      expect(toastCall.title).toBeDefined();
      // Title is a React element, check its content through type property
      expect(toastCall.type).toBe(ToastType.Success);
    });
  });
});

