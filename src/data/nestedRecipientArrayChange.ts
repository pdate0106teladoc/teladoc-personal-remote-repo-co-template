export interface NestedRecipientArrayChange {
  added?: unknown[];
  removed?: unknown[];
  modified?: unknown[];
  status?: string;
}

export interface NestedRecipientRow {
  field: string;
  previousValue: string;
  updatedValue: string;
}

/** Formats reportRecipient added/removed email diffs grouped by recipient type (To, Bcc, …). */
export function formatNestedRecipientArrayChange(
  change: NestedRecipientArrayChange,
  label: string,
): NestedRecipientRow[] {
  const groupByType = (items: unknown[]): Record<string, string[]> => {
    const grouped: Record<string, string[]> = {};
    for (const item of items) {
      const rec = item as { emailRecipient?: string; emailAddress?: string };
      const type = rec.emailRecipient ?? "Other";
      const email = rec.emailAddress ?? "";
      if (!email) continue;
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(email);
    }
    return grouped;
  };

  const removedByType = groupByType(change.removed ?? []);
  const addedByType = groupByType(change.added ?? []);

  const allTypes = new Set([
    ...Object.keys(removedByType),
    ...Object.keys(addedByType),
  ]);

  const rows: NestedRecipientRow[] = [];
  for (const type of allTypes) {
    const prev = removedByType[type]?.join("\n") ?? "—";
    const updated = addedByType[type]?.join("\n") ?? "—";
    rows.push({
      field: `${label} (${type})`,
      previousValue: prev,
      updatedValue: updated,
    });
  }

  return rows;
}
