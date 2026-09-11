import type { ProgramOverviewSummary } from "./programOverviewData";

export interface ClientOverviewTemplateForm {
  templateName: string;
  accountName: string;
  organization: string;
  contractPath: string;
  revenueBucket: string;
  clientSuccessManager: string;
  clientImplementationManager: string;
  registrationCustomizations: string;
  chronicCarePopulationType: string;
  chronicCarePopulationCoverage: string;
  ccmRegistrationAddressType: string;
  ccmRegistrationFlowScenarios: string;
  // `null` is an unanswered radio, which a brand new template starts with.
  cardioFeatureEnabled: boolean | null;
  cardioStartDate: string;
  welcomeKitsShippedByUps: boolean | null;
  hasBroker: boolean | null;
  ccmMultifactorAuthentication: string;
  hideSexualOrientationQuestions: boolean | null;
  clinicalModel: string;
  clinicalDataSharingAndAccess: string;
  clinicalReferrals: string;
  clinicalModelDetails: string;
  memberSupportPhone: string;
  memberSupportUrl: string;
  billingPartner: string;
  billingMethod: string;
  detailedInvoice: boolean | null;
  billingPointOfContact: string;
  hipaaCoveredEntity: string;
  detailedInvoiceRecipients: string;
  paymentTerms: string;
  pricingModel: string;
  detailedInvoiceTags: string;
  bundledPricingDiscount: string;
  proratedEnrollment: boolean | null;
  fastStartCreditOffered: boolean | null;
  fastStartCreditType: string;
  fastStartParticipationRate: string;
  fastStartLaunchDate: string;
  fastStartCloseDate: string;
  fastStartCustom: string;
  billingAddressCcm: string;
  contractType: string;
  legalName: string;
  contractEffectiveDate: string;
  contractTerminationDate: string;
  baaSigned: boolean | null;
  uniqueContractTerms: string;
  marketingAndDopsRequirement: boolean | null;
  slaDetails: string;
  daysNoticeForTermination: string;
  terminationForConvenience: boolean | null;
  daysNoticeForConvenienceTerm: string;
  billEarlyTerminationThroughClaims: boolean | null;
  customerSignedDate: string;
  companySignedDate: string;
  accountHasSla: boolean | null;
  lapsedClauseClaimsData: boolean | null;
  lapsedClauseOptimizedEnrollmentPlan: boolean | null;
  isThereALapsedUserClause: boolean | null;
  lapsedClauseMultiChannelMarketing: boolean | null;
  lapsedClauseUseOfIncentives: boolean | null;
  clientAllowsTargetedMarketing: boolean | null;
  clientsMustApproveAssets: boolean | null;
  employeeTitle: string;
  marketingName: string;
  clientSendsOwnMarketing: boolean | null;
  removeSpanish: boolean | null;
  atNoCostToYouAltText: string;
  joinAltText: string;
  generalEligibilitySentence: string;
  generalSpanishEligibilitySentence: string;
  paidForBy: string;
  noOepDirectMailInserts: boolean | null;
  useForActivationUsage: boolean | null;
  typeOfIncentiveToExclude: boolean | null;
  holdMemberMarketing: string;
  memberCommsNeedClientApproval: boolean | null;
  holdAllMarketing: boolean | null;
  lowercaseRegistrationCode: string;
  useContractPathForMarketing: boolean | null;
  dateMarketingPutOnHold: string;
  readyForAutomation: boolean | null;
  campaignLifecycleParticipation: boolean | null;
  campaignType: string;
  campaignOptions: string;
  removeNew: boolean | null;
  healthBenefitAltText: string;
  stripsAndLancetsAltText: string;
  generalDisclaimer: string;
  generalSpanishDisclaimer: string;
  removeUnlimited: boolean | null;
  ccmIncentivesGiftCards: boolean | null;
  ccmIncentivesGiftCardsDate: string;
  ccmIncentivesGoodsAndServices: string;
  ccmIncentivesGoodsAndServicesDate: string;
  ccmIncentivesContentGuides: string;
  ccmIncentivesContentGuidesDate: string;
  enrollmentMarketingCustomizations: string;
  enrollmentOnAutopilot: string;
  livongoLedMarketing: boolean | null;
  marketingTeamNotes: string;
  enrollmentMarketingLead: string;
  outreachStratification: string;
  outreachStratificationDate: string;
  clientLogoLink: string;
  logoFileName: string;
  clientAllowsAbTestingOf: string;
  marketingChannelType: string;
  unionClient: boolean | null;
  u18Marketing: boolean | null;
  marketingIncentiveType: string;
  phoneCampaign: string;
  linkToBoxFolderPhiRelease: string;
  programEligibilityFlag: boolean | null;
  isEligibilityDivertised: boolean | null;
  eligibilityVerificationMethod: string;
  eligibilityFileCadence: string;
  linksToEligibilityVerificationFolder: string;
  eligibilityExceptionsRules: string;
  monthlyEscalationPath: string;
  eligibilityTeamNotes: string;
  disableLiveProgramEligibilityCheck: boolean | null;
  eligibleGroupIds: string;
  manualCheck: boolean | null;
  populationDataSources: string;
  ssoPartner: string;
  cvsTdcEligibilityCriteria: string;
  incentivesApiPartner: string;
  incentivesApiStartDate: string;
  incentiveReportingPartner: string;
  memberSupportDetails: string;
}

