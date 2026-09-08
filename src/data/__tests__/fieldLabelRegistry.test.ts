import { describe, it, expect, vi } from "vitest";

vi.mock("@ucc/common-ui", () => ({
  extractDisplayValue: (raw: any, format: string) => {
    if (raw === null || raw === undefined) return { raw: null };
    if (format === "boolean") return { raw: raw === "true" || raw === true ? "Yes" : "No" };
    if (format === "date") return { raw: raw };
    return { raw: String(raw) };
  },
}));

vi.mock("@/utils", () => ({
  formatNumberWithCommas: (val: string) => {
    const num = parseFloat(val);
    return num.toLocaleString("en-US");
  },
}));

vi.mock("@/data/organization/general-settings", () => ({
  renderGeneralSettingOverview: () => ({
    "Organization overview": {
      col1: [
        { label: "Organization name", fieldKey: "orgName", format: "text" },
        { label: "Status", fieldKey: "status" },
      ],
      col2: [],
    },
  }),
  renderPermissions: () => ({
    "Permissions": {
      col1: [
        { label: "Admin access", fieldKey: "adminAccess", format: "boolean" },
      ],
      col2: [],
    },
  }),
}));

vi.mock("@/data/organization/billing", () => ({
  renderBillingOverview: () => ({
    "Billing overview": {
      col1: [{ label: "Payment terms", fieldKey: "paymentTerms" }],
      col2: [],
    },
  }),
  renderInvoiceDetails: () => ({
    "Invoice details": {
      col1: [{ label: "Invoice method", fieldKey: "invoiceMethod" }],
      col2: [],
    },
  }),
}));

vi.mock("@/data/organization/marketing", () => ({
  renderMarketingDetails: () => ({}),
  renderTelemedcineDetails: () => ({}),
}));

vi.mock("@/data/group/general-setting", () => ({
  renderGeneralSettingOverviewSec1: () => ({
    "Group overview": {
      col1: [{ label: "Group name", fieldKey: "groupName" }],
      col2: [],
    },
  }),
  renderGeneralSettingOverviewSec2: () => ({}),
  renderGroupPermissions: () => ({
    "Group permissions": {
      col1: [{ label: "Allow registration", fieldKey: "allowRegistration", format: "boolean" }],
      col2: [],
    },
  }),
  renderGroupRelationships: () => ({}),
  renderClinicalAndMemberSupport: () => ({}),
}));

vi.mock("@/data/group/billing", () => ({
  renderBillingOverview: () => ({}),
  renderBillingCCM: () => ({}),
}));

vi.mock("@/data/group/marketing", () => ({
  renderMarketingOverview: () => ({}),
  renderMarketingTelemedicine: () => ({}),
  renderMarketingCcm: () => ({}),
}));

vi.mock("@/data/group/eligibilty-claims", () => ({
  renderEligibilityOverview: () => ({}),
  renderCcmEligibility: () => ({}),
}));

import {
  getFieldLabel,
  normaliseChangeValue,
  transformChangesToSections,
} from "../fieldLabelRegistry";

