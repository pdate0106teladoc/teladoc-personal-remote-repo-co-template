import { extractDisplayValue } from "@ucc/common-ui";
import type { DisplayType } from "@ucc/common-ui";
import { formatNumberWithCommas } from "@/utils";
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
  isScalarListChange,
  type ScalarListChangeLike,
} from "@/data/scalarListFieldRegistry";

// Structural shape covering both `OrgView.SectionData` and `GrpView.SectionData`,
// which diverge slightly on the `format` literal union.
type RegistryRow = { label: string; fieldKey?: string; format?: string };
type RegistrySectionData = Record<string, Record<string, RegistryRow[]>>;
type RenderFn = (data: any, metadata?: any) => RegistrySectionData;

const PAGE_REGISTRY: Record<string, RenderFn[]> = {
  organizationGeneralSettings: [renderGeneralSettingOverview, renderPermissions],
  organizationBilling: [renderOrgBillingOverview, renderInvoiceDetails],
  organizationEligibility: [renderOrgEligibilityOverview],
  organizationMarketing: [renderMarketingDetails, renderTelemedcineDetails],

  groupGeneralSettings: [
    renderGeneralSettingOverviewSec1,
    renderGeneralSettingOverviewSec2,
    renderGroupPermissions,
    renderGroupRelationships,
    renderClinicalAndMemberSupport,
  ],
  groupBilling: [renderGrpBillingOverview, renderBillingCCM],
  groupMarketing: [renderMarketingOverview, renderMarketingTelemedicine, renderMarketingCcm],
  eligibilityAndClaims: [renderEligibilityOverview, renderCcmEligibility],
};

interface FieldLabelEntry {
  label: string;
  sectionTitle: string;
  format?: string;
}

const MANUAL_FIELD_REGISTRY: Record<string, FieldLabelEntry> = {
  "groupGeneralSettings.overview.clientMemberCodes.code": {
    label: LABELS.grpGeneralSetting.CMC_CODE,
    sectionTitle: "Client member code",
  },
  "groupGeneralSettings.overview.clientMemberCodes.cmcRecordType": {
    label: LABELS.grpGeneralSetting.CMC_RECORD_TYPE,
    sectionTitle: "Client member code",
  },
  "groupGeneralSettings.overview.clientMemberCodes.usedForRegistration": {
    label: LABELS.grpGeneralSetting.CMC_USED_FOR_REGISTRATION_LABEL,
    sectionTitle: "Client member code",
    format: "boolean",
  },
  "groupGeneralSettings.overview.clientMemberCodes.isActive": {
    label: LABELS.grpGeneralSetting.ACTIVE,
    sectionTitle: "Client member code",
    format: "boolean",
  },
  "groupGeneralSettings.overview.clientMemberCodes.account": {
    label: LABELS.grpGeneralSetting.ACCOUNT,
    sectionTitle: "Client member code",
  },
};

const pageLookupCache = new Map<string, Map<string, FieldLabelEntry>>();

function buildPageLookup(pagePrefix: string): Map<string, FieldLabelEntry> {
  const lookup = new Map<string, FieldLabelEntry>();
  const renderFns = PAGE_REGISTRY[pagePrefix];
  if (!renderFns) return lookup;

  for (const fn of renderFns) {
    let sectionData: RegistrySectionData;
    try {
      sectionData = fn({});
    } catch (err) {
      console.warn(`[fieldLabelRegistry] ${pagePrefix} render fn threw on empty data; skipping`, err);
      continue;
    }
    for (const [sectionTitle, cols] of Object.entries(sectionData ?? {})) {
      for (const colRows of Object.values(cols ?? {})) {
        for (const row of colRows ?? []) {
          if (!row?.fieldKey) continue;
          lookup.set(`${pagePrefix}.${row.fieldKey}`, {
            label: row.label,
            sectionTitle: sectionTitle || "Other",
            format: row.format,
          });
        }
      }
    }
  }
  return lookup;
}

