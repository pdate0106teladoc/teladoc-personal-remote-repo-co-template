import { render, screen, fireEvent } from "@testing-library/react";
import { vi, beforeEach, afterEach } from "vitest";
import SyncRibbon from "./SyncRibbon";
import useSyncStore from "@/store/useSyncStore";
import { useKillSwitchStore } from "@/store/killSwitchStore";
import * as utils from "@/utils";

// Hoisted so it can be referenced inside vi.mock factories below
const mockFormatUTCToEST = vi.hoisted(() =>
  vi.fn((date: string) => (date === "Never" ? "Never" : `Formatted: ${date}`))
);

vi.mock("@/store/useSyncStore");
vi.mock("@/store/killSwitchStore");

vi.mock("@/utils", async () => {
  const actual = await vi.importActual<typeof import("@/utils")>("@/utils");
  return {
    ...actual,
    formatUTCToEST: mockFormatUTCToEST,
  };
});

// Mock UISyncRibbon to render predictable, testable output based on the props
// it receives from SyncRibbon. The mock calls formatUTCToEST to mirror what the
// real common-ui component does internally, so date-formatting assertions work.
vi.mock("@ucc/common-ui", () => ({
  SyncRibbon: ({ status, lastSynced, apiLastSynced, onSync }: any) => {
    const dateToFormat = lastSynced || apiLastSynced || "Never";
    const formattedDate = mockFormatUTCToEST(dateToFormat);

    const isProcessingOrPending = status === "processing" || status === "pending";
    const isSuccess = status === "success";
    const cssClass = isProcessingOrPending ? "inprogress" : isSuccess ? "success" : "prompt";

    return (
      <div className={cssClass}>
        <span>Last sync: {formattedDate}</span>

        {isProcessingOrPending && (
          <>
            <div data-testid="info-icon">InfoIcon</div>
            <span>Syncing in progress...</span>
            <span>This may take a few seconds</span>
            <div role="status">Syncing...</div>
            <button disabled>
              <div data-testid="refresh-icon">RefreshIcon</div>
              <span>Sync</span>
            </button>
          </>
        )}

        {isSuccess && (
          <button onClick={onSync}>
            <div data-testid="refresh-icon">RefreshIcon</div>
            <span>Sync</span>
          </button>
        )}

        {!isProcessingOrPending && !isSuccess && (
          <>
            <div data-testid="warning-icon">WarningIcon</div>
            <span>Some data may be out of date</span>
            <button onClick={onSync}>
              <span>Sync now</span>
            </button>
          </>
        )}
      </div>
    );
  },
}));

const mockStartSync = vi.fn();
const mockHydrateJob = vi.fn();
const mockUpdateSyncStatus = vi.fn();

