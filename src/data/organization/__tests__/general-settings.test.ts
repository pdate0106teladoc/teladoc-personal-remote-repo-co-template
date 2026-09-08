import { describe, it, expect } from "vitest";
import {
  renderAccountRelationShipData,
  renderPermissions,
  renderGeneralSettingOverview,
} from "../general-settings";

describe("renderAccountRelationShipData", () => {
  it("returns correct structure when all data is provided", () => {
    const mockData: any = {
      accountRelationships: [
        {
          hasBroker: true,
          brokerFee: "1000",
          brokerContact: "John Doe",
          brokerFlatRate: "500",
          brokerPercentage: "10%",
          compositeKey: "key123",
          brokerLocationId: "loc123",
          brokerLocationName: "Location A",
          chronicCareBrokerFlatRate: "200",
          chronicCareBrokerPercentage: "5%",
        },
      ],
    };

    const result = renderAccountRelationShipData(mockData);
    expect(result[0]["undefined"]).toMatchObject(
      {
        "brokerType": "REL-000000",
        "rows": {
          "col1": [
            {
              "label": "Partner relationships to Teladoc",
              "value": undefined
            },
            {
              "label": "Partner relationships type",
              "value": undefined
            },
            {
              "label": "Servicing contract type",
              "value": undefined
            },
            {
              "label": "Composite key",
              "value": "key123",
              "lastChild": true
            }
          ],
          "col2": [
            {
              "label": "Client account",
              "tooltipContent": "Benefit Sponsor Account from LCRM-Teladoc",
              "value": {
                "id": undefined,
                "isGrp": false,
                "value": undefined
              }
            },
            {
              "label": "Start date",
              "format": "date",
              "value": undefined
            },
            {
              "label": "End date",
              "format": "date",
              "value": undefined,
              "lastChild": true
            }
          ]
        }
      }
    );

  });

  it("handles missing data gracefully", () => {
    const mockData: any = {
      accountRelationships: [{}],
    };

    const result = renderAccountRelationShipData(mockData);
    expect(result[0]["undefined"]).toMatchObject(
  {
    "brokerType": "REL-000000",
    "rows": {
      "col1": [
        {
          "label": "Partner relationships to Teladoc",
          "value": undefined
        },
        {
          "label": "Partner relationships type",
          "value": undefined
        },
        {
          "label": "Servicing contract type",
          "value": undefined
        },
        {
          "label": "Composite key",
          "value": undefined,
          "lastChild": true
        }
      ],
      "col2": [
        {
          "label": "Client account",
          "tooltipContent": "Benefit Sponsor Account from LCRM-Teladoc",
          "value": {
            "id": undefined,
            "isGrp": false,
            "value": undefined
          }
        },
        {
          "label": "Start date",
          "format": "date",
          "value": undefined
        },
        {
          "label": "End date",
          "format": "date",
          "value": undefined,
          "lastChild": true
        }
      ]
    }
  }
);

  });

  it("returns empty structure when no data is provided", () => {
    const result = renderAccountRelationShipData(undefined as any);
    expect(result).toMatchObject([]);
  });
});

