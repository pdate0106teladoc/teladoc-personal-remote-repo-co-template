import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SubmitSettingForm from "../SubmitSettingForm";

vi.mock("../SubmitUpdateForm.scss", () => ({}));

vi.mock("react-router-dom", () => ({
  useParams: () => ({ candidateId: "candidate-123" }),
  useLocation: () => ({ pathname: "/CCC/org-detail/org-1/edit/candidate-123" }),
}));

const mockGet = vi.fn();
const mockPatch = vi.fn();
vi.mock("@/api/apiService", () => ({
  default: {
    get: (...args: any[]) => mockGet(...args),
    patch: (...args: any[]) => mockPatch(...args),
  },
}));

const mockShowCustomToast = vi.fn();
vi.mock("@ucc/common-ui", () => ({
  CustomInput: ({ label, value, onChange, placeholder }: any) => (
    <div>
      <label>{label}</label>
      <input
        data-testid={`input-${label}`}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  ),
  MultiSelectDropdown: ({ label, onChange }: any) => (
    <div data-testid="multi-dropdown">
      <label>{label}</label>
      <button data-testid="multi-dropdown-btn" onClick={() => onChange(["General"])}>
        Select
      </button>
    </div>
  ),
  MultiSelectSearch: ({ label }: any) => (
    <div data-testid="multi-search">{label}</div>
  ),
  Button: ({ children, onClick, disabled, className }: any) => (
    <button onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  ),
  DatePicker: ({ onChange, value }: any) => (
    <input
      data-testid="date-picker"
      type="date"
      value={value || ""}
      onChange={(e) => onChange(new Date(e.target.value))}
    />
  ),
  DropdownWithIcon: ({ label, onChange, value }: any) => (
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
        <option value="URGENT">Urgent</option>
      </select>
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
  showCustomToast: (...args: any[]) => mockShowCustomToast(...args),
  ToastType: { Success: "success", Error: "error" },
}));

vi.mock("../FileUpload/FileUpload", () => ({
  default: ({ onUpload }: any) => (
    <div data-testid="file-upload">
      <button onClick={() => onUpload(["file1.pdf"])}>Upload</button>
    </div>
  ),
}));

vi.mock("@/assets", () => ({
  SuccessIcon: () => <span data-testid="success-icon" />,
}));

vi.mock("@/constants", () => ({
  ERROR_MESSAGES: { SOMETHINGS_WRONG: "Something went wrong." },
  MODAL_MSSG: { PROGRESS_SAVED: "Your progress has been saved." },
  ToastType: { Success: "success", Error: "error" },
}));

vi.mock("@/utils", () => ({
  fileLinkItemsToEncodedStrings: (links: any) => links ?? [],
  isDateInPast: () => false,
  isValidURL: (url: string) => {
    if (!url.trim()) return true;
    const urlPattern =
      /^https:\/\/([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
    return urlPattern.test(url.trim());
  },
  parseFileLinkEntry: (entry: string) => ({ storageName: entry, sizeBytes: 0 }),
}));

describe("SubmitSettingForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    import.meta.env.VITE_TASK_URL = "http://task.test/";
    import.meta.env.VITE_SEARCH_BASE_URL = "http://search.test/";
    mockGet.mockImplementation((url: string) => {
      if (url.includes("/tasks/candidate-123")) {
        return Promise.resolve({
          taskId: "T-001",
          priority: "High",
          plannedLaunchDate: "2025-06-01T00:00:00Z",
          workfrontId: "WF-123",
          opportunity: [],
          playbookURL: "",
          typeOfEdit: ["General"],
          fileLink: [],
          entities: [{ type: "ORGANIZATION", draftId: "draft-1" }],
        });
      }
      if (url.includes("edit-types")) {
        return Promise.resolve({
          editTypes: [
            { id: "1", label: "General", active: true, displayOrder: 1 },
            { id: "2", label: "Billing", active: true, displayOrder: 2 },
          ],
        });
      }
      return Promise.resolve({});
    });
  });

  it("renders the form with info box", async () => {
    render(<SubmitSettingForm />);
    await waitFor(() => {
      expect(screen.getByText("Your progress has been saved.")).toBeInTheDocument();
    });
  });

  it("fetches task details on mount", async () => {
    render(<SubmitSettingForm />);
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(
        "http://task.test/client-configurations/tasks/candidate-123",
      );
    });
  });

  it("displays task ID from fetched data", async () => {
    render(<SubmitSettingForm />);
    await waitFor(() => {
      expect(screen.getByText("T-001")).toBeInTheDocument();
    });
  });

  it("renders priority dropdown", async () => {
    render(<SubmitSettingForm />);
    await waitFor(() => {
      expect(screen.getByTestId("priority-dropdown")).toBeInTheDocument();
    });
  });

  it("renders radio toggle for launch option", () => {
    render(<SubmitSettingForm />);
    expect(screen.getByTestId("radio-toggle")).toBeInTheDocument();
  });

  it("shows Continue button when no changes", async () => {
    render(<SubmitSettingForm />);
    await waitFor(() => {
      expect(screen.getByText("Continue")).toBeInTheDocument();
    });
  });

  it("calls onContinue when Continue clicked with no changes", async () => {
    const onContinue = vi.fn();
    render(<SubmitSettingForm onContinue={onContinue} />);
    await waitFor(() => {
      expect(screen.getByText("Continue")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Continue"));
    expect(onContinue).toHaveBeenCalled();
  });

  it("shows Update button when priority changes", async () => {
    render(<SubmitSettingForm />);
    await waitFor(() => {
      expect(screen.getByTestId("priority-select")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId("priority-select"), {
      target: { value: "URGENT" },
    });

    expect(screen.getByText("Update")).toBeInTheDocument();
  });

  it("calls api.patch when Update is clicked", async () => {
    mockPatch.mockResolvedValueOnce({
      taskId: "T-001",
      priority: "Urgent",
      plannedLaunchDate: "2025-06-01T00:00:00Z",
      workfrontId: "WF-123",
      opportunity: [],
      playbookURL: "",
      typeOfEdit: ["General"],
      fileLink: [],
    });
    render(<SubmitSettingForm />);

    await waitFor(() => {
      expect(screen.getByText("T-001")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining("edit-types"),
      );
    });

    fireEvent.change(screen.getByTestId("priority-select"), {
      target: { value: "URGENT" },
    });

    fireEvent.click(screen.getByText("Update"));

    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith(
        "http://task.test/client-configurations/tasks/candidate-123",
        expect.objectContaining({ priority: "URGENT" }),
      );
    });
  });

  it("shows success toast on successful update", async () => {
    mockPatch.mockResolvedValueOnce({
      taskId: "T-001",
      priority: "Urgent",
      plannedLaunchDate: "2025-06-01T00:00:00Z",
      opportunity: [],
      fileLink: [],
    });
    render(<SubmitSettingForm />);
    await waitFor(() => {
      expect(screen.getByTestId("priority-select")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId("priority-select"), {
      target: { value: "URGENT" },
    });
    fireEvent.click(screen.getByText("Update"));

    await waitFor(() => {
      expect(mockShowCustomToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: "success", title: "Success" }),
      );
    });
  });

  it("shows error toast on failed update", async () => {
    mockPatch.mockRejectedValueOnce(new Error("fail"));
    render(<SubmitSettingForm />);
    await waitFor(() => {
      expect(screen.getByTestId("priority-select")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId("priority-select"), {
      target: { value: "URGENT" },
    });
    fireEvent.click(screen.getByText("Update"));

    await waitFor(() => {
      expect(mockShowCustomToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: "error" }),
      );
    });
  });

  it("shows error toast when task details fetch fails", async () => {
    mockGet.mockRejectedValue(new Error("network error"));
    render(<SubmitSettingForm />);

    await waitFor(() => {
      expect(mockShowCustomToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: "error", title: "Failed" }),
      );
    });
  });

  it("calls onTaskDetailsChange with fetched details", async () => {
    const onTaskDetailsChange = vi.fn();
    render(<SubmitSettingForm onTaskDetailsChange={onTaskDetailsChange} />);

    await waitFor(() => {
      expect(onTaskDetailsChange).toHaveBeenCalledWith(
        expect.objectContaining({ taskId: "T-001" }),
      );
    });
  });

  it("shows error message when playbook URL is invalid", async () => {
    render(<SubmitSettingForm />);
    await waitFor(() => {
      expect(screen.getByText("T-001")).toBeInTheDocument();
    });

    fireEvent.change(
      screen.getByTestId("input-Playbook link (if applicable)"),
      { target: { value: "not-a-valid-url" } },
    );

    fireEvent.click(screen.getByText("Update"));

    await waitFor(() => {
      expect(screen.getByText("Please enter a valid URL")).toBeInTheDocument();
    });
    expect(mockPatch).not.toHaveBeenCalled();
  });

  it("does not show error for a valid playbook URL", async () => {
    mockPatch.mockResolvedValueOnce({
      taskId: "T-001",
      priority: "High",
      plannedLaunchDate: "2025-06-01T00:00:00Z",
      opportunity: [],
      playbookURL: "https://example.com/playbook",
      typeOfEdit: ["General"],
      fileLink: [],
    });
    render(<SubmitSettingForm />);
    await waitFor(() => {
      expect(screen.getByTestId("priority-select")).toBeInTheDocument();
    });

    fireEvent.change(
      screen.getByTestId("input-Playbook link (if applicable)"),
      { target: { value: "https://example.com/playbook" } },
    );

    fireEvent.click(screen.getByText("Update"));

    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalled();
    });
    expect(screen.queryByText("Please enter a valid URL")).not.toBeInTheDocument();
  });

  it("clears playbook error when user types again", async () => {
    render(<SubmitSettingForm />);
    await waitFor(() => {
      expect(screen.getByText("T-001")).toBeInTheDocument();
    });

    const playbookInput = screen.getByTestId(
      "input-Playbook link (if applicable)",
    );

    fireEvent.change(playbookInput, { target: { value: "bad-url" } });
    fireEvent.click(screen.getByText("Update"));

    await waitFor(() => {
      expect(screen.getByText("Please enter a valid URL")).toBeInTheDocument();
    });

    fireEvent.change(playbookInput, {
      target: { value: "https://valid.com/path" },
    });

    expect(screen.queryByText("Please enter a valid URL")).not.toBeInTheDocument();
  });

  it("allows submission when playbook URL is empty", async () => {
    render(<SubmitSettingForm />);
    await waitFor(() => {
      expect(screen.getByTestId("priority-select")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId("priority-select"), {
      target: { value: "URGENT" },
    });

    mockPatch.mockResolvedValueOnce({
      taskId: "T-001",
      priority: "Urgent",
      plannedLaunchDate: "2025-06-01T00:00:00Z",
      opportunity: [],
      playbookURL: "",
      typeOfEdit: ["General"],
      fileLink: [],
    });

    fireEvent.click(screen.getByText("Update"));

    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalled();
    });
    expect(screen.queryByText("Please enter a valid URL")).not.toBeInTheDocument();
  });
});
