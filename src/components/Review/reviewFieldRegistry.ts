import { extractDisplayValue } from "@ucc/common-ui";
import type { DisplayType } from "@ucc/common-ui";
import { formatNumberWithCommas } from "@/utils";
import type { FieldMetadata, metaCompoenent, metaDataType } from "@/types/edit";
import { LABELS } from "@/constants";
import { formatNestedRecipientArrayChange } from "@/data/nestedRecipientArrayChange";

import {
  renderGeneralSettingOverview,
  renderPermissions,
} from "@/data/organization/general-settings";
import {
  renderBillingOverview as renderOrgBillingOverview,
  renderInvoiceDetails,
} from "@/data/organization/billing";
import {
  renderMarketingDetails,
  renderTelemedcineDetails,
} from "@/data/organization/marketing";
import { renderEligibilityOverview as renderOrgEligibilityOverview } from "@/data/organization/eligibility";

import {
  renderGeneralSettingOverviewSec1,
  renderGeneralSettingOverviewSec2,
  renderGroupPermissions,
  renderGroupRelationships,
  renderClinicalAndMemberSupport,
} from "@/data/group/general-setting";
import {
  renderBillingOverview as renderGrpBillingOverview,
  renderBillingCCM,
} from "@/data/group/billing";
import {
  renderMarketingOverview,
  renderMarketingTelemedicine,
  renderMarketingCcm,
} from "@/data/group/marketing";
import {
  renderEligibilityOverview,
  renderCcmEligibility,
} from "@/data/group/eligibilty-claims";
import {
  SCALAR_LIST_FIELD_REGISTRY,
  formatScalarListChange,
  getScalarListChangeStatus,
  getScalarListValues,
  isScalarListChange,
  type ScalarListChangeLike,
} from "@/data/scalarListFieldRegistry";

// --- Types ---

type RegistryRow = { label: string; fieldKey?: string; format?: string };
type RegistrySectionData = Record<string, Record<string, RegistryRow[]>>;
type RenderFn = (data: any, metadata?: any) => RegistrySectionData;

export interface ReviewFieldRow {
  field: string;
  previousValue: string;
  updatedValue: string;
  fieldPath?: string;
  /** Review diff status — used to pre-check fail boxes for IN_PROGRESS fields. */
  changeStatus?: ScalarChange["status"];
  /** Present on failed rebuttal rows — used for editable rendering and auto-save. */
  formFieldKey?: string;
  pageKey?: string;
  rawOldValue?: unknown;
  rawNewValue?: unknown;
  fieldMetadata?: FieldMetadata;
}

export interface ReviewSection {
  title: string;
  rows: ReviewFieldRow[];
}

export interface ReviewArrayItem {
  id: string;
  rows: ReviewFieldRow[];
}

export interface ReviewArraySection {
  tabLabel: string;
  items: ReviewArrayItem[];
}

export interface ReviewTabData {
  tabName: string;
  sections: ReviewSection[];
  arrayChangeSections: ReviewArraySection[];
}

export interface ReviewPageData {
  pageKey: string;
  pageLabel: string;
  tabs: ReviewTabData[];
}

export interface ReviewTransformResult {
  pages: ReviewPageData[];
  errors: string[];
  unmappedKeys: string[];
  fieldPathMap: Record<string, string>;
}

export interface ScalarChange {
  oldValue: string | boolean | null;
  newValue: string | boolean | null;
  status?: "PENDING" | "PASSED" | "FAILED" | "CORRECTED" | "IN_PROGRESS";
  correctedBy: string | null;
  correctedAt: string | null;
  rejectCount: number | null;
}

export interface ArrayChange {
  added?: unknown[];
  removed?: unknown[];
  modified?: unknown[];
  status?: ScalarChange["status"];
}

interface ReviewModifiedFieldEntry {
  fieldPath?: string;
  change?: ScalarChange | ArrayChange;
  status?: ScalarChange["status"];
  metadata?: ReviewFieldMetadataFromApi;
}

export interface ReviewChangeEntry {
  fieldPath: string;
  change: ScalarChange | ArrayChange;
  metadata?: ReviewFieldMetadataFromApi;
}

export interface ReviewFieldMetadataFromApi {
  dataType: string;
  allowedValues: string[] | null;
  mandatory: boolean;
  regex: string;
  defaultValue: unknown;
  uiComponentType: string;
}

export interface ReviewChangeResponse {
  changes: ReviewChangeEntry[];
  errors?: string[];
}

export type ReviewTaskStatus =
  | "PEER_REVIEW_IN_PROGRESS"
  | "QUALITY_REVIEW_IN_PROGRESS"
  | "REJECTED_PEER_REVIEW"
  | "REJECTED_QUALITY_REVIEW";

export interface ReviewSummary {
  message: string;
  errorCategories: string[];
  errorTypes: string[];
  comments: string;
}

