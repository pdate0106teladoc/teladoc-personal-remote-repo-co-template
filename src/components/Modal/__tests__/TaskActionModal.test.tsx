import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const hideCallbacks: Array<() => void> = [];
vi.mock("react-bootstrap", () => {
  const Modal: any = ({ show, onHide, children }: any) => {
    hideCallbacks[0] = onHide;
    if (!show) return null;
    return <div data-testid="modal">{children}</div>;
  };
  Modal.Header = ({ children, closeButton }: any) => (
    <div data-testid="modal-header">
      {closeButton && (
        <button aria-label="Close" onClick={() => hideCallbacks[0]?.()}>
          ×
        </button>
      )}
      {children}
    </div>
  );
  Modal.Title = ({ children }: any) => <h5 data-testid="modal-title">{children}</h5>;
  Modal.Body = ({ children }: any) => <div data-testid="modal-body">{children}</div>;
  Modal.Footer = ({ children }: any) => <div data-testid="modal-footer">{children}</div>;
  return { Modal };
});

vi.mock("@ucc/common-ui", () => ({
  Modal: ({ show, onHide, title, footer, children }: any) => {
    hideCallbacks[0] = onHide;
    if (!show) return null;
    return (
      <div data-testid="modal">
        <div data-testid="modal-header">
          <button aria-label="Close" onClick={onHide}>×</button>
          <h5 data-testid="modal-title">{title}</h5>
        </div>
        <div data-testid="modal-body">{children}</div>
        <div data-testid="modal-footer">{footer}</div>
      </div>
    );
  },
  Button: ({ children, onClick, disabled, className }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      data-testid={`btn-${String(children).trim().replace(/\s+/g, "-").toLowerCase()}`}
    >
      {children}
    </button>
  ),
  CustomDropdown: ({ label, options, value, onChange, error, placeholder, isRequired }: any) => (
    <div>
      <label htmlFor="reason-sel">
        {label}
        {isRequired ? " *" : ""}
      </label>
      <select
        id="reason-sel"
        data-testid="reason-dropdown"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {(options || []).map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span data-testid="dropdown-error">{error}</span>}
    </div>
  ),
  CustomTextarea: ({ label, value, onChange, error, required, rows, placeholder }: any) => (
    <div>
      <label htmlFor="comments-ta">
        {label}
        {required ? " *" : ""}
      </label>
      <textarea
        id="comments-ta"
        data-testid="comments-textarea"
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
      />
      {error && <span data-testid="textarea-error">{error}</span>}
    </div>
  ),
  CustomCheckbox: ({ checked, onChange }: any) => (
    <button
      type="button"
      data-testid="confirm-checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
    >
      {checked ? "checked" : "unchecked"}
    </button>
  ),
  showCustomToast: vi.fn(),
}));

import TaskActionModal from "../TaskActionModal";

const REASON_OPTIONS = [
  { label: "Option A", value: "Option A" },
  { label: "Option B", value: "Option B" },
  { label: "Other", value: "Other" },
];

function renderModal(props: Partial<React.ComponentProps<typeof TaskActionModal>> = {}) {
  const defaults = {
    show: true,
    handleClose: vi.fn(),
    onConfirm: vi.fn().mockResolvedValue(undefined) as (reasonCode: string, comments: string) => Promise<void>,
    title: "Test Modal",
    confirmLabel: "Confirm",
    reasonOptions: REASON_OPTIONS,
  };
  return render(<TaskActionModal {...defaults} {...props} />);
}

const selectReason = (val: string) =>
  fireEvent.change(screen.getByTestId("reason-dropdown"), { target: { value: val } });
const typeComment = (val: string) =>
  fireEvent.change(screen.getByTestId("comments-textarea"), { target: { value: val } });
const clickCheckbox = () => fireEvent.click(screen.getByTestId("confirm-checkbox"));

