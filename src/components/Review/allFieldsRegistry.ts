import { extractEntityData } from "@/utils";
import type { AccountRelationshipSectionData } from "@/types/OrgView";
import {
  renderGeneralSettingOverview,
  renderPermissions,
  renderAccountRelationShipData,
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

// --- Types ---

export type AllFieldsSectionData = Record<string, Record<string, any[]>>;

export interface AllFieldsTabData {
  tabName: string;
  sectionData?: AllFieldsSectionData;
  /** Account relationships render as cards rather than plain sections. */
  accountRelationships?: AccountRelationshipSectionData[];
}

export interface AllFieldsPageData {
  pageKey: string;
  pageLabel: string;
  tabs: AllFieldsTabData[];
  /** Reporting pages render a dedicated component (it owns its own tabs). */
  reporting?: { data: any; isGroup: boolean };
}

type RenderFn = (data: any, ...rest: any[]) => AllFieldsSectionData;

interface AllFieldsTabConfig {
  tabName: string;
  renderFns?: RenderFn[];
  /** Builds account-relationship cards from the page data. */
  accountRelationships?: boolean;
}

interface AllFieldsPageConfig {
  pageLabel: string;
  tabs?: AllFieldsTabConfig[];
  reporting?: { isGroup: boolean };
}

/**
 * Mirrors the tab layout of the real config pages so "Show all fields" shows every
 * metadata-backed field, not just the ones that appear in the review diff.
 * Key order drives the sidebar order; only pages present in the metadata response render.
 */
const ALL_FIELDS_PAGE_REGISTRY: Record<string, AllFieldsPageConfig> = {
  organizationGeneralSettings: {
    pageLabel: "General settings",
    tabs: [
      { tabName: "Overview", renderFns: [renderGeneralSettingOverview as RenderFn] },
      { tabName: "Permissions", renderFns: [renderPermissions as RenderFn] },
      { tabName: "Account relationships", accountRelationships: true },
    ],
  },
  organizationBilling: {
    pageLabel: "Billing",
    tabs: [
      { tabName: "Overview", renderFns: [renderOrgBillingOverview as RenderFn] },
      { tabName: "Invoice detail", renderFns: [renderInvoiceDetails as RenderFn] },
    ],
  },
  organizationEligibility: {
    pageLabel: "Eligibility",
    tabs: [
      { tabName: "Overview", renderFns: [renderOrgEligibilityOverview as RenderFn] },
    ],
  },
  organizationMarketing: {
    pageLabel: "Marketing",
    tabs: [
      { tabName: "Overview", renderFns: [renderMarketingDetails as RenderFn] },
      { tabName: "Telemedicine", renderFns: [renderTelemedcineDetails as RenderFn] },
    ],
  },
  organizationReporting: {
    pageLabel: "Reporting",
    reporting: { isGroup: false },
  },

  groupGeneralSettings: {
    pageLabel: "General settings",
    tabs: [
      {
        tabName: "Overview",
        renderFns: [
          renderGeneralSettingOverviewSec1 as RenderFn,
          renderGeneralSettingOverviewSec2 as RenderFn,
          renderClinicalAndMemberSupport as RenderFn,
        ],
      },
      { tabName: "Group permissions", renderFns: [renderGroupPermissions as RenderFn] },
      { tabName: "Group relationships", renderFns: [renderGroupRelationships as RenderFn] },
    ],
  },
  groupBilling: {
    pageLabel: "Billing",
    tabs: [
      { tabName: "Overview", renderFns: [renderGrpBillingOverview as RenderFn] },
      { tabName: "CCM", renderFns: [renderBillingCCM as RenderFn] },
    ],
  },
  eligibilityAndClaims: {
    pageLabel: "Eligibility and claims",
    tabs: [
      { tabName: "Overview", renderFns: [renderEligibilityOverview as RenderFn] },
      { tabName: "CCM eligibility", renderFns: [renderCcmEligibility as RenderFn] },
    ],
  },
  groupMarketing: {
    pageLabel: "Marketing",
    tabs: [
      { tabName: "Overview", renderFns: [renderMarketingOverview as RenderFn] },
      { tabName: "Telemedicine", renderFns: [renderMarketingTelemedicine as RenderFn] },
      { tabName: "CCM", renderFns: [renderMarketingCcm as RenderFn] },
    ],
  },
  groupReporting: {
    pageLabel: "Reporting",
    reporting: { isGroup: true },
  },
};

// --- Builder ---

/** Merges section data from several render fns, keeping columns unique so nothing is overwritten. */
function mergeSectionData(
  target: AllFieldsSectionData,
  source: AllFieldsSectionData,
  sourceIndex: number,
): void {
  for (const [sectionTitle, cols] of Object.entries(source ?? {})) {
    const existing = target[sectionTitle];
    if (!existing) {
      target[sectionTitle] = { ...cols };
      continue;
    }
    for (const [colKey, rows] of Object.entries(cols ?? {})) {
      const uniqueKey = colKey in existing ? `${colKey}__${sourceIndex}` : colKey;
      existing[uniqueKey] = rows;
    }
  }
}

/** Builds read-only page data straight from the full metadata response, regardless of what changed. */
export function buildAllFieldsPages(
  metadata: Record<string, any> | null | undefined,
): AllFieldsPageData[] {
  if (!metadata) return [];

  const pages: AllFieldsPageData[] = [];

  for (const [pageKey, config] of Object.entries(ALL_FIELDS_PAGE_REGISTRY)) {
    const pageMetadata = metadata[pageKey];
    if (!pageMetadata) continue;

    const data = extractEntityData(pageMetadata);

    if (config.reporting) {
      // ReportingDetails maps over reportRecipient unguarded, so normalise it here.
      const reports = Array.isArray(data?.reporting)
        ? data.reporting.map((report: any) => ({
            ...report,
            reportRecipient: Array.isArray(report?.reportRecipient)
              ? report.reportRecipient
              : [],
          }))
        : [];
      if (reports.length === 0) continue;

      pages.push({
        pageKey,
        pageLabel: config.pageLabel,
        tabs: [],
        reporting: {
          data: { ...data, reporting: reports },
          isGroup: config.reporting.isGroup,
        },
      });
      continue;
    }

    const tabs: AllFieldsTabData[] = [];

    for (const tabConfig of config.tabs ?? []) {
      if (tabConfig.accountRelationships) {
        let cards: AccountRelationshipSectionData[] = [];
        try {
          cards = renderAccountRelationShipData(data) ?? [];
        } catch {
          cards = [];
        }
        if (cards.length > 0) {
          tabs.push({ tabName: tabConfig.tabName, accountRelationships: cards });
        }
        continue;
      }

      const merged: AllFieldsSectionData = {};
      (tabConfig.renderFns ?? []).forEach((fn, index) => {
        try {
          mergeSectionData(merged, fn(data) ?? {}, index);
        } catch {
          /* a render fn that cannot handle sparse metadata contributes nothing */
        }
      });

      if (Object.keys(merged).length > 0) {
        tabs.push({ tabName: tabConfig.tabName, sectionData: merged });
      }
    }

    if (tabs.length > 0) {
      pages.push({ pageKey, pageLabel: config.pageLabel, tabs });
    }
  }

  return pages;
}
