import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

import { BillingBadge } from "./BillingBadge";

vi.mock("@ucc/common-ui", () => ({
  SuccessIcon: ({ className }: { className?: string }) => (
    <svg data-testid="success-icon" className={className} />
  ),
}));

describe("BillingBadge", () => {
  it("renders 'Not applicable' badge when isGroup is true", () => {
    render(<BillingBadge isGroup />);

    const badge = screen.getByText("Not applicable");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("badge-status", "na");

    expect(screen.queryByTestId("success-icon")).not.toBeInTheDocument();
  });

  it("renders 'Yes' with correct icon when billingOrg is true", () => {
    render(<BillingBadge billingOrg />);

    const icon = screen.getByTestId("success-icon");
    expect(icon).toBeInTheDocument();
    expect(icon).not.toHaveClass("svg-grey");

    expect(screen.getByText("Yes")).toBeInTheDocument();
  });

  it("renders 'No' with incorrect icon when billingOrg is false", () => {
    render(<BillingBadge billingOrg={false} />);

    const icon = screen.getByTestId("success-icon");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass("svg-grey");

    expect(screen.getByText("No")).toBeInTheDocument();
  });

  it("defaults billingOrg to false when undefined", () => {
    render(<BillingBadge />);

    const icon = screen.getByTestId("success-icon");
    expect(icon).toHaveClass("svg-grey");

    expect(screen.getByText("No")).toBeInTheDocument();
  });
});
