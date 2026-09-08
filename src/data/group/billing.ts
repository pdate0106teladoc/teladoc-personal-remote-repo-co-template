import { LABELS } from "@/constants";
import { Billing, SectionData } from "@/types/GrpView";

export const renderBillingOverview = (data: Billing, metadata?: any): SectionData => {
    const groupBillingSettings = data?.overview?.groupBillingSettings;
    const readOnly = data?.overview?.readOnly;

    const groupBillingSettingsMeta = metadata?.overview?.groupBillingSettings ?? {};
    const readOnlyMeta = metadata?.overview?.readOnly ?? {};

    return {
        "Group billing setting": {
            col1: [
                {
                    label: LABELS.grpBilling.LABEL_MEMBERSHIP_FEE_TYPE,
                    value: groupBillingSettings?.membershipFeeType,
                    fieldKey: "overview.groupBillingSettings.membershipFeeType",
                    metadata: groupBillingSettingsMeta?.membershipFeeType,
                },
                {
                    label: LABELS.grpBilling.LABEL_CONSULT_BILLING_METHOD,
                    value: groupBillingSettings?.consultBillingMethod,
                    fieldKey: "overview.groupBillingSettings.consultBillingMethod",
                    metadata: groupBillingSettingsMeta?.consultBillingMethod,
                },
                {
                    label: LABELS.grpBilling.LABEL_BILL_TO,
                    value: groupBillingSettings?.billTo,
                    fieldKey: "overview.groupBillingSettings.billTo",
                    metadata: groupBillingSettingsMeta?.billTo,
                },
                {
                    label: LABELS.grpBilling.LABEL_BILL_TO_ACCOUNT,
                    value: groupBillingSettings?.billToAccount,
                    fieldKey: "overview.groupBillingSettings.billToAccount",
                    metadata: groupBillingSettingsMeta?.billToAccount,
                },
                {
                    label: LABELS.grpBilling.LABEL_BILL_TO_ACCOUNT_GUID,
                    value: groupBillingSettings?.billToAccountGuid,
                    fieldKey: "overview.groupBillingSettings.billToAccountGuid",
                    metadata: groupBillingSettingsMeta?.billToAccountGuid,
                    lastChild: true,
                },
            ],
            col2: [
                {
                    label: LABELS.grpBilling.LABEL_PAYERS,
                    value: Array.isArray(groupBillingSettings?.payers) ? groupBillingSettings?.payers.join(", ") : groupBillingSettings?.payers,
                    fieldKey: "overview.groupBillingSettings.payers",
                    metadata: groupBillingSettingsMeta?.payers,
                },
                {
                    label: LABELS.grpBilling.LABEL_TELADOC_TO_REFUND_MEMBERS,
                    value: groupBillingSettings?.teladocToRefundMembers,
                    format: "boolean",
                    fieldKey: "overview.groupBillingSettings.teladocToRefundMembers",
                    metadata: groupBillingSettingsMeta?.teladocToRefundMembers,
                },
                {
                    label: LABELS.grpBilling.LABEL_CONSULTS_INCLUDED,
                    value: groupBillingSettings?.consultsIncluded,
                    format: "boolean",
                    fieldKey: "overview.groupBillingSettings.consultsIncluded",
                    metadata: groupBillingSettingsMeta?.consultsIncluded,
                },
                {
                    label: LABELS.grpBilling.LABEL_INCLUDE_CCM_PEPM_PRODUCT,
                    value: groupBillingSettings?.includeCCMPEPMProduct,
                    fieldKey: "overview.groupBillingSettings.includeCCMPEPMProduct",
                    metadata: groupBillingSettingsMeta?.includeCCMPEPMProduct,
                    lastChild: true,
                },
            ],
        },
        "Read-only": {
            col1: [
                {
                    label: LABELS.grpBilling.LABEL_PURCHASE_ORDER_NUMBER,
                    value: readOnly?.purchaseOrderNumber,
                    fieldKey: "overview.readOnly.purchaseOrderNumber",
                    metadata: readOnlyMeta?.purchaseOrderNumber,
                    lastChild: true,
                },
            ],
            col2: [
                {
                    label: LABELS.grpBilling.LABEL_PURCHASE_ORDER_REQUIRED,
                    value: readOnly?.purchaseOrderRequired,
                    fieldKey: "overview.readOnly.purchaseOrderRequired",
                    metadata: readOnlyMeta?.purchaseOrderRequired,
                    lastChild: true,
                },
            ],
        },
    };
};

