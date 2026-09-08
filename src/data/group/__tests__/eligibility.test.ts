import { describe, it, expect } from "vitest";
import {
  renderEligibilityOverview,
  renderCcmEligibility,
} from "../eligibilty-claims";
import { LABELS } from "@/constants";

/** Recursively strips `fieldKey` and `metadata` so tests stay focused on business fields. */
function stripMetaFields(obj: any): any {
  if (Array.isArray(obj)) return obj.map(stripMetaFields);
  if (obj !== null && typeof obj === "object") {
    const { fieldKey: _fk, metadata: _md, ...rest } = obj;
    return Object.fromEntries(Object.entries(rest).map(([k, v]) => [k, stripMetaFields(v)]));
  }
  return obj;
}

describe("renderEligibilityOverview", () => {
  it("returns correct structure when all data is provided", () => {
    const mockData: any = {
      overview: {
        eligibilityDetails: {
          primaryRegistrationMemberSource: "Source A",
          enableCcmCombinedEligibility: true,
          dependentRegistrationMemberSource: "Source B",
          dependentMinimumAge: 18,
          dependentMaximumAge: 25,
          allowMinorRegistration: false,
        },
        contacts: {
          eligibilityContact: "Contact A",
        },
      },
    };

    const result = renderEligibilityOverview(mockData);

    expect(stripMetaFields(result)).toEqual({
      "Eligibility details": {
        col1: [
          {
            label: LABELS.eligibilityClaims.PRIMARY_REGISTRATION_MEMBER_SOURCE,
            value: "Source A",
          },
          {
            label: LABELS.eligibilityClaims.ENABLE_CCM_COMBINED_ELIGIBILITY,
            value: true,
            format: "boolean",
          },
          {
            label:
              LABELS.eligibilityClaims.DEPENDENT_REGISTRATION_MEMBER_SOURCE,
            value: "Source B",
          },
          {
            label: LABELS.eligibilityClaims.MINIMUM_AGE,
            value: undefined,
            lastChild: true,
          },
        ],
        col2: [
          { label: LABELS.eligibilityClaims.DEPENDENT_MINIMUM_AGE, value: 18 },
          { label: LABELS.eligibilityClaims.DEPENDENT_MAXIMUM_AGE, value: 25 },
          {
            label: LABELS.eligibilityClaims.ALLOW_MINOR_REGISTRATION,
            value: false,
            lastChild: true,
          },
        ],
      },
      Contacts: {
        col1: [
          {
            label: LABELS.eligibilityClaims.ELIGIBILITY_CONTACT,
            value: "Contact A",
            format: "person",
            personMeta: { name: "", initials: "" },
            onPersonClick: undefined,
            lastChild: true,
          },
        ],
        col2: [],
      },
    });
  });

  it("handles missing data gracefully", () => {
    const mockData: any = {
      overview: {
        eligibilityDetails: {},
        contacts: {},
      },
    };

    const result = renderEligibilityOverview(mockData);

    expect(stripMetaFields(result)).toEqual({
      "Eligibility details": {
        col1: [
          {
            label: LABELS.eligibilityClaims.PRIMARY_REGISTRATION_MEMBER_SOURCE,
            value: undefined,
          },
          {
            label: LABELS.eligibilityClaims.ENABLE_CCM_COMBINED_ELIGIBILITY,
            value: undefined,
            format: "boolean",
          },
          {
            label:
              LABELS.eligibilityClaims.DEPENDENT_REGISTRATION_MEMBER_SOURCE,
            value: undefined,
          },
          {
            label: LABELS.eligibilityClaims.MINIMUM_AGE,
            value: undefined,
            lastChild: true,
          },
        ],
        col2: [
          {
            label: LABELS.eligibilityClaims.DEPENDENT_MINIMUM_AGE,
            value: undefined,
          },
          {
            label: LABELS.eligibilityClaims.DEPENDENT_MAXIMUM_AGE,
            value: undefined,
          },
          {
            label: LABELS.eligibilityClaims.ALLOW_MINOR_REGISTRATION,
            value: undefined,
            lastChild: true,
          },
        ],
      },
      Contacts: {
        col1: [
          {
            label: LABELS.eligibilityClaims.ELIGIBILITY_CONTACT,
            value: undefined,
            format: "person",
            personMeta: { name: "", initials: "" },
            onPersonClick: undefined,
            lastChild: true,
          },
        ],
        col2: [],
      },
    });
  });

  it("returns empty structure when no data is provided", () => {
    const result = renderEligibilityOverview(undefined as any);

    expect(stripMetaFields(result)).toEqual({
      "Eligibility details": {
        col1: [
          {
            label: LABELS.eligibilityClaims.PRIMARY_REGISTRATION_MEMBER_SOURCE,
            value: undefined,
          },
          {
            label: LABELS.eligibilityClaims.ENABLE_CCM_COMBINED_ELIGIBILITY,
            value: undefined,
            format: "boolean",
          },
          {
            label:
              LABELS.eligibilityClaims.DEPENDENT_REGISTRATION_MEMBER_SOURCE,
            value: undefined,
          },
          {
            label: LABELS.eligibilityClaims.MINIMUM_AGE,
            value: undefined,
            lastChild: true,
          },
        ],
        col2: [
          {
            label: LABELS.eligibilityClaims.DEPENDENT_MINIMUM_AGE,
            value: undefined,
          },
          {
            label: LABELS.eligibilityClaims.DEPENDENT_MAXIMUM_AGE,
            value: undefined,
          },
          {
            label: LABELS.eligibilityClaims.ALLOW_MINOR_REGISTRATION,
            value: undefined,
            lastChild: true,
          },
        ],
      },
      Contacts: {
        col1: [
          {
            label: LABELS.eligibilityClaims.ELIGIBILITY_CONTACT,
            value: undefined,
            format: "person",
            personMeta: { name: "", initials: "" },
            onPersonClick: undefined,
            lastChild: true,
          },
        ],
        col2: [],
      },
    });
  });
});