export type ClientOverviewTemplateField =
  keyof ClientOverviewTemplateForm;

const GENERAL_SETTINGS_FIELDS: ClientOverviewTemplateField[] = [
  "templateName",
  "accountName",
  "organization",
  "contractPath",
  "revenueBucket",
  "clientSuccessManager",
  "clientImplementationManager",
  "registrationCustomizations",
  "chronicCarePopulationType",
  "chronicCarePopulationCoverage",
  "ccmRegistrationAddressType",
  "ccmRegistrationFlowScenarios",
  "cardioFeatureEnabled",
  "cardioStartDate",
  "welcomeKitsShippedByUps",
  "hasBroker",
  "ccmMultifactorAuthentication",
  "hideSexualOrientationQuestions",
  "clinicalModel",
  "clinicalDataSharingAndAccess",
  "clinicalReferrals",
  "memberSupportPhone",
];

const EMPTY_BILLING_FIELDS = {
  billingPartner: "",
  billingMethod: "",
  detailedInvoice: null,
  billingPointOfContact: "",
  hipaaCoveredEntity: "",
  detailedInvoiceRecipients: "",
  paymentTerms: "",
  pricingModel: "",
  detailedInvoiceTags: "",
  bundledPricingDiscount: "",
  proratedEnrollment: null,
  fastStartCreditOffered: null,
  fastStartCreditType: "",
  fastStartParticipationRate: "",
  fastStartLaunchDate: "",
  fastStartCloseDate: "",
  fastStartCustom: "",
  billingAddressCcm: "",
  contractType: "",
  legalName: "",
  contractEffectiveDate: "",
  contractTerminationDate: "",
  baaSigned: null,
  uniqueContractTerms: "",
  marketingAndDopsRequirement: null,
  slaDetails: "",
  daysNoticeForTermination: "",
  terminationForConvenience: null,
  daysNoticeForConvenienceTerm: "",
  billEarlyTerminationThroughClaims: null,
  customerSignedDate: "",
  companySignedDate: "",
  accountHasSla: null,
  lapsedClauseClaimsData: null,
  lapsedClauseOptimizedEnrollmentPlan: null,
  isThereALapsedUserClause: null,
  lapsedClauseMultiChannelMarketing: null,
  lapsedClauseUseOfIncentives: null,
} as const;

