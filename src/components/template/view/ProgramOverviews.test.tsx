import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ProgramOverviews from "./ProgramOverviews";
import { ALLIED_PROGRAM_OVERVIEWS } from "./programOverviewData";

vi.mock("@ucc/common-ui", () => ({
  CalendarIcon: () => <span data-testid="calendar-icon" />,
  Button: ({ children, ...rest }: any) => <button {...rest}>{children}</button>,
}));

vi.mock("@/assets", () => ({
  RightArrow: () => <span data-testid="right-arrow" />,
  DarkPlusIcon: () => <span data-testid="plus-icon" />,
  DustbinIcon: () => <span data-testid="dustbin-icon" />,
}));

describe("ProgramOverviews", () => {
  it("renders a card per program overview with program and launch date", () => {
    render(<ProgramOverviews />);

    expect(screen.getByRole("heading", { name: "2 Program Overviews" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Allied - Diabetes Care" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Allied - Hypertension" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Program")).toHaveLength(2);
    expect(screen.getByText("Diabetes Care")).toBeInTheDocument();
    expect(screen.getByText("Hypertension")).toBeInTheDocument();
    expect(screen.getAllByText("Initial launch date")).toHaveLength(2);
    expect(screen.getAllByText("Jan 1, 2026")).toHaveLength(2);
  });

  it("singularizes the panel title for a single overview", () => {
    render(<ProgramOverviews overviews={ALLIED_PROGRAM_OVERVIEWS.slice(0, 1)} />);

    expect(screen.getByRole("heading", { name: "1 Program Overview" })).toBeInTheDocument();
  });

  it("shows the empty state with an add action when there are none", () => {
    const onAddProgramOverview = vi.fn();
    render(
      <ProgramOverviews overviews={[]} onAddProgramOverview={onAddProgramOverview} />,
    );

    expect(screen.getByText("No Program Overview")).toBeInTheDocument();
    expect(screen.queryByText("0 Program Overviews")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Add Program Overview" }));

    expect(onAddProgramOverview).toHaveBeenCalledTimes(1);
  });

  it("reports the selected program overview", () => {
    const onSelectProgramOverview = vi.fn();
    render(<ProgramOverviews onSelectProgramOverview={onSelectProgramOverview} />);

    fireEvent.click(screen.getByRole("button", { name: "Allied - Hypertension" }));

    expect(onSelectProgramOverview).toHaveBeenCalledWith(ALLIED_PROGRAM_OVERVIEWS[1]);
  });

  it("hides the add and delete controls outside edit mode", () => {
    render(<ProgramOverviews />);

    expect(
      screen.queryByRole("button", { name: "Add Program Overview" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Delete Allied - Diabetes Care" }),
    ).not.toBeInTheDocument();
  });

  it("adds and deletes from the same list in edit mode", () => {
    const onAddProgramOverview = vi.fn();
    const onDeleteProgramOverview = vi.fn();
    render(
      <ProgramOverviews
        editable
        onAddProgramOverview={onAddProgramOverview}
        onDeleteProgramOverview={onDeleteProgramOverview}
      />,
    );

    expect(screen.getByRole("heading", { name: "2 Program Overviews" })).toBeInTheDocument();
    expect(screen.getByText("Diabetes Care")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Add Program Overview" }));
    expect(onAddProgramOverview).toHaveBeenCalledTimes(1);

    fireEvent.click(
      screen.getByRole("button", { name: "Delete Allied - Diabetes Care" }),
    );
    expect(onDeleteProgramOverview).toHaveBeenCalledWith(ALLIED_PROGRAM_OVERVIEWS[0]);
  });
});
