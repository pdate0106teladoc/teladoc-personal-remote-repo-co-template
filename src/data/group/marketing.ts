import { LABELS } from "@/constants";
import { Marketing, SectionData } from "@/types/GrpView";
import { getSafeString } from "@/utils";


export const renderMarketingOverview = (data: Marketing, metadata?: any): SectionData => {
    const marketingOverview = data?.overview?.brand;
    const telemedicineLogos = data?.overview?.telemedicineLogos;
    const ccmLogos = data?.overview?.ccmLogos;

    const brandMeta = metadata?.overview?.brand ?? {};
    const telemedicineLogosMeta = metadata?.overview?.telemedicineLogos ?? {};
    const ccmLogosMeta = metadata?.overview?.ccmLogos ?? {};

    return {
        "Brand": {
            col1: [
                {
                    label: LABELS.grpMarketing.SERVICE_BRAND,
                    value: marketingOverview?.serviceBrand,
                    fieldKey: "overview.brand.serviceBrand",
                    metadata: brandMeta?.serviceBrand,
                    lastChild: true,
                },
            ],
            col2: [],
        },
        "Telemed Logos": {
            col1: [
                {
                    label: LABELS.grpMarketing.LOGO_TAG,
                    value: telemedicineLogos?.logoTag,
                    fieldKey: "overview.telemedicineLogos.logoTag",
                    metadata: telemedicineLogosMeta?.logoTag,
                    format: "img",
                },
                {
                    label: LABELS.grpMarketing.LOGO_TAG_ID,
                    value: telemedicineLogos?.logoTagID,
                    fieldKey: "overview.telemedicineLogos.logoTagID",
                    metadata: {
                        ...telemedicineLogosMeta?.logoTagID,
                        responseIdField: "content_document_title",
                        responseNameField: "content_document_title"
                    },
                    ...(telemedicineLogosMeta?.logoTagID && {
                        tooltipContent: LABELS.grpMarketing.LOGO_TAG_TOOLTIP,
                    }),
                },
                {
                    label: LABELS.grpMarketing.LOGO_1,
                    value: telemedicineLogos?.logos?.[0]?.logo,
                    fieldKey: "overview.telemedicineLogos.logos.0.logo",
                    metadata: telemedicineLogosMeta?.logos?.[0]?.logo,
                    format: "img"
                },
                {
                    label: LABELS.grpMarketing.LOGO_1_ID,
                    value: telemedicineLogos?.logos?.[0]?.logoId,
                    fieldKey: "overview.telemedicineLogos.logos.0.logoId",
                    metadata: {
                        ...telemedicineLogosMeta?.logos?.[0]?.logoId,
                        responseIdField: "content_document_title",
                        responseNameField: "content_document_title"
                    },
                    ...(telemedicineLogosMeta?.logos?.[0]?.logoId && {
                        tooltipContent: LABELS.grpMarketing.LOGO_TAG_TOOLTIP,
                    }),
                },
                {
                    label: LABELS.grpMarketing.LOGO_3,
                    value: telemedicineLogos?.logos?.[1]?.logo,
                    fieldKey: "overview.telemedicineLogos.logos.1.logo",
                    metadata: telemedicineLogosMeta?.logos?.[1]?.logo,
                    format: "img"
                },
                {
                    label: LABELS.grpMarketing.LOGO_3_ID,
                    value: telemedicineLogos?.logos?.[1]?.logoId,
                    fieldKey: "overview.telemedicineLogos.logos.1.logoId",
                    metadata: {
                        ...telemedicineLogosMeta?.logos?.[1]?.logoId,
                        responseIdField: "content_document_title",
                        responseNameField: "content_document_title"
                    },
                    ...(telemedicineLogosMeta?.logos?.[1]?.logoId && {
                        tooltipContent: LABELS.grpMarketing.LOGO_TAG_TOOLTIP,
                    }),
                },
                {
                    label: LABELS.grpMarketing.LOGO_4,
                    value: telemedicineLogos?.logos?.[2]?.logo,
                    fieldKey: "overview.telemedicineLogos.logos.2.logo",
                    metadata: telemedicineLogosMeta?.logos?.[2]?.logo,
                    format: "img"
                },
                {
                    label: LABELS.grpMarketing.LOGO_4_ID,
                    value: telemedicineLogos?.logos?.[2]?.logoId,
                    fieldKey: "overview.telemedicineLogos.logos.2.logoId",
                    metadata: {
                        ...telemedicineLogosMeta?.logos?.[2]?.logoId,
                        responseIdField: "content_document_title",
                        responseNameField: "content_document_title"
                    },
                    ...(telemedicineLogosMeta?.logos?.[2]?.logoId && {
                        tooltipContent: LABELS.grpMarketing.LOGO_TAG_TOOLTIP,
                    }),
                },
                {
                    label: LABELS.grpMarketing.CO_BRAND_WITH_LOGO,
                    value: telemedicineLogos?.coBrandWithLogo,
                    fieldKey: "overview.telemedicineLogos.coBrandWithLogo",
                    metadata: telemedicineLogosMeta?.coBrandWithLogo,
                },
                {
                    label: LABELS.grpMarketing.TRI_BRAND_WITH_LOGO,
                    value: telemedicineLogos?.triBrandWithLogo,
                    fieldKey: "overview.telemedicineLogos.triBrandWithLogo",
                    metadata: telemedicineLogosMeta?.triBrandWithLogo,
                    lastChild: true,
                }
            ],
            col2: [
                {
                    label: LABELS.grpMarketing.ALT_LOGO_1,
                    value: telemedicineLogos?.altLogos?.[0]?.altLogo,
                    fieldKey: "overview.telemedicineLogos.altLogos.0.altLogo",
                    metadata: telemedicineLogosMeta?.altLogos?.[0]?.altLogo,
                    format: "img"
                },
                {
                    label: LABELS.grpMarketing.ALT_LOGO_1_ID,
                    value: telemedicineLogos?.altLogos?.[0]?.altLogoId,
                    fieldKey: "overview.telemedicineLogos.altLogos.0.altLogoId",
                    metadata: {
                        ...telemedicineLogosMeta?.altLogos?.[0]?.altLogoId,
                        responseIdField: "content_document_title",
                        responseNameField: "content_document_title"
                    },
                    ...(telemedicineLogosMeta?.altLogos?.[0]?.altLogoId && {
                        tooltipContent: LABELS.grpMarketing.LOGO_TAG_TOOLTIP,
                    }),
                },
                {
                    label: LABELS.grpMarketing.ALT_LOGO_2,
                    value: telemedicineLogos?.altLogos?.[1]?.altLogo,
                    fieldKey: "overview.telemedicineLogos.altLogos.1.altLogo",
                    metadata: telemedicineLogosMeta?.altLogos?.[1]?.altLogo,
                    format: "img"
                },
                {
                    label: LABELS.grpMarketing.ALT_LOGO_2_ID,
                    value: telemedicineLogos?.altLogos?.[1]?.altLogoId,
                    fieldKey: "overview.telemedicineLogos.altLogos.1.altLogoId",
                    metadata: {
                        ...telemedicineLogosMeta?.altLogos?.[1]?.altLogoId,
                        responseIdField: "content_document_title",
                        responseNameField: "content_document_title"
                    },
                    ...(telemedicineLogosMeta?.altLogos?.[1]?.altLogoId && {
                        tooltipContent: LABELS.grpMarketing.LOGO_TAG_TOOLTIP,
                    }),
                },
                {
                    label: LABELS.grpMarketing.LOGO_TILE,
                    value: telemedicineLogos?.logoTitle,
                    fieldKey: "overview.telemedicineLogos.logoTitle",
                    metadata: telemedicineLogosMeta?.logoTitle,
                },
                {
                    label: LABELS.grpMarketing.LOGO_DESCRIPTION,
                    value: telemedicineLogos?.logoDescription,
                    fieldKey: "overview.telemedicineLogos.logoDescription",
                    metadata: telemedicineLogosMeta?.logoDescription,
                },
                {
                    label: LABELS.grpMarketing.SFMC_ID,
                    value: telemedicineLogos?.sfmcId,
                    fieldKey: "overview.telemedicineLogos.sfmcId",
                    metadata: telemedicineLogosMeta?.sfmcId,
                },
                {
                    label: LABELS.grpMarketing.CURRENCY_ISO_CODE,
                    value: telemedicineLogos?.currencyISOCode,
                    fieldKey: "overview.telemedicineLogos.currencyISOCode",
                    metadata: telemedicineLogosMeta?.currencyISOCode,
                },
                {
                    label: LABELS.grpMarketing.FILE_EXTENSION,
                    value: telemedicineLogos?.fileExtension,
                    fieldKey: "overview.telemedicineLogos.fileExtension",
                    metadata: telemedicineLogosMeta?.fileExtension,
                },
            ],
        },
        "CCM Logos": {
            col1: [
                {
                    label: LABELS.grpMarketing.LOGO_FILE_NAME,
                    value: ccmLogos?.logoFileName,
                    fieldKey: "overview.ccmLogos.logoFileName",
                    metadata: ccmLogosMeta?.logoFileName,
                    lastChild: true,
                },
            ],
            col2: [
                {
                    label: LABELS.grpMarketing.CLIENT_LOGO_LINK,
                    value: getSafeString(ccmLogos?.clientLogoLink),
                    fieldKey: "overview.ccmLogos.clientLogoLink",
                    metadata: ccmLogosMeta?.clientLogoLink,
                    format: "link",
                    lastChild: true,
                },
            ],
        },
    };
};

