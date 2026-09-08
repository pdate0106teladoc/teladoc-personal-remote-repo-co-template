import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SubmitUpdateForm from "../SubmitUpdateParentForm";

vi.mock("../SubmitUpdateForm.scss", () => ({}));

vi.mock("react-router-dom", () => ({
  useParams: () => ({ candidateId: "candidate-123" }),
  useLocation: () => ({ pathname: "/CCC/org-detail/org-1/edit/candidate-123" }),
}));

const mockPost = vi.fn();
const mockGet = vi.fn();
vi.mock("@/api/apiService", () => ({
  default: {
    post: (...args: any[]) => mockPost(...args),
    get: (...args: any[]) => mockGet(...args),
  },
}));

const mockShowCustomToast = vi.fn();
vi.mock("@ucc/common-ui", () => ({
  Button: ({ children, onClick, disabled, className }: any) => (
    <button onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  ),
  showCustomToast: (...args: any[]) => mockShowCustomToast(...args),
  ToastType: { Success: "success", Error: "error" },
}));

vi.mock("@/components/Breadcrumb/CustomBreadcrumb", () => ({
  default: ({ items, activeIndex }: any) => (
    <nav data-testid="breadcrumb">
      {items.map((item: string, i: number) => (
        <span key={item} className={i === activeIndex ? "active" : ""}>
          {item}
        </span>
      ))}
    </nav>
  ),
}));

let mockTaskStatus = "DRAFT";

vi.mock("../SubmitSettingForm", () => ({
  default: ({ onContinue, onTaskDetailsChange }: any) => (
    <div data-testid="submit-setting-form">
      <button
        data-testid="setting-continue"
        onClick={() => {
          onTaskDetailsChange?.({
            taskId: "T-001",
            status: mockTaskStatus,
            entities: [{ draftId: "draft-1" }],
          });
          onContinue?.();
        }}
      >
        Mock Continue
      </button>
    </div>
  ),
}));

vi.mock("../ConfirmationForm", () => ({
  default: ({ confirmed, onConfirmedChange, taskDetails }: any) => (
    <div data-testid="confirmation-form">
      <span data-testid="task-id">{taskDetails?.taskId}</span>
      <button
        data-testid="confirm-checkbox"
        onClick={() => onConfirmedChange(!confirmed)}
      >
        {confirmed ? "Confirmed" : "Not confirmed"}
      </button>
    </div>
  ),
}));

vi.mock("@/hooks/useAutoSavePatch", () => ({
  buildAutoSaveRetryToastMessage: () => "Retry message",
}));

vi.mock("@/constants", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/constants")>();
  return {
    ...actual,
    ERROR_MESSAGES: {
      ...actual.ERROR_MESSAGES,
      AUTO_SAVE_RETRY_OR_SERVICE_DESK: "Contact service desk",
    },
  };
});

