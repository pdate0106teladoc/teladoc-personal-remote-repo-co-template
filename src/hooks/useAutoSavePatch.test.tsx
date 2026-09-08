import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAutoSavePatch, buildAutoSaveRetryToastMessage } from "./useAutoSavePatch";

const mockPatch = vi.fn();

vi.mock("@/api/apiService", () => ({
  default: {
    patch: (...args: any[]) => mockPatch(...args),
  },
}));

const mockStoreState = {
  savePayload: {} as Record<string, any>,
  saveTimerId: null as any,
  updateSavePayload: vi.fn(),
  clearSavePayload: vi.fn(),
  setIsSaving: vi.fn(),
  setLastSavedAt: vi.fn(),
  setSaveTimerId: vi.fn(),
};

vi.mock("@/store/editStore", () => {
  const useEditStore: any = (selector: (s: any) => any) => selector(mockStoreState);
  useEditStore.getState = () => mockStoreState;
  return { default: useEditStore };
});

vi.mock("@ucc/common-ui", () => ({
  showCustomToast: vi.fn(),
}));

vi.mock("@/constants", () => ({
  AUTO_SAVE_INTERVAL_MS: 5000,
  ERROR_MESSAGES: {
    AUTO_SAVE_RETRY_OR_SERVICE_DESK: "Retry or contact service desk",
    AUTO_SAVE_CONTACT_SERVICE_DESK_ONLY: "Contact service desk",
  },
  ToastType: {
    Success: "success",
    Error: "error",
  },
}));

import { showCustomToast } from "@ucc/common-ui";

describe("buildAutoSaveRetryToastMessage", () => {
  it("returns a function that renders a retry button", () => {
    const onRetry = vi.fn();
    const renderMessage = buildAutoSaveRetryToastMessage(onRetry);
    const closeToast = vi.fn();
    const element = renderMessage(closeToast);

    expect(element).toBeTruthy();
  });
});

describe("useAutoSavePatch", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mockStoreState.savePayload = {};
    mockStoreState.saveTimerId = null;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const defaultParams = {
    entityType: "organizations" as const,
    entityId: "org-123",
    editBaseUrl: "http://api.test/",
  };

  it("handleSaveChanges updates payload and sets a timer", () => {
    const { result } = renderHook(() => useAutoSavePatch(defaultParams));

    act(() => {
      result.current.handleSaveChanges("billing", { field1: "value1" });
    });

    expect(mockStoreState.updateSavePayload).toHaveBeenCalledWith("billing", { field1: "value1" });
    expect(mockStoreState.setSaveTimerId).toHaveBeenCalled();
  });

  it("handleSaveChanges clears existing timer before setting new one", () => {
    mockStoreState.saveTimerId = 999;

    const { result } = renderHook(() => useAutoSavePatch(defaultParams));

    act(() => {
      result.current.handleSaveChanges("billing", { field1: "value1" });
    });

    expect(mockStoreState.setSaveTimerId).toHaveBeenCalledWith(null);
  });

  it("flushPendingSave returns true when payload is empty", async () => {
    mockStoreState.savePayload = {};

    const { result } = renderHook(() => useAutoSavePatch(defaultParams));

    let success: boolean = false;
    await act(async () => {
      success = await result.current.flushPendingSave();
    });

    expect(success).toBe(true);
    expect(mockPatch).not.toHaveBeenCalled();
  });

  it("flushPendingSave calls api.patch when payload is not empty", async () => {
    mockStoreState.savePayload = { billing: { field1: "value1" } };
    mockPatch.mockResolvedValueOnce({});

    const { result } = renderHook(() => useAutoSavePatch(defaultParams));

    let success: boolean = false;
    await act(async () => {
      success = await result.current.flushPendingSave();
    });

    expect(success).toBe(true);
    expect(mockPatch).toHaveBeenCalledWith(
      "http://api.test/client-configurations/organizations/org-123",
      { billing: { field1: "value1" } },
    );
  });

  it("flushPendingSave returns false when api.patch fails", async () => {
    mockStoreState.savePayload = { billing: { field1: "value1" } };
    mockPatch.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useAutoSavePatch(defaultParams));

    let success: boolean = false;
    await act(async () => {
      success = await result.current.flushPendingSave();
    });

    expect(success).toBe(false);
  });

  it("flushPendingSave clears pending timer", async () => {
    mockStoreState.savePayload = {};
    mockStoreState.saveTimerId = 123;

    const { result } = renderHook(() => useAutoSavePatch(defaultParams));

    await act(async () => {
      await result.current.flushPendingSave();
    });

    expect(mockStoreState.setSaveTimerId).toHaveBeenCalledWith(null);
  });

  it("shows success toast on successful auto save", async () => {
    mockStoreState.savePayload = { billing: { field1: "val" } };
    mockPatch.mockResolvedValueOnce({});

    const { result } = renderHook(() => useAutoSavePatch(defaultParams));

    act(() => {
      result.current.handleSaveChanges("billing", { field1: "val" });
    });

    mockStoreState.savePayload = { billing: { field1: "val" } };

    await act(async () => {
      vi.runAllTimers();
    });

    expect(showCustomToast).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "success",
        title: "Success",
      }),
    );
  });

  it("shows error toast on failed auto save", async () => {
    mockStoreState.savePayload = { billing: { field1: "val" } };
    mockPatch.mockRejectedValueOnce(new Error("fail"));

    const { result } = renderHook(() => useAutoSavePatch(defaultParams));

    act(() => {
      result.current.handleSaveChanges("billing", { field1: "val" });
    });

    mockStoreState.savePayload = { billing: { field1: "val" } };

    await act(async () => {
      vi.runAllTimers();
    });

    expect(showCustomToast).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "error",
        title: "Unable to save your changes",
      }),
    );
  });
});
