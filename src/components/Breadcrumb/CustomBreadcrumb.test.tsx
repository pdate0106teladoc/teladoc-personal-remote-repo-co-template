import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Breadcrumb from "./CustomBreadcrumb";

vi.mock("@ucc/common-ui", () => ({
  ArrowDivider: ({ className }: { className?: string }) => (
    <span data-testid="arrow-divider" className={className} />
  ),
}));

describe("CustomBreadcrumb", () => {
  it("renders all item labels", () => {
    render(<Breadcrumb items={["Step 1", "Step 2", "Step 3"]} />);

    expect(screen.getByText("Step 1")).toBeInTheDocument();
    expect(screen.getByText("Step 2")).toBeInTheDocument();
    expect(screen.getByText("Step 3")).toBeInTheDocument();
  });

  it("renders arrow dividers between items but not after last", () => {
    render(<Breadcrumb items={["A", "B", "C"]} />);

    const dividers = screen.getAllByTestId("arrow-divider");
    expect(dividers).toHaveLength(2);
  });

  it("renders no dividers for a single item", () => {
    render(<Breadcrumb items={["Only"]} />);

    expect(screen.queryByTestId("arrow-divider")).not.toBeInTheDocument();
  });

  it("applies active class to item at activeIndex", () => {
    const { container } = render(
      <Breadcrumb items={["First", "Second", "Third"]} activeIndex={1} />,
    );

    const items = container.querySelectorAll(".breadcrumb-item");
    expect(items[0]).not.toHaveClass("active");
    expect(items[1]).toHaveClass("active");
    expect(items[2]).not.toHaveClass("active");
  });

  it("renders no active class when activeIndex is not provided", () => {
    const { container } = render(<Breadcrumb items={["A", "B"]} />);

    const items = container.querySelectorAll(".breadcrumb-item");
    items.forEach((item) => {
      expect(item).not.toHaveClass("active");
    });
  });

  it("renders the nav element with custom-breadcrumb class", () => {
    const { container } = render(<Breadcrumb items={["A"]} />);
    expect(container.querySelector("nav.custom-breadcrumb")).toBeInTheDocument();
  });
});
