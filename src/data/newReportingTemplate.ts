import type { ReportRecipient, ReportSettings } from "@/types/OrgView";

/**
 * Blank "add report" template for the org / group reporting pages.
 *
 * The template card reuses the normal reporting render path, so it needs metadata
 * in exactly the shape the backend sends for `reporting[n]`. Rather than describe
 * the fields twice, the template is cloned from an existing report's metadata with
 * every `value` cleared — component types, allowedValues, lookup config and
 * validation stay in sync with whatever the backend currently sends.
 */

/** Marks the report as newly created for the autosave PATCH. */
export const NEW_REPORTING_FLAG = "isNewReporting";

type MetaNode = Record<string, any>;

const isMetaLeaf = (node: unknown): node is MetaNode =>
  !!node &&
  typeof node === "object" &&
  !Array.isArray(node) &&
  "value" in (node as MetaNode);

/**
 * Recursively copies a metadata subtree, keeping the config and dropping the values.
 *
 * `editable` is forced on: it describes whether a *saved* field may be changed, so
 * a field locked on the existing report would otherwise arrive locked on a report
 * being created, where every field has to be fillable.
 */
const blankMetadata = (node: any): any => {
  if (Array.isArray(node)) return node.map(blankMetadata);
  if (isMetaLeaf(node)) return { ...node, value: null, editable: true };
  if (node && typeof node === "object") {
    return Object.fromEntries(
      Object.entries(node).map(([key, value]) => [key, blankMetadata(value)]),
    );
  }
  return node;
};

const leaf = (
  uiComponentType: string,
  dataType: string,
  allowedValues: string[] | null = null,
) => ({
  value: null,
  editable: true,
  uiComponentType,
  dataType,
  allowedValues,
});

/**
 * Contact search endpoint for report recipients, copied from the `emailAddress`
 * descriptor the backend sends.
 *
 * `constructLookupUrl` reads it as `[baseUrlKey, pathTemplate]` and fills in
 * `{prodOrgId}` / `{prodGroupId}` / `{searchTerm}`, so the recipient lookup in the
 * fallback template searches contacts exactly as a cloned template would.
 */
const RECIPIENT_LOOKUP_ALLOWED_VALUES = [
  "search",
  "/client-configurations/contact/filter/search?globalSearchTerm={prodOrgId}&globalSearchType=organization&searchTerm={searchTerm}&searchType=email&accountLinkedContact=true&includeAllSource=true",
];

/**
 * Used only when the entity has no existing report to clone from. The settings
 * field list mirrors `renderaReportSetting`; the recipient descriptor mirrors the
 * backend's, so contact search works here too.
 */
const FALLBACK_REPORT_METADATA: MetaNode = {
  reportSettings: {
    reportType: leaf("dropdown", "STRING"),
    reportSorting: leaf("multiSelect", "STRING", ["Org level", "Group level"]),
    emailContentVersion: leaf("dropdown", "STRING", ["Standard", "Custom"]),
    deliveryFrequency: leaf("dropdown", "STRING", ["Monthly", "Quarterly"]),
    reportVersion: leaf("dropdown", "STRING"),
    reportEffectiveStartDate: leaf("datePicker", "DATE"),
    reportEffectiveEndDate: leaf("datePicker", "DATE"),
    reportTemplate: leaf("dropdown", "STRING"),
  },
  reportRecipient: [
    {
      emailRecipient: leaf("text", "STRING"),
      // Mirrors the backend descriptor, including `uiComponentType: "text"` — the
      // recipient editors drive the lookup from `allowedValues`, not the type.
      emailAddress: {
        ...leaf("text", "STRING", RECIPIENT_LOOKUP_ALLOWED_VALUES),
        maxLength: null,
        simpleEdits: true,
        l1Required: false,
        l2Required: false,
        mandatory: false,
        nullable: true,
        regex: "",
        defaultValue: null,
      },
    },
  ],
};

/**
 * Metadata for one blank report, cloned from the first report that has any, or
 * from the fallback when the entity has no reports yet.
 *
 * @param reportingMetadata - The page metadata (`organizationReporting` / `groupReporting`).
 */
export const buildNewReportingMetadata = (reportingMetadata?: any): MetaNode => {
  const existing = Array.isArray(reportingMetadata?.reporting)
    ? reportingMetadata.reporting.find(
        (report: any) => report && Object.keys(report).length > 0,
      )
    : undefined;

  if (!existing) {
    console.warn(
      "[newReportingTemplate] No existing report metadata to clone; using the fallback field config.",
    );
    return blankMetadata(FALLBACK_REPORT_METADATA);
  }

  return blankMetadata(existing);
};

/**
 * The empty row the template card renders against. Every displayed value comes
 * from `formData` in edit mode, so the settings object starts empty.
 */
export const NEW_REPORTING_PLACEHOLDER: {
  reportSettings: ReportSettings;
  reportRecipient: ReportRecipient[];
} = {
  reportSettings: {} as ReportSettings,
  reportRecipient: [],
};

/**
 * Tags the drafted report inside the autosave payload.
 *
 * The PATCH carries the whole `reporting` array — every saved report plus the new
 * one appended at `newReportIndex` — so only that entry gets the flag. Its blank
 * recipient descriptor comes through the diff as an all-null recipient row, which
 * is dropped so the PATCH only carries recipients the user actually picked. Unset
 * settings stay as nulls, as in the agreed payload.
 */
export const withNewReportingFlag = (
  payload: Record<string, any>,
  newReportIndex: number,
): Record<string, any> => {
  const reports = payload?.reporting;
  if (!Array.isArray(reports) || !reports[newReportIndex]) return payload;

  const newReport = reports[newReportIndex];
  const recipients = Array.isArray(newReport?.reportRecipient)
    ? newReport.reportRecipient.filter((recipient: any) => recipient?.emailAddress)
    : newReport?.reportRecipient;

  const flagged = {
    ...newReport,
    ...(recipients === undefined ? {} : { reportRecipient: recipients }),
    reportSettings: {
      ...(newReport?.reportSettings ?? {}),
      [NEW_REPORTING_FLAG]: true,
    },
  };

  return {
    ...payload,
    reporting: reports.map((report: any, index: number) =>
      index === newReportIndex ? flagged : report,
    ),
  };
};
