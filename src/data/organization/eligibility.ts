import { LABELS } from "@/constants";
import { ContactRef } from "@/types";
import { Eligibility, SectionData } from "@/types/OrgView";
import { getInitials } from "@/utils";

export const renderEligibilityOverview = (
  data: Eligibility,
  metadata?: any,
  onContactClick?: (contact: ContactRef) => void,
): SectionData => {
  const contacts = data?.overview?.contacts;
  const contactsMeta = metadata?.overview?.contact ?? {};

  return {
    Contact: {
      col1: [
        {
          label: LABELS.eligibilityClaims.ELIGIBILITY_CONTACT,
          value: contacts?.eligibilityContact,
          format: "person",
          personMeta: {
            name: contacts?.eligibilityContact?.displayName ?? "",
            initials: getInitials(
              contacts?.eligibilityContact?.displayName ?? "",
            ),
          },
          onPersonClick:
            contacts?.eligibilityContact?.contactId && onContactClick
              ? () => onContactClick(contacts.eligibilityContact!)
              : undefined,
          fieldKey: "overview.contact.eligibilityContact",
          metadata: contactsMeta?.eligibilityContact,
          lastChild: true,
        },
      ],
      col2: [],
    },
  };
};