/** Rebuttal raised by the configurator, shown to the reviewer. `rebuttalReason` holds reference codes. */
export interface RebuttalSummary {
  message: string;
  rebuttalReason: string[];
  comments: string;
}

export interface ReviewApiResponse {
  id: string;
  taskId: string;
  draftId: string;
  entityId: string;
  entityType: string;
  status?: ReviewTaskStatus;
  latestReviewSummary?: ReviewSummary;
  latestRebuttalSummary?: RebuttalSummary;
  diff: ReviewChangeResponse;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  /** Backend-owned rebuttal window; null once the window has closed or never applied. */
  allowRebuttal?: boolean;
  rebuttalDeadline?: string | null;
  daysRemaining?: number | null;
}

// --- Registries ---

const PAGE_LABEL_MAP: Record<string, string> = {
  organizationGeneralSettings: "General settings",
  organizationBilling: "Billing",
  organizationEligibility: "Eligibility",
  organizationMarketing: "Marketing",
  organizationReporting: "Reporting",
  groupGeneralSettings: "General settings",
  groupBilling: "Billing",
  groupMarketing: "Marketing",
  eligibilityAndClaims: "Eligibility and claims",
  groupReporting: "Reporting",
};

interface TabRegistryEntry {
  tabName: string;
  renderFns: RenderFn[];
}

const TAB_REGISTRY: Record<string, TabRegistryEntry[]> = {
  organizationGeneralSettings: [
    { tabName: "Overview", renderFns: [renderGeneralSettingOverview] },
    { tabName: "Permissions", renderFns: [renderPermissions] },
  ],
  organizationBilling: [
    { tabName: "Overview", renderFns: [renderOrgBillingOverview] },
    { tabName: "Invoice detail", renderFns: [renderInvoiceDetails] },
  ],
  organizationEligibility: [
    { tabName: "Overview", renderFns: [renderOrgEligibilityOverview] },
  ],
  organizationMarketing: [
    { tabName: "Overview", renderFns: [renderMarketingDetails] },
    { tabName: "Telemedicine", renderFns: [renderTelemedcineDetails] },
  ],
  groupGeneralSettings: [
    { tabName: "Overview", renderFns: [renderGeneralSettingOverviewSec1, renderGeneralSettingOverviewSec2, renderClinicalAndMemberSupport] },
    { tabName: "Group permissions", renderFns: [renderGroupPermissions] },
    { tabName: "Group relationships", renderFns: [renderGroupRelationships] },
  ],
  groupBilling: [
    { tabName: "Overview", renderFns: [renderGrpBillingOverview] },
    { tabName: "CCM", renderFns: [renderBillingCCM] },
  ],
  groupMarketing: [
    { tabName: "Overview", renderFns: [renderMarketingOverview] },
    { tabName: "Telemedicine", renderFns: [renderMarketingTelemedicine] },
    { tabName: "CCM", renderFns: [renderMarketingCcm] },
  ],
  eligibilityAndClaims: [
    { tabName: "Overview", renderFns: [renderEligibilityOverview] },
    { tabName: "CCM eligibility", renderFns: [renderCcmEligibility] },
  ],
};

interface ArrayFieldConfig {
  tabLabel: string;
  /** Review UI tab — defaults to first tab in TAB_REGISTRY when omitted. */
  tabName?: string;
  fields: Record<string, { label: string; format?: string }>;
}

interface NormalizedModifiedFieldChange {
  fieldName: string;
  scalarChange: ScalarChange;
  metadata?: ReviewFieldMetadataFromApi;
}