export function getFieldLabel(backendKey: string): FieldLabelEntry | undefined {
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

export function normaliseChangeValue(
  raw: string | null | undefined,
  format?: string,
): string {
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

export interface ScalarChange {
  oldValue: string | null;
  newValue: string | null;
}

export interface ArrayChange {
  added?: unknown[];
  removed?: unknown[];
  modified?: unknown[];
}

export interface ChangeResponse {
  changes: Record<string, ScalarChange | ArrayChange>;
  errors?: string[];
}

export interface ChangedFieldRow {
  field: string;
  previousValue: string;
  updatedValue: string;
}

export interface ChangedFieldSection {
  title: string;
  rows: ChangedFieldRow[];
}

export interface ArrayItemChangeGroup {
  id: string;
  rows: ChangedFieldRow[];
}

export interface ArrayChangeSection {
  tabLabel: string;
  items: ArrayItemChangeGroup[];
}

interface ArrayFieldConfig {
  tabLabel: string;
  fields: Record<string, { label: string; format?: string }>;
}

const ARRAY_FIELD_REGISTRY: Record<string, ArrayFieldConfig> = {
  "organizationGeneralSettings.accountRelationships": {
    tabLabel: "Account relationship",
    fields: {
      startDate: { label: "Start date", format: "date" },
      endDate: { label: "End date", format: "date" },
      contractOverview: { label: "Contract overview associated to partner relationship" },
      partnerRelationshipsToTeladoc: { label: "Partner relationships to Teladoc" },
      partnerRelationshipsType: { label: "Partner relationships type" },
      servicingContractType: { label: "Servicing contract type" },
      compositeKey: { label: "Composite key" },
      partnerAccount: { label: "Partner account" },
    },
  },
  "groupGeneralSettings.groupRelationShips": {
    tabLabel: "Group relationship",
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

function isArrayChange(value: unknown): value is ArrayChange {
  return (
    !!value &&
    typeof value === "object" &&
    ("added" in value || "removed" in value || "modified" in value)
  );
}

function formatNestedArrayChange(
  change: ArrayChange,
  label: string,
): ChangedFieldRow[] {
  return formatNestedRecipientArrayChange(change, label);
}

export interface TransformResult {
  sections: ChangedFieldSection[];
  arrayChangeSections: ArrayChangeSection[];
  errors: string[];
  unmappedKeys: string[];
}

export function transformChangesToSections(
  response: ChangeResponse | undefined,
): TransformResult {
  const errors = response?.errors ?? [];
  const unmappedKeys: string[] = [];
  if (!response?.changes) return { sections: [], arrayChangeSections: [], errors, unmappedKeys };

  const bySection = new Map<string, ChangedFieldRow[]>();
  const arrayChangeSections: ArrayChangeSection[] = [];

  for (const [key, change] of Object.entries(response.changes)) {
    // Checked before isArrayChange: list fields may arrive as added/removed or as
    // oldValue/newValue, and the latter would otherwise fall through to the scalar
    // path where getFieldLabel cannot resolve them.
    const listConfig = SCALAR_LIST_FIELD_REGISTRY[key];
    if (listConfig && isScalarListChange(change as ScalarListChangeLike)) {
      const { previousValue, updatedValue } = formatScalarListChange(
        change as ScalarListChangeLike,
      );
      const list = bySection.get(listConfig.sectionTitle) ?? [];
      list.push({ field: listConfig.label, previousValue, updatedValue });
      bySection.set(listConfig.sectionTitle, list);
      continue;
    }

    if (isArrayChange(change)) {
      const config = ARRAY_FIELD_REGISTRY[key];
      if (config) {
      const items: ArrayItemChangeGroup[] = [];
      for (const modified of change.modified ?? []) {
        const mod = modified as { id?: string[]; changes?: Record<string, ScalarChange | ArrayChange> };
        if (!mod.changes) continue;
        const id = mod.id?.[0] ?? "Unknown";
        const rows: ChangedFieldRow[] = [];
        for (const [fieldName, fieldChange] of Object.entries(mod.changes)) {
          const fieldConfig = config.fields[fieldName];
          if (isArrayChange(fieldChange)) {
            const nestedRows = formatNestedArrayChange(fieldChange, fieldConfig?.label ?? fieldName);
            rows.push(...nestedRows);
          } else {
            rows.push({
              field: fieldConfig?.label ?? fieldName,
              previousValue: normaliseChangeValue(fieldChange.oldValue, fieldConfig?.format),
              updatedValue: normaliseChangeValue(fieldChange.newValue, fieldConfig?.format),
            });
          }
        }
        if (rows.length > 0) items.push({ id, rows });
      }
      if (items.length > 0) {
        arrayChangeSections.push({ tabLabel: config.tabLabel, items });
      }
      continue;
      }

      unmappedKeys.push(key);
      continue;
    }
    const meta = getFieldLabel(key);
    if (!meta) {
      unmappedKeys.push(key);
      continue;
    }
    const scalar = change as ScalarChange;
    const list = bySection.get(meta.sectionTitle) ?? [];
    list.push({
      field: meta.label,
      previousValue: normaliseChangeValue(scalar.oldValue, meta.format),
      updatedValue: normaliseChangeValue(scalar.newValue, meta.format),
    });
    bySection.set(meta.sectionTitle, list);
  }

  if (unmappedKeys.length > 0) {
    console.warn("[fieldLabelRegistry] Unmapped change keys (skipped):", unmappedKeys);
  }

  const sections: ChangedFieldSection[] = Array.from(bySection.entries()).map(
    ([title, rows]) => ({ title, rows }),
  );
  return { sections, arrayChangeSections, errors, unmappedKeys };
}

export interface ReviewDiffChangeEntry {
  fieldPath: string;
  change: ScalarChange | ArrayChange | Record<string, unknown>;
}

export interface ReviewDiffResponse {
  changes?: ReviewDiffChangeEntry[];
  errors?: string[];
}

/** Converts review API `diff` (array of fieldPath entries) to diff-library ChangeResponse shape. */
export function normalizeReviewDiffToChangeResponse(
  reviewDiff: ReviewDiffResponse | undefined,
  options?: { scalarStatusFilter?: string },
): ChangeResponse | undefined {
  if (!reviewDiff) return undefined;

  const changes: Record<string, ScalarChange | ArrayChange> = {};
  for (const entry of reviewDiff.changes ?? []) {
    const change = entry.change;
    if (isArrayChange(change)) {
      if (options?.scalarStatusFilter) continue;
      changes[entry.fieldPath] = change;
      continue;
    }
    const scalar = change as Record<string, unknown>;
    if (
      options?.scalarStatusFilter &&
      scalar.status !== options.scalarStatusFilter
    ) {
      continue;
    }
    changes[entry.fieldPath] = {
      oldValue: (scalar.oldValue ?? null) as ScalarChange["oldValue"],
      newValue: (scalar.newValue ?? null) as ScalarChange["newValue"],
    };
  }

  return { changes, errors: reviewDiff.errors };
}
