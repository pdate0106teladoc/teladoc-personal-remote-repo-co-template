// __tests__/orgViewRenderers.spec.ts
import { renderMarketingDetails, renderTelemedcineDetails } from "../marketing";
import { LABELS } from "@/constants";
import type { Marketing } from "@/types/OrgView";

const marketingLabels = LABELS.marketing;

/** Recursively strips `fieldKey` and `metadata` so tests stay focused on business fields. */
function stripMetaFields(obj: any): any {
  if (Array.isArray(obj)) return obj.map(stripMetaFields);
  if (obj !== null && typeof obj === "object") {
    const { fieldKey: _fk, metadata: _md, ...rest } = obj;
    return Object.fromEntries(Object.entries(rest).map(([k, v]) => [k, stripMetaFields(v)]));
  }
  return obj;
}

describe("renderMarketingDetails", () => {
  it("renders with completely undefined data", () => {
    // @ts-expect-error: testing undefined input
    const result = renderMarketingDetails(undefined);
    expect(stripMetaFields(result)).toEqual({
      "Print settings": {
        col1: [
          {
            label: marketingLabels.PRINT_URL,
            value: "-",
            format: "link",
          },
          {
            label: marketingLabels.WEB_URL,
            value: "-",
            format: "link",
            lastChild: true,
          },
        ],
        col2: [{ label: marketingLabels.PRINT_PHONE, value: undefined }],
      },
    });
  });

  it("renders when details exist but no printSettings", () => {
    const data = { details: {} } as Marketing;
    const result = renderMarketingDetails(data);
    expect(result["Print settings"].col1[0].value).toBe("-");
  });

  it("renders partial printSettings", () => {
    const data = {
      details: {
        printSettings: { printUrl: "http://print", printPhone: "1234" },
      },
    } as Marketing;
    const { col1, col2 } = renderMarketingDetails(data)["Print settings"];
    expect(col1.length).toBe(2);
    expect(stripMetaFields(col1[0])).toEqual({
      label: marketingLabels.PRINT_URL,
      value: "http://print",
      format: "link",
    });
    expect(col1[1].value).toBe("-");
    expect(stripMetaFields(col2[0])).toEqual({
      label: marketingLabels.PRINT_PHONE,
      value: "1234",
    });
  });

  it("renders full printSettings", () => {
    const data = {
      details: {
        printSettings: {
          printUrl: "http://print",
          webUrl: "http://web",
          printPhone: "9999",
        },
      },
    } as Marketing;
    const section = renderMarketingDetails(data)["Print settings"];
    expect(stripMetaFields(section.col1)).toEqual([
      {
        label: marketingLabels.PRINT_URL,
        value: "http://print",
        format: "link",
      },
      {
        label: marketingLabels.WEB_URL,
        value: "http://web",
        format: "link",
        lastChild: true,
      },
    ]);
    expect(stripMetaFields(section.col2)).toEqual([
      { label: marketingLabels.PRINT_PHONE, value: "9999" },
    ]);
  });
});

describe("renderTelemedcineDetails", () => {
  it("renders with completely undefined data", () => {
    // @ts-expect-error: testing undefined input
    const result = renderTelemedcineDetails(undefined);
    expect(stripMetaFields(result)).toEqual({
      "Marketing preferences": {
        col1: [
          {
            label: marketingLabels.DIRECT_MAIL_OPT_IN,
            value: undefined,
          },
          {
            label: marketingLabels.INCENTIVES_OPT_IN,
            value: undefined,
          },
          {
            label: marketingLabels.EMAIL_OPT_IN,
            value: undefined,
            lastChild: true,
          },
        ],
        col2: [
          {
            label: marketingLabels.OUTBOUND_CALLS_OPT_IN,
            value: undefined,
          },
          {
            label: marketingLabels.TEXT_OPT_IN,
            value: undefined,
            lastChild: true,
          },
        ],
      },
    });
  });

  it("renders when teleMedicine exists but no marketingPreferences", () => {
    const data = { teleMedicine: {} } as Marketing;
    const prefs = renderTelemedcineDetails(data)["Marketing preferences"];
    prefs.col1.forEach((item) => expect(item.value).toBeUndefined());
    prefs.col2.forEach((item) => expect(item.value).toBeUndefined());
  });

  it("renders partial marketingPreferences", () => {
    const data = {
      teleMedicine: {
        marketingPreferences: {
          directMailOptIn: false,
          emailOptIn: true,
        },
      },
    } as Marketing;
    const { col1, col2 } =
      renderTelemedcineDetails(data)["Marketing preferences"];
    expect(col1[0]).toMatchObject({ value: false });
    expect(col1[1].value).toBeUndefined();
    expect(col1[2]).toMatchObject({
      value: true,
      lastChild: true,
    });
    expect(col2[0].value).toBeUndefined();
    expect(col2[1].value).toBeUndefined();
  });

  it("renders full marketingPreferences", () => {
    const prefsObj = {
      directMailOptIn: true,
      incentiveOptIn: false,
      emailOptIn: true,
      outboundCallsOptIn: false,
      textOptIn: true,
    };
    const data = {
      teleMedicine: { marketingPreferences: prefsObj },
    } as Marketing;
    const section = renderTelemedcineDetails(data)["Marketing preferences"];
    expect(stripMetaFields(section.col1)).toEqual([
      {
        label: marketingLabels.DIRECT_MAIL_OPT_IN,
        value: true,
      },
      {
        label: marketingLabels.INCENTIVES_OPT_IN,
        value: false,
      },
      {
        label: marketingLabels.EMAIL_OPT_IN,
        value: true,
        lastChild: true,
      },
    ]);
    expect(stripMetaFields(section.col2)).toEqual([
      {
        label: marketingLabels.OUTBOUND_CALLS_OPT_IN,
        value: false,
      },
      {
        label: marketingLabels.TEXT_OPT_IN,
        value: true,
        lastChild: true,
      },
    ]);
  });
});