const ARRAY_FIELD_REGISTRY: Record<string, ArrayFieldConfig> = {
  "organizationGeneralSettings.accountRelationships": {
    tabLabel: "Account relationship",
    tabName: "Account relationships",
    fields: {
      startDate: { label: "Start date", format: "date" },
      endDate: { label: "End date", format: "date" },
      contractOverview: { label: "Contract overview associated to partner relationship" },
      partnerRelationshipsToTeladoc: { label: "Partner relationships to Teladoc" },
      partnerRelationshipsType: { label: "Partner relationships type" },
      servicingContractType: { label: "Servicing contract type" },
      compositeKey: { label: "Composite key" },
      partnerAccount: { label: "Partner account" },
      clientAccount: { label: "Client account" },
    },
  },
  "groupGeneralSettings.groupRelationShips": {
    tabLabel: "Group relationship",
    tabName: "Group relationships",
    fields: {
      hasBroker: { label: "Has broker", format: "boolean" },
      roleType: { label: "Role type" },
      memberGroupName: { label: "Member group name" },
      sourceAccount: { label: "Source account" },
      memberGroup: { label: "Member group" },
      memberGroupStatus: { label: "Member group status" },
      duplicateKey: { label: "Duplicate key" },
    },
  },
  "organizationReporting.reporting": {
    tabLabel: "Standard Report",
    tabName: "Overview",
    fields: {
      "reportSettings.reportType": { label: LABELS.reporting.REPORT_TYPE },
      "reportSettings.reportSorting": { label: LABELS.reporting.REPORT_SORTING },
      "reportSettings.emailContentVersion": { label: LABELS.reporting.EMAIL_CONTENT_VERSION },
      "reportSettings.deliveryFrequency": { label: LABELS.reporting.DELIVERY_FREQUENCY },
      "reportSettings.reportVersion": { label: LABELS.reporting.REPORT_VERSION },
      "reportSettings.reportEffectiveStartDate": {
        label: LABELS.reporting.REPORT_EFFECTIVE_START_DATE,
        format: "date",
      },
      "reportSettings.reportEffectiveEndDate": {
        label: LABELS.reporting.REPORT_EFFECTIVE_END_DATE,
        format: "date",
      },
      "reportSettings.reportTemplate": { label: LABELS.reporting.REPORT_TEMPLATE },
      reportRecipient: { label: LABELS.reporting.REPORT_RECIPIENTS },
    },
  },
  "groupReporting.reporting": {
    tabLabel: "Standard Report",
    tabName: "Overview",
    fields: {
      "reportSettings.reportType": { label: LABELS.reporting.REPORT_TYPE },
      "reportSettings.reportSorting": { label: LABELS.reporting.REPORT_SORTING },
      "reportSettings.emailContentVersion": { label: LABELS.reporting.EMAIL_CONTENT_VERSION },
      "reportSettings.deliveryFrequency": { label: LABELS.reporting.DELIVERY_FREQUENCY },
      "reportSettings.reportVersion": { label: LABELS.reporting.REPORT_VERSION },
      "reportSettings.reportEffectiveStartDate": {
        label: LABELS.reporting.REPORT_EFFECTIVE_START_DATE,
        format: "date",
      },
      "reportSettings.reportEffectiveEndDate": {
        label: LABELS.reporting.REPORT_EFFECTIVE_END_DATE,
        format: "date",
      },
      "reportSettings.reportTemplate": { label: LABELS.reporting.REPORT_TEMPLATE },
      reportRecipient: { label: LABELS.reporting.REPORT_RECIPIENTS },
    },
  },
};

// --- Helpers ---

interface FieldLabelEntry {
  label: string;
  sectionTitle: string;
  tabName?: string;
  format?: string;
}

const MANUAL_FIELD_REGISTRY: Record<string, FieldLabelEntry> = {
  "groupGeneralSettings.overview.clientMemberCodes.code": {
    label: LABELS.grpGeneralSetting.CMC_CODE,
    sectionTitle: "Client member code",
    tabName: "Overview",
  },
  "groupGeneralSettings.overview.clientMemberCodes.cmcRecordType": {
    label: LABELS.grpGeneralSetting.CMC_RECORD_TYPE,
    sectionTitle: "Client member code",
    tabName: "Overview",
  },
  "groupGeneralSettings.overview.clientMemberCodes.usedForRegistration": {
    label: LABELS.grpGeneralSetting.CMC_USED_FOR_REGISTRATION_LABEL,
    sectionTitle: "Client member code",
    tabName: "Overview",
    format: "boolean",
  },
  "groupGeneralSettings.overview.clientMemberCodes.isActive": {
    label: LABELS.grpGeneralSetting.ACTIVE,
    sectionTitle: "Client member code",
    tabName: "Overview",
    format: "boolean",
  },
  "groupGeneralSettings.overview.clientMemberCodes.account": {
    label: LABELS.grpGeneralSetting.ACCOUNT,
    sectionTitle: "Client member code",
    tabName: "Overview",
  },
};

const pageLookupCache = new Map<string, Map<string, FieldLabelEntry>>();

function buildPageLookup(pagePrefix: string): Map<string, FieldLabelEntry> {
  const lookup = new Map<string, FieldLabelEntry>();
  const tabEntries = TAB_REGISTRY[pagePrefix];
  if (!tabEntries) return lookup;

  for (const { tabName, renderFns } of tabEntries) {
    for (const fn of renderFns) {
      let sectionData: RegistrySectionData;
      try {
        sectionData = fn({});
      } catch {
        continue;
      }
      for (const [sectionTitle, cols] of Object.entries(sectionData ?? {})) {
        for (const colRows of Object.values(cols ?? {})) {
          for (const row of colRows ?? []) {
            if (!row?.fieldKey) continue;
            lookup.set(`${pagePrefix}.${row.fieldKey}`, {
              label: row.label,
              sectionTitle: sectionTitle || "Other",
              tabName,
              format: row.format,
            });
          }
        }
      }
    }
  }
  return lookup;
}

function getFieldLabel(backendKey: string): FieldLabelEntry | undefined {
  const manual = MANUAL_FIELD_REGISTRY[backendKey];
  if (manual) return manual;

  const dot = backendKey.indexOf(".");
  if (dot < 0) return undefined;
  const pagePrefix = backendKey.slice(0, dot);
  let lookup = pageLookupCache.get(pagePrefix);
  if (!lookup) {
    lookup = buildPageLookup(pagePrefix);
    pageLookupCache.set(pagePrefix, lookup);
  }
  return lookup.get(backendKey);
}

