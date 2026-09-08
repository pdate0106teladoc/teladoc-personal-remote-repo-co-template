import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PendingRibbon from "./PendingRibbon";

vi.mock("./PendingRibbon.scss", () => ({}));

vi.mock("react-icons/fa6", () => ({
  FaTriangleExclamation: () => <span data-testid="warning-icon" />,
}));

vi.mock("@ucc/common-ui", () => ({
  SideModal: ({ show, title, onHide, children }: any) =>
    show ? (
      <div data-testid="side-modal">
        <h2>{title}</h2>
        <button data-testid="close-modal" onClick={onHide}>
          Close
        </button>
        {children}
      </div>
    ) : null,
}));

vi.mock("../sidebar/PendingChangesSidebar", () => ({
  default: ({ data }: any) => (
    <div data-testid="pending-changes-sidebar">
      {data.length} pending tasks
    </div>
  ),
}));

const mockTasks = [
  { taskId: "T-1", status: "IN_PROGRESS", updatedBy: "User A" },
  { taskId: "T-2", status: "PENDING", updatedBy: "User B" },
];

describe("PendingRibbon", () => {
  it("renders the warning message", () => {
    render(<PendingRibbon data={mockTasks as any} />);
    expect(
      screen.getByText("There are pending changes for the current organization."),
    ).toBeInTheDocument();
  });

  it("renders warning icon", () => {
    render(<PendingRibbon data={mockTasks as any} />);
    expect(screen.getByTestId("warning-icon")).toBeInTheDocument();
  });

  it("opens SideModal on View details click", () => {
    render(<PendingRibbon data={mockTasks as any} />);

    expect(screen.queryByTestId("side-modal")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("View details"));

    expect(screen.getByTestId("side-modal")).toBeInTheDocument();
    expect(screen.getByText("Pending changes")).toBeInTheDocument();
  });

  it("renders PendingChangesSidebar with data inside modal", () => {
    render(<PendingRibbon data={mockTasks as any} />);

    fireEvent.click(screen.getByText("View details"));

    expect(screen.getByTestId("pending-changes-sidebar")).toBeInTheDocument();
    expect(screen.getByText("2 pending tasks")).toBeInTheDocument();
  });

  it("closes SideModal on hide", () => {
    render(<PendingRibbon data={mockTasks as any} />);

    fireEvent.click(screen.getByText("View details"));
    expect(screen.getByTestId("side-modal")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("close-modal"));
    expect(screen.queryByTestId("side-modal")).not.toBeInTheDocument();
  });
});
