import { contact } from "@/pages/contacts/ContactCards";
import { OrgData } from "./Hierarchy";


export interface ColumnConfig {
  key: string;
  label: string;
  isFilterable?: boolean;
  isSortable?: boolean;
  render?: (value: any) => React.ReactNode; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface DataRow {
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

// Common Types
export interface HierarchyNode {
  name: string;
  id: number;
  type: "root" | "group" | "organization" | string;
  parentId: number | null;
  [key: string]: unknown;
  billingOrganization?: boolean;
}

export type SearchErrMsg = "Data sync failed" | "Data not available" | "Data syncing in progress";

export interface SearchMessages {
  organization?: SearchErrMsg;
  group?: SearchErrMsg;
  opportunity?: SearchErrMsg;
}

export interface searchResults {
  data: {
    organizations: Organization[];
    groups: Group[];
    opportunities: Opportunity[];
    contacts: contact[];
    egr?: any[];
    agr?: any[];
    page: Page;
    type: string;
    messages?: SearchMessages;
  };
}
export interface contactSearchResults {
  data: {
    contacts: contact[];
    page: Page;
    type: string;
  };
  metadata: metaData;
}

export interface EntityCounts {
  organizations?: number;
  groups?: number;
  opportunities?: number;
  contacts?: number;
  egr?: number;
  agr?: number;
}

export interface Page {
  totalResults: number;
  page: number;
  limit: number;
  hasMore: boolean;
  entityCounts: EntityCounts;
}

// Organization Types
export interface Organization {
  accountGuid: string;
  accountName: string;
  billingOrg: string;
  billingOrgId: string;
  id: string;
  organizationId: string;
  organizationName: string;
  hierarchy: OrgData;
}

// Group Types
export interface Group {
  accountName: string;
  clientMemberCode: string;
  groupId: string;
  groupName: string;
  legacyGroupId: string;
  organizationId: string;
  organizationUuid: string;
  organizationName: string;
  registrationCode: string;
  id: string;
  status: string;
  hierarchy: OrgData;
}

// Opportunity Types
export interface Opportunity {
  id: string;
  accountGuid: string;
  accountName: string;
  clientLineofBusiness: string;
  contractPath: string;
  contractingAccount: string;
  opportunityGuid: string;
  opportunityName: string;
  organizationName: string;
  organizationId: string;
  revenueEffectiveDate: string;
  closeDate: string;
  subType: string;
  subTypeDetail: string;
  type: string;
}
export interface OpportunityDetail {
  accountGuid: string;
  accountName: string;
  businessRegion: string;
  closeDate: string;
  earlyImplementation: string;
  gcrmContractAccount: string;
  gcrmContractPath: string;
  id: string;
  lineOfBusiness: string;
  livesCount: string;
  name: string;
  opportunityGuid: string;
  opportunityUrl: string;
  populationType: string;
  productDto: string;
  requestCimFlag: string;
  revenueEffectiveDate: string;
  stage: string;
  subType: string;
  subTypeDetail: string;
  type: string;
}

export interface metaData {
  callerId: string;
  correlationId: string;
  instanceId: string;
  processingTimeMs: number;
  requestId: string;
  timestamp: string;
}

export interface Product {
  feeType: string;
  startDate: string;
  currentMembershipFee: number;
  totalVisitFee: number;
  productRollup: string;
  bundleType: string;
  productName: string;
  account: string;
  vendorPartner: string;
  consultType: string;
  consultFees: number;
  currency: string;
  quantity: number;
  participantQuantity: number;
  status: string;
}

export interface SuggestedResult {
  data: {
    organizations: SuggestedResultObj[];
    groups: SuggestedResultObj[];
    opportunities: SuggestedResultObj[];
    contacts: SuggestedResultObj[];
  };
  metadata: metaData;
}

export interface SuggestedResultObj {
  id: string;
  name: string;
  type: string;
}

export interface OpportunityDetails {
  data: OpportunityDetail;
  metadata: metaData;
}
