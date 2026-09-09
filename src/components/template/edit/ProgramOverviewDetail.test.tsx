import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ProgramOverviewDetail from "./ProgramOverviewDetail";
import { buildProgramOverviewEditForm } from "./programOverviewForm";
import type { ProgramOverviewSummary } from "@/components/template/view";

vi.mock("@ucc/common-ui", () => ({
  FailSafePage: ({ cardType }: any) => <div>{cardType}</div>,
  CustomInput: ({ value, onChange, id, name, type }: any) => (
    <input id={id} name={name} type={type} value={value} onChange={onChange} />
  ),
  CustomRadioGroup: ({ value, onChange }: any) => (
    <div>
      <button type="button" aria-pressed={value === true} onClick={() => onChange(true)}>
        Yes
      </button>
      <button type="button" aria-pressed={value === false} onClick={() => onChange(false)}>
        No
      </button>
    </div>
  ),
  CustomDropdown: ({ value, onChange, options, placeholder }: any) => (
    <select value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">{placeholder}</option>
      {options?.map((option: { label: string; value: string }) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));

vi.mock("@/assets", () => ({
  ArrowLeft: () => <span />,
}));

const overview: ProgramOverviewSummary = {
  id: "allied-diabetes-care",
  name: "Allied - Diabetes Care",
  program: "Diabetes",
  initialLaunchDate: "2025-01-01T00:00:00Z",
};

const renderDetail = (onChange = vi.fn(), onBack = vi.fn()) => {
  render(
    <ProgramOverviewDetail
      overview={overview}
      form={buildProgramOverviewEditForm(overview)}
      onChange={onChange}
      onBack={onBack}
    />,
  );
  return { onChange, onBack };
};

describe("edit ProgramOverviewDetail", () => {
  it("names the program overview it is editing and lists its tabs", () => {
    renderDetail();

    expect(
      screen.getByRole("heading", {
        name: "Program Overview: Allied - Diabetes Care",
      }),
    ).toBeInTheDocument();
    ["General settings", "Billing", "Marketing", "Eligibility", "Engagement criteria"].forEach(
      (title) => {
        expect(screen.getByRole("tab", { name: title })).toBeInTheDocument();
      },
    );
  });

  it("seeds the form with the overview's values, editable and read-only", () => {
    renderDetail();

    expect(screen.getByLabelText("Program Platform Version")).toHaveValue("Retrofit");
    expect(screen.getByLabelText("Initial Launch Date")).toHaveValue("2025-01-01");
    // The currency symbol sits inside the label, so match on the field name.
    expect(screen.getByLabelText(/Partner Pass Through Price/)).toHaveValue("0.00");
    // Template-owned values are shown as text rather than inputs.
    const readOnly = { selector: ".read-only-value" };
    expect(screen.getByText("Diabetes", readOnly)).toBeInTheDocument();
    expect(screen.getByText("Aetna", readOnly)).toBeInTheDocument();
    expect(screen.queryByLabelText("Program")).not.toBeInTheDocument();
  });

  it("reports edits to dropdowns, text, and radio fields", () => {
    const { onChange } = renderDetail();

    fireEvent.change(screen.getByLabelText("Status"), {
      target: { value: "Inactive" },
    });
    fireEvent.change(screen.getByLabelText("Enrollment Cap"), {
      target: { value: "500" },
    });
    fireEvent.click(
      screen.getAllByRole("button", { name: "No", pressed: false })[0],
    );

    expect(onChange).toHaveBeenCalledWith("status", "Inactive");
    expect(onChange).toHaveBeenCalledWith("enrollmentCap", "500");
    expect(onChange).toHaveBeenCalledWith("disableMentalHealthGuidance", false);
  });

  it("goes back to the program overview list", () => {
    const { onBack } = renderDetail();

    fireEvent.click(screen.getByRole("button", { name: "Back" }));

    expect(onBack).toHaveBeenCalled();
  });

  it("keeps the other tabs as placeholders", () => {
    renderDetail();

    fireEvent.click(screen.getByRole("tab", { name: "Engagement criteria" }));

    expect(
      screen.getByRole("tabpanel", { name: "Engagement criteria" }),
    ).toHaveTextContent("comingSoon");
  });
});