const HTML_FORMATS = new Set(["link", "navigate", "accountLink", "html", "img"]);

function stripHtmlTags(value: string): string {
  return value.replace(/<[^>]*>/g, "").trim();
}

function normaliseChangeValue(raw: string | boolean | null | undefined, format?: string): string {
  if (raw === null || raw === undefined || raw === "") return "—";
  if (format && HTML_FORMATS.has(format) && typeof raw === "string" && raw.includes("<")) {
    const stripped = stripHtmlTags(raw);
    return stripped || "—";
  }
  const display = extractDisplayValue(raw, (format as DisplayType) ?? "text").raw;
  if (display === null || display === undefined || display === "-") return "—";
  if (!format && typeof display === "string" && /^-?\d+(\.\d+)?$/.test(display)) {
    return formatNumberWithCommas(display);
  }
  return String(display);
}

function isArrayChange(value: unknown): value is ArrayChange {
  if (!value || typeof value !== "object") return false;
  const rec = value as Record<string, unknown>;
  if ("oldValue" in rec || "newValue" in rec) return false;
  return "added" in rec || "removed" in rec || "modified" in rec;
}

/** Nested array fields (e.g. reportRecipient) may expose status on the entry or inside change. */
export function resolveReviewChangeStatus(
  change: unknown,
  entry?: { status?: ScalarChange["status"] },
): ScalarChange["status"] | undefined {
  if (entry?.status) return entry.status;
  if (!change || typeof change !== "object") return undefined;
  return (change as { status?: ScalarChange["status"] }).status;
}

function collectInProgressPathsFromModifiedChanges(
  changes: unknown,
  arrayFieldPath: string,
  comparisonId: string,
  paths: Set<string>,
): void {
  if (Array.isArray(changes)) {
    for (const fieldEntry of changes) {
      if (!fieldEntry || typeof fieldEntry !== "object") continue;
      const rec = fieldEntry as ReviewModifiedFieldEntry;
      if (!rec.fieldPath || !rec.change) continue;
      if (resolveReviewChangeStatus(rec.change, rec) !== "IN_PROGRESS") continue;
      paths.add(buildArrayItemFieldPath(arrayFieldPath, comparisonId, rec.fieldPath));
    }
    return;
  }

  if (typeof changes === "object" && changes) {
    for (const [fieldName, fieldChange] of Object.entries(
      changes as Record<string, ScalarChange | ArrayChange>,
    )) {
      if (resolveReviewChangeStatus(fieldChange) !== "IN_PROGRESS") continue;
      paths.add(buildArrayItemFieldPath(arrayFieldPath, comparisonId, fieldName));
    }
  }
}

/** Field paths with IN_PROGRESS status from the raw review API diff. */
export function collectInProgressReviewFieldPaths(
  response: ReviewChangeResponse | undefined,
): Set<string> {
  const paths = new Set<string>();
  if (!response?.changes) return paths;

  for (const entry of response.changes) {
    const change = entry.change;

    if (isArrayChange(change)) {
      if (
        SCALAR_LIST_FIELD_REGISTRY[entry.fieldPath] &&
        isScalarListChange(change) &&
        getScalarListChangeStatus(change) === "IN_PROGRESS"
      ) {
        paths.add(entry.fieldPath);
        continue;
      }

      if (!ARRAY_FIELD_REGISTRY[entry.fieldPath]) continue;

      for (const modified of change.modified ?? []) {
        const mod = modified as { id?: Array<string | number>; changes?: unknown };
        const comparisonId = String(mod.id?.[0] ?? "Unknown");
        if (!mod.changes) continue;
        collectInProgressPathsFromModifiedChanges(
          mod.changes,
          entry.fieldPath,
          comparisonId,
          paths,
        );
      }
      continue;
    }

    if ((change as ScalarChange).status === "IN_PROGRESS") {
      paths.add(entry.fieldPath);
    }
  }

  return paths;
}

/** Review API uses `{ fieldPath, change, metadata }[]`; diff-library uses `Record<fieldName, change>`. */
export function normalizeModifiedItemChanges(
  changes: unknown,
): NormalizedModifiedFieldChange[] {
  if (!changes) return [];

  if (Array.isArray(changes)) {
    const result: NormalizedModifiedFieldChange[] = [];
    for (const entry of changes) {
      if (!entry || typeof entry !== "object") continue;
      const rec = entry as {
        fieldPath?: string;
        change?: ScalarChange | ArrayChange;
        metadata?: ReviewFieldMetadataFromApi;
      };
      if (!rec.fieldPath || !rec.change || isArrayChange(rec.change)) continue;
      result.push({
        fieldName: rec.fieldPath,
        scalarChange: rec.change,
        metadata: rec.metadata,
      });
    }
    return result;
  }

  if (typeof changes === "object") {
    return Object.entries(changes as Record<string, ScalarChange | ArrayChange>)
      .filter(([, fieldChange]) => !isArrayChange(fieldChange))
      .map(([fieldName, scalarChange]) => ({
        fieldName,
        scalarChange: scalarChange as ScalarChange,
      }));
  }

  return [];
}

