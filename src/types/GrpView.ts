// Types relating to group and product configuration

import { ContactRef, metaCompoenent, metaDataType } from ".";
import type { MarketingSiteUserContact } from "./OrgView";
export interface GeneralSetting {
  overview: {
    groupOverview: {
      organizationName: string;
      organizationId: string;
      groupName: string;
      clientAccountTeladoc: string;
      clientAccountLivongo: string;
      account: string;
      legacyGroupId: string;
      groupId: string; // Added new field for Group ID
      lineOfBusiness: string;
      namespace: string;
      revenueBucket: string;
      status: string; //here
      clientManager: ContactRef;
      effectiveStartDate: string;
      effectiveEndDate: string;
      terminationDate: string;
      domesticCountry: string;
      clientOverviewName: string;
      clientOverviewStatus: string;
      contractpath: string;
      soldToAccountUUID: string;
      clientImplementationManager: ContactRef;
    };
    brand: {
      oneAppAccess: string;
      healthAssistant: string;
      oneAppStartDate: string;
      migrationGroupNumber: string;
    };
    ccmConfiguration: {
      livongoRegistrationCode: string;
      livongoClientMemberCode: string;
      enableChronicCareReferrals: string;
      enableCoreAdminImport: string;
      registrationName: string;
      ccmRegistrationAddressType: string;
      chronicCarePopulationType: string;
      chronicCarePopulationCoverage: string;
      welcomeKitsShippedByUpsNotFedex: boolean;
      registrationFlowScenarios: string;
      registrationCustomizations: string;
      myStrengthGlobalAccessCd: string;
    };
    clientMemberCodes: ClientMemberCode;
    cmcAssociations: CmcAssociation[];
    additionalDetails: {
      benefitRestrictionCode: string;
      regCode: string;
      groupType: string;
      brandCode: string;
      state: string;
      soldToAccountName: string;
      ccmExternalTags: string;
      notesInternal: string;
      notesExternal: string;
      registrationGroupCode: string;
      specialInstructions: string;
    };
    routingRules: RoutingRule[];
    groupOffers: GroupOffers[];
    companyTags: {
      companyTags: string;
    };
  };
  groupPermissions: {
    generalGroupPermissions: {
      sendMemberResolutionLetter: boolean;
      sendProblemMemberLetter: boolean;
      sendUtilizationLetter: boolean;
      hhsAccess: boolean;
      sendFraudWasteAndAbuseTermLetter: boolean;
      enableHealthDataVisualization: boolean;
    };
    memberAccessPermissions: {
      allowedNoUsernamePassword: boolean;
      dualAccess: boolean;
      webAccess: boolean;
      mobileAccess: boolean;
      allowConversionToRetail: boolean;
      vipMember: boolean;
      enableGeoFencing: boolean;
      restrictedPhiAccess: boolean;
      ccmMultifactorAuthentication: string;
      allowRegistrationsViaCallCenter: boolean;
      allowConsultationRequestsViaCallCenter: boolean;
      sendPromoCode: string;
      requireSecurityQuestionsCount: number;
      enableRestrictedMemberDownloads: boolean;
      linkExpirationTimeHours: number;
      dateOfBirthCanBeNull: boolean;
      enableWellnessContent: boolean;
      hideSexualOrientationGenderIdentityQuestions: boolean;
      myStrengthGlobalAccessCd: string;
    };
    memberVisitPermissions: {
      sendCcrToPcp: string;
      inHomeRxDelivery: boolean;
      disablePatientExcuseNote: boolean;
    };
    memberRegistrationPermissions: {
      twoStepAuthentication: boolean;
      twoStepSms: boolean;
      twoStepMail: boolean;
      twoPhoneCall: boolean;
    };
    performanceGuaranteesAndServiceLevels: {
      standardServiceLevel: string;
      slawWaiveVisitFeeIfMissed: boolean;
      vipServiceLevel: string;
      performanceGuarantee: boolean;
    };
  };
  groupRelationShips: {
    roleType: string;
    memberGroup: string;
    memberGroupName: string;
    memberGroupStatus: string;
    sourceAccount: string;
    duplicateKey: string;
    hasBroker: boolean;
    sourceAccountId: string;
  }[];
  clinicalAndMemberSupport: {
    ccmClinicalDetails: {
      clinicalModel: string;
      clinicalReferrals: string;
      clinicalDataSharingAccess: string;
      clinicalModelDetails: string;
    };
    ccmMemberSupportDetails: {
      memberSupportURL: string;
      memberSupportPhone: string;
    };
  };
  updatedAt?: string; // Added new field for updated timestamp
}