describe("SubmitUpdateParentForm", () => {
  const mockDiffLibraryPost = () =>
    mockPost.mockImplementation((url: string) => {
      if (String(url).includes("difference-checker")) {
        return Promise.resolve({ changes: {} });
      }
      return Promise.resolve({});
    });

  beforeEach(() => {
    vi.clearAllMocks();
    mockTaskStatus = "DRAFT";
    import.meta.env.VITE_WORKLOG_URL = "http://workflow.test/";
    import.meta.env.VITE_TASK_URL = "http://task.test/";
    mockDiffLibraryPost();
    mockGet.mockResolvedValue({ diff: { changes: [] } });
  });

  it("renders breadcrumb with step 1 active", () => {
    render(<SubmitUpdateForm />);
    expect(screen.getByTestId("breadcrumb")).toBeInTheDocument();
    expect(screen.getByText("1. Submission setting")).toHaveClass("active");
  });

  it("renders SubmitSettingForm at step 1", () => {
    render(<SubmitUpdateForm />);
    expect(screen.getByTestId("submit-setting-form")).toBeInTheDocument();
    expect(screen.queryByTestId("confirmation-form")).not.toBeInTheDocument();
  });

  it("does not show Back button at step 1", () => {
    render(<SubmitUpdateForm />);
    expect(screen.queryByText("Back")).not.toBeInTheDocument();
  });

  it("advances to step 2 when Continue is clicked", () => {
    render(<SubmitUpdateForm />);
    fireEvent.click(screen.getByTestId("setting-continue"));

    expect(screen.getByTestId("confirmation-form")).toBeInTheDocument();
    expect(screen.queryByTestId("submit-setting-form")).not.toBeInTheDocument();
  });

  it("shows Back and Submit buttons at step 2", () => {
    render(<SubmitUpdateForm />);
    fireEvent.click(screen.getByTestId("setting-continue"));

    expect(screen.getByText("Back")).toBeInTheDocument();
    expect(screen.getByText("Submit")).toBeInTheDocument();
  });

  it("Submit button is disabled until confirmed", () => {
    render(<SubmitUpdateForm />);
    fireEvent.click(screen.getByTestId("setting-continue"));

    expect(screen.getByText("Submit")).toBeDisabled();
  });

  it("Submit button is enabled after confirmation", () => {
    render(<SubmitUpdateForm />);
    fireEvent.click(screen.getByTestId("setting-continue"));

    fireEvent.click(screen.getByTestId("confirm-checkbox"));

    expect(screen.getByText("Submit")).not.toBeDisabled();
  });

  it("Back button returns to step 1", () => {
    render(<SubmitUpdateForm />);
    fireEvent.click(screen.getByTestId("setting-continue"));

    expect(screen.getByTestId("confirmation-form")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Back"));

    expect(screen.getByTestId("submit-setting-form")).toBeInTheDocument();
    expect(screen.queryByTestId("confirmation-form")).not.toBeInTheDocument();
  });

  it("breadcrumb shows step 2 active after advancing", () => {
    render(<SubmitUpdateForm />);
    fireEvent.click(screen.getByTestId("setting-continue"));

    expect(screen.getByText("2. Confirmation")).toHaveClass("active");
  });

  it("submits successfully and shows success toast", async () => {
    mockPost.mockImplementation((url: string) => {
      if (String(url).includes("difference-checker")) {
        return Promise.resolve({ changes: {} });
      }
      return Promise.resolve({});
    });
    render(<SubmitUpdateForm />);

    fireEvent.click(screen.getByTestId("setting-continue"));
    fireEvent.click(screen.getByTestId("confirm-checkbox"));
    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        expect.stringContaining("client-configurations/organizations/draft-1/tasks/candidate-123/submit"),
        expect.any(Object),
      );
    });

    expect(mockShowCustomToast).toHaveBeenCalledWith(
      expect.objectContaining({ type: "success", title: "Success" }),
    );
  });

  it("calls onSubmitSuccess callback after successful submit", async () => {
    mockPost.mockImplementation((url: string) => {
      if (String(url).includes("difference-checker")) {
        return Promise.resolve({ changes: {} });
      }
      return Promise.resolve({});
    });
    const onSubmitSuccess = vi.fn();
    render(<SubmitUpdateForm onSubmitSuccess={onSubmitSuccess} />);

    fireEvent.click(screen.getByTestId("setting-continue"));
    fireEvent.click(screen.getByTestId("confirm-checkbox"));
    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(onSubmitSuccess).toHaveBeenCalled();
    });
  });

  it("shows retry toast on first failure", async () => {
    mockPost.mockImplementation((url: string) => {
      if (String(url).includes("difference-checker")) {
        return Promise.resolve({ changes: {} });
      }
      return Promise.reject(new Error("fail"));
    });
    render(<SubmitUpdateForm />);

    fireEvent.click(screen.getByTestId("setting-continue"));
    fireEvent.click(screen.getByTestId("confirm-checkbox"));
    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(mockShowCustomToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: "error", title: "Failed" }),
      );
    });
  });

  it("shows service desk message on second failure", async () => {
    let submitAttempts = 0;
    mockPost.mockImplementation((url: string) => {
      if (String(url).includes("difference-checker")) {
        return Promise.resolve({ changes: {} });
      }
      submitAttempts += 1;
      return Promise.reject(new Error(`fail ${submitAttempts}`));
    });
    render(<SubmitUpdateForm />);

    fireEvent.click(screen.getByTestId("setting-continue"));
    fireEvent.click(screen.getByTestId("confirm-checkbox"));
    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(mockShowCustomToast).toHaveBeenCalled();
    });

    vi.clearAllMocks();
    mockDiffLibraryPost();
    mockPost.mockImplementation((url: string) => {
      if (String(url).includes("difference-checker")) {
        return Promise.resolve({ changes: {} });
      }
      return Promise.reject(new Error("fail again"));
    });

    fireEvent.click(screen.getByTestId("confirm-checkbox"));
    fireEvent.click(screen.getByTestId("confirm-checkbox"));
    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(mockShowCustomToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error",
          message: "Contact service desk",
        }),
      );
    });
  });

  it("uses organizations entity path based on URL", async () => {
    mockPost.mockImplementation((url: string) => {
      if (String(url).includes("difference-checker")) {
        return Promise.resolve({ changes: {} });
      }
      return Promise.resolve({});
    });
    render(<SubmitUpdateForm />);

    fireEvent.click(screen.getByTestId("setting-continue"));
    fireEvent.click(screen.getByTestId("confirm-checkbox"));
    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        expect.stringContaining("organizations"),
        expect.any(Object),
      );
    });
  });

  it("resets to step 1 after successful submit", async () => {
    mockPost.mockImplementation((url: string) => {
      if (String(url).includes("difference-checker")) {
        return Promise.resolve({ changes: {} });
      }
      return Promise.resolve({});
    });
    render(<SubmitUpdateForm />);

    fireEvent.click(screen.getByTestId("setting-continue"));
    fireEvent.click(screen.getByTestId("confirm-checkbox"));
    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(screen.getByTestId("submit-setting-form")).toBeInTheDocument();
    });
  });

  it("uses diff-library for DRAFT tasks", async () => {
    render(<SubmitUpdateForm />);
    fireEvent.click(screen.getByTestId("setting-continue"));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        expect.stringContaining("client-configurations/difference-checker"),
      );
    });
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("uses review API diff for non-DRAFT tasks", async () => {
    mockTaskStatus = "REJECTED_PEER_REVIEW";
    render(<SubmitUpdateForm />);
    fireEvent.click(screen.getByTestId("setting-continue"));

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(
        "http://task.test/client-configurations/tasks/candidate-123/review",
      );
    });
    expect(mockPost).not.toHaveBeenCalledWith(
      expect.stringContaining("difference-checker"),
      expect.anything(),
    );
  });
});
