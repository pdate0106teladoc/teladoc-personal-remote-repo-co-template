import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import Files from "../TaskFileList";

const { mockShowCustomToast, mockDownloadFile } = vi.hoisted(() => ({
  mockShowCustomToast: vi.fn(),
  mockDownloadFile: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useParams: () => ({ candidateId: "task-123" }),
}));

vi.mock("@/api/apiService", () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock("@/utils", () => ({
  downloadFile: (...args: any[]) => mockDownloadFile(...args),
  normalizeFileLinkEntry: (entry: any) => {
    if (typeof entry === "string") {
      const [storageName, size] = entry.split(":");
      return { storageName, sizeBytes: Number(size) || 0 };
    }
    return { storageName: entry.name ?? "", sizeBytes: entry.sizeBytes ?? 0 };
  },
  removeTrailingTimestamp: (name: string) => {
    if (!name) return name;
    const lastDot = name.lastIndexOf(".");
    if (lastDot === -1) return name.replace(/_\d{14}$/, "");
    const stem = name.slice(0, lastDot).replace(/_\d{14}$/, "");
    return `${stem}.${name.slice(lastDot + 1)}`;
  },
}));

vi.mock("../../../styles/Files.scss", () => ({}));

vi.mock("@ucc/common-ui", () => ({
  CustomTable: ({ data, columns }: any) => (
    <div data-testid="custom-table">
      {data.map((row: any, i: number) => (
        <div key={i} data-testid={`row-${i}`}>
          {columns.map((col: any) => (
            <div key={col.field}>{col.render ? col.render(row[col.field], row) : row[col.field]}</div>
          ))}
        </div>
      ))}
    </div>
  ),
  Loader: ({ text }: { text: string }) => <div data-testid="loader">{text}</div>,
  FailSafePage: ({ cardType }: { cardType: string }) => (
    <div data-testid="failsafe-page">{cardType}</div>
  ),
  showCustomToast: (opts: any) => mockShowCustomToast(opts),
  ToastType: { Error: "error" },
  ERROR_MESSAGES: { SOMETHINGS_WRONG: "Something went wrong." },
}));

import api from "@/api/apiService";

const mockApi = api.get as ReturnType<typeof vi.fn>;

describe("Files", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loader while fetching", () => {
    mockApi.mockReturnValue(new Promise(() => {}));
    render(<Files />);
    expect(screen.getByTestId("loader")).toBeInTheDocument();
    expect(screen.getByText("Loading files...")).toBeInTheDocument();
  });

  it("renders the table when files are returned", async () => {
    mockApi.mockResolvedValue({
      id: "task-123",
      taskId: "t1",
      entities: [],
      typeOfEdit: [],
      plannedLaunchDate: "",
      workfrontId: "",
      opportunity: [],
      playbookURL: "",
      updatedBy: "",
      fileLink: ["report_20240101120000.pdf:2048"],
    });

    render(<Files />);

    await waitFor(() => {
      expect(screen.getByTestId("custom-table")).toBeInTheDocument();
    });
  });

  it("renders FailSafePage when no files are returned", async () => {
    mockApi.mockResolvedValue({
      id: "task-123",
      taskId: "t1",
      entities: [],
      typeOfEdit: [],
      plannedLaunchDate: "",
      workfrontId: "",
      opportunity: [],
      playbookURL: "",
      updatedBy: "",
      fileLink: [],
    });

    render(<Files />);

    await waitFor(() => {
      expect(screen.getByTestId("failsafe-page")).toBeInTheDocument();
      expect(screen.getByText("noData")).toBeInTheDocument();
    });
  });

  it("renders FailSafePage when fileLink is missing", async () => {
    mockApi.mockResolvedValue({
      id: "task-123",
      taskId: "t1",
      entities: [],
      typeOfEdit: [],
      plannedLaunchDate: "",
      workfrontId: "",
      opportunity: [],
      playbookURL: "",
      updatedBy: "",
    });

    render(<Files />);

    await waitFor(() => {
      expect(screen.getByTestId("failsafe-page")).toBeInTheDocument();
    });
  });

  it("shows error toast when fetch fails", async () => {
    mockApi.mockRejectedValue(new Error("Network error"));

    render(<Files />);

    await waitFor(() => {
      expect(mockShowCustomToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: "error", title: "Failed" })
      );
    });
    expect(screen.getByTestId("failsafe-page")).toBeInTheDocument();
  });

  it("removes trailing timestamp from display name", async () => {
    mockApi.mockResolvedValue({
      id: "task-123",
      fileLink: ["myfile_20240601123456.csv:512"],
    });

    render(<Files />);

    await waitFor(() => {
      expect(screen.getByText("myfile.csv")).toBeInTheDocument();
    });
  });

  it("formats file size in Kb", async () => {
    mockApi.mockResolvedValue({
      id: "task-123",
      fileLink: ["data.pdf:2048"],
    });

    render(<Files />);

    await waitFor(() => {
      expect(screen.getByText("2.00 Kb")).toBeInTheDocument();
    });
  });

  it("renders '—' when file size is 0", async () => {
    mockApi.mockResolvedValue({
      id: "task-123",
      fileLink: ["data.pdf:0"],
    });

    render(<Files />);

    await waitFor(() => {
      expect(screen.getByText("—")).toBeInTheDocument();
    });
  });

  it("calls download API and triggers downloadFile on click", async () => {
    mockApi
      .mockResolvedValueOnce({
        id: "task-123",
        fileLink: ["report.pdf:1024"],
      })
      .mockResolvedValueOnce({
        data: {
          content: btoa("file-content"),
          filename: "report.pdf",
        },
      });

    render(<Files />);

    await waitFor(() => {
      expect(screen.getByText("report.pdf")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("report.pdf"));

    await waitFor(() => {
      expect(mockDownloadFile).toHaveBeenCalledWith("report.pdf", "file-content", "pdf");
    });
  });

  it("shows error toast when download fails", async () => {
    mockApi
      .mockResolvedValueOnce({
        id: "task-123",
        fileLink: ["report.pdf:1024"],
      })
      .mockRejectedValueOnce(new Error("Download error"));

    render(<Files />);

    await waitFor(() => {
      expect(screen.getByText("report.pdf")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("report.pdf"));

    await waitFor(() => {
      expect(mockShowCustomToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: "error", title: "Failed" })
      );
    });
  });

  it("triggers download on Enter key press", async () => {
    mockApi
      .mockResolvedValueOnce({
        id: "task-123",
        fileLink: ["doc.xlsx:4096"],
      })
      .mockResolvedValueOnce({
        data: {
          content: btoa("xlsx-content"),
          filename: "doc.xlsx",
        },
      });

    render(<Files />);

    await waitFor(() => {
      expect(screen.getByText("doc.xlsx")).toBeInTheDocument();
    });

    fireEvent.keyDown(screen.getByText("doc.xlsx"), { key: "Enter" });

    await waitFor(() => {
      expect(mockDownloadFile).toHaveBeenCalledWith("doc.xlsx", "xlsx-content", "xlsx");
    });
  });

  it("triggers download on Space key press", async () => {
    mockApi
      .mockResolvedValueOnce({
        id: "task-123",
        fileLink: ["doc.xlsx:4096"],
      })
      .mockResolvedValueOnce({
        data: {
          content: btoa("xlsx-content"),
          filename: "doc.xlsx",
        },
      });

    render(<Files />);

    await waitFor(() => {
      expect(screen.getByText("doc.xlsx")).toBeInTheDocument();
    });

    fireEvent.keyDown(screen.getByText("doc.xlsx"), { key: " " });

    await waitFor(() => {
      expect(mockDownloadFile).toHaveBeenCalled();
    });
  });

  it("does not trigger download on other key press", async () => {
    mockApi.mockResolvedValue({
      id: "task-123",
      fileLink: ["doc.xlsx:4096"],
    });

    render(<Files />);

    await waitFor(() => {
      expect(screen.getByText("doc.xlsx")).toBeInTheDocument();
    });

    fireEvent.keyDown(screen.getByText("doc.xlsx"), { key: "Tab" });
    expect(mockDownloadFile).not.toHaveBeenCalled();
  });

  it("filters out entries with empty storageName", async () => {
    mockApi.mockResolvedValue({
      id: "task-123",
      fileLink: ["valid.pdf:512", ""],
    });

    render(<Files />);

    await waitFor(() => {
      expect(screen.getByTestId("custom-table")).toBeInTheDocument();
    });

    const rows = screen.queryAllByTestId(/^row-/);
    expect(rows).toHaveLength(1);
  });
});
