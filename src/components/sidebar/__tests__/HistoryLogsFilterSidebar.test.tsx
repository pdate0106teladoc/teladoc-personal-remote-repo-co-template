import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HistoryLogsFilterSidebar from "../HistoryLogsFilterSidebar";

vi.mock("../HistoryLogsFilterSidebar.scss", () => ({}));

vi.mock("react-router-dom", () => ({
  useParams: () => ({ id: "org-123" }),
  useLocation: () => ({ pathname: "/CCC/org-detail/org-123" }),
}));

vi.mock("@/router/routes", () => ({
  GRP_DETAIL_PATH: "/CCC/groups",
}));

const mockGet = vi.fn();
vi.mock("@/api/apiService", () => ({
  default: { get: (...args: any[]) => mockGet(...args) },
}));

const mockShowCustomToast = vi.fn();
vi.mock("@ucc/common-ui", () => ({
  Button: ({ children, onClick, disabled, variant }: any) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant}>
      {children}
    </button>
  ),
  MultiSelectDropdown: ({ label, onChange }: any) => (
    <div data-testid="multi-dropdown">
      <label>{label}</label>
      <button data-testid="select-type" onClick={() => onChange(["General"])}>
        Select
      </button>
    </div>
  ),
  DatePicker: ({ placeholder, onChange, value }: any) => (
    <input
      data-testid={`datepicker-${placeholder}`}
      type="date"
      value={value || ""}
      onChange={(e) => onChange(e.target.value ? new Date(e.target.value) : null)}
    />
  ),
  MultiSelectSearch: ({ label, onChange }: any) => (
    <div data-testid={`search-${label}`}>
      <label>{label}</label>
      <button
        data-testid={`search-btn-${label}`}
        onClick={() => onChange({ "val-1": "Value 1" })}
      >
        Select
      </button>
    </div>
  ),
  showCustomToast: (...args: any[]) => mockShowCustomToast(...args),
}));

const mockSetFilters = vi.fn();
const mockSetApplied = vi.fn();
const mockClear = vi.fn();

vi.mock("@/store/useHistoryFilterStore", () => {
  const mockState = {
    filters: {
      fromEffectiveDateRange: "",
      toEffectiveDateRange: "",
      typeOfEdit: [],
      fromWorkflowStartDate: "",
      toWorkflowStartDate: "",
      workflowId: {},
      opportunityId: {},
      changeRequest: {},
      updatedBy: {},
    },
    setFilters: (...args: any[]) => mockSetFilters(...args),
    setApplied: (...args: any[]) => mockSetApplied(...args),
    clear: () => mockClear(),
  };
  const useHistoryFilterStore = (selector: any) => selector(mockState);
  return { useHistoryFilterStore };
});

vi.mock("@/constants", () => ({
  ToastType: { Success: "success", Error: "error" },
  ERROR_MESSAGES: { SOMETHINGS_WRONG: "Something went wrong." },
}));

vi.mock("@/utils", () => ({
  dateRangeCount: (start: string, end: string) => (start || end ? 1 : 0),
  hasAny: (arr: any[]) => arr?.length > 0,
}));

describe("HistoryLogsFilterSidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    import.meta.env.VITE_TASK_URL = "http://task.test/";
    mockGet.mockResolvedValue({
      editTypes: [
        { id: "1", label: "General", active: true, displayOrder: 1 },
        { id: "2", label: "Billing", active: true, displayOrder: 2 },
      ],
    });
  });

  it("renders all filter sections", async () => {
    render(<HistoryLogsFilterSidebar />);

    await waitFor(() => {
      expect(screen.getByText("Effective date range")).toBeInTheDocument();
    });
    expect(screen.getByText("Type of edit")).toBeInTheDocument();
    expect(screen.getByText("Work flow start date range")).toBeInTheDocument();
    expect(screen.getByText("Workfront link")).toBeInTheDocument();
    expect(screen.getByText("Opportunity ID")).toBeInTheDocument();
    expect(screen.getByText("Change Request")).toBeInTheDocument();
    expect(screen.getByText("Updated by")).toBeInTheDocument();
  });

  it("renders Show results and Clear all buttons", () => {
    render(<HistoryLogsFilterSidebar />);
    expect(screen.getByText("Show results")).toBeInTheDocument();
    expect(screen.getByText("Clear all")).toBeInTheDocument();
  });

  it("fetches edit types on mount", async () => {
    render(<HistoryLogsFilterSidebar />);

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(
        "http://task.test/client-configurations/ORGANIZATION/edit-types",
      );
    });
  });

  it("shows error toast when edit types fetch fails", async () => {
    mockGet.mockRejectedValueOnce(new Error("fail"));
    render(<HistoryLogsFilterSidebar />);

    await waitFor(() => {
      expect(mockShowCustomToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: "error" }),
      );
    });
  });

  it("Show results button applies filters to store", async () => {
    render(<HistoryLogsFilterSidebar />);
    await waitFor(() => expect(mockGet).toHaveBeenCalled());

    fireEvent.click(screen.getByText("Show results"));

    expect(mockSetFilters).toHaveBeenCalledWith(
      expect.objectContaining({
        fromEffectiveDateRange: "",
        toEffectiveDateRange: "",
      }),
    );
    expect(mockSetApplied).toHaveBeenCalled();
  });

  it("Clear all resets all filters and calls store clear", async () => {
    render(<HistoryLogsFilterSidebar />);
    await waitFor(() => expect(mockGet).toHaveBeenCalled());

    fireEvent.click(screen.getByText("Clear all"));

    expect(mockClear).toHaveBeenCalled();
  });

  it("calls onFiltersApplied before setting filters", async () => {
    const onFiltersApplied = vi.fn();
    render(<HistoryLogsFilterSidebar onFiltersApplied={onFiltersApplied} />);
    await waitFor(() => expect(mockGet).toHaveBeenCalled());

    fireEvent.click(screen.getByText("Show results"));

    expect(onFiltersApplied).toHaveBeenCalled();
  });

  it("calls setOpenModal(false) when filters applied", async () => {
    const setOpenModal = vi.fn();
    render(<HistoryLogsFilterSidebar setOpenModal={setOpenModal} />);
    await waitFor(() => expect(mockGet).toHaveBeenCalled());

    fireEvent.click(screen.getByText("Show results"));

    expect(setOpenModal).toHaveBeenCalledWith(false);
  });

  it("exposes clear function via onExposeClear", () => {
    const onExposeClear = vi.fn();
    render(<HistoryLogsFilterSidebar onExposeClear={onExposeClear} />);

    expect(onExposeClear).toHaveBeenCalledWith(expect.any(Function));
  });

  it("Show results is disabled when effective date range is invalid", async () => {
    render(<HistoryLogsFilterSidebar />);
    await waitFor(() => expect(mockGet).toHaveBeenCalled());

    const startInputs = screen.getAllByTestId("datepicker-Start date");
    const endInputs = screen.getAllByTestId("datepicker-End date");

    fireEvent.change(startInputs[0], { target: { value: "2025-12-31" } });
    fireEvent.change(endInputs[0], { target: { value: "2025-01-01" } });

    expect(screen.getByText("Show results")).toBeDisabled();
    expect(screen.getByText("Start date cannot be greater than end date.")).toBeInTheDocument();
  });
});