const EMPTY_MARKETING_FIELDS = {
  clientAllowsTargetedMarketing: null,
  clientsMustApproveAssets: null,
  employeeTitle: "",
  marketingName: "",
  clientSendsOwnMarketing: null,
  removeSpanish: null,
  atNoCostToYouAltText: "",
  joinAltText: "",
  generalEligibilitySentence: "",
  generalSpanishEligibilitySentence: "",
  paidForBy: "",
  noOepDirectMailInserts: null,
  useForActivationUsage: null,
  typeOfIncentiveToExclude: null,
  holdMemberMarketing: "",
  memberCommsNeedClientApproval: null,
  holdAllMarketing: null,
  lowercaseRegistrationCode: "",
  useContractPathForMarketing: null,
  dateMarketingPutOnHold: "",
  readyForAutomation: null,
  campaignLifecycleParticipation: null,
  campaignType: "",
  campaignOptions: "",
  removeNew: null,
  healthBenefitAltText: "",
  stripsAndLancetsAltText: "",
  generalDisclaimer: "",
  generalSpanishDisclaimer: "",
  removeUnlimited: null,
  ccmIncentivesGiftCards: null,
  ccmIncentivesGiftCardsDate: "",
  ccmIncentivesGoodsAndServices: "",
  ccmIncentivesGoodsAndServicesDate: "",
  ccmIncentivesContentGuides: "",
  ccmIncentivesContentGuidesDate: "",
  enrollmentMarketingCustomizations: "",
  enrollmentOnAutopilot: "",
  livongoLedMarketing: null,
  marketingTeamNotes: "",
  enrollmentMarketingLead: "",
  outreachStratification: "",
  outreachStratificationDate: "",
  clientLogoLink: "",
  logoFileName: "",
  clientAllowsAbTestingOf: "",
  marketingChannelType: "",
  unionClient: null,
  u18Marketing: null,
  marketingIncentiveType: "",
  phoneCampaign: "",
} as const;

const EMPTY_ELIGIBILITY_FIELDS = {
  linkToBoxFolderPhiRelease: "",
  programEligibilityFlag: null,
  isEligibilityDivertised: null,
  eligibilityVerificationMethod: "",
  eligibilityFileCadence: "",
  linksToEligibilityVerificationFolder: "",
  eligibilityExceptionsRules: "",
  monthlyEscalationPath: "",
  eligibilityTeamNotes: "",
  disableLiveProgramEligibilityCheck: null,
  eligibleGroupIds: "",
  manualCheck: null,
  populationDataSources: "",
  ssoPartner: "",
  cvsTdcEligibilityCriteria: "",
  incentivesApiPartner: "",
  incentivesApiStartDate: "",
  incentiveReportingPartner: "",
  memberSupportDetails: "",
} as const;

export const isClientOverviewTemplateFormComplete = (
  form: ClientOverviewTemplateForm,
): boolean =>
  GENERAL_SETTINGS_FIELDS.every((field) => {
    const value = form[field];
    return typeof value === "string"
      ? value.trim().length > 0
      : typeof value === "boolean";
  });

export const buildClientOverviewTemplateForm = (
  templateName: string,
): ClientOverviewTemplateForm => ({
  templateName,
  accountName: "Allied Benefit Systems",
  organization: "Allied Benefit Systems",
  contractPath: "",
  revenueBucket: "USGH",
  clientSuccessManager: "",
  clientImplementationManager: "",
  registrationCustomizations: "",
  chronicCarePopulationType: "Fully insured",
  chronicCarePopulationCoverage: "Employees; Spouse; Children",
  ccmRegistrationAddressType: "US Territory",
  ccmRegistrationFlowScenarios: "Direct-to-Consumer",
  cardioFeatureEnabled: true,
  cardioStartDate: "",
  welcomeKitsShippedByUps: true,
  hasBroker: true,
  ccmMultifactorAuthentication: "MFA Required",
  hideSexualOrientationQuestions: false,
  clinicalModel: "Care coordination",
  clinicalDataSharingAndAccess: "None",
  clinicalReferrals: "Bi-Directional",
  clinicalModelDetails: "",
  memberSupportPhone: "",
  memberSupportUrl: "",
  ...EMPTY_BILLING_FIELDS,
  ...EMPTY_MARKETING_FIELDS,
  ...EMPTY_ELIGIBILITY_FIELDS,
});

export const buildNewClientOverviewTemplateForm =
  (): ClientOverviewTemplateForm => ({
    templateName: "",
    accountName: "Allied Benefit Systems",
    organization: "Allied Benefit Systems",
    contractPath: "",
    revenueBucket: "",
    clientSuccessManager: "",
    clientImplementationManager: "",
    registrationCustomizations: "",
    chronicCarePopulationType: "",
    chronicCarePopulationCoverage: "",
    ccmRegistrationAddressType: "",
    ccmRegistrationFlowScenarios: "",
    cardioFeatureEnabled: null,
    cardioStartDate: "",
    welcomeKitsShippedByUps: null,
    hasBroker: null,
    ccmMultifactorAuthentication: "",
    hideSexualOrientationQuestions: null,
    clinicalModel: "",
    clinicalDataSharingAndAccess: "None",
    clinicalReferrals: "Bi-Directional",
    clinicalModelDetails: "",
    memberSupportPhone: "",
    memberSupportUrl: "",
    ...EMPTY_BILLING_FIELDS,
    ...EMPTY_MARKETING_FIELDS,
    ...EMPTY_ELIGIBILITY_FIELDS,
  });

