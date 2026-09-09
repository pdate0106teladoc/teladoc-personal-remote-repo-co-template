import type { ProgramOverviewSummary } from "@/components/template/view";

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
});

export const buildProgramOverviewContext = (
  overview: ProgramOverviewSummary,
): ProgramOverviewContext => ({
  program: overview.program,
  account: "Aetna",
  clientOverview: "Aetna – Livongo",
});