export const renderMarketingTelemedicine = (data: Marketing, metadata?: any): SectionData => {
    const marketingPreferences = data?.telemedicine?.marketingPreferences;
    const wellboundEap = data?.telemedicine?.wellboundEap;
    const marketingData = data?.telemedicine?.marketingData;
    const welcomeLetter = data?.telemedicine?.welcomeLetter;
    const p360 = data?.telemedicine?.p360;

    const marketingPreferencesMeta = metadata?.telemedicine?.marketingPreferences ?? {};
    const wellboundEapMeta = metadata?.telemedicine?.wellboundEap ?? {};
    const marketingDataMeta = metadata?.telemedicine?.marketingData ?? {};
    const welcomeLetterMeta = metadata?.telemedicine?.welcomeLetter ?? {};
    const p360Meta = metadata?.telemedicine?.p360 ?? {};

    return {
        "Marketing preferences": {
            col1: [
                {
                    label: LABELS.grpMarketing.LANGUAGE,
                    value: marketingPreferences?.language,
                    fieldKey: "telemedicine.marketingPreferences.language",
                    metadata: marketingPreferencesMeta?.language,
                },
                {
                    label: LABELS.grpMarketing.HEALTH_BENEFIT_LANGUAGE,
                    value: marketingPreferences?.healthBenefitLanguage,
                    fieldKey: "telemedicine.marketingPreferences.healthBenefitLanguage",
                    metadata: marketingPreferencesMeta?.healthBenefitLanguage,
                },
                {
                    label: LABELS.grpMarketing.PREFERRED_ELIGIBILITY_LANGUAGE,
                    value: marketingPreferences?.preferredEligibilityLanguage,
                    fieldKey: "telemedicine.marketingPreferences.preferredEligibilityLanguage",
                    metadata: {
                        ...marketingPreferencesMeta?.preferredEligibilityLanguage,
                        responseDataPath: "eligibilityLanguages",
                        responseNameField: "name",
                        responseIdField: "id"
                    },
                },
                {
                    label: LABELS.grpMarketing.TESTING_PERMISSION,
                    value: marketingPreferences?.testingPermission,
                    fieldKey: "telemedicine.marketingPreferences.testingPermission",
                    metadata: marketingPreferencesMeta?.testingPermission,
                },
                {
                    label: LABELS.grpMarketing.MODELING_PERMISSION,
                    value: marketingPreferences?.modelingPermission,
                    fieldKey: "telemedicine.marketingPreferences.modelingPermission",
                    metadata: marketingPreferencesMeta?.modelingPermission,
                },
                {
                    label: LABELS.grpMarketing.COMMUNICATION_MODE,
                    value: marketingPreferences?.communicationMode,
                    fieldKey: "telemedicine.marketingPreferences.communicationMode",
                    metadata: marketingPreferencesMeta?.communicationMode,
                },
                {
                    label: LABELS.grpMarketing.REGISTRATION_ENROLLMENT_ENGAGEMENT_TIER,
                    value: marketingPreferences?.registrationEnrollmentEngagementTier,
                    fieldKey: "telemedicine.marketingPreferences.registrationEnrollmentEngagementTier",
                    metadata: marketingPreferencesMeta?.registrationEnrollmentEngagementTier,
                    lastChild: true,
                },
            ],
            col2: [
                {
                    label: LABELS.grpMarketing.EMAIL_OPT_IN,
                    value: marketingPreferences?.emailOptIn,
                    fieldKey: "telemedicine.marketingPreferences.emailOptIn",
                    metadata: marketingPreferencesMeta?.emailOptIn
                },
                {
                    label: LABELS.grpMarketing.DIRECT_MAIL_OPT_IN,
                    value: marketingPreferences?.directMailOptIn,
                    fieldKey: "telemedicine.marketingPreferences.directMailOptIn",
                    metadata: marketingPreferencesMeta?.directMailOptIn
                },
                {
                    label: LABELS.grpMarketing.OUTBOUND_CALLS_OPT_IN,
                    value: marketingPreferences?.outboundCallsOptIn,
                    fieldKey: "telemedicine.marketingPreferences.outboundCallsOptIn",
                    metadata: marketingPreferencesMeta?.outboundCallsOptIn,
                },
                {
                    label: LABELS.grpMarketing.TEXT_OPT_IN,
                    value: marketingPreferences?.textOptIn,
                    fieldKey: "telemedicine.marketingPreferences.textOptIn",
                    metadata: marketingPreferencesMeta?.textOptIn,
                },
                {
                    label: LABELS.grpMarketing.INCENTIVES_OPT_IN,
                    value: marketingPreferences?.incentivesOptIn,
                    fieldKey: "telemedicine.marketingPreferences.incentivesOptIn",
                    metadata: marketingPreferencesMeta?.incentivesOptIn,
                },
                {
                    label: LABELS.grpMarketing.REGISTRATION_ENROLLMENT_JOURNEY,
                    value: marketingPreferences?.registrationEnrollmentJourney,
                    fieldKey: "telemedicine.marketingPreferences.registrationEnrollmentJourney",
                    metadata: marketingPreferencesMeta?.registrationEnrollmentJourney,
                },
                {
                    label: LABELS.grpMarketing.ONGOING_REGISTRATION_ENROLLMENT_JOURNEY,
                    value: marketingPreferences?.ongoingRegistrationEnrollmentJourney,
                    fieldKey: "telemedicine.marketingPreferences.ongoingRegistrationEnrollmentJourney",
                    metadata: marketingPreferencesMeta?.ongoingRegistrationEnrollmentJourney,
                    lastChild: true,
                },
            ],
        },
        "Wellbound EAP": {
            col1: [{
                label: "Wellbound EAP - BetterHelp URL",
                value: getSafeString(wellboundEap?.wellboundEAPBetterHelpURL),
                fieldKey: "telemedicine.wellboundEap.wellboundEAPBetterHelpURL",
                metadata: wellboundEapMeta?.wellboundEAPBetterHelpURL,
                format: "link",
                lastChild: true,
            }],
            col2: [
                {
                    label: "Wellbound EAP - Teladoc URL",
                    value: getSafeString(wellboundEap?.wellboundEAPTeladocURL),
                    fieldKey: "telemedicine.wellboundEap.wellboundEAPTeladocURL",
                    metadata: wellboundEapMeta?.wellboundEAPTeladocURL,
                    format: "link",
                    lastChild: true,
                }
            ]
        },
        "Marketing data": {
            col1: [
                {
                    label: LABELS.grpMarketing.RECEIVING_CLAIMS_DATA_FOR_TELEMED_PROGRAMS,
                    value: marketingData?.receivingClaimsDataForTelemedPrograms,
                    format: "boolean",
                    fieldKey: "telemedicine.marketingData.receivingClaimsDataForTelemedPrograms",
                    metadata: marketingDataMeta?.receivingClaimsDataForTelemedPrograms,
                    lastChild: true,
                },
            ],
            col2: [],
        },
        "Welcome letter": {
            col1: [
                {
                    label: LABELS.grpMarketing.WK_TEMPLATE,
                    value: welcomeLetter?.welcomeLetterTemplate,
                    fieldKey: "telemedicine.welcomeLetter.welcomeLetterTemplate",
                    metadata: welcomeLetterMeta?.welcomeLetterTemplate,
                },
                {
                    label: LABELS.grpMarketing.CARD_NAME,
                    value: welcomeLetter?.cardName,
                    fieldKey: "telemedicine.welcomeLetter.cardName",
                    metadata: welcomeLetterMeta?.cardName,
                },
                {
                    label: LABELS.grpMarketing.CLIENT_ACCOUNT_LOCATION,
                    value: welcomeLetter?.clientAccountLocation,
                    fieldKey: "telemedicine.welcomeLetter.clientAccountLocation",
                    metadata: welcomeLetterMeta?.clientAccountLocation,
                },
                {
                    label: LABELS.grpMarketing.MK_CONSULT_AREA,
                    value: welcomeLetter?.mkConsultArea,
                    fieldKey: "telemedicine.welcomeLetter.mkConsultArea",
                    metadata: welcomeLetterMeta?.mkConsultArea,
                },
                {
                    label: LABELS.grpMarketing.DISCLAIMER_TELADOC,
                    value: welcomeLetter?.disclaimerTeladoc,
                    fieldKey: "telemedicine.welcomeLetter.disclaimerTeladoc",
                    metadata: {
                        ...welcomeLetterMeta?.disclaimerTeladoc,
                        responseDataPath: "disclaimers",
                        responseNameField: "name",
                        responseIdField: "name"
                    },
                },
                {
                    label: LABELS.grpMarketing.CLIENT_DISCLAIMER,
                    value: welcomeLetter?.clientDisclaimer,
                    fieldKey: "telemedicine.welcomeLetter.clientDisclaimer",
                    metadata: {
                        ...welcomeLetterMeta?.clientDisclaimer,
                        responseDataPath: "disclaimers",
                        responseNameField: "name",
                        responseIdField: "name"
                    },
                },
                {
                    label: LABELS.grpMarketing.DISCLAIMER_CUSTOM,
                    value: welcomeLetter?.disclaimerCustom,
                    fieldKey: "telemedicine.welcomeLetter.disclaimerCustom",
                    metadata: welcomeLetterMeta?.disclaimerCustom,
                },
                {
                    label: LABELS.grpMarketing.SEND_CARD,
                    value: welcomeLetter?.sendCard,
                    fieldKey: "telemedicine.welcomeLetter.sendCard",
                    metadata: welcomeLetterMeta?.sendCard,
                    format: "boolean",
                },
                {
                    label: LABELS.grpMarketing.ACTIVE_DATE,
                    value: welcomeLetter?.activeDate,
                    fieldKey: "telemedicine.welcomeLetter.activeDate",
                    metadata: welcomeLetterMeta?.activeDate,
                    format: "date",
                },
                {
                    label: LABELS.grpMarketing.SHIPPING_CLASS,
                    value: welcomeLetter?.shippingClass,
                    fieldKey: "telemedicine.welcomeLetter.shippingClass",
                    metadata: welcomeLetterMeta?.shippingClass,
                },
                {
                    label: LABELS.grpMarketing.COMPANY_COPY,
                    value: welcomeLetter?.companyCopy,
                    fieldKey: "telemedicine.welcomeLetter.companyCopy",
                    metadata: welcomeLetterMeta?.companyCopy,
                },
                {
                    label: LABELS.grpMarketing.CMS_CODE,
                    value: welcomeLetter?.cmsCode,
                    fieldKey: "telemedicine.welcomeLetter.cmsCode",
                    metadata: welcomeLetterMeta?.cmsCode,
                },
                {
                    label: LABELS.grpMarketing.WK_CARD_INCLUDES_LOGO,
                    value: welcomeLetter?.wkCardIncludesLogo,
                    fieldKey: "telemedicine.welcomeLetter.wkCardIncludesLogo",
                    metadata: welcomeLetterMeta?.wkCardIncludesLogo,
                    format: "boolean",
                    lastChild: true,
                },
            ],
            col2: [
                {
                    label: LABELS.grpMarketing.MK_WELCOME_MESSAGE,
                    value: welcomeLetter?.mkWelcomeMessage,
                    fieldKey: "telemedicine.welcomeLetter.mkWelcomeMessage",
                    metadata: welcomeLetterMeta?.mkWelcomeMessage,
                },
                {
                    label: LABELS.grpMarketing.MK_ID_CARD_FRONT_1,
                    value: welcomeLetter?.mkIdCardFront1,
                    fieldKey: "telemedicine.welcomeLetter.mkIdCardFront1",
                    metadata: welcomeLetterMeta?.mkIdCardFront1,
                },
                {
                    label: LABELS.grpMarketing.MK_ID_CARD_FRONT_2,
                    value: welcomeLetter?.mkIdCardFront2,
                    fieldKey: "telemedicine.welcomeLetter.mkIdCardFront2",
                    metadata: welcomeLetterMeta?.mkIdCardFront2,
                },
                {
                    label: LABELS.grpMarketing.WK_MAIL_TO,
                    value: welcomeLetter?.wkMailTo,
                    fieldKey: "telemedicine.welcomeLetter.wkMailTo",
                    metadata: welcomeLetterMeta?.wkMailTo,
                },
                {
                    label: LABELS.grpMarketing.WK_MAIL_TO_ADDRESS,
                    value: welcomeLetter?.wkMailToAddress,
                    fieldKey: "telemedicine.welcomeLetter.wkMailToAddress",
                    metadata: welcomeLetterMeta?.wkMailToAddress,
                },
                {
                    label: LABELS.grpMarketing.CONSULT_MESSAGE,
                    value: welcomeLetter?.consultMessage,
                    fieldKey: "telemedicine.welcomeLetter.consultMessage",
                    metadata: welcomeLetterMeta?.consultMessage,
                },
                {
                    label: LABELS.grpMarketing.CONSULT_MESSAGE_ON_WELCOME_LETTER,
                    value: welcomeLetter?.consultMessageOnWelcomeLetter,
                    fieldKey: "telemedicine.welcomeLetter.consultMessageOnWelcomeLetter",
                    metadata: welcomeLetterMeta?.consultMessageOnWelcomeLetter,
                    format: "boolean",
                },
                {
                    label: LABELS.grpMarketing.WELCOME_LETTER_CONSULT_MESSAGE,
                    value: welcomeLetter?.welcomeLetterConsultMessage,
                    fieldKey: "telemedicine.welcomeLetter.welcomeLetterConsultMessage",
                    metadata: welcomeLetterMeta?.welcomeLetterConsultMessage,
                },
                {
                    label: LABELS.grpMarketing.WK_INCLUDES_INSERT,
                    value: welcomeLetter?.wkIncludesInsert,
                    fieldKey: "telemedicine.welcomeLetter.wkIncludesInsert",
                    metadata: welcomeLetterMeta?.wkIncludesInsert,
                    format: "boolean",
                },
                {
                    label: LABELS.grpMarketing.INSERT_DOCUMENT_NAME,
                    value: welcomeLetter?.insertDocumentName,
                    fieldKey: "telemedicine.welcomeLetter.insertDocumentName",
                    metadata: welcomeLetterMeta?.insertDocumentName,
                },
                {
                    label: LABELS.grpMarketing.CLIENT_FORM_NUMBER,
                    value: welcomeLetter?.clientFormNumber,
                    fieldKey: "telemedicine.welcomeLetter.clientFormNumber",
                    metadata: welcomeLetterMeta?.clientFormNumber,
                },
                {
                    label: LABELS.grpMarketing.SEND_GROUP_TO_VENDORS,
                    value: welcomeLetter?.isValidMsuGroup,
                    fieldKey: "telemedicine.welcomeLetter.isValidMsuGroup",
                    metadata: welcomeLetterMeta?.isValidMsuGroup,
                    format: "boolean",
                    tooltipContent: LABELS.grpMarketing.SEND_GROUP_TO_VENDORS_TOOLTIP,
                    lastChild: true,
                },
            ],
        },
        "P360": {
            col1: [
                {
                    label: LABELS.grpMarketing.P360_BRAND_RELATIONSHIP,
                    value: p360?.p360BrandRelationship,
                    fieldKey: "telemedicine.p360.p360BrandRelationship",
                    metadata: p360Meta?.p360BrandRelationship,
                },
                {
                    label: LABELS.grpMarketing.P360_URL,
                    value: p360?.p360URL,
                    fieldKey: "telemedicine.p360.p360URL",
                    metadata: p360Meta?.p360URL,
                    format: "link"
                },
                {
                    label: LABELS.grpMarketing.VIRTUAL_FIRST_PLAN_NAME,
                    value: p360?.virtualFirstPlanName,
                    fieldKey: "telemedicine.p360.virtualFirstPlanName",
                    metadata: p360Meta?.virtualFirstPlanName,
                },
                {
                    label: LABELS.grpMarketing.VIRTUAL_FIRST_HEALTH_PLAN_SUMMARY,
                    value: p360?.virtualFirstHealthPlanSummary,
                    fieldKey: "telemedicine.p360.virtualFirstHealthPlanSummary",
                    metadata: {
                        ...p360Meta?.virtualFirstHealthPlanSummary,
                        responseDataPath: "disclaimers",
                        responseNameField: "name",
                        responseIdField: "id"
                    },
                    lastChild: true,
                },
            ],
            col2: [
                {
                    label: LABELS.grpMarketing.HEALTH_PLAN_BOILER_PLATE_COPY,
                    value: p360?.healthPlanBoilerPlateCopy,
                    fieldKey: "telemedicine.p360.healthPlanBoilerPlateCopy",
                    metadata: {
                        ...p360Meta?.healthPlanBoilerPlateCopy,
                        responseDataPath: "disclaimers",
                        responseNameField: "name",
                        responseIdField: "id"

                    },
                },
                {
                    label: LABELS.grpMarketing.VIRTUAL_FIRST_HEALTH_PLAN,
                    value: p360?.virtualFirstHealthPlan,
                    fieldKey: "telemedicine.p360.virtualFirstHealthPlan",
                    metadata: p360Meta?.virtualFirstHealthPlan,
                    format: "boolean",
                },
                {
                    label: LABELS.grpMarketing.REFERRAL_REQUIRED,
                    value: p360?.referralRequired,
                    fieldKey: "telemedicine.p360.referralRequired",
                    metadata: p360Meta?.referralRequired,
                    format: "boolean",
                    lastChild: true,
                },
            ],
        },
    };
};