/** Creating a template only needs the two fields the design stars. */
export const isNewClientOverviewTemplateFormComplete = (
  form: ClientOverviewTemplateForm,
): boolean =>
  form.templateName.trim().length > 0 && form.organization.trim().length > 0;

export interface OrganizationTemplateForm {
  templateName: string;
  organizationNameAdmin: string;
  nameLcrmTelemed: string;
  nameLcrmCcm: string;
  friendlyAccountName: string;
  doingBusinessAs: string;
  parentAccount: string;
  accountStatus: string;
  benefitRestrictionCode: string;
  recordType: string;
  clientType: string;
  accountBusinessType: string;
  accountEffectiveStartDate: string;
  accountEffectiveEndDate: string;
  businessRegion: string;
  isOrganizationTheEmployer: boolean | null;
  hasBrokerReferralCompany: boolean | null;
  clientOperationsManager: string;
  accountManager: string;
  salesAgent: string;
  primaryDailyContact: string;
  primaryBillingContact: string;
  secondaryBillingContact: string;
  primaryMarketingContact: string;
}

export type OrganizationTemplateField = keyof OrganizationTemplateForm;

export const buildOrganizationTemplateForm = (
  templateName: string,
): OrganizationTemplateForm => ({
  templateName,
  organizationNameAdmin: "Aetna Primary Aetna",
  nameLcrmTelemed: "Aetna Dependent",
  nameLcrmCcm: "Aetna",
  friendlyAccountName: "",
  doingBusinessAs: "",
  parentAccount: "Aetna",
  accountStatus: "Client",
  benefitRestrictionCode: "None",
  recordType: "Client Account",
  clientType: "Insurance",
  accountBusinessType: "Health Plan",
  accountEffectiveStartDate: "2005-01-01",
  accountEffectiveEndDate: "2035-12-31",
  businessRegion: "United States of America",
  isOrganizationTheEmployer: true,
  hasBrokerReferralCompany: true,
  clientOperationsManager: "Chloe O’Malley",
  accountManager: "Allison Miller",
  salesAgent: "Sal Aster",
  primaryDailyContact: "Bill Cosgrove",
  primaryBillingContact: "Joel Miller",
  secondaryBillingContact: "Brian Cosgrove",
  primaryMarketingContact: "Allison Miller",
});

export const isOrganizationTemplateFormComplete = (
  form: OrganizationTemplateForm,
): boolean => form.templateName.trim().length > 0;

export const buildNewOrganizationTemplateForm =
  (): OrganizationTemplateForm => ({
    templateName: "",
    organizationNameAdmin: "",
    nameLcrmTelemed: "",
    nameLcrmCcm: "",
    friendlyAccountName: "",
    doingBusinessAs: "",
    parentAccount: "",
    accountStatus: "",
    benefitRestrictionCode: "",
    recordType: "",
    clientType: "",
    accountBusinessType: "",
    accountEffectiveStartDate: "",
    accountEffectiveEndDate: "",
    businessRegion: "",
    isOrganizationTheEmployer: null,
    hasBrokerReferralCompany: null,
    clientOperationsManager: "",
    accountManager: "",
    salesAgent: "",
    primaryDailyContact: "",
    primaryBillingContact: "",
    secondaryBillingContact: "",
    primaryMarketingContact: "",
  });

export interface GroupTemplateForm {
  templateName: string;
  groupNameAdmin: string;
  clientAccountLcrmTeladoc: string;
  clientAccountLcrmLivongo: string;
  accountClientOverview: string;
  legacyGroupId: string;
  groupId: string;
  revenueBucket: string;
  lineOfBusiness: string;
  soldToAccountUuid: string;
  namespace: string;
  clientManager: string;
  clientImplementationManager: string;
  status: string;
  effectiveStartDate: string;
  effectiveEndDate: string;
  terminationDate: string;
  clientOverviewName: string;
  clientOverviewStatus: string;
  contractPath: string;
  domesticCountry: string;
  oneAppAccess: boolean | null;
  healthAssistant: boolean | null;
  oneAppStartDate: string;
  migrationGroupNumber: string;
  livongoRegistrationCode: string;
  livongoClientMemberCode: string;
  ccmRegistrationFlowScenarios: string;
  registrationCustomizations: string;
}

