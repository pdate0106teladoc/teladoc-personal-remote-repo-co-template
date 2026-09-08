import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import WorkflowHistory from "../WorkflowHistory";

vi.mock("../WorkflowHistory.scss", () => ({}));

vi.mock("@ucc/common-ui", () => ({
  FailSafePage: ({ cardType }: any) => <div data-testid={`failsafe-${cardType}`} />,
}));

vi.mock("@/components/ExtractValue/ExtractDisplayValue", () => ({
  extractDisplayValue: (val: any) => ({ jsx: <span data-testid="person">{val}</span> }),
}));

vi.mock("@/utils", () => ({
  formatUTCtoDateOnly: (v: any, ..._args: any[]) => `formatted-${v}`,
}));

vi.mock("@/assets", () => ({
  FileIcon: () => <span data-testid="file-icon" />,
}));

const mockItems = [
  {
    dateTime: "2025-01-15T10:00:00Z",
    statusLabel: "Draft",
    userName: "John Doe",
    reason: null,
    comments: null,
  },
  {
    dateTime: "2025-01-16T14:30:00Z",
    statusLabel: "Pending Quality Review",
    userName: "Jane Smith",
    reason: "Delayed launch",
    comments: "Waiting for client approval",
  },
  {
    dateTime: "2025-01-17T09:00:00Z",
    statusLabel: "Completed",
    userName: "Admin User",
    reason: null,
    comments: null,
  },
];

describe("WorkflowHistory", () => {
  it("renders FailSafePage when items array is empty", () => {
    render(<WorkflowHistory items={[]} />);
    expect(screen.getByTestId("failsafe-noData")).toBeInTheDocument();
  });

  it("renders timeline items with status", () => {
    render(<WorkflowHistory items={mockItems} />);

    expect(screen.getByText("Draft")).toBeInTheDocument();
    expect(screen.getByText("Pending Quality Review")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("renders user names for each item", () => {
    render(<WorkflowHistory items={mockItems} />);

    const persons = screen.getAllByTestId("person");
    expect(persons).toHaveLength(3);
    expect(persons[0]).toHaveTextContent("John Doe");
    expect(persons[1]).toHaveTextContent("Jane Smith");
    expect(persons[2]).toHaveTextContent("Admin User");
  });

  it("renders formatted date for each item", () => {
    render(<WorkflowHistory items={mockItems} />);

    expect(screen.getByText(/formatted-2025-01-15T10:00:00Z/)).toBeInTheDocument();
    expect(screen.getByText(/formatted-2025-01-16T14:30:00Z/)).toBeInTheDocument();
    expect(screen.getByText(/formatted-2025-01-17T09:00:00Z/)).toBeInTheDocument();
  });

  it("renders reason when present", () => {
    render(<WorkflowHistory items={mockItems} />);

    expect(screen.getByText("Reason")).toBeInTheDocument();
    expect(screen.getByText("Delayed launch")).toBeInTheDocument();
  });

  it("renders comments when present", () => {
    render(<WorkflowHistory items={mockItems} />);

    expect(screen.getByText("Comments")).toBeInTheDocument();
    expect(screen.getByText("Waiting for client approval")).toBeInTheDocument();
  });

  it("does not render reason/comments when null", () => {
    render(<WorkflowHistory items={[mockItems[0]]} />);

    expect(screen.queryByText("Reason")).not.toBeInTheDocument();
    expect(screen.queryByText("Comments")).not.toBeInTheDocument();
  });

  it("renders file icons for each item", () => {
    render(<WorkflowHistory items={mockItems} />);

    const icons = screen.getAllByTestId("file-icon");
    expect(icons).toHaveLength(3);
  });

  it("last item gets workflow-line-isLast class", () => {
    const { container } = render(<WorkflowHistory items={mockItems} />);

    const lines = container.querySelectorAll('[class*="workflow-line"]');
    const lastLine = lines[lines.length - 1];
    expect(lastLine?.className).toContain("isLast");
  });

  it("non-last items get regular workflow-line class", () => {
    const { container } = render(<WorkflowHistory items={mockItems} />);

    const regularLines = container.querySelectorAll(".workflow-line");
    expect(regularLines.length).toBe(2);
  });

  it("renders without crashing when items is undefined", () => {
    const { container } = render(<WorkflowHistory />);
    expect(container.querySelector(".workflow-history")).toBeInTheDocument();
  });

  it("does not render user section when userName is missing", () => {
    const itemsWithoutUser = [
      { dateTime: "2025-01-15T10:00:00Z", statusLabel: "Draft" },
    ];
    render(<WorkflowHistory items={itemsWithoutUser as any} />);

    expect(screen.getByText("Draft")).toBeInTheDocument();
    expect(screen.queryByTestId("person")).not.toBeInTheDocument();
  });
});
