import React from "react";
import { CustomCards } from "@/components/Cards/CustomCards";
import { LABELS } from "@/constants";
import type { FieldMetadata } from "@/types/edit";
import type {
  MarketingSiteUserContact,
  MarketingSiteUserSaveContact,
} from "@/types/OrgView";
import EditableMarketingSiteUsers from "./EditableMarketingSiteUsers";
import { MARKETING_SITE_USER_TELEMED_FIELD_KEY } from "@/utils/marketingSiteUsers";
import ExpandableContactList, {
  type ExpandableContactListItem,
} from "./ExpandableContactList";

interface PrimaryMarketingContactSectionProps {
  contacts?: MarketingSiteUserContact[] | null;
  mode?: "view" | "edit";
  metadata?: FieldMetadata;
  fieldKey?: string;
  editValue?: string[] | MarketingSiteUserSaveContact[] | null;
  onFieldChange?: (
    fieldKey: string,
    value: MarketingSiteUserSaveContact[] | string[],
  ) => void;
  error?: string;
  tooltipContent?: string;
  lastSavedAt?: string | null;
  onContactClick?: (contact: ExpandableContactListItem) => void;
}

export const normalizeMarketingContacts = (
  data?: MarketingSiteUserContact[] | null,
): ExpandableContactListItem[] => {
  if (!data?.length) return [];

  return data
    .map((item) => ({
      displayName: item.displayName ?? "",
      contactId: item.contactId,
      id: item.id,
    }))
    .filter((item) => item.displayName);
};

const PrimaryMarketingContactSection: React.FC<
  PrimaryMarketingContactSectionProps
> = ({
  contacts,
  mode = "view",
  metadata,
  fieldKey = MARKETING_SITE_USER_TELEMED_FIELD_KEY,
  editValue,
  onFieldChange,
  error,
  tooltipContent,
  lastSavedAt,
  onContactClick,
}) => {
  const label = LABELS.marketing.MARKETING_SITE_USER_TELEMED;

  return (
    <CustomCards title={LABELS.marketing.CONTACT}>
      {mode === "edit" ? (
        <EditableMarketingSiteUsers
          label={label}
          fieldKey={fieldKey}
          value={editValue ?? metadata?.value}
          existingContacts={contacts}
          metadata={metadata}
          onChange={onFieldChange}
          lastSavedAt={lastSavedAt}
          error={error}
          tooltipContent={tooltipContent}
        />
      ) : (
        <ExpandableContactList
          label={label}
          contacts={normalizeMarketingContacts(contacts)}
          tooltipContent={tooltipContent}
          onContactClick={onContactClick}
        />
      )}
    </CustomCards>
  );
};

export default PrimaryMarketingContactSection;
