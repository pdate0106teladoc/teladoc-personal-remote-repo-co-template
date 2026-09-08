import type {
  MarketingSiteUserContact,
  MarketingSiteUserSaveContact,
} from "@/types/OrgView";

export const MARKETING_SITE_USER_TELEMED_FIELD_KEY =
  "details.contacts.marketingSiteUserTelemed";

export const GROUP_MARKETING_SITE_USER_TELEMED_FIELD_KEY =
  "overview.contacts.marketingSiteUserTelemed";

type ContactKeySource = {
  contactReferenceId?: string | null;
  contactId?: string | null;
  referenceId?: string | null;
  id?: string | null;
  displayName?: string;
  name?: string;
};

export const getMarketingContactKey = (contact: ContactKeySource): string =>
  contact.contactReferenceId ??
  contact.referenceId ??
  contact.contactId ??
  contact.id ??
  contact.displayName ??
  contact.name ??
  "";

const isSaveContactArray = (
  value: unknown,
): value is MarketingSiteUserSaveContact[] =>
  Array.isArray(value) &&
  value.length > 0 &&
  typeof value[0] === "object" &&
  value[0] !== null &&
  "marketingSiteUserEnabled" in value[0];

export const contactsFromMetadataNames = (
  names?: string[] | null,
): MarketingSiteUserContact[] =>
  (names ?? [])
    .map((name) => name?.trim())
    .filter((name): name is string => Boolean(name))
    .map((displayName) => ({
      id: displayName,
      contactId: displayName,
      contactReferenceId: displayName,
      displayName,
      marketingSiteUserEnabled: true,
    }));

export const toPreSelectedFromNames = (
  names?: string[] | null,
): Record<string, string> =>
  Object.fromEntries(
    (names ?? [])
      .map((name) => name?.trim())
      .filter((name): name is string => Boolean(name))
      .map((name) => [name, name]),
  );

export const toPreSelectedFromContacts = (
  contacts?: MarketingSiteUserContact[] | null,
): Record<string, string> =>
  Object.fromEntries(
    (contacts ?? [])
      .filter((contact) => contact.marketingSiteUserEnabled !== false)
      .filter((contact) => contact.displayName)
      .map((contact) => [getMarketingContactKey(contact), contact.displayName]),
  );

export const resolveActivePreSelected = (
  value?: string[] | MarketingSiteUserSaveContact[] | null,
  existingContacts?: MarketingSiteUserContact[] | null,
  metadataValue?: string[] | null,
): Record<string, string> => {
  const fromExisting = toPreSelectedFromContacts(existingContacts);
  if (Object.keys(fromExisting).length > 0) {
    return fromExisting;
  }

  if (isSaveContactArray(value)) {
    return Object.fromEntries(
      value
        .filter((contact) => contact.marketingSiteUserEnabled !== false)
        .map((contact) => [getMarketingContactKey(contact), contact.displayName]),
    );
  }

  return toPreSelectedFromNames(
    metadataValue ?? (Array.isArray(value) ? value : undefined),
  );
};

const isEntityContact = (
  contact: unknown,
): contact is MarketingSiteUserContact =>
  typeof contact === "object" &&
  contact !== null &&
  "contactId" in contact &&
  "displayName" in contact;

export const applyMarketingSiteUserContactChanges = (
  currentContacts: MarketingSiteUserContact[] | null | undefined,
  changes: MarketingSiteUserSaveContact[] | string[] | null | undefined,
): MarketingSiteUserContact[] => {
  const enabledCurrent = (currentContacts ?? []).filter(
    (contact) => contact.marketingSiteUserEnabled !== false,
  );

  if (!Array.isArray(changes) || changes.length === 0) {
    return enabledCurrent;
  }

  if (typeof changes[0] === "string") {
    return enabledCurrent;
  }

  const resultMap = new Map(
    enabledCurrent.map((contact) => [getMarketingContactKey(contact), contact]),
  );

  for (const change of changes as MarketingSiteUserSaveContact[]) {
    const key = getMarketingContactKey(change);
    if (change.marketingSiteUserEnabled === false) {
      resultMap.delete(key);
      continue;
    }

    const existing = resultMap.get(key);
    resultMap.set(key, {
      id: existing?.id ?? change.contactReferenceId ?? key,
      contactId: existing?.contactId ?? key,
      contactReferenceId: change.contactReferenceId,
      displayName: change.displayName,
      marketingSiteUserEnabled: true,
    });
  }

  return Array.from(resultMap.values());
};