describe("renderCcmEligibility", () => {
  it("returns correct structure when all data is provided", () => {
    const mockData: any = {
      ccmEligibility: {
        eligibilityDetails: {
          linkToBoxFolderPHIRelease: "Link A",
          programEligibilityFlag: true,
          isEligibilityDriveritized: false,
          eligibilityVerificationMethod: "Method A",
          populationDataSources: "Source A",
          eligibilityFileCadence: "Cadence A",
          linksToEligibilityVerificationFolder: "Folder A",
          monthlyEscalationPath: "Path A",
          disableLiveProgramEligibilityCheck: true,
          eligibleGroupIDs: ["Group1", "Group2"],
          manualCheck: false,
          eligibilityExceptionsRules: "Rules A",
          eligibilityTeamNotes: "Notes A",
        },
        ccmIntegrations: {
          ssoPartner: "Partner A",
          incentivesAPIPartner: "Partner B",
          incentivesAPIStartDate: "2023-01-01",
          incentiveReportingPartner: "Partner C",
          memberSupportDetails: "Details A",
          cvsTDCEligibilityCriteria: "Criteria A",
        },
      },
    };

    const result = renderCcmEligibility(mockData);

    expect(stripMetaFields(result)).toEqual({
      "Eligibility details": {
        col1: [
          { label: "Link to box folder - PHI release", value: "Link A" },
          { label: "Program eligibility flag", value: true },
          { label: "Is eligibility driveritized?", value: false },
          { label: "Eligibility verification method", value: "Method A" },
          { label: "Population data sources", value: "Source A" },
          { label: "Eligibility file cadence", value: "Cadence A" },
          {
            label: "Links to eligibility verification folder",
            value: "Folder A",
            format: "html",
            lastChild: true,
          },
        ],
        col2: [
          { label: "Monthly escalation path", value: "Path A" },
          { label: "Disable live program eligibility check", value: true },
          { label: "Eligible group IDs", value: "Group1, Group2" },
          { label: "Manual check", value: false },
          { label: "Eligibility exceptions/rules", value: "Rules A" },
          {
            label: "Eligibility team notes",
            value: "Notes A",
            format: "html",
            lastChild: true,
          },
        ],
      },
      "CCM Integrations": {
        col1: [
          { label: "SSO partner", value: "Partner A" },
          { label: "Incentives API partner", value: "Partner B" },
          {
            label: "Incentives API start date",
            value: "2023-01-01",
            format: "date",
            lastChild: true,
          },
        ],
        col2: [
          { label: "Incentive reporting partner", value: "Partner C" },
          { label: "Member support details", value: "Details A" },
          {
            label: "CVS/TDC eligibility criteria",
            value: "Criteria A",
            lastChild: true,
          },
        ],
      },
    });
  });

  it("handles missing data gracefully", () => {
    const mockData: any = {
      ccmEligibility: {
        eligibilityDetails: {},
        ccmIntegrations: {},
      },
    };

    const result = renderCcmEligibility(mockData);
    expect(stripMetaFields(result)).toEqual({
      "Eligibility details": {
        col1: [
          { label: "Link to box folder - PHI release" },
          { label: "Program eligibility flag" },
          { label: "Is eligibility driveritized?" },
          { label: "Eligibility verification method" },
          { label: "Population data sources" },
          { label: "Eligibility file cadence" },
          {
            label: "Links to eligibility verification folder",
            format: "html",
            lastChild: true,
          },
        ],
        col2: [
          { label: "Monthly escalation path" },
          { label: "Disable live program eligibility check" },
          { label: "Eligible group IDs", value: [] },
          { label: "Manual check" },
          { label: "Eligibility exceptions/rules" },
          { label: "Eligibility team notes", lastChild: true, format: "html"},
        ],
      },
      "CCM Integrations": {
        col1: [
          { label: "SSO partner" },
          { label: "Incentives API partner" },
          {
            label: "Incentives API start date",
            format: "date",
            lastChild: true,
          },
        ],
        col2: [
          { label: "Incentive reporting partner" },
          { label: "Member support details" },
          { label: "CVS/TDC eligibility criteria", lastChild: true },
        ],
      },
    });
  });

  it("returns empty structure when no data is provided", () => {
    const result = renderCcmEligibility(undefined as any);
   
    expect(stripMetaFields(result)).toEqual({
      "Eligibility details": {
        col1: [
          { label: "Link to box folder - PHI release" },
          { label: "Program eligibility flag" },
          { label: "Is eligibility driveritized?" },
          { label: "Eligibility verification method" },
          { label: "Population data sources" },
          { label: "Eligibility file cadence" },
          {
            label: "Links to eligibility verification folder",
            format: "html",
            lastChild: true,
          },
        ],
        col2: [
          { label: "Monthly escalation path" },
          { label: "Disable live program eligibility check" },
          { label: "Eligible group IDs", value: [] },
          { label: "Manual check" },
          { label: "Eligibility exceptions/rules" },
          { label: "Eligibility team notes", lastChild: true, format: "html"},
        ],
      },
      "CCM Integrations": {
        col1: [
          { label: "SSO partner" },
          { label: "Incentives API partner" },
          {
            label: "Incentives API start date",
            format: "date",
            lastChild: true,
          },
        ],
        col2: [
          { label: "Incentive reporting partner" },
          { label: "Member support details" },
          { label: "CVS/TDC eligibility criteria", lastChild: true },
        ],
      },
    });
  });
});
