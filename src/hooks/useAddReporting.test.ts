import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { useAddReporting } from "./useAddReporting";
import { withNewReportingFlag } from "@/data/newReportingTemplate";
import { buildChangedPayload } from "@/utils";

const PAGE_METADATA = {
  reporting: [
    {
      reportSettings: {
        reportType: {
          value: "Utilization",
          editable: true,
          uiComponentType: "dropdown",
          dataType: "STRING",
        },
        deliveryFrequency: {
          value: "Monthly",
          editable: true,
          uiComponentType: "dropdown",
          dataType: "STRING",
        },
      },
      reportRecipient: [
        {
          emailRecipient: { value: "To", editable: true, uiComponentType: "text", dataType: "STRING" },
          emailAddress: { value: "old@example.com", editable: true, uiComponentType: "lookup", dataType: "STRING" },
        },
      ],
    },
  ],
};

// What extractFormData(PAGE_METADATA) yields for the saved report.
const EXISTING_FORM_DATA = {
  "reporting.0.reportSettings.reportType": "Utilization",
  "reporting.0.reportSettings.deliveryFrequency": "Monthly",
  "reporting.0.reportRecipient.0.emailRecipient": "To",
  "reporting.0.reportRecipient.0.emailAddress": "old@example.com",
};

const setup = () => {
  const state = {
    metadata: PAGE_METADATA as any,
    formData: { ...EXISTING_FORM_DATA } as Record<string, any>,
    originalData: { ...EXISTING_FORM_DATA } as Record<string, any>,
  };
  const isInitializing = { current: false };

  const hook = renderHook(() =>
    useAddReporting({
      metadata: state.metadata,
      formData: state.formData,
      originalData: state.originalData,
      setMetadata: (m: any) => {
        state.metadata = m;
      },
      setFormData: (d: Record<string, any>) => {
        state.formData = d;
      },
      setOriginalData: (d: Record<string, any>) => {
        state.originalData = d;
      },
      isInitializing,
    }),
  );

  return { hook, state, isInitializing };
};

describe("useAddReporting", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts out not adding a report", () => {
    const { hook } = setup();
    expect(hook.result.current.isAddingReport).toBe(false);
  });

  it("appends a blank report after the saved ones", () => {
    const { hook, state } = setup();

    act(() => hook.result.current.startAddReport());

    expect(hook.result.current.isAddingReport).toBe(true);
    expect(hook.result.current.newReportIndex).toBe(1);
    expect(state.metadata.reporting).toHaveLength(2);
    expect(state.metadata.reporting[0]).toBe(PAGE_METADATA.reporting[0]);
    expect(state.metadata.reporting[1].reportSettings.reportType.value).toBeNull();
    // The saved report's form keys survive; the template adds blanks at index 1.
    expect(state.formData).toEqual({
      ...EXISTING_FORM_DATA,
      "reporting.1.reportSettings.reportType": null,
      "reporting.1.reportSettings.deliveryFrequency": null,
      "reporting.1.reportRecipient.0.emailRecipient": null,
      "reporting.1.reportRecipient.0.emailAddress": null,
    });
    // Seeded into originalData too, so an untouched template is not a change.
    expect(state.originalData).toEqual(state.formData);
  });

  it("guards the autosave effect across the swap and releases it after", () => {
    const { hook, isInitializing } = setup();

    act(() => hook.result.current.startAddReport());
    expect(isInitializing.current).toBe(true);

    act(() => {
      vi.runAllTimers();
    });
    expect(isInitializing.current).toBe(false);
  });

  it("sends every saved report plus the new one, flagged", () => {
    const { hook, state } = setup();

    act(() => hook.result.current.startAddReport());
    const filled = {
      ...state.formData,
      "reporting.1.reportSettings.reportType": "Clinical",
      "reporting.1.reportRecipient": [
        { emailRecipient: "To", emailAddress: "new.report@example.com" },
      ],
    };

    const payload = withNewReportingFlag(
      buildChangedPayload(filled, state.originalData),
      hook.result.current.newReportIndex,
    );

    expect(payload).toEqual({
      reporting: [
        {
          reportSettings: {
            reportType: "Utilization",
            deliveryFrequency: "Monthly",
          },
          reportRecipient: [
            { emailRecipient: "To", emailAddress: "old@example.com" },
          ],
        },
        {
          reportSettings: {
            reportType: "Clinical",
            deliveryFrequency: null,
            isNewReporting: true,
          },
          reportRecipient: [
            { emailRecipient: "To", emailAddress: "new.report@example.com" },
          ],
        },
      ],
    });
  });

  it("does not diff an untouched template", () => {
    const { hook, state } = setup();

    act(() => hook.result.current.startAddReport());

    expect(buildChangedPayload(state.formData, state.originalData)).toEqual({});
  });

  it("restores the previous scope when the draft is discarded", () => {
    const { hook, state } = setup();

    act(() => hook.result.current.startAddReport());
    act(() => hook.result.current.discardNewReport());

    expect(hook.result.current.isAddingReport).toBe(false);
    expect(state.metadata).toBe(PAGE_METADATA);
    expect(state.metadata.reporting).toHaveLength(1);
    expect(state.formData).toEqual(EXISTING_FORM_DATA);
    expect(state.originalData).toEqual(EXISTING_FORM_DATA);
  });
});
