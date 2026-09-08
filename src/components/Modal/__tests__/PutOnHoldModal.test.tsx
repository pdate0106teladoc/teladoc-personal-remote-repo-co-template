import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PutOnHoldModal from "../PutOnHoldModal";

vi.mock("../PutOnHoldModal.scss", () => ({}));

vi.mock("react-bootstrap", () => {
  const Modal = ({ show, children }: any) =>
    show ? <div data-testid="modal">{children}</div> : null;
  Modal.Header = ({ children }: any) => <div>{children}</div>;
  Modal.Title = ({ children }: any) => <h2>{children}</h2>;
  Modal.Body = ({ children }: any) => <div>{children}</div>;
  Modal.Footer = ({ children }: any) => <div>{children}</div>;
  return { Modal };
});

vi.mock("@ucc/common-ui", () => ({
  Button: ({ children, onClick, disabled, className }: any) => (
    <button onClick={onClick} disabled={disabled} className={className}>
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
  CustomDropdown: ({ label, value, onChange, options, error }: any) => (
    <div data-testid="reason-dropdown">
      <label>{label}</label>
      <select
        data-testid="reason-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select a reason</option>
        {options?.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span data-testid="reason-error">{error}</span>}
    </div>
  ),
  CustomTextarea: ({ label, value, onChange, error, required }: any) => (
    <div data-testid="comments-textarea">
      <label>{label}</label>
      <textarea
        data-testid="comments-input"
        value={value}
        onChange={onChange}
        required={required}
      />
      {error && <span data-testid="comments-error">{error}</span>}
    </div>
  ),
}));

describe("PutOnHoldModal", () => {
  const defaultProps = {
    show: true,
    handleClose: vi.fn(),
    onConfirm: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders when show is true", () => {
    render(<PutOnHoldModal {...defaultProps} />);
    expect(screen.getByTestId("modal")).toBeInTheDocument();
    expect(screen.getAllByText("Put on hold")).toHaveLength(2);
  });

  it("does not render when show is false", () => {
    render(<PutOnHoldModal {...defaultProps} show={false} />);
    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
  });

  it("submit button is disabled initially", () => {
    render(<PutOnHoldModal {...defaultProps} />);
    const submitBtn = screen.getByRole("button", { name: "Put on hold" });
    expect(submitBtn).toBeDisabled();
  });

  it("submit is disabled without reason selected", () => {
    render(<PutOnHoldModal {...defaultProps} />);

    const checkbox = screen.getByTestId("checkbox");
    fireEvent.click(checkbox);

    const submitBtn = screen.getByRole("button", { name: "Put on hold" });
    expect(submitBtn).toBeDisabled();
  });

  it("submit is enabled when reason selected and confirmed", () => {
    render(<PutOnHoldModal {...defaultProps} />);

    const select = screen.getByTestId("reason-select");
    fireEvent.change(select, { target: { value: "Contract pending" } });

    const checkbox = screen.getByTestId("checkbox");
    fireEvent.click(checkbox);

    const submitBtn = screen.getByRole("button", { name: "Put on hold" });
    expect(submitBtn).not.toBeDisabled();
  });

  it("Other reason requires comments", () => {
    render(<PutOnHoldModal {...defaultProps} />);

    const select = screen.getByTestId("reason-select");
    fireEvent.change(select, { target: { value: "Other" } });

    const checkbox = screen.getByTestId("checkbox");
    fireEvent.click(checkbox);

    const submitBtn = screen.getByRole("button", { name: "Put on hold" });
    expect(submitBtn).toBeDisabled();
  });

  it("Other reason with comments enables submit", () => {
    render(<PutOnHoldModal {...defaultProps} />);

    const select = screen.getByTestId("reason-select");
    fireEvent.change(select, { target: { value: "Other" } });

    const textarea = screen.getByTestId("comments-input");
    fireEvent.change(textarea, { target: { value: "Some reason" } });

    const checkbox = screen.getByTestId("checkbox");
    fireEvent.click(checkbox);

    const submitBtn = screen.getByRole("button", { name: "Put on hold" });
    expect(submitBtn).not.toBeDisabled();
  });

  it("submit calls onConfirm with reason and comments", async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    render(<PutOnHoldModal {...defaultProps} onConfirm={onConfirm} />);

    const select = screen.getByTestId("reason-select");
    fireEvent.change(select, { target: { value: "Contract pending" } });

    const checkbox = screen.getByTestId("checkbox");
    fireEvent.click(checkbox);

    fireEvent.click(screen.getByRole("button", { name: "Put on hold" }));

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith("Contract pending", "");
    });
  });

  it("Cancel resets all fields and calls handleClose", () => {
    const handleClose = vi.fn();
    render(<PutOnHoldModal {...defaultProps} handleClose={handleClose} />);

    const select = screen.getByTestId("reason-select");
    fireEvent.change(select, { target: { value: "Other" } });

    fireEvent.click(screen.getByText("Cancel"));

    expect(handleClose).toHaveBeenCalled();
  });

  it("shows reason error when checkbox checked without reason", () => {
    render(<PutOnHoldModal {...defaultProps} />);

    const checkbox = screen.getByTestId("checkbox");
    fireEvent.click(checkbox);

    expect(screen.getByTestId("reason-error")).toBeInTheDocument();
  });
});
