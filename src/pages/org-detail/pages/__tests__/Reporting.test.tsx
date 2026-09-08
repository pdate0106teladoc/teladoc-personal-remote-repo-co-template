import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

import ReportingPage from "../Reporting";
import { ERROR_MESSAGES } from "@/constants";

const { mockUseParams, mockGetReportingData, mockSetReportingData, mockSetOrg } = vi.hoisted(() => ({
  mockUseParams: vi.fn(),
  mockGetReportingData: vi.fn(),
  mockSetReportingData: vi.fn(),
  mockSetOrg: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  __esModule: true,
  useParams: () => mockUseParams(),
  useOutletContext: () => ({ handleSaveChanges: vi.fn(), orgMetadata: null }),
  useLocation: () => ({ pathname: "/org/org-123" }),
}));

vi.mock("@/store/useOrgStore", () => ({
  __esModule: true,
  default: (selector?: (state: any) => any) => {
    const state = {
      getReportingData: mockGetReportingData,
      setReportingData: mockSetReportingData,
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

vi.mock("@ucc/common-ui", async () => {
  const actual = await vi.importActual<any>("@ucc/common-ui");
  return {
    ...actual,
    Loader: ({ text }: { text: string }) => <div data-testid="loader">{text}</div>,
  };
});

const mockReportingDetails = vi.fn();
vi.mock("@/components/ReportingPage/ReportingDetails", () => ({
  __esModule: true,
  default: (props: any) => {
    mockReportingDetails(props);
    return <div data-testid="reporting-details">ReportingDetails</div>;
  },
}));

describe("ReportingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Loader and calls setOrg with empty updatedAt when no data for id", () => {
    mockUseParams.mockReturnValue({ id: "org-123" });

    mockGetReportingData.mockReturnValueOnce(undefined);

    render(<ReportingPage />);

    expect(mockGetReportingData).toHaveBeenCalledWith("org-123");

    // loading=true when data is undefined, so Loader is shown
    expect(screen.getByTestId("loader")).toBeInTheDocument();

    expect(mockSetOrg).toHaveBeenCalledWith({ updatedAt: "" });

    expect(screen.queryByTestId("reporting-details")).not.toBeInTheDocument();
  });

  it("renders Loader and does not call getReportingData when id is missing", () => {
    mockUseParams.mockReturnValue({});

    render(<ReportingPage />);

    expect(mockGetReportingData).not.toHaveBeenCalled();

    // loading=true when data is undefined, so Loader is shown
    expect(screen.getByTestId("loader")).toBeInTheDocument();

    expect(mockSetOrg).toHaveBeenCalledWith({ updatedAt: "" });

    expect(screen.queryByTestId("reporting-details")).not.toBeInTheDocument();
  });

  it("renders ReportingDetails when data is present and calls setOrg with data.updatedAt", () => {
    mockUseParams.mockReturnValue({ id: "org-123" });

    const mockData = {
      id: "org-123",
      updatedAt: "2024-05-01T12:00:00Z",
      someField: "value",
    };

    mockGetReportingData.mockReturnValueOnce(mockData);

    render(<ReportingPage />);

    expect(mockGetReportingData).toHaveBeenCalledWith("org-123");

    expect(mockSetOrg).toHaveBeenCalledWith({
      updatedAt: "2024-05-01T12:00:00Z",
    });

    const details = screen.getByTestId("reporting-details");
    expect(details).toBeInTheDocument();
    expect(mockReportingDetails).toHaveBeenCalledWith(
      expect.objectContaining({ data: mockData })
    );

    expect(
      screen.queryByText(ERROR_MESSAGES.NO_REPORTING_DATA)
    ).not.toBeInTheDocument();
  });
});
