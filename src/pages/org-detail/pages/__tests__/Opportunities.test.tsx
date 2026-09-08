import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

import OpportunitiesPage from "../Opportunities";

const { mockNavigate, mockUseParams, mockUseSearchParams, mockFailSafePage, mockToast, mockApiGet, mockGetOpportunitiesCache, mockSetOpportunitiesCache, mockSetOrg, mockSetIsOpportunityPage, setSearchParamsMock, state } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockUseParams: vi.fn(),
  mockUseSearchParams: vi.fn(),
  mockFailSafePage: vi.fn(),
  mockToast: vi.fn(),
  mockApiGet: vi.fn(),
  mockGetOpportunitiesCache: vi.fn(),
  mockSetOpportunitiesCache: vi.fn(),
  mockSetOrg: vi.fn(),
  mockSetIsOpportunityPage: vi.fn(),
  setSearchParamsMock: vi.fn(),
  state: { mockIsOpportunityPage: false }
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useParams: () => mockUseParams(),
  useSearchParams: () => mockUseSearchParams(),
}));


vi.mock("@/components/Cards/CustomCards", () => ({
  CustomCards: ({ title, children }: any) => (
    <div data-testid="custom-cards">
      <div>{title}</div>
      {children}
    </div>
  ),
}));

const mockOpportunitiesTable = vi.fn();
vi.mock("@/pages/search-results/OpportunitiesTable", () => ({
  __esModule: true,
  default: (props: any) => {
    mockOpportunitiesTable(props);
    return <div data-testid="opportunities-table" />;
  },
}));

vi.mock("@ucc/common-ui", async () => {
  const actual = await vi.importActual<any>("@ucc/common-ui");
  return {
    ...actual,
    showCustomToast: (args: any) => mockToast(args),
    Loader: ({ text }: any) => <div data-testid="loader">{text}</div>,
    FailSafePage: ({ cardType }: any) => {
      mockFailSafePage(cardType);
      return <div data-testid="failsafe">{cardType}</div>;
    },
  };
});

vi.mock("@/api/apiService", () => ({
  __esModule: true,
  default: { get: (...args: any[]) => mockApiGet(...args) },
}));

vi.mock("@/store/useOrgStore", () => ({
  __esModule: true,
  default: (selector?: any) => {
    const state = {
      getOpportunitiesCache: mockGetOpportunitiesCache,
      setOpportunitiesCache: mockSetOpportunitiesCache,
    };
    return selector ? selector(state) : state;
  },
}));

vi.mock("@/store/configStore", () => ({
  __esModule: true,
  default: (selector?: any) => {
    const stateObj = {
      setOrg: mockSetOrg,
      setIsOpportunityPage: mockSetIsOpportunityPage,
      IsOpportunityPage: state.mockIsOpportunityPage,
    };
    return selector ? selector(stateObj) : stateObj;
  },
}));

vi.hoisted(() => {
  mockUseSearchParams.mockReturnValue([
    new URLSearchParams({ page: "0" }),
    setSearchParamsMock,
  ]);
  mockUseParams.mockReturnValue({ id: "123", opportunityId: undefined });
});

describe("OpportunitiesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.mockIsOpportunityPage = false;
  });

  it("shows loader when no cached data is present", () => {
    mockGetOpportunitiesCache.mockReturnValue(null);
    mockApiGet.mockResolvedValue({
      data: { opportunities: [], page: { totalResults: 0 } },
    });

    render(<OpportunitiesPage />);
    expect(screen.getByTestId("loader")).toBeInTheDocument();
  });

  it("fetches data and populates cache when no cached data is present", async () => {
    mockGetOpportunitiesCache.mockReturnValueOnce(null);

    mockApiGet.mockResolvedValue({
      data: {
        opportunities: [{ id: "1", organizationName: "Org", organizationId: "O1" }],
        page: { totalResults: 1 },
      },
    });

    render(<OpportunitiesPage />);

    await waitFor(() =>
      expect(mockSetOpportunitiesCache).toHaveBeenCalledWith(
        "123",
        [{ id: "1", organizationName: "Org", organizationId: "O1" }],
        0,
        1
      )
    );
  });

  it("shows FailSafePage with dataFailed on API error", async () => {
    mockGetOpportunitiesCache.mockReturnValueOnce(null);
    mockApiGet.mockRejectedValueOnce(new Error("fail"));

    render(<OpportunitiesPage />);

    await waitFor(() =>
      expect(mockFailSafePage).toHaveBeenCalledWith("dataFailed")
    );
  });

  it("uses cached data and skips API call", () => {
    mockGetOpportunitiesCache.mockReturnValue({
      opportunities: [{ id: "7" }],
      totalResults: 1,
    });

    render(<OpportunitiesPage />);

    expect(mockApiGet).not.toHaveBeenCalled();
    expect(screen.getByTestId("opportunities-table")).toBeInTheDocument();
  });

  it("renders FailSafePage(noData) when data empty", () => {
    mockGetOpportunitiesCache.mockReturnValue({
      opportunities: [],
      totalResults: 0,
    });

    render(<OpportunitiesPage />);

    expect(mockFailSafePage).toHaveBeenCalledWith("noData");
  });

  it("calls setOrg when isOpportunityPage is true", async () => {
    state.mockIsOpportunityPage = true;

    mockGetOpportunitiesCache.mockReturnValue({
      opportunities: [
        {
          id: "1",
          organizationName: "XYZ",
          organizationId: "O123",
        },
      ],
      totalResults: 1,
    });

    render(<OpportunitiesPage />);

    await waitFor(() =>
      expect(mockSetOrg).toHaveBeenCalledWith({
        orgName: "XYZ",
        orgId: "O123",
      })
    );
  });

  it("calls setIsOpportunityPage(false) on unmount", () => {
    mockGetOpportunitiesCache.mockReturnValue({
      opportunities: [{ id: "1" }],
      totalResults: 1,
    });

    const { unmount } = render(<OpportunitiesPage />);
    unmount();

    expect(mockSetIsOpportunityPage).toHaveBeenCalledWith(false);
  });

  it("updates page via onPageChange", () => {
    mockGetOpportunitiesCache.mockReturnValue({
      opportunities: [{ id: "1" }],
      totalResults: 1,
    });

    render(<OpportunitiesPage />);

    const lastCall = mockOpportunitiesTable.mock.lastCall?.[0];
    expect(lastCall).toBeDefined();
    lastCall?.onPageChange(2);

    expect(setSearchParamsMock).toHaveBeenCalled();
  });

  it("calls navigate when modal closes", () => {
    mockGetOpportunitiesCache.mockReturnValue({
      opportunities: [{ id: "1" }],
      totalResults: 1,
    });

    render(<OpportunitiesPage />);

    const props = mockOpportunitiesTable.mock.lastCall?.[0];
    props.onModalClose();

    expect(mockNavigate).toHaveBeenCalledWith(
      "/CCC/org-detail/123/opportunities",
      expect.objectContaining({ replace: true })
    );
  });
});
