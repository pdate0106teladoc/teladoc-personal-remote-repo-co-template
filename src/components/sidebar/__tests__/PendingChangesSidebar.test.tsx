import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PendingChangesSidebar from "../PendingChangesSidebar";

vi.mock("../PendingChangesSidebar.scss", () => ({}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({ id: "org-123" }),
}));

vi.mock("@ucc/common-ui", () => ({
  DatePicker: ({ value, onChange, label }: any) => (
    <div data-testid="date-picker">
      <label>{label}</label>
      <input
        data-testid="date-input"
        type="date"
        value={value || ""}
        onChange={(e) => onChange(e.target.value ? new Date(e.target.value) : null)}
      />
    </div>
  ),
  FailSafePage: ({ cardType }: any) => <div data-testid={`failsafe-${cardType}`} />,
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
  ),
  Loader: ({ text }: any) => <div data-testid="loader">{text}</div>,
  CustomTable: ({ data }: any) => <div data-testid="custom-table">{data?.length}</div>,
  showCustomToast: vi.fn(),
}));

vi.mock("@/components/ExtractValue/ExtractDisplayValue", () => ({
  extractDisplayValue: (val: any) => ({ jsx: <span>{val}</span> }),
  DisplayType: {},
}));

vi.mock("../TaskDetailSidebar", () => ({
  default: ({ taskId, onBack }: any) => (
    <div data-testid="task-detail-sidebar">
      <span>Task: {taskId}</span>
      <button data-testid="back-btn" onClick={onBack}>Back</button>
    </div>
  ),
}));

vi.mock("@/assets", () => ({
  ClearIcon: () => <span data-testid="clear-icon" />,
  OpenIcon: () => <span data-testid="open-icon" />,
  RightArrow: () => <span data-testid="right-arrow" />,
  ArrowLeft: () => <span data-testid="arrow-left" />,
  FileIcon: () => <span data-testid="file-icon" />,
  SuccessIcon: () => <span />,
  InfoGreyIcon: () => <span />,
}));

vi.mock("@/utils", () => ({
  formatToMMDDYYYY: (v: any) => v ? "06/15/2025" : "",
  formatUTCtoDateOnly: (v: any) => v ?? "-",
}));

const mockTasks = [
  {
    taskId: "T-001",
    typeOfChange: ["General", "Billing"],
    priority: "High",
    updatedBy: "John Doe",
    plannedLaunchDate: "2025-06-15T00:00:00Z",
  },
  {
    taskId: "T-002",
    typeOfChange: ["Marketing"],
    priority: "Normal",
    updatedBy: "Jane Smith",
    plannedLaunchDate: "2025-06-20T00:00:00Z",
  },
];

describe("PendingChangesSidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("renders task cards from data", () => {
    render(<PendingChangesSidebar data={mockTasks as any} />);

    expect(screen.getByText("T-001")).toBeInTheDocument();
    expect(screen.getByText("T-002")).toBeInTheDocument();
  });

  it("renders task info fields", () => {
    render(<PendingChangesSidebar data={mockTasks as any} />);

    expect(screen.getAllByText("Task ID")).toHaveLength(2);
    expect(screen.getAllByText("Type of edit")).toHaveLength(2);
    expect(screen.getAllByText("Priority")).toHaveLength(2);
    expect(screen.getAllByText("Updated by")).toHaveLength(2);
    expect(screen.getAllByText("Planned launch date").length).toBeGreaterThanOrEqual(2);
  });

  it("renders View details links for each task", () => {
    render(<PendingChangesSidebar data={mockTasks as any} />);

    const viewDetailsLinks = screen.getAllByText("View details");
    expect(viewDetailsLinks).toHaveLength(2);
  });

  it("shows FailSafePage when data is empty", () => {
    render(<PendingChangesSidebar data={[]} />);
    expect(screen.getByTestId("failsafe-noData")).toBeInTheDocument();
  });

  it("shows FailSafePage when data is undefined", () => {
    render(<PendingChangesSidebar />);
    expect(screen.getByTestId("failsafe-noData")).toBeInTheDocument();
  });

  it("renders date picker filter", () => {
    render(<PendingChangesSidebar data={mockTasks as any} />);
    expect(screen.getByTestId("date-picker")).toBeInTheDocument();
    expect(screen.getByTestId("date-input")).toBeInTheDocument();
  });

  it("shows Clear filters button when date is selected", () => {
    render(<PendingChangesSidebar data={mockTasks as any} />);

    fireEvent.change(screen.getByTestId("date-input"), {
      target: { value: "2025-06-15" },
    });

    expect(screen.getByText("Clear filters")).toBeInTheDocument();
  });

  it("Clear filters resets date and shows all tasks", () => {
    render(<PendingChangesSidebar data={mockTasks as any} />);

    fireEvent.change(screen.getByTestId("date-input"), {
      target: { value: "2025-06-15" },
    });

    fireEvent.click(screen.getByText("Clear filters"));

    expect(screen.getByText("T-001")).toBeInTheDocument();
    expect(screen.getByText("T-002")).toBeInTheDocument();
  });

  it("View details opens TaskDetailSidebar for selected task", () => {
    render(<PendingChangesSidebar data={mockTasks as any} />);

    const viewDetailsLinks = screen.getAllByText("View details");
    fireEvent.click(viewDetailsLinks[0]);

    expect(screen.getByTestId("task-detail-sidebar")).toBeInTheDocument();
    expect(screen.getByText("Task: T-001")).toBeInTheDocument();
  });

  it("Back from TaskDetailSidebar returns to list", () => {
    render(<PendingChangesSidebar data={mockTasks as any} />);

    fireEvent.click(screen.getAllByText("View details")[0]);
    expect(screen.getByTestId("task-detail-sidebar")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("back-btn"));

    expect(screen.queryByTestId("task-detail-sidebar")).not.toBeInTheDocument();
    expect(screen.getByText("T-001")).toBeInTheDocument();
  });

  describe("Task ID link", () => {
    const draftTask = {
      taskId: "T-DRAFT",
      typeOfChange: ["General"],
      priority: "High",
      updatedBy: "John Doe",
      currentStatus: "DRAFT",
      plannedLaunchDate: "2025-06-15T00:00:00Z",
    };

    const linkFor = (taskId: string) =>
      screen.getByText(taskId).closest(".task-detail-overview-link--text");

    it("links the Task ID for the owner of a draft", () => {
      sessionStorage.setItem("name", "John Doe");
      render(<PendingChangesSidebar data={[draftTask] as any} />);

      expect(linkFor("T-DRAFT")).toBeTruthy();
    });

    it.each(["PENDING_PEER_REVIEW", "APPROVED", "SCHEDULED", "COMPLETED", "ON_HOLD", "CANCELLED"])(
      "leaves the Task ID as plain text when the task is %s",
      (currentStatus) => {
        sessionStorage.setItem("name", "John Doe");
        render(
          <PendingChangesSidebar data={[{ ...draftTask, currentStatus }] as any} />,
        );

        expect(linkFor("T-DRAFT")).toBeNull();
      },
    );

    it("leaves the Task ID as plain text for someone else's draft", () => {
      sessionStorage.setItem("name", "Jane Smith");
      render(<PendingChangesSidebar data={[draftTask] as any} />);

      expect(linkFor("T-DRAFT")).toBeNull();
    });
  });
});
