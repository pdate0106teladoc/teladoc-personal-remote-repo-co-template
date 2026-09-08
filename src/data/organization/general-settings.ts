import { LABELS } from "@/constants";
import { ContactRef } from "@/types";
import {
  AccountRelationshipSectionData,
  GeneralSettings,
  SectionData,
} from "@/types/OrgView";
import { formatNumberWithCommas, getInitials, phoneFormat } from "@/utils";

const generalSettingsLabels = LABELS.generalSetting;

export const renderAccountRelationShipData = (
  data: GeneralSettings,
  metadata?: any,
): AccountRelationshipSectionData[] => {
  const accountRelationships = data?.accountRelationships || [];
  return accountRelationships.map((relationship, index) => {
    const isChronic = relationship.accountRelationshipName?.startsWith("R-");
    const relationshipMeta = metadata?.accountRelationships?.[index] ?? {};

    const col2Base: any[] = [
      {
        label: generalSettingsLabels.CLIENT_ACCOUNT,
        value: { value: relationship?.clientAccount, id: relationship.clientAccountId, isGrp: false },
        tooltipContent: `${!isChronic ? "Benefit Sponsor Account from LCRM-Teladoc" : ""}`,
        format: "navigate",
        fieldKey: `accountRelationships.${index}.clientAccount`,
        metadata: {
          ...relationshipMeta?.clientAccount,
          responseDataPath: "results",
          responseNameField: "account_name",
          responseIdField: "account_name",
        },
      },
      {
        label: generalSettingsLabels.START_DATE,
        value: relationship?.startDate,
        format: "date",
        fieldKey: `accountRelationships.${index}.startDate`,
        metadata: relationshipMeta?.startDate,
      },
      {
        label: generalSettingsLabels.END_DATE,
        value: relationship?.endDate,
        lastChild: !isChronic,
        format: "date",
        fieldKey: `accountRelationships.${index}.endDate`,
        metadata: relationshipMeta?.endDate,
      },
    ];

    if (isChronic) {
      col2Base.push({
        label: generalSettingsLabels.CONTRACT_OVERVIEW_ASSOCIATED_TO_PARTNER_RELATIONSHIP,
        value: relationship?.contractOverview,
        lastChild: true,
        fieldKey: `accountRelationships.${index}.contractOverview`,
        metadata: relationshipMeta?.contractOverview,
      });
    }

    return {
      [relationship.partnerAccount]: {
        brokerType: relationship.accountRelationshipName ?? "REL-000000",
        titleFieldKey: `accountRelationships.${index}.partnerAccount`,
        titleMetadata: relationshipMeta?.partnerAccount,
        rows: {
          col1: [
            {
              label: generalSettingsLabels.PARTNER_RELATIONSHIP_TO_TELADOC,
              value: relationship?.partnerRelationshipsToTeladoc,
              fieldKey: `accountRelationships.${index}.partnerRelationshipsToTeladoc`,
              metadata: relationshipMeta?.partnerRelationshipsToTeladoc,
            },
            {
              label: generalSettingsLabels.PARTNER_RELATIONSHIP_TYPE,
              value: relationship?.partnerRelationshipsType,
              fieldKey: `accountRelationships.${index}.partnerRelationshipsType`,
              metadata: relationshipMeta?.partnerRelationshipsType,
            },
            {
              label: generalSettingsLabels.SERVICING_CONTRACT_TYPE,
              value: relationship?.servicingContractType,
              fieldKey: `accountRelationships.${index}.servicingContractType`,
              metadata: relationshipMeta?.servicingContractType,
            },
            {
              label: generalSettingsLabels.COMPOSITE_KEY,
              value: relationship?.compositeKey,
              lastChild: true,
              fieldKey: `accountRelationships.${index}.compositeKey`,
              metadata: relationshipMeta?.compositeKey,
            },
          ],
          col2: col2Base,
        }
      }
    };
  });
};

