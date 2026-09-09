import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ProgramOverviews from "./ProgramOverviews";

vi.mock("@ucc/common-ui", () => ({
  CalendarIcon: () => <span />,
  Button: ({ children, ...rest }: any) => <button {...rest}>{children}</button>,
}));

vi.mock("@/assets", () => ({
  RightArrow: () => <span />,
  DarkPlusIcon: () => <span />,
  DustbinIcon: () => <span />,
}));

describe("edit ProgramOverviews", () => {
  it("shows the view list with the edit-mode controls", () => {
    render(<ProgramOverviews />);

    expect(
      screen.getByRole("heading", { name: "2 Program Overviews" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add Program Overview" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Delete Allied - Diabetes Care" }),
    ).toBeInTheDocument();
  });

  it("removes a card when its delete control is used", () => {
    render(<ProgramOverviews />);

    fireEvent.click(
      screen.getByRole("button", { name: "Delete Allied - Diabetes Care" }),
    );

    expect(screen.queryByText("Diabetes Care")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "1 Program Overview" }),
    ).toBeInTheDocument();
  });

  it("falls back to the empty state once every card is deleted", () => {
    render(<ProgramOverviews />);

    fireEvent.click(
      screen.getByRole("button", { name: "Delete Allied - Diabetes Care" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Delete Allied - Hypertension" }),
    );

    expect(screen.getByText("No Program Overview")).toBeInTheDocument();
  });
});
