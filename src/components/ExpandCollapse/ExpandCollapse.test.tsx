import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ExpandCollapse from "./ExpandCollapse";

vi.mock("./ExpandCollapse.scss", () => ({}));

vi.mock("@ucc/common-ui", () => ({
  CustomTable: ({ data }: { data: any[] }) => (
    <table data-testid="custom-table">
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            <td>{JSON.stringify(row)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
}));

vi.mock("react-icons/bs", () => ({
  BsChevronDown: () => <span data-testid="chevron-down" />,
  BsChevronRight: () => <span data-testid="chevron-right" />,
}));

const defaultProps = {
  title: "Test Section",
  data: [{ id: 1, name: "Row 1" }],
  columns: [{ label: "Name", field: "name" }],
};

describe("ExpandCollapse", () => {
  it("renders collapsed by default", () => {
    render(<ExpandCollapse {...defaultProps} />);

    expect(screen.getByText("Test Section")).toBeInTheDocument();
    expect(screen.queryByTestId("custom-table")).not.toBeInTheDocument();
    expect(screen.getByTestId("chevron-right")).toBeInTheDocument();
  });

  it("renders expanded when defaultExpanded is true", () => {
    render(<ExpandCollapse {...defaultProps} defaultExpanded={true} />);

    expect(screen.getByTestId("custom-table")).toBeInTheDocument();
    expect(screen.getByTestId("chevron-down")).toBeInTheDocument();
  });

  it("toggles expanded state on click", () => {
    render(<ExpandCollapse {...defaultProps} />);

    const header = screen.getByRole("button");
    fireEvent.click(header);

    expect(screen.getByTestId("custom-table")).toBeInTheDocument();
    expect(screen.getByTestId("chevron-down")).toBeInTheDocument();

    fireEvent.click(header);

    expect(screen.queryByTestId("custom-table")).not.toBeInTheDocument();
    expect(screen.getByTestId("chevron-right")).toBeInTheDocument();
  });

  it("calls onToggle with new state", () => {
    const onToggle = vi.fn();
    render(<ExpandCollapse {...defaultProps} onToggle={onToggle} />);

    const header = screen.getByRole("button");
    fireEvent.click(header);

    expect(onToggle).toHaveBeenCalledWith(true);

    fireEvent.click(header);
    expect(onToggle).toHaveBeenCalledWith(false);
  });

  it("toggles on Enter key", () => {
    render(<ExpandCollapse {...defaultProps} />);

    const header = screen.getByRole("button");
    fireEvent.keyDown(header, { key: "Enter" });

    expect(screen.getByTestId("custom-table")).toBeInTheDocument();
  });

  it("toggles on Space key", () => {
    render(<ExpandCollapse {...defaultProps} />);

    const header = screen.getByRole("button");
    fireEvent.keyDown(header, { key: " " });

    expect(screen.getByTestId("custom-table")).toBeInTheDocument();
  });

  it("has correct aria-expanded attribute", () => {
    render(<ExpandCollapse {...defaultProps} />);

    const header = screen.getByRole("button");
    expect(header).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(header);
    expect(header).toHaveAttribute("aria-expanded", "true");
  });

  it("renders subtitle when provided", () => {
    render(<ExpandCollapse {...defaultProps} subtitle="Sub text" />);
    expect(screen.getByText("Sub text")).toBeInTheDocument();
  });
});
