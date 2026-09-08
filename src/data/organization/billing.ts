import { LABELS, TOOLTIP_MESSAGES } from "@/constants";
import { ContactRef } from "@/types";
import { Billing, SectionData } from "@/types/OrgView";
import { getInitials } from "@/utils";

const billingLabels = LABELS.billings;

export const renderBillingOverview = (
  data: Billing,
  metadata?: any,
): SectionData => {
  const billingOverview = data?.overview?.billingOverView ?? {};
  const financeCategory = data?.overview?.financeCategory ?? {};
  const billingAddress = data?.overview?.billingAddress ?? {};
  const additionalDetails = data?.overview?.additionalDetails ?? {};

  const billingOverviewMeta = metadata?.overview?.billingOverView ?? {};
  const financeCategoryMeta = metadata?.overview?.financeCategory ?? {};
  const billingAddressMeta = metadata?.overview?.billingAddress ?? {};
  const additionalDetailsMeta = metadata?.overview?.additionalDetails ?? {};

  return {
    "Billing overview": {
      col1: [
        {
          label: billingLabels.BILLING_ACCOUNT_GUID,
          value: billingOverview?.billingAccountGuid,
          fieldKey: "overview.billingOverView.billingAccountGuid",
          metadata: billingOverviewMeta?.billingAccountGuid,
        },
        {
          label: billingLabels.PAYMENT_TERMS,
          value: billingOverview?.paymentTerms,
          fieldKey: "overview.billingOverView.paymentTerms",
          metadata: billingOverviewMeta?.paymentTerms,
          lastChild: true,
          tooltipContent: TOOLTIP_MESSAGES.PAYMENT_TERMS
        },
      ],
      col2: [
        {
          label: billingLabels.BILLING_ENABLED_AT_ORG_LEVEL,
          value: billingOverview?.billingEnabledAtThisOrgLevel,
          format: "boolean",
          fieldKey: "overview.billingOverView.billingEnabledAtThisOrgLevel",
          metadata: billingOverviewMeta?.billingEnabledAtThisOrgLevel,
        },
      ],
    },
    "Finance category": {
      col1: [
        {
          label: billingLabels.FINANCE_CATEGORY,
          value: financeCategory?.financeCategory,
          fieldKey: "overview.financeCategory.financeCategory",
          metadata: financeCategoryMeta?.financeCategory,
          lastChild: true,
          tooltipContent: TOOLTIP_MESSAGES.FINANCE_CATEGORY,
        },
      ],
      col2: [
        {
          label: billingLabels.FINANCE_SUBCATEGORY,
          value: financeCategory?.financeSubcategory,
          fieldKey: "overview.financeCategory.financeSubcategory",
          metadata: financeCategoryMeta?.financeSubcategory,
          lastChild: true,
          tooltipContent: TOOLTIP_MESSAGES.FINANCE_SUBCATEGORY,
        },
      ],
    },
    "Billing address": {
      col1: [
        {
          label: billingLabels.BILLING_STREET,
          value: billingAddress?.billingStreet,
          fieldKey: "overview.billingAddress.billingStreet",
          metadata: billingAddressMeta?.billingStreet,
        },
        {
          label: billingLabels.BILLING_CITY,
          value: billingAddress?.billingCity,
          fieldKey: "overview.billingAddress.billingCity",
          metadata: billingAddressMeta?.billingCity,
        },
        {
          label: billingLabels.BILLING_STATE_PROVINCE,
          value: billingAddress?.billingStateOrProvince,
          fieldKey: "overview.billingAddress.billingStateOrProvince",
          metadata: billingAddressMeta?.billingStateOrProvince,
        },
        {
          label: billingLabels.BILLING_ZIP_POSTAL_CODE,
          value: billingAddress?.billingZipOrPostalCode,
          fieldKey: "overview.billingAddress.billingZipOrPostalCode",
          metadata: billingAddressMeta?.billingZipOrPostalCode,
          lastChild: true,
        },
      ],
      col2: [
        {
          label: billingLabels.BILLING_COUNTY,
          value: billingAddress?.billingCounty,
          fieldKey: "overview.billingAddress.billingCounty",
          metadata: billingAddressMeta?.billingCounty,
        },
        {
          label: billingLabels.BILLING_COUNTRY,
          value: billingAddress?.billingCountry,
          fieldKey: "overview.billingAddress.billingCountry",
          metadata: billingAddressMeta?.billingCountry,
        },
        {
          label: billingLabels.BILLING_ADDRESS_VERIFIED,
          value: billingAddress?.billingAddressVerified,
          fieldKey: "overview.billingAddress.billingAddressVerified",
          metadata: billingAddressMeta?.billingAddressVerified,
        },
      ],
    },
    "Additional details": {
      col1: [
        {
          label: billingLabels.NEW_PURCHASE_ORDER,
          value: additionalDetails?.newPurchaseOrder,
          fieldKey: "overview.additionalDetails.newPurchaseOrder",
          metadata: additionalDetailsMeta?.newPurchaseOrder,
          lastChild: true,
        },
      ],
      col2: [
        {
          label: billingLabels.RISK_CONTRACTS,
          value: additionalDetails?.riskContracts,
          format: "boolean",
          fieldKey: "overview.additionalDetails.riskContracts",
          metadata: additionalDetailsMeta?.riskContracts,
          lastChild: true,
        },
      ],
    },
  };
};

