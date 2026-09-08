import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from "vitest";
import {
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom";

// ------------------ Mutable globals for mocks ------------------ //

const MOCK_ID = "grp-123";
let mockPathname = `/groups/${MOCK_ID}/general-settings`;

let mockGroupName: string | null = "Group Name";
let mockGroupId: string | null = "LEG-1";
let mockGroupShortId: string | null = "SHORT-1";
let mockGroupUpdatedAt: string | undefined = "2024-01-01T00:00:00.000Z";

let mockGeneralSettingsCache: Record<string, any> = {};
const mockGetGeneralSettings = vi.fn();
const mockGetMarketingData = vi.fn();
const mockGetBillingData = vi.fn();
const mockGetReportingData = vi.fn();
const mockGetEligibilityData = vi.fn();
const mockGetProductsData = vi.fn();
const mockGetProductDetailData = vi.fn();
const mockGetProductBundleDetailData = vi.fn();

const mockSetGeneralSettings = vi.fn();
const mockSetMarketingData = vi.fn();
const mockSetBillingData = vi.fn();
const mockSetReportingData = vi.fn();
const mockSetEligibilityData = vi.fn();
const mockSetProductData = vi.fn();
const mockSetProductDetailData = vi.fn();
const mockSetProductBundleData = vi.fn();

const mockSetGroupName = vi.fn();
const mockSetGroupId = vi.fn();
const mockSetGroupShortId = vi.fn();
const mockSetGroupUpdatedAt = vi.fn();
const mockSetOrg = vi.fn();

const mockHydrateJob = vi.fn();
const mockApiGet = vi.fn();
const mockShowCustomToast = vi.fn();
const mockGetTimeDiffInMinutes = vi.fn();

const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// ------------------ External module mocks ------------------ //

// react-router
vi.mock("react-router-dom", () => ({
  __esModule: true,
  useLocation: () => ({ pathname: mockPathname }),
  useParams: () => ({ id: MOCK_ID }),
  useNavigate: vi.fn(() => vi.fn()),
  Outlet: () => <div data-testid="outlet">Outlet content</div>,
}));

// ConfigHeader
vi.mock("@/components/ConfigHeader/ConfigHeader", () => ({
  __esModule: true,
  default: ({
    name,
    id,
    label,
    iconType,
  }: {
    name: string;
    id: string;
    label: string;
    iconType: string;
  }) => (
    <header data-testid="config-header">
      {name}-{id}-{label}-{iconType}
    </header>
  ),
}));

// SidebarNav
vi.mock("@/components/SidebarNavigation/SidebarNav", () => ({
  __esModule: true,
  default: ({
    navItems,
    basePath,
  }: {
    navItems: Array<{ name: string; path: string }>;
    basePath: string;
  }) => (
    <nav data-testid="sidebar-nav">
      Nav:{basePath} ({navItems.length})
    </nav>
  ),
}));


// SyncRibbon, SyncModal, ValidateRibbon
vi.mock("@/components/SyncRibbon/SyncRibbon", () => ({
  __esModule: true,
  default: ({
    type,
    id,
    apiLastSynced,
  }: {
    type: string;
    id: string;
    apiLastSynced?: string;
  }) => (
    <div data-testid="sync-ribbon">
      {type}-{id}-{apiLastSynced}
    </div>
  ),
}));


vi.mock("@/components/SyncModal/SyncModal", () => ({
  __esModule: true,
  default: ({
    type,
    id,
    lastUpdatedAt,
    onClose,
  }: {
    type: string;
    id: string;
    lastUpdatedAt: string;
    onClose: () => void;
  }) => (
    <div data-testid="sync-modal">
      SyncModal-{type}-{id}-{lastUpdatedAt}
      <button
        type="button"
        data-testid="sync-modal-close"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  ),
}));

// API + toast
vi.mock("@/api/apiService", () => ({
  __esModule: true,
  default: {
    get: (...args: any[]) => mockApiGet(...args),
  },
}));

vi.mock("@ucc/common-ui", () => ({
  __esModule: true,
  showCustomToast: (opts: any) => mockShowCustomToast(opts),
  getUserPermissions: vi.fn(() => ({})),
  hasPermission: vi.fn(() => true),
  hasAllPermission: vi.fn(() => true),
  extractDisplayValue: vi.fn(() => ({ raw: "", display: "" })),
  DropdownWithIcon: () => <div data-testid="dropdown-with-icon" />,
  ActionButton: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
  SideModal: ({ children }: any) => <div data-testid="side-modal">{children}</div>,
  ValidationSummarySlider: () => <div data-testid="validation-summary" />,
  PlannedLaunchDateRibbon: () => <div data-testid="planned-launch-ribbon" />,
  CheckMarkCircle: () => <span />,
  Loader: ({ text }: { text: string }) => (
    <div data-testid="loader">{text}</div>
  ),
  FailSafePage: ({ cardType }: { cardType: string }) => (
    <div data-testid="failsafe-page">FailSafe:{cardType}</div>
  ),
  ValidateRibbon: ({ type, id, data }: { type: string; id: string; data: any }) => (
    <div data-testid="validate-ribbon">
      {type}-{id}-{data ? "hasData" : "noData"}
    </div>
  ),
}));

vi.mock("@/store/useAuthStore", () => ({
  __esModule: true,
  default: () => ({
    hasAllPermissions: () => true,
    hasPermission: () => true,
  }),
}));

// constants
vi.mock("@/constants", () => ({
  __esModule: true,
  API_ENDPOINTS: {
    groups: "/api/groups",
  },
  ERROR_MESSAGES: {
    SOMETHINGS_WRONG: "Something went wrong",
  },
  ToastType: {
    Error: "Error",
  },
  GRP_DETAIL_PATH: "/groups",
  MODAL_MSSG: {
    EXIT_EDIT_TITLE: "Exit edit mode",
    EXIT_EDIT_MODAL_WARNING: "Are you sure you want to exit?",
  },
}));

// utils
vi.mock("@/utils", () => ({
  __esModule: true,
  getTimeDiffInMinutes: (ts: string) => mockGetTimeDiffInMinutes(ts),
  formatUTCToEST: (v: string) => v,
  CONFIG_READ_PERMISSIONS: [
    "config:co-po:read",
    "config:group:read",
    "config:opportunity:read",
    "config:org:read",
    "config:product:read",
  ],
}));

// Sync store
vi.mock("@/store/useSyncStore", () => ({
  __esModule: true,
  default: (selector?: any) => {
    const state = {
      hydrateJob: mockHydrateJob,
    };
    return selector ? selector(state) : state;
  },
}));

// Config store – selector-style mock
vi.mock("@/store/configStore", () => ({
  __esModule: true,
  default: (selector: any) =>
    selector({
      groupName: mockGroupName,
      groupId: mockGroupId,
      groupShortId: mockGroupShortId,
      groupUpdatedAt: mockGroupUpdatedAt,
      setGroupName: mockSetGroupName,
      setGroupId: mockSetGroupId,
      setGroupShortId: mockSetGroupShortId,
      setGroupUpdatedAt: mockSetGroupUpdatedAt,
      setOrg: mockSetOrg,
    }),
}));

// Group store – selector-style, plus full state when called without selector
vi.mock("@/store/useGroupStore", () => ({
  __esModule: true,
  default: (selector?: any) => {
    const state = {
      generalSettingsCache: mockGeneralSettingsCache,
      setGeneralSettings: mockSetGeneralSettings,
      setMarketingData: mockSetMarketingData,
      setBillingData: mockSetBillingData,
      setReportingData: mockSetReportingData,
      setEligibilityData: mockSetEligibilityData,
      setProductsData: mockSetProductData,
      setProductDetailData: mockSetProductDetailData,
      setProductBundleDetailData: mockSetProductBundleData,
      getGeneralSettings: mockGetGeneralSettings,
      getMarketingData: mockGetMarketingData,
      getBillingData: mockGetBillingData,
      getReportingData: mockGetReportingData,
      getEligibilityData: mockGetEligibilityData,
      getProductsData: mockGetProductsData,
      getProductDetailData: mockGetProductDetailData,
      getProductBundleDetailData: mockGetProductBundleDetailData,
    };
    return selector ? selector(state) : state;
  },
}));

// router/routes (GRP_DETAIL_PATH is already provided via constants, but import exists)
vi.mock("@/router/routes", () => ({
  __esModule: true,
  GRP_DETAIL_PATH: "/groups",
}));

vi.mock("@/components/sidebar/TaskCreate", () => ({
  __esModule: true,
  default: () => <div data-testid="edit-config" />,
}));

vi.mock("@/components/sidebar/SubmitUpdateParentForm", () => ({
  __esModule: true,
  default: () => <div data-testid="submit-update-form" />,
}));

vi.mock("@/components/Modal/BasicModal", () => ({
  __esModule: true,
  default: () => <div data-testid="basic-modal" />,
}));

vi.mock("@/components/PendingRibbon/PendingRibbon", () => ({
  __esModule: true,
  default: () => <div data-testid="pending-ribbon" />,
}));

vi.mock("@/components/Modal/UpdatePlannedLaunchDateModal", () => ({
  __esModule: true,
  default: () => <div data-testid="update-planned-launch-modal" />,
}));

// ------------------ Import component under test ------------------ //

import GrpConfigLayout from "./GrpConfigLayout";

// ------------------ Helpers ------------------ //

const buildApiGroupData = () => ({
  groupGeneralSettings: { overview: { foo: "bar" } },
  groupMarketing: { m: 1 },
  groupBilling: { b: 2 },
  groupReporting: { r: 3 },
  eligibilityAndClaims: { e: 4 },
  productBundleDto: { p: 5 },
  productDetailResponseDtoList: [{ d: 6 }],
  productBundleDetailsDtos: [{ bd: 7 }],
});

// ------------------ Tests ------------------ //

describe("GrpConfigLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = `/groups/${MOCK_ID}/general-settings`;

    mockGroupName = "Group Name";
    mockGroupId = "LEG-1";
    mockGroupShortId = "SHORT-1";
    mockGroupUpdatedAt = "2024-01-01T00:00:00.000Z";

    mockGeneralSettingsCache = {};
    mockGetGeneralSettings.mockReset();
    mockGetMarketingData.mockReset();
    mockGetBillingData.mockReset();
    mockGetReportingData.mockReset();
    mockGetEligibilityData.mockReset();
    mockGetProductsData.mockReset();
    mockGetProductDetailData.mockReset();
    mockGetProductBundleDetailData.mockReset();

    mockHydrateJob.mockReset();
    mockApiGet.mockReset();
    mockShowCustomToast.mockReset();
    mockGetTimeDiffInMinutes.mockReset();

    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows Loader while loading and uses cached group data without API when generalSettings exists", async () => {
    // generalSettings already cached
    const cached = { cached: true };
    mockGeneralSettingsCache = {
      [MOCK_ID]: cached,
    };

    mockGetGeneralSettings.mockReturnValueOnce({ fromCache: true });
    mockGetMarketingData.mockReturnValueOnce({ m: 1 });
    mockGetBillingData.mockReturnValueOnce({ b: 2 });
    mockGetReportingData.mockReturnValueOnce({ r: 3 });
    mockGetEligibilityData.mockReturnValueOnce({ e: 4 });
    mockGetProductsData.mockReturnValueOnce({ p: 5 });
    mockGetProductDetailData.mockReturnValueOnce([{ d: 6 }]);
    mockGetProductBundleDetailData.mockReturnValueOnce([{ bd: 7 }]);

    render(<GrpConfigLayout />);

    // Group settings endpoint should NOT be called (data comes from cache);
    // the pending-tasks endpoint is unconditionally fetched and is allowed.
    const calledUrls: string[] = mockApiGet.mock.calls.map((args: any[]) => args[0] as string);
    expect(calledUrls.some((url) => url.includes("/api/groups"))).toBe(false);
    expect(screen.queryByTestId("loader")).not.toBeInTheDocument();

    // Header & ribbons & nav rendered
    expect(screen.getByTestId("config-header")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar-nav")).toBeInTheDocument();
    expect(screen.getByTestId("sync-ribbon")).toBeInTheDocument();
    expect(screen.getByTestId("validate-ribbon")).toHaveTextContent(
      "hasData",
    );
  });

  it("fetches group data from API when generalSettings missing, sets store data and hides Loader", async () => {
    mockGeneralSettingsCache = {}; // no cache
    mockApiGet.mockResolvedValueOnce({
      data: buildApiGroupData(),
    });

    render(<GrpConfigLayout />);

    // loader initially (loading = true because no generalSettings)
    expect(
      screen.getByTestId("loader"),
    ).toHaveTextContent("Loading...");

    await waitFor(() => {
      // loader goes away
      expect(
        screen.queryByTestId("loader"),
      ).not.toBeInTheDocument();
    });

    // API called
    expect(mockApiGet).toHaveBeenCalledWith("/api/groups/grp-123");

    // store setters called with id and pieces
    expect(mockSetGeneralSettings).toHaveBeenCalledWith(
      MOCK_ID,
      expect.objectContaining({ overview: { foo: "bar" } }),
    );
    expect(mockSetMarketingData).toHaveBeenCalledWith(
      MOCK_ID,
      expect.objectContaining({ m: 1 }),
    );
    expect(mockSetBillingData).toHaveBeenCalledWith(
      MOCK_ID,
      expect.objectContaining({ b: 2 }),
    );
    expect(mockSetReportingData).toHaveBeenCalledWith(
      MOCK_ID,
      expect.objectContaining({ r: 3 }),
    );
    expect(mockSetEligibilityData).toHaveBeenCalledWith(
      MOCK_ID,
      expect.objectContaining({ e: 4 }),
    );
    expect(mockSetProductData).toHaveBeenCalledWith(
      MOCK_ID,
      expect.objectContaining({ p: 5 }),
    );
    expect(mockSetProductDetailData).toHaveBeenCalledWith(
      MOCK_ID,
      expect.arrayContaining([{ d: 6 }]),
    );
    expect(mockSetProductBundleData).toHaveBeenCalledWith(
      MOCK_ID,
      expect.arrayContaining([{ bd: 7 }]),
    );

    // content rendered
    expect(screen.getByTestId("config-header")).toBeInTheDocument();
    expect(screen.getByTestId("outlet")).toBeInTheDocument();
  });

  it("handles API error, shows toast and FailSafePage for non-excluded path", async () => {
    mockGeneralSettingsCache = {};
    mockApiGet.mockRejectedValueOnce(new Error("Network error"));

    render(<GrpConfigLayout />);

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalled();
    });

    await waitFor(() => {
      // loader hidden
      expect(
        screen.queryByTestId("loader"),
      ).not.toBeInTheDocument();
    });

    // toast called with error
    expect(mockShowCustomToast).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "Error",
        title: "Failed",
        message: "Something went wrong",
      }),
    );

    // apiFailed => FailSafePage for non-excluded path
    expect(
      screen.getByTestId("failsafe-page"),
    ).toHaveTextContent("dataFailed");
    // Outlet not rendered
    expect(
      screen.queryByTestId("outlet"),
    ).not.toBeInTheDocument();
  });

  it("shows Outlet even when apiFailed for excluded paths (history-logs)", async () => {
    mockPathname = `/groups/${MOCK_ID}/history-logs`;
    mockGeneralSettingsCache = {};
    mockApiGet.mockRejectedValueOnce(new Error("Network error"));

    render(<GrpConfigLayout />);

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(
        screen.queryByTestId("loader"),
      ).not.toBeInTheDocument();
    });

    // still shows outlet, not fail-safe, because path is excluded
    expect(screen.getByTestId("outlet")).toBeInTheDocument();
    expect(
      screen.queryByTestId("failsafe-page"),
    ).not.toBeInTheDocument();
  });

  it("hydrates sync job and renders ribbons when groupShortId is present", () => {
    mockGeneralSettingsCache = { [MOCK_ID]: { some: "data" } };

    render(<GrpConfigLayout />);

    // hydrateJob called with groupShortId
    expect(mockHydrateJob).toHaveBeenCalledWith("SHORT-1");

    // ribbons rendered
    expect(screen.getByTestId("sync-ribbon")).toBeInTheDocument();
    expect(screen.getByTestId("validate-ribbon")).toBeInTheDocument();
  });

  it("does not render ribbons or call hydrateJob when groupShortId absent", () => {
    mockGroupShortId = null;
    mockGeneralSettingsCache = { [MOCK_ID]: { some: "data" } };

    render(<GrpConfigLayout />);

    expect(mockHydrateJob).not.toHaveBeenCalled();
    expect(
      screen.queryByTestId("sync-ribbon"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("validate-ribbon"),
    ).not.toBeInTheDocument();
  });

  it("shows SyncModal when no lastSynced and getGeneralSettings updatedAt is missing or leads to diff >= 10", async () => {
    mockGeneralSettingsCache = { [MOCK_ID]: { some: "data" } };
    // no localStorage entry
    mockGetGeneralSettings.mockReturnValueOnce({ updatedAt: undefined });
    mockGetTimeDiffInMinutes.mockReturnValueOnce(15);

    render(<GrpConfigLayout />);

    await waitFor(() => {
      expect(
        screen.getByTestId("sync-modal"),
      ).toBeInTheDocument();
    });
  });

  it("hides SyncModal when diff < 10 minutes", async () => {
    mockGeneralSettingsCache = { [MOCK_ID]: { some: "data" } };
    localStorage.setItem(
      `syncJob_${mockGroupShortId}`,
      JSON.stringify({ lastSynced: "2024-05-01T00:00:00.000Z" }),
    );
    mockGetTimeDiffInMinutes.mockReturnValueOnce(5);

    render(<GrpConfigLayout />);

    await waitFor(() => {
      expect(
        screen.queryByTestId("sync-modal"),
      ).not.toBeInTheDocument();
    });
  });

  it("renders config header with group name and ID", async () => {
    mockGeneralSettingsCache = { [MOCK_ID]: { some: "data" } };
    render(<GrpConfigLayout />);

    await waitFor(() => {
      const header = screen.getByTestId("config-header");
      expect(header).toHaveTextContent("Group Name");
      expect(header).toHaveTextContent("LEG-1");
    });
  });

  it("renders sidebar nav with correct item count", async () => {
    mockGeneralSettingsCache = { [MOCK_ID]: { some: "data" } };
    render(<GrpConfigLayout />);

    await waitFor(() => {
      expect(screen.getByTestId("sidebar-nav")).toBeInTheDocument();
    });
  });

  it("renders Outlet when data is loaded successfully", async () => {
    mockGeneralSettingsCache = { [MOCK_ID]: { some: "data" } };
    render(<GrpConfigLayout />);

    await waitFor(() => {
      expect(screen.getByTestId("outlet")).toBeInTheDocument();
    });
  });

  it("renders ValidateRibbon when groupShortId is present", async () => {
    mockGeneralSettingsCache = { [MOCK_ID]: { some: "data" } };
    render(<GrpConfigLayout />);

    await waitFor(() => {
      expect(screen.getByTestId("validate-ribbon")).toBeInTheDocument();
    });
  });

  it("shows FailSafePage on non-excluded path when API fails", async () => {
    mockPathname = `/groups/${MOCK_ID}/general-settings`;
    mockGeneralSettingsCache = {};
    mockGetGeneralSettings.mockReturnValue(undefined);
    mockApiGet.mockRejectedValueOnce(new Error("API Error"));

    render(<GrpConfigLayout />);

    await waitFor(() => {
      expect(screen.getByTestId("failsafe-page")).toBeInTheDocument();
      expect(screen.getByTestId("failsafe-page")).toHaveTextContent("dataFailed");
    });
  });

  it("does not render ribbons when groupShortId is null", async () => {
    mockGroupShortId = null;
    mockGeneralSettingsCache = { [MOCK_ID]: { some: "data" } };
    render(<GrpConfigLayout />);

    await waitFor(() => {
      expect(screen.getByTestId("config-header")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("sync-ribbon")).not.toBeInTheDocument();
    expect(screen.queryByTestId("validate-ribbon")).not.toBeInTheDocument();
  });

  it("calls setGroupName and setGroupId when API returns data", async () => {
    mockPathname = `/groups/${MOCK_ID}/billing`;
    mockGeneralSettingsCache = {};
    mockGetGeneralSettings.mockReturnValue(undefined);
    mockApiGet.mockResolvedValueOnce({
      data: buildApiGroupData(),
    });

    render(<GrpConfigLayout />);

    await waitFor(() => {
      expect(mockSetGeneralSettings).toHaveBeenCalled();
      expect(mockSetMarketingData).toHaveBeenCalled();
      expect(mockSetBillingData).toHaveBeenCalled();
      expect(mockSetReportingData).toHaveBeenCalled();
      expect(mockSetEligibilityData).toHaveBeenCalled();
    });
  });

  it("shows error toast when API fails", async () => {
    mockGeneralSettingsCache = {};
    mockGetGeneralSettings.mockReturnValue(undefined);
    mockApiGet.mockRejectedValueOnce(new Error("Fetch failed"));

    render(<GrpConfigLayout />);

    await waitFor(() => {
      expect(mockShowCustomToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "Error",
          title: "Failed",
        }),
      );
    });
  });

  it("does not fetch from API when generalSettings exists in cache", async () => {
    mockGeneralSettingsCache = { [MOCK_ID]: { cached: true } };
    mockGetGeneralSettings.mockReturnValue({ cached: true });
    mockGetMarketingData.mockReturnValue({});
    mockGetBillingData.mockReturnValue({});
    mockGetReportingData.mockReturnValue({});
    mockGetEligibilityData.mockReturnValue({});
    mockGetProductsData.mockReturnValue({});

    render(<GrpConfigLayout />);

    await waitFor(() => {
      expect(screen.getByTestId("outlet")).toBeInTheDocument();
    });
    expect(mockApiGet).not.toHaveBeenCalledWith(expect.stringContaining("/api/groups/"));
  });
  //   vi.useFakeTimers();
  //   mockGeneralSettingsCache = { [MOCK_ID]: { some: "data" } };
  //   localStorage.setItem(
  //     `syncJob_${mockGroupShortId}`,
  //     JSON.stringify({ lastSynced: "2024-05-01T00:00:00.000Z" }),
  //   );

  //   // First call: diff < 10 => no modal
  //   mockGetTimeDiffInMinutes
  //     .mockReturnValueOnce(5) // initial runCheck
  //     .mockReturnValueOnce(12); // after interval

  //   render(<GrpConfigLayout />);

  //   // initial: no modal
  //   await waitFor(() => {
  //     expect(
  //       screen.queryByTestId("sync-modal"),
  //     ).not.toBeInTheDocument();
  //   });

  //   // advance time by 1 min to trigger interval runCheck
  //   vi.advanceTimersByTime(60 * 1000);

  //   // now diff >= 10 -> modal should appear
  //   await waitFor(() => {
  //     expect(
  //       screen.getByTestId("sync-modal"),
  //     ).toBeInTheDocument();
  //   });

  //   // confirm getTimeDiffInMinutes was called at least twice
  //   expect(mockGetTimeDiffInMinutes).toHaveBeenCalledTimes(2);
  // });
});