export interface Billing {
  overview: {
    groupBillingSettings: {
      membershipFeeType: string;
      consultBillingMethod: string;
      billToAccount: string;
      billToAccountGuid: string;
      billTo: string;
      payers: string;
      teladocToRefundMembers: boolean;
      consultsIncluded: boolean;
      includeCCMPEPMProduct: boolean;
    };
    readOnly: {
      purchaseOrderRequired: boolean;
      purchaseOrderNumber: string;
    };
  };
  ccm: {
    groupBillingDetails: {
      billingPartner: string;
      billingMethod: string;
      billingPointOfContact: string;
      detailedInvoice: string;
      detailedInvoiceRecipients: string;
      detailedInvoiceTags: string;
      billingAddress: string;
      hipaaCoveredEntity: string;
      paymentTerms: string;
      pricingModel: string;
      bundledPricingDiscount: string;
      proratedEnrollment: string;
      fastStartCreditOffered: string;
      fastStartParticipationRate: string;
      fastStartCreditType: string;
      fastStartLaunchDate: string;
      fastStartCloseDate: string;
      fastStartCustom: string;
      clientExpectsRoi: string;
      requiredDataForRoi: string;
    };
    contractDetails: {
      contractType: string;
      legalName: string;
      contractEffectiveDate: string;
      contractTerminationDate: string;
      baaSigned: string;
      marketingAndDopsRequirements: string;
      accountHasSlas: string;
      slaDetails: string;
      daysNoticeForTermination: string;
      terminationForConvenience: string;
      daysNoticeForTermForConvenience: string;
      billEarlyTerminationThroughClaims: string;
      customerSignedDate: string;
      companySignedDate: string;
      uniqueContractTerms: string;
    };
    lapsedUserDetails: {
      isThereALapsedUserClause: string;
      lapsedClauseClaimsData: string;
      lapsedClauseMultiChannelMarketing: string;
      lapsedClauseUseOfIncentives: string;
      lapsedClauseOptimizedEnrollmentPlan: string;
    };
  };
  updatedAt?: string;
}

