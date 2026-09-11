export type TemplateScope = "client-overview" | "organization" | "group";

export interface TemplateSummary {
  id: string;
  name: string;
  createdOn: string;
  lastUsedOn: string;
  totalCount?: number;
  activeCount?: number;
}

export interface FieldPair {
  label: string;
  value: string;
  format?: "person";
}

export interface TemplateDetail {
  overviewLeft: FieldPair[];
  overviewRight: FieldPair[];
  groupRelationship: FieldPair[];
  groupPermissionsLeft: FieldPair[];
  groupPermissionsRight: FieldPair[];
  clinicalAndMemberSupportLeft: FieldPair[];
  clinicalAndMemberSupportRight: FieldPair[];
  ccmBillingLeft: FieldPair[];
  ccmBillingRight: FieldPair[];
  contractDetailsLeft: FieldPair[];
  contractDetailsRight: FieldPair[];
  lapsedUserLeft: FieldPair[];
  lapsedUserRight: FieldPair[];
  groupOverviewLeft: FieldPair[];
  groupOverviewRight: FieldPair[];
  ccmLogosLeft: FieldPair[];
  ccmLogosRight: FieldPair[];
  allowedCommunicationLeft: FieldPair[];
  allowedCommunicationRight: FieldPair[];
  marketingPreferencesLeft: FieldPair[];
  marketingPreferencesRight: FieldPair[];
  additionalMarketingLeft: FieldPair[];
  additionalMarketingRight: FieldPair[];
  eligibilityDetailsLeft: FieldPair[];
  eligibilityDetailsRight: FieldPair[];
  ccmIntegrationsLeft: FieldPair[];
  ccmIntegrationsRight: FieldPair[];
  memberSupportDetails: FieldPair[];
}