function buildArrayItemFieldPath(
  arrayFieldPath: string,
  comparisonId: string | number,
  fieldName: string,
): string {
  return `${arrayFieldPath}[${String(comparisonId)}].${fieldName}`;
}

function buildArrayFormFieldKey(
  arrayFieldPath: string,
  pagePrefix: string,
  comparisonId: string | number,
  fieldName: string,
): string {
  const relativePath = arrayFieldPath.startsWith(`${pagePrefix}.`)
    ? arrayFieldPath.slice(pagePrefix.length + 1)
    : arrayFieldPath;
  return `${relativePath}[${String(comparisonId)}].${fieldName}`;
}

function collectArrayItemRows(
  changes: unknown,
  config: ArrayFieldConfig,
  arrayFieldPath: string,
  comparisonId: string | number,
  pagePrefix: string,
  options?: TransformOptions,
): ReviewFieldRow[] {
  const rows: ReviewFieldRow[] = [];
  const comparisonIdStr = String(comparisonId);

  const appendScalarRow = (
    fieldName: string,
    scalarChange: ScalarChange,
    metadata?: ReviewFieldMetadataFromApi,
    entry?: ReviewModifiedFieldEntry,
  ) => {
    const status = resolveReviewChangeStatus(scalarChange, entry);
    if (options?.scalarStatusFilter && status !== options.scalarStatusFilter) {
      return;
    }

    const fieldConfig = config.fields[fieldName];
    const granularFieldPath = buildArrayItemFieldPath(
      arrayFieldPath,
      comparisonIdStr,
      fieldName,
    );
    const row: ReviewFieldRow = {
      field: fieldConfig?.label ?? fieldName,
      previousValue: normaliseChangeValue(scalarChange.oldValue, fieldConfig?.format),
      updatedValue: normaliseChangeValue(scalarChange.newValue, fieldConfig?.format),
      fieldPath: granularFieldPath,
      changeStatus: status,
    };

    if (options?.includeRejectedFieldEditMeta && metadata) {
      row.pageKey = pagePrefix;
      row.formFieldKey = buildArrayFormFieldKey(
        arrayFieldPath,
        pagePrefix,
        comparisonIdStr,
        fieldName,
      );
      row.rawOldValue = scalarChange.oldValue;
      row.rawNewValue = scalarChange.newValue;
      row.fieldMetadata = mapReviewMetadataToFieldMetadata(metadata, scalarChange.newValue);
    }

    rows.push(row);
  };

  const appendNestedRecipientRows = (
    fieldName: string,
    nestedChange: ArrayChange,
    entry?: ReviewModifiedFieldEntry,
  ) => {
    const nestedStatus = resolveReviewChangeStatus(nestedChange, entry);
    if (options?.scalarStatusFilter && nestedStatus !== options.scalarStatusFilter) {
      return;
    }

    const fieldConfig = config.fields[fieldName];
    const label = fieldConfig?.label ?? fieldName;
    const granularFieldPath = buildArrayItemFieldPath(
      arrayFieldPath,
      comparisonIdStr,
      fieldName,
    );

    for (const nestedRow of formatNestedRecipientArrayChange(nestedChange, label)) {
      rows.push({
        field: nestedRow.field,
        previousValue: nestedRow.previousValue,
        updatedValue: nestedRow.updatedValue,
        fieldPath: granularFieldPath,
        changeStatus: nestedStatus,
      });
    }
  };

  if (Array.isArray(changes)) {
    for (const entry of changes) {
      if (!entry || typeof entry !== "object") continue;
      const rec = entry as {
        fieldPath?: string;
        change?: ScalarChange | ArrayChange;
        metadata?: ReviewFieldMetadataFromApi;
      };
      if (!rec.fieldPath || !rec.change) continue;

      if (isArrayChange(rec.change)) {
        appendNestedRecipientRows(rec.fieldPath, rec.change, rec);
      } else {
        appendScalarRow(rec.fieldPath, rec.change, rec.metadata, rec);
      }
    }
    return rows;
  }

  if (typeof changes === "object") {
    for (const [fieldName, fieldChange] of Object.entries(
      changes as Record<string, ScalarChange | ArrayChange>,
    )) {
      if (isArrayChange(fieldChange)) {
        appendNestedRecipientRows(fieldName, fieldChange);
      } else {
        appendScalarRow(fieldName, fieldChange as ScalarChange, undefined, {
          fieldPath: fieldName,
          change: fieldChange as ScalarChange,
        });
      }
    }
  }

  return rows;
}