export interface Marketing {
  overview: {
    brand: {
      serviceBrand: string;
    };
    contacts: {
      isActiveUserForCcmProgram: boolean;
      isActiveUserForTelemedProgram: boolean;
      marketingSiteUserTelemed?: MarketingSiteUserContact[] | null;
      marketingSiteUserCcm: string;
    };
    telemedicineLogos: {
      logoTag: string;
      logoTagID: string;
      logos: {
        logo: string;
        logoId: string;
      }[];
      coBrandWithLogo: boolean;
      triBrandWithLogo: boolean;
      altLogos: {
        altLogo: string;
        altLogoId: string;
      }[];
      logoTitle: string;
      logoDescription: string;
      sfmcId: string;
      currencyISOCode: string;
      fileExtension: string;
    };
    ccmLogos: {
      logoFileName: string;
      clientLogoLink: string;
    };
  };
  telemedicine: {
    marketingPreferences: {
      language: string;
      healthBenefitLanguage: string;
      preferredEligibilityLanguage: string;
      testingPermission: boolean;
      modelingPermission: boolean;
      registrationEnrollmentEngagementTier: string;
      registrationEnrollmentJourney: string;
      ongoingRegistrationEnrollmentJourney: boolean;
      communicationMode: string;
      emailOptIn: boolean;
      directMailOptIn: boolean;
      outboundCallsOptIn: boolean;
      textOptIn: boolean;
      incentivesOptIn: boolean;
    };
    wellboundEap: {
      wellboundEAPBetterHelpURL: string;
      wellboundEAPTeladocURL: string;
    };
    marketingData: {
      receivingClaimsDataForTelemedPrograms: string;
    };
    welcomeLetter: {
      isValidMsuGroup: boolean;
      welcomeLetterTemplate: string;
      cardName: string;
      clientAccountLocation: string;
      mkConsultArea: string;
      disclaimerTeladoc: string;
      clientDisclaimer: string;
      disclaimerCustom: string;
      sendCard: boolean;
      activeDate: string;
      shippingClass: string;
      companyCopy: string;
      cmsCode: string;
      wkCardIncludesLogo: boolean;
      mkWelcomeMessage: string;
      mkIdCardFront1: string;
      mkIdCardFront2: string;
      wkMailTo: string;
      wkMailToAddress: string;
      consultMessage: string;
      consultMessageOnWelcomeLetter: boolean;
      welcomeLetterConsultMessage: string;
      wkIncludesInsert: boolean;
      insertDocumentName: string;
      clientFormNumber: string;
    };
    p360: {
      p360BrandRelationship: string;
      p360URL: string;
      virtualFirstPlanName: string;
      virtualFirstHealthPlanSummary: string;
      healthPlanBoilerPlateCopy: string;
      virtualFirstHealthPlan: boolean;
      referralRequired: boolean;
    };
  };
  ccm: {
    groupOverview: {
      outreachStratification: string;
      outreachStratificationDate: string;
    };
    marketingPreferences: {
      clientAllowsTargetedMarketing: boolean;
      clientsMustApproveAssets: boolean;
      employeeTitle: string;
      marketingName: string;
      clientSendsOutTheirOwnMarketing: boolean;
      useContractPathForMarketing: boolean;
      holdAllMarketing: boolean;
      dateMarketingPutOnHold: boolean;
      readyForAutomation: boolean;
      campaignType: string;
      campaignOptions: string;
    };
    marketingLanguagePreferences: {
      removeSpanish: boolean;
      atNoCostToYouAltText: string;
      joinAltText: boolean;
      generalEligibilitySentence: string;
      generalSpanishEligibilitySentence: string;
      paidForBy: string;
      lowercaseRegistrationCode: boolean;
      removeNew: boolean;
      healthBenefitAltText: string;
      stripsLancetsAltText: string;
      generalDisclaimer: string;
      generalSpanishDisclaimer: string;
      removeUnlimited: boolean;
      noOEPDirectMailInserts: boolean;
      holdMemberMarketing: boolean;
      memberCommsNeedClientApproval: boolean;
    };
    allowedCommunicationMethods: {
      clientAllowsABTestingOf: string;
      marketingChannelType: string;
      unionClient: boolean;
      u18Marketing: boolean;
      marketingIncentiveType: string;
      phoneCampaign: string;
      campaignLifecycleParticipation: string;
      ccmIncentivesGiftCards: boolean;
      ccmIncentivesGoodsServices: boolean;
      ccmIncentivesGiftCardsDate: string;
      ccmIncentivesGoodsServicesDate: string;
      ccmUsageIncentivesGiftCards: string;
      typeOfIncentiveToExclude: string;
    };
  };
}

