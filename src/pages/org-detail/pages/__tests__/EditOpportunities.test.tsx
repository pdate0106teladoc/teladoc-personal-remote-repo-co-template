import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import "@testing-library/jest-dom";

vi.mock("../styles/EditOppurtunities.scss", () => ({}));

const { mockShowCustomToast } = vi.hoisted(() => ({
  mockShowCustomToast: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useParams: () => ({ candidateId: "task-abc" }),
}));

vi.mock("@/api/apiService", () => ({
  __esModule: true,
  default: { get: vi.fn() },
}));

vi.mock("@/utils", () => ({
  getSafeString: (v: any) => (v == null ? "—" : String(v)),
}));

vi.mock("@/constants", () => ({
  API_ENDPOINTS: { opportunity: "/api/opportunity" },
  ERROR_MESSAGES: { SOMETHINGS_WRONG: "Something went wrong." },
  ToastType: { Error: "error" },
}));

vi.mock("@/components/sidebar/OpportunityDrawer", () => ({
  __esModule: true,
  default: ({ data }: { data: any }) => (
    <div data-testid="opportunity-drawer">{data?.name ?? "no-data"}</div>
  ),
}));

vi.mock("@/pages/search-results/OpportunitiesTable", () => ({
  __esModule: true,
  tabData: [{ id: "tab1", label: "Tab 1" }],
}));

vi.mock("@ucc/common-ui", () => ({
  __esModule: true,
  showCustomToast: (opts: any) => mockShowCustomToast(opts),
  extractDisplayValue: (value: any) => ({
    jsx: <span data-testid="display-value">{value ?? "—"}</span>,
  }),
  Loader: ({ text }: { text: string }) => <div data-testid="loader">{text}</div>,
  FailSafePage: ({ cardType }: { cardType: string }) => (
    <div data-testid="failsafe-page">{cardType}</div>
  ),
  SideModal: ({ show, title, children, onHide }: any) =>
    show ? (
      <div data-testid="side-modal">
        <div data-testid="side-modal-title">{title}</div>
        <button data-testid="side-modal-close" onClick={onHide}>
          Close
        </button>
        {children}
      </div>
    ) : null,
}));

import api from "@/api/apiService";
import EditOppurtunities from "../EditOppurtunities";

const mockGet = api.get as ReturnType<typeof vi.fn>;

const makeOpp = (overrides: Partial<any> = {}) => ({
  id: "opp-1",
  opportunityName: "Test Opportunity",
  opportunityGuid: "guid-1",
  revenueEffectiveDate: "2024-01-01",
  type: "New Business",
  contractNumber: "CN-001",
  closeDate: "2025-01-01",
  ...overrides,
});

const makeOpportunityDetail = (overrides: Partial<any> = {}) => ({
  id: "opp-detail-1",
  name: "Test Opportunity Detail",
  accountGuid: "ag-1",
  accountName: "Test Account",
  businessRegion: "NA",
  closeDate: "2025-01-01",
  earlyImplementation: "No",
  gcrmContractAccount: "GCA-1",
  gcrmContractPath: "GCP-1",
  lineOfBusiness: "Commercial",
  livesCount: "100",
  opportunityGuid: "guid-1",
  opportunityUrl: "/opp/1",
  populationType: "Employee",
  productDto: "Product A",
  requestCimFlag: "Yes",
  revenueEffectiveDate: "2024-01-01",
  stage: "Closed Won",
  subType: "Initial Sale",
  subTypeDetail: "Reporting Only",
  type: "New Business",
  ...overrides,
});