export type GroupTemplateField = keyof GroupTemplateForm;

export const buildGroupTemplateForm = (
  templateName: string,
): GroupTemplateForm => ({
  templateName,
  groupNameAdmin: "Aetna Primary Aetna",
  clientAccountLcrmTeladoc: "Aetna",
  clientAccountLcrmLivongo: "Aetna",
  accountClientOverview: "Aetna",
  legacyGroupId: "21571",
  groupId: "234",
  revenueBucket: "USGH",
  lineOfBusiness: "Commercial ASO",
  soldToAccountUuid: "",
  namespace: "Standard",
  clientManager: "Brian Cosgrove",
  clientImplementationManager: "Chloe O’Malley",
  status: "Active",
  effectiveStartDate: "2025-01-01",
  effectiveEndDate: "",
  terminationDate: "",
  clientOverviewName: "Aetna-Livongo",
  clientOverviewStatus: "Active",
  contractPath: "Livongo",
  domesticCountry: "United States of America",
  oneAppAccess: true,
  healthAssistant: true,
  oneAppStartDate: "2024-01-01",
  migrationGroupNumber: "",
  livongoRegistrationCode: "AETNA-PD",
  livongoClientMemberCode: "AETNA-PD",
  ccmRegistrationFlowScenarios: "Direct to Consumer",
  registrationCustomizations: "Insurance - Required",
});

export const isGroupTemplateFormComplete = (form: GroupTemplateForm): boolean =>
  form.templateName.trim().length > 0;

export const buildNewGroupTemplateForm = (): GroupTemplateForm => ({
  templateName: "",
  groupNameAdmin: "",
  clientAccountLcrmTeladoc: "",
  clientAccountLcrmLivongo: "",
  accountClientOverview: "",
  legacyGroupId: "",
  groupId: "",
  revenueBucket: "",
  lineOfBusiness: "",
  soldToAccountUuid: "",
  namespace: "",
  clientManager: "",
  clientImplementationManager: "",
  status: "",
  effectiveStartDate: "",
  effectiveEndDate: "",
  terminationDate: "",
  clientOverviewName: "",
  clientOverviewStatus: "",
  contractPath: "",
  domesticCountry: "",
  oneAppAccess: null,
  healthAssistant: null,
  oneAppStartDate: "",
  migrationGroupNumber: "",
  livongoRegistrationCode: "",
  livongoClientMemberCode: "",
  ccmRegistrationFlowScenarios: "",
  registrationCustomizations: "",
});