function countFailedInModifiedChanges(changes: unknown): number {
  let count = 0;

  const inspectChange = (
    fieldChange: ScalarChange | ArrayChange,
    entry?: ReviewModifiedFieldEntry,
  ) => {
    if (resolveReviewChangeStatus(fieldChange, entry) === "FAILED") count += 1;
  };

  if (Array.isArray(changes)) {
    for (const entry of changes) {
      if (!entry || typeof entry !== "object") continue;
      const rec = entry as ReviewModifiedFieldEntry;
      if (rec.change) inspectChange(rec.change, rec);
    }
    return count;
  }

  if (typeof changes === "object" && changes) {
    for (const [fieldName, fieldChange] of Object.entries(
      changes as Record<string, ScalarChange | ArrayChange>,
    )) {
      inspectChange(fieldChange, { fieldPath: fieldName, change: fieldChange });
    }
  }

  return count;
}

function getTabNameForArrayField(
  pagePrefix: string,
  config: ArrayFieldConfig,
): string {
  return (
    config.tabName ??
    TAB_REGISTRY[pagePrefix]?.[0]?.tabName ??
    "Overview"
  );
}

const tabSectionCache = new Map<string, Map<string, string>>();

function buildTabSectionLookup(pagePrefix: string): Map<string, string> {
  const lookup = new Map<string, string>();
  const tabEntries = TAB_REGISTRY[pagePrefix];
  if (!tabEntries) return lookup;

  for (const { tabName, renderFns } of tabEntries) {
    for (const fn of renderFns) {
      let sectionData: RegistrySectionData;
      try {
        sectionData = fn({});
      } catch {
        continue;
      }
      for (const sectionTitle of Object.keys(sectionData ?? {})) {
        if (sectionTitle) lookup.set(sectionTitle, tabName);
      }
    }
  }
  return lookup;
}

function getTabForSection(pagePrefix: string, sectionTitle: string): string {
  let lookup = tabSectionCache.get(pagePrefix);
  if (!lookup) {
    lookup = buildTabSectionLookup(pagePrefix);
    tabSectionCache.set(pagePrefix, lookup);
  }
  return lookup.get(sectionTitle) ?? TAB_REGISTRY[pagePrefix]?.[0]?.tabName ?? "Overview";
}

export function splitReviewFieldPath(
  fieldPath: string,
): { pageKey: string; formFieldKey: string } | null {
  const dot = fieldPath.indexOf(".");
  if (dot < 0) return null;
  return {
    pageKey: fieldPath.slice(0, dot),
    formFieldKey: fieldPath.slice(dot + 1),
  };
}

export function mapReviewMetadataToFieldMetadata(
  apiMeta: ReviewFieldMetadataFromApi,
  value: unknown,
): FieldMetadata {
  return {
    value,
    editable: true,
    uiComponentType: apiMeta.uiComponentType as metaCompoenent,
    dataType: apiMeta.dataType as metaDataType,
    allowedValues: apiMeta.allowedValues,
    regex: apiMeta.regex || undefined,
    required: apiMeta.mandatory,
  };
}

export interface CorrectedFieldPayload {
  fieldPath: string;
  correctedValue: string | { added: unknown[] };
}

/** Maps edit-store form keys to full review API field paths when fixing rejected fields. */
export function collectRejectedReviewFieldPathMap(
  pages: ReviewPageData[],
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const page of pages) {
    for (const tab of page.tabs) {
      for (const section of tab.sections) {
        for (const row of section.rows) {
          if (row.formFieldKey && row.fieldPath) {
            map[row.formFieldKey] = row.fieldPath;
          }
        }
      }
      for (const arraySection of tab.arrayChangeSections) {
        for (const item of arraySection.items) {
          for (const row of item.rows) {
            if (row.formFieldKey && row.fieldPath) {
              map[row.formFieldKey] = row.fieldPath;
            }
          }
        }
      }
    }
  }
  return map;
}

export function formatCorrectedFieldValue(value: unknown): string | { added: unknown[] } {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) return { added: value };
  return String(value);
}

export function buildCorrectedFieldsPayload(
  formFieldPathMap: Record<string, string>,
  formData: Record<string, unknown>,
): CorrectedFieldPayload[] {
  return Object.entries(formFieldPathMap).map(([formFieldKey, fieldPath]) => ({
    fieldPath,
    correctedValue: formatCorrectedFieldValue(formData[formFieldKey]),
  }));
}

/** Build formKey → fieldPath map directly from review diff (fallback when store is empty). */
export function buildRejectedReviewFieldPathMapFromReviewDiff(
  diff: ReviewChangeResponse | undefined,
): Record<string, string> {
  return collectRejectedReviewFieldPathMap(transformFailedChangesToPages(diff).pages);
}

export function collectFormFieldKeysForPage(
  pages: ReviewPageData[],
  pageKey: string,
): string[] {
  const page = pages.find((p) => p.pageKey === pageKey);
  if (!page) return [];
  const keys: string[] = [];
  for (const tab of page.tabs) {
    for (const section of tab.sections) {
      for (const row of section.rows) {
        if (row.formFieldKey) keys.push(row.formFieldKey);
      }
    }
    for (const arraySection of tab.arrayChangeSections) {
      for (const item of arraySection.items) {
        for (const row of item.rows) {
          if (row.formFieldKey) keys.push(row.formFieldKey);
        }
      }
    }
  }
  return keys;
}

