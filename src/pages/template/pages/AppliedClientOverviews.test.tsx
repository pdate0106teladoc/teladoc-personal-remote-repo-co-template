import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AppliedClientOverviews from "./AppliedClientOverviews";

vi.mock("@ucc/common-ui", () => ({
  CustomTable: ({ data, columns }: any) => (
    <div data-testid="applied-table">
      <table>
        <tbody>
          {data.map((row: any) => (
            <tr key={row.id}>
              {columns.map((column: any) => (
                <td key={column.field}>
                  {column.render ? column.render(row[column.field], row) : row[column.field]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
  PaginationView: ({ currentPage, rowsPerPage, displayTotal, onPageChange }: any) => (
    <div data-testid="pagination-view">
      <span data-testid="page-label">{`${currentPage + 1} of ${Math.ceil(displayTotal / rowsPerPage) || 1}`}</span>
      <span data-testid="total-records">{displayTotal}</span>
      <button type="button" onClick={() => onPageChange(currentPage + 1)}>
        Next Page
      </button>
    </div>
  ),
}));

vi.mock("@/components/RoundedLabel/RoundedLabel", () => ({
  default: ({ text }: any) => <span>{text}</span>,
}));

vi.mock("@/assets", () => ({
  OpenIcon: () => <span data-testid="open-icon" />,
}));

describe("AppliedClientOverviews", () => {
  it("renders Active rows with cohort, status, groups, and last-updated entity", () => {
    render(<AppliedClientOverviews />);

    expect(screen.getByRole("tab", { name: "Active (115)" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Terminated (10)" })).toBeInTheDocument();
    expect(screen.getByText("Allied 12/1/25 WP DM+HTN+DPP Cohort")).toBeInTheDocument();
    expect(screen.getAllByText("Contract number: 202503-0012654").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Active").length).toBeGreaterThan(0);
    expect(screen.getAllByText("25 groups").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Joe's Pizza").length).toBeGreaterThan(0);
    expect(screen.getByTestId("total-records")).toHaveTextContent("115");
    expect(screen.getByTestId("page-label")).toHaveTextContent("1 of 5");
  });

  it("renders Applied Organisation rows with last updated on dates", () => {
    render(<AppliedClientOverviews variant="organisation" />);

    expect(
      screen.getAllByText("541 - Blue Cross Blue Shield of NC").length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText(/Contract number:/)).not.toBeInTheDocument();
    expect(screen.getAllByText("25 groups").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Jan 1, 2025").length).toBeGreaterThan(0);
    expect(screen.queryByText("Joe's Pizza")).not.toBeInTheDocument();
  });

  it("renders Applied Group rows with last updated on dates", () => {
    render(<AppliedClientOverviews variant="group" />);

    expect(
      screen.getAllByText("541 - Blue Cross Blue Shield of NC").length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText(/Contract number:/)).not.toBeInTheDocument();
    expect(screen.getAllByText("Jan 1, 2025").length).toBeGreaterThan(0);
    expect(screen.queryByText("Joe's Pizza")).not.toBeInTheDocument();
  });

  it("switches to Terminated rows", () => {
    render(<AppliedClientOverviews />);

    fireEvent.click(screen.getByRole("tab", { name: "Terminated (10)" }));

    expect(screen.getByTestId("total-records")).toHaveTextContent("10");
    expect(screen.getByTestId("page-label")).toHaveTextContent("1 of 1");
    expect(screen.getAllByText("Terminated").length).toBeGreaterThan(0);
  });

  it("advances the shared PaginationView", () => {
    render(<AppliedClientOverviews />);

    fireEvent.click(screen.getByRole("button", { name: "Next Page" }));

    expect(screen.getByTestId("page-label")).toHaveTextContent("2 of 5");
  });
});