export const isMarketingSiteUserEntityContactList = (
  contacts: unknown,
): contacts is MarketingSiteUserContact[] =>
  Array.isArray(contacts) &&
  contacts.length > 0 &&
  isEntityContact(contacts[0]);

  export const getMarketingContactsBase = (
    liveContacts: unknown,
    entityContacts?: MarketingSiteUserContact[] | null,
  ): MarketingSiteUserContact[] => {
    if (isMarketingSiteUserEntityContactList(liveContacts)) {
      return liveContacts;
    }
  
    const fromEntity = entityContacts ?? [];
  
    if (Array.isArray(liveContacts)) {
      if (liveContacts.length === 0) {
        return [];
      }
  
      if (typeof liveContacts[0] === "string") {
        return contactsFromMetadataNames(liveContacts as string[]);
      }
  
      if (
        typeof liveContacts[0] === "object" &&
        liveContacts[0] !== null &&
        "marketingSiteUserEnabled" in liveContacts[0]
      ) {
        return applyMarketingSiteUserContactChanges(
          fromEntity,
          liveContacts as MarketingSiteUserSaveContact[],
        );
      }
    }
  
    return fromEntity;
  };

export const getPreSelectedSignature = (
  preSelected: Record<string, string>,
): string =>
  Object.entries(preSelected)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, name]) => `${key}:${name}`)
    .join("|");

export const buildMarketingSiteUserSavePayload = (
  selected: Record<string, string>,
  previousEnabledContacts: MarketingSiteUserContact[],
  contactCache: Record<string, Record<string, unknown>>,
): MarketingSiteUserSaveContact[] => {
  const selectedKeys = new Set(Object.keys(selected));
  const baselineByKey = new Map(
    previousEnabledContacts.map((contact) => [
      getMarketingContactKey(contact),
      contact,
    ]),
  );
  const previousKeys = new Set(baselineByKey.keys());
  const changed: MarketingSiteUserSaveContact[] = [];

  for (const [key, displayName] of Object.entries(selected)) {
    if (previousKeys.has(key)) {
      continue;
    }

    const cached = contactCache[key];
    changed.push({
      contactReferenceId:
        (cached?.referenceId as string | undefined) ??
        (cached?.id as string | undefined) ??
        key,
      contactId: (cached?.id as string | undefined) ?? key,
      displayName,
      marketingSiteUserEnabled: true,
    });
  }

  for (const contact of previousEnabledContacts) {
    const key = getMarketingContactKey(contact);
    if (selectedKeys.has(key)) {
      continue;
    }

    changed.push({
      contactReferenceId: contact.contactReferenceId ?? key,
      contactId: contact.contactId ?? key,
      displayName: contact.displayName,
      marketingSiteUserEnabled: false,
    });
  }

  return changed;
};

export const mergeContactSaveDeltas = (
  cumulative: MarketingSiteUserSaveContact[] | null | undefined,
  increment: MarketingSiteUserSaveContact[],
): MarketingSiteUserSaveContact[] => {
  const merged = new Map<string, MarketingSiteUserSaveContact>();

  for (const change of cumulative ?? []) {
    merged.set(getMarketingContactKey(change), change);
  }

  for (const change of increment) {
    const key = getMarketingContactKey(change);
    const previous = merged.get(key);

    if (change.marketingSiteUserEnabled === false) {
      if (previous?.marketingSiteUserEnabled === true) {
        merged.delete(key);
      } else {
        merged.set(key, change);
      }
      continue;
    }

    if (previous?.marketingSiteUserEnabled === false) {
      merged.delete(key);
    } else {
      merged.set(key, change);
    }
  }

  return Array.from(merged.values());
};

export const selectionToBaselineContacts = (
  selected: Record<string, string>,
  existingContacts: MarketingSiteUserContact[],
  contactCache: Record<string, Record<string, unknown>>,
): MarketingSiteUserContact[] => {
  const existingByKey = new Map(
    existingContacts.map((contact) => [
      getMarketingContactKey(contact),
      contact,
    ]),
  );

  return Object.entries(selected).map(([key, displayName]) => {
    const existing = existingByKey.get(key);
    if (existing) {
      return existing;
    }

    const cached = contactCache[key];
    const referenceId =
      (cached?.referenceId as string | undefined) ??
      (cached?.id as string | undefined) ??
      key;
    return {
      id: referenceId,
      contactId: key,
      contactReferenceId: referenceId,
      displayName,
      marketingSiteUserEnabled: true,
    };
  });
};

export const resetMarketingSiteUserEditState = (
  existingContacts?: MarketingSiteUserContact[] | null,
  metadataValue?: string[] | null,
) => {
  const initialEnabledContacts = (existingContacts ?? []).filter(
    (contact) => contact.marketingSiteUserEnabled !== false,
  );

  return {
    cumulativeDelta: [] as MarketingSiteUserSaveContact[],
    initialEnabledContacts,
    selected: resolveActivePreSelected(
      undefined,
      existingContacts,
      metadataValue,
    ),
  };
};

export const isMarketingSiteUserSaveContactArray = isSaveContactArray;
