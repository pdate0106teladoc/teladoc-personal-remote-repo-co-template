import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import "@testing-library/jest-dom";

vi.mock("../CompleteReviewModal.scss", () => ({}));

vi.mock("@/assets", () => ({
  SuccessIcon: () => <span data-testid="success-icon" />,
}));

vi.mock("@ucc/common-ui", () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  CustomCheckbox: ({ checked, onChange }: any) => (
    <input
      type="checkbox"
      aria-label="confirm"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
  ),
  CustomTextarea: ({ label, placeholder, value, onChange }: any) => (
    <textarea
      aria-label={label}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  ),
  MultiSelectDropdown: ({ options, placeholder, onChange }: any) => (
    <div>
      <span>{placeholder}</span>
      {Object.keys(options).map((key) => (
        <button key={key} onClick={() => onChange([key])}>
          {`option:${key}`}
        </button>
      ))}
    </div>
  ),
}));

import CompleteReviewModal from "../CompleteReviewModal";

const REASONS = [
  { label: "Billing related", value: "REBUTTAL_REASON_BILLING_RELATED" },
  { label: "Eligibility related", value: "REBUTTAL_REASON_ELIGIBILITY" },
];

const setup = (overrides = {}) => {
  const onConfirm = vi.fn().mockResolvedValue(undefined);
  const handleClose = vi.fn();
  render(
    <CompleteReviewModal
      show
      variant="rebuttal"
      handleClose={handleClose}
      onConfirm={onConfirm}
      errorTypeOptions={REASONS}
      {...overrides}
    />,
  );
  return { onConfirm, handleClose };
};

describe("CompleteReviewModal — rebuttal variant", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders the rebuttal copy and the days-left banner", () => {
    setup({ rebuttalDaysLeft: 10 });

    // Title and submit button both read "Send rebuttal".
    expect(screen.getAllByText("Send rebuttal")).toHaveLength(2);
    expect(
      screen.getByText("You have 10 days left to send rebuttal"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("This action will return it to the assigned reviewer."),
    ).toBeInTheDocument();
    expect(screen.getByText("Select rebuttal reason")).toBeInTheDocument();
    expect(
      screen.getByText("By confirming, your rebuttal will be submitted."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Confirm to send the rebuttal to the assigned reviewer."),
    ).toBeInTheDocument();
  });

  it("keeps submit disabled until a reason and the confirmation are both given", () => {
    setup();
    const submit = screen.getByRole("button", { name: "Send rebuttal" });
    expect(submit).toBeDisabled();

    fireEvent.click(screen.getByText("option:Billing related"));
    expect(submit).toBeDisabled();

    fireEvent.click(screen.getByLabelText("confirm"));
    expect(submit).toBeEnabled();
  });

  it("submits the selected reason value and comments", async () => {
    const { onConfirm } = setup();

    fireEvent.click(screen.getByText("option:Billing related"));
    fireEvent.change(screen.getByLabelText("Add comments"), {
      target: { value: "checking rebuttal" },
    });
    fireEvent.click(screen.getByLabelText("confirm"));
    fireEvent.click(screen.getByRole("button", { name: "Send rebuttal" }));

    await waitFor(() =>
      expect(onConfirm).toHaveBeenCalledWith(
        ["REBUTTAL_REASON_BILLING_RELATED"],
        "checking rebuttal",
      ),
    );
  });

  it("uses the day count from the API, singular when one day is left", () => {
    setup({ rebuttalDaysLeft: 1 });
    expect(
      screen.getByText("You have 1 day left to send rebuttal"),
    ).toBeInTheDocument();
  });

  it("omits the day count when the API reports no deadline", () => {
    setup({ rebuttalDaysLeft: null });

    expect(screen.queryByText(/left to send rebuttal/)).not.toBeInTheDocument();
    // The rest of the warning banner still renders.
    expect(
      screen.getByText("This action will return it to the assigned reviewer."),
    ).toBeInTheDocument();
  });

  it("shows zero days rather than hiding the warning", () => {
    setup({ rebuttalDaysLeft: 0 });
    expect(
      screen.getByText("You have 0 days left to send rebuttal"),
    ).toBeInTheDocument();
  });

  it("shows the sending state while in flight", () => {
    setup({ isSubmitting: true });
    expect(screen.getByRole("button", { name: "Sending..." })).toBeDisabled();
  });

  it("does not show review-only copy", () => {
    setup();
    expect(screen.queryByText("Complete review")).not.toBeInTheDocument();
    expect(screen.queryByText("Select error type")).not.toBeInTheDocument();
  });
});
