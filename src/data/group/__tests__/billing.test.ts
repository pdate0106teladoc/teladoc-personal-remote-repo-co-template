import { describe, it, expect } from "vitest";
import { renderBillingOverview, renderBillingCCM } from "../billing";
import { LABELS } from "@/constants";
import { Billing } from "@/types/GrpView";

/** Recursively strips `fieldKey` and `metadata` so tests stay focused on business fields. */
function stripMetaFields(obj: any): any {
  if (Array.isArray(obj)) return obj.map(stripMetaFields);
  if (obj !== null && typeof obj === "object") {
    const { fieldKey: _fk, metadata: _md, ...rest } = obj;
    return Object.fromEntries(Object.entries(rest).map(([k, v]) => [k, stripMetaFields(v)]));
  }
  return obj;
}

describe("renderBillingOverview", () => {
  it("returns correct structure when all data is provided", () => {
    const mockData = {
      overview: {
        groupBillingSettings: {
          membershipFeeType: "Type A",
          consultBillingMethod: "Method B",
          billTo: "Account C",
          billToAccount: "Account D",
          billToAccountGuid: "GUID-123",
          payers: "Payer E",
          teladocToRefundMembers: true,
          consultsIncluded: true,
          includeCCMPEPMProduct: true,
        },
        readOnly: {
          purchaseOrderNumber: "PO-456",
          purchaseOrderRequired: true,
        },
      },
    } as any;

    const result = renderBillingOverview(mockData);

    expect(stripMetaFields(result)).toEqual({
      "Group billing setting": {
        col1: [
          {
            label: LABELS.grpBilling.LABEL_MEMBERSHIP_FEE_TYPE,
            value: "Type A",
          },
          {
            label: LABELS.grpBilling.LABEL_CONSULT_BILLING_METHOD,
            value: "Method B",
          },
          { label: LABELS.grpBilling.LABEL_BILL_TO, value: "Account C" },
          {
            label: LABELS.grpBilling.LABEL_BILL_TO_ACCOUNT,
            value: "Account D",
          },
          {
            label: LABELS.grpBilling.LABEL_BILL_TO_ACCOUNT_GUID,
            value: "GUID-123",
            lastChild: true,
          },
        ],
        col2: [
          { label: LABELS.grpBilling.LABEL_PAYERS, value: "Payer E" },
          {
            label: LABELS.grpBilling.LABEL_TELADOC_TO_REFUND_MEMBERS,
            value: true,
            format: "boolean",
          },
          { label: LABELS.grpBilling.LABEL_CONSULTS_INCLUDED, value: true, format: "boolean", },
          {
            label: LABELS.grpBilling.LABEL_INCLUDE_CCM_PEPM_PRODUCT,
            value: true,
            lastChild: true,
          },
        ],
      },
      "Read-only": {
        col1: [
          {
            label: LABELS.grpBilling.LABEL_PURCHASE_ORDER_NUMBER,
            value: "PO-456",
            lastChild: true,
          },
        ],
        col2: [
          {
            label: LABELS.grpBilling.LABEL_PURCHASE_ORDER_REQUIRED,
            value: true,
            lastChild: true,
          },
        ],
      },
    });
  });

  it("handles missing data gracefully", () => {
    const mockData = {
      overview: {
        groupBillingSettings: {},
        readOnly: {},
      },
    } as Billing;

    const result = renderBillingOverview(mockData);

    expect(stripMetaFields(result)).toEqual({
      "Group billing setting": {
        col1: [
          {
            label: LABELS.grpBilling.LABEL_MEMBERSHIP_FEE_TYPE,
            value: undefined,
          },
          {
            label: LABELS.grpBilling.LABEL_CONSULT_BILLING_METHOD,
            value: undefined,
          },
          { label: LABELS.grpBilling.LABEL_BILL_TO, value: undefined },
          { label: LABELS.grpBilling.LABEL_BILL_TO_ACCOUNT, value: undefined },
          {
            label: LABELS.grpBilling.LABEL_BILL_TO_ACCOUNT_GUID,
            value: undefined,
            lastChild: true,
          },
        ],
        col2: [
          { label: LABELS.grpBilling.LABEL_PAYERS, value: undefined },
          {
            label: LABELS.grpBilling.LABEL_TELADOC_TO_REFUND_MEMBERS,
            value: undefined,
            format: "boolean",
          },
          {
            label: LABELS.grpBilling.LABEL_CONSULTS_INCLUDED,
            value: undefined,
            format: "boolean",
          },
          {
            label: LABELS.grpBilling.LABEL_INCLUDE_CCM_PEPM_PRODUCT,
            value: undefined,
            lastChild: true,
          },
        ],
      },
      "Read-only": {
        col1: [
          {
            label: LABELS.grpBilling.LABEL_PURCHASE_ORDER_NUMBER,
            value: undefined,
            lastChild: true,
          },
        ],
        col2: [
          {
            label: LABELS.grpBilling.LABEL_PURCHASE_ORDER_REQUIRED,
            value: undefined,
            lastChild: true,
          },
        ],
      },
    });
  });

  it("returns empty structure when no data is provided", () => {
    const result = renderBillingOverview(undefined as any);

    expect(stripMetaFields(result)).toEqual({
      "Group billing setting": {
        col1: [
          {
            label: LABELS.grpBilling.LABEL_MEMBERSHIP_FEE_TYPE,
            value: undefined,
          },
          {
            label: LABELS.grpBilling.LABEL_CONSULT_BILLING_METHOD,
            value: undefined,
          },
          { label: LABELS.grpBilling.LABEL_BILL_TO, value: undefined },
          { label: LABELS.grpBilling.LABEL_BILL_TO_ACCOUNT, value: undefined },
          {
            label: LABELS.grpBilling.LABEL_BILL_TO_ACCOUNT_GUID,
            value: undefined,
            lastChild: true,
          },
        ],
        col2: [
          { label: LABELS.grpBilling.LABEL_PAYERS, value: undefined },
          {
            label: LABELS.grpBilling.LABEL_TELADOC_TO_REFUND_MEMBERS,
            value: undefined,
            format: "boolean",
          },
          {
            label: LABELS.grpBilling.LABEL_CONSULTS_INCLUDED,
            value: undefined,
            format: "boolean",
          },
          {
            label: LABELS.grpBilling.LABEL_INCLUDE_CCM_PEPM_PRODUCT,
            value: undefined,
            lastChild: true,
          },
        ],
      },
      "Read-only": {
        col1: [
          {
            label: LABELS.grpBilling.LABEL_PURCHASE_ORDER_NUMBER,
            value: undefined,
            lastChild: true,
          },
        ],
        col2: [
          {
            label: LABELS.grpBilling.LABEL_PURCHASE_ORDER_REQUIRED,
            value: undefined,
            lastChild: true,
          },
        ],
      },
    });
  });
});

