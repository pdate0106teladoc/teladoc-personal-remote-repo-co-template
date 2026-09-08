import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CompareRestoreSidebar from "../CompareRestoreSidebar";

vi.mock("../CompareRestoreSidebar.scss", () => ({}));

const mockGet = vi.fn();
vi.mock("@/api/apiService", () => ({
  default: { get: (...args: any[]) => mockGet(...args) },
}));

vi.mock("@ucc/common-ui", () => ({
  Button: ({ children, onClick, variant }: any) => (
    <button onClick={onClick} data-variant={variant}>
      {children}
    </button>
  ),
  CustomTable: ({ data, columns }: any) => (
    <table data-testid="custom-table">
      <tbody>
        {data?.map((row: any, i: number) => (
          <tr key={i}>
            {columns.map((col: any, j: number) => (
              <td key={j}>{row[col.field]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
  Loader: ({ text }: any) => <div data-testid="loader">{text}</div>,
  showCustomToast: vi.fn(),
  ToastType: { Error: "error" },
}));

vi.mock("@/constants", () => ({
  API_ENDPOINTS: { diffLibrary: "client-configurations/diff" },
  ERROR_MESSAGES: { SOMETHINGS_WRONG: "Something went wrong" },
}));

vi.mock("@/components/ExpandCollapse/ExpandCollapse", () => ({
  default: ({ title, data, defaultExpanded }: any) => (
    <div data-testid={`expand-${title}`} data-expanded={defaultExpanded}>
      <span>{title}</span>
      <span data-testid={`rows-${title}`}>{data?.length} rows</span>
    </div>
  ),
}));


vi.mock("@/components/Modal/RestoreConfirmationModal", () => ({
  default: ({ show, handleClose, onRestoreSuccess, selectedRow }: any) =>
    show ? (
      <div data-testid="restore-modal">
        <span data-testid="modal-row">{selectedRow?.versionMongoId}</span>
        <button data-testid="modal-close" onClick={handleClose}>
          Close
        </button>
        <button data-testid="modal-confirm" onClick={onRestoreSuccess}>
          Confirm Restore
        </button>
      </div>
    ) : null,
}));

vi.mock("@/components/RoundedLabel/RoundedLabel", () => ({
  default: ({ text, variant }: any) => (
    <span data-testid={`label-${text}`} data-variant={variant}>
      {text}
    </span>
  ),
}));

vi.mock("@/data/fieldLabelRegistry", () => ({
  transformChangesToSections: (response: any) => {
    if (!response?.changes)
      return { sections: [], arrayChangeSections: [], errors: [], unmappedKeys: [] };
    const sections = Object.entries(response.changes)
      .filter(([_, v]: any) => !v.modified)
      .map(([key, val]: any) => ({
        title: key,
        rows: [{ field: key, previousValue: val.oldValue, updatedValue: val.newValue }],
      }));
    const arrayChangeSections = Object.entries(response.changes)
      .filter(([_, v]: any) => v.modified)
      .map(([key, val]: any) => ({
        tabLabel: key,
        items: (val.modified ?? []).map((m: any) => ({
          id: m.id?.[0] ?? "Unknown",
          rows: Object.entries(m.changes ?? {}).map(([f, c]: any) => ({
            field: f,
            previousValue: c.oldValue,
            updatedValue: c.newValue,
          })),
        })),
      }));
    return { sections, arrayChangeSections, errors: [], unmappedKeys: [] };
  },
}));

describe("CompareRestoreSidebar", () => {
  const defaultProps = {
    entityType: "ORGANIZATION" as const,
    onCancel: vi.fn(),
    onRestoreSuccess: vi.fn(),
    selectedRow: {
      versionMongoId: "mongo-123",
      versionTimestamp: "2024-01-15T10:00:00Z",
      draftId: "draft-1",
    } as any,
  };

  const mockChangesResponse = {
    changes: {
      "General Settings": { oldValue: "Old Name", newValue: "New Name" },
      Billing: { oldValue: "Net 30", newValue: "Net 60" },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    import.meta.env.VITE_TASK_URL = "http://task.test/";
    mockGet.mockResolvedValue(mockChangesResponse);
  });

  it("shows loader while fetching changed fields", () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    render(<CompareRestoreSidebar {...defaultProps} />);
    expect(screen.getByTestId("loader")).toBeInTheDocument();
  });

  it("fetches diff using selectedRow draftId and entityType", async () => {
    render(<CompareRestoreSidebar {...defaultProps} />);

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(
        "http://task.test/client-configurations/diff?draftId=draft-1&entityType=ORGANIZATION",
      );
    });
  });

  it("renders ExpandCollapse sections for each changed field group", async () => {
    render(<CompareRestoreSidebar {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("expand-General Settings")).toBeInTheDocument();
      expect(screen.getByTestId("expand-Billing")).toBeInTheDocument();
    });
  });

  it("renders sections with defaultExpanded=true", async () => {
    render(<CompareRestoreSidebar {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("expand-General Settings")).toHaveAttribute(
        "data-expanded",
        "true",
      );
    });
  });

  it("shows 'No changes to display.' when API returns empty", async () => {
    mockGet.mockResolvedValueOnce({});
    render(<CompareRestoreSidebar {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("No changes to display.")).toBeInTheDocument();
    });
  });

  it("shows 'No changes to display.' when selectedRow has no draftId", () => {
    render(
      <CompareRestoreSidebar
        {...defaultProps}
        selectedRow={{ ...defaultProps.selectedRow, draftId: "" }}
      />,
    );
    expect(screen.getByText("No changes to display.")).toBeInTheDocument();
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("renders Cancel and Restore buttons", async () => {
    render(<CompareRestoreSidebar {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("Cancel")).toBeInTheDocument();
      expect(screen.getByText("Restore")).toBeInTheDocument();
    });
  });

  it("Cancel button calls onCancel", async () => {
    const onCancel = vi.fn();
    render(<CompareRestoreSidebar {...defaultProps} onCancel={onCancel} />);

    await waitFor(() => {
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalled();
  });

  it("Restore button opens RestoreConfirmationModal", async () => {
    render(<CompareRestoreSidebar {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("Restore")).toBeInTheDocument();
    });

    expect(screen.queryByTestId("restore-modal")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Restore"));

    expect(screen.getByTestId("restore-modal")).toBeInTheDocument();
  });

  it("RestoreConfirmationModal receives selectedRow", async () => {
    render(<CompareRestoreSidebar {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("Restore")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Restore"));

    expect(screen.getByTestId("modal-row")).toHaveTextContent("mongo-123");
  });

  it("closing modal hides it", async () => {
    render(<CompareRestoreSidebar {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("Restore")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Restore"));
    expect(screen.getByTestId("restore-modal")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("modal-close"));
    expect(screen.queryByTestId("restore-modal")).not.toBeInTheDocument();
  });

  it("successful restore calls onRestoreSuccess and onCancel", async () => {
    const onRestoreSuccess = vi.fn();
    const onCancel = vi.fn();
    render(
      <CompareRestoreSidebar
        {...defaultProps}
        onRestoreSuccess={onRestoreSuccess}
        onCancel={onCancel}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Restore")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Restore"));
    fireEvent.click(screen.getByTestId("modal-confirm"));

    expect(onRestoreSuccess).toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalled();
  });

  it("renders array change sections with RoundedLabel and CustomTable", async () => {
    mockGet.mockResolvedValueOnce({
      changes: {
        accountRelationships: {
          modified: [
            {
              id: ["ACC-001"],
              changes: {
                startDate: { oldValue: "2024-01-01", newValue: "2025-01-01" },
              },
            },
          ],
        },
      },
    });

    render(<CompareRestoreSidebar {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("label-accountRelationships")).toBeInTheDocument();
      expect(screen.getByText("ACC-001")).toBeInTheDocument();
      expect(screen.getByTestId("custom-table")).toBeInTheDocument();
    });
  });

  it("renders multiple array items", async () => {
    mockGet.mockResolvedValueOnce({
      changes: {
        relationships: {
          modified: [
            { id: ["REL-1"], changes: { field1: { oldValue: "a", newValue: "b" } } },
            { id: ["REL-2"], changes: { field2: { oldValue: "c", newValue: "d" } } },
          ],
        },
      },
    });

    render(<CompareRestoreSidebar {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("REL-1")).toBeInTheDocument();
      expect(screen.getByText("REL-2")).toBeInTheDocument();
    });
  });

  it("renders wrapper with compare-restore-sidebar class", async () => {
    const { container } = render(<CompareRestoreSidebar {...defaultProps} />);
    await waitFor(() => {
      expect(container.querySelector(".compare-restore-sidebar")).toBeInTheDocument();
    });
  });

  it("does not crash when onCancel is undefined", async () => {
    render(<CompareRestoreSidebar {...defaultProps} onCancel={undefined} />);
    await waitFor(() => {
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Cancel"));
  });

  it("does not crash when onRestoreSuccess is undefined", async () => {
    render(<CompareRestoreSidebar {...defaultProps} onRestoreSuccess={undefined} />);
    await waitFor(() => {
      expect(screen.getByText("Restore")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Restore"));
    fireEvent.click(screen.getByTestId("modal-confirm"));
  });
});
