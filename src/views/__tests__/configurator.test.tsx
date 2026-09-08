import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, within, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock(
  "@/views/ConfiguratorDashboard/ConfiguratorDashboard.scss",
  () => ({}),
);

vi.mock("@/assets", () => ({
  ExclamationIcon: () => <span data-testid="exclamation-icon">!</span>,
}));

const mockFormatUTCtoDateOnly = vi.fn((...a: any[]) => `fmt:${a[0]}`);
const mockFormatRelativeTime = vi.fn((...a: any[]) => `rel:${a[0]}`);
const mockGetInitials = vi.fn((...a: any[]) => (a[0] ?? "").slice(0, 2).toUpperCase());
const mockGetSafeString = vi.fn((...a: any[]) => (a[0] == null ? "-" : String(a[0])));
const mockDownloadBase64File = vi.fn();

vi.mock("@/utils", () => ({
  formatUTCtoDateOnly: (...a: any[]) => mockFormatUTCtoDateOnly(...a),
  formatRelativeTime: (...a: any[]) => mockFormatRelativeTime(...a),
  getInitials: (...a: any[]) => mockGetInitials(...a),
  getSafeString: (...a: any[]) => mockGetSafeString(...a),
  downloadBase64File: (...a: any[]) => mockDownloadBase64File(...a),
  USER_ROLES: {
    CONFIGURATOR: "CONFIGURATOR",
    QUALITY_REVIEWER: "QUALITY_REVIEWER",
    REQUESTER: "REQUESTER",
    CONFIGURATOR_MANAGER: "CONFIGURATOR_MANAGER",
    ADMINISTRATOR: "ADMINISTRATOR",
    QUALITY_MANAGER: "QUALITY_MANAGER",
    VIEWER: "VIEWER",
  },
}));

vi.mock("@/constants", () => ({
  STATUS_AGE_ERROR: 7,
  NO_OF_RECORDS_PER_PAGE_INDIVIDUAL: 25,
  statusTextMap: {
    draft: "Draft",
    "pending peer review": "Pending peer review",
    approved: "Approved",
    "on hold": "On hold",
    cancelled: "Cancelled",
  } as Record<string, string>,
  statusClasses: {
    draft: "draft",
    "pending peer review": "pending",
    approved: "approved",
    "on hold": "cancelled",
    cancelled: "cancelled",
  } as Record<string, string>,
  ERROR_MESSAGES: { SOMETHINGS_WRONG: "Something's wrong." },
  MODAL_MSSG: {
    CONFIRM_CANCEL_TASK: "Cancelling will discard any progress made. This action can't be undone.",
    CANCELATION_REASON: "Describe the reason to cancel.",
    CONFIRM_HOLD_TASK: "Confirm to put on hold until further action.",
    PUT_ON_HOLD_REASON: "Describe the reason to put on hold.",
  },
  ToastType: {
    Success: "success",
    Error: "error",
    Warning: "warning",
    Loading: "loading",
  },
}));

const mockApiPost = vi.fn();
const mockApiGet = vi.fn();
const mockApiPut = vi.fn();

vi.mock("@/api/apiService", () => ({
  default: {
    post: (...a: any[]) => mockApiPost(...a),
    get: (...a: any[]) => mockApiGet(...a),
    put: (...a: any[]) => mockApiPut(...a),
  },
}));

const mockShowCustomToast = vi.fn();
const mockGetUserPermissions = vi.fn<() => string[]>(() => ["task:assign"]);

vi.mock("@ucc/common-ui", () => ({
  getUserPermissions: () => mockGetUserPermissions(),
  hasPermission: (all: string[], permission: string) => all.includes(permission),
  CustomTable: ({
    data,
    columns,
    ellipsisOptions,
    onPageChange,
    onServerFilterChange,
    onChangeSortParams,
    totalRecords,
    page,
  }: any) => (
    <div data-testid="custom-table">
      {(data ?? []).map((row: any, ri: number) => (
        <div key={ri} data-testid={`row-${ri}`}>
          {(columns ?? []).map((col: any) => (
            <div key={col.field} data-testid={`cell-${col.field}-${ri}`}>
              {col.render ? col.render(row[col.field], row) : String(row[col.field] ?? "")}
            </div>
          ))}
          {(ellipsisOptions?.(row) ?? []).map((action: any, ai: number) => (
            <button
              key={ai}
              data-testid={`action-${action.label}-${ri}`}
              onClick={() => action.onClick(row)}
            >
              {action.label}
            </button>
          ))}
        </div>
      ))}
      <button data-testid="btn-page-change" onClick={() => onPageChange?.(1)}>Page</button>
      <button
        data-testid="btn-filter-change"
        onClick={() => onServerFilterChange?.({ status: ["DRAFT"] })}
      >
        Filter
      </button>
      <button data-testid="btn-sort-asc" onClick={() => onChangeSortParams?.("taskId", true)}>SortAsc</button>
      <button data-testid="btn-sort-desc" onClick={() => onChangeSortParams?.("", false)}>SortDesc</button>
      <span data-testid="total-records">{totalRecords}</span>
      <span data-testid="current-page">{page}</span>
    </div>
  ),
  Button: ({ children, onClick, disabled, className }: any) => (
    <button data-testid="ucc-button" onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  ),
  Loader: () => <div data-testid="loader">Loading</div>,
  renderTooltip: (text: string, id: string) => <span data-testid={`tooltip-${id}`}>{text}</span>,
  showCustomToast: (...a: any[]) => mockShowCustomToast(...a),
  SideModal: ({ show, children, title, onHide }: any) =>
    show ? (
      <div data-testid="side-modal">
        <span data-testid="side-modal-title">{title}</span>
        <button data-testid="close-side-modal" onClick={onHide}>Close</button>
        {children}
      </div>
    ) : null,
  ArrowDownload: ({ className }: any) => <span className={className} data-testid="arrow-download">↓</span>,
  WarningIcon: () => <span data-testid="warning-icon">⚠</span>,
  TableColumn: {},
  CustomDropdown: ({ label }: any) => <div data-testid="custom-dropdown">{label}</div>,
  Modal: ({ show, title, onHide, footer, children }: any) => {
    if (!show) return null;
    const isAssign = title === "Assign task";
    return (
      <div
        data-testid={isAssign ? "assign-modal" : "basic-modal"}
        data-title={title}
      >
        <span>{title}</span>
        <button
          data-testid={isAssign ? "close-assign-modal" : "basic-modal-close"}
          onClick={onHide}
        >
          Close
        </button>
        {children}
        {footer}
      </div>
    );
  },
}));

vi.mock("react-bootstrap", () => {
  const Tabs = ({ children, onSelect, activeKey, id }: any) => (
    <div data-testid={`tabs-${id}`}>
      {React.Children.map(children, (child: any) => {
        if (!child) return null;
        return React.cloneElement(child, {
          onTabSelect: onSelect,
          isActive: String(child.props.eventKey) === String(activeKey),
        });
      })}
    </div>
  );
  const Tab = ({ title, eventKey, onTabSelect }: any) => (
    <button data-testid={`tab-${eventKey}`} onClick={() => onTabSelect?.(String(eventKey))}>
      {title}
    </button>
  );
  const OverlayTrigger = ({ children, overlay }: any) => (
    <div data-testid="overlay-trigger">
      {overlay}
      {children}
    </div>
  );
  return { __esModule: true, Tabs, Tab, OverlayTrigger };
});

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("@/components/Modal/BasicModal", () => ({
  default: ({ show, title, handleClose, onBtnClick2, button2 }: any) =>
    show ? (
      <div data-testid="basic-modal" data-title={title}>
        <span>{title}</span>
        <button data-testid="basic-modal-close" onClick={handleClose}>Cancel</button>
        <button data-testid="basic-modal-confirm" onClick={onBtnClick2}>{button2 || "Confirm"}</button>
      </div>
    ) : null,
}));

vi.mock("@/components/Modal/TaskActionModal", () => ({
  default: ({ show, handleClose, onConfirm }: any) =>
    show ? (
      <div data-testid="task-action-modal">
        <button data-testid="task-action-close" onClick={handleClose}>Cancel</button>
        <button
          data-testid="task-action-confirm"
          onClick={() => { onConfirm("Delayed launch - Client initiated", "test comments").catch(() => {}); }}
        >
          Confirm
        </button>
      </div>
    ) : null,
}));

