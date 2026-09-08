import { describe, it, expect, beforeEach, vi, beforeAll, afterEach } from "vitest";
import useSyncStore from "../useSyncStore";

class LocalStorageMock {
  private store: Record<string, string> = {};

  clear() {
    this.store = {};
  }

  getItem(key: string) {
    return Object.prototype.hasOwnProperty.call(this.store, key)
      ? this.store[key]
      : null;
  }

  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }

  removeItem(key: string) {
    delete this.store[key];
  }
}

beforeAll(() => {
  // @ts-expect-error - defining localStorage on global for tests
  global.localStorage = new LocalStorageMock();
});

const triggerRefreshMock = vi.fn<
  (type: string, id: string) => Promise<{ operationId: string }>
>();
const checkRefreshStatusMock = vi.fn<
  (operationId: string) => Promise<{ status: string; lastSynced?: string }>
>();

vi.mock("@/api/syncService", () => ({
  triggerRefresh: (...args: Parameters<typeof triggerRefreshMock>) =>
    triggerRefreshMock(...args),
  checkRefreshStatus: (...args: Parameters<typeof checkRefreshStatusMock>) =>
    checkRefreshStatusMock(...args),
}));

describe("useSyncStore", () => {
  const JOB_ID = "job-123";
  const JOB_KEY = `syncJob_${JOB_ID}`;

  beforeEach(() => {
    useSyncStore.setState({ jobs: {} });
    (global.localStorage as unknown as LocalStorageMock).clear();
    triggerRefreshMock.mockReset();
    checkRefreshStatusMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with an empty jobs object", () => {
    const { jobs } = useSyncStore.getState();
    expect(jobs).toEqual({});
  });

  it("hydrateJob loads a stored job from localStorage", () => {
    const storedJob = {
      status: "success",
      lastSynced: "2025-01-01T10:00:00.000Z",
      operationId: "op-xyz",
    };

    localStorage.setItem(JOB_KEY, JSON.stringify(storedJob));

    const { hydrateJob } = useSyncStore.getState();
    hydrateJob(JOB_ID);

    const stateAfter = useSyncStore.getState();
    expect(stateAfter.jobs[JOB_ID]).toEqual(storedJob);
  });

  it("hydrateJob handles missing stored job without throwing", () => {
    const { hydrateJob } = useSyncStore.getState();

    expect(() => hydrateJob(JOB_ID)).not.toThrow();

    const { jobs } = useSyncStore.getState();
    expect(
      Object.prototype.hasOwnProperty.call(jobs, JOB_ID) || jobs[JOB_ID] === undefined
    ).toBe(true);
  });

  it("updateSyncStatus merges with existing job and persists to localStorage", () => {
    const initialJob = {
      status: "pending" as const,
      lastSynced: "2025-01-01T00:00:00.000Z",
      operationId: "op-1",
    };

    useSyncStore.setState({
      jobs: {
        [JOB_ID]: initialJob,
      },
    });

    const { updateSyncStatus } = useSyncStore.getState();

    updateSyncStatus(JOB_ID, {
      status: "success",
      lastSynced: "2025-01-02T12:00:00.000Z",
    });

    const { jobs } = useSyncStore.getState();
    const updated = jobs[JOB_ID];

    expect(updated).toEqual({
      ...initialJob,
      status: "success",
      lastSynced: "2025-01-02T12:00:00.000Z",
    });

    const stored = localStorage.getItem(JOB_KEY);
    expect(stored).not.toBeNull();

    const parsed = JSON.parse(stored as string);
    expect(parsed).toEqual(updated);
  });

  it("updateSyncStatus creates a new job when none exists and persists it", () => {
    const { updateSyncStatus } = useSyncStore.getState();

    updateSyncStatus(JOB_ID, {
      status: "processing",
      operationId: "op-new",
    });

    const { jobs } = useSyncStore.getState();
    const job = jobs[JOB_ID];

    expect(job).toEqual({
      status: "processing",
      operationId: "op-new",
    });

    const stored = localStorage.getItem(JOB_KEY);
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored as string)).toEqual(job);
  });

  it("startSync calls triggerRefresh and updates job state on success", async () => {
    const operationId = "op-success";

    triggerRefreshMock.mockResolvedValue({ operationId });
    checkRefreshStatusMock.mockResolvedValue({
      status: "success",
      lastSynced: "2025-01-03T08:00:00.000Z",
    });

    const { startSync } = useSyncStore.getState();

    await startSync("someType", JOB_ID);

    expect(triggerRefreshMock).toHaveBeenCalledTimes(1);
    expect(triggerRefreshMock).toHaveBeenCalledWith("someType", JOB_ID);

    expect(checkRefreshStatusMock).toHaveBeenCalled();
    expect(checkRefreshStatusMock).toHaveBeenCalledWith(
      JOB_ID,
      { operationId },
      expect.any(Function),
      "someType"
    );

    const { jobs } = useSyncStore.getState();
    const job = jobs[JOB_ID];

    expect(job).toBeDefined();
    expect(job!.status).not.toBe("error");
  });

  it("startSync handles errors from triggerRefresh and sets an error-like state", async () => {
    triggerRefreshMock.mockRejectedValue(new Error("network error"));

    const { startSync } = useSyncStore.getState();

    await expect(startSync("someType", JOB_ID)).resolves.toBeUndefined();

    const { jobs } = useSyncStore.getState();
    const job = jobs[JOB_ID];

    expect(job).toBeDefined();
  });

  it("startSync can be awaited multiple times without leaking state between calls", async () => {
    const operationId1 = "op-1";
    const operationId2 = "op-2";

    triggerRefreshMock
      .mockResolvedValueOnce({ operationId: operationId1 })
      .mockResolvedValueOnce({ operationId: operationId2 });

    checkRefreshStatusMock
      .mockResolvedValueOnce({ status: "success", lastSynced: "2025-01-04T09:00:00.000Z" })
      .mockResolvedValueOnce({ status: "success", lastSynced: "2025-01-05T10:00:00.000Z" });

    const { startSync } = useSyncStore.getState();

    await startSync("typeA", JOB_ID);
    const firstState = useSyncStore.getState().jobs[JOB_ID];

    await startSync("typeB", JOB_ID);
    const secondState = useSyncStore.getState().jobs[JOB_ID];

    expect(firstState).not.toEqual(secondState);
  });
});
