import { fireEvent, render, screen, within } from "@testing-library/react";
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
    const generalSettings = within(
      screen.getByRole("tabpanel", { name: "General settings" }),
    );

    expect(generalSettings.getByRole("heading", { name: "Program Overview" })).toBeInTheDocument();
    expect(generalSettings.getByText("Program Platform Version")).toBeInTheDocument();
    expect(generalSettings.getByText("Retrofit")).toBeInTheDocument();
    expect(generalSettings.getByText("Connor Hudson")).toBeInTheDocument();
    expect(generalSettings.getByText("Partner Pass Through Price")).toBeInTheDocument();
    expect(generalSettings.getByRole("heading", { name: "Program Schedule" })).toBeInTheDocument();
    expect(generalSettings.getByText("Teamcare - Compr")).toBeInTheDocument();
    expect(generalSettings.getByRole("heading", { name: "Client Incentives" })).toBeInTheDocument();
    expect(
      generalSettings.getByRole("heading", { name: "Client implementation" }),
    ).toBeInTheDocument();
    expect(generalSettings.getByText("Confirm on no recruitable match")).toBeInTheDocument();
  });

  it("collapses and expands the Program Overview section", () => {
    render(<ProgramOverviewDetail overview={diabetesCare} onBack={vi.fn()} />);

    const toggle = within(
      screen.getByRole("tabpanel", { name: "General settings" }),
    ).getByRole("button", { name: "Program Overview" });
    fireEvent.click(toggle);

    expect(screen.queryByText("Program Platform Version")).not.toBeInTheDocument();

    fireEvent.click(toggle);

    expect(screen.getByText("Program Platform Version")).toBeInTheDocument();
  });

  it("renders Marketing, Eligibility, and Engagement criteria fields", () => {
    render(<ProgramOverviewDetail overview={diabetesCare} onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole("tab", { name: "Marketing" }));
    const marketing = within(
      screen.getByRole("tabpanel", { name: "Marketing" }),
    );
    expect(
      marketing.getByRole("heading", { name: "Client Incentives" }),
    ).toBeInTheDocument();
    expect(marketing.getByText("Days Checking")).toBeInTheDocument();
    expect(marketing.getByText("Phone + SMS")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Eligibility" }));
    expect(
      screen.getByRole("heading", { name: "Program Eligibility" }),
    ).toBeInTheDocument();
    expect(screen.getByText("RTE + (File OR Group ID)")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Engagement criteria" }));
    expect(
      screen.getByRole("heading", { name: "Program Engagement Criteria" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Default ESI")).toBeInTheDocument();
    expect(screen.getByText("Cumulative unique days with weigh-ins")).toBeInTheDocument();
  });

  it("renders the read-only program billing schedule", () => {
    render(<ProgramOverviewDetail overview={diabetesCare} onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole("tab", { name: "Billing" }));

    expect(
      screen.getByRole("heading", { name: "Contract: Program Schedule" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Billing Partner Fee Type")).toBeInTheDocument();
    expect(screen.getByText("Administrative")).toBeInTheDocument();
    expect(screen.getByText("First Device Reading")).toBeInTheDocument();
    expect(screen.getByText("Blood Glucose Meter")).toBeInTheDocument();
  });

  it("calls onBack from the Back control", () => {
    const onBack = vi.fn();
    render(<ProgramOverviewDetail overview={diabetesCare} onBack={onBack} />);

    fireEvent.click(screen.getByRole("button", { name: "Back" }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