/** The editable half of a program overview; the rest is owned by the template. */
export interface ProgramOverviewEditForm {
  programPlatformVersion: string;
  programImplementationStatus: string;
  status: string;
  registrationStatus: string;
  healthPlanPartnerCustomization: string;
  clientSuccessManager: string;
  clientImplementationManager: string;
  disableMentalHealthGuidance: boolean;
  disableTeletherapy: boolean;
  transitioningDppYear2Members: boolean;
  cdcPayerType: string;
  cdcEnrollmentSource: string;
  providerBasedCare: boolean;
  kickoffDate: string;
  initialLaunchDate: string;
  expectedLaunchDate: string;
  myStrengthTransitionDate: string;
  recruitablePopulationCurrent: string;
  recruitablePopulationDiabetesHypertension: string;
  enrollmentCap: string;
  programQualificationDependency: string;
  programTransition: string;
  newDeviceType: string;
  ckdAwareVariant: boolean;
  claimsConfiguration: string;
  partnerPassThroughPrice: string;
  scheduleName: string;
  programStartDate: string;
  programEndDate: string;
  contractTerm: string;
  autoRenewal: boolean;
  renewalNoticePeriod: string;
  clientPlanDesignInclusions: string;
  cumulativeProgramCap: string;
  bmiLimit: string;
  confirmOnNoRecruitableMatch: boolean;
  qualificationMinimumAge: string;
  optOutQuestions: string;
  additionalQuestions: string;
  insuranceQuestionGroup: string;
  uniqueContractTerms: string;
  lostDamagedDevicePrice1: string;
  pppm: string;
  pmpm: string;
  tier2PppmStartMonth: string;
  tier2Pppm: string;
  tier3PppmStartMonth: string;
  tier3Pppm: string;
  consecutiveInactiveMonthsToLapse: string;
  minimumNumberOfParticipants: string;
  hasPtmm: boolean;
  participantTermMinimumMonths: string;
  multiprogramDiscount: string;
  milestoneBilling: boolean;
  milestoneBillingConfiguration: string;
  lowAcuityPrice: string;
  upfrontPerMember: string;
  billingUniqueContractTerms: string;
  billingPartnerFee: string;
  billingPartnerFeeType: string;
  pppmBillingTrigger: string;
  hasLapseCriteria: boolean;
  lapsedCriteriaSource: string;
  lapseCriteria: string;
  lapsedUserCustomDetail: string;
  lostDamagedDevice1: string;
  replacementDevicePrice1: string;
  lostDamagedDevice2: string;
  lostDamagedDevicePrice2: string;
  lostDamagedDeviceResponsibility: string;
  replacementDeviceCoverage: string;
  performanceGuaranteesApplicable: boolean | null;
  a1cReduction: boolean;
  participantSatisfaction: boolean | null;
  reductionInBg: boolean;
  customBgType: boolean;
  pgCustomDetail: string;
  pgAnalysisDueDate: string;
  pgA1cReductionPppm: string;
  pgA1cReductionPercent: string;
  pgReductionOutOfRangeTimePppm: string;
  pgReductionOutOfRangeTimePercent: string;
  pgSatisfactionPppm: string;
  pgSatisfactionPercent: string;
  incentiveCriteria: string;
  frequencyOfAward: string;
  incentivesReportDelivery: string;
  incentivesReportFrequency: string;
  clientIncentivesDisclaimer: string;
  clientIncentivesHeader: string;
  clientIncentiveStep1: string;
  clientIncentiveStep2: string;
  clientIncentiveStep3: string;
  initialMemberRecruitment: string;
  wpTransitionMemberRecruitment: string;
  wholePersonTransitionDate: string;
  wpTransitionTargetMarketing: string;
  phoneCampaign: string;
  programEligibilityVerificationMethod: string;
  programEligibilityFileCadence: string;
  eligibleGroupIds: string;
  manualCheck: boolean;
  linksToEligibilityVerificationFolder: string;
  eligibilityExceptionsRules: string;
  eligibilityTeamNotes: string;
  complexEscalationDetails: string;
  criteriaTimeHorizonDays: string;
  engagementCriteriaOption: string;
  timeInProgramThresholdDays: string;
  uniqueWeightInDays: string;
  uniqueEngagementDays: string;
  uniqueLessonOrToolDays: string;
  glp1Model: string;
  coachingSessions: string;
  requiredCoachingInteractions: string;
  requiredCoachingSessions: string;
  cumulativeUniqueWeightInDays: string;
  coachingInteractionThresholdDays: string;
  uniqueWeightInDaysLast14: string;
  legacyGlp1Model: string;
}

export type ProgramOverviewEditField = keyof ProgramOverviewEditForm;

/** Values the editor shows but cannot change. */
export interface ProgramOverviewContext {
  program: string;
  account: string;
  clientOverview: string;
}

const PROGRAM_DATE = "2025-01-01";

/** `<input type="date">` needs the ISO day, not the display format. */
const toDateInputValue = (value: string) => value.slice(0, 10);

