import { ContactRef, metaCompoenent, metaDataType } from ".";
export interface AccountMappingEntry {
  accountName: string;
  accountGuid: string;
  linkageType: string;
  verificationStatus: string;
}

export interface contact {
  contactId: string;
  displayName: string;
}

export interface GeneralSettings {
  overview: {
    accountOverview: {
      organizationName: string;
      organizationId: string;
      nameLcrmTeladoc: string;
      nameLcrmLivongo: string;
      accountMapping?: {
        telemed: AccountMappingEntry;
        livongo: AccountMappingEntry;
      };
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
      isThisOrganizationTheEmployer: boolean;
      isThereABrokerOrReferralCompanyForThisOrganization: boolean;
    };
    accountTeam: {
      clientImplementationManager: ContactRef;
      salesAgent: ContactRef;
      clientOperationsManager: ContactRef;
      clientManagers: ContactRef;
    };
    clientTeam: {
      primaryDailyContact: ContactRef;
      primaryBillingContact: ContactRef;
      secondaryBillingContact: ContactRef;
    };
    accountDetails: {
      numberOfEmployees: number;
      coveredLives: number;
      unionPopulation: boolean;
      orgHierarchyId: string;
      billingOrgOfTheInvoiceRecipient: string;
      externalPlanSponsorID: string;
      externalMarketSegment: string;
    };
    address: {
      addressline1: string;
      addressline2: string;
      city: string;
      state: string;
      postal: string;
      country: string;
      phoneNumber: string;
    };
    primaryDailyContact: {
      firstName: string;
      lastName: string;
      accountName: string;
      phone: string;
      email: string;
      contactStatus: string;
      contactRole: string;
      mailingStreet: string;
      mailingCity: string;
      mailingCounty: string;
      mailingStateOrProvince: string;
      mailingZipOrPostalCode: string;
      mailingCountry: string;
      marketingSiteActiveUserForTelemedPrograms: boolean;
    };
    vendorPointSolutions: VendorPointSolution[];
  };
  permissions: {
    groupPermissions: {
      sendMemberResolutionLetter: boolean;
      sendProblemMemberLetter: boolean;
      sendUtilizationLetter: boolean;
      sendFraudWasteAndAbuseTermLetter: boolean;
    };
    memberAccessPermissions: {
      sendCcrToPcp: boolean;
      allowAuthorizedConsenters: boolean;
      allowManageSubscriptions: boolean;
      disablePatientExcuseNote: boolean;
      cancelDependents: boolean;
      cancelPrimary: boolean;
    };
  };
  accountRelationships: AccountRelationshipDetail[];
  historicalDetails: {
    contractOps: ContractOps[];
    clientTags: ClientTags[];
  };
  updatedAt?: string; // ISO date string
  files: File[];
}

export interface ContractOps {
  contractOpsOwner: string;
  contractOpsStage: string;
  coPoConfigurationTeamStatus: string;
  contract: string;
  originalContract: string;
  currentContractID: string;
  clientTagAssignmentID: string;
}

export interface AccountRelationship {
  accountRelationships: AccountRelationshipDetail[];
  brokerConfiguration: {
    hasBroker: boolean;
    brokerFee: string;
    brokerContact: string;
    brokerFlatRate: string;
    brokerPercentage: string;
    compositeKey: string;
    brokerLocationId: string;
    brokerLocationName: string;
    chronicCareBrokerFlatRate: string;
    chronicCareBrokerPercentage: string;
  };
}

export interface VendorPointSolution {
  vendorPoint: string;
  category: string;
  effectiveStartDate: string;
  phoneNumber: string;
  website: string;
  description: string;
}

export interface ClientTags {
  clientTag: string;
  clientTagAssignmentId: string;
}

export interface File {
  title: string;
  owner: string;
  lastModified: string;
  size: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  totalResults: number;
  totalPages: number;
  hasMore: boolean;
  entityCounts?: Record<string, unknown>;
}

export interface EgrMapping {
  groupObjectId: string,
  id?: string,
  groupName: string,
  legacyGroupId: string,
  groupId: string,
  sourceId: string,
  externalGroupType: string,
  stateRestrictions: string,
  effectiveStartDate: string,
  effectiveEndDate: string | null,
  payer: string,
  iteration?: string,
  reason?: string,
  trigger?: string,
  updatedBy?: string,
  updatedAt?: string,
}

export interface AgrMapping {
  groupObjectId: string,
  id?: string,
  groupName: string,
  legacyGroupId: number,
  groupId: number,
  sourceId: string,
  effectiveStartDate: string,
  effectiveEndDate: string | null,
  agsMapName: string,
  agsMapId: number,
  iteration?: string,
  reason?: string,
  trigger?: string,
  updatedBy?: string,
  updatedAt?: string,
}

export interface MarketingSiteUserContact {
  id: string;
  contactId: string;
  contactReferenceId?: string;
  displayName: string;
  marketingSiteUserEnabled?: boolean;
}

export interface MarketingSiteUserSaveContact {
  contactReferenceId: string;
  contactId: string;
  displayName: string;
  marketingSiteUserEnabled: boolean;
}

export interface MarketingDetailsContacts {
  marketingSiteUserTelemed?: MarketingSiteUserContact[] | null;
}

export interface Marketing {
  details: {
    printSettings: PrintSettings;
    primaryMarketingContact: {
      primaryMarketingContact: ContactRef;
    }
    contacts?: MarketingDetailsContacts;
  };
  ccm: {
    enrollmentCommunicationsSurvey: CCM[];
  };
  teleMedicine: {
    marketingPreferences: Telemedcines;
  };
  updatedAt?: string;
}

