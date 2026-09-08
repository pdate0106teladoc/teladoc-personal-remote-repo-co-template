import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";

const { apiGetMock, showCustomToastMock, downloadFileMock, useParamsMock, useNavigateMock, state } = vi.hoisted(() => ({
  apiGetMock: vi.fn(),
  showCustomToastMock: vi.fn(),
  downloadFileMock: vi.fn(),
  useParamsMock: vi.fn(),
  useNavigateMock: vi.fn(() => vi.fn()),
  state: { lastTabsProps: null as any, customTableCalls: [] as any[], rightModalCalls: [] as any[], customCardsCalls: [] as any[] }
}));

const flush = () => new Promise<void>((r) => setTimeout(r, 0));

vi.mock("@/api/apiService", () => ({
  default: { get: (...args: any[]) => apiGetMock(...args) },
}));

vi.mock("@ucc/common-ui", async () => {
  const actual = await vi.importActual<any>("@ucc/common-ui");
  return {
    ...actual,
    showCustomToast: (args: any) => showCustomToastMock(args),
    Loader: ({ text }: any) => <div data-testid="Loader">{text}</div>,
    SideModal: (props: any) => {
      state.rightModalCalls.push(props);
      return props.show ? (
        <div data-testid={`RightModal-${props.title}`}>
          <button data-testid={`hide-${props.title}`} onClick={() => props.onHide?.()}>
            hide
          </button>
          {props.children}
        </div>
      ) : null;
    },
    CustomTable: (props: any) => {
      state.customTableCalls.push(props);
      return <div data-testid="CustomTable">{String(props.columns?.[0]?.field ?? "no-col")}</div>;
    },
  };
});

vi.mock("@/utils", () => ({
  downloadFile: (...args: any[]) => downloadFileMock(...args),
}));

vi.mock("@/constants", () => ({
  API_ENDPOINTS: {
    organization: "/org",
    agr: "/agr",
    egr: "/egr",
    loadSourceUrl: "/load/",
  },
  NO_OF_RECORDS_PER_PAGE_INDIVIDUAL: 25,
  ToastType: { Error: "Error" },
  ERROR_MESSAGES: { SOMETHINGS_WRONG: "SOMETHINGS_WRONG" },
}));

// Router
vi.mock("react-router-dom", () => ({
  useParams: () => useParamsMock(),
  useNavigate: () => useNavigateMock(),
}));

// Bootstrap Tabs/Tab
vi.mock("react-bootstrap", () => ({
  Tabs: (props: any) => {
    state.lastTabsProps = props;
    return <div data-testid="Tabs">{props.children}</div>;
  },
  Tab: (props: any) => <section data-testid={`Tab-${props.eventKey}`}>{props.children}</section>,
}));

// CustomCards
vi.mock("@/components/Cards/CustomCards", () => ({
  CustomCards: (props: any) => {
    state.customCardsCalls.push(props);
    return (
      <div data-testid={`CustomCards-${props.title}`}>
        <div>{props.title}</div>
        {props.btn1 ? (
          <button data-testid={`btn1-${props.title}`} onClick={() => props.onBtn1Click?.()}>
            {props.btn1}
          </button>
        ) : null}
        {props.btn2 ? (
          <button data-testid={`btn2-${props.title}`} onClick={() => props.onBtn2Click?.()}>
            {props.btn2}
          </button>
        ) : null}
        <div data-testid={`Body-${props.title}`}>{props.children}</div>
      </div>
    );
  },
}));


// Column factories
const createEgrColumnMock = vi.fn(() => [{ field: "egrCol" }]);
const createAgrColumnMock = vi.fn(() => [{ field: "agrCol" }]);
const createAgrSideBarColumnMock = vi.fn(() => [{ field: "agrSide" }]);
const createEgrSideBarColumnMock = vi.fn(() => [{ field: "egrSide" }]);

vi.mock("../eligibilityColumns", () => ({
  createEgrColumn: () => createEgrColumnMock(),
  createAgrColumn: () => createAgrColumnMock(),
  createAgrSideBarColumn: () => createAgrSideBarColumnMock(),
  createEgrSideBarColumn: () => createEgrSideBarColumnMock(),
}));