export const renderMarketingCcm = (data: Marketing, metadata?: any): SectionData => {
    const groupOverview = data?.ccm?.groupOverview;
    const marketingPreferences = data?.ccm?.marketingPreferences;
    const allowedCommunicationMethods = data?.ccm?.allowedCommunicationMethods;
    const marketingLanguagePreferences = data?.ccm?.marketingLanguagePreferences;

    const groupOverviewMeta = metadata?.ccm?.groupOverview ?? {};
    const marketingPreferencesMeta = metadata?.ccm?.marketingPreferences ?? {};
    const allowedCommunicationMethodsMeta = metadata?.ccm?.allowedCommunicationMethods ?? {};
    const marketingLanguagePreferencesMeta = metadata?.ccm?.marketingLanguagePreferences ?? {};

    return {
        "Group overview": {
            col1: [
                {
                    label: LABELS.grpMarketing.OUTREACH_STRATIFICATION,
                    value: groupOverview?.outreachStratification,
                    fieldKey: "ccm.groupOverview.outreachStratification",
                    metadata: groupOverviewMeta?.outreachStratification,
                    lastChild: true,
                },
            ],
            col2: [
                {
                    label: LABELS.grpMarketing.OUTREACH_STRATIFICATION_DATE,
                    value: groupOverview?.outreachStratificationDate,
                    fieldKey: "ccm.groupOverview.outreachStratificationDate",
                    metadata: groupOverviewMeta?.outreachStratificationDate,
                    format: "date",
                    lastChild: true,
                },
            ],
        },
        "Marketing preferences": {
            col1: [
                {
                    label: LABELS.grpMarketing.CLIENT_ALLOWS_TARGETED_MARKETING,
                    value: marketingPreferences?.clientAllowsTargetedMarketing,
                    fieldKey: "ccm.marketingPreferences.clientAllowsTargetedMarketing",
                    metadata: marketingPreferencesMeta?.clientAllowsTargetedMarketing,
                    format: "boolean",
                },
                {
                    label: LABELS.grpMarketing.CLIENTS_MUST_APPROVE_ASSETS,
                    value: marketingPreferences?.clientsMustApproveAssets,
                    fieldKey: "ccm.marketingPreferences.clientsMustApproveAssets",
                    metadata: marketingPreferencesMeta?.clientsMustApproveAssets,
                    format: "boolean",
                },
                {
                    label: LABELS.grpMarketing.EMPLOYEE_TITLE,
                    value: marketingPreferences?.employeeTitle,
                    fieldKey: "ccm.marketingPreferences.employeeTitle",
                    metadata: marketingPreferencesMeta?.employeeTitle,
                },
                {
                    label: LABELS.grpMarketing.MARKETING_NAME,
                    value: marketingPreferences?.marketingName,
                    fieldKey: "ccm.marketingPreferences.marketingName",
                    metadata: marketingPreferencesMeta?.marketingName,
                },
                {
                    label: LABELS.grpMarketing.CLIENT_SENDS_OWN_MARKETING,
                    value: marketingPreferences?.clientSendsOutTheirOwnMarketing,
                    fieldKey: "ccm.marketingPreferences.clientSendsOutTheirOwnMarketing",
                    metadata: marketingPreferencesMeta?.clientSendsOutTheirOwnMarketing,
                    format: "boolean",
                },
                {
                    label: LABELS.grpMarketing.USE_CONTRACT_PATH_FOR_MARKETING,
                    value: marketingPreferences?.useContractPathForMarketing,
                    fieldKey: "ccm.marketingPreferences.useContractPathForMarketing",
                    metadata: marketingPreferencesMeta?.useContractPathForMarketing,
                    format: "boolean",
                    lastChild: true,
                },
            ],
            col2: [
                {
                    label: LABELS.grpMarketing.HOLD_ALL_MARKETING,
                    value: marketingPreferences?.holdAllMarketing,
                    fieldKey: "ccm.marketingPreferences.holdAllMarketing",
                    metadata: marketingPreferencesMeta?.holdAllMarketing,
                    format: "boolean",
                },
                {
                    label: LABELS.grpMarketing.DATE_MARKETING_PUT_ON_HOLD,
                    value: marketingPreferences?.dateMarketingPutOnHold,
                    fieldKey: "ccm.marketingPreferences.dateMarketingPutOnHold",
                    metadata: marketingPreferencesMeta?.dateMarketingPutOnHold,
                    format: "date",
                },
                {
                    label: LABELS.grpMarketing.READY_FOR_AUTOMATION,
                    value: marketingPreferences?.readyForAutomation,
                    fieldKey: "ccm.marketingPreferences.readyForAutomation",
                    metadata: marketingPreferencesMeta?.readyForAutomation,
                    format: "boolean",
                },
                {
                    label: LABELS.grpMarketing.CAMPAIGN_TYPE,
                    value: marketingPreferences?.campaignType,
                    fieldKey: "ccm.marketingPreferences.campaignType",
                    metadata: marketingPreferencesMeta?.campaignType,
                },
                {
                    label: LABELS.grpMarketing.CAMPAIGN_OPTIONS,
                    value: marketingPreferences?.campaignOptions,
                    fieldKey: "ccm.marketingPreferences.campaignOptions",
                    metadata: marketingPreferencesMeta?.campaignOptions,
                    lastChild: true,
                },
            ],
        },
        "Marketing language preferences": {
            col1: [
                {
                    label: LABELS.grpMarketing.REMOVE_SPANISH,
                    value: marketingLanguagePreferences?.removeSpanish,
                    fieldKey: "ccm.marketingLanguagePreferences.removeSpanish",
                    metadata: marketingLanguagePreferencesMeta?.removeSpanish,
                    format: "boolean",
                },
                {
                    label: LABELS.grpMarketing.AT_NO_COST_TO_YOU_ALT_TEXT,
                    value: marketingLanguagePreferences?.atNoCostToYouAltText,
                    fieldKey: "ccm.marketingLanguagePreferences.atNoCostToYouAltText",
                    metadata: marketingLanguagePreferencesMeta?.atNoCostToYouAltText,
                },
                {
                    label: LABELS.grpMarketing.JOIN_ALT_TEXT,
                    value: marketingLanguagePreferences?.joinAltText,
                    fieldKey: "ccm.marketingLanguagePreferences.joinAltText",
                    metadata: marketingLanguagePreferencesMeta?.joinAltText,
                    format: "boolean",
                },
                {
                    label: LABELS.grpMarketing.GENERAL_ELIGIBILITY_SENTENCE,
                    value: marketingLanguagePreferences?.generalEligibilitySentence,
                    fieldKey: "ccm.marketingLanguagePreferences.generalEligibilitySentence",
                    metadata: marketingLanguagePreferencesMeta?.generalEligibilitySentence,
                },
                {
                    label: LABELS.grpMarketing.GENERAL_SPANISH_ELIGIBILITY_SENTENCE,
                    value: marketingLanguagePreferences?.generalSpanishEligibilitySentence,
                    fieldKey: "ccm.marketingLanguagePreferences.generalSpanishEligibilitySentence",
                    metadata: marketingLanguagePreferencesMeta?.generalSpanishEligibilitySentence,
                },
                {
                    label: LABELS.grpMarketing.PAID_FOR_BY,
                    value: marketingLanguagePreferences?.paidForBy,
                    fieldKey: "ccm.marketingLanguagePreferences.paidForBy",
                    metadata: marketingLanguagePreferencesMeta?.paidForBy,
                },
                {
                    label: LABELS.grpMarketing.LOWERCASE_REGISTRATION_CODE,
                    value: marketingLanguagePreferences?.lowercaseRegistrationCode,
                    fieldKey: "ccm.marketingLanguagePreferences.lowercaseRegistrationCode",
                    metadata: marketingLanguagePreferencesMeta?.lowercaseRegistrationCode,
                    format: "boolean",
                },
                {
                    label: LABELS.grpMarketing.REMOVE_NEW,
                    value: marketingLanguagePreferences?.removeNew,
                    fieldKey: "ccm.marketingLanguagePreferences.removeNew",
                    metadata: marketingLanguagePreferencesMeta?.removeNew,
                    format: "boolean",
                    lastChild: true,
                },
            ],
            col2: [
                {
                    label: LABELS.grpMarketing.HEALTH_BENEFIT_ALT_TEXT,
                    value: marketingLanguagePreferences?.healthBenefitAltText,
                    fieldKey: "ccm.marketingLanguagePreferences.healthBenefitAltText",
                    metadata: marketingLanguagePreferencesMeta?.healthBenefitAltText,
                },
                {
                    label: LABELS.grpMarketing.STRIPS_LANCETS_ALT_TEXT,
                    value: marketingLanguagePreferences?.stripsLancetsAltText,
                    fieldKey: "ccm.marketingLanguagePreferences.stripsLancetsAltText",
                    metadata: marketingLanguagePreferencesMeta?.stripsLancetsAltText,
                },
                {
                    label: LABELS.grpMarketing.GENERAL_DISCLAIMER,
                    value: marketingLanguagePreferences?.generalDisclaimer,
                    fieldKey: "ccm.marketingLanguagePreferences.generalDisclaimer",
                    metadata: marketingLanguagePreferencesMeta?.generalDisclaimer,
                },
                {
                    label: LABELS.grpMarketing.GENERAL_SPANISH_DISCLAIMER,
                    value: marketingLanguagePreferences?.generalSpanishDisclaimer,
                    fieldKey: "ccm.marketingLanguagePreferences.generalSpanishDisclaimer",
                    metadata: marketingLanguagePreferencesMeta?.generalSpanishDisclaimer,
                },
                {
                    label: LABELS.grpMarketing.REMOVE_UNLIMITED,
                    value: marketingLanguagePreferences?.removeUnlimited,
                    fieldKey: "ccm.marketingLanguagePreferences.removeUnlimited",
                    metadata: marketingLanguagePreferencesMeta?.removeUnlimited,
                    format: "boolean",
                },
                {
                    label: LABELS.grpMarketing.NO_OEP_DIRECT_MAIL_INSERTS,
                    value: marketingLanguagePreferences?.noOEPDirectMailInserts,
                    fieldKey: "ccm.marketingLanguagePreferences.noOEPDirectMailInserts",
                    metadata: marketingLanguagePreferencesMeta?.noOEPDirectMailInserts,
                    format: "boolean",
                },
                {
                    label: LABELS.grpMarketing.HOLD_MEMBER_MARKETING,
                    value: marketingLanguagePreferences?.holdMemberMarketing,
                    fieldKey: "ccm.marketingLanguagePreferences.holdMemberMarketing",
                    metadata: marketingLanguagePreferencesMeta?.holdMemberMarketing,
                    format: "boolean",
                },
                {
                    label: LABELS.grpMarketing.MEMBER_COMMS_NEED_CLIENT_APPROVAL,
                    value: marketingLanguagePreferences?.memberCommsNeedClientApproval,
                    fieldKey: "ccm.marketingLanguagePreferences.memberCommsNeedClientApproval",
                    metadata: marketingLanguagePreferencesMeta?.memberCommsNeedClientApproval,
                    format: "boolean",
                    lastChild: true,
                }
            ],
        },
        "Allowed communication methods": {
            col1: [
                {
                    label: LABELS.grpMarketing.CLIENT_ALLOWS_AB_TESTING_OF,
                    value: allowedCommunicationMethods?.clientAllowsABTestingOf,
                    fieldKey: "ccm.allowedCommunicationMethods.clientAllowsABTestingOf",
                    metadata: allowedCommunicationMethodsMeta?.clientAllowsABTestingOf,
                },
                {
                    label: LABELS.grpMarketing.MARKETING_CHANNEL_TYPE,
                    value: allowedCommunicationMethods?.marketingChannelType,
                    fieldKey: "ccm.allowedCommunicationMethods.marketingChannelType",
                    metadata: allowedCommunicationMethodsMeta?.marketingChannelType,
                },
                {
                    label: LABELS.grpMarketing.CAMPAIGN_LIFECYCLE_PARTICIPATION,
                    value: allowedCommunicationMethods?.campaignLifecycleParticipation,
                    fieldKey: "ccm.allowedCommunicationMethods.campaignLifecycleParticipation",
                    metadata: allowedCommunicationMethodsMeta?.campaignLifecycleParticipation,
                },
                {
                    label: LABELS.grpMarketing.UNION_CLIENT,
                    value: allowedCommunicationMethods?.unionClient,
                    fieldKey: "ccm.allowedCommunicationMethods.unionClient",
                    metadata: allowedCommunicationMethodsMeta?.unionClient,
                    format: "boolean",
                },
                {
                    label: LABELS.grpMarketing.U18_MARKETING,
                    value: allowedCommunicationMethods?.u18Marketing,
                    fieldKey: "ccm.allowedCommunicationMethods.u18Marketing",
                    metadata: allowedCommunicationMethodsMeta?.u18Marketing,
                    format: "boolean",
                },
                {
                    label: LABELS.grpMarketing.PHONE_CAMPAIGN,
                    value: allowedCommunicationMethods?.phoneCampaign,
                    fieldKey: "ccm.allowedCommunicationMethods.phoneCampaign",
                    metadata: allowedCommunicationMethodsMeta?.phoneCampaign,
                }
            ],
            col2: [
                {
                    label: LABELS.grpMarketing.MARKETING_INCENTIVE_TYPE,
                    value: allowedCommunicationMethods?.marketingIncentiveType,
                    fieldKey: "ccm.allowedCommunicationMethods.marketingIncentiveType",
                    metadata: allowedCommunicationMethodsMeta?.marketingIncentiveType,
                },
                {
                    label: LABELS.grpMarketing.CCM_INCENTIVES_GIFT_CARDS,
                    value: allowedCommunicationMethods?.ccmIncentivesGiftCards,
                    fieldKey: "ccm.allowedCommunicationMethods.ccmIncentivesGiftCards",
                    metadata: allowedCommunicationMethodsMeta?.ccmIncentivesGiftCards,
                    format: "boolean",
                },
                {
                    label: LABELS.grpMarketing.CCM_INCENTIVES_GIFT_CARDS_DATE,
                    value: allowedCommunicationMethods?.ccmIncentivesGiftCardsDate,
                    fieldKey: "ccm.allowedCommunicationMethods.ccmIncentivesGiftCardsDate",
                    metadata: allowedCommunicationMethodsMeta?.ccmIncentivesGiftCardsDate,
                    format: "date",
                },
                {
                    label: LABELS.grpMarketing.CCM_INCENTIVES_GOODS_SERVICES,
                    value: allowedCommunicationMethods?.ccmIncentivesGoodsServices,
                    fieldKey: "ccm.allowedCommunicationMethods.ccmIncentivesGoodsServices",
                    metadata: allowedCommunicationMethodsMeta?.ccmIncentivesGoodsServices,
                    format: "boolean",
                },
                {
                    label: LABELS.grpMarketing.CCM_INCENTIVES_GOODS_SERVICES_DATE,
                    value: allowedCommunicationMethods?.ccmIncentivesGoodsServicesDate,
                    fieldKey: "ccm.allowedCommunicationMethods.ccmIncentivesGoodsServicesDate",
                    metadata: allowedCommunicationMethodsMeta?.ccmIncentivesGoodsServicesDate,
                    format: "date",
                },
                {
                    label: LABELS.grpMarketing.USE_FOR_ACTIVATION_USAGE,
                    value: allowedCommunicationMethods?.ccmUsageIncentivesGiftCards,
                    fieldKey: "ccm.allowedCommunicationMethods.ccmUsageIncentivesGiftCards",
                    metadata: allowedCommunicationMethodsMeta?.ccmUsageIncentivesGiftCards,
                    format: "boolean",
                },
                {
                    label: LABELS.grpMarketing.TYPE_OF_INCENTIVE_TO_EXCLUDE,
                    value: allowedCommunicationMethods?.typeOfIncentiveToExclude,
                    fieldKey: "ccm.allowedCommunicationMethods.typeOfIncentiveToExclude",
                    metadata: allowedCommunicationMethodsMeta?.typeOfIncentiveToExclude,
                    lastChild: true,
                },
            ],
        }
    }
}