describe("renderPermissions", () => {
  it("returns correct structure when all data is provided", () => {
    const mockData: any = {
      permissions: {
        groupPermissions: {
          sendMemberResolutionLetter: true,
          sendProblemMemberLetter: false,
          sendUtilizationLetter: true,
          sendFraudWasteAndAbuseTermLetter: false,
        },
        memberAccessPermissions: {
          sendCcrToPcp: true,
          allowAuthorizedConsenters: false,
          allowManageSubscriptions: true,
          disablePatientExcuseNote: true,
          cancelDependents: false,
          cancelPrimary: true,
        },
      },
    };

    const result = renderPermissions(mockData);
    expect(result).toMatchObject(
      {
        "Group permissions": {
          "col1": [
            {
              "label": "Send member resolution letter",
              "value": true,
              "format": "boolean"
            },
            {
              "label": "Send problem member letter",
              "value": false,
              "format": "boolean",
              "lastChild": true
            }
          ],
          "col2": [
            {
              "label": "Send utilization letter",
              "value": true,
              "format": "boolean"
            },
            {
              "label": "Send fraud, waste and abuse term letter",
              "value": false,
              "format": "boolean",
              "lastChild": true
            }
          ]
        },
        "Member access permissions": {
          "col1": [
            {
              "label": "Send CCR to PCP",
              "value": true,
            },
            {
              "label": "Allow authorized consenters",
              "value": false,
              "format": "boolean"
            },
            {
              "label": "Allow manage subscriptions",
              "value": true,
              "format": "boolean"
            },
            {
              "label": "Disable patient excuse note",
              "value": true,
              "format": "boolean",
              "lastChild": true
            }
          ],
          "col2": [
            {
              "label": "Cancel dependents",
              "value": false,
              "format": "boolean"
            },
            {
              "label": "Cancel primary",
              "value": true,
              "format": "boolean"
            }
          ]
        }
      }
    );
  });

  it("handles missing data gracefully", () => {
    const mockData: any = {
      permissions: {
        groupPermissions: {},
        memberAccessPermissions: {},
      },
    };

    const result = renderPermissions(mockData);
    expect(result).toMatchObject(
      {
        "Group permissions": {
          "col1": [
            {
              "label": "Send member resolution letter",
              "format": "boolean"
            },
            {
              "label": "Send problem member letter",
              "format": "boolean",
              "lastChild": true
            }
          ],
          "col2": [
            {
              "label": "Send utilization letter",
              "format": "boolean"
            },
            {
              "label": "Send fraud, waste and abuse term letter",
              "format": "boolean",
              "lastChild": true
            }
          ]
        },
        "Member access permissions": {
          "col1": [
            {
              "label": "Send CCR to PCP",
            },
            {
              "label": "Allow authorized consenters",
              "format": "boolean"
            },
            {
              "label": "Allow manage subscriptions",
              "format": "boolean"
            },
            {
              "label": "Disable patient excuse note",
              "format": "boolean",
              "lastChild": true
            }
          ],
          "col2": [
            {
              "label": "Cancel dependents",
              "format": "boolean"
            },
            {
              "label": "Cancel primary",
              "format": "boolean"
            }
          ]
        }
      }
    );
  });

  it("returns empty structure when no data is provided", () => {
    const result = renderPermissions(undefined as any);
    expect(result).toMatchObject(
      {
        "Group permissions": {
          "col1": [
            {
              "label": "Send member resolution letter",
              "format": "boolean"
            },
            {
              "label": "Send problem member letter",
              "format": "boolean",
              "lastChild": true
            }
          ],
          "col2": [
            {
              "label": "Send utilization letter",
              "format": "boolean"
            },
            {
              "label": "Send fraud, waste and abuse term letter",
              "format": "boolean",
              "lastChild": true
            }
          ]
        },
        "Member access permissions": {
          "col1": [
            {
              "label": "Send CCR to PCP",
            },
            {
              "label": "Allow authorized consenters",
              "format": "boolean"
            },
            {
              "label": "Allow manage subscriptions",
              "format": "boolean"
            },
            {
              "label": "Disable patient excuse note",
              "format": "boolean",
              "lastChild": true
            }
          ],
          "col2": [
            {
              "label": "Cancel dependents",
              "format": "boolean"
            },
            {
              "label": "Cancel primary",
              "format": "boolean"
            }
          ]
        }
      }
    );
  });
});

