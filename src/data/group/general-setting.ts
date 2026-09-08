import { LABELS } from "@/constants";
import { ContactRef } from "@/types";
import { GeneralSetting, SectionData } from "@/types/GrpView";
import { getInitials, phoneFormat } from "@/utils";

export const renderGeneralSettingOverviewSec1 = (
  data: GeneralSetting,
  metadata?: any,
  onContactClick?: (contact: ContactRef) => void,
): SectionData => {
  const groupOverview = data?.overview?.groupOverview;
  const brand = data?.overview?.brand;
  const ccmConfig = data?.overview?.ccmConfiguration;

  const groupOverviewMeta = metadata?.overview?.groupOverview;
  const brandMeta = metadata?.overview?.brand;
  const ccmConfigMeta = metadata?.overview?.ccmConfiguration;

  return {
    "Group overview": {
      col1: [
        {
          label: LABELS.grpGeneralSetting.LABEL_GROUP_NAME,
          value: groupOverview?.groupName,
          fieldKey: "overview.groupOverview.groupName",
          metadata: groupOverviewMeta?.groupName,
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_CLIENT_ACCOUNT_LCRM_TELADOC,
          value: groupOverview?.clientAccountTeladoc,
          fieldKey: "overview.groupOverview.clientAccountTeladoc",
          metadata: {
            ...groupOverviewMeta?.clientAccountTeladoc,
            responseDataPath: "results",
            responseNameField: "account_name",
            responseIdField: "account_name",
          },
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_CLIENT_ACCOUNT_LCRM_LIVONGO,
          value: groupOverview?.clientAccountLivongo,
          fieldKey: "overview.groupOverview.clientAccountLivongo",
          metadata: {
            ...groupOverviewMeta?.clientAccountLivongo,
            responseDataPath: "results",
            responseNameField: "account_name",
            responseIdField: "account_name",
          },
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_ACCOUNT,
          value: groupOverview?.account,
          fieldKey: "overview.groupOverview.account",
          metadata: groupOverviewMeta?.account,
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_LEGACY_GROUP_ID,
          value: groupOverview?.legacyGroupId,
          fieldKey: "overview.groupOverview.legacyGroupId",
          metadata: groupOverviewMeta?.legacyGroupId,
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_GROUP_ID,
          value: groupOverview?.groupId,
          fieldKey: "overview.groupOverview.groupId",
          metadata: groupOverviewMeta?.groupId,
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_REVENUE_BUCKET,
          value: groupOverview?.revenueBucket,
          fieldKey: "overview.groupOverview.revenueBucket",
          metadata: groupOverviewMeta?.revenueBucket,
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_LINE_OF_BUSINESS,
          value: groupOverview?.lineOfBusiness,
          fieldKey: "overview.groupOverview.lineOfBusiness",
          metadata: groupOverviewMeta?.lineOfBusiness,
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_NAMESPACE,
          value: groupOverview?.namespace,
          fieldKey: "overview.groupOverview.namespace",
          metadata: groupOverviewMeta?.namespace,
          lastChild: true,
        },
      ],
      col2: [
        {
          label: LABELS.grpGeneralSetting.LABEL_CLIENT_MANAGER,
          value: groupOverview?.clientManager,
          fieldKey: "overview.groupOverview.clientManager",
          metadata: groupOverviewMeta?.clientManager,
          format: "person",
          personMeta: {
            name: groupOverview?.clientManager?.displayName ?? "",
            initials: getInitials(
              groupOverview?.clientManager?.displayName ?? "",
            ),
          },
          onPersonClick:
            groupOverview?.clientManager?.contactId && onContactClick
              ? () => onContactClick(groupOverview!.clientManager)
              : undefined,
        },
        {
          label: LABELS.generalSetting.CLIENT_IMPLEMENTATION_MANAGER,
          value: groupOverview?.clientImplementationManager,
          fieldKey: "overview.groupOverview.clientImplementationManager",
          metadata: groupOverviewMeta?.clientImplementationManager,
          format: "person",
          personMeta: {
            name: groupOverview?.clientImplementationManager?.displayName ?? "",
            initials: getInitials(
              groupOverview?.clientImplementationManager?.displayName ?? "",
            ),
          },
          onPersonClick:
            groupOverview?.clientImplementationManager?.contactId &&
            onContactClick
              ? () => onContactClick(groupOverview!.clientImplementationManager)
              : undefined,
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_STATUS,
          value: groupOverview?.status,
          fieldKey: "overview.groupOverview.status",
          metadata: groupOverviewMeta?.status,
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_EFFECTIVE_START_DATE,
          value: groupOverview?.effectiveStartDate,
          fieldKey: "overview.groupOverview.effectiveStartDate",
          metadata: groupOverviewMeta?.effectiveStartDate,
          format: "date",
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_EFFECTIVE_END_DATE,
          value: groupOverview?.effectiveEndDate,
          fieldKey: "overview.groupOverview.effectiveEndDate",
          metadata: groupOverviewMeta?.effectiveEndDate,
          format: "date",
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_TERMINATION_DATE,
          value: groupOverview?.terminationDate,
          fieldKey: "overview.groupOverview.terminationDate",
          metadata: groupOverviewMeta?.terminationDate,
          format: "date",
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_CLIENT_OVERVIEW_NAME,
          value: groupOverview?.clientOverviewName,
          fieldKey: "overview.groupOverview.clientOverviewName",
          metadata: groupOverviewMeta?.clientOverviewName,
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_CLIENT_OVERVIEW_STATUS,
          value: groupOverview?.clientOverviewStatus,
          fieldKey: "overview.groupOverview.clientOverviewStatus",
          metadata: groupOverviewMeta?.clientOverviewStatus,
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_CONTRACT_PATH,
          value: groupOverview?.contractpath,
          fieldKey: "overview.groupOverview.contractpath",
          metadata: groupOverviewMeta?.contractpath,
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_DOMESTIC_COUNTRY,
          value: groupOverview?.domesticCountry,
          fieldKey: "overview.groupOverview.domesticCountry",
          metadata: groupOverviewMeta?.domesticCountry,
          lastChild: true,
        },
      ],
    },
    Brand: {
      col1: [
        {
          label: LABELS.grpGeneralSetting.LABEL_ONEAPP_ACCESS,
          value: brand?.oneAppAccess,
          fieldKey: "overview.brand.oneAppAccess",
          metadata: brandMeta?.oneAppAccess,
          format: "boolean",
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_HEALTH_ASSISTANT,
          value: brand?.healthAssistant,
          fieldKey: "overview.brand.healthAssistant",
          metadata: brandMeta?.healthAssistant,
          format: "boolean",
          lastChild: true,
        },
      ],
      col2: [
        {
          label: LABELS.grpGeneralSetting.LABEL_ONEAPP_START_DATE,
          value: brand?.oneAppStartDate,
          fieldKey: "overview.brand.oneAppStartDate",
          metadata: brandMeta?.oneAppStartDate,
          format: "date",
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_MIGRATION_GROUP_NUMBER,
          value: brand?.migrationGroupNumber,
          fieldKey: "overview.brand.migrationGroupNumber",
          metadata: brandMeta?.migrationGroupNumber,
          lastChild: true,
        },
      ],
    },
    "CCM configuration": {
      col1: [
        {
          label: LABELS.grpGeneralSetting.LABEL_LIVONGO_REGISTRATION_CODE,
          value: ccmConfig?.livongoRegistrationCode,
          fieldKey: "overview.ccmConfiguration.livongoRegistrationCode",
          metadata: ccmConfigMeta?.livongoRegistrationCode,
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_LIVONGO_CLIENT_MEMBER_CODE,
          value: ccmConfig?.livongoClientMemberCode,
          fieldKey: "overview.ccmConfiguration.livongoClientMemberCode",
          metadata: ccmConfigMeta?.livongoClientMemberCode,
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_ENABLE_CHRONIC_CARE_REFERRAL,
          value: ccmConfig?.enableChronicCareReferrals,
          fieldKey: "overview.ccmConfiguration.enableChronicCareReferrals",
          metadata: ccmConfigMeta?.enableChronicCareReferrals,
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_ENABLE_CORE_ADMIN_IMPORT,
          value: ccmConfig?.enableCoreAdminImport,
          fieldKey: "overview.ccmConfiguration.enableCoreAdminImport",
          metadata: ccmConfigMeta?.enableCoreAdminImport,
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_REGISTRATION_NAME,
          value: ccmConfig?.registrationName,
          fieldKey: "overview.ccmConfiguration.registrationName",
          metadata: ccmConfigMeta?.registrationName,
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_CCM_REGISTRATION_ADDRESS_TYPE,
          value: ccmConfig?.ccmRegistrationAddressType,
          fieldKey: "overview.ccmConfiguration.ccmRegistrationAddressType",
          metadata: ccmConfigMeta?.ccmRegistrationAddressType,
          lastChild: true,
        },
      ],
      col2: [
        {
          label: LABELS.eligibilityClaims.REGISTRATION_FLOW_SCENARIOS,
          value: ccmConfig?.registrationFlowScenarios,
          fieldKey: "overview.ccmConfiguration.registrationFlowScenarios",
          metadata: ccmConfigMeta?.registrationFlowScenarios,
        },
        {
          label: LABELS.eligibilityClaims.REGISTRATION_CUSTOMIZATIONS,
          value: ccmConfig?.registrationCustomizations,
          fieldKey: "overview.ccmConfiguration.registrationCustomizations",
          metadata: ccmConfigMeta?.registrationCustomizations,
        },

        {
          label: LABELS.grpGeneralSetting.LABEL_CHRONIC_CARE_POPULATION_TYPE,
          value: ccmConfig?.chronicCarePopulationType,
          fieldKey: "overview.ccmConfiguration.chronicCarePopulationType",
          metadata: ccmConfigMeta?.chronicCarePopulationType,
        },
        {
          label:
            LABELS.grpGeneralSetting.LABEL_CHRONIC_CARE_POPULATION_COVERAGE,
          value: ccmConfig?.chronicCarePopulationCoverage,
          fieldKey: "overview.ccmConfiguration.chronicCarePopulationCoverage",
          metadata: ccmConfigMeta?.chronicCarePopulationCoverage,
        },

        {
          label: LABELS.grpGeneralSetting.LABELS_MYSTRENGTH_GLOBAL_ACCESS_CD,
          value: ccmConfig?.myStrengthGlobalAccessCd,
          fieldKey: "overview.ccmConfiguration.myStrengthGlobalAccessCd",
          metadata: ccmConfigMeta?.myStrengthGlobalAccessCd,
        },
        {
          label:
            LABELS.grpGeneralSetting
              .LABEL_WELCOME_KITS_SHIPPED_BY_UPS_NOT_FEDEX,
          value: ccmConfig?.welcomeKitsShippedByUpsNotFedex,
          fieldKey: "overview.ccmConfiguration.welcomeKitsShippedByUpsNotFedex",
          metadata: ccmConfigMeta?.welcomeKitsShippedByUpsNotFedex,
          lastChild: true,
        },
      ],
    },
  };
};