export const renderInvoiceDetails = (
  data: Billing,
  metadata?: any,
  onContactClick?: (contact: ContactRef) => void,
): SectionData => {
  const invoiceDetails = data?.invoiceDetail?.invoice ?? {};
  const invoiceContact = data?.invoiceDetail?.invoiceContact ?? {};

  const invoiceDetailsMeta = metadata?.invoiceDetail?.invoice ?? {};
  const invoiceContactMeta = metadata?.invoiceDetail?.invoiceContact ?? {};

  return {
    "Invoice details": {
      col1: [
        {
          label: billingLabels.INVOICE_NAME,
          value: invoiceDetails?.invoiceName,
          fieldKey: "invoiceDetail.invoice.invoiceName",
          metadata: invoiceDetailsMeta?.invoiceName,
        },
        {
          label: billingLabels.INVOICE_PERSON_TYPE,
          value: invoiceDetails?.invoicePersonType,
          fieldKey: "invoiceDetail.invoice.invoicePersonType",
          metadata: invoiceDetailsMeta?.invoicePersonType,
          tooltipContent: TOOLTIP_MESSAGES.INVOICE_PERSON_TYPE
        },
        {
          label: billingLabels.INVOICE_DELIVERY,
          value: invoiceDetails?.invoiceDelivery,
          fieldKey: "invoiceDetail.invoice.invoiceDelivery",
          metadata: invoiceDetailsMeta?.invoiceDelivery,
          lastChild: true,
          tooltipContent: TOOLTIP_MESSAGES.ORG_INVOICE_DELEIVERY_METHOD
        },
      ],
      col2: [
        {
          label: billingLabels.DOES_CLIENT_SELF_REMIT,
          value: invoiceDetails?.doesClientSelfRemitPayment,
          format: "boolean",
          fieldKey: "invoiceDetail.invoice.doesClientSelfRemitPayment",
          metadata: invoiceDetailsMeta?.doesClientSelfRemitPayment,
          tooltipContent: TOOLTIP_MESSAGES.CLIENT_SELF_REMIT_PAYMENT
        },
        {
          label: billingLabels.ELIGIBLE_DAY_OF_MONTH,
          value: invoiceDetails?.eligibleDayOfMonth,
          fieldKey: "invoiceDetail.invoice.eligibleDayOfMonth",
          metadata: invoiceDetailsMeta?.eligibleDayOfMonth,
          lastChild: true,
        },
      ],
    },
    "Invoice contact": {
      col1: [
        {
          label: billingLabels.PRIMARY_BILLING_CONTACT_TELEMED,
          value: invoiceContact?.primaryBillingContact,
          format: "person",
          personMeta: {
            name: invoiceContact?.primaryBillingContact?.displayName ?? "",
            initials: getInitials(invoiceContact?.primaryBillingContact?.displayName ?? ""),
          },
          onPersonClick: invoiceContact?.primaryBillingContact?.contactId && onContactClick
            ? () => onContactClick(invoiceContact.primaryBillingContact)
            : undefined,
          fieldKey: "invoiceDetail.invoiceContact.primaryBillingContact",
          metadata: invoiceContactMeta?.primaryBillingContact,
        },
        {
          label: billingLabels.SECONDARY_BILLING_CONTACT_TELEMED,
          value: invoiceContact?.secondaryBillingContact,
          format: "person",
          personMeta: {
            name: invoiceContact?.secondaryBillingContact?.displayName ?? "",
            initials: getInitials(invoiceContact?.secondaryBillingContact?.displayName ?? ""),
          },
          onPersonClick: invoiceContact?.secondaryBillingContact?.contactId && onContactClick
            ? () => onContactClick(invoiceContact.secondaryBillingContact)
            : undefined,
          fieldKey: "invoiceDetail.invoiceContact.secondaryBillingContact",
          metadata: invoiceContactMeta?.secondaryBillingContact,
        },
        {
          label: billingLabels.INVOICE_EMAIL,
          value: invoiceContact?.invoiceEmail,
          fieldKey: "invoiceDetail.invoiceContact.invoiceEmail",
          metadata: invoiceContactMeta?.invoiceEmail,
          lastChild: true,
        },
      ],
      col2: [
        {
          label: billingLabels.REGARDS_TO,
          value: invoiceContact?.regardsTo,
          fieldKey: "invoiceDetail.invoiceContact.regardsTo",
          metadata: invoiceContactMeta?.regardsTo,
        },
        {
          label: billingLabels.FIRST_NAME,
          value: invoiceContact?.firstName,
          fieldKey: "invoiceDetail.invoiceContact.firstName",
          metadata: invoiceContactMeta?.firstName,
        },
        {
          label: billingLabels.LAST_NAME,
          value: invoiceContact?.lastName,
          fieldKey: "invoiceDetail.invoiceContact.lastName",
          metadata: invoiceContactMeta?.lastName,
          lastChild: true,
        },
      ],
    },
  };
};
