import { render, screen, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useParams: () => ({ id: "org-123" }),
  };
});

vi.mock("@/api/apiService", () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: [], totalRecords: 0 }),
    post: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock("@ucc/common-ui", () => ({
  CustomTable: ({ data }: any) => (
    <div data-testid="custom-table">{data?.length ?? 0} rows</div>
  ),
  Loader: ({ text }: any) => <div data-testid="loader">{text}</div>,
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  FilterButton: ({ onClick }: any) => (
    <button data-testid="filter-button" onClick={onClick}>Filter</button>
  ),
  FilteredByBar: () => <div data-testid="filtered-by-bar" />,
  SideModal: ({ show, children }: any) =>
    show ? <div data-testid="side-modal">{children}</div> : null,
  FailSafePage: ({ cardType }: any) => <div data-testid={`failsafe-${cardType}`} />,
  showCustomToast: vi.fn(),
  ToastType: { Success: "success", Error: "error" },
}));

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
    applied: { filterApplied: 0, filteredAppliedKeys: [] },
    setFilters: vi.fn(),
    setApplied: vi.fn(),
    clear: vi.fn(),
  };
  const useHistoryFilterStore = (selector?: any) =>
    selector ? selector(mockState) : mockState;
  useHistoryFilterStore.getState = () => mockState;
  return { useHistoryFilterStore };
});

vi.mock("@/components/sidebar/CompareRestoreSidebar", () => ({
  default: () => <div data-testid="compare-restore-sidebar" />,
}));

vi.mock("@/components/sidebar/HistoryLogsFilterSidebar", () => ({
  default: () => <div data-testid="filter-sidebar" />,
}));

vi.mock("@/components/sidebar/TaskDetailSidebar", () => ({
  default: () => <div data-testid="task-detail-sidebar" />,
}));

vi.mock("@/components/sidebar/OpportunityDrawer", () => ({
  default: () => <div data-testid="opportunity-drawer" />,
}));

vi.mock("@/pages/search-results/OpportunitiesTable", () => ({
  tabData: [],
}));

vi.mock("@/utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/utils")>();
  return {
    ...actual,
    formatUTCtoDateOnly: (v: any) => v ?? "-",
  };
});

vi.mock("@/constants", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/constants")>();
  return { ...actual };
});

import HistoryLogs from "../HistoryLogs";

describe("<HistoryLogs />", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_TASK_URL", "http://test-api/");
  });

  it("renders the history logs container", async () => {
    render(
      <MemoryRouter initialEntries={["/CCC/org-detail/org-123"]}>
        <HistoryLogs />
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(screen.getByTestId("custom-table")).toBeInTheDocument();
    });
  });

  it("renders the component without crashing", async () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/CCC/org-detail/org-123"]}>
        <HistoryLogs />
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(container.firstChild).toBeTruthy();
    });
  });

  it("shows loader initially", () => {
    render(
      <MemoryRouter initialEntries={["/CCC/org-detail/org-123"]}>
        <HistoryLogs />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("loader")).toBeInTheDocument();
  });
});