describe("renderGeneralSettingOverview", () => {
  it("returns correct structure when all data is provided", () => {
    const mockData: any = {
      overview: {
        accountOverview: {
          organizationName: "Org A",
          nameLcrmTeladoc: "Teladoc Name",
          nameLcrmLivango: "Livango Name",
          friendlyAccountName: "Friendly Name",
          doingBusinessAs: "DBA Name",
          parentAccount: "Parent Account",
          accountStatus: "Active",
          benefitRestrictionCode: "Code123",
          recordType: "Type A",
          clientType: "Client A",
          accountBusinessType: "Business A",
          accountEffectiveStartDate: "2023-01-01",
          accountEffectiveEndDate: "2023-12-31",
          businessRegion: "Region A",
          isThisOrganizationTheEmployer: true,
          isThereABrokerOrReferralCompanyForThisOrganization: false,
        },
        accountTeam: {
          clientImplementationManager: "Manager A",
          clientOperationsManager: "Manager B",
          salesAgent: "Agent A",
          clientManagers: "Manager C",
        },
        clientTeam: {
          primaryDailyContact: "Contact A",
          primaryBillingContact: "Contact B",
          secondaryBillingContact: "Contact C",
        },
        accountDetails: {
          numberOfEmployees: "100",
          coveredLives: "200",
          unionPopulation: false,
          orgHierarchyId: "Hierarchy123",
          billingOrgOfTheInvoiceRecipient: "Billing Org",
          externalPlanSponsorID: "Sponsor123",
          externalMarketSegment: "Segment A",
        },
        address: {
          addressline1: "123 Main St",
          addressline2: "Suite 100",
          city: "City A",
          state: "State A",
          postal: "12345",
          country: "Country A",
          phoneNumber: "123-456-7890",
        },
        primaryDailyContact: {
          firstName: "John",
          lastName: "Doe",
          accountName: "Account A",
          phone: "123-456-7890",
          email: "john.doe@example.com",
          contactStatus: true,
          contactRole: "Role A",
          mailingStreet: "123 Main St",
          mailingCity: "City A",
          mailingCounty: "County A",
          mailingStateOrProvince: "State A",
          mailingZipOrPostalCode: "12345",
          mailingCountry: "Country A",
        },
      },
    };
    const result = renderGeneralSettingOverview(mockData);
    expect(result).toMatchObject(
      {
        "Account overview": {
          "col1": [
            {
              "label": "Organization name (Admin)",
              "value": "Org A"
            },
            {
              "label": "Name (LCRM-Teladoc)",
              "value": "Teladoc Name"
            },
            {
              "label": "Name (LCRM-Livongo)",
              "value": null
            },
            {
              "label": "Friendly account name",
              "value": "Friendly Name"
            },
            {
              "label": "Doing business as",
              "value": "DBA Name"
            },
            {
              "label": "Parent account",
              "value": "Parent Account"
            },
            {
              "label": "Account status",
              "value": "Active"
            },
            {
              "label": "Benefit restriction code",
              "value": "Code123",
              "lastChild": true
            }
          ],
          "col2": [
            {
              "label": "Record type",
              "value": "Type A"
            },
            {
              "label": "Client type",
              "value": "Client A"
            },
            {
              "label": "Account business type",
              "value": "Business A"
            },
            {
              "label": "Account effective start date",
              "value": "2023-01-01",
              "format": "date"
            },
            {
              "label": "Account effective end date",
              "value": "2023-12-31",
              "format": "date"
            },
            {
              "label": "Business region",
              "value": "Region A"
            },
            {
              "label": "Is this organization an employer?",
              "value": true,
              "format": "boolean"
            },
            {
              "label": "Is there a broker/referral company for this organization?",
              "value": false,
              "format": "boolean",
              "lastChild": true
            }
          ]
        },
        "Account team": {
          "col1": [
            {
              "label": "Client Operations Manager",
              "value": "Manager B",
              "format": "person",
              "lastChild": true
            }
          ],
          "col2": [
            {
              "label": "Sales Agent",
              "value": "Agent A",
              "format": "person",
              "lastChild": true
            },
          ]
        },
        "Client team": {
          "col1": [
            {
              "label": "Primary daily contact",
              "value": "Contact A",
              "format": "person"
            },
            {
              "label": "Primary billing contact",
              "value": "Contact B",
              "format": "person",
              "lastChild": true
            }
          ],
          "col2": [
            {
              "label": "Secondary billing contact",
              "value": "Contact C",
              "format": "person"
            }
          ]
        },
        "Account details": {
          "col1": [
            {
              "label": "Number of employees",
              "value": "100"
            },
            {
              "label": "Covered lives",
              "value": "200"
            },
            {
              "label": "Union population",
              "value": false,
              "lastChild": true
            }
          ],
          "col2": [
            {
              "label": "Org hierarchy ID",
              "value": "Hierarchy123"
            },
            {
              "label": "Billing org of the invoice recipient",
              "value": "Billing Org"
            }
          ]
        },
        "Address": {
          "col1": [
            {
              "label": "Address line 1",
              "value": "123 Main St"
            },
            {
              "label": "Address line 2",
              "value": "Suite 100"
            },
            {
              "label": "City",
              "value": "City A"
            },
            {
              "label": "State",
              "value": "State A",
              "lastChild": true
            }
          ],
          "col2": [
            {
              "label": "Postal",
              "value": "12345"
            },
            {
              "label": "Country",
              "value": "Country A"
            },
            {
              "label": "Phone number",
              "value": "(123) 456-7890",
              "lastChild": true
            }
          ]
        }
      }
    );
  });

  it("handles missing data gracefully", () => {
    const mockData: any = {
      overview: {
        accountOverview: {},
        accountTeam: {},
        clientTeam: {},
        accountDetails: {},
        address: {},
        primaryDailyContact: {},
      },
    };
    const result = renderGeneralSettingOverview(mockData);
    expect(result).toMatchObject(
      {
        "Account overview": {
          "col1": [
            {
              "label": "Organization name (Admin)"
            },
            {
              "label": "Name (LCRM-Teladoc)"
            },
            {
              "label": "Name (LCRM-Livongo)"
            },
            {
              "label": "Friendly account name"
            },
            {
              "label": "Doing business as"
            },
            {
              "label": "Parent account"
            },
            {
              "label": "Account status"
            },
            {
              "label": "Benefit restriction code",
              "lastChild": true
            }
          ],
          "col2": [
            {
              "label": "Record type"
            },
            {
              "label": "Client type"
            },
            {
              "label": "Account business type"
            },
            {
              "label": "Account effective start date",
              "format": "date"
            },
            {
              "label": "Account effective end date",
              "format": "date"
            },
            {
              "label": "Business region"
            },
            {
              "label": "Is this organization an employer?",
              "format": "boolean"
            },
            {
              "label": "Is there a broker/referral company for this organization?",
              "format": "boolean",
              "lastChild": true
            }
          ]
        },
        "Account team": {
          "col1": [
            {
              "label": "Client Operations Manager",
              "format": "person",
              "lastChild": true
            }
          ],
          "col2": [
            {
              "label": "Sales Agent",
              "format": "person",
              "lastChild": true
            },
          ]
        },
        "Client team": {
          "col1": [
            {
              "label": "Primary daily contact",
              "format": "person"
            },
            {
              "label": "Primary billing contact",
              "format": "person",
              "lastChild": true
            }
          ],
          "col2": [
            {
              "label": "Secondary billing contact",
              "format": "person"
            }
          ]
        },
        "Account details": {
          "col1": [
            {
              "label": "Number of employees"
            },
            {
              "label": "Covered lives"
            },
            {
              "label": "Union population",
              "lastChild": true
            }
          ],
          "col2": [
            {
              "label": "Org hierarchy ID"
            },
            {
              "label": "Billing org of the invoice recipient"
            }
          ]
        },
        "Address": {
          "col1": [
            {
              "label": "Address line 1"
            },
            {
              "label": "Address line 2"
            },
            {
              "label": "City"
            },
            {
              "label": "State",
              "lastChild": true
            }
          ],
          "col2": [
            {
              "label": "Postal"
            },
            {
              "label": "Country"
            },
            {
              "label": "Phone number",
              "lastChild": true
            }
          ]
        }
      }
    );
  });

  it("returns empty structure when no data is provided", () => {
    const result = renderGeneralSettingOverview(undefined as any);
    expect(result).toMatchObject(
      {
        "Account overview": {
          "col1": [
            {
              "label": "Organization name (Admin)"
            },
            {
              "label": "Name (LCRM-Teladoc)"
            },
            {
              "label": "Name (LCRM-Livongo)"
            },
            {
              "label": "Friendly account name"
            },
            {
              "label": "Doing business as"
            },
            {
              "label": "Parent account"
            },
            {
              "label": "Account status"
            },
            {
              "label": "Benefit restriction code",
              "lastChild": true
            }
          ],
          "col2": [
            {
              "label": "Record type"
            },
            {
              "label": "Client type"
            },
            {
              "label": "Account business type"
            },
            {
              "label": "Account effective start date",
              "format": "date"
            },
            {
              "label": "Account effective end date",
              "format": "date"
            },
            {
              "label": "Business region"
            },
            {
              "label": "Is this organization an employer?",
              "format": "boolean"
            },
            {
              "label": "Is there a broker/referral company for this organization?",
              "format": "boolean",
              "lastChild": true
            }
          ]
        },
        "Account team": {
          "col1": [
            {
              "label": "Client Operations Manager",
              "format": "person",
              "lastChild": true
            }
          ],
          "col2": [
            {
              "label": "Sales Agent",
              "format": "person",
              "lastChild": true
            },
          ]
        },
        "Client team": {
          "col1": [
            {
              "label": "Primary daily contact",
              "format": "person"
            },
            {
              "label": "Primary billing contact",
              "format": "person",
              "lastChild": true
            }
          ],
          "col2": [
            {
              "label": "Secondary billing contact",
              "format": "person"
            }
          ]
        },
        "Account details": {
          "col1": [
            {
              "label": "Number of employees"
            },
            {
              "label": "Covered lives"
            },
            {
              "label": "Union population",
              "lastChild": true
            }
          ],
          "col2": [
            {
              "label": "Org hierarchy ID"
            },
            {
              "label": "Billing org of the invoice recipient"
            }
          ]
        },
        "Address": {
          "col1": [
            {
              "label": "Address line 1"
            },
            {
              "label": "Address line 2"
            },
            {
              "label": "City"
            },
            {
              "label": "State",
              "lastChild": true
            }
          ],
          "col2": [
            {
              "label": "Postal"
            },
            {
              "label": "Country"
            },
            {
              "label": "Phone number",
              "lastChild": true
            }
          ]
        }
      }
    );
  });
});