describe("renderBillingCCM", () => {
  it("returns correct structure when all data is provided", () => {
    const mockData: any = {
      ccm: {
        groupBillingDetails: {
          billingPartner: "Partner A",
          billingMethod: "Method B",
          billingPointOfContact: "Contact C",
          hipaaCoveredEntity: "true",
          detailedInvoice: "Yes",
          detailedInvoiceRecipients: "Recipient D",
          detailedInvoiceTags: "Tag E",
          billingAddress: "Address F",
          paymentTerms: "Terms G",
        },
        contractDetails: {
          contractType: "Type H",
          legalName: "Legal Name I",
          contractEffectiveDate: "2023-01-01",
          contractTerminationDate: "2023-12-31",
          baaSigned: true,
          marketingAndDopsRequirements: false,
          accountHasSlas: true,
          slaSetails: "Details J",
        },
        lapsedUserDetails: {
          isThereALapsedUserClause: true,
          lapsedClauseClaimsData: false,
          lapsedClauseMultiChannelMarketing: true,
          lapsedClauseUseOfIncentives: false,
          lapsedClauseOptimizedEnrollmentPlan: true,
        },
      },
    };

    const result = renderBillingCCM(mockData);
    expect(stripMetaFields(result)).toEqual({
      "CCM billing details": {
        col1: [
          { label: "Billing partner", value: "Partner A" },
          { label: "Billing method", value: "Method B" },
          { label: "Billing point of contact", value: "Contact C" },
          { label: "HIPAA covered entity", value: "true" },
          { label: "Detailed invoice?", value: "Yes" },
          { label: "Detailed invoice recipients", value: "Recipient D" },
          { label: "Detailed invoice tags", value: "Tag E" },
          { label: "Billing address", value: "Address F" },
          { label: "Payment terms", value: "Terms G" },
          { label: "Pricing model", lastChild: true, value: undefined },
        ],
        col2: [
          { label: "Bundled pricing discount", value: undefined },
          { label: "Prorated enrollment", value: undefined },
          { label: "Fast start credit offered", format: "boolean", value: undefined },
          { label: "Fast start credit type", value: undefined },
          { label: "Fast start participation rate", format: "percentage", value: undefined },
          { label: "Fast start launch date", format: "date", value: undefined },
          { label: "Fast start close date", format: "date", value: undefined },
          { label: "Fast start custom", value: undefined },
          {
            label: "Client expects ROI",
            value: undefined,
          },
          {
            label: "Required data for ROI",
            value: undefined,
            lastChild: true,
          }
        ],
      },
      "Contract details": {
        col1: [
          { label: "Contract type", value: "Type H" },
          { label: "Legal name", value: "Legal Name I" },
          {
            label: "Contract effective date",
            value: "2023-01-01",
            format: "date",
          },
          {
            label: "Contract termination date",
            value: "2023-12-31",
            format: "date",
          },
          { label: "BAA signed?", value: true },
          {
            label: "Marketing and DOPS requirements?",
            value: false,
            format: "boolean",
          },
          { label: "Account has SLAs?", value: true, format: "boolean" },
          { format: "html",label: "SLA details", lastChild: true, value: undefined },
        ],
        col2: [
          { label: "Days notice for termination", value: undefined },
          { label: "Termination for convenience?", value: undefined },
          { label: "Days notice for term for convenience", value: undefined },
          { label: "Bill early termination through claims", value: undefined },
          { label: "Customer signed date", format: "date", value: undefined },
          { label: "Company signed date", format: "date", value: undefined },
          { format: "html", label: "Unique contract terms", lastChild: true, value: undefined },
        ],
      },
      "Lapsed user details": {
        col1: [
          {
            label: "Is there a lapsed user clause",
            value: true,
            format: "boolean",
          },
          {
            label: "Lapsed clause: claims data",
            value: false,
            format: "boolean",
          },
          {
            label: "Lapsed clause: multi-channel marketing",
            value: true,
            format: "boolean",
            lastChild: true,
          },
        ],
        col2: [
          {
            label: "Lapsed clause: use of incentives",
            value: false,
            format: "boolean",
          },
          {
            label: "Lapsed clause: optimized enrollment plan",
            value: true,
            format: "boolean",
            lastChild: true,
          },
        ],
      },
    });
  });

  it("handles missing data gracefully", () => {
    const mockData: any = {
      ccm: {
        groupBillingDetails: {},
        contractDetails: {},
        lapsedUserDetails: {},
      },
    };

    const result = renderBillingCCM(mockData);
    expect(stripMetaFields(result)).toEqual({
      "CCM billing details": {
        col1: [
          { label: "Billing partner", value: undefined },
          { label: "Billing method", value: undefined },
          { label: "Billing point of contact", value: undefined },
          { label: "HIPAA covered entity", value: undefined },
          { label: "Detailed invoice?", value: undefined },
          { label: "Detailed invoice recipients", value: undefined },
          { label: "Detailed invoice tags", value: undefined },
          { label: "Billing address", value: undefined },
          { label: "Payment terms", value: undefined },
          { label: "Pricing model", value: undefined, lastChild: true },
        ],
        col2: [
          { label: "Bundled pricing discount", value: undefined },
          { label: "Prorated enrollment", value: undefined },
          { label: "Fast start credit offered", format: "boolean", value: undefined },
          { label: "Fast start credit type", value: undefined },
          { label: "Fast start participation rate", format: "percentage", value: undefined },
          { label: "Fast start launch date", format: "date", value: undefined },
          { label: "Fast start close date", format: "date", value: undefined },
          { label: "Fast start custom", value: undefined },
          {
            label: "Client expects ROI",
            value: undefined,
          },
          {
            label: "Required data for ROI",
            lastChild: true,
            value: undefined,
          }
        ],
      },
      "Contract details": {
        col1: [
          { label: "Contract type", value: undefined },
          { label: "Legal name", value: undefined },
          { label: "Contract effective date", format: "date", value: undefined },
          { label: "Contract termination date", format: "date", value: undefined },
          { label: "BAA signed?", value: undefined },
          { label: "Marketing and DOPS requirements?", format: "boolean", value: undefined },
          { label: "Account has SLAs?", format: "boolean", value: undefined },
          { format: "html", label: "SLA details", lastChild: true, value: undefined },
        ],
        col2: [
          { label: "Days notice for termination", value: undefined },
          { label: "Termination for convenience?", value: undefined },
          { label: "Days notice for term for convenience", value: undefined },
          { label: "Bill early termination through claims", value: undefined },
          { label: "Customer signed date", format: "date", value: undefined },
          { label: "Company signed date", format: "date", value: undefined },
          { format: "html", label: "Unique contract terms", lastChild: true, value: undefined },
        ],
      },
      "Lapsed user details": {
        col1: [
          { label: "Is there a lapsed user clause", format: "boolean", value: undefined },
          { label: "Lapsed clause: claims data", format: "boolean", value: undefined },
          {
            label: "Lapsed clause: multi-channel marketing",
            format: "boolean",
            lastChild: true,
            value: undefined,
          },
        ],
        col2: [
          { label: "Lapsed clause: use of incentives", format: "boolean", value: undefined },
          {
            label: "Lapsed clause: optimized enrollment plan",
            format: "boolean",
            lastChild: true,
            value: undefined,
          },
        ],
      },
    });
  });

  it("returns empty structure when no data is provided", () => {
    const result = renderBillingCCM(undefined as any);
    expect(stripMetaFields(result)).toEqual({
      "CCM billing details": {
        col1: [
          { label: "Billing partner", value: undefined },
          { label: "Billing method", value: undefined },
          { label: "Billing point of contact", value: undefined },
          { label: "HIPAA covered entity", value: undefined },
          { label: "Detailed invoice?", value: undefined },
          { label: "Detailed invoice recipients", value: undefined },
          { label: "Detailed invoice tags", value: undefined },
          { label: "Billing address", value: undefined },
          { label: "Payment terms", value: undefined },
          { label: "Pricing model", value: undefined, lastChild: true},
        ],
        col2: [
          { label: "Bundled pricing discount", value: undefined },
          { label: "Prorated enrollment", value: undefined },
          { label: "Fast start credit offered", format: "boolean", value: undefined },
          { label: "Fast start credit type", value: undefined },
          { label: "Fast start participation rate", format: "percentage", value: undefined },
          { label: "Fast start launch date", format: "date", value: undefined },
          { label: "Fast start close date", format: "date", value: undefined },
          { label: "Fast start custom", value: undefined },
          {
            label: "Client expects ROI",
            value: undefined,
          },
          {
            label: "Required data for ROI",
            lastChild: true,
            value: undefined,
          }
        ],
      },
      "Contract details": {
        col1: [
          { label: "Contract type", value: undefined },
          { label: "Legal name", value: undefined },
          { label: "Contract effective date", format: "date", value: undefined },
          { label: "Contract termination date", format: "date", value: undefined },
          { label: "BAA signed?", value: undefined },
          { label: "Marketing and DOPS requirements?", format: "boolean", value: undefined },
          { label: "Account has SLAs?", format: "boolean", value: undefined },
          { format: "html", label: "SLA details", lastChild: true, value: undefined },
        ],
        col2: [
          { label: "Days notice for termination", value: undefined },
          { label: "Termination for convenience?", value: undefined },
          { label: "Days notice for term for convenience", value: undefined },
          { label: "Bill early termination through claims", value: undefined },
          { label: "Customer signed date", format: "date", value: undefined },
          { label: "Company signed date", format: "date", value: undefined },
          { format: "html", label: "Unique contract terms", lastChild: true, value: undefined },
        ],
      },
      "Lapsed user details": {
        col1: [
          { label: "Is there a lapsed user clause", format: "boolean", value: undefined },
          { label: "Lapsed clause: claims data", format: "boolean", value: undefined },
          {
            label: "Lapsed clause: multi-channel marketing",
            format: "boolean",
            lastChild: true,
            value: undefined,
          },
        ],
        col2: [
          { label: "Lapsed clause: use of incentives", format: "boolean", value: undefined },
          {
            label: "Lapsed clause: optimized enrollment plan",
            format: "boolean",
            lastChild: true,
            value: undefined,
          },
        ],
      },
    });
  });
});
