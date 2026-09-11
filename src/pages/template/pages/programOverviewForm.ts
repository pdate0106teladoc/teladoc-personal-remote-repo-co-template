import type { ProgramOverviewSummary } from "./programOverviewData";

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