export const buildProgramOverviewEditForm = (
  overview: ProgramOverviewSummary,
): ProgramOverviewEditForm => ({
  programPlatformVersion: "Retrofit",
  programImplementationStatus: "Launched +90",
  status: "Active",
  registrationStatus: "Open",
  healthPlanPartnerCustomization: "Aetna Diabetes Management",
  clientSuccessManager: "Connor Hudson",
  clientImplementationManager: "Jane Williams",
  disableMentalHealthGuidance: true,
  disableTeletherapy: true,
  transitioningDppYear2Members: true,
  cdcPayerType: "",
  cdcEnrollmentSource: "",
  providerBasedCare: true,
  kickoffDate: PROGRAM_DATE,
  initialLaunchDate: toDateInputValue(overview.initialLaunchDate),
  expectedLaunchDate: PROGRAM_DATE,
  myStrengthTransitionDate: PROGRAM_DATE,
  recruitablePopulationCurrent: "",
  recruitablePopulationDiabetesHypertension: "",
  enrollmentCap: "",
  programQualificationDependency: "",
  programTransition: "",
  newDeviceType: "HT900",
  ckdAwareVariant: true,
  claimsConfiguration: "",
  partnerPassThroughPrice: "0.00",
  scheduleName: "Teamcare - Compr",
  programStartDate: "2026-01-01",
  programEndDate: "2026-02-22",
  contractTerm: "25",
  autoRenewal: true,
  renewalNoticePeriod: "47",
  clientPlanDesignInclusions: "",
  cumulativeProgramCap: "",
  bmiLimit: "",
  confirmOnNoRecruitableMatch: true,
  qualificationMinimumAge: "",
  optOutQuestions: "",
  additionalQuestions: "",
  insuranceQuestionGroup: "",
  uniqueContractTerms: "",
  lostDamagedDevicePrice1: "",
  pppm: "",
  pmpm: "",
  tier2PppmStartMonth: "",
  tier2Pppm: "",
  tier3PppmStartMonth: "",
  tier3Pppm: "",
  consecutiveInactiveMonthsToLapse: "2",
  minimumNumberOfParticipants: "",
  hasPtmm: true,
  participantTermMinimumMonths: "10",
  multiprogramDiscount: "",
  milestoneBilling: true,
  milestoneBillingConfiguration: "Livongo Standard 2.0",
  lowAcuityPrice: "",
  upfrontPerMember: "",
  billingUniqueContractTerms: "",
  billingPartnerFee: "",
  billingPartnerFeeType: "Administrative",
  pppmBillingTrigger: "First Device Reading",
  hasLapseCriteria: true,
  lapsedCriteriaSource: "Program Agreement",
  lapseCriteria: "Any Activity V2",
  lapsedUserCustomDetail: "",
  lostDamagedDevice1: "Blood Glucose Meter",
  replacementDevicePrice1: "",
  lostDamagedDevice2: "",
  lostDamagedDevicePrice2: "",
  lostDamagedDeviceResponsibility: "Livongo",
  replacementDeviceCoverage: "",
  performanceGuaranteesApplicable: null,
  a1cReduction: true,
  participantSatisfaction: null,
  reductionInBg: true,
  customBgType: true,
  pgCustomDetail: "",
  pgAnalysisDueDate: "",
  pgA1cReductionPppm: "",
  pgA1cReductionPercent: "",
  pgReductionOutOfRangeTimePppm: "",
  pgReductionOutOfRangeTimePercent: "",
  pgSatisfactionPppm: "",
  pgSatisfactionPercent: "",
  incentiveCriteria: "Days Checking",
  frequencyOfAward: "Weekly",
  incentivesReportDelivery: "Secure FTP",
  incentivesReportFrequency: "Quarterly",
  clientIncentivesDisclaimer: "",
  clientIncentivesHeader: "",
  clientIncentiveStep1: "",
  clientIncentiveStep2: "",
  clientIncentiveStep3: "",
  initialMemberRecruitment: "",
  wpTransitionMemberRecruitment: "",
  wholePersonTransitionDate: "",
  wpTransitionTargetMarketing: "",
  phoneCampaign: "Phone + SMS",
  programEligibilityVerificationMethod: "RTE + (File OR Group ID)",
  programEligibilityFileCadence: "Weekly",
  eligibleGroupIds: "",
  manualCheck: true,
  linksToEligibilityVerificationFolder: "",
  eligibilityExceptionsRules: "",
  eligibilityTeamNotes: "",
  complexEscalationDetails: "",
  criteriaTimeHorizonDays: "",
  engagementCriteriaOption: "Default ESI",
  timeInProgramThresholdDays: "",
  uniqueWeightInDays: "",
  uniqueEngagementDays: "",
  uniqueLessonOrToolDays: "",
  glp1Model: "",
  coachingSessions: "",
  requiredCoachingInteractions: "None",
  requiredCoachingSessions: "5",
  cumulativeUniqueWeightInDays: "26",
  coachingInteractionThresholdDays: "10",
  uniqueWeightInDaysLast14: "6",
  legacyGlp1Model: "",
});

export const buildProgramOverviewContext = (
  overview: ProgramOverviewSummary,
): ProgramOverviewContext => ({
  program: overview.program,
  account: "Aetna",
  clientOverview: "Aetna – Livongo",
});
