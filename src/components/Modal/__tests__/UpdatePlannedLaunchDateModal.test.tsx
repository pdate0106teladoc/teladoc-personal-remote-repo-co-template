import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import "@testing-library/jest-dom";

vi.mock("../UpdatePlannedLaunchDateModal.scss", () => ({}));

vi.mock("react-icons/fa6", () => ({
  FaTriangleExclamation: () => <svg data-testid="warning-icon" />,
}));

vi.mock("@ucc/common-ui", () => ({
  Modal: ({ show, onHide, title, footer, children }: any) =>
    show ? (
      <div data-testid="modal">
        <div data-testid="modal-title">{title}</div>
        <button data-testid="modal-hide" onClick={onHide}>
          X
        </button>
        <div data-testid="modal-body">{children}</div>
        <div data-testid="modal-footer">{footer}</div>
      </div>
    ) : null,

  DatePicker: ({ label, value, onChange, placeholder, isRequired, disablePastDates }: any) => (
    <div data-testid="date-picker">
      <label data-testid="date-picker-label">
        {label}
        {isRequired && <span data-testid="date-picker-required">*</span>}
      </label>
      {/* Button trigger calls onChange directly, bypassing DOM event issues */}
      <button
        type="button"
        data-testid="date-picker-select"
        data-placeholder={placeholder}
        data-disable-past={String(disablePastDates)}
        onClick={() => onChange(new Date("2025-12-01"))}
      >
        {placeholder}
      </button>
      <span data-testid="date-picker-value">
        {value instanceof Date && !isNaN(value.getTime())
          ? value.toISOString().split("T")[0]
          : ""}
      </span>
    </div>
  ),

  CustomCheckbox: ({ checked, onChange, size }: any) => (
    <div data-testid="custom-checkbox-wrapper">
      {/* Read-only controlled input shows current state; button drives the change */}
      <input
        type="checkbox"
        data-testid="custom-checkbox"
        checked={checked}
        data-size={size}
        readOnly
      />
      <button
        type="button"
        data-testid="custom-checkbox-toggle"
        onClick={() => onChange(!checked)}
      >
        Toggle
      </button>
    </div>
  ),

  Button: ({ children, onClick, disabled, className }: any) => (
    <button
      data-testid={`btn-${String(children).toLowerCase().replace(/\s+/g, "-")}`}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  ),
}));

import UpdatePlannedLaunchDateModal from "../UpdatePlannedLaunchDateModal";

const defaultProps = {
  show: true,
  handleClose: vi.fn(),
  plannedLaunchDate: "Jan 1, 2024",
  onUpdate: vi.fn(),
};

const renderModal = (overrides: Partial<typeof defaultProps> = {}) => {
  const props = { ...defaultProps, ...overrides };
  const result = render(<UpdatePlannedLaunchDateModal {...props} />);
  return { ...result, props };
};

describe("UpdatePlannedLaunchDateModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Visibility ───────────────────────────────────────────────────────────────

  it("renders modal content when show is true", () => {
    renderModal({ show: true });
    expect(screen.getByTestId("modal")).toBeInTheDocument();
  });

  it("renders nothing when show is false", () => {
    renderModal({ show: false });
    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
  });

  // ── Static content ───────────────────────────────────────────────────────────

  it("renders the modal title", () => {
    renderModal();
    expect(screen.getByTestId("modal-title")).toHaveTextContent(
      "Update planned launch date"
    );
  });

  it("renders the warning icon", () => {
    renderModal();
    expect(screen.getByTestId("warning-icon")).toBeInTheDocument();
  });

  it("renders the warning heading text", () => {
    renderModal();
    expect(
      screen.getByText("Planned launch date is in the past")
    ).toBeInTheDocument();
  });

  it("renders the plannedLaunchDate in the warning message", () => {
    renderModal({ plannedLaunchDate: "Mar 15, 2023" });
    expect(screen.getByText(/Mar 15, 2023/)).toBeInTheDocument();
  });

  it("renders the DatePicker with correct label and required flag", () => {
    renderModal();
    expect(screen.getByTestId("date-picker-label")).toHaveTextContent(
      "Planned launch date"
    );
    expect(screen.getByTestId("date-picker-required")).toBeInTheDocument();
  });

  it("renders the DatePicker with disablePastDates", () => {
    renderModal();
    expect(screen.getByTestId("date-picker-select")).toHaveAttribute(
      "data-disable-past",
      "true"
    );
  });

  it("renders the DatePicker placeholder", () => {
    renderModal();
    expect(screen.getByTestId("date-picker-select")).toHaveAttribute(
      "data-placeholder",
      "Select a date..."
    );
  });

  it("renders confirmation text", () => {
    renderModal();
    expect(
      screen.getByText(
        "By confirming, the configuration will be launched on the selected date."
      )
    ).toBeInTheDocument();
  });

  it("renders the confirm checkbox label", () => {
    renderModal();
    expect(
      screen.getByText(/Confirm the new planned launch date/)
    ).toBeInTheDocument();
  });

  it("renders required asterisk next to confirm label", () => {
    renderModal();
    const label = screen.getByText(/Confirm the new planned launch date/);
    expect(label.querySelector(".required") ?? label.nextElementSibling).toBeTruthy();
  });

  it("renders Cancel and Update buttons", () => {
    renderModal();
    expect(screen.getByTestId("btn-cancel")).toBeInTheDocument();
    expect(screen.getByTestId("btn-update")).toBeInTheDocument();
  });

  // ── Update button disabled state ─────────────────────────────────────────────

  it("Update button is disabled initially (no date, not confirmed)", () => {
    renderModal();
    expect(screen.getByTestId("btn-update")).toBeDisabled();
  });

  it("Update button is disabled when date is selected but checkbox is unchecked", () => {
    renderModal();
    fireEvent.click(screen.getByTestId("date-picker-select"));
    expect(screen.getByTestId("btn-update")).toBeDisabled();
  });

  it("Update button is disabled when checkbox is checked but no date is selected", () => {
    renderModal();
    fireEvent.click(screen.getByTestId("custom-checkbox-toggle"));
    expect(screen.getByTestId("btn-update")).toBeDisabled();
  });

  it("Update button is enabled when both date is selected and checkbox is checked", () => {
    renderModal();
    fireEvent.click(screen.getByTestId("date-picker-select"));
    fireEvent.click(screen.getByTestId("custom-checkbox-toggle"));
    expect(screen.getByTestId("btn-update")).toBeEnabled();
  });

  // ── handleUpdate ─────────────────────────────────────────────────────────────

  it("calls onUpdate with selected date when Update is clicked with valid state", () => {
    const onUpdate = vi.fn();
    const handleClose = vi.fn();
    renderModal({ onUpdate, handleClose });

    fireEvent.click(screen.getByTestId("date-picker-select"));
    fireEvent.click(screen.getByTestId("custom-checkbox-toggle"));
    fireEvent.click(screen.getByTestId("btn-update"));

    expect(onUpdate).toHaveBeenCalledWith(expect.any(Date));
    expect(onUpdate).toHaveBeenCalledTimes(1);
  });

  it("calls handleClose after successful Update", () => {
    const handleClose = vi.fn();
    const onUpdate = vi.fn();
    renderModal({ handleClose, onUpdate });

    fireEvent.click(screen.getByTestId("date-picker-select"));
    fireEvent.click(screen.getByTestId("custom-checkbox-toggle"));
    fireEvent.click(screen.getByTestId("btn-update"));

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onUpdate when Update is clicked without a date", () => {
    const onUpdate = vi.fn();
    renderModal({ onUpdate });

    fireEvent.click(screen.getByTestId("custom-checkbox-toggle"));
    fireEvent.click(screen.getByTestId("btn-update"));

    expect(onUpdate).not.toHaveBeenCalled();
  });

  it("does not call onUpdate when Update is clicked without confirming", () => {
    const onUpdate = vi.fn();
    renderModal({ onUpdate });

    fireEvent.click(screen.getByTestId("date-picker-select"));
    fireEvent.click(screen.getByTestId("btn-update"));

    expect(onUpdate).not.toHaveBeenCalled();
  });

  // ── Cancel / close ───────────────────────────────────────────────────────────

  it("calls handleClose when Cancel button is clicked", () => {
    const handleClose = vi.fn();
    renderModal({ handleClose });
    fireEvent.click(screen.getByTestId("btn-cancel"));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("calls handleClose when modal onHide is triggered", () => {
    const handleClose = vi.fn();
    renderModal({ handleClose });
    fireEvent.click(screen.getByTestId("modal-hide"));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("resets selectedDate after Cancel so Update stays disabled on reopen", () => {
    const handleClose = vi.fn();
    const { rerender } = render(
      <UpdatePlannedLaunchDateModal
        show={true}
        handleClose={handleClose}
        plannedLaunchDate="Jan 1, 2024"
        onUpdate={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId("date-picker-select"));
    fireEvent.click(screen.getByTestId("custom-checkbox-toggle"));

    // Cancel resets state
    fireEvent.click(screen.getByTestId("btn-cancel"));

    // Simulate modal close+reopen
    rerender(
      <UpdatePlannedLaunchDateModal
        show={false}
        handleClose={handleClose}
        plannedLaunchDate="Jan 1, 2024"
        onUpdate={vi.fn()}
      />
    );
    rerender(
      <UpdatePlannedLaunchDateModal
        show={true}
        handleClose={handleClose}
        plannedLaunchDate="Jan 1, 2024"
        onUpdate={vi.fn()}
      />
    );

    expect(screen.getByTestId("btn-update")).toBeDisabled();
    expect(screen.getByTestId("custom-checkbox")).not.toBeChecked();
  });

  it("resets state when modal onHide is triggered", () => {
    const handleClose = vi.fn();
    render(
      <UpdatePlannedLaunchDateModal
        show={true}
        handleClose={handleClose}
        plannedLaunchDate="Jan 1, 2024"
        onUpdate={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId("date-picker-select"));
    fireEvent.click(screen.getByTestId("custom-checkbox-toggle"));

    fireEvent.click(screen.getByTestId("modal-hide"));

    expect(handleClose).toHaveBeenCalled();
    // After close the checkbox should be unchecked (state reset)
    // The modal re-shows with same component to verify internal state
    expect(screen.getByTestId("custom-checkbox")).not.toBeChecked();
  });

  // ── Checkbox behaviour ───────────────────────────────────────────────────────

  it("checkbox is unchecked by default", () => {
    renderModal();
    expect(screen.getByTestId("custom-checkbox")).not.toBeChecked();
  });

  it("checkbox becomes checked when toggled", () => {
    renderModal();
    fireEvent.click(screen.getByTestId("custom-checkbox-toggle"));
    expect(screen.getByTestId("custom-checkbox")).toBeChecked();
  });

  it("checkbox can be unchecked after being checked", () => {
    renderModal();
    const toggle = screen.getByTestId("custom-checkbox-toggle");

    fireEvent.click(toggle);
    expect(screen.getByTestId("custom-checkbox")).toBeChecked();

    fireEvent.click(toggle);
    expect(screen.getByTestId("custom-checkbox")).not.toBeChecked();
  });

  it("CustomCheckbox receives size='lg'", () => {
    renderModal();
    expect(screen.getByTestId("custom-checkbox")).toHaveAttribute("data-size", "lg");
  });

  // ── DatePicker initial state ──────────────────────────────────────────────────

  it("DatePicker starts with no value selected", () => {
    renderModal();
    expect(screen.getByTestId("date-picker-value")).toHaveTextContent("");
  });
});