interface TransformOptions {
  scalarStatusFilter?: ScalarChange["status"];
  includeRejectedFieldEditMeta?: boolean;
}

// --- Main transform ---

export function transformChangesToPages(
  response: ReviewChangeResponse | undefined,
  options?: TransformOptions,
): ReviewTransformResult {
  const errors = response?.errors ?? [];
  const unmappedKeys: string[] = [];
  if (!response?.changes) return { pages: [], errors, unmappedKeys, fieldPathMap: {} };

  const pageMap = new Map<string, Map<string, { sections: Map<string, ReviewFieldRow[]>; arrayChangeSections: ReviewArraySection[] }>>();

  for (const entry of response.changes) {
    const key = entry.fieldPath;
    const change = entry.change;
    const dot = key.indexOf(".");
    if (dot < 0) { unmappedKeys.push(key); continue; }
    const pagePrefix = key.slice(0, dot);

    // Checked before isArrayChange: list fields may arrive as added/removed or as
    // oldValue/newValue, and the latter would otherwise fall through to the scalar
    // path where getFieldLabel cannot resolve them.
    const listConfig = SCALAR_LIST_FIELD_REGISTRY[key];
    if (listConfig && isScalarListChange(change as ScalarListChangeLike)) {
      const listChange = change as ScalarListChangeLike;
      const listStatus = getScalarListChangeStatus(
        listChange,
      ) as ScalarChange["status"] | undefined;
      if (
        options?.scalarStatusFilter &&
        listStatus !== undefined &&
        listStatus !== options.scalarStatusFilter
      ) {
        continue;
      }

      const { previousValue, updatedValue } = formatScalarListChange(listChange);
      const tabName =
        listConfig.tabName ?? getTabForSection(pagePrefix, listConfig.sectionTitle);
      const pathParts = splitReviewFieldPath(key);
      const row: ReviewFieldRow = {
        field: listConfig.label,
        previousValue,
        updatedValue,
        fieldPath: key,
        changeStatus: listStatus,
      };

      if (options?.includeRejectedFieldEditMeta && pathParts && entry.metadata) {
        const { previous, updated } = getScalarListValues(listChange);
        row.pageKey = pathParts.pageKey;
        row.formFieldKey = pathParts.formFieldKey;
        row.rawOldValue = previous;
        row.rawNewValue = updated;
        row.fieldMetadata = mapReviewMetadataToFieldMetadata(entry.metadata, updated);
      }

      if (!pageMap.has(pagePrefix)) pageMap.set(pagePrefix, new Map());
      const listTabMap = pageMap.get(pagePrefix)!;
      if (!listTabMap.has(tabName)) {
        listTabMap.set(tabName, { sections: new Map(), arrayChangeSections: [] });
      }
      const listRows = listTabMap.get(tabName)!.sections.get(listConfig.sectionTitle) ?? [];
      listRows.push(row);
      listTabMap.get(tabName)!.sections.set(listConfig.sectionTitle, listRows);
      continue;
    }

    if (isArrayChange(change)) {
      const config = ARRAY_FIELD_REGISTRY[key];
      if (config) {
      const items: ReviewArrayItem[] = [];
      for (const modified of change.modified ?? []) {
        const mod = modified as { id?: Array<string | number>; changes?: unknown };
        if (!mod.changes) continue;
        const id = mod.id?.[0] ?? "Unknown";
        const rows = collectArrayItemRows(
          mod.changes,
          config,
          key,
          id,
          pagePrefix,
          options,
        );

        if (rows.length > 0) items.push({ id: String(id), rows });
      }

      if (items.length > 0) {
        const tabName = getTabNameForArrayField(pagePrefix, config);
        if (!pageMap.has(pagePrefix)) pageMap.set(pagePrefix, new Map());
        const tabMap = pageMap.get(pagePrefix)!;
        if (!tabMap.has(tabName)) tabMap.set(tabName, { sections: new Map(), arrayChangeSections: [] });
        tabMap.get(tabName)!.arrayChangeSections.push({ tabLabel: config.tabLabel, items });
      }
      continue;
      }

      unmappedKeys.push(key);
      continue;
    }

    const scalar = change as ScalarChange;
    if (options?.scalarStatusFilter && scalar.status !== options.scalarStatusFilter) {
      continue;
    }

    const meta = getFieldLabel(key);
    if (!meta) { unmappedKeys.push(key); continue; }

    const tabName = meta.tabName ?? getTabForSection(pagePrefix, meta.sectionTitle);

    if (!pageMap.has(pagePrefix)) pageMap.set(pagePrefix, new Map());
    const tabMap = pageMap.get(pagePrefix)!;
    if (!tabMap.has(tabName)) tabMap.set(tabName, { sections: new Map(), arrayChangeSections: [] });
    const tabData = tabMap.get(tabName)!;

    const pathParts = splitReviewFieldPath(key);
    const row: ReviewFieldRow = {
      field: meta.label,
      previousValue: normaliseChangeValue(scalar.oldValue, meta.format),
      updatedValue: normaliseChangeValue(scalar.newValue, meta.format),
      fieldPath: key,
      changeStatus: scalar.status,
    };

    if (options?.includeRejectedFieldEditMeta && pathParts && entry.metadata) {
      row.pageKey = pathParts.pageKey;
      row.formFieldKey = pathParts.formFieldKey;
      row.rawOldValue = scalar.oldValue;
      row.rawNewValue = scalar.newValue;
      row.fieldMetadata = mapReviewMetadataToFieldMetadata(
        entry.metadata,
        scalar.newValue,
      );
    }

    const rows = tabData.sections.get(meta.sectionTitle) ?? [];
    rows.push(row);
    tabData.sections.set(meta.sectionTitle, rows);
  }

  if (unmappedKeys.length > 0) {
    console.warn("[reviewFieldRegistry] Unmapped change keys (skipped):", unmappedKeys);
  }

  const pages: ReviewPageData[] = [];
  const fieldPathMap: Record<string, string> = {};

  for (const [pageKey, tabMap] of pageMap) {
    const tabs: ReviewTabData[] = [];
    for (const [tabName, data] of tabMap) {
      const sections = Array.from(data.sections.entries()).map(
        ([title, rows]) => {
          rows.forEach((row, idx) => {
            if (row.fieldPath) {
              fieldPathMap[`${pageKey}::${tabName}::${title}::${idx}`] = row.fieldPath;
            }
          });
          return { title, rows };
        },
      );
      data.arrayChangeSections.forEach(({ tabLabel, items }) => {
        items.forEach((item) => {
          item.rows.forEach((row, idx) => {
            if (row.fieldPath) {
              fieldPathMap[`${pageKey}::${tabName}::${tabLabel}::${item.id}::${idx}`] = row.fieldPath;
            }
          });
        });
      });
      tabs.push({ tabName, sections, arrayChangeSections: data.arrayChangeSections });
    }
    pages.push({
      pageKey,
      pageLabel: PAGE_LABEL_MAP[pageKey] ?? pageKey,
      tabs,
    });
  }

  return { pages, errors, unmappedKeys, fieldPathMap };
}

