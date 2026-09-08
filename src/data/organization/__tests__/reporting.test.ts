import { describe, it, expect } from "vitest";
import { renderaReportSetting } from "../reporting";
import { LABELS } from "@/constants";
import type { ReportSettings, SectionData } from "@/types/OrgView";

function stripMetaFields(obj: any): any {
  if (Array.isArray(obj)) return obj.map(stripMetaFields);
  if (obj !== null && typeof obj === "object") {
    const { fieldKey: _fk, metadata: _md, ...rest } = obj;
    return Object.fromEntries(Object.entries(rest).map(([k, v]) => [k, stripMetaFields(v)]));
  }
  return obj;
}

const reportLabels = LABELS.reporting;
const key = "";

describe("renderaReportSetting", () => {
  it("handles undefined input (data = undefined)", () => {
    // @ts-expect-error: deliberately passing undefined to test fallback
    const result = renderaReportSetting(undefined);
    expect(Object.keys(result)).toEqual([key]);

    const cols = result[key];
    // All values should be undefined
    cols.col1.forEach((item, idx) => {
      expect(item.label).toBe(
        [
          reportLabels.REPORT_TYPE,
          reportLabels.REPORT_SORTING,
          reportLabels.EMAIL_CONTENT_VERSION,
          reportLabels.DELIVERY_FREQUENCY,
        ][idx],
      );
      expect(item.value).toBeUndefined();
      if (idx === 3) expect(item.lastChild).toBe(true);
      else expect(item.lastChild).toBeUndefined();
      expect(item.format).toBeUndefined();
    });
    cols.col2.forEach((item, idx) => {
      expect(item.label).toBe(
        [
          reportLabels.REPORT_VERSION,
          reportLabels.REPORT_EFFECTIVE_START_DATE,
          reportLabels.REPORT_EFFECTIVE_END_DATE,
          reportLabels.REPORT_TEMPLATE,
        ][idx],
      );
      expect(item.value).toBeUndefined();
      if (idx === 1 || idx === 2) expect(item.format).toBe("date");
      else expect(item.format).toBeUndefined();
      if (idx === 3) expect(item.lastChild).toBe(true);
      else expect(item.lastChild).toBeUndefined();
    });
  });

  it("handles null input (data = null)", () => {
    // @ts-expect-error: deliberately passing null
    const result = renderaReportSetting(null);
    // behavior identical to undefined
    expect(result).toEqual(renderaReportSetting({} as ReportSettings));
  });

  it("handles empty object (no props set)", () => {
    const data = {} as ReportSettings;
    expect(renderaReportSetting(data)).toEqual(renderaReportSetting({} as ReportSettings));
  });
it("handles partial data on col1 only", () => {
    const data = {
      reportType: "Type A",
      reportSorting: "Desc",
    } as ReportSettings;
    const cols = renderaReportSetting(data)[key];

    expect(stripMetaFields(cols.col1[0])).toEqual({
      label: reportLabels.REPORT_TYPE,
      value: "Type A",
    });
    expect(stripMetaFields(cols.col1[1])).toEqual({
      label: reportLabels.REPORT_SORTING,
      value: "Desc",
    });
    // others undefined
    expect(cols.col1[2].value).toBeUndefined();
    expect(cols.col1[3].value).toBeUndefined();
  });

  it("handles partial data on col2 only", () => {
    const data = {
      reportVersion: "v2.1",
      reportEffectiveStartDate: "2025-07-01",
      reportTemplate: "Template X",
    } as ReportSettings;
    const cols = renderaReportSetting(data)[key];

    expect(stripMetaFields(cols.col2[0])).toEqual({
      label: reportLabels.REPORT_VERSION,
      value: "v2.1",
    });
    expect(stripMetaFields(cols.col2[1])).toEqual({
      label: reportLabels.REPORT_EFFECTIVE_START_DATE,
      value: "2025-07-01",
      format: "date",
    });
    expect(cols.col2[2].value).toBeUndefined();
    expect(stripMetaFields(cols.col2[3])).toEqual({
      label: reportLabels.REPORT_TEMPLATE,
      value: "Template X",
      lastChild: true,
    });
  });

  it("ensures lastChild flags are only on the correct items", () => {
    const data = {
      deliveryFrequency: "Weekly",
      reportTemplate: "Tpl",
    } as ReportSettings; 
    const cols = renderaReportSetting(data)[key];
    // col1: only index 3 has lastChild
    cols.col1.forEach((item, idx) => {
      if (idx === 3) expect(item.lastChild).toBe(true);
      else expect(item.lastChild).toBeUndefined();
    });
    // col2: only index 3 has lastChild
    cols.col2.forEach((item, idx) => {
      if (idx === 3) expect(item.lastChild).toBe(true);
      else expect(item.lastChild).toBeUndefined();
    });
  });

  it("applies date format only on the two date fields", () => {
    const data: ReportSettings = {
      reportEffectiveStartDate: "2025-01-01",
      reportEffectiveEndDate: "2025-12-31",
      reportType: "T",
      reportSorting: "S",
      emailContentVersion: "E",
      deliveryFrequency: "D",
      reportVersion: "RV",
      reportTemplate: "RT",
    };
    const cols = renderaReportSetting(data)[key];

    // col1 none have format
    cols.col1.forEach((item) => expect(item.format).toBeUndefined());

    // col2: idx 1 & 2 are date
    cols.col2.forEach((item, idx) => {
      if (idx === 1 || idx === 2) expect(item.format).toBe("date");
      else expect(item.format).toBeUndefined();
    });
  });

  it("full data produces exact expected structure", () => {
    const full: ReportSettings = {
      reportType: "Type1",
      reportSorting: "Sort1",
      emailContentVersion: "v1",
      deliveryFrequency: "Daily",
      reportVersion: "1.0",
      reportEffectiveStartDate: "2025-06-01",
      reportEffectiveEndDate: "2025-06-30",
      reportTemplate: "Std",
    };
    const expected: SectionData = {
      [key]: {
        col1: [
          { label: reportLabels.REPORT_TYPE, value: "Type1" },
          { label: reportLabels.REPORT_SORTING, value: "Sort1" },
          { label: reportLabels.EMAIL_CONTENT_VERSION, value: "v1" },
          {
            label: reportLabels.DELIVERY_FREQUENCY,
            value: "Daily",
            lastChild: true,
          },
        ],
        col2: [
          { label: reportLabels.REPORT_VERSION, value: "1.0" },
          {
            label: reportLabels.REPORT_EFFECTIVE_START_DATE,
            value: "2025-06-01",
            format: "date",
          },
          {
            label: reportLabels.REPORT_EFFECTIVE_END_DATE,
            value: "2025-06-30",
            format: "date",
          },
          {
            label: reportLabels.REPORT_TEMPLATE,
            value: "Std",
            lastChild: true,
          },
        ],
      },
    };
    expect(stripMetaFields(renderaReportSetting(full))).toEqual(expected);
  });
});