export const renderBrokerCommisionData = (
  data: GeneralSettings['accountRelationships']
): AccountRelationshipSectionData[] => {
  const brokerConfiguration = data || [];
  return brokerConfiguration.map((relationship) => ({
    [relationship.partnerAccount]: {
      brokerType: relationship.partnerRelationshipsToTeladoc,
      rows: {
        col1: [
          { label: generalSettingsLabels.COMMISION_NAME, value: relationship?.commissionName },
          { label: generalSettingsLabels.BROKER_FLAT_RATE, value: relationship?.brokerFlatRate, format: "currency" },
          { label: generalSettingsLabels.BROKER_PERCENTAGE, value: relationship?.brokerPercentage },
          { label: generalSettingsLabels.CHRONIC_CARE_BROKER_FLAT_RATE, value: relationship?.chronicCareBrokerFlatRate, format: "currency" },
          { label: generalSettingsLabels.CHRONIC_CARE_BROKER_PERCENTAGE, value: relationship?.chronicCareBrokerPercentage, lastChild: true },
        ],
        col2: [
          { label: generalSettingsLabels.SALESFORCE_ID, value: relationship?.salesforceId },
          { label: generalSettingsLabels.COMPOSITE_KEY, value: relationship?.compositeKey },
          { label: generalSettingsLabels.LOCATION_ID, value: relationship?.locationId },
          { label: generalSettingsLabels.LOCATION_NAME, value: relationship?.locationName, lastChild: true }
        ],
      }
    }
  }));
};

export const renderPermissions = (data: GeneralSettings, metadata?: any): SectionData => {
  const groupPermissions = data?.permissions?.groupPermissions;
  const memberAccessPermissions = data?.permissions?.memberAccessPermissions;

  const groupPermissionsMeta = metadata?.permissions?.groupPermissions ?? {};
  const memberAccessPermissionsMeta = metadata?.permissions?.memberAccessPermissions ?? {};

  return {
    "Group permissions": {
      col1: [
        {
          label: generalSettingsLabels.SEND_MEMBER_RESOLUTION_LETTER,
          value: groupPermissions?.sendMemberResolutionLetter,
          format: "boolean",
          fieldKey: "permissions.groupPermissions.sendMemberResolutionLetter",
          metadata: groupPermissionsMeta?.sendMemberResolutionLetter,
        },
        {
          label: generalSettingsLabels.SEND_PROBLEM_MEMBER_LETTER,
          value: groupPermissions?.sendProblemMemberLetter,
          format: "boolean",
          fieldKey: "permissions.groupPermissions.sendProblemMemberLetter",
          metadata: groupPermissionsMeta?.sendProblemMemberLetter,
          lastChild: true,
        },
      ],
      col2: [
        {
          label: generalSettingsLabels.SEND_UTILIZATION_LETTER,
          value: groupPermissions?.sendUtilizationLetter,
          format: "boolean",
          fieldKey: "permissions.groupPermissions.sendUtilizationLetter",
          metadata: groupPermissionsMeta?.sendUtilizationLetter,
        },
        {
          label: generalSettingsLabels.SEND_FRAUD_WASTE_AND_ABUSE_TERM_LETTER,
          value: groupPermissions?.sendFraudWasteAndAbuseTermLetter,
          format: "boolean",
          fieldKey: "permissions.groupPermissions.sendFraudWasteAndAbuseTermLetter",
          metadata: groupPermissionsMeta?.sendFraudWasteAndAbuseTermLetter,
          lastChild: true,
        },
      ],
    },
    "Member access permissions": {
      col1: [
        {
          label: generalSettingsLabels.SEND_CCR_TO_PCP,
          value: memberAccessPermissions?.sendCcrToPcp,
          format: "boolean",
          fieldKey: "permissions.memberAccessPermissions.sendCcrToPcp",
          metadata: memberAccessPermissionsMeta?.sendCcrToPcp,
        },
        {
          label: generalSettingsLabels.ALLOW_AUTHORIZED_CONSENTERS,
          value: memberAccessPermissions?.allowAuthorizedConsenters,
          format: "boolean",
          fieldKey: "permissions.memberAccessPermissions.allowAuthorizedConsenters",
          metadata: memberAccessPermissionsMeta?.allowAuthorizedConsenters,
        },
        {
          label: generalSettingsLabels.ALLOW_MANAGE_SUBSCRIPTIONS,
          value: memberAccessPermissions?.allowManageSubscriptions,
          format: "boolean",
          fieldKey: "permissions.memberAccessPermissions.allowManageSubscriptions",
          metadata: memberAccessPermissionsMeta?.allowManageSubscriptions,
        },
        {
          label: generalSettingsLabels.DISABLE_PATIENT_EXCUSE_NOTE,
          value: memberAccessPermissions?.disablePatientExcuseNote,
          format: "boolean",
          fieldKey: "permissions.memberAccessPermissions.disablePatientExcuseNote",
          metadata: memberAccessPermissionsMeta?.disablePatientExcuseNote,
          lastChild: true,
        },
      ],
      col2: [
        {
          label: generalSettingsLabels.CANCEL_DEPENDENTS,
          value: memberAccessPermissions?.cancelDependents,
          format: "boolean",
          fieldKey: "permissions.memberAccessPermissions.cancelDependents",
          metadata: memberAccessPermissionsMeta?.cancelDependents,
        },
        {
          label: generalSettingsLabels.CANCEL_PRIMARY,
          value: memberAccessPermissions?.cancelPrimary,
          format: "boolean",
          fieldKey: "permissions.memberAccessPermissions.cancelPrimary",
          metadata: memberAccessPermissionsMeta?.cancelPrimary,
        }
      ],
    },
  };
};

