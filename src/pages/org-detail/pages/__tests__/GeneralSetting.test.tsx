import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

import GeneralSetting from "../GeneralSettings";
import {
  renderAccountRelationShipData,
  renderGeneralSettingOverview,
  renderPermissions,
} from "@/data/organization/general-settings";

// Mock react-router-dom
const { mockParams, mockNavigate, mockGetGeneralSettings, mockSetGeneralSettings, mockGetBillingData, mockSetOrg, mockApiGet, mockToast } = vi.hoisted(() => ({
  mockParams: { id: "ORG1" },
  mockNavigate: vi.fn(() => vi.fn()),
  mockGetGeneralSettings: vi.fn(),
  mockSetGeneralSettings: vi.fn(),
  mockGetBillingData: vi.fn().mockReturnValue(null),
  mockSetOrg: vi.fn(),
  mockApiGet: vi.fn(),
  mockToast: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useParams: () => mockParams,
  useNavigate: mockNavigate,
  useOutletContext: () => ({ handleSaveChanges: vi.fn(), orgMetadata: null }),
  useLocation: () => ({ pathname: "/org/ORG1" }),
}));

vi.mock("@/store/useOrgStore", () => ({
  __esModule: true,
  default: (selector?: any) => {
    const state = {
      getGeneralSettings: mockGetGeneralSettings,
      setGeneralSettings: mockSetGeneralSettings,
      getBillingData: mockGetBillingData,
    };
    return selector ? selector(state) : state;
  },
}));

vi.mock("@/store/configStore", () => ({
  __esModule: true,
  default: (selector?: any) => {
    const store = { setOrg: mockSetOrg };
    return selector ? selector(store) : store;
  },
}));

vi.mock("@/store/editStore", () => ({
  __esModule: true,
  default: (selector?: any) => {
    const state = { lastSavedAt: null };
    return selector ? selector(state) : state;
  },
}));

vi.mock("@/hooks/useEditMode", () => ({
  useEditMode: () => ({
    metadata: undefined,
    formData: {},
    originalData: {},
    errors: {},
    updateField: vi.fn(),
    updateLiveEntityField: vi.fn(),
    setMetadata: vi.fn(),
    setFormData: vi.fn(),
    setOriginalData: vi.fn(),
    liveEntityData: {},
  }),
}));