export interface EligibilityAndClaims {
  overview: {
    eligibilityDetails: {
      primaryRegistrationMemberSource: string;
      primaryRegistrationMemberFee: number;
      enableCcmCombinedEligibility: boolean;
      egrSourceGroupID: string;
      dependentRegistrationMemberSource: string;
      dependentMinimumAge: number;
      dependentMaximumAge: number;
      allowMinorRegistration: boolean;
      minAgeForPrimaryRegistration: number;
    };
    contacts: {
      eligibilityContact: ContactRef;
    };
  };
  ccmEligibility: {
    eligibilityDetails: {
      linkToBoxFolderPHIRelease: boolean;
      programEligibilityFlag: boolean;
      isEligibilityDriveritized: boolean;
      eligibilityVerificationMethod: string;
      eligibilityExceptionsRules: string;
      eligibilityFileCadence: string;
      linksToEligibilityVerificationFolder: string;
      monthlyEscalationPath: string;
      eligibilityTeamNotes: string;
      disableLiveProgramEligibilityCheck: boolean;
      eligibleGroupIDs: string[];
      manualCheck: boolean;
      populationDataSources: string;
    };
    ccmIntegrations: {
      ssoPartner: string;
      incentivesAPIPartner: string;
      incentivesAPIStartDate: string;
      incentiveReportingPartner: string;
      memberSupportDetails: string;
      cvsTDCEligibilityCriteria: string;
    };
  };
}
export interface CCMProduct {
  productName: string;
  bundleType: string;
  membershipFee: number;
  membershipFeeType: number | null;
  totalVisitFee: number;
  memberVisitFee: number;
  clientVisitFee: number;
  minAge: number;
  revenueEffectiveDate: string | null;
  terminationDate: string;
  rows: CCMRow[];
}

export interface CCMRow {
  featureName: string;
  bundleType: string;
  membershipFee: number;
  membershipFeeType: string;
  totalVisitFee: number;
  memberVisitFee: number;
  clientVisitFee: number;
  minAge: number;
  revenueEffectiveDate: string;
  terminationDate: string;
}

export interface ExpertMedicalService {
  productName: string;
  rows: ExpertMedicalRow[];
}

export interface ExpertMedicalRow {
  featureName: string;
  member: string;
  membershipFee: number;
  membershipFeeType: number;
  totalVisitFee: number;
  memberVisitFee: number;
  clientVisitFee: number;
  revenueEffectiveDate: string;
  terminationDate: string;
}

export interface PlatformAndProgramService {
  productName: string;
  rows: PlatformServiceRow[];
}

export interface PlatformServiceRow {
  featureName: string;
  membershipFee: number;
  membershipFeeType: number;
  totalVisitFee: number;
  memberVisitFee: number;
  clientVisitFee: number;
  revenueEffectiveDate: string;
  terminationDate: string;
}

export interface ConnectedCare {
  product: string;
  partner: string;
  revenueEffectiveDate: string;
  terminationDate: string;
}

export interface ClientMemberCode {
  cmCodeAssignmentId: string;
  code: string;
  cmcRecordType: string;
  usedForRegistration: boolean;
  isActive: boolean;
  account: string;
}

export interface CmcAssociation {
  cmcAssociationId: string;
  recordType: string;
  cmcCode: string;
  programNumber: string;
  programOverviewName: string;
}

export interface RoutingRule {
  routingRule: number;
  id: number;
  dateTime: string;
  changedBy: {
    name: string;
    initials: string;
  };
  service: string;
}

export interface GroupOffers {
  promotion: string;
  family: boolean;
  serviceSpecialties: string[];
  interval: string;
  perInterval: string;
  discountPercent: string;
  dateAdded: string;
  currentStartDate: string;
  currentEndDate: string;
  discountAmount: string;
  promotionType: string;
}

export type SectionData = Record<string, Record<string, DisplayRowProps[]>>;

export interface FieldMetadata {
  value: any;
  editable: boolean;
  uiComponentType: metaCompoenent
  dataType: metaDataType
  maxLength?: number | null;
  required?: boolean;
  placeholder?: string;
  allowedValues?: string[] | null;
  min?: number;
  max?: number;
  regex?: string;
  simpleEdits?: boolean;
  L1Required?: boolean;
  L2Required?: boolean;
}

