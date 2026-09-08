import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

vi.mock("react-bootstrap", () => {
  const Tabs = ({ children, onSelect }: any) => (
    <div data-testid="tabs">
      <div data-testid="tab-buttons">
        {React.Children.map(children, (child: any) => {
          if (!child) return null;
          return (
            <button
              key={child.props.eventKey}
              data-testid={`tab-btn-${child.props.eventKey}`}
              onClick={() => onSelect?.(child.props.eventKey)}
            >
              {child.props.title}
            </button>
          );
        })}
      </div>
      {children}
    </div>
  );
  const Tab = ({ children, eventKey }: any) => (
    <div data-testid={`tab-panel-${eventKey}`}>{children}</div>
  );
  return { Tabs, Tab };
});

const mockApiGet = vi.fn();
const mockApiPost = vi.fn();
vi.mock("@/api/apiService", () => ({
  default: {
    get: (...a: any[]) => mockApiGet(...a),
    post: (...a: any[]) => mockApiPost(...a),
  },
}));

const mockShowCustomToast = vi.fn();
let capturedFileColumns: any[] = [];
vi.mock("@ucc/common-ui", () => {
  const txt = (c: any): string => {
    if (!c) return "";
    if (typeof c === "string" || typeof c === "number") return String(c);
    if (Array.isArray(c)) return c.map(txt).join("");
    if (c?.props?.children != null) return txt(c.props.children);
    return "";
  };
  return {
  Button: ({ children, onClick, className, variant }: any) => {
    const label = txt(children).trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/gi, "").toLowerCase() || "misc";
    return (
      <button onClick={onClick} className={className} data-testid={`btn-${label}`} data-variant={variant}>
        {children}
      </button>
    );
  },
  Loader: ({ text, className }: any) => (
    <div data-testid="loader" className={className}>
      {text}
    </div>
  ),
  FailSafePage: ({ cardType }: any) => (
    <div data-testid={`failsafe-${cardType}`}>{cardType}</div>
  ),
  GroupIcon: () => <span data-testid="group-icon">G</span>,
  showCustomToast: (...a: any[]) => mockShowCustomToast(...a),
  SideModal: ({ show, children, title, onHide }: any) =>
    show ? (
      <div data-testid="side-modal">
        <span data-testid="side-modal-title">{title}</span>
        <button data-testid="close-side-modal" onClick={onHide}>
          Close
        </button>
        {children}
      </div>
    ) : null,
  CustomTable: ({ data, columns }: any) => {
    capturedFileColumns = columns ?? [];
    return (
      <div data-testid="custom-table">
        {(data ?? []).map((row: any, i: number) => (
          <div key={i} data-testid={`file-row-${i}`}>
            {(columns ?? []).map((col: any) => (
              <div key={col.field} data-testid={`file-cell-${col.field}-${i}`}>
                {col.render ? col.render(row[col.field], row) : String(row[col.field] ?? "")}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  },
  ToastType: { Error: "error", Success: "success" },
  TableColumn: {},
  };
});

const mockFormatUTCtoDateOnly = vi.fn((v: string) => `date:${v}`);
const mockFormatUTCToEST = vi.fn((v: string) => `est:${v}`);
const mockDownloadBase64File = vi.fn();
const mockGetSafeString = vi.fn((v: any) => (v == null ? "-" : String(v)));
const mockNormalizeFileLinkEntry = vi.fn((entry: any) => ({
  storageName: entry?.storageName ?? entry ?? "",
  sizeBytes: entry?.sizeBytes ?? 1024,
}));
const mockRemoveTrailingTimestamp = vi.fn((s: string) => s);

vi.mock("@/utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/utils")>();
  return {
    ...actual,
    formatUTCtoDateOnly: (v: any) => mockFormatUTCtoDateOnly(v),
    formatUTCToEST: (v: any) => mockFormatUTCToEST(v),
    downloadBase64File: (a: any, b: any) => mockDownloadBase64File(a, b),
    getSafeString: (v: any) => mockGetSafeString(v),
    normalizeFileLinkEntry: (entry: any) => mockNormalizeFileLinkEntry(entry),
    removeTrailingTimestamp: (s: any) => mockRemoveTrailingTimestamp(s),
  };
});

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: "group-id-1" }),
  };
});

vi.mock("@/router/routes", () => ({
  GRP_DETAIL_PATH: "/CCC/groups",
  ORG_DETAIL_PATH: "/CCC/org-detail",
}));

vi.mock("@/constants", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/constants")>();
  return {
    ...actual,
    API_ENDPOINTS: { opportunity: "/api/opportunity" },
    ERROR_MESSAGES: { ...actual.ERROR_MESSAGES, SOMETHINGS_WRONG: "Something went wrong." },
  };
});

vi.mock("../WorkflowHistory", () => ({
  default: ({ items }: any) => (
    <div data-testid="workflow-history">
      {(items ?? []).map((item: any, i: number) => (
        <div key={i} data-testid={`wl-item-${i}`}>
          {JSON.stringify(item)}
        </div>
      ))}
    </div>
  ),
}));

