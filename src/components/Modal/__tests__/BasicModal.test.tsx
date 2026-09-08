import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import BasicModal from "../BasicModal";

vi.mock("../BasicModal.scss", () => ({}));

vi.mock("@ucc/common-ui", () => ({
  Modal: ({ show, title, children, footer }: any) =>
    show ? (
      <div data-testid="modal">
        <h1>{title}</h1>
        <div data-testid="modal-body">{children}</div>
        {footer && <div data-testid="modal-footer">{footer}</div>}
      </div>
    ) : null,
  Button: ({ children, onClick, className }: any) => (
    <button data-testid={`btn-${className || "default"}`} onClick={onClick}>
      {children}
    </button>
  ),
}));

describe("BasicModal", () => {
  const defaultProps = {
    title: "Test Modal",
    content: "Modal content here",
    show: true,
    handleClose: vi.fn(),
  };

  it("renders title and content when show is true", () => {
    render(<BasicModal {...defaultProps} />);
    expect(screen.getByText("Test Modal")).toBeInTheDocument();
    expect(screen.getByText("Modal content here")).toBeInTheDocument();
  });

  it("does not render when show is false", () => {
    render(<BasicModal {...defaultProps} show={false} />);
    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
  });

  it("renders footer with button1 that calls handleClose", () => {
    const handleClose = vi.fn();
    render(<BasicModal {...defaultProps} button1="Cancel" handleClose={handleClose} />);

    fireEvent.click(screen.getByText("Cancel"));
    expect(handleClose).toHaveBeenCalled();
  });

  it("renders footer with button2 that calls onBtnClick2", () => {
    const onBtnClick2 = vi.fn();
    render(
      <BasicModal {...defaultProps} button2="Confirm" onBtnClick2={onBtnClick2} />,
    );

    fireEvent.click(screen.getByText("Confirm"));
    expect(onBtnClick2).toHaveBeenCalled();
  });

  it("renders both buttons when both provided", () => {
    render(
      <BasicModal
        {...defaultProps}
        button1="Cancel"
        button2="OK"
        onBtnClick2={vi.fn()}
      />,
    );

    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("OK")).toBeInTheDocument();
  });

  it("renders no footer when no buttons provided", () => {
    render(<BasicModal {...defaultProps} />);
    expect(screen.queryByTestId("modal-footer")).not.toBeInTheDocument();
  });
});