export const renderGeneralSettingOverview = (
  data: GeneralSettings,
  onEditTeladoc?: () => void,
  onEditLivongo?: () => void,
  onVerifyTeladoc?: () => void,
  onVerifyLivongo?: () => void,
  metadata?: any,
  onContactClick?: (contact: ContactRef) => void,
): SectionData => {
  const generalSettings = data?.overview?.accountOverview;
  const accountMapping = generalSettings?.accountMapping;
  const accountTeam = data?.overview?.accountTeam;
  const accountDetails = data?.overview?.accountDetails;
  const address = data?.overview?.address;

  const accountOverviewMeta = metadata?.overview?.accountOverview ?? {};
  const accountTeamMeta = metadata?.overview?.accountTeam ?? {};
  const clientTeamMeta = metadata?.overview?.clientTeam ?? {};
  const accountDetailsMeta = metadata?.overview?.accountDetails ?? {};
  const addressMeta = metadata?.overview?.address ?? {};
  const isEditMode = Boolean(metadata);
  const nameLcrmTeladocValue = isEditMode
    ? (generalSettings?.nameLcrmTeladoc ?? accountOverviewMeta?.nameLcrmTeladoc?.value)
    : accountMapping?.telemed
      ? {
          accountName: accountMapping.telemed.accountName,
          verificationStatus: accountMapping.telemed.verificationStatus,
          linkageType: accountMapping.telemed.linkageType,
        }
      : generalSettings?.nameLcrmTeladoc ?? null;
  const nameLcrmLivongoValue = isEditMode
    ? (
        generalSettings?.nameLcrmLivongo ??
        accountOverviewMeta?.nameLcrmLivongo?.value
      )
    : accountMapping?.livongo
      ? {
          accountName: accountMapping.livongo.accountName,
          verificationStatus: accountMapping.livongo.verificationStatus,
          linkageType: accountMapping.livongo.linkageType,
        }
      : (generalSettings?.nameLcrmLivongo ?? null);
  const nameLcrmTeladocFormat = !isEditMode && accountMapping?.telemed ? "accountLink" : "text";
  const nameLcrmLivongoFormat = !isEditMode && accountMapping?.livongo ? "accountLink" : "text";

  return {
    "Account overview": {
      col1: [
        {
          label: generalSettingsLabels.ORGANIZATION_NAME,
          value: generalSettings?.organizationName,
          fieldKey: "overview.accountOverview.organizationName",
          metadata: accountOverviewMeta?.organizationName,
        },
        {
          label: generalSettingsLabels.NAME_TELADOC,
          value: nameLcrmTeladocValue,
          format: nameLcrmTeladocFormat,
          onEdit: onEditTeladoc,
          onVerify: onVerifyTeladoc,
          fieldKey: "overview.accountOverview.nameLcrmTeladoc",
          metadata: accountOverviewMeta?.nameLcrmTeladoc,
        },
        {
          label: generalSettingsLabels.NAME_LIVONGO,
          value: nameLcrmLivongoValue,
          format: nameLcrmLivongoFormat,
          onEdit: onEditLivongo,
          onVerify: onVerifyLivongo,
          fieldKey: "overview.accountOverview.nameLcrmLivongo",
          metadata: accountOverviewMeta?.nameLcrmLivongo,
        },
        {
          label: generalSettingsLabels.FRIENDLY_ACCOUNT_NAME,
          value: generalSettings?.friendlyAccountName,
          fieldKey: "overview.accountOverview.friendlyAccountName",
          metadata: accountOverviewMeta?.friendlyAccountName,
        },
        {
          label: generalSettingsLabels.DOING_BUSINESS_AS,
          value: generalSettings?.doingBusinessAs,
          fieldKey: "overview.accountOverview.doingBusinessAs",
          metadata: accountOverviewMeta?.doingBusinessAs,
        },
        {
          label: generalSettingsLabels.PARENT_ACCOUNT,
          value: generalSettings?.parentAccount,
          fieldKey: "overview.accountOverview.parentAccount",
          metadata: {
            ...accountOverviewMeta?.parentAccount,
            responseDataPath: "results",
            responseNameField: "account_name",
            responseIdField: "account_name",
          }
        },
        {
          label: generalSettingsLabels.ACCOUNT_STATUS,
          value: generalSettings?.accountStatus,
          fieldKey: "overview.accountOverview.accountStatus",
          metadata: accountOverviewMeta?.accountStatus,
        },
        {
          label: generalSettingsLabels.BENEFIT_RESTRICTION_CODE,
          value: generalSettings?.benefitRestrictionCode,
          fieldKey: "overview.accountOverview.benefitRestrictionCode",
          metadata: accountOverviewMeta?.benefitRestrictionCode,
          lastChild: true,
        },
      ],
      col2: [
        {
          label: generalSettingsLabels.RECORD_TYPE,
          value: isEditMode
            ? (generalSettings?.recordType ??
              accountOverviewMeta?.recordType?.value)
            : generalSettings?.recordType,
          fieldKey: "overview.accountOverview.recordType",
          metadata: accountOverviewMeta?.recordType,
        },
        {
          label: generalSettingsLabels.CLIENT_TYPE,
          value: generalSettings?.clientType,
          fieldKey: "overview.accountOverview.clientType",
          metadata: accountOverviewMeta?.clientType,
        },
        {
          label: generalSettingsLabels.ACCOUNT_BUSINESS_TYPE,
          value: generalSettings?.accountBusinessType,
          fieldKey: "overview.accountOverview.accountBusinessType",
          metadata: accountOverviewMeta?.accountBusinessType,
        },
        {
          label: generalSettingsLabels.ACCOUNT_EFFECTIVE_START_DATE,
          value: generalSettings?.accountEffectiveStartDate,
          format: "date",
          fieldKey: "overview.accountOverview.accountEffectiveStartDate",
          metadata: accountOverviewMeta?.accountEffectiveStartDate,
        },
        {
          label: generalSettingsLabels.ACCOUNT_EFFECTIVE_END_DATE,
          value: generalSettings?.accountEffectiveEndDate,
          format: "date",
          fieldKey: "overview.accountOverview.accountEffectiveEndDate",
          metadata: accountOverviewMeta?.accountEffectiveEndDate,
        },
        {
          label: generalSettingsLabels.BUSINESS_REGION,
          value: generalSettings?.businessRegion,
          fieldKey: "overview.accountOverview.businessRegion",
          metadata: accountOverviewMeta?.businessRegion,
        },
        {
          label: generalSettingsLabels.IS_EMPLOYER,
          value: generalSettings?.isThisOrganizationTheEmployer,
          format: "boolean",
          fieldKey: "overview.accountOverview.isThisOrganizationTheEmployer",
          metadata: accountOverviewMeta?.isThisOrganizationTheEmployer,
        },
        {
          label: generalSettingsLabels.HAS_BROKER_OR_REFERRAL,
          value: generalSettings?.isThereABrokerOrReferralCompanyForThisOrganization,
          format: "boolean",
          fieldKey: "overview.accountOverview.isThereABrokerOrReferralCompanyForThisOrganization",
          metadata: accountOverviewMeta?.isThereABrokerOrReferralCompanyForThisOrganization,
          lastChild: true,
        },
      ],
    },
    "Account team": {
      col1: [
        {
          label: generalSettingsLabels.CLIENT_OPERATIONS_MANAGER,
          value: accountTeam?.clientOperationsManager,
          format: "person",
          fieldKey: "overview.accountTeam.clientOperationsManager",
          metadata: accountTeamMeta?.clientOperationsManager,
          personMeta: {
            name: accountTeam?.clientOperationsManager?.displayName ?? "",
            initials: getInitials(accountTeam?.clientOperationsManager?.displayName ?? ""),
          },
          onPersonClick: accountTeam?.clientOperationsManager?.contactId && onContactClick
            ? () => onContactClick(data.overview.accountTeam.clientOperationsManager)
            : undefined,
          lastChild: true,
        },
      ],
      col2: [
        {
          label: generalSettingsLabels.SALES_AGENT,
          value: accountTeam?.salesAgent,
          format: "person",
          personMeta: {
            name: accountTeam?.salesAgent?.displayName ?? "",
            initials: getInitials(accountTeam?.salesAgent?.displayName ?? ""),
          },
          onPersonClick: accountTeam?.salesAgent?.contactId && onContactClick
            ? () => onContactClick(data.overview.accountTeam.salesAgent)
            : undefined,
          fieldKey: "overview.accountTeam.salesAgent",
          metadata: accountTeamMeta?.salesAgent,
          lastChild: true,
        },
      ],
    },
    "Client team": {
      col1: [
        {
          label: generalSettingsLabels.PRIMARY_DAILY_CONTACT_LABEL,
          value: data?.overview?.clientTeam?.primaryDailyContact,
          format: "person",
          fieldKey: "overview.clientTeam.primaryDailyContact",
          metadata: clientTeamMeta?.primaryDailyContact,
          personMeta: {
            name: data?.overview?.clientTeam?.primaryDailyContact?.displayName ?? "",
            initials: getInitials(data?.overview?.clientTeam?.primaryDailyContact?.displayName ?? ""),
          },
          onPersonClick: data?.overview?.clientTeam?.primaryDailyContact?.contactId && onContactClick
            ? () => onContactClick(data.overview.clientTeam.primaryDailyContact)
            : undefined,
        },
        {
          label: generalSettingsLabels.PRIMARY_BILLING_CONTACT_LABEL,
          value: data?.overview?.clientTeam?.primaryBillingContact,
          format: "person",
          fieldKey: "overview.clientTeam.primaryBillingContact",
          metadata: clientTeamMeta?.primaryBillingContact,
          personMeta: {
            name: data?.overview?.clientTeam?.primaryBillingContact?.displayName ?? "",
            initials: getInitials(data?.overview?.clientTeam?.primaryBillingContact?.displayName ?? ""),
          },
          onPersonClick: data?.overview?.clientTeam?.primaryBillingContact?.contactId && onContactClick
            ? () => onContactClick(data.overview.clientTeam.primaryBillingContact)
            : undefined,
          lastChild: true,
        },
      ],
      col2: [
        {
          label: generalSettingsLabels.SECONDARY_BILLING_CONTACT_LABEL,
          value: data?.overview?.clientTeam?.secondaryBillingContact,
          format: "person",
          fieldKey: "overview.clientTeam.secondaryBillingContact",
          metadata: clientTeamMeta?.secondaryBillingContact,
          personMeta: {
            name: data?.overview?.clientTeam?.secondaryBillingContact?.displayName ?? "",
            initials: getInitials(data?.overview?.clientTeam?.secondaryBillingContact?.displayName ?? ""),
          },
          onPersonClick: data?.overview?.clientTeam?.secondaryBillingContact?.contactId && onContactClick
            ? () => onContactClick(data.overview.clientTeam.secondaryBillingContact)
            : undefined,
        },
      ],
    },

    "Account details": {
      col1: [
        {
          label: generalSettingsLabels.NUMBER_OF_EMPLOYEES,
          value: formatNumberWithCommas(accountDetails?.numberOfEmployees),
          fieldKey: "overview.accountDetails.numberOfEmployees",
          metadata: accountDetailsMeta?.numberOfEmployees,
        },
        {
          label: generalSettingsLabels.COVERED_LIVES,
          value: formatNumberWithCommas(accountDetails?.coveredLives),
          fieldKey: "overview.accountDetails.coveredLives",
          metadata: accountDetailsMeta?.coveredLives,
        },
        {
          label: generalSettingsLabels.UNION_POPULATION,
          value: accountDetails?.unionPopulation,
          format: "boolean",
          fieldKey: "overview.accountDetails.unionPopulation",
          metadata: accountDetailsMeta?.unionPopulation,
          lastChild: true,
        },
      ],
      col2: [
        {
          label: generalSettingsLabels.ORG_HIERARCHY_ID,
          value: accountDetails?.orgHierarchyId,
          fieldKey: "overview.accountDetails.orgHierarchyId",
          metadata: accountDetailsMeta?.orgHierarchyId,
        },
        {
          label: generalSettingsLabels.BILLING_ORG_OF_INVOICE_RECIPIENT,
          value: accountDetails?.billingOrgOfTheInvoiceRecipient,
          fieldKey: "overview.accountDetails.billingOrgOfTheInvoiceRecipient",
          metadata: accountDetailsMeta?.billingOrgOfTheInvoiceRecipient,
        },
      ],
    },
    "Address": {
      col1: [
        {
          label: generalSettingsLabels.ADDRESS_LINE_1,
          value: address?.addressline1,
          fieldKey: "overview.address.addressline1",
          metadata: addressMeta?.addressline1,
        },
        {
          label: generalSettingsLabels.ADDRESS_LINE_2,
          value: address?.addressline2,
          fieldKey: "overview.address.addressline2",
          metadata: addressMeta?.addressline2,
        },
        {
          label: generalSettingsLabels.CITY,
          value: address?.city,
          fieldKey: "overview.address.city",
          metadata: addressMeta?.city,
        },
        {
          label: generalSettingsLabels.STATE,
          value: address?.state,
          fieldKey: "overview.address.state",
          metadata: addressMeta?.state,
          lastChild: true,
        },
      ],
      col2: [
        {
          label: generalSettingsLabels.POSTAL,
          value: address?.postal,
          fieldKey: "overview.address.postal",
          metadata: addressMeta?.postal,
        },
        {
          label: generalSettingsLabels.COUNTRY,
          value: address?.country,
          fieldKey: "overview.address.country",
          metadata: addressMeta?.country,
        },
        {
          label: generalSettingsLabels.PHONE_NUMBER,
          value: phoneFormat(address?.phoneNumber),
          fieldKey: "overview.address.phoneNumber",
          metadata: addressMeta?.phoneNumber,
          lastChild: true,
        },
      ],
    },
  };
};
