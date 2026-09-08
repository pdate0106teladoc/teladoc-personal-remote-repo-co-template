import { LABELS } from "@/constants";
import { ContactRef } from "@/types";
import { EligibilityAndClaims, SectionData } from "@/types/GrpView";
import { getInitials } from "@/utils";

export const renderEligibilityOverview = (
    data: EligibilityAndClaims,
    metadata?: any,
    onContactClick?: (contact: ContactRef) => void,
): SectionData => {
    const eligibilityDetails = data?.overview?.eligibilityDetails;
    const contacts = data?.overview?.contacts;

    const eligibilityDetailsMeta = metadata?.overview?.eligibilityDetails ?? {};
    const contactsMeta = metadata?.overview?.contacts ?? {};

    return {
        "Eligibility details": {
            col1: [
                {
                    label: LABELS.eligibilityClaims.PRIMARY_REGISTRATION_MEMBER_SOURCE,
                    value: eligibilityDetails?.primaryRegistrationMemberSource,
                    fieldKey: "overview.eligibilityDetails.primaryRegistrationMemberSource",
                    metadata: eligibilityDetailsMeta?.primaryRegistrationMemberSource,
                },
                {
                    label: LABELS.eligibilityClaims.ENABLE_CCM_COMBINED_ELIGIBILITY,
                    value: eligibilityDetails?.enableCcmCombinedEligibility,
                    fieldKey: "overview.eligibilityDetails.enableCcmCombinedEligibility",
                    metadata: eligibilityDetailsMeta?.enableCcmCombinedEligibility,
                    format: "boolean",
                },
                {
                    label: LABELS.eligibilityClaims.DEPENDENT_REGISTRATION_MEMBER_SOURCE,
                    value: eligibilityDetails?.dependentRegistrationMemberSource,
                    fieldKey: "overview.eligibilityDetails.dependentRegistrationMemberSource",
                    metadata: eligibilityDetailsMeta?.dependentRegistrationMemberSource,
                },
                {
                    label: LABELS.eligibilityClaims.MINIMUM_AGE,
                    value: eligibilityDetails?.minAgeForPrimaryRegistration,
                    fieldKey: "overview.eligibilityDetails.minAgeForPrimaryRegistration",
                    metadata: eligibilityDetailsMeta?.minAgeForPrimaryRegistration,
                    lastChild: true,
                }
            ],
            col2: [
                {
                    label: LABELS.eligibilityClaims.DEPENDENT_MINIMUM_AGE,
                    value: eligibilityDetails?.dependentMinimumAge,
                    fieldKey: "overview.eligibilityDetails.dependentMinimumAge",
                    metadata: eligibilityDetailsMeta?.dependentMinimumAge,
                },
                {
                    label: LABELS.eligibilityClaims.DEPENDENT_MAXIMUM_AGE,
                    value: eligibilityDetails?.dependentMaximumAge,
                    fieldKey: "overview.eligibilityDetails.dependentMaximumAge",
                    metadata: eligibilityDetailsMeta?.dependentMaximumAge,
                },
                {
                    label: LABELS.eligibilityClaims.ALLOW_MINOR_REGISTRATION,
                    value: eligibilityDetails?.allowMinorRegistration,
                    fieldKey: "overview.eligibilityDetails.allowMinorRegistration",
                    metadata: eligibilityDetailsMeta?.allowMinorRegistration,
                    lastChild: true,
                },
            ],
        },
        "Contacts": {
            col1: [
                {
                    label: LABELS.eligibilityClaims.ELIGIBILITY_CONTACT,
                    value: contacts?.eligibilityContact,
                    fieldKey: "overview.contacts.eligibilityContact",
                    metadata: contactsMeta?.eligibilityContact,
                    format: "person",
                    personMeta: {
                        name: contacts?.eligibilityContact?.displayName ?? "",
                        initials: getInitials(contacts?.eligibilityContact?.displayName ?? ""),
                    },
                    onPersonClick: contacts?.eligibilityContact?.contactId && onContactClick
                        ? () => onContactClick(contacts!.eligibilityContact)
                        : undefined,
                    lastChild: true,
                },
            ],
            col2: [],
        },
    };
};

