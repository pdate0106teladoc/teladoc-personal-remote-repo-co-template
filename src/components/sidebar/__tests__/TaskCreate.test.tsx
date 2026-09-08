import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EditConfig from "../TaskCreate";

vi.mock("../TaskCreate.scss", () => ({}));

vi.mock("react-router-dom", () => ({
  useParams: () => ({ id: "entity-123" }),
}));

vi.mock("react-bootstrap", () => ({
  OverlayTrigger: ({ children }: any) => <>{children}</>,
}));

const mockGet = vi.fn();
const mockPost = vi.fn();
vi.mock("@/api/apiService", () => ({
  default: {
    get: (...args: any[]) => mockGet(...args),
    post: (...args: any[]) => mockPost(...args),
  },
}));

const mockShowCustomToast = vi.fn();
vi.mock("@ucc/common-ui", () => ({
  Loader: ({ text }: any) => <div data-testid="loader">{text}</div>,
  WarningIcon: () => <span data-testid="warning-icon" />,
  showCustomToast: (...args: any[]) => mockShowCustomToast(...args),
  MultiSelectDropdown: ({ label, onChange }: any) => (
    <div data-testid="multi-dropdown">
      <label>{label}</label>
      <button
        data-testid="multi-dropdown-select"
        onClick={() => onChange(["General"])}
      >
        Select
      </button>
    </div>
  ),
  Button: ({ children, onClick, disabled, variant }: any) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant}>
      {children}
    </button>
  ),
  DatePicker: ({ onChange, label }: any) => (
    <div data-testid="date-picker">
      <label>{label}</label>
      <input
        data-testid="date-input"
        type="date"
        onChange={(e) => onChange(new Date(e.target.value))}
      />
    </div>
  ),
  DropdownWithIcon: ({ label, onChange, value, onError }: any) => (
    <div data-testid="priority-dropdown">
      <label>{label}</label>
      <select
        data-testid="priority-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select</option>
        <option value="NORMAL">Normal</option>
        <option value="HIGH">High</option>
      </select>
      {onError && <span data-testid="priority-error">Required</span>}
    </div>
  ),
  CustomInput: ({ label, value, onChange }: any) => (
    <div>
      <label>{label}</label>
      <input data-testid={`input-${label}`} value={value} onChange={onChange} />
    </div>
  ),
  CustomRadioToggle: ({ onChange }: any) => (
    <div data-testid="radio-toggle">
      <button data-testid="radio-today" onClick={() => onChange("today")}>
        Today
      </button>
      <button data-testid="radio-later" onClick={() => onChange("later")}>
        Later
      </button>
    </div>
  ),
  renderTooltip: () => <div />,
  MultiSelectSearch: ({ label }: any) => (
    <div data-testid="opportunity-search">{label}</div>
  ),
  InfoIcon: () => <span />,
}));

vi.mock("../FileUpload/FileUpload", () => ({
  default: ({ onUpload }: any) => (
    <div data-testid="file-upload">
      <button onClick={() => onUpload(["file1.pdf"])}>Upload</button>
    </div>
  ),
}));

vi.mock("@/assets", () => ({
  InfoGreyIcon: ({ className }: any) => <span className={className} />,
}));

vi.mock("@/constants", () => ({
  LABELS: {
    editConfig: {
      CANCEL: "Cancel",
      START_EDITING: "Start editing",
      SCHEDULE_FOR_LATER_TOOLTIP: "Tooltip text",
      PLANNED_LAUNCH_DATE_TOOLTIP: "Date tooltip",
    },
  },
  MODAL_MSSG: {
    ENTER_EDIT_MODE: "You are about to enter edit mode.",
    PLEASE_SET_PRIORITY_AND_CHOOSE_LAUNCH_DATE: "Please set the priority.",
    ORG_BEING_EDITED: "This org is being edited by others.",
    GRP_BEING_EDITED: "This group is being edited by others.",
    OVERLAPPING_CHANGES_WARNING: "Please limit overlapping changes.",
  },
  ERROR_MESSAGES: { SOMETHINGS_WRONG: "Something's wrong." },
  ToastType: { Success: "success", Error: "error" },
}));

