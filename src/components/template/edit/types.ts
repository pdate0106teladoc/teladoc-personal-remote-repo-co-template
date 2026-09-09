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
  cardioFeatureEnabled: boolean;
  cardioStartDate: string;
  welcomeKitsShippedByUps: boolean;
  hasBroker: boolean;
  ccmMultifactorAuthentication: string;
  hideSexualOrientationQuestions: boolean;
  clinicalModel: string;
  memberSupportPhone: string;
}

export type ClientOverviewTemplateField =
  keyof ClientOverviewTemplateForm;

export const isClientOverviewTemplateFormComplete = (
  form: ClientOverviewTemplateForm,
): boolean =>
  Object.values(form).every((value) =>
    typeof value === "string" ? value.trim().length > 0 : typeof value === "boolean",
  );

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
  memberSupportPhone: "",
});