export interface DisplayRowProps {
  label: string;
  value: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  format?: "text" | "date" | "boolean" | "person" | "img" | "link" | "html" | "percentage";
  tooltipContent?: string;
  personMeta?: {
    name: string;
    initials?: string;
  };
  lastChild?: boolean;
  metadata?: FieldMetadata
  fieldKey?: string;
  onPersonClick?: () => void;
}
export interface GroupProduct {
  data: GroupProductDetails;
}
export interface GroupProductDetails {
  generalSettings: GeneralSettings;
  billing: Billing;
}

export interface GeneralSettings {
  productName: string | null;
  productRollup: string | null;
  actualCopayMayBeLess: boolean | null;
  usghAppOptOut: string | null;
  revenueEffectiveDate: string | null;
  productStartDate: string | null;
  productTermDate: string | null;
  coveredGeographicalArea: string | null;
  ageRangeMinAge: number | null;
  ageRangeMaxAge: number | null;
  communicationMethodsPhone: string | null;
  communicationMethodsVideo: string | null;
  teladocSelect: string | null;
  enhancedScheduling: string | null;
  allowCareGiverProgram: string | null;
  vendorPartner: string | null;
  opportunities: ProductOpportunity[];
}

export interface Billing {
  membershipFee: number | null;
  groupMembershipFeeType: string | null;
  providerLevelPayer: string | null;
  payer: string | null;
  membershipFeeType: string | null;
  standardLab: string | null;
  nonStandardLab: string | null;
  pepmOrPmpm: number | null;
  memberPerLabFee: number | null;
  planPerLabFee: number | null;
  totalPerLabFee: number | null;
  rteOverride: ProductDetailRTE[];
}
export interface ProductDetailRTE {
  consultType: string;
  total: string;
  copay: string;
  coinsurance: string;
}

export interface ConnectedCare {
  productId: string;
  productName: string;
  partner: string;
  revenueStartDate: string;
  terminationDate: string;
}
interface Feature {
  featureName: string;
  visitFeesMember: number | null;
  visitFeesClient: number | null;
}

export interface Product {
  productId: string;
  productName: string;
  productTag?: string;
  membership: number;
  age: number;
  effectiveDate: string;
  termDate: string;
  visitFeesMember: number | null;
  visitFeesClient: number | null;
  features: Feature[];
  transistionToId?: number;
  transistionToName?: string;
  category?: string;
  updatedOn?: string;
  membershipFeeType: string;
  productEnabled?: boolean;
}

export interface Bundle {
  bundleId: string;
  bundleName: string;
  effectiveDate: string;
  advAssessment: boolean;
  nutritionPromotion: boolean;
  proactiveCoaching: boolean;
  addedOn?: string;
  products?: Product[];
  bundles?: Bundle[];
}

export interface GroupProductResponse {
  bundles: Bundle[];
  standaloneProducts: Product[];
}

export type Field = {
  displayName: string;
  configCode: string;
  component: string;
  section: string | null;
  group: string | null;
  type: string | null;
  defaultValue: any;
  isEditable: boolean;
  visibilityCondition: any;
  order: number;
  layout?: string | null;
  value: any;
};

export type GroupedForUI = {
  [category: string]: {
    direct: Field[]; // fields without a group
    groups: { [groupName: string]: Field[] }; // fields grouped by group name
  };
};

export interface ProductOpportunity {
  opportunityName: string;
  opportunityGuid: string;
  contractNumber: string;
  effectiveStartDate: string;
  effectiveEndDate: string;
  id: string;
}

export interface ProductRTEOverride {
  consultType: string;
  total: number;
  copay: number;
  coinsurance: number;
  approvalTicket?: string;
}

export interface ProductBundleResponse {
  bundleName: string;
  details: BundleDetails;
  features: BundleFeature[];
  products: ProductItem[];
}

export interface BundleDetails {
  opportunities: BundleOpportunity[];
}

export interface BundleOpportunity {
  opportunityId: string;
  name: string;
  guid: string;
  format?: "text" | "date" | "boolean" | "person" | "img" | "link" | "contact" | "html";
  effectiveStartDate: string;
  effectiveEndDate: string;
  id: string;
  contractNumber: string;
}