/** UI keys for fail checkboxes that match SectionTable row key format. */
export function collectPreviouslyMarkedFailedUiKeys(
  fieldPathMap: Record<string, string>,
  response?: ReviewChangeResponse,
): Set<string> {
  const inProgressPaths = collectInProgressReviewFieldPaths(response);
  const keys = new Set<string>();

  for (const [uiKey, path] of Object.entries(fieldPathMap)) {
    if (inProgressPaths.has(path)) {
      keys.add(uiKey);
    }
  }

  return keys;
}

/** Count review changes marked FAILED (top-level scalars and fields inside array modified items). */
export function countFailedReviewChanges(
  response: ReviewChangeResponse | undefined,
): number {
  if (!response?.changes) return 0;

  let count = 0;
  for (const entry of response.changes) {
    const change = entry.change;
    if (isArrayChange(change)) {
      if (
        SCALAR_LIST_FIELD_REGISTRY[entry.fieldPath] &&
        isScalarListChange(change) &&
        getScalarListChangeStatus(change) === "FAILED"
      ) {
        count += 1;
        continue;
      }

      for (const modified of change.modified ?? []) {
        const mod = modified as { changes?: unknown };
        count += countFailedInModifiedChanges(mod.changes);
      }
      continue;
    }

    if ((change as ScalarChange).status === "FAILED") count += 1;
  }
  return count;
}

/** Rebuttal view — only scalar changes with status FAILED, enriched for editable fields. */
export function transformFailedChangesToPages(
  response: ReviewChangeResponse | undefined,
): ReviewTransformResult {
  return transformChangesToPages(response, {
    scalarStatusFilter: "FAILED",
    includeRejectedFieldEditMeta: true,
  });
}

export function getErrorCategory(fieldPath: string): string {
  const scalarListConfig = SCALAR_LIST_FIELD_REGISTRY[fieldPath];
  if (scalarListConfig) return scalarListConfig.sectionTitle;

  for (const [arrayKey, config] of Object.entries(ARRAY_FIELD_REGISTRY)) {
    if (
      fieldPath === arrayKey ||
      fieldPath.startsWith(`${arrayKey}[`) ||
      fieldPath.startsWith(`${arrayKey}.`)
    ) {
      return config.tabLabel;
    }
  }

  const meta = getFieldLabel(fieldPath);
  if (meta) return meta.sectionTitle;

  const segments = fieldPath.split(".");
  return segments.length === 2 ? segments[1] : segments[segments.length - 2];
}