export const renderBillingCCM = (data: Billing, metadata?: any): SectionData => {
    const groupBillingDetails = data?.ccm?.groupBillingDetails;
    const contractDetails = data?.ccm?.contractDetails;
    const lapsedUserDetails = data?.ccm?.lapsedUserDetails;

    const groupBillingDetailsMeta = metadata?.ccm?.groupBillingDetails ?? {};
    const contractDetailsMeta = metadata?.ccm?.contractDetails ?? {};
    const lapsedUserDetailsMeta = metadata?.ccm?.lapsedUserDetails ?? {};

    return {
        "CCM billing details": {
            col1: [
                {
                    label: LABELS.grpBilling.LABEL_BILLING_PARTNER,
                    value: groupBillingDetails?.billingPartner,
                    fieldKey: "ccm.groupBillingDetails.billingPartner",
                    metadata: groupBillingDetailsMeta?.billingPartner,
                },
                {
                    label: LABELS.grpBilling.LABEL_BILLING_METHOD,
                    value: groupBillingDetails?.billingMethod,
                    fieldKey: "ccm.groupBillingDetails.billingMethod",
                    metadata: groupBillingDetailsMeta?.billingMethod,
                },
                {
                    label: LABELS.grpBilling.LABEL_BILLING_POINT_OF_CONTACT,
                    value: groupBillingDetails?.billingPointOfContact,
                    fieldKey: "ccm.groupBillingDetails.billingPointOfContact",
                    metadata: groupBillingDetailsMeta?.billingPointOfContact,
                },
                {
                    label: LABELS.grpBilling.LABEL_HIPAA_COVERED_ENTITY,
                    value: groupBillingDetails?.hipaaCoveredEntity,
                    fieldKey: "ccm.groupBillingDetails.hipaaCoveredEntity",
                    metadata: groupBillingDetailsMeta?.hipaaCoveredEntity,
                },
                {
                    label: LABELS.grpBilling.LABEL_DETAILED_INVOICE,
                    value: groupBillingDetails?.detailedInvoice,
                    fieldKey: "ccm.groupBillingDetails.detailedInvoice",
                    metadata: groupBillingDetailsMeta?.detailedInvoice,
                },
                {
                    label: LABELS.grpBilling.LABEL_DETAILED_INVOICE_RECIPIENTS,
                    value: groupBillingDetails?.detailedInvoiceRecipients,
                    fieldKey: "ccm.groupBillingDetails.detailedInvoiceRecipients",
                    metadata: groupBillingDetailsMeta?.detailedInvoiceRecipients,
                },
                {
                    label: LABELS.grpBilling.LABEL_DETAILED_INVOICE_TAGS,
                    value: groupBillingDetails?.detailedInvoiceTags,
                    fieldKey: "ccm.groupBillingDetails.detailedInvoiceTags",
                    metadata: groupBillingDetailsMeta?.detailedInvoiceTags,
                },
                {
                    label: LABELS.grpBilling.LABEL_BILLING_ADDRESS,
                    value: groupBillingDetails?.billingAddress,
                    fieldKey: "ccm.groupBillingDetails.billingAddress",
                    metadata: groupBillingDetailsMeta?.billingAddress,
                },
                {
                    label: LABELS.grpBilling.LABEL_PAYMENT_TERMS,
                    value: groupBillingDetails?.paymentTerms,
                    fieldKey: "ccm.groupBillingDetails.paymentTerms",
                    metadata: groupBillingDetailsMeta?.paymentTerms,
                },
                {
                    label: LABELS.grpBilling.LABEL_PRICING_MODEL,
                    value: groupBillingDetails?.pricingModel,
                    fieldKey: "ccm.groupBillingDetails.pricingModel",
                    metadata: groupBillingDetailsMeta?.pricingModel,
                    lastChild: true,
                },
            ],
            col2: [
                {
                    label: LABELS.grpBilling.LABEL_BUNDLED_PRICING_DISCOUNT,
                    value: groupBillingDetails?.bundledPricingDiscount,
                    fieldKey: "ccm.groupBillingDetails.bundledPricingDiscount",
                    metadata: groupBillingDetailsMeta?.bundledPricingDiscount,
                },
                {
                    label: LABELS.grpBilling.LABEL_PRORATED_ENROLLMENT,
                    value: groupBillingDetails?.proratedEnrollment,
                    fieldKey: "ccm.groupBillingDetails.proratedEnrollment",
                    metadata: groupBillingDetailsMeta?.proratedEnrollment,
                },
                {
                    label: LABELS.grpBilling.LABEL_FAST_START_CREDIT_OFFERED,
                    value: groupBillingDetails?.fastStartCreditOffered,
                    format: "boolean",
                    fieldKey: "ccm.groupBillingDetails.fastStartCreditOffered",
                    metadata: groupBillingDetailsMeta?.fastStartCreditOffered,
                },
                {
                    label: LABELS.grpBilling.LABEL_FAST_START_CREDIT_TYPE,
                    value: groupBillingDetails?.fastStartCreditType,
                    fieldKey: "ccm.groupBillingDetails.fastStartCreditType",
                    metadata: groupBillingDetailsMeta?.fastStartCreditType,
                },
                {
                    label: LABELS.grpBilling.LABEL_FAST_START_PARTICIPATION_RATE,
                    value: groupBillingDetails?.fastStartParticipationRate,
                    format: "percentage",
                    fieldKey: "ccm.groupBillingDetails.fastStartParticipationRate",
                    metadata: groupBillingDetailsMeta?.fastStartParticipationRate,
                },
                {
                    label: LABELS.grpBilling.LABEL_FAST_START_LAUNCH_DATE,
                    value: groupBillingDetails?.fastStartLaunchDate,
                    format: "date",
                    fieldKey: "ccm.groupBillingDetails.fastStartLaunchDate",
                    metadata: groupBillingDetailsMeta?.fastStartLaunchDate,
                },
                {
                    label: LABELS.grpBilling.LABEL_FAST_START_CLOSE_DATE,
                    value: groupBillingDetails?.fastStartCloseDate,
                    format: "date",
                    fieldKey: "ccm.groupBillingDetails.fastStartCloseDate",
                    metadata: groupBillingDetailsMeta?.fastStartCloseDate,
                },
                {
                    label: LABELS.grpBilling.LABEL_FAST_START_CUSTOM,
                    value: groupBillingDetails?.fastStartCustom,
                    fieldKey: "ccm.groupBillingDetails.fastStartCustom",
                    metadata: groupBillingDetailsMeta?.fastStartCustom,
                },
                {
                    label: LABELS.billings.CLIENT_EXPECTS_ROI,
                    value: groupBillingDetails?.clientExpectsRoi,
                    fieldKey: "ccm.groupBillingDetails.clientExpectsRoi",
                    metadata: groupBillingDetailsMeta?.clientExpectsRoi,
                },
                {
                    label: LABELS.billings.REQUIRED_DATA_FOR_ROI,
                    value: groupBillingDetails?.requiredDataForRoi,
                    fieldKey: "ccm.groupBillingDetails.requiredDataForRoi",
                    metadata: groupBillingDetailsMeta?.requiredDataForRoi,
                    lastChild: true,
                }
            ],
        },
        "Contract details": {
            col1: [
                {
                    label: LABELS.grpBilling.LABEL_CONTRACT_TYPE,
                    value: contractDetails?.contractType,
                    fieldKey: "ccm.contractDetails.contractType",
                    metadata: contractDetailsMeta?.contractType,
                },
                {
                    label: LABELS.grpBilling.LABEL_LEGAL_NAME,
                    value: contractDetails?.legalName,
                    fieldKey: "ccm.contractDetails.legalName",
                    metadata: contractDetailsMeta?.legalName,
                },
                {
                    label: LABELS.grpBilling.LABEL_CONTRACT_EFFECTIVE_DATE,
                    value: contractDetails?.contractEffectiveDate,
                    format: "date",
                    fieldKey: "ccm.contractDetails.contractEffectiveDate",
                    metadata: contractDetailsMeta?.contractEffectiveDate,
                },
                {
                    label: LABELS.grpBilling.LABEL_CONTRACT_TERMINATION_DATE,
                    value: contractDetails?.contractTerminationDate,
                    format: "date",
                    fieldKey: "ccm.contractDetails.contractTerminationDate",
                    metadata: contractDetailsMeta?.contractTerminationDate,
                },
                {
                    label: LABELS.grpBilling.LABEL_BAA_SIGNED,
                    value: contractDetails?.baaSigned,
                    fieldKey: "ccm.contractDetails.baaSigned",
                    metadata: contractDetailsMeta?.baaSigned,
                },
                {
                    label: LABELS.grpBilling.LABEL_MARKETING_AND_DOPS_REQUIREMENTS,
                    value: contractDetails?.marketingAndDopsRequirements,
                    format: "boolean",
                    fieldKey: "ccm.contractDetails.marketingAndDopsRequirements",
                    metadata: contractDetailsMeta?.marketingAndDopsRequirements,
                },
                {
                    label: LABELS.grpBilling.LABEL_ACCOUNT_HAS_SLAS,
                    value: contractDetails?.accountHasSlas,
                    format: "boolean",
                    fieldKey: "ccm.contractDetails.accountHasSlas",
                    metadata: contractDetailsMeta?.accountHasSlas,
                },
                {
                    label: LABELS.grpBilling.LABEL_SLA_DETAILS,
                    value: contractDetails?.slaDetails,
                    lastChild: true,
                    format: "html",
                    fieldKey: "ccm.contractDetails.slaDetails",
                    metadata: contractDetailsMeta?.slaDetails,
                },
            ],
            col2: [
                {
                    label: LABELS.grpBilling.LABEL_DAYS_NOTICE_FOR_TERMINATION,
                    value: contractDetails?.daysNoticeForTermination,
                    fieldKey: "ccm.contractDetails.daysNoticeForTermination",
                    metadata: contractDetailsMeta?.daysNoticeForTermination,
                },
                {
                    label: LABELS.grpBilling.LABEL_TERMINATION_FOR_CONVENIENCE,
                    value: contractDetails?.terminationForConvenience,
                    fieldKey: "ccm.contractDetails.terminationForConvenience",
                    metadata: contractDetailsMeta?.terminationForConvenience,
                },
                {
                    label: LABELS.grpBilling.LABEL_DAYS_NOTICE_FOR_TERM_FOR_CONVENIENCE,
                    value: contractDetails?.daysNoticeForTermForConvenience,
                    fieldKey: "ccm.contractDetails.daysNoticeForTermForConvenience",
                    metadata: contractDetailsMeta?.daysNoticeForTermForConvenience,
                },
                {
                    label: LABELS.grpBilling.LABEL_BILL_EARLY_TERMINATION_THROUGH_CLAIMS,
                    value: contractDetails?.billEarlyTerminationThroughClaims,
                    fieldKey: "ccm.contractDetails.billEarlyTerminationThroughClaims",
                    metadata: contractDetailsMeta?.billEarlyTerminationThroughClaims,
                },
                {
                    label: LABELS.grpBilling.LABEL_CUSTOMER_SIGNED_DATE,
                    value: contractDetails?.customerSignedDate,
                    format: "date",
                    fieldKey: "ccm.contractDetails.customerSignedDate",
                    metadata: contractDetailsMeta?.customerSignedDate,
                },
                {
                    label: LABELS.grpBilling.LABEL_COMPANY_SIGNED_DATE,
                    value: contractDetails?.companySignedDate,
                    format: "date",
                    fieldKey: "ccm.contractDetails.companySignedDate",
                    metadata: contractDetailsMeta?.companySignedDate,
                },
                {
                    label: LABELS.grpBilling.LABEL_UNIQUE_CONTRACT_TERMS,
                    value: contractDetails?.uniqueContractTerms,
                    lastChild: true,
                    format: "html",
                    fieldKey: "ccm.contractDetails.uniqueContractTerms",
                    metadata: contractDetailsMeta?.uniqueContractTerms,
                },
            ],
        },
        "Lapsed user details": {
            col1: [
                {
                    label: LABELS.grpBilling.LABEL_IS_THERE_A_LAPSED_USER_CLAUSE,
                    value: lapsedUserDetails?.isThereALapsedUserClause,
                    format: "boolean",
                    fieldKey: "ccm.lapsedUserDetails.isThereALapsedUserClause",
                    metadata: lapsedUserDetailsMeta?.isThereALapsedUserClause,
                },
                {
                    label: LABELS.grpBilling.LABEL_LAPSED_CLAUSE_CLAIMS_DATA,
                    value: lapsedUserDetails?.lapsedClauseClaimsData,
                    format: "boolean",
                    fieldKey: "ccm.lapsedUserDetails.lapsedClauseClaimsData",
                    metadata: lapsedUserDetailsMeta?.lapsedClauseClaimsData,
                },
                {
                    label: LABELS.grpBilling.LABEL_LAPSED_CLAUSE_MULTI_CHANNEL_MARKETING,
                    value: lapsedUserDetails?.lapsedClauseMultiChannelMarketing,
                    format: "boolean",
                    fieldKey: "ccm.lapsedUserDetails.lapsedClauseMultiChannelMarketing",
                    metadata: lapsedUserDetailsMeta?.lapsedClauseMultiChannelMarketing,
                    lastChild: true,
                },
            ],
            col2: [
                {
                    label: LABELS.grpBilling.LABEL_LAPSED_CLAUSE_USE_OF_INCENTIVES,
                    value: lapsedUserDetails?.lapsedClauseUseOfIncentives,
                    format: "boolean",
                    fieldKey: "ccm.lapsedUserDetails.lapsedClauseUseOfIncentives",
                    metadata: lapsedUserDetailsMeta?.lapsedClauseUseOfIncentives,
                },
                {
                    label: LABELS.grpBilling.LABEL_LAPSED_CLAUSE_OPTIMIZED_ENROLLMENT_PLAN,
                    value: lapsedUserDetails?.lapsedClauseOptimizedEnrollmentPlan,
                    format: "boolean",
                    fieldKey: "ccm.lapsedUserDetails.lapsedClauseOptimizedEnrollmentPlan",
                    metadata: lapsedUserDetailsMeta?.lapsedClauseOptimizedEnrollmentPlan,
                    lastChild: true,
                },
            ],
        },
    };
};
