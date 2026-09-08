import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EditFiles from "../EditFiles";

vi.mock("../EditFiles.scss", () => ({}));

vi.mock("react-router-dom", () => ({
  useParams: () => ({ candidateId: "candidate-123" }),
}));

const mockGet = vi.fn();
vi.mock("@/api/apiService", () => ({
  default: { get: (...args: any[]) => mockGet(...args) },
}));

const mockShowCustomToast = vi.fn();
vi.mock("@ucc/common-ui", () => ({
  CustomTable: ({ data, columns }: any) => (
    <table data-testid="custom-table">
      <tbody>
        {data.map((row: any, i: number) => (
          <tr key={i}>
            {columns.map((col: any, j: number) => (
              <td key={j} data-testid={`cell-${col.field}-${i}`}>
                {col.render ? col.render(row[col.field], row) : row[col.field]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
  Loader: ({ text }: any) => <div data-testid="loader">{text}</div>,
  FailSafePage: ({ cardType }: any) => <div data-testid={`failsafe-${cardType}`} />,
  showCustomToast: (...args: any[]) => mockShowCustomToast(...args),
  ToastType: { Success: "success", Error: "error" },
  ERROR_MESSAGES: { SOMETHINGS_WRONG: "Something went wrong." },
}));

const mockDownloadFile = vi.fn();
vi.mock("@/utils", () => ({
  downloadFile: (...args: any[]) => mockDownloadFile(...args),
  formatFileSize: (bytes: number) => {
    if (!bytes || bytes <= 0) return "—";
    return `${(bytes / 1024).toFixed(2)} KB`;
  },
  normalizeFileLinkEntry: (entry: any) => {
    if (typeof entry === "string") {
      const lastColon = entry.lastIndexOf(":");
      if (lastColon > -1 && /^\d+$/.test(entry.slice(lastColon + 1))) {
        return { storageName: entry.slice(0, lastColon), sizeBytes: Number(entry.slice(lastColon + 1)) };
      }
      return { storageName: entry, sizeBytes: 0 };
    }
    if (entry?.name) return { storageName: entry.name, sizeBytes: entry.sizeBytes ?? 0 };
    return { storageName: "", sizeBytes: 0 };
  },
  removeTrailingTimestamp: (name: string) => name?.replace(/_\d{14}(?=\.)/, "") ?? name,
}));

describe("EditFiles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    import.meta.env.VITE_TASK_URL = "http://task.test/";
  });

  it("shows loader while fetching", () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    render(<EditFiles />);
    expect(screen.getByTestId("loader")).toBeInTheDocument();
    expect(screen.getByText("Loading files...")).toBeInTheDocument();
  });

  it("fetches task details on mount using candidateId", async () => {
    mockGet.mockResolvedValueOnce({ fileLink: [] });
    render(<EditFiles />);

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(
        "http://task.test/client-configurations/tasks/candidate-123",
      );
    });
  });

  it("shows FailSafePage when no files are returned", async () => {
    mockGet.mockResolvedValueOnce({ fileLink: [] });
    render(<EditFiles />);

    await waitFor(() => {
      expect(screen.getByTestId("failsafe-noData")).toBeInTheDocument();
    });
  });

  it("renders file table when files are present", async () => {
    mockGet.mockResolvedValueOnce({
      fileLink: ["report.pdf:2048", "data.csv:1024"],
    });
    render(<EditFiles />);

    await waitFor(() => {
      expect(screen.getByTestId("custom-table")).toBeInTheDocument();
    });
    expect(screen.getByText("report.pdf")).toBeInTheDocument();
    expect(screen.getByText("data.csv")).toBeInTheDocument();
  });

  it("renders file sizes formatted", async () => {
    mockGet.mockResolvedValueOnce({
      fileLink: ["doc.pdf:4096"],
    });
    render(<EditFiles />);

    await waitFor(() => {
      expect(screen.getByText("4.00 KB")).toBeInTheDocument();
    });
  });

  it("clicking file name triggers download", async () => {
    mockGet
      .mockResolvedValueOnce({ fileLink: ["report.pdf:2048"] })
      .mockResolvedValueOnce({ content: btoa("file content"), filename: "report.pdf" });

    render(<EditFiles />);

    await waitFor(() => {
      expect(screen.getByText("report.pdf")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("report.pdf"));

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(
        "http://task.test/client-configurations/file/upload/report.pdf",
      );
    });
    expect(mockDownloadFile).toHaveBeenCalledWith("report.pdf", "file content", "pdf");
  });

  it("keyboard Enter on file name triggers download", async () => {
    mockGet
      .mockResolvedValueOnce({ fileLink: ["doc.xlsx:1024"] })
      .mockResolvedValueOnce({ content: btoa("xlsx data"), filename: "doc.xlsx" });

    render(<EditFiles />);

    await waitFor(() => {
      expect(screen.getByText("doc.xlsx")).toBeInTheDocument();
    });

    fireEvent.keyDown(screen.getByText("doc.xlsx"), { key: "Enter" });

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining("file/upload/doc.xlsx"),
      );
    });
  });

  it("shows error toast when download fails", async () => {
    mockGet
      .mockResolvedValueOnce({ fileLink: ["fail.pdf:100"] })
      .mockRejectedValueOnce(new Error("download error"));

    render(<EditFiles />);

    await waitFor(() => {
      expect(screen.getByText("fail.pdf")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("fail.pdf"));

    await waitFor(() => {
      expect(mockShowCustomToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: "error", title: "Failed" }),
      );
    });
  });

  it("shows error toast when task details fetch fails", async () => {
    mockGet.mockRejectedValueOnce(new Error("network error"));
    render(<EditFiles />);

    await waitFor(() => {
      expect(mockShowCustomToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error",
          message: "Failed to load task files. Please try again.",
        }),
      );
    });
  });

  it("shows FailSafePage after fetch failure", async () => {
    mockGet.mockRejectedValueOnce(new Error("fail"));
    render(<EditFiles />);

    await waitFor(() => {
      expect(screen.getByTestId("failsafe-noData")).toBeInTheDocument();
    });
  });

  it("handles fileLink as non-array gracefully", async () => {
    mockGet.mockResolvedValueOnce({ fileLink: null });
    render(<EditFiles />);

    await waitFor(() => {
      expect(screen.getByTestId("failsafe-noData")).toBeInTheDocument();
    });
  });

  it("filters out entries with empty storageName", async () => {
    mockGet.mockResolvedValueOnce({
      fileLink: ["valid.pdf:100", { name: "" }],
    });
    render(<EditFiles />);

    await waitFor(() => {
      expect(screen.getByText("valid.pdf")).toBeInTheDocument();
    });
    const table = screen.getByTestId("custom-table");
    const rows = table.querySelectorAll("tr");
    expect(rows).toHaveLength(1);
  });

  it("handles response wrapped in .data for download", async () => {
    mockGet
      .mockResolvedValueOnce({ fileLink: ["wrap.csv:50"] })
      .mockResolvedValueOnce({ data: { content: btoa("csv data"), filename: "wrap.csv" } });

    render(<EditFiles />);

    await waitFor(() => {
      expect(screen.getByText("wrap.csv")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("wrap.csv"));

    await waitFor(() => {
      expect(mockDownloadFile).toHaveBeenCalledWith("wrap.csv", "csv data", "csv");
    });
  });
});