describe("EditOppurtunities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loader while fetching", () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    render(<EditOppurtunities />);
    expect(screen.getByTestId("loader")).toBeInTheDocument();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders opportunity cards after successful fetch", async () => {
    mockGet.mockResolvedValue({ opportunities: [makeOpp()] });
    render(<EditOppurtunities />);
    await waitFor(() => {
      expect(screen.getByText("Test Opportunity")).toBeInTheDocument();
      expect(screen.getByText("guid-1")).toBeInTheDocument();
    });
  });

  it("renders multiple opportunity cards", async () => {
    mockGet.mockResolvedValue({
      opportunities: [
        makeOpp({ id: "opp-1", opportunityName: "Opp One", opportunityGuid: "g1" }),
        makeOpp({ id: "opp-2", opportunityName: "Opp Two", opportunityGuid: "g2" }),
      ],
    });
    render(<EditOppurtunities />);
    await waitFor(() => {
      expect(screen.getByText("Opp One")).toBeInTheDocument();
      expect(screen.getByText("Opp Two")).toBeInTheDocument();
    });
  });

  it("shows FailSafePage when opportunities list is empty", async () => {
    mockGet.mockResolvedValue({ opportunities: [] });
    render(<EditOppurtunities />);
    await waitFor(() => {
      expect(screen.getByTestId("failsafe-page")).toBeInTheDocument();
      expect(screen.getByText("noData")).toBeInTheDocument();
    });
  });

  it("shows error toast when fetching opportunities fails", async () => {
    mockGet.mockRejectedValue(new Error("Network error"));
    render(<EditOppurtunities />);
    await waitFor(() => {
      expect(mockShowCustomToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error",
          title: "Failed to fetch opportunities",
        })
      );
    });
  });

  it("renders OppCard fields correctly", async () => {
    mockGet.mockResolvedValue({
      opportunities: [makeOpp({ contractNumber: "CN-999", type: "Renewal" })],
    });
    render(<EditOppurtunities />);
    await waitFor(() => {
      expect(screen.getByText("CN-999")).toBeInTheDocument();
      expect(screen.getByText("Renewal")).toBeInTheDocument();
      expect(screen.getByText("GCRM contract number")).toBeInTheDocument();
      expect(screen.getByText("Effective start date")).toBeInTheDocument();
      expect(screen.getByText("Effective end date")).toBeInTheDocument();
      expect(screen.getByText("Type")).toBeInTheDocument();
    });
  });

  it("opens SideModal when an opportunity card is clicked", async () => {
    const detail = makeOpportunityDetail({ name: "Detail Modal Name" });
    mockGet
      .mockResolvedValueOnce({ opportunities: [makeOpp()] })
      .mockResolvedValueOnce({ data: detail });

    render(<EditOppurtunities />);
    await waitFor(() => screen.getByText("Test Opportunity"));

    fireEvent.click(screen.getByText("Test Opportunity"));

    await waitFor(() => {
      expect(screen.getByTestId("side-modal")).toBeInTheDocument();
      expect(screen.getByTestId("side-modal-title")).toHaveTextContent("Detail Modal Name");
    });
  });

  it("passes detail data to OpportunityDrawer", async () => {
    const detail = makeOpportunityDetail({ name: "Drawer Data" });
    mockGet
      .mockResolvedValueOnce({ opportunities: [makeOpp()] })
      .mockResolvedValueOnce({ data: detail });

    render(<EditOppurtunities />);
    await waitFor(() => screen.getByText("Test Opportunity"));

    fireEvent.click(screen.getByText("Test Opportunity"));

    await waitFor(() => {
      expect(screen.getByTestId("opportunity-drawer")).toHaveTextContent("Drawer Data");
    });
  });

  it("closes the modal when onHide is triggered", async () => {
    const detail = makeOpportunityDetail();
    mockGet
      .mockResolvedValueOnce({ opportunities: [makeOpp()] })
      .mockResolvedValueOnce({ data: detail });

    render(<EditOppurtunities />);
    await waitFor(() => screen.getByText("Test Opportunity"));

    fireEvent.click(screen.getByText("Test Opportunity"));
    await waitFor(() => screen.getByTestId("side-modal"));

    fireEvent.click(screen.getByTestId("side-modal-close"));
    await waitFor(() => {
      expect(screen.queryByTestId("side-modal")).not.toBeInTheDocument();
    });
  });

  it("shows error toast when fetchOpportunityDetails fails", async () => {
    mockGet
      .mockResolvedValueOnce({ opportunities: [makeOpp()] })
      .mockRejectedValueOnce(new Error("Detail fetch error"));

    render(<EditOppurtunities />);
    await waitFor(() => screen.getByText("Test Opportunity"));

    fireEvent.click(screen.getByText("Test Opportunity"));

    await waitFor(() => {
      expect(mockShowCustomToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: "error", title: "Failed" })
      );
    });
  });

  it("handles API response where detail is at root (no .data wrapper)", async () => {
    const detail = makeOpportunityDetail({ name: "Root Level Detail" });
    mockGet
      .mockResolvedValueOnce({ opportunities: [makeOpp()] })
      .mockResolvedValueOnce(detail);

    render(<EditOppurtunities />);
    await waitFor(() => screen.getByText("Test Opportunity"));

    fireEvent.click(screen.getByText("Test Opportunity"));

    await waitFor(() => {
      expect(screen.getByTestId("side-modal-title")).toHaveTextContent("Root Level Detail");
    });
  });

  it("uses contractNumber fallback '—' when missing", async () => {
    mockGet.mockResolvedValue({
      opportunities: [makeOpp({ contractNumber: undefined })],
    });
    render(<EditOppurtunities />);
    await waitFor(() => {
      expect(screen.getByText("—")).toBeInTheDocument();
    });
  });

  it("does not call fetchOpportunityDetails when API for detail returns no name", async () => {
    const detail = makeOpportunityDetail({ name: "" });
    mockGet
      .mockResolvedValueOnce({ opportunities: [makeOpp()] })
      .mockResolvedValueOnce({ data: detail });

    render(<EditOppurtunities />);
    await waitFor(() => screen.getByText("Test Opportunity"));
    fireEvent.click(screen.getByText("Test Opportunity"));

    await waitFor(() => {
      expect(screen.getByTestId("side-modal")).toBeInTheDocument();
      expect(screen.getByTestId("side-modal-title")).toHaveTextContent("");
    });
  });
});