describe("fieldLabelRegistry", () => {
  describe("getFieldLabel", () => {
    it("returns field entry for a known organization field", () => {
      const result = getFieldLabel("organizationGeneralSettings.orgName");
      expect(result).toEqual({
        label: "Organization name",
        sectionTitle: "Organization overview",
        format: "text",
      });
    });

    it("returns field entry for a field without explicit format", () => {
      const result = getFieldLabel("organizationGeneralSettings.status");
      expect(result).toEqual({
        label: "Status",
        sectionTitle: "Organization overview",
        format: undefined,
      });
    });

    it("returns field entry for permissions page", () => {
      const result = getFieldLabel("organizationGeneralSettings.adminAccess");
      expect(result).toEqual({
        label: "Admin access",
        sectionTitle: "Permissions",
        format: "boolean",
      });
    });

    it("returns field entry for billing page", () => {
      const result = getFieldLabel("organizationBilling.paymentTerms");
      expect(result).toEqual({
        label: "Payment terms",
        sectionTitle: "Billing overview",
        format: undefined,
      });
    });

    it("returns field entry for group page", () => {
      const result = getFieldLabel("groupGeneralSettings.groupName");
      expect(result).toEqual({
        label: "Group name",
        sectionTitle: "Group overview",
        format: undefined,
      });
    });

    it("returns undefined for unknown page prefix", () => {
      const result = getFieldLabel("unknownPage.someField");
      expect(result).toBeUndefined();
    });

    it("returns undefined for key without dot separator", () => {
      const result = getFieldLabel("noDotKey");
      expect(result).toBeUndefined();
    });

    it("returns undefined for unknown field within known page", () => {
      const result = getFieldLabel("organizationGeneralSettings.nonExistentField");
      expect(result).toBeUndefined();
    });
  });

  describe("normaliseChangeValue", () => {
    it("returns em dash for null", () => {
      expect(normaliseChangeValue(null)).toBe("—");
    });

    it("returns em dash for undefined", () => {
      expect(normaliseChangeValue(undefined)).toBe("—");
    });

    it("returns em dash for empty string", () => {
      expect(normaliseChangeValue("")).toBe("—");
    });

    it("returns em dash when extractDisplayValue returns dash", () => {
      expect(normaliseChangeValue("-")).toBe("—");
    });

    it("returns string value for text format", () => {
      expect(normaliseChangeValue("Hello", "text")).toBe("Hello");
    });

    it("returns formatted boolean for boolean format", () => {
      expect(normaliseChangeValue("true", "boolean")).toBe("Yes");
      expect(normaliseChangeValue("false", "boolean")).toBe("No");
    });

    it("formats numeric strings with commas when no format specified", () => {
      expect(normaliseChangeValue("1234567")).toBe("1,234,567");
    });

    it("formats decimal numbers with commas", () => {
      expect(normaliseChangeValue("12345.67")).toBe("12,345.67");
    });

    it("does not format numbers when format is specified", () => {
      expect(normaliseChangeValue("12345", "text")).toBe("12345");
    });

    it("handles non-numeric strings without formatting", () => {
      expect(normaliseChangeValue("some text")).toBe("some text");
    });

    it("handles negative numbers", () => {
      expect(normaliseChangeValue("-5000")).toBe("-5,000");
    });
  });

  describe("transformChangesToSections", () => {
    it("returns empty result for undefined response", () => {
      const result = transformChangesToSections(undefined);
      expect(result).toEqual({
        sections: [],
        arrayChangeSections: [],
        errors: [],
        unmappedKeys: [],
      });
    });

    it("returns empty result when changes is missing", () => {
      const result = transformChangesToSections({ changes: undefined } as any);
      expect(result).toEqual({
        sections: [],
        arrayChangeSections: [],
        errors: [],
        unmappedKeys: [],
      });
    });

    it("returns errors from response", () => {
      const result = transformChangesToSections({
        changes: {},
        errors: ["Some error occurred"],
      });
      expect(result.errors).toEqual(["Some error occurred"]);
    });

    it("maps scalar changes to sections using field labels", () => {
      const result = transformChangesToSections({
        changes: {
          "organizationGeneralSettings.orgName": {
            oldValue: "Old Corp",
            newValue: "New Corp",
          },
        },
      });

      expect(result.sections).toHaveLength(1);
      expect(result.sections[0].title).toBe("Organization overview");
      expect(result.sections[0].rows).toEqual([
        {
          field: "Organization name",
          previousValue: "Old Corp",
          updatedValue: "New Corp",
        },
      ]);
    });

    it("groups multiple fields under same section", () => {
      const result = transformChangesToSections({
        changes: {
          "organizationGeneralSettings.orgName": {
            oldValue: "Old",
            newValue: "New",
          },
          "organizationGeneralSettings.status": {
            oldValue: "Active",
            newValue: "Inactive",
          },
        },
      });

      expect(result.sections).toHaveLength(1);
      expect(result.sections[0].rows).toHaveLength(2);
    });

    it("creates separate sections for different groups", () => {
      const result = transformChangesToSections({
        changes: {
          "organizationGeneralSettings.orgName": {
            oldValue: "A",
            newValue: "B",
          },
          "organizationGeneralSettings.adminAccess": {
            oldValue: "true",
            newValue: "false",
          },
        },
      });

      expect(result.sections).toHaveLength(2);
      const titles = result.sections.map((s) => s.title);
      expect(titles).toContain("Organization overview");
      expect(titles).toContain("Permissions");
    });

    it("collects unmapped keys for unknown fields", () => {
      const result = transformChangesToSections({
        changes: {
          "unknownPage.unknownField": {
            oldValue: "x",
            newValue: "y",
          },
        },
      });

      expect(result.unmappedKeys).toContain("unknownPage.unknownField");
      expect(result.sections).toHaveLength(0);
    });

    it("handles array changes with known registry config", () => {
      const result = transformChangesToSections({
        changes: {
          "organizationGeneralSettings.accountRelationships": {
            modified: [
              {
                id: ["ACC-001"],
                changes: {
                  startDate: { oldValue: "2024-01-01", newValue: "2025-01-01" },
                  partnerAccount: { oldValue: "OldPartner", newValue: "NewPartner" },
                },
              },
            ],
          },
        },
      });

      expect(result.arrayChangeSections).toHaveLength(1);
      expect(result.arrayChangeSections[0].tabLabel).toBe("Account relationship");
      expect(result.arrayChangeSections[0].items).toHaveLength(1);
      expect(result.arrayChangeSections[0].items[0].id).toBe("ACC-001");
      expect(result.arrayChangeSections[0].items[0].rows).toHaveLength(2);
      expect(result.arrayChangeSections[0].items[0].rows[0].field).toBe("Start date");
    });

    it("collects unknown array change keys as unmapped", () => {
      const result = transformChangesToSections({
        changes: {
          "unknownPage.someArray": {
            modified: [{ id: ["1"], changes: {} }],
          },
        },
      });

      expect(result.unmappedKeys).toContain("unknownPage.someArray");
      expect(result.arrayChangeSections).toHaveLength(0);
    });

    it("uses 'Unknown' as id when modified item has no id", () => {
      const result = transformChangesToSections({
        changes: {
          "organizationGeneralSettings.accountRelationships": {
            modified: [
              {
                changes: {
                  partnerAccount: { oldValue: "A", newValue: "B" },
                },
              },
            ],
          },
        },
      });

      expect(result.arrayChangeSections[0].items[0].id).toBe("Unknown");
    });

    it("skips modified items without changes", () => {
      const result = transformChangesToSections({
        changes: {
          "organizationGeneralSettings.accountRelationships": {
            modified: [
              { id: ["ACC-1"] },
              { id: ["ACC-2"], changes: { startDate: { oldValue: "a", newValue: "b" } } },
            ],
          },
        },
      });

      expect(result.arrayChangeSections[0].items).toHaveLength(1);
      expect(result.arrayChangeSections[0].items[0].id).toBe("ACC-2");
    });

    it("uses raw field name when array field config has no label", () => {
      const result = transformChangesToSections({
        changes: {
          "organizationGeneralSettings.accountRelationships": {
            modified: [
              {
                id: ["ACC-1"],
                changes: {
                  unknownField: { oldValue: "x", newValue: "y" },
                },
              },
            ],
          },
        },
      });

      expect(result.arrayChangeSections[0].items[0].rows[0].field).toBe("unknownField");
    });

    it("normalises null old/new values to em dash", () => {
      const result = transformChangesToSections({
        changes: {
          "organizationGeneralSettings.orgName": {
            oldValue: null,
            newValue: "New Value",
          },
        },
      });

      expect(result.sections[0].rows[0].previousValue).toBe("—");
      expect(result.sections[0].rows[0].updatedValue).toBe("New Value");
    });

    it("handles scalar list fields with added/removed contact names", () => {
      const result = transformChangesToSections({
        changes: {
          "organizationMarketing.details.contacts.marketingSiteUserTelemed": {
            added: ["mahesh yadav"],
            removed: ["Emaly Rodriguez", "Heather Greenwell"],
            modified: [],
          },
        },
      });

      expect(result.unmappedKeys).not.toContain(
        "organizationMarketing.details.contacts.marketingSiteUserTelemed",
      );
      expect(result.sections).toHaveLength(1);
      expect(result.sections[0].title).toBe("Contact");
      expect(result.sections[0].rows[0]).toEqual({
        field: "Marketing site user - Telemed",
        previousValue: "Emaly Rodriguez\nHeather Greenwell",
        updatedValue: "mahesh yadav",
      });
    });

    it("handles scalar list fields sent as whole-list oldValue/newValue", () => {
      const result = transformChangesToSections({
        changes: {
          "organizationMarketing.details.contacts.marketingSiteUserTelemed": {
            oldValue: [
              "Bharat kumar",
              "Carol Jenny",
              "John Wick",
              "Vinod Gandham",
            ],
            newValue: [
              "Carol Jenny",
              "John Wick",
              "Vinod Gandham",
              "Aptos Narrow (Body)",
            ],
          } as never,
        },
      });

      // Regression: this key resolves via SCALAR_LIST_FIELD_REGISTRY, not getFieldLabel,
      // so without the pre-check it was dropped as unmapped and the row vanished.
      expect(result.unmappedKeys).toEqual([]);
      expect(result.sections).toHaveLength(1);
      expect(result.sections[0].title).toBe("Contact");
      expect(result.sections[0].rows[0]).toEqual({
        field: "Marketing site user - Telemed",
        previousValue: "Bharat kumar\nCarol Jenny\nJohn Wick\nVinod Gandham",
        updatedValue: "Carol Jenny\nJohn Wick\nVinod Gandham\nAptos Narrow (Body)",
      });
    });

    it("handles the group marketing site user telemed path in the new shape", () => {
      const result = transformChangesToSections({
        changes: {
          "groupMarketing.overview.contacts.marketingSiteUserTelemed": {
            oldValue: ["Old One"],
            newValue: ["New One", "New Two"],
          } as never,
        },
      });

      expect(result.unmappedKeys).toEqual([]);
      expect(result.sections[0].rows[0]).toEqual({
        field: "Marketing site user - Telemed",
        previousValue: "Old One",
        updatedValue: "New One\nNew Two",
      });
    });
  });
});