export const renderGeneralSettingOverviewSec2 = (
  data: GeneralSetting,
  metadata?: any,
): SectionData => {
  const generalSettingsAdditionalDetails = data?.overview?.additionalDetails;
  const groupOverview = data?.overview?.groupOverview;
  const additionalDetailsMeta = metadata?.overview?.additionalDetails;
  const groupOverviewMeta = metadata?.overview?.groupOverview;

  return {
    "Additional details": {
      col1: [
        {
          label: LABELS.grpGeneralSetting.LABEL_BENEFIT_RESTRICTION_CODE,
          value: generalSettingsAdditionalDetails?.benefitRestrictionCode,
          fieldKey: "overview.additionalDetails.benefitRestrictionCode",
          metadata: additionalDetailsMeta?.benefitRestrictionCode,
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_REGISTRATION_GROUP_CODE,
          value: generalSettingsAdditionalDetails?.registrationGroupCode,
          fieldKey: "overview.additionalDetails.registrationGroupCode",
          metadata: additionalDetailsMeta?.registrationGroupCode,
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_GROUP_TYPE,
          value: generalSettingsAdditionalDetails?.groupType,
          fieldKey: "overview.additionalDetails.groupType",
          metadata: additionalDetailsMeta?.groupType,
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_BRAND_CODE,
          value: generalSettingsAdditionalDetails?.brandCode,
          fieldKey: "overview.additionalDetails.brandCode",
          metadata: additionalDetailsMeta?.brandCode,
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_STATE,
          value: generalSettingsAdditionalDetails?.state,
          fieldKey: "overview.additionalDetails.state",
          metadata: additionalDetailsMeta?.state,
          lastChild: true,
        },
      ],
      col2: [
        {
          label: LABELS.grpGeneralSetting.LABEL_SOLD_TO_ACCOUNT_NAME,
          value: generalSettingsAdditionalDetails?.soldToAccountName,
          fieldKey: "overview.additionalDetails.soldToAccountName",
          metadata: additionalDetailsMeta?.soldToAccountName,
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_SOLD_TO_ACCOUNT_UUID,
          value: groupOverview?.soldToAccountUUID,
          fieldKey: "overview.groupOverview.soldToAccountUUID",
          metadata: groupOverviewMeta?.soldToAccountUUID,
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_CCM_EXTERNAL_TAGS,
          value: generalSettingsAdditionalDetails?.ccmExternalTags,
          fieldKey: "overview.additionalDetails.ccmExternalTags",
          metadata: additionalDetailsMeta?.ccmExternalTags,
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_NOTES_INTERNAL,
          value: generalSettingsAdditionalDetails?.notesInternal,
          fieldKey: "overview.additionalDetails.notesInternal",
          metadata: additionalDetailsMeta?.notesInternal,
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_NOTES_EXTERNAL,
          value: generalSettingsAdditionalDetails?.notesExternal,
          fieldKey: "overview.additionalDetails.notesExternal",
          metadata: additionalDetailsMeta?.notesExternal,
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_ANY_SPECIAL_INSTRUCTION,
          value: generalSettingsAdditionalDetails?.specialInstructions,
          fieldKey: "overview.additionalDetails.specialInstructions",
          metadata: additionalDetailsMeta?.specialInstructions,
          lastChild: true,
        },
      ],
    },
  };
};