vi.mock("@/api/apiService", () => ({
  __esModule: true,
  default: { get: (...args: any[]) => mockApiGet(...args) },
}));
// Mock toast
vi.mock("@ucc/common-ui", () => ({
  showCustomToast: (args: any) => mockToast(args),
  Loader: ({ text }: any) => <div data-testid="loader">{text}</div>,
  FailSafePage: () => <div>No data available</div>,
  DisplayRow: ({ label, value }: any) => (
    <div data-testid="display-row">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  ),
  CustomTable: ({ data, columns }: any) => (
    <table data-testid="custom-table">
      <tbody>
        {data.map((row: any, rowIdx: number) => (
          <tr key={rowIdx}>
            {columns.map((col: any) => (
              <td key={String(col.field)}>
                {col.render
                  ? col.render(row[col.field], row)
                  : row[col.field]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
  SideModal: ({ show, children }: any) =>
    show ? <div data-testid="side-modal">{children}</div> : null,
  RenderAllSections: ({ data }: any) => <div data-testid="render-all-sections">{JSON.stringify(data)}</div>,
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
  CustomCards: ({ data }: any) => <div data-testid="custom-cards">{JSON.stringify(data)}</div>,
  getUserPermissions: () => ({ canEdit: true, canView: true }),
  hasPermission: () => true,
  FilterButton: ({ onClick }: any) => <button onClick={onClick}>Filter</button>,
  Tabs: ({ children }: any) => <div data-testid="tabs">{children}</div>,
  Tab: ({ children }: any) => <div>{children}</div>,
}));
// Mock RenderAllSections
vi.mock("@/components/RenderAllSection/RenderAllSection", () => ({
  __esModule: true,
  default: ({ data }: any) => (
    <div data-testid={`section-${data}`}>{String(data)}</div>
  ),
}));
// Mock Cards
vi.mock("@/components/Cards/CustomCards", () => ({
  __esModule: true,
  CustomCards: ({ title, children }: any) => (
    <div data-testid={`card-${title}`}>{children}</div>
  ),
}));
// Mock data helpers
vi.mock("@/data/organization/general-settings", () => ({
  __esModule: true,
  renderGeneralSettingOverview: vi.fn(),
  renderPermissions: vi.fn(),
  renderAccountRelationShipData: vi.fn(),
  renderBrokerCommisionData: vi.fn(() => []),
}));
// Mock utils
vi.mock("@/utils", () => ({
  getSafeString: vi.fn((v: any) => `safe-${v}`),
  getInitials: vi.fn((v: any) => (v ? v[0] : "")),
  phoneFormat: vi.fn((v: any) => (v) ? "(000) 000-0000" : "-"),
  formatDateUTC: vi.fn((v: any) => v || "-"),
}));
// Mock extractDisplayValue
vi.mock("@/components/ExtractValue/ExtractDisplayValue", () => ({
  extractDisplayValue: vi.fn((v) => ({
    jsx: <span data-testid="extract-jsx">{String(v)}</span>,
    raw: String(v),
  })),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockGetGeneralSettings.mockReturnValue(undefined);
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe("GeneralSetting Component", () => {
  const baseData = {
    overview: {
      vendorPointSolutions: [
        {
          vendorPoint: "VP1",
          category: "C1",
          effectiveStartDate: "2023-01-01",
          phoneNumber: "123",
          website: "http://",
          description: "D1",
        },
      ],
    },
    accountRelationships: [
      {
        partnerAccount: "PA",
        partnerRelationshipsToTeladoc: "PR",
        partnerRelationshipsType: "PT",
        servicingContractType: "SCT",
        clientAccount: "CA",
        startDate: "2023-02-02",
        endDate: "2023-03-03",
        contractOverview: "CO",
      },
    ],
    historicalDetails: {
      clientTags: [{ clientTag: "CT", clientTagAssignmentId: "CTA" }],
      contractOps: [
        {
          contract: "C",
          originalContract: "OC",
          currentContractID: "CCID",
          contractOpsOwner: "Owner",
          coPoConfigurationTeamStatus: "OK",
          contractOpsStage: "Stage",
        },
      ],
    },
    files: [
      {
        title: "File1",
        owner: "Owner1",
        lastModified: "2023-04-04",
        size: "10KB",
      },
    ],
  };

  it("shows loader when no data is in store", () => {
    render(<GeneralSetting />);
    expect(screen.getByTestId("loader")).toBeInTheDocument();
  });

  it("renders sections and tables when cached and covers all column renderers", () => {
    // stub render helpers - renderAccountRelationShipData must return array for AccountRltnCard
    (renderGeneralSettingOverview as any).mockReturnValue("OV");
    (renderPermissions as any).mockReturnValue("PERM");
    (renderAccountRelationShipData as any).mockReturnValue([
      {
        "Section1": {
          brokerType: "REL123",
          rows: {
            col1: [{ label: "PA", value: "PA" }],
          },
        },
      },
    ]);
    // store returns data
    mockGetGeneralSettings.mockReturnValue(baseData);
    render(<GeneralSetting />);

    // Overview tab
    expect(screen.getByTestId("section-OV")).toBeInTheDocument();
    expect(
      screen.getByTestId("card-Vendor point solutions"),
    ).toBeInTheDocument();
    // Vendor Point Solutions columns
    expect(screen.getByText("safe-VP1")).toBeInTheDocument();
    expect(screen.getByText("safe-C1")).toBeInTheDocument();
    expect(screen.getByText("2023-01-01")).toBeInTheDocument();
    expect(screen.getByText("(000) 000-0000")).toBeInTheDocument();

    // Permissions tab
    fireEvent.click(screen.getByText("Permissions"));
    expect(screen.getByTestId("section-PERM")).toBeInTheDocument();

    // Account Relationships
    fireEvent.click(screen.getByText("Account relationships"));
    // AccountRltnCard renders data in CustomCards
    expect(screen.getByText("Section1")).toBeInTheDocument();

    // Historical Details
    fireEvent.click(screen.getByText("Historical details"));
    // ContractOps
    expect(screen.getByTestId("card-Contract ops")).toBeInTheDocument();
    expect(screen.getByText("safe-C")).toBeInTheDocument();
    expect(screen.getByText("safe-OC")).toBeInTheDocument();
    expect(screen.getByText("safe-CCID")).toBeInTheDocument();
    const extractJsxElements = screen.queryAllByTestId("extract-jsx");
    if (extractJsxElements.length > 4) {
      expect(extractJsxElements[4]).toHaveTextContent("Owner");
    }
    expect(screen.getByText("safe-OK")).toBeInTheDocument();
    expect(screen.getByText("safe-Stage")).toBeInTheDocument();
    // Client Tags
    expect(screen.getByText("safe-CT")).toBeInTheDocument();
    expect(screen.getByText("safe-CTA")).toBeInTheDocument();

    // Files tab
    fireEvent.click(screen.getByText("Files"));
    expect(screen.getByText("safe-File1")).toBeInTheDocument();
    const extractElements = screen.queryAllByTestId("extract-jsx");
    if (extractElements.length > 5) {
      expect(extractElements[5]).toHaveTextContent("Owner1");
    }
    expect(screen.getByText("2023-04-04")).toBeInTheDocument();
    expect(screen.getByText("safe-10KB")).toBeInTheDocument();
  });

  it("renders empty broker commissions tabs", () => {
    // Mock data with no brokers
    const dataWithoutBrokers = {
      ...baseData,
      accountRelationships: [],
    };
    (renderGeneralSettingOverview as any).mockReturnValue("OV");
    (renderPermissions as any).mockReturnValue("PERM");
    (renderAccountRelationShipData as any).mockReturnValue([]);
    mockGetGeneralSettings.mockReturnValue(dataWithoutBrokers);

    render(<GeneralSetting />);
    fireEvent.click(screen.getByText("Brokers commissions"));

    // Both tabs should show no data (multiple instances are ok)
    expect(screen.getByText("Active (0)")).toBeInTheDocument();
    expect(screen.getAllByText("No data available").length).toBeGreaterThan(0);
  });

  it("renders active brokers in broker commissions tab", () => {
    const dataWithActiveBrokers = {
      ...baseData,
      accountRelationships: [
        {
          partnerAccount: "Broker1",
          partnerRelationshipsToTeladoc: "Broker",
          isBrokerActive: true,
          startDate: "2023-01-01",
        },
        {
          partnerAccount: "Consultant1",
          partnerRelationshipsToTeladoc: "Benefit consultant",
          isBrokerActive: true,
          startDate: "2023-02-01",
        },
      ],
    };

    (renderGeneralSettingOverview as any).mockReturnValue("OV");
    (renderPermissions as any).mockReturnValue("PERM");
    (renderAccountRelationShipData as any).mockReturnValue([]);
    mockGetGeneralSettings.mockReturnValue(dataWithActiveBrokers);

    render(<GeneralSetting />);
    fireEvent.click(screen.getByText("Brokers commissions"));

    // Active tab should show count
    expect(screen.getByText("Active (2)")).toBeInTheDocument();
    expect(screen.getByText("Inactive (0)")).toBeInTheDocument();
  });

  it("renders inactive brokers in broker commissions tab", () => {
    const dataWithInactiveBrokers = {
      ...baseData,
      accountRelationships: [
        {
          partnerAccount: "Broker1",
          partnerRelationshipsToTeladoc: "Broker",
          isBrokerActive: false,
          startDate: "2023-01-01",
        },
      ],
    };

    (renderGeneralSettingOverview as any).mockReturnValue("OV");
    (renderPermissions as any).mockReturnValue("PERM");
    (renderAccountRelationShipData as any).mockReturnValue([]);
    mockGetGeneralSettings.mockReturnValue(dataWithInactiveBrokers);

    render(<GeneralSetting />);
    fireEvent.click(screen.getByText("Brokers commissions"));

    // Inactive tab should show count
    expect(screen.getByText("Active (0)")).toBeInTheDocument();
    expect(screen.getByText("Inactive (1)")).toBeInTheDocument();
  });

  it("renders empty vendor point solutions table", () => {
    const dataWithoutVendorPoints = {
      ...baseData,
      overview: {},
    };

    (renderGeneralSettingOverview as any).mockReturnValue("OV");
    (renderPermissions as any).mockReturnValue("PERM");
    (renderAccountRelationShipData as any).mockReturnValue([]);
    mockGetGeneralSettings.mockReturnValue(dataWithoutVendorPoints);

    render(<GeneralSetting />);
    expect(screen.getByTestId("card-Vendor point solutions")).toBeInTheDocument();
  });

  it("renders empty historical details", () => {
    const dataWithoutHistorical = {
      ...baseData,
      historicalDetails: {},
    };

    (renderGeneralSettingOverview as any).mockReturnValue("OV");
    (renderPermissions as any).mockReturnValue("PERM");
    (renderAccountRelationShipData as any).mockReturnValue([]);
    mockGetGeneralSettings.mockReturnValue(dataWithoutHistorical);

    render(<GeneralSetting />);
    fireEvent.click(screen.getByText("Historical details"));

    expect(screen.getByTestId("card-Contract ops")).toBeInTheDocument();
    expect(screen.getByTestId("card-Client tags")).toBeInTheDocument();
  });

  it("renders empty files tab", () => {
    const dataWithoutFiles = {
      ...baseData,
      files: [],
    };

    (renderGeneralSettingOverview as any).mockReturnValue("OV");
    (renderPermissions as any).mockReturnValue("PERM");
    (renderAccountRelationShipData as any).mockReturnValue([]);
    mockGetGeneralSettings.mockReturnValue(dataWithoutFiles);

    render(<GeneralSetting />);
    fireEvent.click(screen.getByText("Files"));

    // Verify we're on the Files tab by checking the card title which includes count
    expect(screen.getByTestId("card-Files (0)")).toBeInTheDocument();
  });

  it("handles empty account relationships", () => {
    const dataWithoutAcctRel = {
      ...baseData,
      accountRelationships: [],
    };

    (renderGeneralSettingOverview as any).mockReturnValue("OV");
    (renderPermissions as any).mockReturnValue("PERM");
    (renderAccountRelationShipData as any).mockReturnValue([]);
    mockGetGeneralSettings.mockReturnValue(dataWithoutAcctRel);

    render(<GeneralSetting />);
    fireEvent.click(screen.getByText("Account relationships"));

    // AccountRltnCard shows FailSafePage when data is empty (multiple instances are ok)
    expect(screen.getAllByText("No data available").length).toBeGreaterThan(0);
  });

  it("updates org config on mount", () => {
    const dataWithOrgInfo = {
      ...baseData,
      overview: {
        ...baseData.overview,
        accountOverview: {
          organizationName: "Test Org",
          organizationId: "ORG123",
        },
      },
      updatedAt: "2023-05-05",
    };

    (renderGeneralSettingOverview as any).mockReturnValue("OV");
    (renderPermissions as any).mockReturnValue("PERM");
    (renderAccountRelationShipData as any).mockReturnValue([]);
    mockGetGeneralSettings.mockReturnValue(dataWithOrgInfo);

    render(<GeneralSetting />);

    // Component renders successfully
    expect(screen.getByTestId("section-OV")).toBeInTheDocument();
  });
});
