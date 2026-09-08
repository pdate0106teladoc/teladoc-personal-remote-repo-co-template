import { describe, it, expect } from "vitest";
import {
  renderGeneralSettingOverviewSec1,
  renderGeneralSettingOverviewSec2,
  renderGroupPermissions,
  renderGroupRelationships,
  renderClinicalAndMemberSupport,
} from "../general-setting";

describe("renderGeneralSettingOverviewSec1", () => {
  it("returns correct structure when all data is provided", () => {
    const mockData: any = {
      overview: {
        groupOverview: {
          groupName: "Group A",
          clientAccountTeladoc: "Teladoc Account",
          clientAccountLivongo: "Livongo Account",
          account: "Account A",
          legacyGroupId: "Legacy123",
          groupId: "Group123",
          revenueBucket: "Revenue A",
          lineOfBusiness: "Business A",
          namespace: "Namespace A",
          clientManager: "Manager A",
          status: "Active",
          effectiveStartDate: "2023-01-01",
          effectiveEndDate: "2023-12-31",
          terminationDate: "2024-01-01",
          clientOverviewName: "Overview A",
          clientOverviewStatus: "Status A",
          contractpath: "Path A",
          domesticCountry: "Country A",
        },
        brand: {
          oneAppAccess: true,
          healthAssistant: false,
          oneAppStartDate: "2023-01-01",
          migrationGroupNumber: "Migration123",
        },
        ccmConfiguration:
        {
          livongoRegistrationCode: "Code123",
          livongoClientMemberCode: "Member123",
          enableChronicCareReferrals: "None",
          enableCoreAdminImport: false,
          registrationName: "Registration A",
          ccmRegistrationAddressType: "Address A",
          registrationFlowScenarios: "Scenario A",
          registrationCustomizations: "Customization A",
          chronicCarePopulationType: "Type A",
          chronicCarePopulationCoverage: "Coverage A",
          welcomeKitsShippedByUpsNotFedex: true,
        },
      },
    };
    const result = renderGeneralSettingOverviewSec1(mockData);
    expect(result).toMatchObject(
      {
        "Group overview": {
          "col1": [
            {
              "label": "Group name (Admin)",
              "value": "Group A"
            },
            {
              "label": "Client account (LCRM-teladoc)",
              "value": "Teladoc Account"
            },
            {
              "label": "Client account (LCRM-livongo)",
              "value": "Livongo Account"
            },
            {
              "label": "Account (Client Overview)",
              "value": "Account A"
            },
            {
              "label": "Legacy group ID",
              "value": "Legacy123"
            },
            {
              "label": "Group ID",
              "value": "Group123"
            },
            {
              "label": "Revenue bucket",
              "value": "Revenue A"
            },
            {
              "label": "Line of business",
              "value": "Business A"
            },
            {
              "label": "Namespace",
              "value": "Namespace A",
              "lastChild": true
            }
          ],
          "col2": [
            {
              "label": "Client manager",
              "value": "Manager A",
              "format": "person",
              "personMeta": { "initials": "", "name": "" }
            },
            {
             "format": "person",
            "label": "Client Implementation Manager",
            "personMeta": { "initials": "", "name": "" },
            "value": undefined,
      },
            {
              "label": "Status",
              "value": "Active"
            },
            {
              "label": "Effective start date",
              "value": "2023-01-01",
              "format": "date"
            },
            {
              "label": "Effective end date",
              "value": "2023-12-31",
              "format": "date"
            },
            {
              "label": "Termination date",
              "value": "2024-01-01",
              "format": "date"
            },
            {
              "label": "Client overview name",
              "value": "Overview A"
            },
            {
              "label": "Client overview status",
              "value": "Status A"
            },
            {
              "label": "Contract path",
              "value": "Path A"
            },
            {
              "label": "Domestic country",
              "value": "Country A",
              "lastChild": true
            }
          ]
        },
        "Brand": {
          "col1": [
            {
              "label": "OneApp access",
              "value": true,
              "format": "boolean"
            },
            {
              "label": "Health assistant",
              "value": false,
              "format": "boolean",
              "lastChild": true
            }
          ],
          "col2": [
            {
              "label": "OneApp start date",
              "value": "2023-01-01",
              "format": "date"
            },
            {
              "label": "Migration group number",
              "value": "Migration123",
              "lastChild": true
            }
          ]
        },
        "CCM configuration": {
          "col1": [
            {
              "label": "Livongo registration code",
              "value": "Code123"
            },
            {
              "label": "Livongo client member code",
              "value": "Member123"
            },
            {
              "label": "Enable chronic care referrals",
              "value": "None",
            },
            {
              "label": "Enable core admin import?",
              "value": false
            },
            {
              "label": "Registration name",
              "value": "Registration A"
            },
            {
              "label": "CCM registration address type",
              "value": "Address A",
              "lastChild": true
            }
          ],
          "col2": [
            {
              "label": "CCM Registration flow scenarios",
              "value": "Scenario A"
            },
            {
              "label": "Registration customizations",
              "value": "Customization A"
            },
            {
              "label": "Chronic care population type",
              "value": "Type A"
            },
            {
              "label": "Chronic care population coverage",
              "value": "Coverage A"
            },
            {
              "label": "myStrength global access code",
              "value": undefined
            },
            {
              "label": "Welcome kits shipped by UPS, not FedEx",
              "value": true,
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
        groupOverview: {},
        brand: {},
        ccmConfiguration: [{}],
      },
    };

    const result = renderGeneralSettingOverviewSec1(mockData);

    expect(result).toMatchObject(
      {
        "Group overview": {
          "col1": [
            {
              "label": "Group name (Admin)"
            },
            {
              "label": "Client account (LCRM-teladoc)"
            },
            {
              "label": "Client account (LCRM-livongo)"
            },
            {
              "label": "Account (Client Overview)"
            },
            {
              "label": "Legacy group ID"
            },
            {
              "label": "Group ID"
            },
            {
              "label": "Revenue bucket"
            },
            {
              "label": "Line of business"
            },
            {
              "label": "Namespace",
              "lastChild": true
            }
          ],
          "col2": [
            {
              "label": "Client manager",
              "format": "person"
            },
            {
              "format": "person",
              "label": "Client Implementation Manager",
              "personMeta": { "initials": "", "name": "" },
              "value": undefined,
      },
            {
              "label": "Status"
            },
            {
              "label": "Effective start date",
              "format": "date"
            },
            {
              "label": "Effective end date",
              "format": "date"
            },
            {
              "label": "Termination date",
              "format": "date"
            },
            {
              "label": "Client overview name"
            },
            {
              "label": "Client overview status"
            },
            {
              "label": "Contract path"
            },
            {
              "label": "Domestic country",
              "lastChild": true
            }
          ]
        },
        "Brand": {
          "col1": [
            {
              "label": "OneApp access",
              "format": "boolean"
            },
            {
              "label": "Health assistant",
              "format": "boolean",
              "lastChild": true
            }
          ],
          "col2": [
            {
              "label": "OneApp start date",
              "format": "date"
            },
            {
              "label": "Migration group number",
              "lastChild": true
            }
          ]
        },
        "CCM configuration": {
          "col1": [
            {
              "label": "Livongo registration code"
            },
            {
              "label": "Livongo client member code"
            },
            {
              "label": "Enable chronic care referrals"
            },
            {
              "label": "Enable core admin import?"
            },
            {
              "label": "Registration name"
            },
            {
              "label": "CCM registration address type",
              "lastChild": true
            }
          ],
          "col2": [
            {
              "label": "CCM Registration flow scenarios"
            },
            {
              "label": "Registration customizations"
            },
            {
              "label": "Chronic care population type"
            },
            {
              "label": "Chronic care population coverage"
            },
            {
              "label": "myStrength global access code"
            },
            {
              "label": "Welcome kits shipped by UPS, not FedEx",
              "lastChild": true
            }
          ]
        }
      }
    );
  });
});

describe("renderGeneralSettingOverviewSec2", () => {
  it("returns correct structure when all data is provided", () => {
    const mockData: any = {
      overview: {
        additionalDetails: {
          benefitRestrictionCode: "Code123",
          groupType: "Type A",
          brandCode: "Brand123",
          state: "State A",
          soldToAccountName: "Account A",
          ccmExternalTags: "Tags A",
          notesInternal: "Internal Notes",
          notesExternal: "External Notes",
          registrationGroupCode: "Reg123",
        },
      },
    };

    const result = renderGeneralSettingOverviewSec2(mockData);
    expect(result).toMatchObject(
      {
        "Additional details": {
          "col1": [
            {
              "label": "Benefit restriction code",
              "value": "Code123"
            },
            {
              "label": "Registration group code",
              "value": "Reg123"
            },
            {
              "label": "Group type",
              "value": "Type A"
            },
            {
              "label": "Brand code",
              "value": "Brand123"
            },
            {
              "label": "State",
              "value": "State A",
              "lastChild": true
            }
          ],
          "col2": [
            {
              "fieldKey": "overview.additionalDetails.soldToAccountName",
              "label": "Sold to account name",
              "metadata": undefined,
              "value": "Account A"
            },
            {
              "fieldKey": "overview.groupOverview.soldToAccountUUID",
              "label": "Sold to account GUID",
              "metadata": undefined,
              "value": undefined
            },
            {
              "fieldKey": "overview.additionalDetails.ccmExternalTags",
              "label": "CCM external tags",
              "metadata": undefined,
              "value": "Tags A"
            },
            {
              "fieldKey": "overview.additionalDetails.notesInternal",
              "label": "Notes (internal)",
              "metadata": undefined,
              "value": "Internal Notes"
            },
            {
              "fieldKey": "overview.additionalDetails.notesExternal",
              "label": "Notes (external)",
              "metadata": undefined,
              "value": "External Notes"
            },
            {
              "fieldKey": "overview.additionalDetails.specialInstructions",
              "label": "Any special instructions",
              "lastChild": true,
              "metadata": undefined,
              "value": undefined
            }
          ]
        }
      }
    );
  });

  it("handles missing data gracefully", () => {
    const mockData: any = {
      overview: {
        additionalDetails: {},
      },
    };

    const result = renderGeneralSettingOverviewSec2(mockData);
    expect(result).toMatchObject(
      {
        "Additional details": {
          "col1": [
            {
              "label": "Benefit restriction code"
            },
            {
              "label": "Registration group code"
            },
            {
              "label": "Group type"
            },
            {
              "label": "Brand code"
            },
            {
              "label": "State",
              "lastChild": true
            }
          ],
          "col2": [
            {
              "fieldKey": "overview.additionalDetails.soldToAccountName",
              "label": "Sold to account name",
              "metadata": undefined,
              "value": undefined
            },
            {
              "fieldKey": "overview.groupOverview.soldToAccountUUID",
              "label": "Sold to account GUID",
              "metadata": undefined,
              "value": undefined
            },
            {
              "fieldKey": "overview.additionalDetails.ccmExternalTags",
              "label": "CCM external tags",
              "metadata": undefined,
              "value": undefined
            },
            {
              "fieldKey": "overview.additionalDetails.notesInternal",
              "label": "Notes (internal)",
              "metadata": undefined,
              "value": undefined
            },
            {
              "fieldKey": "overview.additionalDetails.notesExternal",
              "label": "Notes (external)",
              "metadata": undefined,
              "value": undefined
            },
            {
              "fieldKey": "overview.additionalDetails.specialInstructions",
              "label": "Any special instructions",
              "lastChild": true,
              "metadata": undefined,
              "value": undefined
            }
          ]
        }
      }
    );
  });

  it("returns empty structure when no data is provided", () => {
    const result = renderGeneralSettingOverviewSec2(undefined as any);
    expect(result).toMatchObject(
      {
        "Additional details": {
          "col1": [
            {
              "label": "Benefit restriction code"
            },
            {
              "label": "Registration group code"
            },
            {
              "label": "Group type"
            },
            {
              "label": "Brand code"
            },
            {
              "label": "State",
              "lastChild": true
            }
          ],
          "col2": [
            {
              "fieldKey": "overview.additionalDetails.soldToAccountName",
              "label": "Sold to account name",
              "metadata": undefined,
              "value": undefined
            },
            {
              "fieldKey": "overview.groupOverview.soldToAccountUUID",
              "label": "Sold to account GUID",
              "metadata": undefined,
              "value": undefined
            },
            {
              "fieldKey": "overview.additionalDetails.ccmExternalTags",
              "label": "CCM external tags",
              "metadata": undefined,
              "value": undefined
            },
            {
              "fieldKey": "overview.additionalDetails.notesInternal",
              "label": "Notes (internal)",
              "metadata": undefined,
              "value": undefined
            },
            {
              "fieldKey": "overview.additionalDetails.notesExternal",
              "label": "Notes (external)",
              "metadata": undefined,
              "value": undefined
            },
            {
              "fieldKey": "overview.additionalDetails.specialInstructions",
              "label": "Any special instructions",
              "lastChild": true,
              "metadata": undefined,
              "value": undefined
            }
          ]
        }
      }
    );
  });
});

describe("renderGroupPermissions", () => {
  it("returns correct structure when all data is provided", () => {
    const mockData: any = {
      groupPermissions: {
        generalGroupPermissions: {
          sendMemberResolutionLetter: true,
          sendUtilizationLetter: false,
          sendFraudWasteAndAbuseTermLetter: true,
          sendProblemMemberLetter: false,
          hhsAccess: true,
          enableHealthDataVisualization: false,
        },
        memberAccessPermissions: {
          allowedNoUsernamePassword: true,
          dualAccess: false,
          webAccess: true,
          mobileAccess: false,
          allowConversionToRetail: true,
          vipMember: true,
          enableGeoFencing: true,
          restrictedPhiAccess: false,
          ccmMultifactorAuthentication: true,
          allowRegistrationsViaCallCenter: false,
          allowConsultationRequestsViaCallCenter: true,
          sendPromoCode: "Promo123",
          requireSecurityQuestionsCount: 3,
          enableRestrictedMemberDownloads: true,
          linkExpirationTimeHours: 24,
          dateOfBirthCanBeNull: false,
          enableWellnessContent: true,
          hideSexualOrientationGenderIdentityQuestions: false,
        },
        memberVisitPermissions: {
          sendCcrToPcp: true,
          disablePatientExcuseNote: false,
          inHomeRxDelivery: true,
        },
        memberRegistrationPermissions: {
          twoStepAuthentication: true,
          twoStepMail: false,
          twoStepSms: true,
          twoPhoneCall: false,
        },
        performanceGuaranteesAndServiceLevels: {
          standardServiceLevel: "Standard123",
          vipServiceLevel: "VIP123",
          slawWaiveVisitFeeIfMissed: true,
          performanceGuarantee: false,
        },
      },
    };

    const result = renderGroupPermissions(mockData);
    expect(result).toMatchObject(
      {
        "General group permissions": {
          "col1": [
            {
              "label": "Send member resolution letter",
              "value": true,
              "format": "boolean"
            },
            {
              "label": "Send utilization letter",
              "value": false,
              "format": "boolean"
            },
            {
              "label": "Send fraud, waste and abuse term letter",
              "value": true,
              "format": "boolean",
              "lastChild": true
            }
          ],
          "col2": [
            {
              "label": "Send problem member letter",
              "value": false,
              "format": "boolean"
            },
            {
              "label": "HHS access",
              "value": true,
              "format": "boolean"
            },
            {
              "label": "Enable health data visualization",
              "value": false,
              "format": "boolean",
              "lastChild": true
            }
          ]
        },
        "Member access permissions": {
          "col1": [
            {
              "label": "Allowed no username/password",
              "value": true,
              "format": "boolean"
            },
            {
              "label": "Dual access",
              "value": false,
              "format": "boolean"
            },
            {
              "label": "Web access",
              "value": true,
              "format": "boolean"
            },
            {
              "label": "Mobile access",
              "value": false,
              "format": "boolean"
            },
            {
              "label": "Allow conversion to retail",
              "value": true,
              "format": "boolean"
            },
            {
              "label": "VIP members",
              "value": true,
              "format": "boolean"
            },
            {
              "label": "Enable geo-fencing",
              "value": true,
              "format": "boolean"
            },
            {
              "label": "Restricted PHI access",
              "value": false,
              "format": "boolean"
            },
            {
              "label": "CCM multifactor authentication",
              "value": true
            },
            {
              "label": "myStrength global access code",
              "lastChild": true
            }
          ],
          "col2": [
            {
              "label": "Allow registrations via call center",
              "value": false,
              "format": "boolean"
            },
            {
              "label": "Allow consultation requests via call center",
              "value": true,
              "format": "boolean"
            },
            {
              "label": "Send promo code",
              "value": "Promo123"
            },
            {
              "label": "Require security questions count",
              "value": 3
            },
            {
              "label": "Enable restricted member downloads",
              "value": true,
              "format": "boolean"
            },
            {
              "label": "Link expiration time hours",
              "value": 24
            },
            {
              "label": "Date of birth can be null",
              "value": false,
              "format": "boolean"
            },
            {
              "label": "Enable wellness content",
              "value": true,
              "format": "boolean"
            },
            {
              "label": "Hide sexual orientation and gender identity questions?",
              "value": false,
              "format": "boolean",
              "lastChild": true
            }
          ]
        },
        "Member visit permissions": {
          "col1": [
            {
              "label": "Send CCR to PCP",
              "value": true,
            },
            {
              "label": "Disable patient excuse note",
              "value": false,
              "format": "boolean",
              "lastChild": true
            }
          ],
          "col2": [
            {
              "label": "In home Rx delivery",
              "value": true,
              "format": "boolean",
              "lastChild": true
            }
          ]
        },
        "Member registration permissions": {
          "col1": [
            {
              "label": "Two step authentication",
              "value": true,
              "format": "boolean"
            },
            {
              "label": "Two step Email",
              "value": false,
              "format": "boolean",
              "lastChild": true
            }
          ],
          "col2": [
            {
              "label": "Two step SMS",
              "value": true,
              "format": "boolean"
            },
            {
              "label": "Two step Phone Call",
              "value": false,
              "format": "boolean",
              "lastChild": true
            }
          ]
        },
        "Performance guarantees and service levels": {
          "col1": [
            {
              "label": "Standard service level",
              "value": "Standard123"
            },
            {
              "label": "VIP service level",
              "value": "VIP123",
              "lastChild": true
            }
          ],
          "col2": [
            {
              "label": "SLA - waive visit fee if missed",
              "value": true,
              "format": "boolean"
            },
            {
              "label": "Performance guarantee",
              "value": false,
              "format": "boolean",
              "lastChild": true
            }
          ]
        }
      }
    );
  });

  it("handles missing data gracefully", () => {
    const mockData: any = {
      groupPermissions: {},
    };
    const result = renderGroupPermissions(mockData);
    expect(result).toMatchObject({
      "General group permissions": {
        "col1": [
          {
            "label": "Send member resolution letter",
            "format": "boolean"
          },
          {
            "label": "Send utilization letter",
            "format": "boolean"
          },
          {
            "label": "Send fraud, waste and abuse term letter",
            "format": "boolean",
            "lastChild": true
          }
        ],
        "col2": [
          {
            "label": "Send problem member letter",
            "format": "boolean"
          },
          {
            "label": "HHS access",
            "format": "boolean"
          },
          {
            "label": "Enable health data visualization",
            "format": "boolean",
            "lastChild": true
          }
        ]
      },
      "Member access permissions": {
        "col1": [
          {
            "label": "Allowed no username/password",
            "format": "boolean"
          },
          {
            "label": "Dual access",
            "format": "boolean"
          },
          {
            "label": "Web access",
            "format": "boolean"
          },
          {
            "label": "Mobile access",
            "format": "boolean"
          },
          {
            "label": "Allow conversion to retail",
            "format": "boolean"
          },
          {
            "label": "VIP members",
            "format": "boolean"
          },
          {
            "label": "Enable geo-fencing",
            "format": "boolean"
          },
          {
            "label": "Restricted PHI access",
            "format": "boolean"
          },
          {
            "label": "CCM multifactor authentication"
          },
          {
            "label": "myStrength global access code",
            "lastChild": true
          }
        ],
        "col2": [
          {
            "label": "Allow registrations via call center",
            "format": "boolean"
          },
          {
            "label": "Allow consultation requests via call center",
            "format": "boolean"
          },
          {
            "label": "Send promo code"
          },
          {
            "label": "Require security questions count"
          },
          {
            "label": "Enable restricted member downloads",
            "format": "boolean"
          },
          {
            "label": "Link expiration time hours"
          },
          {
            "label": "Date of birth can be null",
            "format": "boolean"
          },
          {
            "label": "Enable wellness content",
            "format": "boolean"
          },
          {
            "label": "Hide sexual orientation and gender identity questions?",
            "format": "boolean",
            "lastChild": true
          }
        ]
      },
      "Member visit permissions": {
        "col1": [
          {
            "label": "Send CCR to PCP",
          },
          {
            "label": "Disable patient excuse note",
            "format": "boolean",
            "lastChild": true
          }
        ],
        "col2": [
          {
            "label": "In home Rx delivery",
            "format": "boolean",
            "lastChild": true
          }
        ]
      },
      "Member registration permissions": {
        "col1": [
          {
            "label": "Two step authentication",
            "format": "boolean"
          },
          {
            "label": "Two step Email",
            "format": "boolean",
            "lastChild": true
          }
        ],
        "col2": [
          {
            "label": "Two step SMS",
            "format": "boolean"
          },
          {
            "label": "Two step Phone Call",
            "format": "boolean",
            "lastChild": true
          }
        ]
      },
      "Performance guarantees and service levels": {
        "col1": [
          {
            "label": "Standard service level"
          },
          {
            "label": "VIP service level",
            "lastChild": true
          }
        ],
        "col2": [
          {
            "label": "SLA - waive visit fee if missed",
            "format": "boolean"
          },
          {
            "label": "Performance guarantee",
            "format": "boolean",
            "lastChild": true
          }
        ]
      }
    });
  });

  it("returns empty structure when no data is provided", () => {
    const result = renderGroupPermissions(undefined as any);
    expect(result).toMatchObject(
      {
        "General group permissions": {
          "col1": [
            {
              "label": "Send member resolution letter",
              "format": "boolean"
            },
            {
              "label": "Send utilization letter",
              "format": "boolean"
            },
            {
              "label": "Send fraud, waste and abuse term letter",
              "format": "boolean",
              "lastChild": true
            }
          ],
          "col2": [
            {
              "label": "Send problem member letter",
              "format": "boolean"
            },
            {
              "label": "HHS access",
              "format": "boolean"
            },
            {
              "label": "Enable health data visualization",
              "format": "boolean",
              "lastChild": true
            }
          ]
        },
        "Member access permissions": {
          "col1": [
            {
              "label": "Allowed no username/password",
              "format": "boolean"
            },
            {
              "label": "Dual access",
              "format": "boolean"
            },
            {
              "label": "Web access",
              "format": "boolean"
            },
            {
              "label": "Mobile access",
              "format": "boolean"
            },
            {
              "label": "Allow conversion to retail",
              "format": "boolean"
            },
            {
              "label": "VIP members",
              "format": "boolean"
            },
            {
              "label": "Enable geo-fencing",
              "format": "boolean"
            },
            {
              "label": "Restricted PHI access",
              "format": "boolean"
            },
            {
              "label": "CCM multifactor authentication"
            },
            {
              "label": "myStrength global access code",
              "lastChild": true
            }
          ],
          "col2": [
            {
              "label": "Allow registrations via call center",
              "format": "boolean"
            },
            {
              "label": "Allow consultation requests via call center",
              "format": "boolean"
            },
            {
              "label": "Send promo code"
            },
            {
              "label": "Require security questions count"
            },
            {
              "label": "Enable restricted member downloads",
              "format": "boolean"
            },
            {
              "label": "Link expiration time hours"
            },
            {
              "label": "Date of birth can be null",
              "format": "boolean"
            },
            {
              "label": "Enable wellness content",
              "format": "boolean"
            },
            {
              "label": "Hide sexual orientation and gender identity questions?",
              "format": "boolean",
              "lastChild": true
            }
          ]
        },
        "Member visit permissions": {
          "col1": [
            {
              "label": "Send CCR to PCP",
            },
            {
              "label": "Disable patient excuse note",
              "format": "boolean",
              "lastChild": true
            }
          ],
          "col2": [
            {
              "label": "In home Rx delivery",
              "format": "boolean",
              "lastChild": true
            }
          ]
        },
        "Member registration permissions": {
          "col1": [
            {
              "label": "Two step authentication",
              "format": "boolean"
            },
            {
              "label": "Two step Email",
              "format": "boolean",
              "lastChild": true
            }
          ],
          "col2": [
            {
              "label": "Two step SMS",
              "format": "boolean"
            },
            {
              "label": "Two step Phone Call",
              "format": "boolean",
              "lastChild": true
            }
          ]
        },
        "Performance guarantees and service levels": {
          "col1": [
            {
              "label": "Standard service level"
            },
            {
              "label": "VIP service level",
              "lastChild": true
            }
          ],
          "col2": [
            {
              "label": "SLA - waive visit fee if missed",
              "format": "boolean"
            },
            {
              "label": "Performance guarantee",
              "format": "boolean",
              "lastChild": true
            }
          ]
        }
      }
    );
  });
});

describe("renderGroupRelationships", () => {
  it("returns correct structure when all data is provided", () => {
    const mockData: any = {
      groupRelationShips: [
        {
          roleType: "Role A",
          memberGroupName: "Group A",
          sourceAccount: "Account A",
          memberGroup: "Group B",
          memberGroupStatus: "Active",
          duplicateKey: "Key123",
        },
      ],
    };

    const result = renderGroupRelationships(mockData);
    expect(result).toMatchObject(
      {
        "Group relationship 1": {
          "col1": [
            {
        "format": "boolean",
        "label": "Has broker",
        "value": undefined,
      },
            {
              "label": "Role type",
              "value": "Role A"
            },
            {
              "label": "Member group name",
              "value": "Group A"
            },
            {
              "label": "Source account",
              "value": "Account A",
              "lastChild": true
            }
          ],
          "col2": [
            {
              "label": "Member group",
              "value": "Group B"
            },
            {
              "label": "Member group status",
              "value": "Active"
            },
            {
              "label": "Duplicate key",
              "value": "Key123",
              "lastChild": true
            }
          ]
        }
      }
    );
  });

  it("handles missing data gracefully", () => {
    const mockData: any = {
      groupRelationShips: [{}],
    };

    const result = renderGroupRelationships(mockData);
    expect(result).toMatchObject(
      {
        "Group relationship 1": {
          "col1": [
            {
            "format": "boolean",
            "label": "Has broker",
            "value": undefined,
            },
            {
              "label": "Role type"
            },
            {
              "label": "Member group name"
            },
            {
              "label": "Source account",
              "lastChild": true
            }
          ],
          "col2": [
            {
              "label": "Member group"
            },
            {
              "label": "Member group status"
            },
            {
              "label": "Duplicate key",
              "lastChild": true
            }
          ]
        }
      }
    );
  });

  it("returns empty structure when no data is provided", () => {
    const result = renderGroupRelationships(undefined as any);
    expect(result).toMatchObject({});
  });
});

describe("renderClinicalAndMemberSupport", () => {
  it("returns correct structure when all data is provided", () => {
    const mockData: any = {
      clinicalAndMemberSupport: {
        ccmClinicalDetails: {
          clinicalModel: "Model A",
          clinicalDataSharingAccess: true,
          clinicalReferrals: "Referral A",
          clinicalModelDetails: "Details A",
        },
        ccmMemberSupportDetails: {
          memberSupportURL: "https://example.com",
          memberSupportPhone: "123-456-7890",
        },
      },
    };

    const result = renderClinicalAndMemberSupport(mockData);
    expect(result).toMatchObject(
      {
        "CCM clinical details": {
          "col1": [
            {
              "label": "Clinical model",
              "value": "Model A"
            },
            {
              "label": "Clinical data sharing access",
              "value": true,
              "lastChild": true
            }
          ],
          "col2": [
            {
              "label": "Clinical referrals",
              "value": "Referral A"
            },
            {
              "label": "Clinical model details",
              "value": "Details A",
              "lastChild": true
            }
          ]
        },
        "CCM member support details": {
          "col1": [
            {
              "label": "Member support URL",
              "value": "https://example.com",
              "lastChild": true
            }
          ],
          "col2": [
            {
              "label": "Member support phone",
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
      clinicalAndMemberSupport: {
        ccmClinicalDetails: {},
        ccmMemberSupportDetails: {},
      },
    };

    const result = renderClinicalAndMemberSupport(mockData);
    expect(result).toMatchObject(
      {
        "CCM clinical details": {
          "col1": [
            {
              "label": "Clinical model"
            },
            {
              "label": "Clinical data sharing access",
              "lastChild": true
            }
          ],
          "col2": [
            {
              "label": "Clinical referrals"
            },
            {
              "label": "Clinical model details",
              "lastChild": true
            }
          ]
        },
        "CCM member support details": {
          "col1": [
            {
              "label": "Member support URL",
              "lastChild": true
            }
          ],
          "col2": [
            {
              "label": "Member support phone",
              "lastChild": true
            }
          ]
        }
      }
    );
  });

  it("returns empty structure when no data is provided", () => {
    const result = renderClinicalAndMemberSupport(undefined as any);
    expect(result).toMatchObject({
      "CCM clinical details": {
        "col1": [
          {
            "label": "Clinical model"
          },
          {
            "label": "Clinical data sharing access",
            "lastChild": true
          }
        ],
        "col2": [
          {
            "label": "Clinical referrals"
          },
          {
            "label": "Clinical model details",
            "lastChild": true
          }
        ]
      },
      "CCM member support details": {
        "col1": [
          {
            "label": "Member support URL",
            "lastChild": true
          }
        ],
        "col2": [
          {
            "label": "Member support phone",
            "lastChild": true
          }
        ]
      }
    });
  });
});