vi.mock("@/components/Modal/AssignTaskModal", () => ({
  default: ({ show, taskId, handleClose, handleAssign }: any) =>
    show ? (
      <div data-testid="assign-modal" data-task-id={taskId}>
        <button data-testid="close-assign-modal" onClick={handleClose}>Cancel</button>
        <button data-testid="assign-save" onClick={() => handleAssign("save", "user-1")}>Save</button>
        <button data-testid="assign-save-and-start" onClick={() => handleAssign("saveAndStart", "user-1")}>
          Save and start
        </button>
      </div>
    ) : null,
}));

vi.mock("@/components/sidebar/TaskDetailSidebar", () => ({
  default: ({ taskId, tabKey }: any) => (
    <div
      data-testid="task-detail-sidebar"
      data-task-id={taskId}
      data-tab-key={tabKey}
    />
  ),
}));

vi.mock("@/components/ExtractValue/ExtractDisplayValue", () => ({
  extractDisplayValue: (_val: any, _type: any, _meta: any) => ({
    jsx: <span data-testid="assignee-display">assignee</span>,
  }),
}));

vi.mock("@/router/routes", () => ({
  ORG_DETAIL_PATH: "/CCC/org-detail",
  GRP_DETAIL_PATH: "/CCC/groups",
}));

vi.mock("@/pages/contacts/ContactCards", () => ({}));

import ConfiguratorDashboard from "../ConfiguratorDashboard/ConfiguratorDashboard";
import type { ConfiguratorTask } from "../ConfiguratorDashboard/ConfiguratorDashboard";

const emptyApiResponse = { tasks: [] as ConfiguratorTask[], totalResults: 0, countsBySubTab: {} };

const makeTask = (overrides: Partial<ConfiguratorTask> = {}): ConfiguratorTask => ({
  indicators: "",
  taskId: "O-001",
  taskMongoId: "mongo-001",
  organizationName: "Test Org",
  organizationId: "org-1",
  orgUuid: "org-uuid-1",
  groupName: "Test Group",
  groupUuid: "grp-uuid-1",
  typeOfEdit: ["General settings"],
  status: ["DRAFT"],
  overDue: false,
  statusAgeDays: 3,
  assignee: "John Doe",
  priority: "High",
  lastSaved: "2024-01-01T00:00:00Z",
  plannedLaunchDate: "2099-01-01",
  daysSinceOpen: 5,
  createdBy: "Bob",
  ...overrides,
});

function renderDashboard(role: any = "CONFIGURATOR", userName = "Alice") {
  return render(
    <MemoryRouter>
      <ConfiguratorDashboard userName={userName} role={role} />
    </MemoryRouter>,
  );
}

function parentTabs() {
  return within(screen.getByTestId("tabs-parent-tab"));
}

function childTabs() {
  return within(screen.getByTestId("tabs-child-tab"));
}

