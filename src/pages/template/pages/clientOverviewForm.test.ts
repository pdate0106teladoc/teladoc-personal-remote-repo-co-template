import { describe, expect, it } from "vitest";
import {
  buildClientOverviewTemplateForm,
  isClientOverviewTemplateFormComplete,
} from "./clientOverviewForm";

describe("isClientOverviewTemplateFormComplete", () => {
  it("is incomplete until every string field has a value", () => {
    expect(
      isClientOverviewTemplateFormComplete(
        buildClientOverviewTemplateForm("Allied Template"),
      ),
    ).toBe(false);
  });

  it("is complete when every field is filled", () => {
    expect(
      isClientOverviewTemplateFormComplete({
        ...buildClientOverviewTemplateForm("Allied Template"),
        contractPath: "Allied",
        clientSuccessManager: "Connor Hudson",
        clientImplementationManager: "Jane Williams",
        registrationCustomizations: "Standard",
        cardioStartDate: "2026-01-01",
        memberSupportPhone: "555-0100",
      }),
    ).toBe(true);
  });
});