export const renderGroupPermissions = (
  data: GeneralSetting,
  metadata?: any,
): SectionData => {
  const generalGroupPermissions =
    data?.groupPermissions?.generalGroupPermissions;
  const memberAccessPermissions =
    data?.groupPermissions?.memberAccessPermissions;
  const memberVisitPermissions = data?.groupPermissions?.memberVisitPermissions;
  const memberRegistrationPermissions =
    data?.groupPermissions?.memberRegistrationPermissions;
  const performanceGuarantees =
    data?.groupPermissions?.performanceGuaranteesAndServiceLevels;

  const generalGroupPermissionsMeta =
    metadata?.groupPermissions?.generalGroupPermissions;
  const memberAccessPermissionsMeta =
    metadata?.groupPermissions?.memberAccessPermissions;
  const memberVisitPermissionsMeta =
    metadata?.groupPermissions?.memberVisitPermissions;
  const memberRegistrationPermissionsMeta =
    metadata?.groupPermissions?.memberRegistrationPermissions;
  const performanceGuaranteesMeta =
    metadata?.groupPermissions?.performanceGuaranteesAndServiceLevels;

  return {
    "General group permissions": {
      col1: [
        {
          label: LABELS.grpGeneralSetting.LABEL_SEND_MEMBER_RESOLUTION_LETTER,
          value: generalGroupPermissions?.sendMemberResolutionLetter,
          fieldKey:
            "groupPermissions.generalGroupPermissions.sendMemberResolutionLetter",
          metadata: generalGroupPermissionsMeta?.sendMemberResolutionLetter,
          format: "boolean",
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_SEND_UTILIZATION_LETTER,
          value: generalGroupPermissions?.sendUtilizationLetter,
          fieldKey:
            "groupPermissions.generalGroupPermissions.sendUtilizationLetter",
          metadata: generalGroupPermissionsMeta?.sendUtilizationLetter,
          format: "boolean",
        },
        {
          label:
            LABELS.grpGeneralSetting
              .LABEL_SEND_FRAUD_WASTE_AND_ABUSE_TERM_LETTER,
          value: generalGroupPermissions?.sendFraudWasteAndAbuseTermLetter,
          fieldKey:
            "groupPermissions.generalGroupPermissions.sendFraudWasteAndAbuseTermLetter",
          metadata:
            generalGroupPermissionsMeta?.sendFraudWasteAndAbuseTermLetter,
          format: "boolean",
          lastChild: true,
        },
      ],
      col2: [
        {
          label: LABELS.grpGeneralSetting.LABEL_SEND_PROBLEM_MEMBER_LETTER,
          value: generalGroupPermissions?.sendProblemMemberLetter,
          fieldKey:
            "groupPermissions.generalGroupPermissions.sendProblemMemberLetter",
          metadata: generalGroupPermissionsMeta?.sendProblemMemberLetter,
          format: "boolean",
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_HHS_ACCESS,
          value: generalGroupPermissions?.hhsAccess,
          fieldKey: "groupPermissions.generalGroupPermissions.hhsAccess",
          metadata: generalGroupPermissionsMeta?.hhsAccess,
          format: "boolean",
        },
        {
          label:
            LABELS.grpGeneralSetting.LABEL_ENABLE_HEALTH_DATA_VISUALIZATION,
          value: generalGroupPermissions?.enableHealthDataVisualization,
          fieldKey:
            "groupPermissions.generalGroupPermissions.enableHealthDataVisualization",
          metadata: generalGroupPermissionsMeta?.enableHealthDataVisualization,
          format: "boolean",
          lastChild: true,
        },
      ],
    },
    "Member access permissions": {
      col1: [
        {
          label: LABELS.grpGeneralSetting.LABEL_ALLOWED_NO_USERNAME_PASSWORD,
          value: memberAccessPermissions?.allowedNoUsernamePassword,
          fieldKey:
            "groupPermissions.memberAccessPermissions.allowedNoUsernamePassword",
          metadata: memberAccessPermissionsMeta?.allowedNoUsernamePassword,
          format: "boolean",
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_DUAL_ACCESS,
          value: memberAccessPermissions?.dualAccess,
          fieldKey: "groupPermissions.memberAccessPermissions.dualAccess",
          metadata: memberAccessPermissionsMeta?.dualAccess,
          format: "boolean",
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_WEB_ACCESS,
          value: memberAccessPermissions?.webAccess,
          fieldKey: "groupPermissions.memberAccessPermissions.webAccess",
          metadata: memberAccessPermissionsMeta?.webAccess,
          format: "boolean",
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_MOBILE_ACCESS,
          value: memberAccessPermissions?.mobileAccess,
          fieldKey: "groupPermissions.memberAccessPermissions.mobileAccess",
          metadata: memberAccessPermissionsMeta?.mobileAccess,
          format: "boolean",
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_ALLOW_CONVERSION_TO_RETAIL,
          value: memberAccessPermissions?.allowConversionToRetail,
          fieldKey:
            "groupPermissions.memberAccessPermissions.allowConversionToRetail",
          metadata: memberAccessPermissionsMeta?.allowConversionToRetail,
          format: "boolean",
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_VIP_MEMBERS,
          value: memberAccessPermissions?.vipMember,
          fieldKey: "groupPermissions.memberAccessPermissions.vipMember",
          metadata: memberAccessPermissionsMeta?.vipMember,
          format: "boolean",
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_ENABLE_GEO_FENCING,
          value: memberAccessPermissions?.enableGeoFencing,
          fieldKey: "groupPermissions.memberAccessPermissions.enableGeoFencing",
          metadata: memberAccessPermissionsMeta?.enableGeoFencing,
          format: "boolean",
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_RESTRICTED_PHI_ACCESS,
          value: memberAccessPermissions?.restrictedPhiAccess,
          fieldKey:
            "groupPermissions.memberAccessPermissions.restrictedPhiAccess",
          metadata: memberAccessPermissionsMeta?.restrictedPhiAccess,
          format: "boolean",
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_CCM_MULTIFACTOR_AUTHENTICATION,
          value: memberAccessPermissions?.ccmMultifactorAuthentication,
          fieldKey:
            "groupPermissions.memberAccessPermissions.ccmMultifactorAuthentication",
          metadata: memberAccessPermissionsMeta?.ccmMultifactorAuthentication,
        },
        {
          label: LABELS.grpGeneralSetting.LABELS_MYSTRENGTH_GLOBAL_ACCESS_CD,
          value: memberAccessPermissions?.myStrengthGlobalAccessCd,
          fieldKey:
            "groupPermissions.memberAccessPermissions.myStrengthGlobalAccessCd",
          metadata: memberAccessPermissionsMeta?.myStrengthGlobalAccessCd,
          lastChild: true,
        },
      ],
      col2: [
        {
          label:
            LABELS.grpGeneralSetting.LABEL_ALLOW_REGISTRATIONS_VIA_CALL_CENTER,
          value: memberAccessPermissions?.allowRegistrationsViaCallCenter,
          fieldKey:
            "groupPermissions.memberAccessPermissions.allowRegistrationsViaCallCenter",
          metadata:
            memberAccessPermissionsMeta?.allowRegistrationsViaCallCenter,
          format: "boolean",
        },
        {
          label:
            LABELS.grpGeneralSetting
              .LABEL_ALLOW_CONSULTATION_REQUESTS_VIA_CALL_CENTER,
          value:
            memberAccessPermissions?.allowConsultationRequestsViaCallCenter,
          fieldKey:
            "groupPermissions.memberAccessPermissions.allowConsultationRequestsViaCallCenter",
          metadata:
            memberAccessPermissionsMeta?.allowConsultationRequestsViaCallCenter,
          format: "boolean",
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_SEND_PROMO_CODE,
          value: memberAccessPermissions?.sendPromoCode,
          fieldKey: "groupPermissions.memberAccessPermissions.sendPromoCode",
          metadata: memberAccessPermissionsMeta?.sendPromoCode,
        },
        {
          label:
            LABELS.grpGeneralSetting.LABEL_REQUIRE_SECURITY_QUESTIONS_COUNT,
          value: memberAccessPermissions?.requireSecurityQuestionsCount,
          fieldKey:
            "groupPermissions.memberAccessPermissions.requireSecurityQuestionsCount",
          metadata: memberAccessPermissionsMeta?.requireSecurityQuestionsCount,
        },
        {
          label:
            LABELS.grpGeneralSetting.LABEL_ENABLE_RESTRICTED_MEMBER_DOWNLOADS,
          value: memberAccessPermissions?.enableRestrictedMemberDownloads,
          fieldKey:
            "groupPermissions.memberAccessPermissions.enableRestrictedMemberDownloads",
          metadata:
            memberAccessPermissionsMeta?.enableRestrictedMemberDownloads,
          format: "boolean",
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_LINK_EXPIRATION_TIME_HOURS,
          value: memberAccessPermissions?.linkExpirationTimeHours,
          fieldKey:
            "groupPermissions.memberAccessPermissions.linkExpirationTimeHours",
          metadata: memberAccessPermissionsMeta?.linkExpirationTimeHours,
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_DATE_OF_BIRTH_CAN_BE_NULL,
          value: memberAccessPermissions?.dateOfBirthCanBeNull,
          fieldKey:
            "groupPermissions.memberAccessPermissions.dateOfBirthCanBeNull",
          metadata: memberAccessPermissionsMeta?.dateOfBirthCanBeNull,
          format: "boolean",
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_ENABLE_WELLNESS_CONTENT,
          value: memberAccessPermissions?.enableWellnessContent,
          fieldKey:
            "groupPermissions.memberAccessPermissions.enableWellnessContent",
          metadata: memberAccessPermissionsMeta?.enableWellnessContent,
          format: "boolean",
        },
        {
          label:
            LABELS.grpGeneralSetting
              .LABEL_HIDE_SEXUAL_ORIENTATION_GENDER_IDENTITY_QUESTIONS,
          value:
            memberAccessPermissions?.hideSexualOrientationGenderIdentityQuestions,
          fieldKey:
            "groupPermissions.memberAccessPermissions.hideSexualOrientationGenderIdentityQuestions",
          metadata:
            memberAccessPermissionsMeta?.hideSexualOrientationGenderIdentityQuestions,
          format: "boolean",
          lastChild: true,
        },
      ],
    },
    "Member visit permissions": {
      col1: [
        {
          label: LABELS.grpGeneralSetting.LABEL_SEND_CCR_TO_PCP,
          value: memberVisitPermissions?.sendCcrToPcp,
          fieldKey: "groupPermissions.memberVisitPermissions.sendCcrToPcp",
          metadata: memberVisitPermissionsMeta?.sendCcrToPcp,
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_DISABLE_PATIENT_EXCUSE_NOTE,
          value: memberVisitPermissions?.disablePatientExcuseNote,
          fieldKey:
            "groupPermissions.memberVisitPermissions.disablePatientExcuseNote",
          metadata: memberVisitPermissionsMeta?.disablePatientExcuseNote,
          format: "boolean",
          lastChild: true,
        },
      ],
      col2: [
        {
          label: LABELS.grpGeneralSetting.LABEL_IN_HOME_RX_DELIVERY,
          value: memberVisitPermissions?.inHomeRxDelivery,
          fieldKey: "groupPermissions.memberVisitPermissions.inHomeRxDelivery",
          metadata: memberVisitPermissionsMeta?.inHomeRxDelivery,
          format: "boolean",
          lastChild: true,
        },
      ],
    },
    "Member registration permissions": {
      col1: [
        {
          label: LABELS.grpGeneralSetting.LABEL_TWO_STEP_AUTHENTICATION,
          value: memberRegistrationPermissions?.twoStepAuthentication,
          fieldKey:
            "groupPermissions.memberRegistrationPermissions.twoStepAuthentication",
          metadata: memberRegistrationPermissionsMeta?.twoStepAuthentication,
          format: "boolean",
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_TWO_STEP_MAIL,
          value: memberRegistrationPermissions?.twoStepMail,
          fieldKey:
            "groupPermissions.memberRegistrationPermissions.twoStepMail",
          metadata: memberRegistrationPermissionsMeta?.twoStepMail,
          format: "boolean",
          lastChild: true,
        },
      ],
      col2: [
        {
          label: LABELS.grpGeneralSetting.LABEL_TWO_STEP_SMS,
          value: memberRegistrationPermissions?.twoStepSms,
          fieldKey: "groupPermissions.memberRegistrationPermissions.twoStepSms",
          metadata: memberRegistrationPermissionsMeta?.twoStepSms,
          format: "boolean",
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_TWO_PHONE_CALL,
          value: memberRegistrationPermissions?.twoPhoneCall,
          fieldKey:
            "groupPermissions.memberRegistrationPermissions.twoPhoneCall",
          metadata: memberRegistrationPermissionsMeta?.twoPhoneCall,
          format: "boolean",
          lastChild: true,
        },
      ],
    },
    "Performance guarantees and service levels": {
      col1: [
        {
          label: LABELS.grpGeneralSetting.LABEL_STANDARD_SERVICE_LEVEL,
          value: performanceGuarantees?.standardServiceLevel,
          fieldKey:
            "groupPermissions.performanceGuaranteesAndServiceLevels.standardServiceLevel",
          metadata: performanceGuaranteesMeta?.standardServiceLevel,
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_VIP_SERVICE_LEVEL,
          value: performanceGuarantees?.vipServiceLevel,
          fieldKey:
            "groupPermissions.performanceGuaranteesAndServiceLevels.vipServiceLevel",
          metadata: performanceGuaranteesMeta?.vipServiceLevel,
          lastChild: true,
        },
      ],
      col2: [
        {
          label: LABELS.grpGeneralSetting.LABEL_SLA_WAIVE_VISIT_FEE_IF_MISSED,
          value: performanceGuarantees?.slawWaiveVisitFeeIfMissed,
          fieldKey:
            "groupPermissions.performanceGuaranteesAndServiceLevels.slawWaiveVisitFeeIfMissed",
          metadata: performanceGuaranteesMeta?.slawWaiveVisitFeeIfMissed,
          format: "boolean",
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_PERFORMANCE_GUARANTEE,
          value: performanceGuarantees?.performanceGuarantee,
          fieldKey:
            "groupPermissions.performanceGuaranteesAndServiceLevels.performanceGuarantee",
          metadata: performanceGuaranteesMeta?.performanceGuarantee,
          format: "boolean",
          lastChild: true,
        },
      ],
    },
  };
};

