// MarketingPage.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Component under test
import MarketingPage from "../Marketing";

// ---- Mocks ----

const { mockUseParams, mockGetMarketingData, mockSetOrg, mockFailSafePage } = vi.hoisted(() => ({
  mockUseParams: vi.fn(),
  mockGetMarketingData: vi.fn(),
  mockSetOrg: vi.fn(),
  mockFailSafePage: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useParams: () => mockUseParams(),
  useOutletContext: () => ({ handleSaveChanges: vi.fn(), orgMetadata: null }),
  useLocation: () => ({ pathname: "/org/org-123" }),
}));

// Mock react-bootstrap Tabs/Tab to something simple & testable
vi.mock("react-bootstrap", () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tabs">{children}</div>
  ),
  Tab: ({
    children,
    title,
    eventKey,
  }: {
    children: React.ReactNode;
    title: string;
    eventKey: string;
  }) => (
    <div data-testid={`tab-${eventKey}`}>
      <div>{title}</div>
      {children}
    </div>
  ),
}));

vi.mock("@/store/useOrgStore", () => ({
  __esModule: true,
  default: (selector?: (state: any) => any) => {
    const state = {
      getMarketingData: mockGetMarketingData,
    };
    return selector ? selector(state) : state;
  },
}));

vi.mock("@/store/configStore", () => ({
  __esModule: true,
  default: (selector?: (state: any) => any) => {
    const state = {
      setOrg: mockSetOrg,
    };
    return selector ? selector(state) : state;
  },
}));

vi.mock("@/store/editStore", () => ({
  __esModule: true,
  default: (selector?: (state: any) => any) => {
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

// Mocks for data transformers
const mockRenderMarketingDetails = vi.fn();
const mockRenderTelemedicineDetails = vi.fn();

vi.mock("@/data/organization/marketing", () => ({
  renderMarketingDetails: (data: unknown, metadata: unknown) => mockRenderMarketingDetails(data, metadata),
  renderTelemedcineDetails: (data: unknown, metadata: unknown) =>
    mockRenderTelemedicineDetails(data, metadata),
}));

// Mock RenderSection to show the data passed in
const mockRenderSection = vi.fn();
vi.mock("@/components/RenderAllSection/RenderAllSection", () => ({
  __esModule: true,
  default: (props: { data: unknown }) => {
    mockRenderSection(props.data);
    return (
      <div data-testid="render-section">
        {JSON.stringify(props.data)}
      </div>
    );
  },
}));

vi.mock("@ucc/common-ui", async () => {
  const actual = await vi.importActual<any>("@ucc/common-ui");
  return {
    ...actual,
    Loader: ({ text }: { text: string }) => <div data-testid="loader">{text}</div>,
    FailSafePage: (props: { cardType: string }) => {
      mockFailSafePage(props.cardType);
      return <div data-testid="failsafe-page">{props.cardType}</div>;
    },
  };
});

describe("MarketingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ id: "org-123" });
  });

  it("renders Loader when no data is in store", () => {
    mockGetMarketingData.mockReturnValueOnce(undefined);

    render(<MarketingPage />);

    // getMarketingData called with id from params
    expect(mockGetMarketingData).toHaveBeenCalledWith("org-123");

    // loading=true so Loader is shown, not FailSafePage
    expect(screen.getByTestId("loader")).toBeInTheDocument();
    expect(screen.queryByTestId("failsafe-page")).not.toBeInTheDocument();

    // setOrg still called with empty updatedAt
    expect(mockSetOrg).toHaveBeenCalledWith({ updatedAt: "" });
  });

  it("renders tabs with details & telemedicine when data is present (with updatedAt)", () => {
    const dataWithUpdatedAt = { id: "org-123", updatedAt: "2024-01-01T00:00:00Z" };

    mockGetMarketingData.mockReturnValueOnce(dataWithUpdatedAt);

    const marketingDetails = { some: "marketing-details" };
    const telemedicineDetails = { other: "telemedicine-details" };

    mockRenderMarketingDetails.mockReturnValueOnce(marketingDetails);
    mockRenderTelemedicineDetails.mockReturnValueOnce(telemedicineDetails);

    render(<MarketingPage />);

    // getMarketingData called once with correct id
    expect(mockGetMarketingData).toHaveBeenCalledWith("org-123");

    // setOrg is called with data.updatedAt
    expect(mockSetOrg).toHaveBeenCalledWith({
      updatedAt: "2024-01-01T00:00:00Z",
    });

    // Tabs rendered
    expect(screen.getByTestId("tabs")).toBeInTheDocument();

    // Tab titles present
    expect(screen.getByTestId("tab-details")).toHaveTextContent("Details");
    expect(screen.getByTestId("tab-telemedicine")).toHaveTextContent(
      "Telemedicine"
    );

    // Data transformation functions called with the raw data (metadata is undefined in view mode)
    expect(mockRenderMarketingDetails).toHaveBeenCalledWith(
      dataWithUpdatedAt, undefined
    );
    expect(mockRenderTelemedicineDetails).toHaveBeenCalledWith(
      dataWithUpdatedAt, undefined
    );

    // RenderSection invoked for both datasets
    expect(mockRenderSection).toHaveBeenCalledWith(marketingDetails);
    expect(mockRenderSection).toHaveBeenCalledWith(telemedicineDetails);

    // The JSON data shows up at least once
    expect(screen.getAllByTestId("render-section").length).toBeGreaterThan(0);
  });

  it("falls back to empty updatedAt when data has no updatedAt", () => {
    const dataWithoutUpdatedAt = { id: "org-123" };

    mockGetMarketingData.mockReturnValueOnce(dataWithoutUpdatedAt);

    mockRenderMarketingDetails.mockReturnValueOnce({ x: 1 });
    mockRenderTelemedicineDetails.mockReturnValueOnce({ y: 2 });

    render(<MarketingPage />);

    // setOrg should be called with empty string due to || "" fallback
    expect(mockSetOrg).toHaveBeenCalledWith({ updatedAt: "" });

    // Still renders both tabs and sections
    expect(screen.getByTestId("tab-details")).toBeInTheDocument();
    expect(screen.getByTestId("tab-telemedicine")).toBeInTheDocument();
    expect(screen.getAllByTestId("render-section").length).toBe(2);
  });
});
