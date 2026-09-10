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
    memberSupportPhone: "",
  });

/** Creating a template only needs the two fields the design stars. */
export const isNewClientOverviewTemplateFormComplete = (
  form: ClientOverviewTemplateForm,
): boolean =>
  form.templateName.trim().length > 0 && form.organization.trim().length > 0;