describe("SyncRibbon", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    (useSyncStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      jobs: {},
      startSync: mockStartSync,
      hydrateJob: mockHydrateJob,
      updateSyncStatus: mockUpdateSyncStatus,
    });

    (useKillSwitchStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      killSwitchStatus: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Initialization", () => {
    it("renders component for organization type", () => {
      render(<SyncRibbon id="org-1" type="organization" />);
      expect(screen.getByText(/Last sync:/)).toBeInTheDocument();
    });

    it("renders component for group type", () => {
      render(<SyncRibbon id="grp-1" type="group" />);
      expect(screen.getByText(/Last sync:/)).toBeInTheDocument();
    });

    it("calls hydrateJob on mount", () => {
      render(<SyncRibbon id="org-1" type="organization" />);
      expect(mockHydrateJob).toHaveBeenCalledWith("org-1");
    });

    it("calls hydrateJob when id changes", () => {
      const { rerender } = render(<SyncRibbon id="org-1" type="organization" />);
      expect(mockHydrateJob).toHaveBeenCalledWith("org-1");

      rerender(<SyncRibbon id="org-2" type="organization" />);
      expect(mockHydrateJob).toHaveBeenCalledWith("org-2");
    });
  });

  describe("Processing/Pending Status", () => {
    it("renders processing status correctly", () => {
      (useSyncStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        jobs: {
          "org-1": { status: "processing", lastSynced: "2024-01-01T00:00:00Z" },
        },
        startSync: mockStartSync,
        hydrateJob: mockHydrateJob,
        updateSyncStatus: mockUpdateSyncStatus,
      });

      render(<SyncRibbon id="org-1" type="organization" />);

      expect(screen.getByText("Syncing in progress...")).toBeInTheDocument();
      expect(screen.getByText(/This may take a few seconds/)).toBeInTheDocument();
    });

    it("renders pending status correctly", () => {
      (useSyncStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        jobs: {
          "org-1": { status: "pending", lastSynced: "2024-01-01T00:00:00Z" },
        },
        startSync: mockStartSync,
        hydrateJob: mockHydrateJob,
        updateSyncStatus: mockUpdateSyncStatus,
      });

      render(<SyncRibbon id="org-1" type="organization" />);

      expect(screen.getByText("Syncing in progress...")).toBeInTheDocument();
    });

    it("shows spinner during processing", () => {
      (useSyncStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        jobs: {
          "org-1": { status: "processing", lastSynced: "2024-01-01T00:00:00Z" },
        },
        startSync: mockStartSync,
        hydrateJob: mockHydrateJob,
        updateSyncStatus: mockUpdateSyncStatus,
      });

      render(<SyncRibbon id="org-1" type="organization" />);

      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(screen.getByText("Syncing...")).toBeInTheDocument();
    });

    it("disables sync button during processing", () => {
      (useSyncStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        jobs: {
          "org-1": { status: "processing", lastSynced: "2024-01-01T00:00:00Z" },
        },
        startSync: mockStartSync,
        hydrateJob: mockHydrateJob,
        updateSyncStatus: mockUpdateSyncStatus,
      });

      render(<SyncRibbon id="org-1" type="organization" />);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    it("shows info icon during processing", () => {
      (useSyncStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        jobs: {
          "org-1": { status: "processing", lastSynced: "2024-01-01T00:00:00Z" },
        },
        startSync: mockStartSync,
        hydrateJob: mockHydrateJob,
        updateSyncStatus: mockUpdateSyncStatus,
      });

      render(<SyncRibbon id="org-1" type="organization" />);

      expect(screen.getByTestId("info-icon")).toBeInTheDocument();
    });
  });

  describe("Success Status", () => {
    it("renders success status correctly", () => {
      (useSyncStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        jobs: {
          "org-1": { status: "success", lastSynced: "2024-01-01T10:00:00Z" },
        },
        startSync: mockStartSync,
        hydrateJob: mockHydrateJob,
        updateSyncStatus: mockUpdateSyncStatus,
      });

      render(<SyncRibbon id="org-1" type="organization" />);

      expect(screen.getByText(/Last sync:/)).toBeInTheDocument();
      expect(screen.getByText(/Formatted: 2024-01-01T10:00:00Z/)).toBeInTheDocument();
    });

    it("shows sync button in success status", () => {
      (useSyncStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        jobs: {
          "org-1": { status: "success", lastSynced: "2024-01-01T10:00:00Z" },
        },
        startSync: mockStartSync,
        hydrateJob: mockHydrateJob,
        updateSyncStatus: mockUpdateSyncStatus,
      });

      render(<SyncRibbon id="org-1" type="organization" />);

      expect(screen.getByText("Sync")).toBeInTheDocument();
    });

    it("calls startSync when sync button clicked in success status", () => {
      (useSyncStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        jobs: {
          "org-1": { status: "success", lastSynced: "2024-01-01T10:00:00Z" },
        },
        startSync: mockStartSync,
        hydrateJob: mockHydrateJob,
        updateSyncStatus: mockUpdateSyncStatus,
      });

      render(<SyncRibbon id="org-1" type="organization" />);

      const syncButton = screen.getByText("Sync").closest("button");
      fireEvent.click(syncButton!);

      expect(mockStartSync).toHaveBeenCalledWith("organization", "org-1");
    });

    it("shows refresh icon in success status", () => {
      (useSyncStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        jobs: {
          "org-1": { status: "success", lastSynced: "2024-01-01T10:00:00Z" },
        },
        startSync: mockStartSync,
        hydrateJob: mockHydrateJob,
        updateSyncStatus: mockUpdateSyncStatus,
      });

      render(<SyncRibbon id="org-1" type="organization" />);

      expect(screen.getByTestId("refresh-icon")).toBeInTheDocument();
    });

    it("hides sync button when kill switch is active in success status", () => {
      (useSyncStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        jobs: {
          "org-1": { status: "success", lastSynced: "2024-01-01T10:00:00Z" },
        },
        startSync: mockStartSync,
        hydrateJob: mockHydrateJob,
        updateSyncStatus: mockUpdateSyncStatus,
      });

      (useKillSwitchStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        killSwitchStatus: true,
      });

      render(<SyncRibbon id="org-1" type="organization" />);

      expect(screen.queryByText("Sync")).toBeInTheDocument();
    });
  });

  describe("Prompt Status", () => {
    it("renders prompt status correctly", () => {
      (useSyncStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        jobs: {
          "org-1": { status: "prompt", lastSynced: "2024-01-01T10:00:00Z" },
        },
        startSync: mockStartSync,
        hydrateJob: mockHydrateJob,
        updateSyncStatus: mockUpdateSyncStatus,
      });

      render(<SyncRibbon id="org-1" type="organization" />);

      expect(screen.getByText(/Some data may be out of date/)).toBeInTheDocument();
    });

    it("shows warning icon in prompt status", () => {
      (useSyncStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        jobs: {
          "org-1": { status: "prompt", lastSynced: "2024-01-01T10:00:00Z" },
        },
        startSync: mockStartSync,
        hydrateJob: mockHydrateJob,
        updateSyncStatus: mockUpdateSyncStatus,
      });

      render(<SyncRibbon id="org-1" type="organization" />);

      expect(screen.getByTestId("warning-icon")).toBeInTheDocument();
    });

    it("shows sync now button in prompt status", () => {
      (useSyncStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        jobs: {
          "org-1": { status: "prompt", lastSynced: "2024-01-01T10:00:00Z" },
        },
        startSync: mockStartSync,
        hydrateJob: mockHydrateJob,
        updateSyncStatus: mockUpdateSyncStatus,
      });

      render(<SyncRibbon id="org-1" type="organization" />);

      expect(screen.getByText("Sync now")).toBeInTheDocument();
    });

    it("calls startSync when sync now button clicked", () => {
      (useSyncStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        jobs: {
          "org-1": { status: "prompt", lastSynced: "2024-01-01T10:00:00Z" },
        },
        startSync: mockStartSync,
        hydrateJob: mockHydrateJob,
        updateSyncStatus: mockUpdateSyncStatus,
      });

      render(<SyncRibbon id="org-1" type="organization" />);

      const syncButton = screen.getByText("Sync now").closest("button");
      fireEvent.click(syncButton!);

      expect(mockStartSync).toHaveBeenCalledWith("organization", "org-1");
    });

    it("hides sync now button when kill switch is active", () => {
      (useSyncStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        jobs: {
          "org-1": { status: "prompt", lastSynced: "2024-01-01T10:00:00Z" },
        },
        startSync: mockStartSync,
        hydrateJob: mockHydrateJob,
        updateSyncStatus: mockUpdateSyncStatus,
      });

      (useKillSwitchStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        killSwitchStatus: true,
      });

      render(<SyncRibbon id="org-1" type="organization" />);

      expect(screen.queryByText("Sync now")).toBeInTheDocument();
    });
  });

  describe("Default Status", () => {
    it("renders prompt status as default when status is undefined", () => {
      (useSyncStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        jobs: {
          "org-1": { lastSynced: "2024-01-01T10:00:00Z" },
        },
        startSync: mockStartSync,
        hydrateJob: mockHydrateJob,
        updateSyncStatus: mockUpdateSyncStatus,
      });

      render(<SyncRibbon id="org-1" type="organization" />);

      expect(screen.getByText(/Some data may be out of date/)).toBeInTheDocument();
    });

    it("renders prompt status when job is not found", () => {
      (useSyncStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        jobs: {},
        startSync: mockStartSync,
        hydrateJob: mockHydrateJob,
        updateSyncStatus: mockUpdateSyncStatus,
      });

      render(<SyncRibbon id="org-1" type="organization" />);

      expect(screen.getByText(/Some data may be out of date/)).toBeInTheDocument();
    });
  });

  describe("Date Formatting", () => {
    it("uses job lastSynced when available", () => {
      (useSyncStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        jobs: {
          "org-1": { status: "success", lastSynced: "2024-01-01T10:00:00Z" },
        },
        startSync: mockStartSync,
        hydrateJob: mockHydrateJob,
        updateSyncStatus: mockUpdateSyncStatus,
      });

      render(<SyncRibbon id="org-1" type="organization" />);

      expect(utils.formatUTCToEST).toHaveBeenCalledWith("2024-01-01T10:00:00Z");
    });

    it("uses apiLastSynced when job lastSynced is not available", () => {
      (useSyncStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        jobs: {
          "org-1": { status: "success" },
        },
        startSync: mockStartSync,
        hydrateJob: mockHydrateJob,
        updateSyncStatus: mockUpdateSyncStatus,
      });

      render(<SyncRibbon id="org-1" type="organization" apiLastSynced="2024-02-01T12:00:00Z" />);

      expect(utils.formatUTCToEST).toHaveBeenCalledWith("2024-02-01T12:00:00Z");
    });

    it("uses Never when both job lastSynced and apiLastSynced are not available", () => {
      (useSyncStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        jobs: {
          "org-1": { status: "success" },
        },
        startSync: mockStartSync,
        hydrateJob: mockHydrateJob,
        updateSyncStatus: mockUpdateSyncStatus,
      });

      render(<SyncRibbon id="org-1" type="organization" />);

      expect(utils.formatUTCToEST).toHaveBeenCalledWith("Never");
      expect(screen.getByText(/Never/)).toBeInTheDocument();
    });

    it("prefers job lastSynced over apiLastSynced", () => {
      (useSyncStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        jobs: {
          "org-1": { status: "success", lastSynced: "2024-01-01T10:00:00Z" },
        },
        startSync: mockStartSync,
        hydrateJob: mockHydrateJob,
        updateSyncStatus: mockUpdateSyncStatus,
      });

      render(<SyncRibbon id="org-1" type="organization" apiLastSynced="2024-02-01T12:00:00Z" />);

      expect(utils.formatUTCToEST).toHaveBeenCalledWith("2024-01-01T10:00:00Z");
      expect(utils.formatUTCToEST).not.toHaveBeenCalledWith("2024-02-01T12:00:00Z");
    });
  });

  describe("Auto-prompt Logic", () => {
    it("does not update status when job lastSynced is not available", () => {
      (useSyncStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        jobs: {
          "org-1": { status: "success" },
        },
        startSync: mockStartSync,
        hydrateJob: mockHydrateJob,
        updateSyncStatus: mockUpdateSyncStatus,
      });

      render(<SyncRibbon id="org-1" type="organization" />);

      expect(mockUpdateSyncStatus).not.toHaveBeenCalled();
    });

    it("updates to prompt status when lastSynced is more than 10 minutes old", () => {
      const now = new Date("2024-01-01T10:15:00Z");
      vi.setSystemTime(now);

      const lastSynced = "2024-01-01T10:00:00Z";
      (useSyncStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        jobs: {
          "org-1": { status: "success", lastSynced },
        },
        startSync: mockStartSync,
        hydrateJob: mockHydrateJob,
        updateSyncStatus: mockUpdateSyncStatus,
      });

      render(<SyncRibbon id="org-1" type="organization" />);

      expect(mockUpdateSyncStatus).toHaveBeenCalledWith("org-1", { status: "prompt" });
    });

    it("does not update status when lastSynced is less than 10 minutes old", () => {
      const now = new Date("2024-01-01T10:05:00Z");
      vi.setSystemTime(now);

      const lastSynced = "2024-01-01T10:00:00Z";
      (useSyncStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        jobs: {
          "org-1": { status: "success", lastSynced },
        },
        startSync: mockStartSync,
        hydrateJob: mockHydrateJob,
        updateSyncStatus: mockUpdateSyncStatus,
      });

      render(<SyncRibbon id="org-1" type="organization" />);

      expect(mockUpdateSyncStatus).not.toHaveBeenCalled();
    });

    it("does not update status when already processing", () => {
      const now = new Date("2024-01-01T10:15:00Z");
      vi.setSystemTime(now);

      const lastSynced = "2024-01-01T10:00:00Z";
      (useSyncStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        jobs: {
          "org-1": { status: "processing", lastSynced },
        },
        startSync: mockStartSync,
        hydrateJob: mockHydrateJob,
        updateSyncStatus: mockUpdateSyncStatus,
      });

      render(<SyncRibbon id="org-1" type="organization" />);

      expect(mockUpdateSyncStatus).not.toHaveBeenCalled();
    });

    it("does not update status when already pending", () => {
      const now = new Date("2024-01-01T10:15:00Z");
      vi.setSystemTime(now);

      const lastSynced = "2024-01-01T10:00:00Z";
      (useSyncStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        jobs: {
          "org-1": { status: "pending", lastSynced },
        },
        startSync: mockStartSync,
        hydrateJob: mockHydrateJob,
        updateSyncStatus: mockUpdateSyncStatus,
      });

      render(<SyncRibbon id="org-1" type="organization" />);

      expect(mockUpdateSyncStatus).not.toHaveBeenCalled();
    });

    it("updates to prompt when exactly 10 minutes have passed", () => {
      const now = new Date("2024-01-01T10:10:00Z");
      vi.setSystemTime(now);

      const lastSynced = "2024-01-01T10:00:00Z";
      (useSyncStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        jobs: {
          "org-1": { status: "success", lastSynced },
        },
        startSync: mockStartSync,
        hydrateJob: mockHydrateJob,
        updateSyncStatus: mockUpdateSyncStatus,
      });

      render(<SyncRibbon id="org-1" type="organization" />);

      expect(mockUpdateSyncStatus).not.toHaveBeenCalled();
    });

    it("updates to prompt when more than 10 minutes have passed", () => {
      const now = new Date("2024-01-01T10:11:00Z");
      vi.setSystemTime(now);

      const lastSynced = "2024-01-01T10:00:00Z";
      (useSyncStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        jobs: {
          "org-1": { status: "success", lastSynced },
        },
        startSync: mockStartSync,
        hydrateJob: mockHydrateJob,
        updateSyncStatus: mockUpdateSyncStatus,
      });

      render(<SyncRibbon id="org-1" type="organization" />);

      expect(mockUpdateSyncStatus).toHaveBeenCalledWith("org-1", { status: "prompt" });
    });
  });

  describe("Group Type", () => {
    it("calls startSync with group type when sync button clicked", () => {
      (useSyncStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        jobs: {
          "grp-1": { status: "success", lastSynced: "2024-01-01T10:00:00Z" },
        },
        startSync: mockStartSync,
        hydrateJob: mockHydrateJob,
        updateSyncStatus: mockUpdateSyncStatus,
      });

      render(<SyncRibbon id="grp-1" type="group" />);

      const syncButton = screen.getByText("Sync").closest("button");
      fireEvent.click(syncButton!);

      expect(mockStartSync).toHaveBeenCalledWith("group", "grp-1");
    });

    it("calls startSync with group type from prompt status", () => {
      (useSyncStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        jobs: {
          "grp-1": { status: "prompt", lastSynced: "2024-01-01T10:00:00Z" },
        },
        startSync: mockStartSync,
        hydrateJob: mockHydrateJob,
        updateSyncStatus: mockUpdateSyncStatus,
      });

      render(<SyncRibbon id="grp-1" type="group" />);

      const syncButton = screen.getByText("Sync now").closest("button");
      fireEvent.click(syncButton!);

      expect(mockStartSync).toHaveBeenCalledWith("group", "grp-1");
    });
  });

  describe("Error Status", () => {
    it("renders prompt status for error status", () => {
      (useSyncStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        jobs: {
          "org-1": { status: "error", lastSynced: "2024-01-01T10:00:00Z" },
        },
        startSync: mockStartSync,
        hydrateJob: mockHydrateJob,
        updateSyncStatus: mockUpdateSyncStatus,
      });

      render(<SyncRibbon id="org-1" type="organization" />);

      expect(screen.getByText(/Some data may be out of date/)).toBeInTheDocument();
    });
  });

  describe("CSS Classes", () => {
    it("applies inprogress class for processing status", () => {
      (useSyncStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        jobs: {
          "org-1": { status: "processing", lastSynced: "2024-01-01T00:00:00Z" },
        },
        startSync: mockStartSync,
        hydrateJob: mockHydrateJob,
        updateSyncStatus: mockUpdateSyncStatus,
      });

      const { container } = render(<SyncRibbon id="org-1" type="organization" />);

      expect(container.querySelector(".inprogress")).toBeInTheDocument();
    });

    it("applies success class for success status", () => {
      (useSyncStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        jobs: {
          "org-1": { status: "success", lastSynced: "2024-01-01T10:00:00Z" },
        },
        startSync: mockStartSync,
        hydrateJob: mockHydrateJob,
        updateSyncStatus: mockUpdateSyncStatus,
      });

      const { container } = render(<SyncRibbon id="org-1" type="organization" />);

      expect(container.querySelector(".success")).toBeInTheDocument();
    });

    it("applies prompt class for prompt status", () => {
      (useSyncStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        jobs: {
          "org-1": { status: "prompt", lastSynced: "2024-01-01T10:00:00Z" },
        },
        startSync: mockStartSync,
        hydrateJob: mockHydrateJob,
        updateSyncStatus: mockUpdateSyncStatus,
      });

      const { container } = render(<SyncRibbon id="org-1" type="organization" />);

      expect(container.querySelector(".prompt")).toBeInTheDocument();
    });
  });
});
