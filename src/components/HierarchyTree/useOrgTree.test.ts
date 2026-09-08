/* @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor, cleanup } from "@testing-library/react";

// --------------------
// Mocks (must be before importing the hook)
// --------------------

const apiGet = vi.fn();

vi.mock("@/api/apiService", () => ({
  default: {
    get: (...args: any[]) => apiGet(...args),
  },
}));

const toastSpy = vi.fn();
vi.mock("@ucc/common-ui", () => ({
  showCustomToast: (args: any) => toastSpy(args),
}));

// Partial mock to avoid "missing export" crashes from "@/constants"
vi.mock("@/constants", async () => {
  const actual = await vi.importActual<any>("@/constants").catch(() => ({}));
  return {
    ...actual,
    API_ENDPOINTS: {
      ...(actual?.API_ENDPOINTS ?? {}),
      organization: "/organization",
      children: "/children",
    },
    ERROR_MESSAGES: {
      ...(actual?.ERROR_MESSAGES ?? {}),
      SOMETHINGS_WRONG: "Something went wrong",
    },
    ToastType: {
      ...(actual?.ToastType ?? {}),
      Error: "Error",
    },
  };
});

// Import AFTER mocks
import { useOrgTree } from "./useOrgTree";

function deferred<T>() {
  let resolve!: (v: T) => void;
  let reject!: (e: any) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("useOrgTree", () => {
  beforeEach(() => {
    apiGet.mockReset();
    toastSpy.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("returns early when orgId is missing (no API call)", async () => {
    const { result } = renderHook(() => useOrgTree());

    await act(async () => {
      await result.current.fetchChildrenForOrg(undefined);
    });

    expect(apiGet).not.toHaveBeenCalled();
    expect(result.current.dynamicChildMap).toEqual({});
    expect(result.current.loadingMap).toEqual({});
  });

  it("fetches children/groups when server returns array shape (data[0]) and caches result", async () => {
    apiGet.mockResolvedValueOnce({
      data: [
        {
          children: [{ id: "c1", name: "Child 1", isBillingOrg: false, countOfChildren: 0 }],
          groups: [{ id: "g1", name: "Group 1" }],
        },
      ],
    });

    const { result } = renderHook(() => useOrgTree());

    await act(async () => {
      await result.current.fetchChildrenForOrg("org-1");
    });

    expect(apiGet).toHaveBeenCalledTimes(1);
    expect(apiGet.mock.calls[0][0]).toBe("/organization/org-1/children");

    expect(result.current.dynamicChildMap["org-1"]).toEqual({
      children: [{ id: "c1", name: "Child 1", isBillingOrg: false, countOfChildren: 0 }],
      groups: [{ id: "g1", name: "Group 1" }],
    });

    // Cache hit branch: second call should early return (no second API call)
    await act(async () => {
      await result.current.fetchChildrenForOrg("org-1");
    });
    expect(apiGet).toHaveBeenCalledTimes(1);
  });

  it("fetches children/groups when server returns object shape (data)", async () => {
    apiGet.mockResolvedValueOnce({
      data: {
        children: [{ id: "c2", name: "Child 2" }],
        groups: [{ id: "g2", name: "Group 2" }],
      },
    });

    const { result } = renderHook(() => useOrgTree());

    await act(async () => {
      await result.current.fetchChildrenForOrg("org-2");
    });

    expect(apiGet).toHaveBeenCalledTimes(1);
    expect(apiGet.mock.calls[0][0]).toBe("/organization/org-2/children");

    expect(result.current.dynamicChildMap["org-2"]).toEqual({
      children: [{ id: "c2", name: "Child 2" }],
      groups: [{ id: "g2", name: "Group 2" }],
    });
  });

  it("sets loading true while in-flight and false after success", async () => {
    const d = deferred<any>();
    apiGet.mockReturnValueOnce(d.promise);

    const { result } = renderHook(() => useOrgTree());

    act(() => {
      // start request but do not await
      void result.current.fetchChildrenForOrg("org-3");
    });

    await waitFor(() => {
      expect(result.current.loadingMap["org-3"]).toBe(true);
    });

    await act(async () => {
      d.resolve({
        data: [
          {
            children: [{ id: "c3", name: "Child 3" }],
            groups: [{ id: "g3", name: "Group 3" }],
          },
        ],
      });
      await d.promise;
    });

    await waitFor(() => {
      expect(result.current.loadingMap["org-3"]).toBe(false);
      expect(result.current.dynamicChildMap["org-3"]).toEqual({
        children: [{ id: "c3", name: "Child 3" }],
        groups: [{ id: "g3", name: "Group 3" }],
      });
    });
  });

  it("shows toast on error and clears loading in finally", async () => {
    apiGet.mockRejectedValueOnce(new Error("boom"));

    const { result } = renderHook(() => useOrgTree());

    await act(async () => {
      await result.current.fetchChildrenForOrg("org-err");
    });

    expect(toastSpy).toHaveBeenCalledTimes(1);
    expect(toastSpy.mock.calls[0][0]).toMatchObject({
      type: "Error",
      title: "Failed",
      message: "Something went wrong",
    });

    expect(result.current.loadingMap["org-err"]).toBe(false);
    // Ensure no cache entry written on failure
    expect(result.current.dynamicChildMap["org-err"]).toBeUndefined();
  });
});