import Eligibility from "../Eligibility";

// atob for CSV decode
beforeEach(() => {
  globalThis.atob = vi.fn((s: string) => `decoded(${s})`);
});



describe("Eligibility.tsx", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.lastTabsProps = null;
    state.customTableCalls = [];
    state.rightModalCalls = [];
    state.customCardsCalls = [];
    useParamsMock.mockReturnValue({ id: "org-1" });

    // default API: initial EGR/AGR succeed
    apiGetMock.mockImplementation((url: string) => {
      if (url.includes("/org/org-1/egr?")) {
        return Promise.resolve({ data: { egr: [{ id: "e1" }], page: { totalResults: 10 } } });
      }
      if (url.includes("/org/org-1/agr?")) {
        return Promise.resolve({ data: { agr: [{ id: "a1" }], page: { totalResults: 20 } } });
      }
      return Promise.resolve({ data: {} });
    });
  });

  afterEach(() => {
    // nothing
  });

  it("shows full-page Loader while loading (early return) when requests are pending", () => {
    apiGetMock.mockImplementation(() => new Promise(() => { }));
    render(<Eligibility />);
    expect(screen.getByTestId("Loader")).toHaveTextContent("Loading...");
  });

  it("renders Tabs after initial EGR/AGR requests resolve", async () => {
    render(<Eligibility />);

    // allow effects + promises to resolve -> loading false again
    await act(async () => {
      await flush();
    });

    const tabs = await screen.findByTestId("Tabs");
    expect(tabs).toBeTruthy();

    // both cards exist
    expect(screen.getByTestId("CustomCards-External Group Relations mapping (EGRs)")).toBeTruthy();
    expect(screen.getByTestId("CustomCards-Allowed Group Relations mapping (AGRs)")).toBeTruthy();

    // tables rendered for both tabs (because Tabs renders both children in our mock)
    expect(screen.getAllByTestId("CustomTable").length).toBeGreaterThanOrEqual(2);
  });

  it("covers sort change for EGR and AGR (handleSortChange branches, sets page 0 and triggers fetch with/without sortQuery)", async () => {
    render(<Eligibility />);
    await act(async () => {
      await flush();
    });
    const tabs = await screen.findByTestId("Tabs");
    expect(tabs).toBeTruthy();
    const egrTable = state.customTableCalls.find((p) => p.columns?.[0]?.field === "egrCol");
    const agrTable = state.customTableCalls.find((p) => p.columns?.[0]?.field === "agrCol");
    expect(egrTable).toBeTruthy();
    expect(agrTable).toBeTruthy();

    // EGR: set sortBy + sortDir asc
    await act(async () => {
      egrTable.onChangeSortParams?.("payer", true);
      await flush();
    });

    // AGR: set sortBy + sortDir desc
    await act(async () => {
      agrTable.onChangeSortParams?.("state", false);
      await flush();
    });

    const urls = apiGetMock.mock.calls.map((c) => String(c[0]));
    expect(urls.some((u) => u.includes("/egr?page=0") && u.includes("sortBy=payer") && u.includes("sortDir=asc"))).toBe(true);
    expect(urls.some((u) => u.includes("/agr?page=0") && u.includes("sortBy=state") && u.includes("sortDir=desc"))).toBe(true);

    // Also cover Tabs onSelect casting: switch to agr then egr
    expect(typeof state.lastTabsProps!.onSelect).toBe("function");
    await act(async () => {
      state.lastTabsProps!.onSelect?.("agr");
      state.lastTabsProps!.onSelect?.("egr");
      await flush();
    });
  });

  it("covers server-side filter changes (buildFilterQuery ignores empty values) for EGR and AGR", async () => {
    render(<Eligibility />);
    await act(async () => {
      await flush();
    });

    const egrTable = state.customTableCalls.find((p) => p.columns?.[0]?.field === "egrCol");
    const agrTable = state.customTableCalls.find((p) => p.columns?.[0]?.field === "agrCol");

    vi.useFakeTimers();
    try {
      await act(async () => {
        egrTable.onServerFilterChange?.({ state: ["CA"], empty: [] });
        vi.advanceTimersByTime(400);
      });

      await act(async () => {
        // empty arrays are excluded by buildFilterQuery (the inner forEach never appends anything).
        agrTable.onServerFilterChange?.({ payer: ["P1"], blank: [] });
        vi.advanceTimersByTime(400);
      });
    } finally {
      vi.useRealTimers();
    }

    const urls = apiGetMock.mock.calls.map((c) => String(c[0]));
    expect(urls.some((u) => u.includes("/egr?page=0") && u.includes("state=CA") && !u.includes("empty="))).toBe(true);
    expect(urls.some((u) => u.includes("/agr?page=0") && u.includes("payer=P1") && !u.includes("blank="))).toBe(true);
  });

  it("covers page change handlers (handleEgrPageChange/handleAgrPageChange) and fetch success state updates", async () => {
    render(<Eligibility />);
    await act(async () => {
      await flush();
    });

    const egrTable = state.customTableCalls.find((p) => p.columns?.[0]?.field === "egrCol");
    const agrTable = state.customTableCalls.find((p) => p.columns?.[0]?.field === "agrCol");

    await act(async () => {
      egrTable.onPageChange?.(2);
      agrTable.onPageChange?.(3);
      await flush();
    });

    const urls = apiGetMock.mock.calls.map((c) => String(c[0]));
    expect(urls.some((u) => u.includes("/egr?page=2"))).toBe(true);
    expect(urls.some((u) => u.includes("/agr?page=3"))).toBe(true);
  });

  it("covers fetchExternalGroupRelation and fetchAllowedGroupRelations error branches (toasts)", async () => {
    apiGetMock.mockImplementation((url: string) => {
      if (url.includes("/egr?")) return Promise.reject(new Error("boom-egr"));
      if (url.includes("/agr?")) return Promise.reject(new Error("boom-agr"));
      return Promise.resolve({ data: {} });
    });

    render(<Eligibility />);

    await act(async () => {
      await flush();
    });

    expect(showCustomToastMock).toHaveBeenCalled();
    const titles = showCustomToastMock.mock.calls.map((c) => c[0]?.title);
    expect(titles).toContain("Failed to fetch External Group Relations");
    expect(titles).toContain("Failed to fetch Allowed Group Relations");
  });

  it("opens EGR history modal; covers history payload shapes: payload.egr array, payload is array fallback, and modal paging; hide modal", async () => {
    let historyCall = 0;

    apiGetMock.mockImplementation((url: string) => {
      if (url.includes("/org/org-1/egr?")) return Promise.resolve({ data: { egr: [], page: { totalResults: 0 } } });
      if (url.includes("/org/org-1/agr?")) return Promise.resolve({ data: { agr: [], page: { totalResults: 0 } } });

      if (url.includes("/load/client-configurations/organizations/org-1/external-group-relations/history")) {
        historyCall += 1;
        if (historyCall === 1) {
          // payload.egr array path
          return Promise.resolve({ data: { egr: [{ id: "eh1" }], page: { totalResults: 99 } } });
        }
        // payload is array fallback path
        return Promise.resolve({ data: [{ id: "eh2" }] });
      }

      return Promise.resolve({ data: {} });
    });

    render(<Eligibility />);
    await act(async () => {
      await flush();
    });

    // Click EGR "View history"
    await act(async () => {
      screen.getByTestId("btn1-External Group Relations mapping (EGRs)").click();
      await flush();
    });

    expect(screen.getByTestId("RightModal-View history")).toBeTruthy();

    const modalTable = state.customTableCalls.find((p) => p.customClassName === "scroll-table" && p.columns?.[0]?.field === "egrSide");
    expect(modalTable).toBeTruthy();

    // page change triggers second history fetch -> array fallback branch
    await act(async () => {
      modalTable.onPageChange?.(1);
      await flush();
    });

    const urls = apiGetMock.mock.calls.map((c) => String(c[0]));
    expect(urls.some((u) => u.includes("/external-group-relations/history?page=0"))).toBe(true);
    expect(urls.some((u) => u.includes("/external-group-relations/history?page=1"))).toBe(true);

    // Hide modal
    await act(async () => {
      screen.getByTestId("hide-View history").click();
      await flush();
    });
  });

  it("opens AGR history modal; covers payload.agr array branch and modal paging", async () => {
    apiGetMock.mockImplementation((url: string) => {
      if (url.includes("/org/org-1/egr?")) return Promise.resolve({ data: { egr: [], page: { totalResults: 0 } } });
      if (url.includes("/org/org-1/agr?")) return Promise.resolve({ data: { agr: [], page: { totalResults: 0 } } });

      if (url.includes("/load/client-configurations/organizations/org-1/allowed-group-relations/history")) {
        return Promise.resolve({ data: { agr: [{ id: "ah1" }], page: { totalResults: 7 } } });
      }
      return Promise.resolve({ data: {} });
    });

    render(<Eligibility />);
    await act(async () => {
      await flush();
    });

    await act(async () => {
      screen.getByTestId("btn1-Allowed Group Relations mapping (AGRs)").click();
      await flush();
    });

    expect(screen.getByTestId("RightModal-View history")).toBeTruthy();

    const modalTable = state.customTableCalls.find((p) => p.customClassName === "scroll-table" && p.columns?.[0]?.field === "agrSide");
    expect(modalTable).toBeTruthy();

    await act(async () => {
      modalTable.onPageChange?.(2);
      await flush();
    });

    const urls = apiGetMock.mock.calls.map((c) => String(c[0]));
    expect(urls.some((u) => u.includes("/allowed-group-relations/history?page=0"))).toBe(true);
    expect(urls.some((u) => u.includes("/allowed-group-relations/history?page=2"))).toBe(true);
  });

  it("covers fetchHistoryPage error branch (toast) and historyLoading loader-in-modal branch", async () => {
    apiGetMock.mockImplementation((url: string) => {
      if (url.includes("/org/org-1/egr?")) return Promise.resolve({ data: { egr: [], page: { totalResults: 0 } } });
      if (url.includes("/org/org-1/agr?")) return Promise.resolve({ data: { agr: [], page: { totalResults: 0 } } });
      if (url.includes("/external-group-relations/history")) return Promise.reject(new Error("history-fail"));
      return Promise.resolve({ data: {} });
    });

    render(<Eligibility />);
    await act(async () => {
      await flush();
    });

    // click view history; before we flush, modal should show Loader (historyLoading true)
    await act(async () => {
      screen.getByTestId("btn1-External Group Relations mapping (EGRs)").click();
    });

    expect(screen.getByTestId("RightModal-View history")).toBeTruthy();
    await act(async () => {
      await flush();
    });

    expect(showCustomToastMock).toHaveBeenCalled();
    expect(showCustomToastMock.mock.calls.some((c) => c[0]?.title === "Failed")).toBe(true);
  });

  it("covers downloadCSV success (current + history, AGR + EGR), downloadCSV trims empty-ish filters, and downloadCSV error toast", async () => {
    apiGetMock.mockImplementation((url: string) => {
      // initial loads
      if (url.includes("/org/org-1/egr?")) return Promise.resolve({ data: { egr: [], page: { totalResults: 0 } } });
      if (url.includes("/org/org-1/agr?")) return Promise.resolve({ data: { agr: [], page: { totalResults: 0 } } });

      // exports
      if (url.includes("/org/org-1/egr/export?")) return Promise.resolve({ data: { content: "AAA", filename: "egr.csv" } });
      if (url.includes("/org/org-1/agr/export?")) return Promise.resolve({ data: { content: "BBB", filename: "agr.csv" } });
      if (url.includes("/org/org-1/egr/history/export?")) return Promise.resolve({ data: { content: "CCC", filename: "egr-h.csv" } });
      if (url.includes("/org/org-1/agr/history/export?")) return Promise.resolve({ data: { content: "DDD", filename: "agr-h.csv" } });

      return Promise.resolve({ data: {} });
    });

    render(<Eligibility />);
    await act(async () => {
      await flush();
    });

    // Set filters (EGR) with blank values; note: downloadCSV trims and should exclude whitespace-only
    const egrTable = state.customTableCalls.find((p) => p.columns?.[0]?.field === "egrCol");
    vi.useFakeTimers();
    try {
      await act(async () => {
        egrTable.onServerFilterChange?.({ state: ["CA"], blank: ["   "], empty: [] });
        vi.advanceTimersByTime(400);
      });
    } finally {
      vi.useRealTimers();
    }

    // Download current CSVs
    await act(async () => {
      screen.getByTestId("btn2-External Group Relations mapping (EGRs)").click();
      screen.getByTestId("btn2-Allowed Group Relations mapping (AGRs)").click();
      await flush();
    });

    expect(downloadFileMock).toHaveBeenCalledWith("egr.csv", "decoded(AAA)");
    expect(downloadFileMock).toHaveBeenCalledWith("agr.csv", "decoded(BBB)");

    // Open modals and download history
    await act(async () => {
      screen.getByTestId("btn1-External Group Relations mapping (EGRs)").click();
      await flush();
    });
    await act(async () => {
      screen.getAllByTestId("btn2-External Group Relations mapping (EGRs)")[0].click();
      await flush();
    });

    await act(async () => {
      screen.getByTestId("btn1-Allowed Group Relations mapping (AGRs)").click();
      await flush();
    });
    await act(async () => {
      screen.getAllByTestId("btn2-Allowed Group Relations mapping (AGRs)")[0].click();
      await flush();
    });
    // Assert export URL excluded whitespace-only filter (blank=   should not appear in export URL)
    const exportUrls = apiGetMock.mock.calls.map((c) => String(c[0])).filter((u) => u.includes("/export?"));
    expect(exportUrls.some((u) => u.includes("state=CA"))).toBe(true);
    expect(exportUrls.some((u) => u.includes("blank="))).toBe(false);
    expect(exportUrls.some((u) => u.includes("empty="))).toBe(false);

    // Now error branch for downloadCSV
    apiGetMock.mockImplementation((url: string) => {
      if (url.includes("/org/org-1/egr?")) return Promise.resolve({ data: { egr: [], page: { totalResults: 0 } } });
      if (url.includes("/org/org-1/agr?")) return Promise.resolve({ data: { agr: [], page: { totalResults: 0 } } });
      if (url.includes("/org/org-1/egr/export?")) return Promise.reject(new Error("export-fail"));
      return Promise.resolve({ data: {} });
    });

    // fresh render to bind handlers to failing mock
    state.customTableCalls = [];
    render(<Eligibility />);
    await act(async () => {
      await flush();
    });

    await act(async () => {
      screen.getAllByTestId("btn2-External Group Relations mapping (EGRs)")[0].click();
      await flush();
    });

    expect(showCustomToastMock.mock.calls.some((c) => c[0]?.title === "Failed")).toBe(true);
  });

  it("covers the !id early-return guards in fetchHistoryPage and downloadCSV", async () => {
    useParamsMock.mockReturnValue({ id: undefined });

    // Make API calls resolvable if they happen (they shouldn't for guarded paths)
    apiGetMock.mockResolvedValue({ data: {} });

    render(<Eligibility />);
    // With id undefined, the initial fetch URLs include 'undefined' and may still run (component doesn't guard fetchers),
    // but guarded history/download functions must not call api.get.
    await act(async () => {
      await flush();
    });

    const before = apiGetMock.mock.calls.length;

    // Try opening history (calls fetchHistoryPage which should early-return)
    await act(async () => {
      screen.getByTestId("btn1-External Group Relations mapping (EGRs)").click();
      await flush();
    });

    // Try downloading CSV (should early-return)
    await act(async () => {
      screen.getAllByTestId("btn2-External Group Relations mapping (EGRs)")[0].click();
      await flush();
    });

    const after = apiGetMock.mock.calls.length;
    // no extra calls from guarded functions
    expect(after).toBe(before);
  });
});
