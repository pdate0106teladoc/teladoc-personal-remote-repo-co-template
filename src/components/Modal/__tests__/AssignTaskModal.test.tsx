import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AssignModal from "../AssignTaskModal";

vi.mock("../BasicModal.scss", () => ({}));

vi.mock("react-bootstrap", () => {
  const Modal = ({ show, children }: any) =>
    show ? <div data-testid="modal">{children}</div> : null;
  Modal.Header = ({ children }: any) => <div data-testid="modal-header">{children}</div>;
  Modal.Title = ({ children }: any) => <h2>{children}</h2>;
  Modal.Body = ({ children }: any) => <div data-testid="modal-body">{children}</div>;
  Modal.Footer = ({ children }: any) => <div data-testid="modal-footer">{children}</div>;
  return { Modal };
});

const mocks = vi.hoisted(() => ({
  selection: {} as Record<string, string>,
}));

vi.mock("@ucc/common-ui", () => ({
  Button: ({ children, onClick, className, disabled }: any) => (
    <button className={className} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  MultiSelectSearch: ({ label, onChange }: any) => (
    <div data-testid="multi-select-search">
      <label>{label}</label>
      <button data-testid="multi-select-trigger" onClick={() => onChange(mocks.selection)}>
        Select user
      </button>
    </div>
  ),
}));

vi.mock("@/api/apiService", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("AssignTaskModal", () => {
  const defaultProps = {
    show: true,
    taskId: "O-00504",
    createdBy: "Bob",
    handleClose: vi.fn(),
    handleAssign: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.selection = { "user-123": "Test User (Me)" };
    localStorage.setItem(
      "auth-storage",
      JSON.stringify({ state: { user: { userId: "user-123" } } }),
    );
  });

  it("renders modal with title when show is true", () => {
    render(<AssignModal {...defaultProps} />);
    expect(screen.getByText("Assign task")).toBeInTheDocument();
  });

  it("does not render when show is false", () => {
    render(<AssignModal {...defaultProps} show={false} />);
    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
  });

  it("renders MultiSelectSearch with Assignee label", () => {
    render(<AssignModal {...defaultProps} />);
    expect(screen.getByTestId("multi-select-search")).toBeInTheDocument();
  });

  it("renders Cancel, Save and start, and Save buttons", () => {
    render(<AssignModal {...defaultProps} />);
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Save and start")).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
  });

  it("Cancel button calls handleClose", () => {
    const handleClose = vi.fn();
    render(<AssignModal {...defaultProps} handleClose={handleClose} />);

    fireEvent.click(screen.getByText("Cancel"));
    expect(handleClose).toHaveBeenCalled();
  });

  it("Save button is disabled when no assignee is selected", () => {
    render(<AssignModal {...defaultProps} />);
    expect(screen.getByText("Save")).toBeDisabled();
  });

  it("Save button calls handleAssign with 'save' after selecting assignee", () => {
    const handleAssign = vi.fn();
    render(<AssignModal {...defaultProps} handleAssign={handleAssign} />);

    fireEvent.click(screen.getByTestId("multi-select-trigger"));
    fireEvent.click(screen.getByText("Save"));

    expect(handleAssign).toHaveBeenCalledWith("save", "user-123");
  });

  it("Save and start button calls handleAssign with 'saveAndStart' when user selects themselves", () => {
    const handleAssign = vi.fn();
    render(<AssignModal {...defaultProps} handleAssign={handleAssign} />);

    fireEvent.click(screen.getByTestId("multi-select-trigger"));
    fireEvent.click(screen.getByText("Save and start"));

    expect(handleAssign).toHaveBeenCalledWith("saveAndStart", "user-123");
  });

  it("both buttons are enabled when the selected assignee is not the task creator", () => {
    render(<AssignModal {...defaultProps} createdBy="Bob" />);

    fireEvent.click(screen.getByTestId("multi-select-trigger"));

    expect(screen.getByText("Save")).not.toBeDisabled();
    expect(screen.getByText("Save and start")).not.toBeDisabled();
  });

  it("both buttons are disabled when the selected assignee is the task creator", () => {
    mocks.selection = { "user-123": "Bob" };
    render(<AssignModal {...defaultProps} createdBy="Bob" />);

    fireEvent.click(screen.getByTestId("multi-select-trigger"));

    expect(screen.getByText("Save")).toBeDisabled();
    expect(screen.getByText("Save and start")).toBeDisabled();
  });

  it("both buttons are disabled when the creator selects themselves and the name carries the '(Me)' suffix", () => {
    mocks.selection = { "user-123": "Bob (Me)" };
    render(<AssignModal {...defaultProps} createdBy="Bob" />);

    fireEvent.click(screen.getByTestId("multi-select-trigger"));

    expect(screen.getByText("Save")).toBeDisabled();
    expect(screen.getByText("Save and start")).toBeDisabled();
  });

  it("Save is disabled when the creator is selected by another user's lookup entry", () => {
    mocks.selection = { "user-999": "Bob" };
    render(<AssignModal {...defaultProps} createdBy="Bob" />);

    fireEvent.click(screen.getByTestId("multi-select-trigger"));

    expect(screen.getByText("Save")).toBeDisabled();
  });

  it("Save and start is disabled when the selected assignee is someone other than the current user", () => {
    mocks.selection = { "user-999": "Other User" };
    render(<AssignModal {...defaultProps} createdBy="Bob" />);

    fireEvent.click(screen.getByTestId("multi-select-trigger"));

    expect(screen.getByText("Save and start")).toBeDisabled();
    expect(screen.getByText("Save")).not.toBeDisabled();
  });

  it("buttons stay disabled with no selection even when createdBy is undefined", () => {
    render(<AssignModal {...defaultProps} createdBy={undefined} />);

    expect(screen.getByText("Save")).toBeDisabled();
    expect(screen.getByText("Save and start")).toBeDisabled();
  });
});