vi.mock("@/types/edit", () => ({}));

describe("EditConfig (TaskCreate)", () => {
  const defaultProps = {
    setOpen: vi.fn(),
    onClose: vi.fn(),
    entity: "organization" as const,
    pendingChanges: [] as any[],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    import.meta.env.VITE_SEARCH_BASE_URL = "http://search.test/";
    import.meta.env.VITE_TASK_URL = "http://task.test/";
    import.meta.env.VITE_EDIT_URL = "http://edit.test/";
    mockGet.mockResolvedValue({
      editTypes: [
        { id: "1", label: "General", active: true, displayOrder: 1 },
        { id: "2", label: "Billing", active: true, displayOrder: 2 },
      ],
    });
  });

  it("renders form fields", () => {
    render(<EditConfig {...defaultProps} />);

    expect(screen.getByText("You are about to enter edit mode.")).toBeInTheDocument();
    expect(screen.getByTestId("priority-dropdown")).toBeInTheDocument();
    expect(screen.getByTestId("multi-dropdown")).toBeInTheDocument();
    expect(screen.getByTestId("radio-toggle")).toBeInTheDocument();
  });

  it("fetches edit types on mount", async () => {
    render(<EditConfig {...defaultProps} />);

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(
        "http://task.test/client-configurations/ORGANIZATION/edit-types",
      );
    });
  });

  it("shows warning box when pendingChanges is not empty", () => {
    const pending = [{ taskId: "T-1", updatedBy: "John" }] as any;
    render(<EditConfig {...defaultProps} pendingChanges={pending} />);

    expect(screen.getByText("This org is being edited by others.")).toBeInTheDocument();
  });

  it("shows group-specific message for group entity", () => {
    const pending = [{ taskId: "T-1", updatedBy: "Jane" }] as any;
    render(<EditConfig {...defaultProps} entity="group" pendingChanges={pending} />);

    expect(screen.getByText("This group is being edited by others.")).toBeInTheDocument();
  });

  it("Cancel button calls setOpen(false)", () => {
    const setOpen = vi.fn();
    render(<EditConfig {...defaultProps} setOpen={setOpen} />);

    fireEvent.click(screen.getByText("Cancel"));
    expect(setOpen).toHaveBeenCalledWith(false);
  });

  it("Start editing button is disabled when priority and launch date are missing", () => {
    render(<EditConfig {...defaultProps} />);

    const startBtn = screen.getByText("Start editing");
    expect(startBtn).toBeDisabled();
  });

  it("successful submit calls api.post and shows success toast", async () => {
    mockPost.mockResolvedValueOnce({ taskId: "T-new", workflowTaskId: "WF-1" });
    render(<EditConfig {...defaultProps} />);

    const prioritySelect = screen.getByTestId("priority-select");
    fireEvent.change(prioritySelect, { target: { value: "NORMAL" } });

    fireEvent.click(screen.getByTestId("radio-today"));

    await waitFor(() => {
      expect(screen.getByText("Start editing")).not.toBeDisabled();
    });

    fireEvent.click(screen.getByText("Start editing"));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalled();
    });

    expect(mockShowCustomToast).toHaveBeenCalledWith(
      expect.objectContaining({ type: "success" }),
    );
  });

  it("failed submit shows error toast", async () => {
    mockPost.mockRejectedValueOnce(new Error("fail"));
    render(<EditConfig {...defaultProps} />);

    const prioritySelect = screen.getByTestId("priority-select");
    fireEvent.change(prioritySelect, { target: { value: "HIGH" } });

    fireEvent.click(screen.getByTestId("radio-today"));

    await waitFor(() => {
      expect(screen.getByText("Start editing")).not.toBeDisabled();
    });

    fireEvent.click(screen.getByText("Start editing"));

    await waitFor(() => {
      expect(mockShowCustomToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: "error" }),
      );
    });
  });
});
