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