describe("ConfiguratorDashboard", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_TASK_URL", "http://test-api/");
    mockApiPost.mockResolvedValue(emptyApiResponse);
    mockApiGet.mockResolvedValue({ filename: "data.csv", content: "abc123" });
    mockApiPut.mockResolvedValue({});
    mockShowCustomToast.mockClear();
    mockNavigate.mockClear();
    mockDownloadBase64File.mockClear();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("rendering", () => {
    it("renders welcome heading with userName", async () => {
      renderDashboard("CONFIGURATOR", "Alice");
      expect(screen.getByRole("heading", { name: /Welcome, Alice!/i })).toBeInTheDocument();
    });

    it("renders main container with dashboard configurator class", () => {
      renderDashboard();
      expect(document.querySelector("main.dashboard.configurator")).toBeTruthy();
    });

    it("renders 3 parent tabs (My tasks / All configuration tasks / All review tasks)", async () => {
      renderDashboard();
      const pt = parentTabs();
      expect(pt.getByTestId("tab-0")).toBeInTheDocument();
      expect(pt.getByTestId("tab-1")).toBeInTheDocument();
      expect(pt.getByTestId("tab-2")).toBeInTheDocument();
    });

    it("renders Download CSV button", async () => {
      renderDashboard();
      await waitFor(() => expect(screen.getByTestId("ucc-button")).toBeInTheDocument());
    });
  });

  describe("getDefaultParentTabIndex", () => {
    it("CONFIGURATOR defaults to parent tab 0", async () => {
      renderDashboard("CONFIGURATOR");
      expect(parentTabs().getByTestId("tab-0")).toBeInTheDocument();
    });
    it("QUALITY_REVIEWER defaults to parent tab 0", async () => {
      renderDashboard("QUALITY_REVIEWER");
      expect(parentTabs().getByTestId("tab-0")).toBeInTheDocument();
    });
    it("REQUESTER defaults to parent tab 0", async () => {
      renderDashboard("REQUESTER");
      expect(parentTabs().getByTestId("tab-0")).toBeInTheDocument();
    });
    it("CONFIGURATOR_MANAGER defaults to parent tab 1", async () => {
      renderDashboard("CONFIGURATOR_MANAGER");
      await waitFor(() =>
        expect(mockApiPost).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({ tab: "allConfigurationTasks" }),
        ),
      );
    });
    it("ADMINISTRATOR defaults to parent tab 1", async () => {
      renderDashboard("ADMINISTRATOR");
      await waitFor(() =>
        expect(mockApiPost).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({ tab: "allConfigurationTasks" }),
        ),
      );
    });
    it("QUALITY_REVIEWER_MANAGER defaults to parent tab 2", async () => {
      renderDashboard("QUALITY_MANAGER");
      await waitFor(() =>
        expect(mockApiPost).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({ tab: "allReviewTasks" }),
        ),
      );
    });
    it("unknown role defaults to parent tab 0 (myTasks)", async () => {
      renderDashboard("VIEWER" as any);
      await waitFor(() =>
        expect(mockApiPost).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({ tab: "myTasks" }),
        ),
      );
    });
  });

  describe("fetchData", () => {
    it("calls api.post on mount with correct payload", async () => {
      renderDashboard("CONFIGURATOR");
      await waitFor(() => expect(mockApiPost).toHaveBeenCalled());
      const [url, payload] = mockApiPost.mock.calls[0];
      expect(url).toBe("http://test-api/client-configurations/tasks");
      expect(payload).toMatchObject({ tab: "myTasks", subTab: "needsAttention", page: 0, pageSize: 25 });
    });

    it("shows loader during fetch, then table after", async () => {
      let resolve: (v: any) => void = () => {};
      mockApiPost.mockReturnValueOnce(new Promise((r) => { resolve = r; }));
      // second call (from role effect) returns empty
      mockApiPost.mockResolvedValue(emptyApiResponse);
      renderDashboard();
      expect(screen.getByTestId("loader")).toBeInTheDocument();
      act(() => resolve(emptyApiResponse));
      await waitFor(() => expect(screen.getByTestId("custom-table")).toBeInTheDocument());
    });

    it("renders row-0 after successful fetch with data", async () => {
      const task = makeTask();
      mockApiPost.mockResolvedValue({ tasks: [task], totalResults: 1, countsBySubTab: {} });
      renderDashboard();
      await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    });

    it("shows error toast when api.post throws", async () => {
      mockApiPost.mockRejectedValue(new Error("network error"));
      renderDashboard();
      await waitFor(() =>
        expect(mockShowCustomToast).toHaveBeenCalledWith(
          expect.objectContaining({ type: "error" }),
        ),
      );
    });

    it("handles empty tasks array in response (no crash)", async () => {
      mockApiPost.mockResolvedValue({ tasks: [], totalResults: 0, countsBySubTab: {} });
      renderDashboard();
      await waitFor(() => expect(screen.getByTestId("custom-table")).toBeInTheDocument());
    });

    it("uses 0 for totalResults and {} for countsBySubTab when absent in response", async () => {
      mockApiPost.mockResolvedValue({ tasks: [] });
      renderDashboard();
      await waitFor(() => expect(screen.getByTestId("custom-table")).toBeInTheDocument());
      expect(screen.getByTestId("total-records").textContent).toBe("0");
    });

    it("displays countsBySubTab count in child tab title", async () => {
      mockApiPost.mockResolvedValue({
        tasks: [],
        totalResults: 0,
        countsBySubTab: { needsAttention: 7 },
      });
      renderDashboard("CONFIGURATOR");
      await waitFor(() =>
        expect(childTabs().getByText("Needs attention (7)")).toBeInTheDocument(),
      );
    });

    it("shows child tab label without count when countsBySubTab missing key", async () => {
      mockApiPost.mockResolvedValue(emptyApiResponse);
      renderDashboard("CONFIGURATOR");
      await waitFor(() =>
        expect(childTabs().getByText("Needs attention")).toBeInTheDocument(),
      );
    });
  });

  describe("downloadTableData", () => {
    it("Download CSV button is disabled when data is empty", async () => {
      mockApiPost.mockResolvedValue(emptyApiResponse);
      renderDashboard();
      await waitFor(() => expect(screen.getByTestId("custom-table")).toBeInTheDocument());
      expect(screen.getByTestId("ucc-button")).toBeDisabled();
    });

    it("Download CSV button is enabled when data is present", async () => {
      mockApiPost.mockResolvedValue({ tasks: [makeTask()], totalResults: 1, countsBySubTab: {} });
      renderDashboard();
      await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
      expect(screen.getByTestId("ucc-button")).not.toBeDisabled();
    });

    it("calls api.get and downloadBase64File on click (direct response)", async () => {
      mockApiPost.mockResolvedValue({ tasks: [makeTask()], totalResults: 1, countsBySubTab: {} });
      mockApiGet.mockResolvedValue({ filename: "report.csv", content: "base64data" });
      renderDashboard();
      await waitFor(() => expect(screen.getByTestId("ucc-button")).not.toBeDisabled());
      fireEvent.click(screen.getByTestId("ucc-button"));
      await waitFor(() =>
        expect(mockDownloadBase64File).toHaveBeenCalledWith("report.csv", "base64data"),
      );
    });

    it("unwraps response.data wrapper when present", async () => {
      mockApiPost.mockResolvedValue({ tasks: [makeTask()], totalResults: 1, countsBySubTab: {} });
      mockApiGet.mockResolvedValue({ data: { filename: "wrapped.csv", content: "xyz" } });
      renderDashboard();
      await waitFor(() => expect(screen.getByTestId("ucc-button")).not.toBeDisabled());
      fireEvent.click(screen.getByTestId("ucc-button"));
      await waitFor(() =>
        expect(mockDownloadBase64File).toHaveBeenCalledWith("wrapped.csv", "xyz"),
      );
    });

    it("uses '-' for filename when not present in response", async () => {
      mockApiPost.mockResolvedValue({ tasks: [makeTask()], totalResults: 1, countsBySubTab: {} });
      mockApiGet.mockResolvedValue({ content: "abc" });
      renderDashboard();
      await waitFor(() => expect(screen.getByTestId("ucc-button")).not.toBeDisabled());
      fireEvent.click(screen.getByTestId("ucc-button"));
      await waitFor(() =>
        expect(mockDownloadBase64File).toHaveBeenCalledWith("-", "abc"),
      );
    });

    it("shows error toast when download api.get throws", async () => {
      mockApiPost.mockResolvedValue({ tasks: [makeTask()], totalResults: 1, countsBySubTab: {} });
      mockApiGet.mockRejectedValue(new Error("fail"));
      renderDashboard();
      await waitFor(() => expect(screen.getByTestId("ucc-button")).not.toBeDisabled());
      fireEvent.click(screen.getByTestId("ucc-button"));
      await waitFor(() =>
        expect(mockShowCustomToast).toHaveBeenCalledWith(
          expect.objectContaining({ type: "error" }),
        ),
      );
    });

    it("download URL uses the active parent tab value", async () => {
      mockApiPost.mockResolvedValue({ tasks: [makeTask()], totalResults: 1, countsBySubTab: {} });
      mockApiGet.mockResolvedValue({ filename: "f.csv", content: "c" });
      renderDashboard("CONFIGURATOR");
      await waitFor(() => expect(screen.getByTestId("ucc-button")).not.toBeDisabled());
      fireEvent.click(screen.getByTestId("ucc-button"));
      await waitFor(() =>
        expect(mockApiGet).toHaveBeenCalledWith(
          expect.stringContaining("myTasks/download"),
        ),
      );
    });
  });

  describe("tab navigation", () => {
    it("switching parent tab calls fetchData with new tab value", async () => {
      renderDashboard("CONFIGURATOR");
      await waitFor(() => expect(mockApiPost).toHaveBeenCalled());
      fireEvent.click(parentTabs().getByTestId("tab-1"));
      await waitFor(() =>
        expect(mockApiPost).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({ tab: "allConfigurationTasks" }),
        ),
      );
    });

    it("switching child tab calls fetchData with new subTab value", async () => {
      renderDashboard("CONFIGURATOR");
      await waitFor(() => expect(mockApiPost).toHaveBeenCalled());
      const ct = childTabs();
      fireEvent.click(ct.getByTestId("tab-1"));
      await waitFor(() =>
        expect(mockApiPost).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({ subTab: "inProgress" }),
        ),
      );
    });

    it("parent tab state is saved/restored on switch-back", async () => {
      renderDashboard("CONFIGURATOR");
      await waitFor(() => expect(mockApiPost).toHaveBeenCalled());
      fireEvent.click(screen.getByTestId("btn-page-change"));
      fireEvent.click(parentTabs().getByTestId("tab-1"));
      await waitFor(() =>
        expect(mockApiPost).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({ tab: "allConfigurationTasks" }),
        ),
      );
      fireEvent.click(parentTabs().getByTestId("tab-0"));
      await waitFor(() =>
        expect(mockApiPost).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({ tab: "myTasks", page: 1 }),
        ),
      );
    });

    it("child tab state is saved/restored on switch-back", async () => {
      renderDashboard("CONFIGURATOR");
      await waitFor(() => expect(mockApiPost).toHaveBeenCalled());
      fireEvent.click(childTabs().getByTestId("tab-1"));
      await waitFor(() =>
        expect(mockApiPost).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({ subTab: "inProgress" }),
        ),
      );
      fireEvent.click(childTabs().getByTestId("tab-0"));
      await waitFor(() =>
        expect(mockApiPost).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({ subTab: "needsAttention" }),
        ),
      );
    });

    it("QUALITY_REVIEWER sees only 2 child tabs on My tasks", async () => {
      renderDashboard("QUALITY_REVIEWER");
      await waitFor(() => expect(screen.getByTestId("tabs-child-tab")).toBeInTheDocument());
      const tabs = childTabs().getAllByRole("button");
      expect(tabs.length).toBe(2);
    });

    it("CONFIGURATOR sees 4 child tabs on My tasks", async () => {
      renderDashboard("CONFIGURATOR");
      await waitFor(() => expect(screen.getByTestId("tabs-child-tab")).toBeInTheDocument());
      const tabs = childTabs().getAllByRole("button");
      expect(tabs.length).toBe(4);
    });

    it("QUALITY_REVIEWER_MANAGER (All review tasks) sees 2 child tabs", async () => {
      renderDashboard("QUALITY_MANAGER");
      await waitFor(() => expect(screen.getByTestId("tabs-child-tab")).toBeInTheDocument());
      const tabs = childTabs().getAllByRole("button");
      expect(tabs.length).toBe(2);
    });
  });

  describe("table control callbacks", () => {
    it("page change triggers fetchData with new page", async () => {
      renderDashboard();
      await waitFor(() => expect(screen.getByTestId("custom-table")).toBeInTheDocument());
      fireEvent.click(screen.getByTestId("btn-page-change"));
      await waitFor(() =>
        expect(mockApiPost).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({ page: 1 }),
        ),
      );
    });

    it("filter change resets page to 0", async () => {
      renderDashboard();
      await waitFor(() => expect(screen.getByTestId("custom-table")).toBeInTheDocument());
      fireEvent.click(screen.getByTestId("btn-page-change"));
      await waitFor(() =>
        expect(mockApiPost).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ page: 1 })),
      );
      fireEvent.click(screen.getByTestId("btn-filter-change"));
      await waitFor(() =>
        expect(mockApiPost).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({ page: 0, filters: { status: ["DRAFT"] } }),
        ),
      );
    });

    it("sort ASC triggers fetchData with ASC order and resets page", async () => {
      renderDashboard();
      await waitFor(() => expect(screen.getByTestId("custom-table")).toBeInTheDocument());
      fireEvent.click(screen.getByTestId("btn-sort-asc"));
      await waitFor(() =>
        expect(mockApiPost).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({ sort: { field: "taskId", order: "ASC" }, page: 0 }),
        ),
      );
    });

    it("sort with empty field triggers DESC order", async () => {
      renderDashboard();
      await waitFor(() => expect(screen.getByTestId("custom-table")).toBeInTheDocument());
      fireEvent.click(screen.getByTestId("btn-sort-desc"));
      await waitFor(() =>
        expect(mockApiPost).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({ sort: { field: "", order: "DESC" } }),
        ),
      );
    });
  });

  describe("getRowActions", () => {
    async function renderWithTaskAndRole(
      role: any,
      taskOverrides: Partial<ConfiguratorTask> = {},
    ) {
      const task = makeTask(taskOverrides);
      mockApiPost.mockResolvedValue({ tasks: [task], totalResults: 1, countsBySubTab: {} });
      renderDashboard(role);
      await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    }

    it("CONFIGURATOR: shows View details, View work log, Put on hold and Cancel task", async () => {
      await renderWithTaskAndRole("CONFIGURATOR");
      expect(screen.getByTestId("action-View details-0")).toBeInTheDocument();
      expect(screen.getByTestId("action-View work log-0")).toBeInTheDocument();
      expect(screen.getByTestId("action-Put on hold-0")).toBeInTheDocument();
      expect(screen.getByTestId("action-Cancel task-0")).toBeInTheDocument();
      expect(screen.queryByTestId("action-Remove hold-0")).toBeNull();
      expect(screen.queryByTestId("action-Assign task-0")).toBeNull();
    });

    it("QUALITY_REVIEWER: only View details and View work log", async () => {
      await renderWithTaskAndRole("QUALITY_REVIEWER");
      expect(screen.getByTestId("action-View details-0")).toBeInTheDocument();
      expect(screen.getByTestId("action-View work log-0")).toBeInTheDocument();
      expect(screen.queryByTestId("action-Assign task-0")).toBeNull();
    });

    it("QUALITY_MANAGER: shows View details, View work log, Put on hold and Cancel task", async () => {
      await renderWithTaskAndRole("QUALITY_MANAGER");
      expect(screen.getByTestId("action-View details-0")).toBeInTheDocument();
      expect(screen.getByTestId("action-View work log-0")).toBeInTheDocument();
      expect(screen.getByTestId("action-Put on hold-0")).toBeInTheDocument();
      expect(screen.getByTestId("action-Cancel task-0")).toBeInTheDocument();
      expect(screen.queryByTestId("action-Remove hold-0")).toBeNull();
      expect(screen.queryByTestId("action-Assign task-0")).toBeNull();
    });

    it("CONFIGURATOR_MANAGER: shows Put on hold when status is DRAFT", async () => {
      await renderWithTaskAndRole("CONFIGURATOR_MANAGER", { status: ["DRAFT"] });
      expect(screen.getByTestId("action-Put on hold-0")).toBeInTheDocument();
      expect(screen.queryByTestId("action-Remove hold-0")).toBeNull();
    });

    it("CONFIGURATOR_MANAGER: shows Remove hold when status is ON_HOLD", async () => {
      await renderWithTaskAndRole("CONFIGURATOR_MANAGER", { status: ["ON_HOLD"] });
      expect(screen.getByTestId("action-Remove hold-0")).toBeInTheDocument();
      expect(screen.queryByTestId("action-Put on hold-0")).toBeNull();
    });

    it("CONFIGURATOR_MANAGER: shows Cancel task when not CANCELLED", async () => {
      await renderWithTaskAndRole("CONFIGURATOR_MANAGER", { status: ["DRAFT"] });
      expect(screen.getByTestId("action-Cancel task-0")).toBeInTheDocument();
    });

    it("CONFIGURATOR_MANAGER: hides Cancel task when already CANCELLED", async () => {
      await renderWithTaskAndRole("CONFIGURATOR_MANAGER", { status: ["CANCELLED"] });
      expect(screen.queryByTestId("action-Cancel task-0")).toBeNull();
    });

    it("CONFIGURATOR_MANAGER: hides actions when COMPLETED (terminal)", async () => {
      await renderWithTaskAndRole("CONFIGURATOR_MANAGER", { status: ["COMPLETED"] });
      expect(screen.getByTestId("action-View details-0")).toBeInTheDocument();
      expect(screen.getByTestId("action-View work log-0")).toBeInTheDocument();
      expect(screen.queryByTestId("action-Put on hold-0")).toBeNull();
      expect(screen.queryByTestId("action-Remove hold-0")).toBeNull();
      expect(screen.queryByTestId("action-Cancel task-0")).toBeNull();
    });

    it("unknown role returns empty actions", async () => {
      await renderWithTaskAndRole("UNKNOWN_ROLE" as any);
      expect(screen.queryByTestId("action-View details-0")).toBeNull();
    });
  });

  describe("action menu interactions", () => {
    beforeEach(async () => {
      mockApiPost.mockResolvedValue({ tasks: [makeTask()], totalResults: 1, countsBySubTab: {} });
    });

    async function setup(taskOverrides: Partial<ConfiguratorTask> = {}) {
      mockApiPost.mockResolvedValue({ tasks: [makeTask(taskOverrides)], totalResults: 1, countsBySubTab: {} });
      renderDashboard("CONFIGURATOR_MANAGER");
      await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    }

    it("View details opens sidebar at overview tab", async () => {
      await setup();
      fireEvent.click(screen.getByTestId("action-View details-0"));
      expect(screen.getByTestId("side-modal")).toBeInTheDocument();
      expect(screen.getByTestId("task-detail-sidebar")).toHaveAttribute("data-tab-key", "overview");
    });

    it("View work log opens sidebar at worklogs tab", async () => {
      await setup();
      fireEvent.click(screen.getByTestId("action-View work log-0"));
      expect(screen.getByTestId("task-detail-sidebar")).toHaveAttribute("data-tab-key", "worklogs");
    });

    it("CONFIGURATOR_MANAGER: no Assign task action available", async () => {
      await setup();
      expect(screen.queryByTestId("action-Assign task-0")).toBeNull();
    });

    it("Put on hold opens TaskActionModal", async () => {
      await setup({ status: ["DRAFT"] });
      fireEvent.click(screen.getByTestId("action-Put on hold-0"));
      expect(screen.getByTestId("task-action-modal")).toBeInTheDocument();
    });

    it("closing TaskActionModal hides it", async () => {
      await setup({ status: ["DRAFT"] });
      fireEvent.click(screen.getByTestId("action-Put on hold-0"));
      fireEvent.click(screen.getByTestId("task-action-close"));
      expect(screen.queryByTestId("task-action-modal")).toBeNull();
    });

    it("Cancel task opens TaskActionModal", async () => {
      await setup({ status: ["DRAFT"] });
      fireEvent.click(screen.getByTestId("action-Cancel task-0"));
      expect(screen.getByTestId("task-action-modal")).toBeInTheDocument();
    });

    it("Remove hold opens BasicModal", async () => {
      await setup({ status: ["ON_HOLD"] });
      fireEvent.click(screen.getByTestId("action-Remove hold-0"));
      expect(screen.getByTestId("basic-modal")).toBeInTheDocument();
    });

    it("CONFIGURATOR_MANAGER: no Defer peer review action available", async () => {
      await setup({ status: ["DRAFT"] });
      expect(screen.queryByTestId("action-Defer peer review-0")).toBeNull();
    });

    it("closing TaskActionModal cancel button hides modal for Cancel task", async () => {
      await setup({ status: ["DRAFT"] });
      fireEvent.click(screen.getByTestId("action-Cancel task-0"));
      fireEvent.click(screen.getByTestId("task-action-close"));
      expect(screen.queryByTestId("task-action-modal")).toBeNull();
    });

    it("Cancel task modal opens and shows confirm button", async () => {
      await setup({ status: ["DRAFT"] });
      fireEvent.click(screen.getByTestId("action-Cancel task-0"));
      expect(screen.getByTestId("task-action-modal")).toBeInTheDocument();
      expect(screen.getByTestId("task-action-confirm")).toBeInTheDocument();
    });

    it("closing SideModal hides it", async () => {
      await setup();
      fireEvent.click(screen.getByTestId("action-View details-0"));
      fireEvent.click(screen.getByTestId("close-side-modal"));
      expect(screen.queryByTestId("side-modal")).toBeNull();
    });

    it("closing Remove hold modal via cancel button hides it", async () => {
      await setup({ status: ["ON_HOLD"] });
      fireEvent.click(screen.getByTestId("action-Remove hold-0"));
      expect(screen.getByTestId("basic-modal")).toBeInTheDocument();
      fireEvent.click(screen.getByTestId("basic-modal-close"));
      expect(screen.queryByTestId("basic-modal")).toBeNull();
    });

    it("closing Cancel task modal via cancel button hides it", async () => {
      await setup({ status: ["DRAFT"] });
      fireEvent.click(screen.getByTestId("action-Cancel task-0"));
      expect(screen.getByTestId("task-action-modal")).toBeInTheDocument();
      fireEvent.click(screen.getByTestId("task-action-close"));
      expect(screen.queryByTestId("task-action-modal")).toBeNull();
    });

    it("CONFIGURATOR: clicking View details opens sidebar", async () => {
      mockApiPost.mockResolvedValue({ tasks: [makeTask()], totalResults: 1, countsBySubTab: {} });
      renderDashboard("CONFIGURATOR");
      await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
      fireEvent.click(screen.getByTestId("action-View details-0"));
      expect(screen.getByTestId("task-detail-sidebar")).toHaveAttribute("data-tab-key", "overview");
    });

    it("CONFIGURATOR: clicking View work log opens sidebar", async () => {
      mockApiPost.mockResolvedValue({ tasks: [makeTask()], totalResults: 1, countsBySubTab: {} });
      renderDashboard("CONFIGURATOR");
      await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
      fireEvent.click(screen.getByTestId("action-View work log-0"));
      expect(screen.getByTestId("task-detail-sidebar")).toHaveAttribute("data-tab-key", "worklogs");
    });

    it("QUALITY_REVIEWER_MANAGER: clicking View details opens sidebar", async () => {
      mockApiPost.mockResolvedValue({ tasks: [makeTask()], totalResults: 1, countsBySubTab: {} });
      renderDashboard("QUALITY_MANAGER");
      await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
      fireEvent.click(screen.getByTestId("action-View details-0"));
      expect(screen.getByTestId("task-detail-sidebar")).toHaveAttribute("data-tab-key", "overview");
    });

    it("QUALITY_REVIEWER_MANAGER: clicking View work log opens sidebar", async () => {
      mockApiPost.mockResolvedValue({ tasks: [makeTask()], totalResults: 1, countsBySubTab: {} });
      renderDashboard("QUALITY_MANAGER");
      await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
      fireEvent.click(screen.getByTestId("action-View work log-0"));
      expect(screen.getByTestId("task-detail-sidebar")).toHaveAttribute("data-tab-key", "worklogs");
    });

    it("QUALITY_REVIEWER_MANAGER: no Assign task action available", async () => {
      mockApiPost.mockResolvedValue({ tasks: [makeTask()], totalResults: 1, countsBySubTab: {} });
      renderDashboard("QUALITY_MANAGER");
      await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
      expect(screen.queryByTestId("action-Assign task-0")).toBeNull();
    });

    it("QUALITY_REVIEWER: clicking View details opens sidebar", async () => {
      mockApiPost.mockResolvedValue({ tasks: [makeTask()], totalResults: 1, countsBySubTab: {} });
      renderDashboard("QUALITY_REVIEWER");
      await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
      fireEvent.click(screen.getByTestId("action-View details-0"));
      expect(screen.getByTestId("task-detail-sidebar")).toHaveAttribute("data-tab-key", "overview");
    });

    it("QUALITY_REVIEWER: clicking View work log opens sidebar", async () => {
      mockApiPost.mockResolvedValue({ tasks: [makeTask()], totalResults: 1, countsBySubTab: {} });
      renderDashboard("QUALITY_REVIEWER");
      await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
      fireEvent.click(screen.getByTestId("action-View work log-0"));
      expect(screen.getByTestId("task-detail-sidebar")).toHaveAttribute("data-tab-key", "worklogs");
    });
  });

  describe("handleCancelTask", () => {
    it("calls api.put CANCEL and shows success toast", async () => {
      const task = makeTask({ taskMongoId: "mongo-abc", status: ["DRAFT"] });
      mockApiPost.mockResolvedValue({ tasks: [task], totalResults: 1, countsBySubTab: {} });
      renderDashboard("CONFIGURATOR_MANAGER");
      await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());

      fireEvent.click(screen.getByTestId("action-Cancel task-0"));
      fireEvent.click(screen.getByTestId("task-action-confirm"));

      await waitFor(() =>
        expect(mockApiPut).toHaveBeenCalledWith(
          expect.stringContaining("mongo-abc/action"),
          expect.objectContaining({ action: "CANCEL" }),
        ),
      );
      await waitFor(() =>
        expect(mockShowCustomToast).toHaveBeenCalledWith(
          expect.objectContaining({ type: "success" }),
        ),
      );
    });

    it("shows error toast and re-throws when cancel api.put throws", async () => {
      const task = makeTask({ status: ["DRAFT"] });
      mockApiPost.mockResolvedValue({ tasks: [task], totalResults: 1, countsBySubTab: {} });
      mockApiPut.mockRejectedValue(new Error("cancel fail"));
      renderDashboard("CONFIGURATOR_MANAGER");
      await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());

      fireEvent.click(screen.getByTestId("action-Cancel task-0"));
      fireEvent.click(screen.getByTestId("task-action-confirm"));

      await waitFor(() =>
        expect(mockShowCustomToast).toHaveBeenCalledWith(
          expect.objectContaining({ type: "error" }),
        ),
      );
    });
  });

  describe("handlePutOnHold", () => {
    it("calls api.put PUT_ON_HOLD and shows success toast", async () => {
      const task = makeTask({ taskMongoId: "mongo-hold", status: ["DRAFT"] });
      mockApiPost.mockResolvedValue({ tasks: [task], totalResults: 1, countsBySubTab: {} });
      renderDashboard("CONFIGURATOR_MANAGER");
      await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());

      fireEvent.click(screen.getByTestId("action-Put on hold-0"));
      fireEvent.click(screen.getByTestId("task-action-confirm"));

      await waitFor(() =>
        expect(mockApiPut).toHaveBeenCalledWith(
          expect.stringContaining("mongo-hold/action"),
          expect.objectContaining({ action: "PUT_ON_HOLD", confirmPutOnHold: true }),
        ),
      );
      await waitFor(() =>
        expect(mockShowCustomToast).toHaveBeenCalledWith(
          expect.objectContaining({ type: "success" }),
        ),
      );
    });

    it("shows error toast when put on hold api.put throws", async () => {
      const task = makeTask({ status: ["DRAFT"] });
      mockApiPost.mockResolvedValue({ tasks: [task], totalResults: 1, countsBySubTab: {} });
      mockApiPut.mockRejectedValue(new Error("hold fail"));
      renderDashboard("CONFIGURATOR_MANAGER");
      await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());

      fireEvent.click(screen.getByTestId("action-Put on hold-0"));
      fireEvent.click(screen.getByTestId("task-action-confirm"));

      await waitFor(() =>
        expect(mockShowCustomToast).toHaveBeenCalledWith(
          expect.objectContaining({ type: "error" }),
        ),
      );
    });
  });

  describe("handleRemoveHold", () => {
    it("calls api.put RESUME_HOLD and shows success toast", async () => {
      const task = makeTask({ taskMongoId: "mongo-rmhold", status: ["ON_HOLD"] });
      mockApiPost.mockResolvedValue({ tasks: [task], totalResults: 1, countsBySubTab: {} });
      renderDashboard("CONFIGURATOR_MANAGER");
      await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());

      fireEvent.click(screen.getByTestId("action-Remove hold-0"));
      fireEvent.click(within(screen.getByTestId("basic-modal")).getByRole("button", { name: "Remove hold" }));

      await waitFor(() =>
        expect(mockApiPut).toHaveBeenCalledWith(
          expect.stringContaining("mongo-rmhold/action"),
          { action: "RESUME_HOLD" },
        ),
      );
      await waitFor(() =>
        expect(mockShowCustomToast).toHaveBeenCalledWith(
          expect.objectContaining({ type: "success" }),
        ),
      );
    });

    it("shows error toast when remove hold api.put throws", async () => {
      const task = makeTask({ status: ["ON_HOLD"] });
      mockApiPost.mockResolvedValue({ tasks: [task], totalResults: 1, countsBySubTab: {} });
      mockApiPut.mockRejectedValue(new Error("rmhold fail"));
      renderDashboard("CONFIGURATOR_MANAGER");
      await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());

      fireEvent.click(screen.getByTestId("action-Remove hold-0"));
      fireEvent.click(within(screen.getByTestId("basic-modal")).getByRole("button", { name: "Remove hold" }));

      await waitFor(() =>
        expect(mockShowCustomToast).toHaveBeenCalledWith(
          expect.objectContaining({ type: "error" }),
        ),
      );
    });
  });

  describe("handleRowClick", () => {
    async function renderAndClick(
      taskOverrides: Partial<ConfiguratorTask>,
      sessionName: string | null = null,
    ) {
      sessionStorage.clear();
      if (sessionName) sessionStorage.setItem("name", sessionName);
      const task = makeTask(taskOverrides);
      mockApiPost.mockResolvedValue({ tasks: [task], totalResults: 1, countsBySubTab: {} });
      renderDashboard("CONFIGURATOR");
      await waitFor(() =>
        expect(screen.getByTestId("cell-taskId-0")).toBeInTheDocument(),
      );
      const navigateField = screen.getByTestId("cell-taskId-0").querySelector(".navigate-field");
      if (navigateField) fireEvent.click(navigateField);
    }

    it("non-assignee → opens overview sidebar", async () => {
      await renderAndClick({ status: ["DRAFT"], assignee: "Alice" }, "Bob");
      expect(screen.getByTestId("side-modal")).toBeInTheDocument();
    });

    it("ON_HOLD (no PENDING_PEER_REVIEW) → opens sidebar regardless of assignee", async () => {
      await renderAndClick({ status: ["ON_HOLD"], assignee: "Alice" }, "Alice");
      expect(screen.getByTestId("side-modal")).toBeInTheDocument();
    });

    it("APPROVED (no PENDING_PEER_REVIEW) → opens sidebar", async () => {
      await renderAndClick({ status: ["APPROVED"], assignee: "Alice" }, "Alice");
      expect(screen.getByTestId("side-modal")).toBeInTheDocument();
    });

    it("SCHEDULED (no PENDING_PEER_REVIEW) → opens sidebar", async () => {
      await renderAndClick({ status: ["SCHEDULED"], assignee: "Alice" }, "Alice");
      expect(screen.getByTestId("side-modal")).toBeInTheDocument();
    });

    it("COMPLETED (no PENDING_PEER_REVIEW) → opens sidebar", async () => {
      await renderAndClick({ status: ["COMPLETED"], assignee: "Alice" }, "Alice");
      expect(screen.getByTestId("side-modal")).toBeInTheDocument();
    });

    it("PENDING_PEER_REVIEW + APPROVED → navigates to org review", async () => {
      await renderAndClick(
        {
          taskId: "O-001",
          orgUuid: "org-uuid-1",
          status: ["PENDING_PEER_REVIEW", "APPROVED"],
          assignee: "Alice",
        },
        "Alice",
      );
      expect(screen.queryByTestId("side-modal")).toBeNull();
      expect(mockNavigate).toHaveBeenCalledWith(
        "/CCC/org-detail/org-uuid-1/review/O-001/general-settings",
      );
    });

    it("PENDING_PEER_REVIEW + PENDING_QUALITY_REVIEW → no sidebar", async () => {
      const spy = vi.spyOn(console, "log").mockImplementation(() => {});
      await renderAndClick(
        { status: ["PENDING_PEER_REVIEW", "PENDING_QUALITY_REVIEW"], assignee: "Alice" },
        "Alice",
      );
      expect(screen.queryByTestId("side-modal")).toBeNull();
      expect(mockNavigate).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    it("PENDING_PEER_REVIEW + QUALITY_REVIEW_IN_PROGRESS → no sidebar", async () => {
      const spy = vi.spyOn(console, "log").mockImplementation(() => {});
      await renderAndClick(
        { status: ["PENDING_PEER_REVIEW", "QUALITY_REVIEW_IN_PROGRESS"], assignee: "Alice" },
        "Alice",
      );
      expect(screen.queryByTestId("side-modal")).toBeNull();
      spy.mockRestore();
    });

    it("plain PENDING_PEER_REVIEW → navigates to org review", async () => {
      await renderAndClick(
        {
          taskId: "O-001",
          orgUuid: "org-uuid-1",
          status: ["PENDING_PEER_REVIEW"],
          assignee: "Alice",
        },
        "Alice",
      );
      expect(screen.queryByTestId("side-modal")).toBeNull();
      expect(mockNavigate).toHaveBeenCalledWith(
        "/CCC/org-detail/org-uuid-1/review/O-001/general-settings",
      );
    });

    it("DRAFT as assignee → navigates to org edit", async () => {
      await renderAndClick(
        { taskId: "O-001", orgUuid: "org-uuid-1", status: ["DRAFT"], assignee: "Alice" },
        "Alice",
      );
      expect(mockNavigate).toHaveBeenCalledWith(
        "/CCC/org-detail/org-uuid-1/edit/O-001/general-settings",
      );
    });

    it("DRAFT group task as assignee → navigates to group edit", async () => {
      await renderAndClick(
        { taskId: "G-001", groupUuid: "grp-uuid-1", status: ["DRAFT"], assignee: "Alice" },
        "Alice",
      );
      expect(mockNavigate).toHaveBeenCalledWith(
        "/CCC/groups/grp-uuid-1/edit/G-001/general-settings",
      );
    });

    it("PEER_REVIEW_IN_PROGRESS → navigates to org review", async () => {
      await renderAndClick(
        {
          taskId: "O-001",
          orgUuid: "org-uuid-1",
          status: ["PEER_REVIEW_IN_PROGRESS"],
          assignee: "Alice",
        },
        "Alice",
      );
      expect(screen.queryByTestId("side-modal")).toBeNull();
      expect(mockNavigate).toHaveBeenCalledWith(
        "/CCC/org-detail/org-uuid-1/review/O-001/general-settings",
      );
    });

    it("PEER_REVIEW_IN_PROGRESS group task → navigates to group review", async () => {
      await renderAndClick(
        {
          taskId: "G-001",
          groupUuid: "grp-uuid-1",
          status: ["PEER_REVIEW_IN_PROGRESS"],
          assignee: "Alice",
        },
        "Alice",
      );
      expect(mockNavigate).toHaveBeenCalledWith(
        "/CCC/groups/grp-uuid-1/review/G-001/general-settings",
      );
    });

    it("PENDING_QUALITY_REVIEW → no sidebar, no navigate", async () => {
      const spy = vi.spyOn(console, "log").mockImplementation(() => {});
      await renderAndClick({ status: ["PENDING_QUALITY_REVIEW"], assignee: "Alice" }, "Alice");
      expect(screen.queryByTestId("side-modal")).toBeNull();
      spy.mockRestore();
    });

    it("QUALITY_REVIEW_IN_PROGRESS → no sidebar, no navigate", async () => {
      const spy = vi.spyOn(console, "log").mockImplementation(() => {});
      await renderAndClick({ status: ["QUALITY_REVIEW_IN_PROGRESS"], assignee: "Alice" }, "Alice");
      expect(screen.queryByTestId("side-modal")).toBeNull();
      spy.mockRestore();
    });

    it("REJECTED_PEER_REVIEW → navigates to edit", async () => {
      await renderAndClick(
        { taskId: "O-rej", orgUuid: "org-uuid-1", status: ["REJECTED_PEER_REVIEW"], assignee: "Alice" },
        "Alice",
      );
      expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining("O-rej"));
    });

    it("REJECTED_QUALITY_REVIEW → navigates to edit", async () => {
      await renderAndClick(
        { taskId: "O-rqr", orgUuid: "org-uuid-1", status: ["REJECTED_QUALITY_REVIEW"], assignee: "Alice" },
        "Alice",
      );
      expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining("O-rqr"));
    });

    it("REBUTTAL_FAILED → no navigate, no sidebar", async () => {
      const spy = vi.spyOn(console, "log").mockImplementation(() => {});
      await renderAndClick({ status: ["REBUTTAL_FAILED"], assignee: "Alice" }, "Alice");
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(screen.queryByTestId("side-modal")).toBeNull();
      spy.mockRestore();
    });

    it("REBUTTAL → no navigate, no sidebar", async () => {
      const spy = vi.spyOn(console, "log").mockImplementation(() => {});
      await renderAndClick({ status: ["REBUTTAL"], assignee: "Alice" }, "Alice");
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(screen.queryByTestId("side-modal")).toBeNull();
      spy.mockRestore();
    });

    it("unknown status as assignee → opens sidebar (fallback)", async () => {
      await renderAndClick({ status: ["SOME_UNKNOWN_STATUS"], assignee: "Alice" }, "Alice");
      expect(screen.getByTestId("side-modal")).toBeInTheDocument();
    });

  });

  describe("navigateToEdit", () => {
    async function clickNavigateField(taskOverrides: Partial<ConfiguratorTask>) {
      sessionStorage.setItem("name", "Alice");
      const task = makeTask({ ...taskOverrides, assignee: "Alice", status: ["DRAFT"] });
      mockApiPost.mockResolvedValue({ tasks: [task], totalResults: 1, countsBySubTab: {} });
      renderDashboard("CONFIGURATOR");
      await waitFor(() =>
        expect(screen.getByTestId("cell-taskId-0")).toBeInTheDocument(),
      );
      const el = screen.getByTestId("cell-taskId-0").querySelector(".navigate-field");
      if (el) fireEvent.click(el);
    }

    it("does not navigate when taskId is empty", async () => {
      await clickNavigateField({ taskId: "" });
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("group task without groupUuid does not navigate", async () => {
      await clickNavigateField({ taskId: "G-001", groupUuid: "" });
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("org task without orgUuid does not navigate", async () => {
      await clickNavigateField({ taskId: "O-001", orgUuid: "" });
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe("column: organizationName", () => {
    it("renders link when organizationName present", async () => {
      mockApiPost.mockResolvedValue({
        tasks: [makeTask({ organizationName: "My Org", orgUuid: "org-uuid-1" })],
        totalResults: 1,
        countsBySubTab: {},
      });
      renderDashboard();
      await waitFor(() => expect(screen.getByTestId("cell-organizationName-0")).toBeInTheDocument());
      const link = screen.getByTestId("cell-organizationName-0").querySelector("a");
      expect(link?.getAttribute("href")).toContain("org-uuid-1");
    });

    it("renders '-' when organizationName is falsy", async () => {
      mockApiPost.mockResolvedValue({
        tasks: [makeTask({ organizationName: "" })],
        totalResults: 1,
        countsBySubTab: {},
      });
      renderDashboard();
      await waitFor(() => expect(screen.getByTestId("cell-organizationName-0")).toBeInTheDocument());
      expect(screen.getByTestId("cell-organizationName-0").textContent).toBe("-");
    });
  });

  describe("column: groupName", () => {
    it("renders link when groupUuid present", async () => {
      mockApiPost.mockResolvedValue({
        tasks: [makeTask({ groupName: "G", groupUuid: "grp-uuid-1" })],
        totalResults: 1,
        countsBySubTab: {},
      });
      renderDashboard();
      await waitFor(() => expect(screen.getByTestId("cell-groupName-0")).toBeInTheDocument());
      expect(screen.getByTestId("cell-groupName-0").querySelector("a")).toBeTruthy();
    });

    it("renders '-' span when groupUuid is present but groupName is empty", async () => {
      mockApiPost.mockResolvedValue({
        tasks: [makeTask({ groupName: "", groupUuid: "grp-uuid-1" })],
        totalResults: 1,
        countsBySubTab: {},
      });
      renderDashboard();
      await waitFor(() => expect(screen.getByTestId("cell-groupName-0")).toBeInTheDocument());
      expect(screen.getByTestId("cell-groupName-0").textContent).toBe("-");
    });

    it("numeric groupName without groupUuid → clickable span that opens groups sidebar", async () => {
      mockApiPost.mockResolvedValue({
        tasks: [makeTask({ taskId: "O-001", groupName: "12345", groupUuid: "" })],
        totalResults: 1,
        countsBySubTab: {},
      });
      renderDashboard();
      await waitFor(() => expect(screen.getByTestId("cell-groupName-0")).toBeInTheDocument());
      const span = screen.getByTestId("cell-groupName-0").querySelector(".text-primary");
      expect(span).toBeTruthy();
      fireEvent.click(span!);
      expect(screen.getByTestId("task-detail-sidebar")).toHaveAttribute("data-tab-key", "groups");
    });

    it("non-numeric groupName without groupUuid → plain span (no link)", async () => {
      mockApiPost.mockResolvedValue({
        tasks: [makeTask({ groupName: "Some Group", groupUuid: "" })],
        totalResults: 1,
        countsBySubTab: {},
      });
      renderDashboard();
      await waitFor(() => expect(screen.getByTestId("cell-groupName-0")).toBeInTheDocument());
      expect(screen.getByTestId("cell-groupName-0").querySelector("a")).toBeNull();
    });
  });

  describe("column: statusAgeDays", () => {
    it("adds error-text class when statusAgeDays > 7", async () => {
      mockApiPost.mockResolvedValue({
        tasks: [makeTask({ statusAgeDays: 10 })],
        totalResults: 1,
        countsBySubTab: {},
      });
      renderDashboard();
      await waitFor(() => expect(screen.getByTestId("cell-statusAgeDays-0")).toBeInTheDocument());
      expect(screen.getByTestId("cell-statusAgeDays-0").querySelector(".status-age-error-text")).toBeTruthy();
    });

    it("no error-text class when statusAgeDays <= 7", async () => {
      mockApiPost.mockResolvedValue({
        tasks: [makeTask({ statusAgeDays: 4 })],
        totalResults: 1,
        countsBySubTab: {},
      });
      renderDashboard();
      await waitFor(() => expect(screen.getByTestId("cell-statusAgeDays-0")).toBeInTheDocument());
      expect(screen.getByTestId("cell-statusAgeDays-0").querySelector(".status-age-error-text")).toBeNull();
    });
  });

  describe("column: priority", () => {
    it("displays 'Normal' and priority--normal class for medium priority", async () => {
      mockApiPost.mockResolvedValue({
        tasks: [makeTask({ priority: "medium" })],
        totalResults: 1,
        countsBySubTab: {},
      });
      renderDashboard();
      await waitFor(() => expect(screen.getByTestId("cell-priority-0")).toBeInTheDocument());
      const cell = screen.getByTestId("cell-priority-0");
      expect(cell.textContent).toContain("Normal");
      expect(cell.querySelector(".priority--normal")).toBeTruthy();
    });

    it("displays 'High' and priority--high class for High priority", async () => {
      mockApiPost.mockResolvedValue({
        tasks: [makeTask({ priority: "High" })],
        totalResults: 1,
        countsBySubTab: {},
      });
      renderDashboard();
      await waitFor(() => expect(screen.getByTestId("cell-priority-0")).toBeInTheDocument());
      const cell = screen.getByTestId("cell-priority-0");
      expect(cell.textContent).toContain("High");
      expect(cell.querySelector(".priority--high")).toBeTruthy();
    });
  });

  describe("column: indicators / getRowStatusIndicators", () => {
    it("renders empty span when no indicators", async () => {
      mockApiPost.mockResolvedValue({
        tasks: [makeTask({ status: ["DRAFT"], statusAgeDays: 1, plannedLaunchDate: "2099-01-01" })],
        totalResults: 1,
        countsBySubTab: {},
      });
      renderDashboard();
      await waitFor(() => expect(screen.getByTestId("cell-indicators-0")).toBeInTheDocument());
      expect(screen.queryByTestId("exclamation-icon")).toBeNull();
      expect(screen.queryByTestId("warning-icon")).toBeNull();
    });

    it("renders ExclamationIcon for ERRORED status", async () => {
      mockApiPost.mockResolvedValue({
        tasks: [makeTask({ status: ["ERRORED"], statusAgeDays: 1 })],
        totalResults: 1,
        countsBySubTab: {},
      });
      renderDashboard();
      await waitFor(() => expect(screen.getByTestId("exclamation-icon")).toBeInTheDocument());
    });

    it("renders WarningIcon when statusAgeDays > 7", async () => {
      mockApiPost.mockResolvedValue({
        tasks: [makeTask({ status: ["APPROVED"], statusAgeDays: 8, plannedLaunchDate: "" })],
        totalResults: 1,
        countsBySubTab: {},
      });
      renderDashboard();
      await waitFor(() => expect(screen.getByTestId("warning-icon")).toBeInTheDocument());
    });

    it("renders ExclamationIcon for overdue plannedLaunchDate", async () => {
      mockApiPost.mockResolvedValue({
        tasks: [makeTask({ status: ["APPROVED"], statusAgeDays: 1, plannedLaunchDate: "2000-01-01" })],
        totalResults: 1,
        countsBySubTab: {},
      });
      renderDashboard();
      await waitFor(() => expect(screen.queryAllByTestId("exclamation-icon").length).toBeGreaterThan(0));
    });

    it("renders WarningIcon for launch-soon date (within 7 days)", async () => {
      const soon = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      mockApiPost.mockResolvedValue({
        tasks: [makeTask({ status: ["APPROVED"], statusAgeDays: 1, plannedLaunchDate: soon })],
        totalResults: 1,
        countsBySubTab: {},
      });
      renderDashboard();
      await waitFor(() => expect(screen.getByTestId("warning-icon")).toBeInTheDocument());
    });

    it("returns [] on parentIdx=2 childIdx=0 (All review tasks / Needs attention)", async () => {
      mockApiPost.mockResolvedValue({
        tasks: [makeTask({ status: ["ERRORED"], statusAgeDays: 10 })],
        totalResults: 1,
        countsBySubTab: {},
      });
      renderDashboard("QUALITY_MANAGER");
      await waitFor(() => expect(screen.getByTestId("cell-indicators-0")).toBeInTheDocument());
      expect(screen.queryByTestId("exclamation-icon")).toBeNull();
    });

    it("renders nothing when plannedLaunchDate is empty string", async () => {
      mockApiPost.mockResolvedValue({
        tasks: [makeTask({ status: ["DRAFT"], statusAgeDays: 1, plannedLaunchDate: "" })],
        totalResults: 1,
        countsBySubTab: {},
      });
      renderDashboard();
      await waitFor(() => expect(screen.getByTestId("cell-indicators-0")).toBeInTheDocument());
      expect(screen.queryByTestId("exclamation-icon")).toBeNull();
      expect(screen.queryByTestId("warning-icon")).toBeNull();
    });

    it("CANCELLED status → no indicators regardless of statusAgeDays or overdue date", async () => {
      mockApiPost.mockResolvedValue({
        tasks: [makeTask({ status: ["CANCELLED"], statusAgeDays: 10, plannedLaunchDate: "2000-01-01" })],
        totalResults: 1,
        countsBySubTab: {},
      });
      renderDashboard();
      await waitFor(() => expect(screen.getByTestId("cell-indicators-0")).toBeInTheDocument());
      expect(screen.queryByTestId("exclamation-icon")).toBeNull();
      expect(screen.queryByTestId("warning-icon")).toBeNull();
    });

    it("overdue suppresses 'Same status for over 7 days' — only Overdue exclamation shown", async () => {
      mockApiPost.mockResolvedValue({
        tasks: [makeTask({ status: ["APPROVED"], statusAgeDays: 10, plannedLaunchDate: "2000-01-01" })],
        totalResults: 1,
        countsBySubTab: {},
      });
      renderDashboard();
      await waitFor(() => expect(screen.getByTestId("cell-indicators-0")).toBeInTheDocument());
      expect(screen.queryAllByTestId("exclamation-icon").length).toBeGreaterThan(0);
      expect(screen.queryByTestId("warning-icon")).toBeNull();
    });
  });

  describe("StatusBadge", () => {
    it("renders mapped display text for DRAFT", async () => {
      mockApiPost.mockResolvedValue({
        tasks: [makeTask({ status: ["DRAFT"] })],
        totalResults: 1,
        countsBySubTab: {},
      });
      renderDashboard();
      await waitFor(() => expect(screen.getByTestId("cell-status-0")).toBeInTheDocument());
      expect(screen.getByTestId("cell-status-0").textContent).toContain("Draft");
    });

    it("renders raw text for unmapped status", async () => {
      mockApiPost.mockResolvedValue({
        tasks: [makeTask({ status: ["CUSTOM_STATUS"] })],
        totalResults: 1,
        countsBySubTab: {},
      });
      renderDashboard();
      await waitFor(() => expect(screen.getByTestId("cell-status-0")).toBeInTheDocument());
      expect(screen.getByTestId("cell-status-0").textContent).toContain("CUSTOM_STATUS");
    });

    it("normalizes underscore-to-space: ON_HOLD → 'On hold'", async () => {
      mockApiPost.mockResolvedValue({
        tasks: [makeTask({ status: ["ON_HOLD"] })],
        totalResults: 1,
        countsBySubTab: {},
      });
      renderDashboard();
      await waitFor(() => expect(screen.getByTestId("cell-status-0")).toBeInTheDocument());
      expect(screen.getByTestId("cell-status-0").textContent).toContain("On hold");
    });

    it("applies status--draft CSS class for DRAFT", async () => {
      mockApiPost.mockResolvedValue({
        tasks: [makeTask({ status: ["DRAFT"] })],
        totalResults: 1,
        countsBySubTab: {},
      });
      renderDashboard();
      await waitFor(() => expect(screen.getByTestId("cell-status-0")).toBeInTheDocument());
      expect(screen.getByTestId("cell-status-0").querySelector(".status--draft")).toBeTruthy();
    });

    it("renders multiple status badges for multi-status array", async () => {
      mockApiPost.mockResolvedValue({
        tasks: [makeTask({ status: ["DRAFT", "ON_HOLD"] })],
        totalResults: 1,
        countsBySubTab: {},
      });
      renderDashboard();
      await waitFor(() => expect(screen.getByTestId("cell-status-0")).toBeInTheDocument());
      const cell = screen.getByTestId("cell-status-0");
      expect(cell.textContent).toContain("Draft");
      expect(cell.textContent).toContain("On hold");
    });
  });

  describe("LaunchDateField", () => {
    it("applies status-age-overdue class for past date", async () => {
      mockApiPost.mockResolvedValue({
        tasks: [makeTask({ plannedLaunchDate: "2000-01-01" })],
        totalResults: 1,
        countsBySubTab: {},
      });
      renderDashboard();
      await waitFor(() =>
        expect(screen.getByTestId("cell-plannedLaunchDate-0")).toBeInTheDocument(),
      );
      expect(
        screen.getByTestId("cell-plannedLaunchDate-0").querySelector(".status-age-overdue"),
      ).toBeTruthy();
    });

    it("applies status-age-launch-soon class for date within 7 days", async () => {
      const soon = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      mockApiPost.mockResolvedValue({
        tasks: [makeTask({ plannedLaunchDate: soon })],
        totalResults: 1,
        countsBySubTab: {},
      });
      renderDashboard();
      await waitFor(() =>
        expect(screen.getByTestId("cell-plannedLaunchDate-0")).toBeInTheDocument(),
      );
      expect(
        screen.getByTestId("cell-plannedLaunchDate-0").querySelector(".status-age-launch-soon"),
      ).toBeTruthy();
    });

    it("applies plain status-age class for far future date", async () => {
      mockApiPost.mockResolvedValue({
        tasks: [makeTask({ plannedLaunchDate: "2099-01-01" })],
        totalResults: 1,
        countsBySubTab: {},
      });
      renderDashboard();
      await waitFor(() =>
        expect(screen.getByTestId("cell-plannedLaunchDate-0")).toBeInTheDocument(),
      );
      const cell = screen.getByTestId("cell-plannedLaunchDate-0");
      expect(cell.querySelector(".status-age")).toBeTruthy();
      expect(cell.querySelector(".status-age-overdue")).toBeNull();
      expect(cell.querySelector(".status-age-launch-soon")).toBeNull();
    });
  });

  describe("sidebar", () => {
    it("SideModal title contains the taskId", async () => {
      mockApiPost.mockResolvedValue({
        tasks: [makeTask({ taskId: "O-999" })],
        totalResults: 1,
        countsBySubTab: {},
      });
      renderDashboard("CONFIGURATOR_MANAGER");
      await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
      fireEvent.click(screen.getByTestId("action-View details-0"));
      expect(screen.getByTestId("side-modal-title").textContent).toContain("O-999");
    });

    it("TaskDetailSidebar receives correct taskId and tabKey", async () => {
      mockApiPost.mockResolvedValue({
        tasks: [makeTask({ taskId: "O-123" })],
        totalResults: 1,
        countsBySubTab: {},
      });
      renderDashboard("CONFIGURATOR_MANAGER");
      await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
      fireEvent.click(screen.getByTestId("action-View work log-0"));
      expect(screen.getByTestId("task-detail-sidebar")).toHaveAttribute("data-task-id", "O-123");
      expect(screen.getByTestId("task-detail-sidebar")).toHaveAttribute("data-tab-key", "worklogs");
    });
  });
});