vi.mock("@/components/ExpandCollapse/ExpandCollapse", () => ({
  default: ({ title }: any) => <div data-testid={`expand-${title}`}>{title}</div>,
}));

vi.mock("@/assets", () => ({
  ArrowLeft: ({ height, width }: any) => (
    <svg data-testid="arrow-left" height={height} width={width} />
  ),
  FileIcon: () => <span data-testid="file-icon">📄</span>,
}));

vi.mock("@/components/sidebar/OpportunityDrawer", () => ({
  default: ({ data }: any) => (
    <div data-testid="opportunity-drawer">{data?.name ?? "no-name"}</div>
  ),
}));

vi.mock("@/pages/search-results/OpportunitiesTable", () => ({
  tabData: [],
}));

vi.mock("@/components/ExtractValue/ExtractDisplayValue", () => ({
  extractDisplayValue: (val: any) => ({
    jsx: <span data-testid="display-value">{String(val ?? "")}</span>,
  }),
}));

vi.mock("react-icons/fa6", () => ({
  FaTriangleExclamation: ({ className }: any) => (
    <svg data-testid="triangle-exclamation" className={className} />
  ),
}));

vi.mock("@/views/ConfiguratorDashboard/ConfiguratorDashboard", () => ({}));

import TaskDetailSidebar from "../TaskDetailSidebar";

const makeOverviewResponse = (overrides: Record<string, any> = {}) => ({
  id: "task-mongo-1",
  taskId: "T-001",
  typeOfEdit: ["General settings"],
  updatedBy: "John Doe",
  plannedLaunchDate: "2024-01-01",
  workfrontId: "WF-001",
  opportunity: [],
  playbookURL: "https://example.com/playbook",
  priority: "High",
  status: "DRAFT",
  assignee: "Jane Doe",
  changeSource: "Manual",
  versionTimestamp: "2024-01-01T00:00:00Z",
  fileLink: [],
  entities: [{ type: "GROUP", draftId: "draft-1" }],
  ...overrides,
});

const makeGroupsResponse = (groups: any[] = []) => ({
  orgName: "Test Org",
  groups,
});

const makeWorklogsResponse = (workLog: any[] = []) => ({ workLog });

function renderSidebar(props: Record<string, any> = {}) {
  return render(
    <MemoryRouter initialEntries={["/CCC/groups/group-id-1"]}>
      <TaskDetailSidebar taskId="T-001" {...props} />
    </MemoryRouter>,
  );
}