export const renderGroupRelationships = (
  data: GeneralSetting,
  metadata?: any,
): SectionData => {
  const groupRelationshipsArray = data?.groupRelationShips || [];
  const groupRelationshipsMeta = metadata?.groupRelationShips || [];
  const result: SectionData = {};

  groupRelationshipsArray.forEach((groupRelationship, index) => {
    const cardTitle = `Group relationship ${index + 1}`;
    const groupRelationshipMeta = groupRelationshipsMeta?.[index] ?? {};
    result[cardTitle] = {
      col1: [
        {
          label: LABELS.generalSetting.HAS_BROKER,
          value: groupRelationship?.hasBroker,
          fieldKey: `groupRelationShips.${index}.hasBroker`,
          metadata: groupRelationshipMeta?.hasBroker,
          format: "boolean",
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_ROLE_TYPE,
          value: groupRelationship?.roleType,
          fieldKey: `groupRelationShips.${index}.roleType`,
          metadata: groupRelationshipMeta?.roleType,
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_MEMBER_GROUP_NAME,
          value: groupRelationship?.memberGroupName,
          fieldKey: `groupRelationShips.${index}.memberGroupName`,
          metadata: groupRelationshipMeta?.memberGroupName,
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_SOURCE_ACCOUNT,
          value: groupRelationship?.sourceAccount,
          fieldKey: `groupRelationShips.${index}.sourceAccount`,
          metadata: {
            ...groupRelationshipMeta?.sourceAccount,
            responseDataPath: "results",
            responseNameField: "account_name",
            responseIdField: "account_name",
            linkedFieldKey: `groupRelationShips.${index}.sourceAccountId`,
            linkedFieldValueField: "legacy_account_id",
          },
          lastChild: true,
        },
      ],
      col2: [
        {
          label: LABELS.grpGeneralSetting.LABEL_MEMBER_GROUP,
          value: groupRelationship?.memberGroup,
          fieldKey: `groupRelationShips.${index}.memberGroup`,
          metadata: groupRelationshipMeta?.memberGroup,
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_MEMBER_GROUP_STATUS,
          value: groupRelationship?.memberGroupStatus,
          fieldKey: `groupRelationShips.${index}.memberGroupStatus`,
          metadata: groupRelationshipMeta?.memberGroupStatus,
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_DUPLICATE_KEY,
          value: groupRelationship?.duplicateKey,
          fieldKey: `groupRelationShips.${index}.duplicateKey`,
          metadata: groupRelationshipMeta?.duplicateKey,
          lastChild: true,
        },
      ],
    };
  });

  return result;
};