export interface BundleFeature {
  name: string;
  enabled: boolean;
}

export interface ProductItem {
  name: string;
  type: string;
  selected: boolean;
  products: ProductItem[];
}

export interface ProductBilling {
  claimsConfiguration: string | null;
  replacementDeviceCoverage: string | null;
  newDeviceType: string | null;
  uniqueContractTerms: string | null;
  lostDamagedDevice1: string | null;
  lostDamagedDevicePrice1: number | null;
  lostDamagedDevice2: string | null;
  lostDamagedDevicePrice2: number | null;
  partnerPassThroughPrice: number | null;
  lostDamagedDeviceResponsibility: string | null;
  replacementDeviceCoveragePrice: number | null;
  pppm: string | null;
  pmpm: string | null;
  tier2PppmStartMonth: number | null;
  tier2Pppm: number | null;
  tier3PppmStartMonth: number | null;
  tier3Pppm: number | null;
  lowAcuityPrice: number | null;
  upfrontPerMember: number | null;
  billingPartnerFee: number | null;
  billingPartnerFeeType: string | null;
  pppmBillingTrigger: string | null;
  isThereLapseCriteria: string | null;
  lapsedCriteriaSource: string | null;
  lapseCriteria: string | null;
  consecutiveInactiveMonthsToLapsed: number | null;
  lapsedUserCustomDetail: string | null;
  minimumNumberOfParticipants: number | null;
  isThereAptmm: string | null;
  participantTermMinimumMonths: number | null;
  multiprogramDiscount: number | null;
  milestoneBilling: boolean;
  milestoneBillingConfiguration: string | null;
  tier2PartnerFeeStartMonth: number | null;
  tier2PartnerFee: number | null;
  performanceGuarantees: boolean;
  a1cReduction: boolean;
  participationSatisfaction: boolean;
  reductionInBg: string;
  customPgType: boolean;
  pgCustomDetail: string | null;
  pgAnalysisDueDate: string | null;
  pgA1cReductionPppm: number | null;
  pgA1cReductionPercent: number | null;
  pgReductionInOutOfRangeTimePppm: number | null;
  pgReductionInOutOfRangeTimePercent: number | null;
  pgSatisfactionPppm: number | null;
  pgSatisfactionPct: number | null;
  cdcPayerType: string | null;
}

export interface ProductProgramSchedule {
  pppm: number;
  pmpm: number;
  tier2PppmStartMonth: number;
  tier2Pppm: number;
  tier3PppmStartMonth: number;
  tier3Pppm: number;
  lowAcuityPrice: number;
  upfrontPerMember: number;
  uniqueContractTerms: string;
  billingPartnerFee: number;
  billingPartnerFeeType: string;
  pppmBillingTrigger: string;
  isThereLapseCriteria: boolean;
  lapsedCriteriaSource: string;
  lapsedCriteria: string;
  consecutiveInactiveMonthsToLapsed: string;
  lapsedUserCustomDetails: string;
  minimumNumberOfParticipants: number;
  isThereAPtmm: boolean;
  participantTermMinimumMonths: string;
  replacementDeviceCoverage: string;
  lostOrDamagedDevice1: string;
  lostOrDamagedDevicePrice1: number;
  lostOrDamagedDevice2: string;
  lostOrDamagedDevicePrice2: number;
  lostOrDamagedDeviceResponsibility: string;
  multiprogramDiscount: number;
  milestoneBilling: boolean;
  milestoneBillingConfiguration: string;
  tier2PartnerFeeStartMonth: number;
  tier2PartnerFee: number;
}

export interface DetailMarketing {
  phoneCampaign: string;
  initialMemberRecruitment: string;
  wholePersonTransitionDate: string;
  wpTransitionMemberRecruitment: string;
  incentiveCriteria: string;
  frequencyOfAward: string;
  incentivesReportDelivery: string;
  incentivesReportFrequency: string;
  clientIncentivesHeader: string;
  clientIncentivesDisclaimer: string;
  wpTransitionMarketing: string;
}

