import { describe, expect, it, vi } from "vitest";
import {
  buildNewReportingMetadata,
  NEW_REPORTING_PLACEHOLDER,
  withNewReportingFlag,
} from "../newReportingTemplate";
import { extractFormData } from "@/utils";
import { constructLookupUrl } from "@/utils/urlMapper";

const existingReportMetadata = {
  reportSettings: {
    reportType: {
      value: "Utilization",
      editable: true,
      uiComponentType: "dropdown",
      dataType: "STRING",
      allowedValues: ["Utilization", "Clinical"],
    },
    reportEffectiveStartDate: {
      value: "2015-03-01T00:00:00Z",
      editable: true,
      uiComponentType: "datePicker",
      dataType: "DATE",
      mandatory: true,
    },
  },
  reportRecipient: [
    {
      emailRecipient: { value: "To", editable: true, uiComponentType: "text", dataType: "STRING" },
      emailAddress: {
        value: "emily@example.com",
        editable: true,
        uiComponentType: "lookup",
        dataType: "STRING",
        allowedValues: ["base", "/contacts?name={searchTerm}"],
      },
    },
  ],
};

describe("buildNewReportingMetadata", () => {
  it("clones the field config of an existing report and clears every value", () => {
    const template = buildNewReportingMetadata({
      reporting: [existingReportMetadata],
    });

    expect(template.reportSettings.reportType).toEqual({
      value: null,
      editable: true,
      uiComponentType: "dropdown",
      dataType: "STRING",
      allowedValues: ["Utilization", "Clinical"],
    });
    expect(template.reportSettings.reportEffectiveStartDate.value).toBeNull();
    expect(template.reportSettings.reportEffectiveStartDate.mandatory).toBe(true);
    // The recipient lookup keeps the search URL so contact search still works.
    expect(template.reportRecipient[0].emailAddress).toMatchObject({
      value: null,
      uiComponentType: "lookup",
      allowedValues: ["base", "/contacts?name={searchTerm}"],
    });
  });

  it("makes every field editable, even one locked on the existing report", () => {
    const template = buildNewReportingMetadata({
      reporting: [
        {
          reportSettings: {
            reportType: {
              value: "Utilization",
              editable: false,
              uiComponentType: "dropdown",
              dataType: "STRING",
            },
          },
          reportRecipient: [
            {
              emailAddress: {
                value: "old@example.com",
                editable: false,
                uiComponentType: "lookup",
                dataType: "STRING",
              },
            },
          ],
        },
      ],
    });

    expect(template.reportSettings.reportType.editable).toBe(true);
    expect(template.reportRecipient[0].emailAddress.editable).toBe(true);
  });

  it("does not mutate the metadata it clones from", () => {
    buildNewReportingMetadata({ reporting: [existingReportMetadata] });
    expect(existingReportMetadata.reportSettings.reportType.value).toBe("Utilization");
  });

  it("skips empty report entries and clones the first populated one", () => {
    const template = buildNewReportingMetadata({
      reporting: [{}, existingReportMetadata],
    });
    expect(template.reportSettings.reportType.uiComponentType).toBe("dropdown");
  });

  it("falls back to the built-in field config when there is no report to clone", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const template = buildNewReportingMetadata({ reporting: [] });

    expect(Object.keys(template.reportSettings)).toContain("reportType");
    expect(template.reportSettings.reportType.value).toBeNull();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("gives the fallback recipient a working contact-search lookup", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const template = buildNewReportingMetadata(undefined);
    warn.mockRestore();

    const emailAddress = template.reportRecipient[0].emailAddress;
    expect(emailAddress.value).toBeNull();
    expect(emailAddress.editable).toBe(true);
    expect(emailAddress.allowedValues).toEqual([
      "search",
      "/client-configurations/contact/filter/search?globalSearchTerm={prodOrgId}&globalSearchType=organization&searchTerm={searchTerm}&searchType=email&accountLinkedContact=true&includeAllSource=true",
    ]);

    // What EditableReportRecipients hands to the lookup must resolve to a real URL.
    vi.stubEnv("VITE_SEARCH_BASE_URL", "https://search.example/v1/");
    const url = constructLookupUrl(emailAddress.allowedValues, "jane", "org-123", "");
    vi.unstubAllEnvs();

    expect(url).toBe(
      "https://search.example/v1/client-configurations/contact/filter/search" +
        "?globalSearchTerm=org-123&globalSearchType=organization&searchTerm=jane" +
        "&searchType=email&accountLinkedContact=true&includeAllSource=true",
    );
  });

  it("produces blank form data for every template field", () => {
    const template = buildNewReportingMetadata({ reporting: [existingReportMetadata] });
    const formData = extractFormData({ reporting: [template] });

    expect(formData).toEqual({
      "reporting.0.reportSettings.reportType": null,
      "reporting.0.reportSettings.reportEffectiveStartDate": null,
      "reporting.0.reportRecipient.0.emailRecipient": null,
      "reporting.0.reportRecipient.0.emailAddress": null,
    });
  });
});

describe("withNewReportingFlag", () => {
  const savedReport = {
    reportSettings: { reportType: "Utilization" },
    reportRecipient: [{ emailRecipient: "To", emailAddress: "saved@example.com" }],
  };

  it("flags only the appended report and leaves the saved ones alone", () => {
    const payload = {
      reporting: [
        savedReport,
        {
          reportSettings: { reportType: "Clinical" },
          reportRecipient: [{ emailRecipient: "To", emailAddress: "new@example.com" }],
        },
      ],
    };

    expect(withNewReportingFlag(payload, 1)).toEqual({
      reporting: [
        savedReport,
        {
          reportSettings: { reportType: "Clinical", isNewReporting: true },
          reportRecipient: [{ emailRecipient: "To", emailAddress: "new@example.com" }],
        },
      ],
    });
  });

  it("adds the settings object when only recipients changed", () => {
    const payload = {
      reporting: [{ reportRecipient: [{ emailRecipient: "To", emailAddress: "a@b.com" }] }],
    };

    expect(withNewReportingFlag(payload, 0).reporting[0].reportSettings).toEqual({
      isNewReporting: true,
    });
  });

  it("drops the template's empty recipient row without touching saved recipients", () => {
    const payload = {
      reporting: [
        { reportRecipient: [{ emailRecipient: null, emailAddress: null }] },
        {
          reportSettings: { reportType: "Utilization" },
          reportRecipient: [
            { emailRecipient: null, emailAddress: null },
            { emailRecipient: "To", emailAddress: "new@example.com" },
          ],
        },
      ],
    };

    const result = withNewReportingFlag(payload, 1);
    expect(result.reporting[1].reportRecipient).toEqual([
      { emailRecipient: "To", emailAddress: "new@example.com" },
    ]);
    // A saved report is passed through byte for byte, junk rows and all.
    expect(result.reporting[0]).toBe(payload.reporting[0]);
  });

  it("leaves a payload without a report at that index untouched", () => {
    expect(withNewReportingFlag({}, 0)).toEqual({});
    expect(withNewReportingFlag({ reporting: [] }, 0)).toEqual({ reporting: [] });
    expect(withNewReportingFlag({ reporting: [savedReport] }, 3)).toEqual({
      reporting: [savedReport],
    });
  });
});

describe("NEW_REPORTING_PLACEHOLDER", () => {
  it("renders as an empty report row", () => {
    expect(NEW_REPORTING_PLACEHOLDER.reportRecipient).toEqual([]);
    expect(NEW_REPORTING_PLACEHOLDER.reportSettings).toEqual({});
  });
});