export const renderClinicalAndMemberSupport = (
  data: GeneralSetting,
  metadata?: any,
): SectionData => {
  const clinicalDetails = data?.clinicalAndMemberSupport?.ccmClinicalDetails;
  const memberSupportDetails =
    data?.clinicalAndMemberSupport?.ccmMemberSupportDetails;

  const clinicalDetailsMeta =
    metadata?.clinicalAndMemberSupport?.ccmClinicalDetails;
  const memberSupportDetailsMeta =
    metadata?.clinicalAndMemberSupport?.ccmMemberSupportDetails;

  return {
    "CCM clinical details": {
      col1: [
        {
          label: LABELS.grpGeneralSetting.LABEL_CLINICAL_MODEL,
          value: clinicalDetails?.clinicalModel,
          fieldKey: "clinicalAndMemberSupport.ccmClinicalDetails.clinicalModel",
          metadata: clinicalDetailsMeta?.clinicalModel,
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_CLINICAL_DATA_SHARING_ACCESS,
          value: clinicalDetails?.clinicalDataSharingAccess,
          fieldKey:
            "clinicalAndMemberSupport.ccmClinicalDetails.clinicalDataSharingAccess",
          metadata: clinicalDetailsMeta?.clinicalDataSharingAccess,
          lastChild: true,
        },
      ],
      col2: [
        {
          label: LABELS.grpGeneralSetting.LABEL_CLINICAL_REFERRALS,
          value: clinicalDetails?.clinicalReferrals,
          fieldKey:
            "clinicalAndMemberSupport.ccmClinicalDetails.clinicalReferrals",
          metadata: clinicalDetailsMeta?.clinicalReferrals,
        },
        {
          label: LABELS.grpGeneralSetting.LABEL_CLINICAL_MODEL_DETAILS,
          value: clinicalDetails?.clinicalModelDetails,
          fieldKey:
            "clinicalAndMemberSupport.ccmClinicalDetails.clinicalModelDetails",
          metadata: clinicalDetailsMeta?.clinicalModelDetails,
          lastChild: true,
        },
      ],
    },
    "CCM member support details": {
      col1: [
        {
          label: LABELS.grpGeneralSetting.LABEL_MEMBER_SUPPORT_URL,
          value: memberSupportDetails?.memberSupportURL,
          fieldKey:
            "clinicalAndMemberSupport.ccmMemberSupportDetails.memberSupportURL",
          metadata: memberSupportDetailsMeta?.memberSupportURL,
          format: "html",
          lastChild: true,
        },
      ],
      col2: [
        {
          label: LABELS.grpGeneralSetting.LABEL_MEMBER_SUPPORT_PHONE,
          value: phoneFormat(memberSupportDetails?.memberSupportPhone),
          fieldKey:
            "clinicalAndMemberSupport.ccmMemberSupportDetails.memberSupportPhone",
          metadata: memberSupportDetailsMeta?.memberSupportPhone,
          lastChild: true,
        },
      ],
    },
  };
};
