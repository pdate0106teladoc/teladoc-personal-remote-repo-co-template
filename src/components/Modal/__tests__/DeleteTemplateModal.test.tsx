import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import DeleteTemplateModal from "../DeleteTemplateModal";

vi.mock("../DeleteTemplateModal.scss", () => ({}));

vi.mock("@ucc/common-ui", () => ({
  Modal: ({ show, title, children, footer }: any) =>
    show ? (
      <div role="dialog" aria-label={title}>
        {children}
        {footer}
      </div>
    ) : null,
  Button: ({ children, onClick }: any) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock("@/assets", () => ({
  DustbinIcon: () => <span data-testid="dustbin-icon" />,
}));

describe("DeleteTemplateModal", () => {
  const onHide = vi.fn();
  const onConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the remove copy when shown", () => {
    render(
      <DeleteTemplateModal show onHide={onHide} onConfirm={onConfirm} />,
    );

    expect(
      screen.getByRole("dialog", { name: "Remove template?" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Are you sure you want to remove this template ? This action can't be undone.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId("dustbin-icon")).toBeInTheDocument();
  });

  it("does not render when hidden", () => {
    render(
      <DeleteTemplateModal
        show={false}
        onHide={onHide}
        onConfirm={onConfirm}
      />,
    );

    expect(
      screen.queryByRole("dialog", { name: "Remove template?" }),
    ).not.toBeInTheDocument();
  });

  it("keeps the template when Keep template is clicked", () => {
    render(
      <DeleteTemplateModal show onHide={onHide} onConfirm={onConfirm} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Keep template" }));

    expect(onHide).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("confirms deletion when Delete template is clicked", () => {
    render(
      <DeleteTemplateModal show onHide={onHide} onConfirm={onConfirm} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete template" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
