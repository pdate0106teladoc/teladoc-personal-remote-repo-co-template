import type { TemplateSection } from "./TemplateSections";
import type { FieldPair, TemplateDetail } from "./templateTypes";

export type ClientOverviewTab =
  | "general-settings"
  | "billing"
  | "marketing"
  | "eligibility";

/** Maps API-shaped detail data to the common section layout used in view mode. */
export const getClientOverviewSections = (
  tab: ClientOverviewTab,
  detail: TemplateDetail,
): TemplateSection<FieldPair>[] => {
  switch (tab) {
    case "general-settings":
      return [
        {
          title: "Overview",
          left: detail.overviewLeft,
          right: detail.overviewRight,
        },
        {
          title: "Group relationship",
          left: detail.groupRelationship,
          right: [],
        },
        {
          title: "Group permissions",
          left: detail.groupPermissionsLeft,
          right: detail.groupPermissionsRight,
        },
        {
          title: "Clinical and member support",
          left: detail.clinicalAndMemberSupportLeft,
          right: detail.clinicalAndMemberSupportRight,
        },
      ];
    case "billing":
      return [
        {
          title: "CCM billing details",
          left: detail.ccmBillingLeft,
          right: detail.ccmBillingRight,
        },
        {
          title: "Contract Details",
          left: detail.contractDetailsLeft,
          right: detail.contractDetailsRight,
        },
        {
          title: "Lapsed User Details",
          left: detail.lapsedUserLeft,
          right: detail.lapsedUserRight,
        },
      ];
    case "marketing":
      return [
        {
          title: "Group Overview",
          left: detail.groupOverviewLeft,
          right: detail.groupOverviewRight,
        },
        {
          title: "CCM Logos",
          left: detail.ccmLogosLeft,
          right: detail.ccmLogosRight,
        },
        {
          title: "Allowed Communication Methods",
          left: detail.allowedCommunicationLeft,
          right: detail.allowedCommunicationRight,
        },
        {
          title: "Marketing Preferences",
          left: detail.marketingPreferencesLeft,
          right: detail.marketingPreferencesRight,
        },
        {
          title: "Additional marketing details",
          left: detail.additionalMarketingLeft,
          right: detail.additionalMarketingRight,
        },
      ];
    case "eligibility":
      return [
        {
          title: "Eligibility Details",
          left: detail.eligibilityDetailsLeft,
          right: detail.eligibilityDetailsRight,
        },
        {
          title: "CCM Integrations",
          left: detail.ccmIntegrationsLeft,
          right: detail.ccmIntegrationsRight,
        },
        {
          title: "Member Support Details",
          left: detail.memberSupportDetails,
          right: [],
        },
      ];
  }
};
