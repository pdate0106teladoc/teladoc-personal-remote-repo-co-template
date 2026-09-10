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