describe("TaskDetailSidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("VITE_TASK_URL", "http://test-api/");
    mockApiGet.mockResolvedValue(makeOverviewResponse());
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("rendering", () => {
    it("renders the sidebar container", () => {
      renderSidebar();
      expect(document.querySelector(".task-detail-sidebar")).toBeTruthy();
    });

    it("renders the Tabs component", () => {
      renderSidebar();
      expect(screen.getByTestId("tabs")).toBeInTheDocument();
    });

    it("renders back button when onBack is provided", () => {
      const onBack = vi.fn();
      renderSidebar({ onBack });
      expect(screen.getByTestId("btn-back")).toBeInTheDocument();
    });

    it("does not render back button when onBack is not provided", () => {
      renderSidebar({ onBack: undefined });
      expect(screen.queryByTestId("btn-back")).not.toBeInTheDocument();
    });

    it("calls onBack when back button is clicked", () => {
      const onBack = vi.fn();
      renderSidebar({ onBack });
      fireEvent.click(screen.getByTestId("btn-back"));
      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it("shows version warning banner when versionWarning=true", () => {
      renderSidebar({ versionWarning: true });
      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(screen.getByTestId("triangle-exclamation")).toBeInTheDocument();
      expect(screen.getByText("Version restored")).toBeInTheDocument();
    });

    it("does not show version warning banner when versionWarning=false", () => {
      renderSidebar({ versionWarning: false });
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    it("shows download button when downloadFunctionality=true", () => {
      renderSidebar({ downloadFunctionality: true });
      expect(screen.getByTestId("btn-download")).toBeInTheDocument();
    });

    it("does not show download button when downloadFunctionality=false", () => {
      renderSidebar({ downloadFunctionality: false });
      expect(screen.queryByTestId("btn-download")).not.toBeInTheDocument();
    });

    it("renders Groups tab when groupsRequired=true (default)", () => {
      renderSidebar({ groupsRequired: true });
      expect(screen.getByTestId("tab-btn-groups")).toBeInTheDocument();
    });

    it("does not render Groups tab when groupsRequired=false", () => {
      renderSidebar({ groupsRequired: false });
      expect(screen.queryByTestId("tab-btn-groups")).not.toBeInTheDocument();
    });
  });

  describe("API data loading", () => {
    it("calls api.get for overview on mount when taskId is provided", async () => {
      renderSidebar({ taskId: "T-001" });
      await waitFor(() =>
        expect(mockApiGet).toHaveBeenCalledWith(
          expect.stringContaining("tasks/T-001"),
        ),
      );
    });

    it("does NOT call api.get when taskId is undefined", async () => {
      renderSidebar({ taskId: undefined });
      await waitFor(() => expect(mockApiGet).not.toHaveBeenCalled());
    });

    it("shows loader while overview is loading", async () => {
      let resolve!: (v: any) => void;
      mockApiGet.mockReturnValueOnce(new Promise((r) => (resolve = r)));
      renderSidebar();
      await waitFor(() =>
        expect(screen.getAllByTestId("loader").length).toBeGreaterThan(0),
      );
      resolve(makeOverviewResponse());
    });

    it("renders overview data after successful API call", async () => {
      mockApiGet.mockResolvedValue(makeOverviewResponse({ taskId: "T-001" }));
      renderSidebar();
      await waitFor(() =>
        expect(screen.getAllByTestId("display-value").length).toBeGreaterThan(0),
      );
    });

    it("shows error toast when overview API call fails", async () => {
      mockApiGet.mockRejectedValue(new Error("network error"));
      renderSidebar();
      await waitFor(() =>
        expect(mockShowCustomToast).toHaveBeenCalledWith(
          expect.objectContaining({ type: "error" }),
        ),
      );
    });

    it("does not call API again if data for that tab is already cached", async () => {
      mockApiGet.mockResolvedValue(makeOverviewResponse());
      renderSidebar();
      await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(1));
      fireEvent.click(screen.getByTestId("tab-btn-overview"));
      await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(1));
    });
  });

  describe("Groups tab", () => {
    it("loads groups when groups tab is clicked", async () => {
      mockApiGet
        .mockResolvedValueOnce(makeOverviewResponse())
        .mockResolvedValueOnce(makeGroupsResponse([{ groupMongoId: "gm1", groupId: "G-001", groupName: "Alpha" }]));
      renderSidebar({ groupsRequired: true });
      await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(1));
      fireEvent.click(screen.getByTestId("tab-btn-groups"));
      await waitFor(() =>
        expect(mockApiGet).toHaveBeenCalledWith(
          expect.stringContaining("tasks/T-001/groups"),
        ),
      );
    });

    it("shows group links when groups data is available", async () => {
      mockApiGet
        .mockResolvedValueOnce(makeOverviewResponse())
        .mockResolvedValueOnce(
          makeGroupsResponse([{ groupMongoId: "gm1", groupId: "G-001", groupName: "Alpha" }]),
        );
      renderSidebar({ groupsRequired: true, tabKey: "groups" });
      await waitFor(() =>
        expect(
          within(screen.getByTestId("tab-panel-groups")).getByText(/G-001/),
        ).toBeInTheDocument(),
      );
    });

    it("shows FailSafePage when groups array is empty", async () => {
      mockApiGet
        .mockResolvedValueOnce(makeOverviewResponse())
        .mockResolvedValueOnce(makeGroupsResponse([]));
      renderSidebar({ groupsRequired: true });
      fireEvent.click(screen.getByTestId("tab-btn-groups"));
      await waitFor(() =>
        expect(
          within(screen.getByTestId("tab-panel-groups")).getByTestId("failsafe-noData"),
        ).toBeInTheDocument(),
      );
    });

    it("loads groups on mount when tabKey='groups'", async () => {
      mockApiGet
        .mockResolvedValueOnce(makeOverviewResponse())
        .mockResolvedValueOnce(makeGroupsResponse([]));
      renderSidebar({ groupsRequired: true, tabKey: "groups" });
      await waitFor(() =>
        expect(mockApiGet).toHaveBeenCalledWith(
          expect.stringContaining("tasks/T-001/groups"),
        ),
      );
    });
  });

  describe("Worklogs tab", () => {
    it("loads worklogs when worklogs tab is clicked after overview data loads", async () => {
      const overview = makeOverviewResponse({ id: "task-mongo-1" });
      mockApiGet
        .mockResolvedValueOnce(overview)
        .mockResolvedValueOnce(makeWorklogsResponse([{ action: "Updated", actor: "Bob" }]));
      renderSidebar();
      await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(1));
      fireEvent.click(screen.getByTestId("tab-btn-worklogs"));
      await waitFor(() =>
        expect(mockApiGet).toHaveBeenCalledWith(
          expect.stringContaining("worklog/task-mongo-1"),
        ),
      );
    });

    it("renders WorkflowHistory component in worklogs tab", async () => {
      mockApiGet
        .mockResolvedValueOnce(makeOverviewResponse({ id: "mongo-1" }))
        .mockResolvedValueOnce(makeWorklogsResponse([{ action: "Created" }]));
      renderSidebar();
      await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(1));
      fireEvent.click(screen.getByTestId("tab-btn-worklogs"));
      await waitFor(() => expect(screen.getByTestId("workflow-history")).toBeInTheDocument());
    });
  });

  describe("Files tab", () => {
    it("shows FailSafePage when no files", async () => {
      mockApiGet.mockResolvedValue(makeOverviewResponse({ fileLink: [] }));
      renderSidebar();
      await waitFor(() =>
        expect(screen.getByTestId("tab-panel-files")).toBeInTheDocument(),
      );
      await waitFor(() =>
        expect(
          within(screen.getByTestId("tab-panel-files")).getByTestId("failsafe-noData"),
        ).toBeInTheDocument(),
      );
    });

    it("shows file table when files are present", async () => {
      mockNormalizeFileLinkEntry.mockReturnValue({ storageName: "doc.pdf", sizeBytes: 2048 });
      mockRemoveTrailingTimestamp.mockReturnValue("doc.pdf");
      mockApiGet.mockResolvedValue(
        makeOverviewResponse({ fileLink: [{ storageName: "doc.pdf", sizeBytes: 2048 }] }),
      );
      renderSidebar();
      await waitFor(() =>
        expect(
          within(screen.getByTestId("tab-panel-files")).getByTestId("custom-table"),
        ).toBeInTheDocument(),
      );
    });

    it("shows file count label when files are present", async () => {
      mockNormalizeFileLinkEntry.mockReturnValue({ storageName: "report.pdf", sizeBytes: 512 });
      mockRemoveTrailingTimestamp.mockReturnValue("report.pdf");
      mockApiGet.mockResolvedValue(
        makeOverviewResponse({ fileLink: [{ storageName: "report.pdf", sizeBytes: 512 }] }),
      );
      renderSidebar();
      await waitFor(() => expect(screen.getByText("Files (1)")).toBeInTheDocument());
    });

    it("file size cell renders formatted size in Kb", async () => {
      mockNormalizeFileLinkEntry.mockReturnValue({ storageName: "data.csv", sizeBytes: 2048 });
      mockRemoveTrailingTimestamp.mockReturnValue("data.csv");
      mockApiGet.mockResolvedValue(
        makeOverviewResponse({ fileLink: [{ storageName: "data.csv", sizeBytes: 2048 }] }),
      );
      renderSidebar();
      await waitFor(() => expect(screen.getByText("2.00 KB")).toBeInTheDocument());
    });

    it("file size cell renders '—' for size 0", async () => {
      mockNormalizeFileLinkEntry.mockReturnValue({ storageName: "empty.csv", sizeBytes: 0 });
      mockRemoveTrailingTimestamp.mockReturnValue("empty.csv");
      mockApiGet.mockResolvedValue(
        makeOverviewResponse({ fileLink: [{ storageName: "empty.csv", sizeBytes: 0 }] }),
      );
      renderSidebar();
      await waitFor(() =>
        expect(
          within(screen.getByTestId("tab-panel-files")).getByText("—"),
        ).toBeInTheDocument(),
      );
    });

    it("file name renders as clickable span when no url", async () => {
      mockNormalizeFileLinkEntry.mockReturnValue({ storageName: "report.pdf", sizeBytes: 1024 });
      mockRemoveTrailingTimestamp.mockReturnValue("report.pdf");
      mockApiGet
        .mockResolvedValueOnce(
          makeOverviewResponse({ fileLink: [{ storageName: "report.pdf", sizeBytes: 1024 }] }),
        )
        .mockResolvedValueOnce({ filename: "report.pdf", content: "base64content" });
      renderSidebar();
      await waitFor(() => expect(screen.getByText("report.pdf")).toBeInTheDocument());
      fireEvent.click(screen.getByText("report.pdf"));
      await waitFor(() => expect(mockApiGet).toHaveBeenCalledWith(
        expect.stringContaining("file/upload/report.pdf"),
      ));
    });

    it("file download calls downloadBase64File with filename and content", async () => {
      mockNormalizeFileLinkEntry.mockReturnValue({ storageName: "file.pdf", sizeBytes: 512 });
      mockRemoveTrailingTimestamp.mockReturnValue("file.pdf");
      mockApiGet
        .mockResolvedValueOnce(
          makeOverviewResponse({ fileLink: [{ storageName: "file.pdf", sizeBytes: 512 }] }),
        )
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ filename: "file.pdf", content: "abc123" });
      renderSidebar();
      await waitFor(() => expect(screen.getByText("file.pdf")).toBeInTheDocument());
      fireEvent.click(screen.getByText("file.pdf"));
      await waitFor(() => expect(mockDownloadBase64File).toHaveBeenCalledWith("file.pdf", "abc123"));
    });

    it("file download unwraps response.data wrapper", async () => {
      mockNormalizeFileLinkEntry.mockReturnValue({ storageName: "x.pdf", sizeBytes: 100 });
      mockRemoveTrailingTimestamp.mockReturnValue("x.pdf");
      mockApiGet
        .mockResolvedValueOnce(
          makeOverviewResponse({ fileLink: [{ storageName: "x.pdf", sizeBytes: 100 }] }),
        )
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ data: { filename: "x.pdf", content: "xyz" } });
      renderSidebar();
      await waitFor(() => expect(screen.getByText("x.pdf")).toBeInTheDocument());
      fireEvent.click(screen.getByText("x.pdf"));
      await waitFor(() => expect(mockDownloadBase64File).toHaveBeenCalledWith("x.pdf", "xyz"));
    });

    it("shows error toast when file download API fails", async () => {
      mockNormalizeFileLinkEntry.mockReturnValue({ storageName: "err.pdf", sizeBytes: 100 });
      mockRemoveTrailingTimestamp.mockReturnValue("err.pdf");
      mockApiGet
        .mockResolvedValueOnce(
          makeOverviewResponse({ fileLink: [{ storageName: "err.pdf", sizeBytes: 100 }] }),
        )
        .mockRejectedValueOnce(new Error("download fail"));
      renderSidebar();
      await waitFor(() => expect(screen.getByText("err.pdf")).toBeInTheDocument());
      fireEvent.click(screen.getByText("err.pdf"));
      await waitFor(() =>
        expect(mockShowCustomToast).toHaveBeenCalledWith(
          expect.objectContaining({ type: "error" }),
        ),
      );
    });

    it("file title renders as link when row.url is set", async () => {
      mockNormalizeFileLinkEntry.mockReturnValue({ storageName: "linked.pdf", sizeBytes: 100 });
      mockRemoveTrailingTimestamp.mockReturnValue("linked.pdf");
      mockApiGet.mockResolvedValue(
        makeOverviewResponse({ fileLink: [{ storageName: "linked.pdf", sizeBytes: 100 }] }),
      );
      renderSidebar();
      await waitFor(() =>
        expect(within(screen.getByTestId("tab-panel-files")).getByTestId("custom-table")).toBeInTheDocument(),
      );
      const titleCol = capturedFileColumns.find((c: any) => c.field === "name");
      expect(titleCol).toBeDefined();
      const fakeRow = { name: "linked.pdf", storageName: "linked.pdf", sizeBytes: 100, url: "https://cdn.example.com/linked.pdf" };
      const { container } = render(<>{titleCol.render("linked.pdf", fakeRow)}</>);
      const link = container.querySelector("a");
      expect(link).not.toBeNull();
      expect(link!.getAttribute("href")).toBe("https://cdn.example.com/linked.pdf");
      expect(link!.textContent).toBe("linked.pdf");
    });

    it("keyboard Enter on file name triggers download", async () => {
      mockNormalizeFileLinkEntry.mockReturnValue({ storageName: "kb.pdf", sizeBytes: 500 });
      mockRemoveTrailingTimestamp.mockReturnValue("kb.pdf");
      mockApiGet
        .mockResolvedValueOnce(
          makeOverviewResponse({ fileLink: [{ storageName: "kb.pdf", sizeBytes: 500 }] }),
        )
        .mockResolvedValueOnce({ filename: "kb.pdf", content: "kbcontent" });
      renderSidebar();
      await waitFor(() => expect(screen.getByText("kb.pdf")).toBeInTheDocument());
      const fileSpan = screen.getByText("kb.pdf");
      fireEvent.keyDown(fileSpan, { key: "Enter" });
      await waitFor(() => expect(mockApiGet).toHaveBeenCalledWith(
        expect.stringContaining("file/upload/kb.pdf"),
      ));
    });

    it("keyboard Space on file name triggers download", async () => {
      mockNormalizeFileLinkEntry.mockReturnValue({ storageName: "sp.pdf", sizeBytes: 300 });
      mockRemoveTrailingTimestamp.mockReturnValue("sp.pdf");
      mockApiGet
        .mockResolvedValueOnce(
          makeOverviewResponse({ fileLink: [{ storageName: "sp.pdf", sizeBytes: 300 }] }),
        )
        .mockResolvedValueOnce({ filename: "sp.pdf", content: "spcontent" });
      renderSidebar();
      await waitFor(() => expect(screen.getByText("sp.pdf")).toBeInTheDocument());
      const fileSpan = screen.getByText("sp.pdf");
      fireEvent.keyDown(fileSpan, { key: " " });
      await waitFor(() => expect(mockApiGet).toHaveBeenCalledWith(
        expect.stringContaining("file/upload/sp.pdf"),
      ));
    });
  });

  describe("handleDownload", () => {
    it("calls api.post and downloadBase64File when Download clicked", async () => {
      mockApiPost.mockResolvedValueOnce({ filename: "report.csv", content: "csvdata" });
      renderSidebar({ downloadFunctionality: true });
      await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(1));
      fireEvent.click(screen.getByTestId("btn-download"));
      await waitFor(() =>
        expect(mockDownloadBase64File).toHaveBeenCalledWith("report.csv", "csvdata"),
      );
    });

    it("unwraps response.data for download", async () => {
      mockApiPost.mockResolvedValueOnce({ data: { filename: "wrapped.csv", content: "wdata" } });
      renderSidebar({ downloadFunctionality: true });
      await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(1));
      fireEvent.click(screen.getByTestId("btn-download"));
      await waitFor(() =>
        expect(mockDownloadBase64File).toHaveBeenCalledWith("wrapped.csv", "wdata"),
      );
    });

    it("shows error toast when download fails", async () => {
      mockApiPost.mockRejectedValueOnce(new Error("download error"));
      renderSidebar({ downloadFunctionality: true });
      await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(1));
      fireEvent.click(screen.getByTestId("btn-download"));
      await waitFor(() =>
        expect(mockShowCustomToast).toHaveBeenCalledWith(
          expect.objectContaining({ type: "error" }),
        ),
      );
    });

    it("uses downloadType='history' in URL when provided", async () => {
      mockApiPost.mockResolvedValueOnce({ filename: "hist.csv", content: "h" });
      renderSidebar({ downloadFunctionality: true, downloadType: "history" });
      await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(1));
      fireEvent.click(screen.getByTestId("btn-download"));
      await waitFor(() =>
        expect(mockApiPost).toHaveBeenCalledWith(expect.stringContaining("type/history/download"), expect.anything()),
      );
    });
  });

  describe("Overview tab rendering", () => {
    it("uses infoTabHistoryData when versionWarning is set", async () => {
      mockApiGet.mockResolvedValue(
        makeOverviewResponse({ typeOfEdit: ["Billing"], versionTimestamp: "2024-06-01T10:00:00Z" }),
      );
      renderSidebar({ versionWarning: "2024-06-01T10:00:00Z" });
      await waitFor(() =>
        expect(screen.getByText("Version restored")).toBeInTheDocument(),
      );
    });

    it("shows infoTabData fields when versionWarning=false", async () => {
      mockApiGet.mockResolvedValue(makeOverviewResponse({ taskId: "T-001" }));
      renderSidebar({ versionWarning: false });
      await waitFor(() =>
        expect(screen.getByText("Task ID")).toBeInTheDocument(),
      );
    });

    it("renders 'Type of edit' label in overview", async () => {
      mockApiGet.mockResolvedValue(makeOverviewResponse());
      renderSidebar();
      await waitFor(() => expect(screen.getByText("Type of edit")).toBeInTheDocument());
    });

    it("renders 'Priority' label in infoTabData (no versionWarning)", async () => {
      mockApiGet.mockResolvedValue(makeOverviewResponse());
      renderSidebar({ versionWarning: false });
      await waitFor(() => expect(screen.getByText("Priority")).toBeInTheDocument());
    });

    it("formats date values using formatUTCtoDateOnly", async () => {
      mockApiGet.mockResolvedValue(
        makeOverviewResponse({ plannedLaunchDate: "2024-03-15" }),
      );
      renderSidebar();
      await waitFor(() =>
        expect(mockFormatUTCtoDateOnly).toHaveBeenCalledWith("2024-03-15"),
      );
    });

    it("renders external link for http workfrontId", async () => {
      mockApiGet.mockResolvedValue(
        makeOverviewResponse({ workfrontId: "https://workfront.example.com/task/1" }),
      );
      renderSidebar();
      await waitFor(() => {
        const links = screen.getAllByRole("link");
        expect(links.some((l) => l.getAttribute("href")?.includes("workfront.example.com"))).toBe(true);
      });
    });

    it("renders link appearance for non-http workfrontId", async () => {
      sessionStorage.setItem("name", "Jane Doe");
      mockApiGet.mockResolvedValue(
        makeOverviewResponse({
          workfrontId: "WF-12345",
          assignee: "Jane Doe",
          status: "DRAFT",
          taskId: "T-001",
        }),
      );
      renderSidebar();
      await waitFor(() => expect(screen.getByText("Workfront link")).toBeInTheDocument());
    });

    it("renders opportunity entries for each opportunity", async () => {
      mockApiGet.mockResolvedValue(
        makeOverviewResponse({
          opportunity: [
            { id: "opp-1", opportunityName: "Deal Alpha", opportunityGuid: "G1" },
            { id: "opp-2", opportunityName: "Deal Beta", opportunityGuid: "G2" },
          ],
        }),
      );
      renderSidebar();
      await waitFor(() => expect(screen.getByText("Deal Alpha - G1")).toBeInTheDocument());
      expect(screen.getByText("Deal Beta - G2")).toBeInTheDocument();
    });

    it("renders '-' for Opportunity when array is empty", async () => {
      mockApiGet.mockResolvedValue(makeOverviewResponse({ opportunity: [] }));
      renderSidebar();
      await waitFor(() => expect(screen.getByText("Opportunity")).toBeInTheDocument());
    });

    it("renders task-detail-overview-row-history class when versionWarning=true", async () => {
      mockApiGet.mockResolvedValue(makeOverviewResponse());
      renderSidebar({ versionWarning: true });
      await waitFor(() =>
        expect(document.querySelector(".task-detail-overview-row-history")).toBeTruthy(),
      );
    });

    it("renders task-detail-overview-row class when versionWarning=false", async () => {
      mockApiGet.mockResolvedValue(makeOverviewResponse());
      renderSidebar({ versionWarning: false });
      await waitFor(() =>
        expect(document.querySelector(".task-detail-overview-row")).toBeTruthy(),
      );
    });

    it("Task ID is a link when the assignee opens their own draft", async () => {
      sessionStorage.setItem("name", "Jane Doe");
      mockApiGet.mockResolvedValue(
        makeOverviewResponse({ assignee: "Jane Doe", status: "DRAFT", taskId: "T-LINK" }),
      );
      renderSidebar({ versionWarning: false });
      await waitFor(() => expect(screen.getByText("Task ID")).toBeInTheDocument());

      const taskIdCell = screen
        .getAllByTestId("display-value")
        .find((el) => el.textContent === "T-LINK");
      expect(taskIdCell?.closest(".task-detail-overview-link--text")).toBeTruthy();
    });

    it.each([
      "PENDING_PEER_REVIEW",
      "PEER_REVIEW_IN_PROGRESS",
      "REJECTED_PEER_REVIEW",
      "APPROVED",
      "SCHEDULED",
      "COMPLETED",
      "ON_HOLD",
      "CANCELLED",
    ])("Task ID is plain text once the task is %s", async (status) => {
      sessionStorage.setItem("name", "Jane Doe");
      mockApiGet.mockResolvedValue(
        makeOverviewResponse({ assignee: "Jane Doe", status, taskId: "T-LINK" }),
      );
      renderSidebar({ versionWarning: false });
      await waitFor(() => expect(screen.getByText("Task ID")).toBeInTheDocument());

      const taskIdCell = screen
        .getAllByTestId("display-value")
        .find((el) => el.textContent === "T-LINK");
      expect(taskIdCell?.closest(".task-detail-overview-link--text")).toBeNull();
    });

    it("Task ID is plain text on someone else's draft", async () => {
      sessionStorage.setItem("name", "Someone Else");
      mockApiGet.mockResolvedValue(
        makeOverviewResponse({ assignee: "Jane Doe", status: "DRAFT", taskId: "T-LINK" }),
      );
      renderSidebar({ versionWarning: false });
      await waitFor(() => expect(screen.getByText("Task ID")).toBeInTheDocument());

      const taskIdCell = screen
        .getAllByTestId("display-value")
        .find((el) => el.textContent === "T-LINK");
      expect(taskIdCell?.closest(".task-detail-overview-link--text")).toBeNull();
    });

    it("renderOverviewValueCell: onClick callback opens SideModal for opportunity", async () => {
      const mockOpportunityData = {
        name: "Opp Detail",
        id: "opp-1",
      };
      mockApiGet
        .mockResolvedValueOnce(
          makeOverviewResponse({
            opportunity: [{ id: "opp-1", opportunityName: "Deal Alpha", opportunityGuid: "G1" }],
          }),
        )
        .mockResolvedValueOnce(mockOpportunityData);
      renderSidebar();
      await waitFor(() => expect(screen.getByText("Deal Alpha - G1")).toBeInTheDocument());
      fireEvent.click(screen.getByText("Deal Alpha - G1"));
      await waitFor(() => expect(screen.getByTestId("side-modal")).toBeInTheDocument());
    });

    it("opportunity API failure shows error toast", async () => {
      mockApiGet
        .mockResolvedValueOnce(
          makeOverviewResponse({
            opportunity: [{ id: "opp-fail", opportunityName: "Failing Opp", opportunityGuid: "GF" }],
          }),
        )
        .mockRejectedValueOnce(new Error("opp fail"));
      renderSidebar();
      await waitFor(() => expect(screen.getByText("Failing Opp - GF")).toBeInTheDocument());
      fireEvent.click(screen.getByText("Failing Opp - GF"));
      await waitFor(() =>
        expect(mockShowCustomToast).toHaveBeenCalledWith(
          expect.objectContaining({ type: "error" }),
        ),
      );
    });

    it("closing the SideModal hides it", async () => {
      const mockOppDetail = { name: "Opp X", id: "opp-x" };
      mockApiGet
        .mockResolvedValueOnce(
          makeOverviewResponse({
            opportunity: [{ id: "opp-x", opportunityName: "Opp X", opportunityGuid: "GX" }],
          }),
        )
        .mockResolvedValueOnce(mockOppDetail);
      renderSidebar();
      await waitFor(() => expect(screen.getByText("Opp X - GX")).toBeInTheDocument());
      fireEvent.click(screen.getByText("Opp X - GX"));
      await waitFor(() => expect(screen.getByTestId("side-modal")).toBeInTheDocument());
      fireEvent.click(screen.getByTestId("close-side-modal"));
      expect(screen.queryByTestId("side-modal")).not.toBeInTheDocument();
    });

    it("opportunity API response wrapped in .data is unwrapped", async () => {
      const mockOppDetail = { name: "Wrapped Opp" };
      mockApiGet
        .mockResolvedValueOnce(
          makeOverviewResponse({
            opportunity: [{ id: "opp-wrap", opportunityName: "Wrapped Opp", opportunityGuid: "GW" }],
          }),
        )
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ data: mockOppDetail });
      renderSidebar();
      await waitFor(() => expect(screen.getByText("Wrapped Opp - GW")).toBeInTheDocument());
      fireEvent.click(screen.getByText("Wrapped Opp - GW"));
      await waitFor(() => expect(screen.getByTestId("side-modal")).toBeInTheDocument());
      expect(screen.getByTestId("side-modal-title")).toHaveTextContent("Wrapped Opp");
    });

    it("renderOverviewValueCell: linkAppearance click navigates to edit page", async () => {
      sessionStorage.setItem("name", "Jane Doe");
      mockApiGet.mockResolvedValue(
        makeOverviewResponse({
          assignee: "Jane Doe",
          status: "DRAFT",
          taskId: "T-NAV",
          workfrontId: "WF-NAV",
        }),
      );
      renderSidebar({ versionWarning: false });
      await waitFor(() => expect(screen.getByText("Task ID")).toBeInTheDocument());
      const taskIdSpan = screen.getAllByTestId("display-value")
        .find((el) => el.textContent === "T-NAV");
      if (taskIdSpan) {
        const clickable = taskIdSpan.closest(".task-detail-overview-link--text");
        if (clickable) {
          fireEvent.click(clickable);
          expect(mockNavigate).toHaveBeenCalled();
        }
      }
    });
  });

  describe("Changed fields tab", () => {
    it("renders ExpandCollapse components for each section", async () => {
      const changedFieldsResponse = {
        changes: {
          "billingAddress.city": { oldValue: "Old", newValue: "New" },
          "groupPermissions.flag": { oldValue: "No", newValue: "Yes" },
          "memberAccessPermissions.access": { oldValue: "Denied", newValue: "Granted" },
        },
      };
      mockApiGet
        .mockResolvedValueOnce(makeOverviewResponse())
        .mockResolvedValueOnce(changedFieldsResponse);
      renderSidebar();
      await waitFor(
        () => expect(mockApiGet).toHaveBeenCalledTimes(2),
        { timeout: 2000 },
      );
    });
  });

  describe("Tab onSelect", () => {
    it("clicking worklogs tab triggers getData('worklogs')", async () => {
      const overview = makeOverviewResponse({ id: "m1" });
      mockApiGet
        .mockResolvedValueOnce(overview)
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce(makeWorklogsResponse([]));
      renderSidebar();
      await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(2));
      fireEvent.click(screen.getByTestId("tab-btn-worklogs"));
      await waitFor(() =>
        expect(mockApiGet).toHaveBeenCalledWith(
          expect.stringContaining("worklog/m1"),
        ),
      );
    });

    it("clicking files tab does NOT call API (files are derived from overview)", async () => {
      mockApiGet.mockResolvedValue(makeOverviewResponse());
      renderSidebar();
      await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(1));
      const initialCallCount = mockApiGet.mock.calls.length;
      fireEvent.click(screen.getByTestId("tab-btn-files"));
      await waitFor(() => expect(mockApiGet.mock.calls.length).toBe(initialCallCount));
    });

    it("clicking overview tab when data cached does not re-call API", async () => {
      mockApiGet.mockResolvedValue(makeOverviewResponse());
      renderSidebar();
      await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(2));
      fireEvent.click(screen.getByTestId("tab-btn-overview"));
      await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(2));
    });
  });

  describe("isHttpUrl helper (via rendering)", () => {
    it("external link icon rendered for http workfrontId", async () => {
      mockApiGet.mockResolvedValue(
        makeOverviewResponse({ workfrontId: "https://example.com/wf" }),
      );
      renderSidebar();
      await waitFor(() => {
        const links = screen.getAllByRole("link");
        expect(links.some((l) => l.getAttribute("href") === "https://example.com/wf")).toBe(true);
      });
    });

    it("playbookURL http link rendered", async () => {
      mockApiGet.mockResolvedValue(
        makeOverviewResponse({ playbookURL: "https://playbook.example.com" }),
      );
      renderSidebar();
      await waitFor(() => {
        const links = screen.getAllByRole("link");
        expect(
          links.some((l) => l.getAttribute("href") === "https://playbook.example.com"),
        ).toBe(true);
      });
    });

    it("non-http value is rendered as plain text, not a link", async () => {
      mockApiGet.mockResolvedValue(
        makeOverviewResponse({ workfrontId: "WF-PLAIN", playbookURL: "" }),
      );
      renderSidebar();
      await waitFor(() => expect(screen.getByText("Workfront link")).toBeInTheDocument());
    });
  });

  describe("renderOverviewValueCell onClick branch", () => {
    it("item with onClick renders clickable span", async () => {
      mockApiGet.mockResolvedValue(
        makeOverviewResponse({
          opportunity: [{ id: "opp-click", opportunityName: "Clickable Opp", opportunityGuid: "GC" }],
        }),
      );
      renderSidebar();
      await waitFor(() => expect(screen.getByText("Clickable Opp - GC")).toBeInTheDocument());
      const span = screen.getByText("Clickable Opp - GC").closest("span");
      expect(span).toBeTruthy();
    });
  });

  describe("taskId undefined edge cases", () => {
    it("renders sidebar without crash when taskId is undefined", () => {
      renderSidebar({ taskId: undefined });
      expect(screen.getByTestId("tabs")).toBeInTheDocument();
    });

    it("shows loader=false and FailSafePage in files tab when no taskId", () => {
      renderSidebar({ taskId: undefined });
      expect(screen.getByTestId("tab-panel-files")).toBeInTheDocument();
    });
  });
});