export interface PrintSettings {
  printPhone: string;
  printUrl: string;
  webUrl: string;
}

export interface CCM {
  enrollmentCommunicationsSurveyName: string;
  enrollmentCommunicationsSurveyType: string;
  surveyStatus: string;
  surveyStatusUpdatedDate: string; // ISO date string
}

export interface Telemedcines {
  directMailOptIn: boolean;
  incentiveOptIn: boolean;
  emailOptIn: boolean;
  outboundCallsOptIn: boolean;
  textOptIn: boolean;
}

export interface Reporting {
  reporting: {
    reportSettings: ReportSettings;
    reportRecipient: ReportRecipient[];
  }[];
  updatedAt?: string;
}

export interface ReportSettings {
  reportType: string;
  reportVersion: string;
  reportSorting: string;
  emailContentVersion: string;
  deliveryFrequency: string;
  reportEffectiveStartDate: string; // ISO date string
  reportEffectiveEndDate: string; // ISO date string
  reportTemplate: string;
}

export interface ReportRecipient {
  emailRecipient: string;
  emailAddress: string;
}

export interface AccountRelationshipDetail {
  commissionName?: string;
  locationName?: string;
  locationId?: string;
  isBrokerActive: boolean;
  salesforceId: string;
  accountRelationshipName: string;
  partnerAccount: string;
  partnerRelationshipsToTeladoc: string;
  partnerRelationshipsType: string;
  servicingContractType: string;
  clientAccount: string;
  clientAccountId: string;
  startDate: string;
  endDate: string;
  contractOverview: string;
  hasBroker: boolean;
  brokerFee: string;
  brokerContact: string;
  brokerFlatRate: string;
  brokerPercentage: string;
  compositeKey: string;
  brokerLocationId: string;
  brokerLocationName: string;
  chronicCareBrokerFlatRate: string;
  chronicCareBrokerPercentage: string;
  note: string;
  commissionVariants: commissions[];
  brokerLocationDetails: Location[];
  effectiveStartDate: string;
  effectiveEndDate: string;
}

export interface Location {
  locationName: string;
  locationId: string;
  taxId: string;
  taxIdentifierType: string;
  attentionDepartment: string;
  remitFlag: boolean;
  remitToLocation: string;
  remitToName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  contactEmail: string;
  contactPhone: string;
  effectiveStartDate: string;
  effectiveEndDate: string;
  note: string;
}

export interface commissions {
  commissionName: string;
  standardCommission: boolean;
  commisionFlag: boolean;
}

export interface Opportunity {
  opportunityName: string;
  opportunityGuid: string;
  accountName: string;
  accountGuid: string;
  contractPath: string;
  contractingAccount: string;
  revenueEffectiveDate: string;
  type: string;
  subType: string;
  subTypeDetail: string;
  clientLineOfBusiness: string;
  organizationName: string;
  products: Product[];
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

export interface EligibilityDetailsContacts {
  eligibilityContact?: ContactRef;
}

export interface Eligibility {
  overview?: {
    contacts?: EligibilityDetailsContacts;
  };
  updatedAt?: string;
}

export interface Billing {
  overview: {
    billingOverView: {
      billingAccountGuid: string;
      billingEnabledAtThisOrgLevel: boolean;
      paymentTerms: string;
    };
    financeCategory: {
      financeCategory: string;
      financeSubcategory: string;
    };
    billingAddress: {
      billingStreet: string;
      billingCity: string;
      billingStateOrProvince: string;
      billingZipOrPostalCode: string;
      billingCounty: string;
      billingCountry: string;
      billingAddressVerified: string;
      billingAddress: string;
    };
    additionalDetails: {
      newPurchaseOrder: string;
      riskContracts: boolean;
    };
    roi: {
      clientExpectsRoi: boolean;
      requiredDataForRoi: boolean;
    };
  };
  invoiceDetail: {
    invoice: {
      invoiceName: string;
      invoiceDelivery: string;
      invoiceDelivery2: string;
      doesClientSelfRemitPayment: boolean;
      eligibleDayOfMonth: number;
      invoicePersonType: string;
    };
    invoiceContact: {
      regardsTo: string;
      invoiceEmail: string;
      firstName: string;
      lastName: string;
      primaryBillingContact: ContactRef;
      secondaryBillingContact: ContactRef;
    };
  };
  updatedAt?: string; // ISO date string
}
export type SectionData = Record<string, Record<string, DisplayRowProps[]>>;
export type AccountRelationshipSectionData = Record<
  string,
  {
    brokerType: string;
    rows: Record<string, DisplayRowProps[]>;
    titleFieldKey?: string;
    titleMetadata?: any;
  }
>;

export interface FieldMetadata {
  value: any;
  editable: boolean;
  uiComponentType: metaCompoenent
  dataType: metaDataType
  maxLength?: number | null;
  required?: boolean;
  placeholder?: string;
  /** Dropdown options from API; when present used to build options (label and value = each string). Null when not dropdown. */
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
  format?: "text" | "date" | "boolean" | "person" | "img" | "link" | "contact" | "html" | "navigate" | "currency" | "accountLink";
  tooltipContent?: string;
  tooltipContentForContact?: Record<string, any> | null; // eslint-disable-line @typescript-eslint/no-explicit-any
  personMeta?: {
    name: string;
    initials?: string;
  };
  lastChild?: boolean;
  metadata?: FieldMetadata
  fieldKey?: string;
  onEdit?: () => void;
  onVerify?: () => void;
  onPersonClick?: () => void;
}
