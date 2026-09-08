import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ConfirmationForm from "../ConfirmationForm";

vi.mock("../SubmitUpdateForm.scss", () => ({}));

const mockGet = vi.fn();
vi.mock("@/api/apiService", () => ({
  default: { get: (...args: any[]) => mockGet(...args) },
}));

vi.mock("@ucc/common-ui", () => ({
  CustomCheckbox: ({ checked, onChange }: any) => (
    <input
      data-testid="confirm-checkbox"
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
  ),
  CustomTable: ({ data }: any) => (
    <table data-testid="custom-table">
      <tbody>
        {data?.map((row: any, i: number) => (
          <tr key={i}>
            <td>{row.field}</td>
            <td>{row.previousValue}</td>
            <td>{row.updatedValue}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
  Loader: ({ text }: any) => <div data-testid="loader">{text}</div>,
}));

vi.mock("@/components/ExpandCollapse/ExpandCollapse", () => ({
  default: ({ title, data }: any) => (
    <div data-testid={`expand-${title}`}>
      {title} ({data?.length ?? 0} rows)
    </div>
  ),
}));

vi.mock("@/components/RoundedLabel/RoundedLabel", () => ({
  default: ({ text }: any) => <span data-testid="rounded-label">{text}</span>,
}));

vi.mock("@/data/fieldLabelRegistry", () => ({
  transformChangesToSections: (data: any) => {
    if (!data?.changes) return { sections: [], arrayChangeSections: [] };
    return {
      sections: [
        { title: "General Settings", rows: [{ field: "Name", previousValue: "Old", updatedValue: "New" }] },
      ],
      arrayChangeSections: [],
    };
  },
}));

vi.mock("@/utils", () => ({
  formatUTCtoDateOnly: (v: any) => v ?? "-",
}));

vi.mock("@/constants", () => ({
  API_ENDPOINTS: { diffLibrary: "client-configurations/diff" },
  MODAL_MSSG: {
    CONFIRM_SUBMIT: "By confirming, your updates will be submitted.",
    CONFIRM_UPDATE: "Confirm the updates on ",
  },
}));

describe("ConfirmationForm", () => {
  const defaultProps = {
    confirmed: false,
    onConfirmedChange: vi.fn(),
    taskDetails: {
      taskId: "T-001",
      plannedLaunchDate: "2025-06-15T00:00:00Z",
      entities: [{ type: "ORGANIZATION", draftId: "draft-1" }],
    } as any,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    import.meta.env.VITE_TASK_URL = "http://task.test/";
  });

  it("shows loader while fetching changed fields", () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    render(<ConfirmationForm {...defaultProps} />);
    expect(screen.getByTestId("loader")).toBeInTheDocument();
  });

  it("fetches changed fields when taskDetails has entities", async () => {
    mockGet.mockResolvedValueOnce({ changes: { "field.a": { oldValue: "x", newValue: "y" } } });
    render(<ConfirmationForm {...defaultProps} />);

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(
        "http://task.test/client-configurations/diff?draftId=draft-1&entityType=ORGANIZATION",
      );
    });
  });

  it("renders changed fields sections after fetch", async () => {
    mockGet.mockResolvedValueOnce({ changes: { "field.a": { oldValue: "x", newValue: "y" } } });
    render(<ConfirmationForm {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("expand-General Settings")).toBeInTheDocument();
    });
  });

  it("shows 'No changes to display' when API returns empty", async () => {
    mockGet.mockResolvedValueOnce({});
    render(<ConfirmationForm {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("No changes to display.")).toBeInTheDocument();
    });
  });

  it("shows 'No changes to display' when fetch fails", async () => {
    mockGet.mockRejectedValueOnce(new Error("fail"));
    render(<ConfirmationForm {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("No changes to display.")).toBeInTheDocument();
    });
  });

  it("does not fetch when taskDetails has no entities", () => {
    render(
      <ConfirmationForm
        {...defaultProps}
        taskDetails={{ taskId: "T-001", entities: [] } as any}
      />,
    );
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("renders confirmation text with planned launch date", async () => {
    mockGet.mockResolvedValueOnce({});
    render(<ConfirmationForm {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("By confirming, your updates will be submitted.")).toBeInTheDocument();
    });
    expect(screen.getByText(/Confirm the updates on/)).toBeInTheDocument();
  });

  it("renders checkbox with confirmed state", async () => {
    mockGet.mockResolvedValueOnce({});
    render(<ConfirmationForm {...defaultProps} confirmed={true} />);

    await waitFor(() => {
      expect(screen.getByTestId("confirm-checkbox")).toBeChecked();
    });
  });

  it("calls onConfirmedChange when checkbox clicked", async () => {
    mockGet.mockResolvedValueOnce({});
    const onConfirmedChange = vi.fn();
    render(<ConfirmationForm {...defaultProps} onConfirmedChange={onConfirmedChange} />);

    await waitFor(() => {
      expect(screen.getByTestId("confirm-checkbox")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("confirm-checkbox"));
    expect(onConfirmedChange).toHaveBeenCalledWith(true);
  });

  it("uses GROUP entityType when entity type is group", async () => {
    mockGet.mockResolvedValueOnce({});
    render(
      <ConfirmationForm
        {...defaultProps}
        taskDetails={{
          ...defaultProps.taskDetails,
          entities: [{ type: "group", draftId: "draft-grp" }],
        }}
      />,
    );

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining("entityType=GROUP"),
      );
    });
  });
});
