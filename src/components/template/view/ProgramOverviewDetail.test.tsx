import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ProgramOverviewDetail from "./ProgramOverviewDetail";
import { ALLIED_PROGRAM_OVERVIEWS } from "./programOverviewData";

vi.mock("@ucc/common-ui", () => ({
  DisplayRow: ({ label, value, format, personMeta }: any) => (
    <div data-testid="display-row">
      <span>{label}</span>
      <span>{format === "person" ? personMeta?.initials : ""}</span>
      <span>{format === "person" ? personMeta?.name : String(value)}</span>
    </div>
  ),
  FailSafePage: ({ cardType }: any) => <div data-testid="failsafe-page">{cardType}</div>,
}));

vi.mock("@/assets", () => ({
  ArrowLeft: () => <span data-testid="arrow-left" />,
}));

const [diabetesCare] = ALLIED_PROGRAM_OVERVIEWS;

describe("ProgramOverviewDetail", () => {
  it("shows the program name and its own tab set", () => {
    render(<ProgramOverviewDetail overview={diabetesCare} onBack={vi.fn()} />);

    expect(
      screen.getByRole("heading", { name: "Allied - Diabetes Care" }),
    ).toBeInTheDocument();
    ["General settings", "Billing", "Marketing", "Eligibility", "Engagement criteria"].forEach(
      (title) => {
        expect(screen.getByRole("tab", { name: title })).toBeInTheDocument();
      },
    );
  });

  it("renders the Program Overview section fields", () => {
    render(<ProgramOverviewDetail overview={diabetesCare} onBack={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Program Overview" })).toBeInTheDocument();
    expect(screen.getByText("Program Platform Version")).toBeInTheDocument();
    expect(screen.getByText("Retrofit")).toBeInTheDocument();
    expect(screen.getByText("Connor Hudson")).toBeInTheDocument();
    expect(screen.getByText("Partner Pass Through Price")).toBeInTheDocument();
  });

  it("collapses and expands the Program Overview section", () => {
    render(<ProgramOverviewDetail overview={diabetesCare} onBack={vi.fn()} />);

    const toggle = screen.getByRole("button", { name: "Program Overview" });
    fireEvent.click(toggle);

    expect(screen.queryByText("Program Platform Version")).not.toBeInTheDocument();

    fireEvent.click(toggle);

    expect(screen.getByText("Program Platform Version")).toBeInTheDocument();
  });

  it("switches to a sibling tab", () => {
    render(<ProgramOverviewDetail overview={diabetesCare} onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole("tab", { name: "Engagement criteria" }));

    expect(screen.getAllByTestId("failsafe-page").length).toBeGreaterThan(0);
  });

  it("calls onBack from the Back control", () => {
    const onBack = vi.fn();
    render(<ProgramOverviewDetail overview={diabetesCare} onBack={onBack} />);

    fireEvent.click(screen.getByRole("button", { name: "Back" }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
