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
