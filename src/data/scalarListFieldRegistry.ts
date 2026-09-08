import { LABELS } from "@/constants";

export interface ArrayChangeLike {
  added?: unknown[];
  removed?: unknown[];
  modified?: unknown[];
}

/**
 * List fields arrive in one of two shapes: the diff library's `added`/`removed`,
 * or `oldValue`/`newValue` holding the whole list before and after
 * (what the backend now sends for marketingSiteUserTelemed).
 */
export interface ScalarListChangeLike extends ArrayChangeLike {
  oldValue?: unknown;
  newValue?: unknown;
}

const asList = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

/** True when the change carries whole-list values rather than an added/removed delta. */
export const isWholeListChange = (change: ScalarListChangeLike): boolean =>
  Array.isArray(change.oldValue) || Array.isArray(change.newValue);

/** Raw previous/updated list items, whichever shape the change arrived in. */
export function getScalarListValues(change: ScalarListChangeLike): {
  previous: unknown[];
  updated: unknown[];
} {
  if (isWholeListChange(change)) {
    return { previous: asList(change.oldValue), updated: asList(change.newValue) };
  }
  return { previous: asList(change.removed), updated: asList(change.added) };
}

export interface ScalarListFieldConfig {
  label: string;
  sectionTitle: string;
  tabName?: string;
}

/** Multi-select / list fields diffed via top-level added (new) and removed (old). */
export const SCALAR_LIST_FIELD_REGISTRY: Record<string, ScalarListFieldConfig> = {
  "organizationMarketing.details.contacts.marketingSiteUserTelemed": {
    label: LABELS.marketing.MARKETING_SITE_USER_TELEMED,
    sectionTitle: LABELS.marketing.CONTACT,
    tabName: "Overview",
  },
  "groupMarketing.overview.contacts.marketingSiteUserTelemed": {
    label: LABELS.grpMarketing.MARKETING_SITE_USER_TELEMED,
    sectionTitle: LABELS.marketing.CONTACT,
    tabName: "Overview",
  },
};

export function isScalarListChange(change: ScalarListChangeLike): boolean {
  if (isWholeListChange(change)) return true;
  const hasModified = (change.modified ?? []).length > 0;
  const hasAddedOrRemoved =
    (change.added ?? []).length > 0 || (change.removed ?? []).length > 0;
  return !hasModified && hasAddedOrRemoved;
}

function formatListItems(items: unknown[]): string {
  const lines = items
    .map((item) => {
      if (item === null || item === undefined) return "";
      if (typeof item === "string") return item.trim();
      const rec = item as { displayName?: string; name?: string };
      return (rec.displayName ?? rec.name ?? String(item)).trim();
    })
    .filter(Boolean);

  return lines.length > 0 ? lines.join("\n") : "—";
}

/** removed/oldValue → previous value, added/newValue → updated value */
export function formatScalarListChange(change: ScalarListChangeLike): {
  previousValue: string;
  updatedValue: string;
} {
  const { previous, updated } = getScalarListValues(change);
  return {
    previousValue: formatListItems(previous),
    updatedValue: formatListItems(updated),
  };
}

export function getScalarListChangeStatus(
  change: ArrayChangeLike & { status?: string },
): string | undefined {
  return typeof change.status === "string" ? change.status : undefined;
}