export interface DetailEngagementCriteria {
  timeHorizonForCriteriaBelowDays: number;
  engagementCriteriaOption: string;
  timeInProgramThresholdDays: number;
  uniqueDaysAnyAppOrWebEngagement: number;
  uniqueDaysLessonTakenOrFoodLogged: number;
  uniqueWeighInDays: string;
  glp1Model: string;
  requiredCoachingInteractions: string;
  requiredCoachingSessions: string;
  cumulativeUniqueDaysWithWeighIns: string;
  coachingInteractionThresholdDays: number;
}

export interface DetailEligibility {
  programEligibilityVerificationMethod: string;
  programEligibilityFileCadence: string;
  eligibleGroupIds: string;
  manualCheck: boolean;
  linksToEligibilityVerificationFolder: string;
  eligibilityExceptionsRules: string;
  eligibilityTeamNotes: string;
  complexEscalationDetails: string;
}
export interface DetailGeneralSettings {
  clientSuccessManager: string | null;
  clientImplementationManager: string | null;
  program: string;
  clientOverview: string | null;
  programPlatformVersion: string;
  programImplementationStatus: string;
  programStartDate: string;
  programEndDate: string;
  status: string;
  ckdAwareVariant: boolean;
  disableTeletherapy: boolean;
  recruitablePopulationCurrent: number | null;
  account: string;
  registrationStatus: string;
  transitioningDppYear2Members: boolean;
  cdcEnrollmentSource: string | null;
  providerBasedCare: boolean;
  kickoffDate: string;
  expectedLaunchDate: string | null;
  myStrengthTransitionDate: string | null;
  recruitablePopulationDhtnCurrent: number | null;
  enrollmentCap: number | null;
  programQualificationDependency: string | null;
  claimsConfiguration: string | null;
  clientPlanDesignInclusions: string | null;
  name: string;
  contractTerm: string;
  autoRenewal: boolean;
  renewalNoticePeriod: string;
  cumulativeProgramCap: number | null;
  bmiLimit: number | null;
  confirmOnNoRecruitableMatch: boolean;
  qualificationMinimumAge: number | null;
  optOutQuestions: string | null;
  additionalQuestions: string | null;
  insuranceQuestionGroup: string | null;
  disableMentalHealthGuidance: boolean;
  healthPlanPartnerCustomizations: string | null;
  initialLaunchDate: string;
  newDeviceType: string | null;
  programType: string;
  programTransitionDate: string | null;
  myStrengthTransitioningClient: boolean | null;
  disableBh: boolean | null;
}

export interface ProductSubscriptions {
  prepaidVisits: number;
  productName: string;
  vendorProductOption: string;
}

export interface ProductDetailResponse {
  product: string;
  sku: string;
  rteAndPayerDisplayFlag: boolean;
  fields: Field[];
  opportunities: ProductOpportunity[];
  rteOverrides: ProductRTEOverride[];
  generalSettings: DetailGeneralSettings;
  eligibility: DetailEligibility;
  engagementCriteria: DetailEngagementCriteria;
  marketing: DetailMarketing;
  billing: ProductBilling;
  subscriptions: ProductSubscriptions[];
}

export interface ProductPerformanceGuarantee {
  performanceGuarantees: boolean;
  a1cReduction: boolean;
  participantSatisfaction: boolean;
  reductionInBg: boolean;
  customPgType: boolean;
  pgCustomDetails: string;
  pgAnalysisDueDate: string;
  pgA1cReductionPppm: number;
  pgA1cReductionPercentage: number;
  pgEducationInOutOfRangeTimePppm: number;
  pgEductionInOutOfRangeTimePercentage: number;
  pgSatisfactionPppm: number;
  pgSatisfactionPercentage: number;
}