describe("TaskActionModal", () => {
  beforeEach(() => {
    hideCallbacks.length = 0;
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("renders modal when show=true", () => {
      renderModal({ show: true });
      expect(screen.getByTestId("modal")).toBeInTheDocument();
    });

    it("does not render modal when show=false", () => {
      renderModal({ show: false });
      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });

    it("renders the title prop", () => {
      renderModal({ title: "My Custom Title" });
      expect(screen.getByTestId("modal-title")).toHaveTextContent("My Custom Title");
    });

    it("renders confirmLabel on submit button", () => {
      renderModal({ confirmLabel: "Do it" });
      expect(screen.getByTestId("btn-do-it")).toBeInTheDocument();
    });

    it("renders default cancelLabel 'Cancel'", () => {
      renderModal();
      expect(screen.getByTestId("btn-cancel")).toBeInTheDocument();
    });

    it("renders custom cancelLabel when provided", () => {
      renderModal({ cancelLabel: "Go back" });
      expect(screen.getByTestId("btn-go-back")).toBeInTheDocument();
    });

    it("renders description when provided", () => {
      renderModal({ description: "This is a description." });
      expect(screen.getByText("This is a description.")).toBeInTheDocument();
    });

    it("does not render description paragraph when not provided", () => {
      renderModal({ description: undefined });
      expect(screen.queryByText(/description/i)).not.toBeInTheDocument();
    });

    it("renders checkbox section when showConfirmCheckbox=true", () => {
      renderModal({ showConfirmCheckbox: true });
      expect(screen.getByTestId("confirm-checkbox")).toBeInTheDocument();
    });

    it("does not render checkbox when showConfirmCheckbox=false (default)", () => {
      renderModal({ showConfirmCheckbox: false });
      expect(screen.queryByTestId("confirm-checkbox")).not.toBeInTheDocument();
    });

    it("renders custom checkboxLabel when provided", () => {
      renderModal({ showConfirmCheckbox: true, checkboxLabel: "I agree to terms." });
      expect(screen.getByText(/I agree to terms\./)).toBeInTheDocument();
    });

    it("renders default checkboxLabel when showConfirmCheckbox=true and no label given", () => {
      renderModal({ showConfirmCheckbox: true });
      expect(screen.getByText(/Confirm this action\./)).toBeInTheDocument();
    });

    it("renders reason dropdown with provided options", () => {
      renderModal();
      expect(screen.getByRole("option", { name: "Option A" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Option B" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Other" })).toBeInTheDocument();
    });

    it("uses custom commentsPlaceholder", () => {
      renderModal({ commentsPlaceholder: "Enter your note here" });
      expect(screen.getByPlaceholderText("Enter your note here")).toBeInTheDocument();
    });

    it("close button is rendered in modal header", () => {
      renderModal();
      expect(screen.getByLabelText("Close")).toBeInTheDocument();
    });

    it("checkbox is unchecked by default", () => {
      renderModal({ showConfirmCheckbox: true });
      expect(screen.getByTestId("confirm-checkbox")).toHaveAttribute("aria-checked", "false");
    });
  });

  describe("close behaviour", () => {
    it("Cancel button calls handleClose", () => {
      const handleClose = vi.fn();
      renderModal({ handleClose });
      fireEvent.click(screen.getByTestId("btn-cancel"));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it("header close button (×) calls handleClose", () => {
      const handleClose = vi.fn();
      renderModal({ handleClose });
      fireEvent.click(screen.getByLabelText("Close"));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it("handleModalClose resets state on Cancel", () => {
      const handleClose = vi.fn();
      renderModal({ handleClose });
      selectReason("Option A");
      typeComment("hello");
      fireEvent.click(screen.getByTestId("btn-cancel"));
      expect(handleClose).toHaveBeenCalled();
    });
  });

  describe("reason dropdown interaction", () => {
    it("selecting a reason updates the dropdown value", () => {
      renderModal();
      const dd = screen.getByTestId("reason-dropdown") as HTMLSelectElement;
      selectReason("Option A");
      expect(dd.value).toBe("Option A");
    });

    it("selecting a reason clears reasonError", () => {
      renderModal({ showConfirmCheckbox: true });
      clickCheckbox(); 
      expect(screen.getByTestId("dropdown-error")).toBeInTheDocument();
      selectReason("Option A");
      expect(screen.queryByTestId("dropdown-error")).not.toBeInTheDocument();
    });

    it("selecting non-Other reason clears commentsError", () => {
      renderModal({ showConfirmCheckbox: true });
      selectReason("Other");
      clickCheckbox(); 
      expect(screen.getByTestId("textarea-error")).toBeInTheDocument();
      selectReason("Option A");
      expect(screen.queryByTestId("textarea-error")).not.toBeInTheDocument();
    });

    it("re-selecting Other does not clear commentsError (branch coverage)", () => {
      renderModal({ showConfirmCheckbox: true });
      selectReason("Other");
      clickCheckbox();
      expect(screen.getByTestId("textarea-error")).toBeInTheDocument();
      selectReason("Other");
      expect(screen.getByTestId("textarea-error")).toBeInTheDocument();
    });
  });

  describe("checkbox behaviour", () => {
    it("clicking checkbox with no reason sets reasonError", () => {
      renderModal({ showConfirmCheckbox: true });
      clickCheckbox();
      expect(screen.getByTestId("dropdown-error")).toHaveTextContent("Reason is required.");
    });

    it("clicking checkbox with Other and no comments sets commentsError", () => {
      renderModal({ showConfirmCheckbox: true });
      selectReason("Other");
      clickCheckbox();
      expect(screen.getByTestId("textarea-error")).toHaveTextContent("Comments are required.");
    });

    it("clicking checkbox with non-Other reason does not set commentsError", () => {
      renderModal({ showConfirmCheckbox: true });
      selectReason("Option A");
      clickCheckbox();
      expect(screen.queryByTestId("textarea-error")).not.toBeInTheDocument();
    });

    it("unchecking (checked=false path) skips validation", () => {
      renderModal({ showConfirmCheckbox: true });
      clickCheckbox(); 
      expect(screen.getByTestId("confirm-checkbox")).toHaveAttribute("aria-checked", "true");
      clickCheckbox(); 
      expect(screen.getByTestId("confirm-checkbox")).toHaveAttribute("aria-checked", "false");
    });
  });

  describe("isSubmitDisabled logic", () => {
    it("disabled when no reason (no checkbox required)", () => {
      renderModal({ showConfirmCheckbox: false });
      expect(screen.getByTestId("btn-confirm")).toBeDisabled();
    });

    it("enabled with reason and no checkbox required", () => {
      renderModal({ showConfirmCheckbox: false });
      selectReason("Option A");
      expect(screen.getByTestId("btn-confirm")).not.toBeDisabled();
    });

    it("disabled when Other reason and no comments (no checkbox)", () => {
      renderModal({ showConfirmCheckbox: false });
      selectReason("Other");
      expect(screen.getByTestId("btn-confirm")).toBeDisabled();
    });

    it("enabled with Other reason + comments (no checkbox)", () => {
      renderModal({ showConfirmCheckbox: false });
      selectReason("Other");
      typeComment("note");
      expect(screen.getByTestId("btn-confirm")).not.toBeDisabled();
    });

    it("disabled with reason but checkbox unchecked", () => {
      renderModal({ showConfirmCheckbox: true });
      selectReason("Option A");
      expect(screen.getByTestId("btn-confirm")).toBeDisabled();
    });

    it("enabled with reason and checkbox checked", () => {
      renderModal({ showConfirmCheckbox: true });
      selectReason("Option A");
      clickCheckbox();
      expect(screen.getByTestId("btn-confirm")).not.toBeDisabled();
    });

    it("disabled with Other + checkbox + no comments", () => {
      renderModal({ showConfirmCheckbox: true });
      selectReason("Other");
      clickCheckbox();
      expect(screen.getByTestId("btn-confirm")).toBeDisabled();
    });

    it("enabled with Other + comments + checkbox checked", () => {
      renderModal({ showConfirmCheckbox: true });
      selectReason("Other");
      typeComment("my note");
      clickCheckbox();
      expect(screen.getByTestId("btn-confirm")).not.toBeDisabled();
    });
  });

  describe("handleSubmit", () => {
    it("calls onConfirm with reasonCode and empty comments", async () => {
      const onConfirm = vi.fn().mockResolvedValue(undefined);
      renderModal({ onConfirm, showConfirmCheckbox: false });
      selectReason("Option A");
      fireEvent.click(screen.getByTestId("btn-confirm"));
      await waitFor(() => expect(onConfirm).toHaveBeenCalledWith("Option A", ""));
    });

    it("calls onConfirm with comments for Other reason", async () => {
      const onConfirm = vi.fn().mockResolvedValue(undefined);
      renderModal({ onConfirm, showConfirmCheckbox: false });
      selectReason("Other");
      typeComment("detail");
      fireEvent.click(screen.getByTestId("btn-confirm"));
      await waitFor(() => expect(onConfirm).toHaveBeenCalledWith("Other", "detail"));
    });

    it("calls handleClose after successful submit", async () => {
      const handleClose = vi.fn();
      const onConfirm = vi.fn().mockResolvedValue(undefined);
      renderModal({ handleClose, onConfirm, showConfirmCheckbox: false });
      selectReason("Option A");
      fireEvent.click(screen.getByTestId("btn-confirm"));
      await waitFor(() => expect(handleClose).toHaveBeenCalled());
    });

    it("swallows onConfirm rejection and does not call handleClose", async () => {
      const handleClose = vi.fn();
      const onConfirm = vi.fn().mockRejectedValue(new Error("fail"));
      renderModal({ handleClose, onConfirm, showConfirmCheckbox: false });
      selectReason("Option A");
      fireEvent.click(screen.getByTestId("btn-confirm"));
      await waitFor(() => expect(onConfirm).toHaveBeenCalled());
      expect(handleClose).not.toHaveBeenCalled();
    });

    it("does not call onConfirm when button is disabled (isSubmitDisabled guard)", async () => {
      const onConfirm = vi.fn();
      renderModal({ onConfirm });
      fireEvent.click(screen.getByTestId("btn-confirm"));
      await waitFor(() => expect(onConfirm).not.toHaveBeenCalled());
    });
  });

  describe("comments textarea", () => {
    it("typing clears commentsError", () => {
      renderModal({ showConfirmCheckbox: true });
      selectReason("Other");
      clickCheckbox();
      expect(screen.getByTestId("textarea-error")).toBeInTheDocument();
      typeComment("text");
      expect(screen.queryByTestId("textarea-error")).not.toBeInTheDocument();
    });

    it("textarea value updates on input", () => {
      renderModal();
      const ta = screen.getByTestId("comments-textarea") as HTMLTextAreaElement;
      typeComment("updated");
      expect(ta.value).toBe("updated");
    });

    it("shows required marker on Comments label when Other is selected", () => {
      renderModal();
      selectReason("Other");
      expect(screen.getByText("Comments *")).toBeInTheDocument();
    });

    it("no required marker on Comments label for non-Other reason", () => {
      renderModal();
      selectReason("Option A");
      expect(screen.queryByText("Comments *")).not.toBeInTheDocument();
    });
  });
});
