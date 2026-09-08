import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RestoreConfirmationModal from "../RestoreConfirmationModal";

vi.mock("../RestoreConfirmationModal.scss", () => ({}));

vi.mock("react-bootstrap", () => {
  const Modal = ({ show, children }: any) =>
    show ? <div data-testid="modal">{children}</div> : null;
  Modal.Header = ({ children }: any) => <div>{children}</div>;
  Modal.Title = ({ children }: any) => <h2>{children}</h2>;
  Modal.Body = ({ children }: any) => <div>{children}</div>;
  Modal.Footer = ({ children }: any) => <div>{children}</div>;
  return { Modal };
});

const mockPost = vi.fn();
vi.mock("@/api/apiService", () => ({
  default: { post: (...args: any[]) => mockPost(...args) },
}));

const mockShowCustomToast = vi.fn();
vi.mock("@ucc/common-ui", () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  CustomCheckbox: ({ checked, onChange }: any) => (
    <input
      data-testid="checkbox"
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
  ),
  CustomInput: ({ label, value }: any) => (
    <div data-testid="version-input">
      <label>{label}</label>
      <input readOnly value={value || ""} />
    </div>
  ),
  showCustomToast: (...args: any[]) => mockShowCustomToast(...args),
}));

vi.mock("@/constants", () => ({
  MODAL_MSSG: {
    CONFIRM_RESTORE: "By confirming, the version will be restored.",
    CONFIRM_ROLLBACK: "Confirm to rollback to the selected version.",
  },
  ToastType: { Success: "success", Error: "error" },
}));

vi.mock("@/utils", () => ({
  formatUTCtoDateOnly: vi.fn(() => "01/15/2024"),
}));

describe("RestoreConfirmationModal", () => {
  const defaultProps = {
    show: true,
    handleClose: vi.fn(),
    onRestoreSuccess: vi.fn(),
    selectedRow: {
      versionTimestamp: "2024-01-15T10:00:00Z",
      versionMongoId: "mongo-123",
      typeOfEdit: ["General"],
      workfrontId: "WF-001",
      opportunity: [],
      workflowStartDate: "2024-01-10T00:00:00Z",
      changeRequest: "CR-001",
      updatedBy: "John Doe",
      versionId: "v-1",
      restoreVersionId: "rv-1",
      draftId: "draft-1",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    import.meta.env.VITE_TASK_URL = "http://api.test/";
  });

  it("renders modal with title", () => {
    render(<RestoreConfirmationModal {...defaultProps} />);
    expect(screen.getByText("Restore Version")).toBeInTheDocument();
  });

  it("does not render when show is false", () => {
    render(<RestoreConfirmationModal {...defaultProps} show={false} />);
    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
  });

  it("restore button is disabled until checkbox checked", () => {
    render(<RestoreConfirmationModal {...defaultProps} />);
    const restoreBtn = screen.getByText("Restore");
    expect(restoreBtn).toBeDisabled();
  });

  it("checking checkbox enables restore button", () => {
    render(<RestoreConfirmationModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId("checkbox"));

    const restoreBtn = screen.getByText("Restore");
    expect(restoreBtn).not.toBeDisabled();
  });

  it("shows version date from selectedRow", () => {
    render(<RestoreConfirmationModal {...defaultProps} />);
    expect(screen.getByTestId("version-input")).toBeInTheDocument();
  });

  it("successful restore calls API and shows success toast", async () => {
    mockPost.mockResolvedValueOnce({});
    render(<RestoreConfirmationModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId("checkbox"));
    fireEvent.click(screen.getByText("Restore"));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        "http://api.test/client-configurations/history/mongo-123/restore",
      );
    });

    expect(mockShowCustomToast).toHaveBeenCalledWith(
      expect.objectContaining({ type: "success", title: "Restore Successful" }),
    );
    expect(defaultProps.handleClose).toHaveBeenCalled();
    expect(defaultProps.onRestoreSuccess).toHaveBeenCalled();
  });

  it("failed restore shows error toast", async () => {
    mockPost.mockRejectedValueOnce(new Error("fail"));
    render(<RestoreConfirmationModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId("checkbox"));
    fireEvent.click(screen.getByText("Restore"));

    await waitFor(() => {
      expect(mockShowCustomToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: "error", title: "Restore Failed" }),
      );
    });
  });

  it("Cancel button calls handleClose", () => {
    const handleClose = vi.fn();
    render(<RestoreConfirmationModal {...defaultProps} handleClose={handleClose} />);

    fireEvent.click(screen.getByText("Cancel"));
    expect(handleClose).toHaveBeenCalled();
  });
});
