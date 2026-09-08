import { describe, it, expect } from "vitest";
import { renderBillingOverview, renderInvoiceDetails } from "../billing";
import { LABELS } from "@/constants";
import type { Billing } from "@/types/OrgView";

function stripMetaFields(obj: any): any {
  if (Array.isArray(obj)) return obj.map(stripMetaFields);
  if (obj !== null && typeof obj === "object") {
    const { fieldKey: _fk, metadata: _md, ...rest } = obj;
    return Object.fromEntries(Object.entries(rest).map(([k, v]) => [k, stripMetaFields(v)]));
  }
  return obj;
}

describe("renderBillingOverview", () => {
  it("should render all fields correctly when data is fully populated", () => {
    const mockData: any = {
      overview: {
        billingOverView: {
          billingAccountGuid: "123-abc",
          paymentTerms: "Net 30",
          billingEnabledAtThisOrgLevel: true,
        },
        financeCategory: {
          financeCategory: "Healthcare",
          financeSubcategory: "Hospitals",
        },
        billingAddress: {
          billingStreet: "123 Main St",
          billingCity: "New York",
          billingStateOrProvince: "NY",
          billingZipOrPostalCode: "10001",
          billingCounty: "New York",
          billingCountry: "USA",
          billingAddressVerified: true,
        },
        additionalDetails: {
          newPurchaseOrder: "PO-123",
          riskContracts: "Yes",
        },
        roi: {
          clientExpectsRoi: false,
          requiredDataForRoi: true,
        },
      },
      invoiceDetail: {} as any,
    };

    const result = renderBillingOverview(mockData);

    expect(stripMetaFields(result["Billing overview"].col1[0])).toEqual({
      label: LABELS.billings.BILLING_ACCOUNT_GUID,
      value: "123-abc",
    });
    expect(stripMetaFields(result["Billing overview"].col1[1])).toEqual({
      label: LABELS.billings.PAYMENT_TERMS,
      value: "Net 30",
      lastChild: true,
      tooltipContent: "Choose payment terms. No default value.",
    });
    expect(stripMetaFields(result["Billing overview"].col2[0])).toEqual({
      label: LABELS.billings.BILLING_ENABLED_AT_ORG_LEVEL,
      value: true,
      format: "boolean",
    });

    expect(result["Finance category"].col1[0].value).toBe("Healthcare");
    expect(result["Finance category"].col2[0].value).toBe("Hospitals");

    expect(result["Billing address"].col1[0].value).toBe("123 Main St");
    expect(result["Billing address"].col2[1].value).toBe("USA");
    expect(result["Additional details"].col1[0].value).toBe("PO-123");
    expect(result["Additional details"].col2[0].value).toBe("Yes");
  });

  it("should handle missing overview sections gracefully", () => {
    const result = renderBillingOverview({ overview: {} } as Billing);
    expect(result["Billing overview"].col1[0].value).toBeUndefined();
    expect(result["Finance category"].col1[0].value).toBeUndefined();
    expect(result["Billing address"].col2[2].value).toBeUndefined();
    expect(result["Additional details"].col2[0].value).toBeUndefined();
  });
});

describe("renderInvoiceDetails", () => {
  it("should render invoice and contact details correctly", () => {
    const mockData: any = {
      overview: {},
      invoiceDetail: {
        invoice: {
          invoiceName: "ABC Health",
          invoicePersonType: "Company",
          invoiceDelivery: "Email",
          doesClientSelfRemitPayment: false,
          eligibleDayOfMonth: 15,
        },
        invoiceContact: {
          primaryBillingContact: "John Doe",
          secondaryBillingContact: "Jane Smith",
          invoiceEmail: "billing@abc.com",
          regardsTo: "Finance Dept",
          firstName: "John",
          lastName: "Doe",
        },
      },
    };

    const result = renderInvoiceDetails(mockData);

    expect(result["Invoice details"].col1[0].value).toBe("ABC Health");
    expect(stripMetaFields(result["Invoice details"].col2[0])).toEqual({
      label: LABELS.billings.DOES_CLIENT_SELF_REMIT,
      value: false,
      format: "boolean",
      tooltipContent: "Indicates if client remits payment directly. Default: Disabled.",
    });

    expect(result["Invoice contact"].col1[0].format).toBe("person");
    expect(result["Invoice contact"].col1[2].value).toBe("billing@abc.com");
    expect(result["Invoice contact"].col2[2].value).toBe("Doe");
  });

  it("should handle missing invoiceDetail sections gracefully", () => {
    const result = renderInvoiceDetails({ invoiceDetail: {} } as Billing);

    expect(result["Invoice details"].col1[0].value).toBeUndefined();
    expect(result["Invoice contact"].col2[1].value).toBeUndefined();
  });
});
