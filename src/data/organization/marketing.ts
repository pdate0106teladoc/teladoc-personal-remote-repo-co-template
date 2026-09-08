import { LABELS } from "@/constants";
import { ContactRef } from "@/types";
import { Marketing, SectionData } from "@/types/OrgView";
import { getInitials, getSafeString } from "@/utils";

const marketingLabels = LABELS.marketing;

export const renderMarketingDetails = (
  data: Marketing,
  metadata?: any,
  onContactClick?: (contact: ContactRef) => void,
): SectionData => {
  const details = data?.details ?? {};
  const printSettings = details.printSettings ?? {};
  const primaryMarketingContact = details.primaryMarketingContact ?? {};
  const primaryMarketingContactMeta = metadata?.details?.primaryMarketingContact ?? {};
  const printSettingsMeta = metadata?.details?.printSettings ?? {};

  return {
    "Print settings": {
      col1: [
        {
          label: marketingLabels.PRINT_URL,
          value: getSafeString(printSettings?.printUrl),
          format: "link",
          fieldKey: "details.printSettings.printUrl",
          metadata: printSettingsMeta?.printUrl,
        },
        {
          label: marketingLabels.WEB_URL,
          value: getSafeString(printSettings?.webUrl),
          format: "link",
          fieldKey: "details.printSettings.webUrl",
          metadata: printSettingsMeta?.webUrl,
          lastChild: true,
        },
      ],
      col2: [
        {
          label: marketingLabels.PRINT_PHONE,
          value: printSettings?.printPhone,
          fieldKey: "details.printSettings.printPhone",
          metadata: printSettingsMeta?.printPhone,
        },
      ],
    },
    "Primary Marketing Contact": {
      col1: [
        {
          label: LABELS.marketing.PRIMARY_MARKETING_CONTACT,
          value: primaryMarketingContact?.primaryMarketingContact,
          format: "person",
          tooltipContent: LABELS.marketing.LABEL_PRIMARY_MARKETING_CONTACT_TOOLTIP,
          fieldKey: "details.primaryMarketingContact.primaryMarketingContact",
          metadata: primaryMarketingContactMeta?.primaryMarketingContact,
          personMeta: {
            name:
              primaryMarketingContact?.primaryMarketingContact?.displayName ??
              "",
            initials: getInitials(
              primaryMarketingContact?.primaryMarketingContact?.displayName ??
                "",
            ),
          },
          onPersonClick:
            primaryMarketingContact?.primaryMarketingContact?.contactId &&
            onContactClick
              ? () =>
                  onContactClick(
                    primaryMarketingContact.primaryMarketingContact,
                  )
              : undefined,
          lastChild: true,
        },
      ],
      col2: [],
    },
  };
};

export const renderTelemedcineDetails = (
  data: Marketing,
  metadata?: any,
): SectionData => {
  const telemedicine = data?.teleMedicine?.marketingPreferences ?? {};
  const marketingPreferencesMeta =
    metadata?.teleMedicine?.marketingPreferences ?? {};

  return {
    "Marketing preferences": {
      col1: [
        {
          label: marketingLabels.DIRECT_MAIL_OPT_IN,
          value: telemedicine?.directMailOptIn,
          fieldKey: "teleMedicine.marketingPreferences.directMailOptIn",
          metadata: marketingPreferencesMeta?.directMailOptIn,
        },
        {
          label: marketingLabels.INCENTIVES_OPT_IN,
          value: telemedicine?.incentiveOptIn,
          fieldKey: "teleMedicine.marketingPreferences.incentiveOptIn",
          metadata: marketingPreferencesMeta?.incentiveOptIn,
        },
        {
          label: marketingLabels.EMAIL_OPT_IN,
          value: telemedicine?.emailOptIn,
          fieldKey: "teleMedicine.marketingPreferences.emailOptIn",
          metadata: marketingPreferencesMeta?.emailOptIn,
          lastChild: true,
        },
      ],
      col2: [
        {
          label: marketingLabels.OUTBOUND_CALLS_OPT_IN,
          value: telemedicine?.outboundCallsOptIn,
          fieldKey: "teleMedicine.marketingPreferences.outboundCallsOptIn",
          metadata: marketingPreferencesMeta?.outboundCallsOptIn,
        },
        {
          label: marketingLabels.TEXT_OPT_IN,
          value: telemedicine?.textOptIn,
          fieldKey: "teleMedicine.marketingPreferences.textOptIn",
          metadata: marketingPreferencesMeta?.textOptIn,
          lastChild: true,
        },
      ],
    },
  };
};