export const renderCcmEligibility = (data: EligibilityAndClaims, metadata?: any): SectionData => {
    const eligibilityDetails = data?.ccmEligibility?.eligibilityDetails;
    const ccmIntegrations = data?.ccmEligibility?.ccmIntegrations;

    const eligibilityDetailsMeta = metadata?.ccmEligibility?.eligibilityDetails ?? {};
    const ccmIntegrationsMeta = metadata?.ccmEligibility?.ccmIntegrations ?? {};

    return {
        "Eligibility details": {
            col1: [
                {
                    label: LABELS.eligibilityClaims.LINK_TO_BOX_FOLDER_PHI_RELEASE,
                    value: eligibilityDetails?.linkToBoxFolderPHIRelease,
                    fieldKey: "ccmEligibility.eligibilityDetails.linkToBoxFolderPHIRelease",
                    metadata: eligibilityDetailsMeta?.linkToBoxFolderPHIRelease,
                },
                {
                    label: LABELS.eligibilityClaims.PROGRAM_ELIGIBILITY_FLAG,
                    value: eligibilityDetails?.programEligibilityFlag,
                    fieldKey: "ccmEligibility.eligibilityDetails.programEligibilityFlag",
                    metadata: eligibilityDetailsMeta?.programEligibilityFlag,
                },
                {
                    label: LABELS.eligibilityClaims.IS_ELIGIBILITY_DRIVERITIZED,
                    value: eligibilityDetails?.isEligibilityDriveritized,
                    fieldKey: "ccmEligibility.eligibilityDetails.isEligibilityDriveritized",
                    metadata: eligibilityDetailsMeta?.isEligibilityDriveritized,
                },
                {
                    label: LABELS.eligibilityClaims.ELIGIBILITY_VERIFICATION_METHOD,
                    value: eligibilityDetails?.eligibilityVerificationMethod,
                    fieldKey: "ccmEligibility.eligibilityDetails.eligibilityVerificationMethod",
                    metadata: eligibilityDetailsMeta?.eligibilityVerificationMethod,
                },
                {
                    label: LABELS.eligibilityClaims.POPULATION_DATA_SOURCES,
                    value: eligibilityDetails?.populationDataSources,
                    fieldKey: "ccmEligibility.eligibilityDetails.populationDataSources",
                    metadata: eligibilityDetailsMeta?.populationDataSources,
                },
                {
                    label: LABELS.eligibilityClaims.ELIGIBILITY_FILE_CADENCE,
                    value: eligibilityDetails?.eligibilityFileCadence,
                    fieldKey: "ccmEligibility.eligibilityDetails.eligibilityFileCadence",
                    metadata: eligibilityDetailsMeta?.eligibilityFileCadence,
                },
                {
                    label: LABELS.eligibilityClaims.LINKS_TO_ELIGIBILITY_VERIFICATION_FOLDER,
                    value: eligibilityDetails?.linksToEligibilityVerificationFolder,
                    format: "html",
                    fieldKey: "ccmEligibility.eligibilityDetails.linksToEligibilityVerificationFolder",
                    metadata: eligibilityDetailsMeta?.linksToEligibilityVerificationFolder,
                    lastChild: true,
                },
            ],
            col2: [
                {
                    label: LABELS.eligibilityClaims.MONTHLY_ESCALATION_PATH,
                    value: eligibilityDetails?.monthlyEscalationPath,
                    fieldKey: "ccmEligibility.eligibilityDetails.monthlyEscalationPath",
                    metadata: eligibilityDetailsMeta?.monthlyEscalationPath,
                },
                {
                    label: LABELS.eligibilityClaims.DISABLE_LIVE_PROGRAM_ELIGIBILITY_CHECK,
                    value: eligibilityDetails?.disableLiveProgramEligibilityCheck,
                    fieldKey: "ccmEligibility.eligibilityDetails.disableLiveProgramEligibilityCheck",
                    metadata: eligibilityDetailsMeta?.disableLiveProgramEligibilityCheck,
                },
                {
                    label: LABELS.eligibilityClaims.ELIGIBLE_GROUP_IDS,
                    value: Array.isArray(eligibilityDetails?.eligibleGroupIDs)
                        ? eligibilityDetails?.eligibleGroupIDs?.join(", ")
                        : [],
                    fieldKey: "ccmEligibility.eligibilityDetails.eligibleGroupIDs",
                    metadata: eligibilityDetailsMeta?.eligibleGroupIDs,
                },
                {
                    label: LABELS.eligibilityClaims.MANUAL_CHECK,
                    value: eligibilityDetails?.manualCheck,
                    fieldKey: "ccmEligibility.eligibilityDetails.manualCheck",
                    metadata: eligibilityDetailsMeta?.manualCheck,
                },
                {
                    label: LABELS.eligibilityClaims.ELIGIBILITY_EXCEPTIONS_RULES,
                    value: eligibilityDetails?.eligibilityExceptionsRules,
                    fieldKey: "ccmEligibility.eligibilityDetails.eligibilityExceptionsRules",
                    metadata: eligibilityDetailsMeta?.eligibilityExceptionsRules,
                },
                {
                    label: LABELS.eligibilityClaims.ELIGIBILITY_TEAM_NOTES,
                    value: eligibilityDetails?.eligibilityTeamNotes,
                    lastChild: true,
                    format: "html",
                    fieldKey: "ccmEligibility.eligibilityDetails.eligibilityTeamNotes",
                    metadata: eligibilityDetailsMeta?.eligibilityTeamNotes,
                },
            ],
        },
        "CCM Integrations": {
            col1: [
                {
                    label: LABELS.eligibilityClaims.SSO_PARTNER,
                    value: ccmIntegrations?.ssoPartner,
                    fieldKey: "ccmEligibility.ccmIntegrations.ssoPartner",
                    metadata: ccmIntegrationsMeta?.ssoPartner,
                },
                {
                    label: LABELS.eligibilityClaims.INCENTIVES_API_PARTNER,
                    value: ccmIntegrations?.incentivesAPIPartner,
                    fieldKey: "ccmEligibility.ccmIntegrations.incentivesAPIPartner",
                    metadata: ccmIntegrationsMeta?.incentivesAPIPartner,
                },
                {
                    label: LABELS.eligibilityClaims.INCENTIVES_API_START_DATE,
                    value: ccmIntegrations?.incentivesAPIStartDate,
                    format: "date",
                    fieldKey: "ccmEligibility.ccmIntegrations.incentivesAPIStartDate",
                    metadata: ccmIntegrationsMeta?.incentivesAPIStartDate,
                    lastChild: true,
                },
            ],
            col2: [
                {
                    label: LABELS.eligibilityClaims.INCENTIVE_REPORTING_PARTNER,
                    value: ccmIntegrations?.incentiveReportingPartner,
                    fieldKey: "ccmEligibility.ccmIntegrations.incentiveReportingPartner",
                    metadata: ccmIntegrationsMeta?.incentiveReportingPartner,
                },
                {
                    label: LABELS.eligibilityClaims.MEMBER_SUPPORT_DETAILS,
                    value: ccmIntegrations?.memberSupportDetails,
                    fieldKey: "ccmEligibility.ccmIntegrations.memberSupportDetails",
                    metadata: ccmIntegrationsMeta?.memberSupportDetails,
                },
                {
                    label: LABELS.eligibilityClaims.CVS_TDC_ELIGIBILITY_CRITERIA,
                    value: ccmIntegrations?.cvsTDCEligibilityCriteria,
                    fieldKey: "ccmEligibility.ccmIntegrations.cvsTDCEligibilityCriteria",
                    metadata: ccmIntegrationsMeta?.cvsTDCEligibilityCriteria,
                    lastChild: true,
                },
            ],
        },
    };
};
