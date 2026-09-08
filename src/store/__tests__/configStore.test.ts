import { describe, it, expect, beforeAll, beforeEach } from "vitest";

const createStorageMock = () => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
};

const localStorageMock = createStorageMock();
const sessionStorageMock = createStorageMock();

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  configurable: true,
});

Object.defineProperty(globalThis, "sessionStorage", {
  value: sessionStorageMock,
  configurable: true,
});

let useConfigStore: any;

beforeAll(async () => {
  const mod = await import("@/store/configStore");
  useConfigStore = mod.default;
});

describe("useConfigStore", () => {
  beforeEach(() => {
    const state = useConfigStore.getState();

    state.setOrg({
      orgName: "",
      orgId: "",
      orgUUID: "",
      updatedAt: undefined,
      groupShortId: undefined,
    });

    state.setGroupName("");
    state.setGroupId("");
    state.setGroupShortId(null);
    state.setGroupUpdatedAt("");
    state.setUpdatedAt(null);
    state.setSearchParams("");
    state.setBreadCrumbVisible(true);
    state.setIsOpportunityPage(false);

    localStorageMock.clear();
    sessionStorageMock.clear();
  });

  it("has the expected initial-ish state", () => {
    const state = useConfigStore.getState();

    expect(state.org).toEqual(
      expect.objectContaining({
        orgName: "",
        orgId: "",
        orgUUID: "",
      })
    );

    expect(state.groupName).toBe("");
    expect(state.groupId).toBe("");
    expect(state.groupShortId).toBeNull();
    expect(state.groupUpdatedAt).toBe("");
    expect(state.searchParams).toBe("");
    expect(state.breadCrumbVisible).toBe(true);
    expect(state.updatedAt).toBeNull();
    expect(state.IsOpportunityPage).toBe(false);
  });

  it("setBreadCrumbVisible toggles breadCrumbVisible", () => {
    const { setBreadCrumbVisible } = useConfigStore.getState();

    setBreadCrumbVisible(false);
    expect(useConfigStore.getState().breadCrumbVisible).toBe(false);

    setBreadCrumbVisible(true);
    expect(useConfigStore.getState().breadCrumbVisible).toBe(true);
  });

  it("setOrg merges into existing org state", () => {
    const { setOrg } = useConfigStore.getState();

    setOrg({
      orgName: "Acme Health",
      orgId: "ORG-1",
      updatedAt: "2024-01-01T00:00:00Z",
    });

    expect(useConfigStore.getState().org).toEqual(
      expect.objectContaining({
        orgName: "Acme Health",
        orgId: "ORG-1",
        updatedAt: "2024-01-01T00:00:00Z",
      })
    );

    setOrg({
      orgUUID: "UUID-123",
      groupShortId: "GRP-9",
    });

    expect(useConfigStore.getState().org).toEqual(
      expect.objectContaining({
        orgName: "Acme Health",
        orgId: "ORG-1",
        orgUUID: "UUID-123",
        updatedAt: "2024-01-01T00:00:00Z",
        groupShortId: "GRP-9",
      })
    );
  });

  it("setGroupName, setGroupId, setGroupShortId update respective fields", () => {
    const { setGroupName, setGroupId, setGroupShortId } =
      useConfigStore.getState();

    setGroupName("Group Alpha");
    setGroupId("GRP-1");
    setGroupShortId("SHORT-1");

    const state = useConfigStore.getState();
    expect(state.groupName).toBe("Group Alpha");
    expect(state.groupId).toBe("GRP-1");
    expect(state.groupShortId).toBe("SHORT-1");

    setGroupShortId(null);
    expect(useConfigStore.getState().groupShortId).toBeNull();
  });

  it("setUpdatedAt and setGroupUpdatedAt update timestamps", () => {
    const { setUpdatedAt, setGroupUpdatedAt } = useConfigStore.getState();

    setUpdatedAt("2024-02-02T10:00:00Z");
    setGroupUpdatedAt("2024-02-03T11:00:00Z");

    const state = useConfigStore.getState();
    expect(state.updatedAt).toBe("2024-02-02T10:00:00Z");
    expect(state.groupUpdatedAt).toBe("2024-02-03T11:00:00Z");

    setUpdatedAt(null);
    expect(useConfigStore.getState().updatedAt).toBeNull();
  });

  it("setSearchParams updates searchParams", () => {
    const { setSearchParams } = useConfigStore.getState();

    setSearchParams("?q=test&page=2");
    expect(useConfigStore.getState().searchParams).toBe("?q=test&page=2");
  });

  it("setIsOpportunityPage updates IsOpportunityPage", () => {
    const { setIsOpportunityPage } = useConfigStore.getState();

    expect(useConfigStore.getState().IsOpportunityPage).toBe(false);

    setIsOpportunityPage(true);
    expect(useConfigStore.getState().IsOpportunityPage).toBe(true);

    setIsOpportunityPage(false);
    expect(useConfigStore.getState().IsOpportunityPage).toBe(false);
  });
});
