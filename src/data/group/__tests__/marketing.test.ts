import { describe, it, expect } from "vitest";
import {
  renderMarketingOverview,
  renderMarketingTelemedicine,
  renderMarketingCcm,
} from "../marketing";

/** Recursively strips `fieldKey` and `metadata` so tests stay focused on business fields. */
function stripMetaFields(obj: any): any {
  if (Array.isArray(obj)) return obj.map(stripMetaFields);
  if (obj !== null && typeof obj === "object") {
    const { fieldKey: _fk, metadata: _md, ...rest } = obj;
    return Object.fromEntries(Object.entries(rest).map(([k, v]) => [k, stripMetaFields(v)]));
  }
  return obj;
}

describe("renderMarketingOverview", () => {
  it("returns correct structure when all data is provided", () => {
    const mockData: any = {
      overview: {
        brand: {
          serviceBrand: "Brand A",
        },
        contacts: {
          isActiveUserForTelemedProgram: true,
          marketingSiteUserTelemed: "User A",
          isActiveUserForCcmProgram: false,
          marketingSiteUserCcm: "User B",
        },
        telemedicineLogos: {
          logoTag: "Tag A",
          logoTagID: "ID A",
          logos: [
            { logo: "Logo1", logoId: "LogoID1" },
            { logo: "Logo2", logoId: "LogoID2" },
          ],
          altLogos: [
            { altLogo: "AltLogo1", altLogoId: "AltLogoID1" },
            { altLogo: "AltLogo2", altLogoId: "AltLogoID2" },
          ],
          coBrandWithLogo: "CoBrand A",
          triBrandWithLogo: "TriBrand A",
          logoTitle: "Title A",
          logoDescription: "Description A",
          sfmcId: "SFMC123",
          currencyISOCode: "USD",
          fileExtension: ".png",
        },
        ccmLogos: {
          logoFileName: "FileName A",
          clientLogoLink: "https://example.com/logo",
        },
      },
    };

    const result = renderMarketingOverview(mockData);

    expect(stripMetaFields(result)).toEqual({
      Brand: {
        col1: [{ label: "Service brand", value: "Brand A", lastChild: true }],
        col2: [],
      },
      "Telemed Logos": {
        col1: [
          { label: "Logo tag #", value: "Tag A", format: "img" },
          { label: "Logo tag #ID", value: "ID A" },
          { label: "Logo 1", value: "Logo1", format: "img" },
          { label: "Logo 1_ID", value: "LogoID1" },
          { label: "Logo 3", value: "Logo2", format: "img" },
          { label: "Logo 3_ID", value: "LogoID2" },
          { label: "Logo 4", format: "img", value: undefined },
          { label: "Logo 4_ID", value: undefined },
          { label: "Co-brand with logo", value: "CoBrand A" },
          {
            label: "Tri-brand with logo",
            value: "TriBrand A",
            lastChild: true,
          },
        ],
        col2: [
          { label: "Altlogo1", value: "AltLogo1", format: "img" },
          { label: "Altlogo1 ID", value: "AltLogoID1" },
          { label: "Altlogo2", value: "AltLogo2", format: "img" },
          { label: "Altlogo2 ID", value: "AltLogoID2" },
          { label: "Logo tile", value: "Title A" },
          { label: "Logo description", value: "Description A" },
          { label: "SFMC ID", value: "SFMC123" },
          { label: "Currency ISO code", value: "USD" },
          { label: "File extension", value: ".png" },
        ],
      },
      "CCM Logos": {
        col1: [
          { label: "Logo file name", value: "FileName A", lastChild: true },
        ],
        col2: [
          {
            label: "Client logo link",
            value: "https://example.com/logo",
            format: "link",
            lastChild: true,
          },
        ],
      },
      Contacts: {
        col1: [
          {
            label: "Marketing site - active user for Telemed program?",
            value: true,
            format: "boolean",
          },
          {
            label: "Marketing site user - Telemed",
            value: "User A",
            format: "person",
            lastChild: true,
          },
        ],
        col2: [
          {
            label: "Marketing site - active user for CCM program?",
            value: false,
            format: "boolean",
          },
          {
            label: "Marketing site user - CCM",
            value: "User B",
            format: "person",
            lastChild: true,
          },
        ],
      },
    });
  });

  it("handles missing data gracefully", () => {
    const mockData: any = {
      overview: {
        brand: {},
        contacts: {},
        telemedicineLogos: {},
        ccmLogos: {},
      },
    };

    const result = renderMarketingOverview(mockData);

    expect(stripMetaFields(result)).toEqual({
      Brand: { col1: [{ label: "Service brand", value: undefined, lastChild: true }], col2: [] },
      "Telemed Logos": {
        col1: [
          { label: "Logo tag #", format: "img", value: undefined },
          { label: "Logo tag #ID", value: undefined },
          { label: "Logo 1", format: "img", value: undefined },
          { label: "Logo 1_ID", value: undefined },
          { label: "Logo 3", format: "img", value: undefined },
          { label: "Logo 3_ID", value: undefined },
          { label: "Logo 4", format: "img", value: undefined },
          { label: "Logo 4_ID", value: undefined },
          { label: "Co-brand with logo", value: undefined },
          { label: "Tri-brand with logo", lastChild: true, value: undefined },
        ],
        col2: [
          { label: "Altlogo1", format: "img", value: undefined },
          { label: "Altlogo1 ID", value: undefined },
          { label: "Altlogo2", format: "img", value: undefined },
          { label: "Altlogo2 ID", value: undefined },
          { label: "Logo tile", value: undefined },
          { label: "Logo description", value: undefined },
          { label: "SFMC ID", value: undefined },
          { label: "Currency ISO code", value: undefined },
          { label: "File extension", value: undefined },
        ],
      },
      "CCM Logos": {
        col1: [{ label: "Logo file name", value: undefined, lastChild: true }],
        col2: [
          {
            label: "Client logo link",
            value: "-",
            format: "link",
            lastChild: true,
          },
        ],
      },
      Contacts: {
        col1: [
          { label: "Marketing site - active user for Telemed program?", format: "boolean", value: undefined },
          { label: "Marketing site user - Telemed", format: "person", value: undefined, lastChild: true },
        ],
        col2: [
          {
            label: "Marketing site - active user for CCM program?",
            format: "boolean",
            value: undefined,
          },
          { label: "Marketing site user - CCM", format: "person", value: undefined, lastChild: true },
        ],
      },
    });
  });

  it("returns empty structure when no data is provided", () => {
    const result = renderMarketingOverview(undefined as any);
    expect(stripMetaFields(result)).toEqual({
      Brand: { col1: [{ label: "Service brand", value: undefined, lastChild: true }], col2: [] },
      "Telemed Logos": {
        col1: [
          { label: "Logo tag #", format: "img", value: undefined },
          { label: "Logo tag #ID", value: undefined },
          { label: "Logo 1", format: "img", value: undefined },
          { label: "Logo 1_ID", value: undefined },
          { label: "Logo 3", format: "img", value: undefined },
          { label: "Logo 3_ID", value: undefined },
          { label: "Logo 4", format: "img", value: undefined },
          { label: "Logo 4_ID", value: undefined },
          { label: "Co-brand with logo", value: undefined },
          { label: "Tri-brand with logo", lastChild: true, value: undefined },
        ],
        col2: [
          { label: "Altlogo1", format: "img", value: undefined },
          { label: "Altlogo1 ID", value: undefined },
          { label: "Altlogo2", format: "img", value: undefined },
          { label: "Altlogo2 ID", value: undefined },
          { label: "Logo tile", value: undefined },
          { label: "Logo description", value: undefined },
          { label: "SFMC ID", value: undefined },
          { label: "Currency ISO code", value: undefined },
          { label: "File extension", value: undefined },
        ],
      },
      "CCM Logos": {
        col1: [{ label: "Logo file name", value: undefined, lastChild: true }],
        col2: [
          {
            label: "Client logo link",
            value: "-",
            format: "link",
            lastChild: true,
          },
        ],
      },
      Contacts: {
        col1: [
          { label: "Marketing site - active user for Telemed program?", format: "boolean", value: undefined },
          { label: "Marketing site user - Telemed", format: "person", value: undefined, lastChild: true },
        ],
        col2: [
          {
            label: "Marketing site - active user for CCM program?",
            format: "boolean",
            value: undefined,
          },
          { label: "Marketing site user - CCM", format: "person", value: undefined, lastChild: true },
        ],
      },
    });
  });
});

describe("renderMarketingTelemedicine", () => {
  it("returns correct structure when all data is provided", () => {
    const mockData: any = {
      telemedicine: {
        marketingPreferences: {
          language: "English",
          healthBenefitLanguage: "Spanish",
          preferredEligibilityLanguage: "French",
          testingPermission: true,
          modelingPermission: false,
          communicationMode: "Email",
          registrationEnrollmentEngagementTier: "Tier A",
          emailOptIn: true,
          directMailOptIn: false,
          outboundCallsOptIn: true,
          textOptIn: false,
          incentivesOptIn: true,
          registrationEnrollmentJourney: "Journey A",
          ongoingRegistrationEnrollmentJourney: "Journey B",
        },
        marketingData: {
          receivingClaimsDataForTelemedPrograms: true,
        },
        welcomeLetter: {
          isValidMsuGroup: true,
          welcomeLetterTemplate: "Template A",
          cardName: "Card A",
          clientAccountLocation: "Location A",
          mkConsultArea: "Area A",
          disclaimerTeladoc: "Disclaimer A",
          clientDisclaimer: "Disclaimer B",
          disclaimerCustom: "Custom Disclaimer",
          sendCard: true,
          activeDate: "2023-01-01",
          shippingClass: "Class A",
          companyCopy: "Copy A",
          cmsCode: "SMS123",
          wkCardIncludesLogo: true,
          mkWelcomeMessage: "Welcome Message A",
          mkIdCardFront1: "Front1",
          mkIdCardFront2: "Front2",
          wkMailTo: "MailTo A",
          wkMailToAddress: "Address A",
          consultMessage: "Message A",
          consultMessageOnWelcomeLetter: true,
          welcomeLetterConsultMessage: "Consult Message A",
          wkIncludesInsert: true,
          insertDocumentName: "Document A",
          clientFormNumber: "Form123",
        },
        p360: {
          p360BrandRelationship: "Relationship A",
          p360URL: "https://example.com/p360",
          virtualFirstPlanName: "Plan A",
          virtualFirstHealthPlanSummary: "Summary A",
          healthPlanBoilerPlateCopy: "Copy A",
          virtualFirstHealthPlan: true,
          referralRequired: false,
        },
      },
    };

    const result = renderMarketingTelemedicine(mockData);

    expect(stripMetaFields(result)).toEqual({
      "Marketing preferences": {
        col1: [
          { label: "Language", value: "English" },
          { label: "Health benefit language", value: "Spanish" },
          { label: "Preferred eligibility language", value: "French" },
          { label: "Testing permission", value: true },
          { label: "Modeling permission", value: false },
          { label: "Communication mode", value: "Email" },
          {
            label: "Registration/enrollment engagement tier",
            value: "Tier A",
            lastChild: true,
          },
        ],
        col2: [
          { label: "Email opt-in", value: true },
          { label: "Direct mail opt-in", value: false },
          { label: "Outbound calls opt-in", value: true },
          { label: "Text opt-in", value: false },
          { label: "Incentives opt-in", value: true },
          { label: "Registration/enrollment journey", value: "Journey A" },
          {
            label: "Ongoing registration/enrollment journey",
            value: "Journey B",
            lastChild: true,
          },
        ],
      },
      "Wellbound EAP": {
        col1: [{
          label: "Wellbound EAP - BetterHelp URL",
          value: "-",
          format: "link",
          lastChild: true,
        }],
        col2: [{
          label: "Wellbound EAP - Teladoc URL",
          value: "-",
          format: "link",
          lastChild: true,
        }],
      },
      "Marketing data": {
        col1: [
          {
            label: "Receiving claims data from Telemed programs?",
            value: true,
            format: "boolean",
            lastChild: true,
          },
        ],
        col2: [],
      },
      "Welcome letter": {
        col1: [
          { label: "Wk template", value: "Template A" },
          { label: "Card name", value: "Card A" },
          { label: "Client account location", value: "Location A" },
          { label: "MK_consultarea", value: "Area A" },
          { label: "Disclaimer-teladoc", value: "Disclaimer A" },
          { label: "Disclaimer-client ", value: "Disclaimer B" },
          { label: "Disclaimer-custom", value: "Custom Disclaimer" },
          { label: "Send card", value: true, format: "boolean" },
          { label: "Active date", value: "2023-01-01", format: "date" },
          { label: "Shipping class", value: "Class A" },
          { label: "Company copy", value: "Copy A" },
          { label: "CMS code", value: "SMS123" },
          { label: "WK card includes logo?", value: true, format: "boolean", lastChild: true },
        ],
        col2: [
          { label: "MK-welcome message", value: "Welcome Message A" },
          { label: "MK_ID card front 1", value: "Front1" },
          { label: "MK_ID card front 2", value: "Front2" },
          { label: "WK mail-to", value: "MailTo A" },
          { label: "WK mail-to address", value: "Address A" },
          { label: "Consult message", value: "Message A" },
          {
            label: "Consult message on welcome letter?",
            value: true,
            format: "boolean",
          },
          {
            label: "Welcome letter consult message",
            value: "Consult Message A",
          },
          { label: "WK-includes insert?", value: true, format: "boolean" },
          { label: "Insert document name", value: "Document A" },
          { label: "Client form number", value: "Form123" },
          {
            "format": "boolean",
            "label": "Send group to vendors",
            "lastChild": true,
            "tooltipContent": "Whether the group is sent to vendors for marketing use",
            "value": true,
          }
        ],
      },
      P360: {
        col1: [
          { label: "P360 brand relationship", value: "Relationship A" },
          {
            label: "P360 URL",
            value: "https://example.com/p360",
            format: "link",
          },
          { label: "Virtual first plan name", value: "Plan A" },
          {
            label: "Virtual first health plan summary",
            value: "Summary A",
            lastChild: true,
          },
        ],
        col2: [
          { label: "Health plan boiler plate copy", value: "Copy A" },
          {
            label: "Virtual first health plan",
            value: true,
            format: "boolean",
          },
          {
            label: "Referral required",
            value: false,
            format: "boolean",
            lastChild: true,
          },
        ],
      },
    });
  });

  it("handles missing data gracefully", () => {
    const mockData: any = {
      telemedicine: {
        marketingPreferences: {},
        marketingData: {},
        welcomeLetter: {},
        p360: {},
      },
    };

    const result = renderMarketingTelemedicine(mockData);

    expect(stripMetaFields(result)).toEqual({
      "Marketing preferences": {
        col1: [
          { label: "Language", value: undefined },
          { label: "Health benefit language", value: undefined },
          { label: "Preferred eligibility language", value: undefined },
          { label: "Testing permission", value: undefined },
          { label: "Modeling permission", value: undefined },
          { label: "Communication mode", value: undefined },
          { label: "Registration/enrollment engagement tier", lastChild: true, value: undefined },
        ],
        col2: [
          { label: "Email opt-in", value: undefined },
          { label: "Direct mail opt-in", value: undefined },
          { label: "Outbound calls opt-in", value: undefined },
          { label: "Text opt-in", value: undefined },
          { label: "Incentives opt-in", value: undefined },
          { label: "Registration/enrollment journey", value: undefined },
          { label: "Ongoing registration/enrollment journey", lastChild: true, value: undefined },
        ],
      },
      "Wellbound EAP": {
        col1: [{
          label: "Wellbound EAP - BetterHelp URL",
          value: "-",
          format: "link",
          lastChild: true,
        }],
        col2: [{
          label: "Wellbound EAP - Teladoc URL",
          value: "-",
          format: "link",
          lastChild: true,
        }],
      },
      "Marketing data": {
        col1: [
          {
            label: "Receiving claims data from Telemed programs?",
            format: "boolean",
            lastChild: true,
            value: undefined,
          },
        ],
        col2: [],
      },
      "Welcome letter": {
        col1: [
          { label: "Wk template", value: undefined },
          { label: "Card name", value: undefined },
          { label: "Client account location", value: undefined },
          { label: "MK_consultarea", value: undefined },
          { label: "Disclaimer-teladoc", value: undefined },
          { label: "Disclaimer-client ", value: undefined },
          { label: "Disclaimer-custom", value: undefined },
          { label: "Send card", format: "boolean", value: undefined },
          { label: "Active date", format: "date", value: undefined },
          { label: "Shipping class", value: undefined },
          { label: "Company copy", value: undefined },
          { label: "CMS code", value: undefined },
          { label: "WK card includes logo?", format: "boolean", value: undefined, lastChild: true, },
        ],
        col2: [
          { label: "MK-welcome message", value: undefined },
          { label: "MK_ID card front 1", value: undefined },
          { label: "MK_ID card front 2", value: undefined },
          { label: "WK mail-to", value: undefined },
          { label: "WK mail-to address", value: undefined },
          { label: "Consult message", value: undefined },
          { label: "Consult message on welcome letter?", format: "boolean", value: undefined },
          { label: "Welcome letter consult message", value: undefined },
          { label: "WK-includes insert?", format: "boolean", value: undefined },
          { label: "Insert document name", value: undefined },
          { label: "Client form number", value: undefined },
          {
            "format": "boolean",
            "label": "Send group to vendors",
            "lastChild": true,
            "tooltipContent": "Whether the group is sent to vendors for marketing use",
            "value": undefined,
          }
        ],
      },
      P360: {
        col1: [
          { label: "P360 brand relationship", value: undefined },
          { label: "P360 URL", format: "link", value: undefined },
          { label: "Virtual first plan name", value: undefined },
          { label: "Virtual first health plan summary", lastChild: true, value: undefined },
        ],
        col2: [
          { label: "Health plan boiler plate copy", value: undefined },
          { label: "Virtual first health plan", format: "boolean", value: undefined },
          { label: "Referral required", format: "boolean", lastChild: true, value: undefined },
        ],
      },
    });
  });

  it("returns empty structure when no data is provided", () => {
    const result = renderMarketingTelemedicine(undefined as any);
    expect(stripMetaFields(result)).toEqual({
      "Marketing preferences": {
        col1: [
          { label: "Language", value: undefined },
          { label: "Health benefit language", value: undefined },
          { label: "Preferred eligibility language", value: undefined },
          { label: "Testing permission", value: undefined },
          { label: "Modeling permission", value: undefined },
          { label: "Communication mode", value: undefined },
          { label: "Registration/enrollment engagement tier", lastChild: true, value: undefined },
        ],
        col2: [
          { label: "Email opt-in", value: undefined },
          { label: "Direct mail opt-in", value: undefined },
          { label: "Outbound calls opt-in", value: undefined },
          { label: "Text opt-in", value: undefined },
          { label: "Incentives opt-in", value: undefined },
          { label: "Registration/enrollment journey", value: undefined },
          { label: "Ongoing registration/enrollment journey", lastChild: true, value: undefined },
        ],
      },
      "Wellbound EAP": {
        col1: [{
          label: "Wellbound EAP - BetterHelp URL",
          value: "-",
          format: "link",
          lastChild: true,
        }],
        col2: [{
          label: "Wellbound EAP - Teladoc URL",
          value: "-",
          format: "link",
          lastChild: true,
        }],
      },
      "Marketing data": {
        col1: [
          {
            label: "Receiving claims data from Telemed programs?",
            format: "boolean",
            lastChild: true,
            value: undefined,
          },
        ],
        col2: [],
      },
      "Welcome letter": {
        col1: [
          { label: "Wk template", value: undefined },
          { label: "Card name", value: undefined },
          { label: "Client account location", value: undefined },
          { label: "MK_consultarea", value: undefined },
          { label: "Disclaimer-teladoc", value: undefined },
          { label: "Disclaimer-client ", value: undefined },
          { label: "Disclaimer-custom", value: undefined },
          { label: "Send card", format: "boolean", value: undefined },
          { label: "Active date", format: "date", value: undefined },
          { label: "Shipping class", value: undefined },
          { label: "Company copy", value: undefined },
          { label: "CMS code", value: undefined },
          { label: "WK card includes logo?", format: "boolean", value: undefined, lastChild: true, },
        ],
        col2: [
          { label: "MK-welcome message", value: undefined },
          { label: "MK_ID card front 1", value: undefined },
          { label: "MK_ID card front 2", value: undefined },
          { label: "WK mail-to", value: undefined },
          { label: "WK mail-to address", value: undefined },
          { label: "Consult message", value: undefined },
          { label: "Consult message on welcome letter?", format: "boolean", value: undefined },
          { label: "Welcome letter consult message", value: undefined },
          { label: "WK-includes insert?", format: "boolean", value: undefined },
          { label: "Insert document name", value: undefined },
          { label: "Client form number", value: undefined },
          {
            "format": "boolean",
            "label": "Send group to vendors",
            "lastChild": true,
            "tooltipContent": "Whether the group is sent to vendors for marketing use",
            "value": undefined,
          }
        ],
      },
      P360: {
        col1: [
          { label: "P360 brand relationship", value: undefined },
          { label: "P360 URL", format: "link", value: undefined },
          { label: "Virtual first plan name", value: undefined },
          { label: "Virtual first health plan summary", lastChild: true, value: undefined },
        ],
        col2: [
          { label: "Health plan boiler plate copy", value: undefined },
          { label: "Virtual first health plan", format: "boolean", value: undefined },
          { label: "Referral required", format: "boolean", lastChild: true, value: undefined },
        ],
      },
    });
  });
});

describe("renderMarketingCcm", () => {
  it("returns correct structure when all data is provided", () => {
    const mockData: any = {
      ccm: {
        groupOverview: {
          outreachStratification: "Stratification A",
          outreachStratificationDate: "2023-01-01",
        },
        marketingPreferences: {
          clientAllowsTargetedMarketing: true,
          clientsMustApproveAssets: false,
          employeeTitle: "Title A",
          marketingName: "Marketing A",
          clientSendsOutTheirOwnMarketing: true,
          useContractPathForMarketing: false,
          holdAllMarketing: true,
          dateMarketingPutOnHold: "2023-01-01",
          readyForAutomation: false,
          campaignType: "Type A",
          campaignOptions: "Options A",
        },
        allowedCommunicationMethods: {
          clientAllowsABTestingOf: "Testing A",
          marketingChannelType: "Channel A",
          campaignLifecycleParticipation: "Participation A",
          unionClient: true,
          U18Marketing: false,
          phoneCampaign: true,
        },
        marketingLanguagePreferences: {
          removeSpanish: true,
          atNoCostToYouAltText: false,
          joinAltText: true,
          generalEligibilitySentence: "Sentence A",
          generalSpanishEligibilitySentence: "Sentence B",
          paidForBy: "Paid By A",
          lowercaseRegistrationCode: true,
          removeNew: false,
        },
      },
    };

    const result = renderMarketingCcm(mockData);
    expect(stripMetaFields(result)).toEqual({
      "Group overview": {
        col1: [
          {
            label: "Outreach stratification",
            value: "Stratification A",
            lastChild: true,
          },
        ],
        col2: [
          {
            label: "Outreach stratification date",
            value: "2023-01-01",
            format: "date",
            lastChild: true,
          },
        ],
      },
      "Marketing preferences": {
        col1: [
          {
            label: "Client allows targeted marketing?",
            value: true,
            format: "boolean",
          },
          {
            label: "Client must approve assets",
            value: false,
            format: "boolean",
          },
          { label: "Employee title", value: "Title A" },
          { label: "Marketing name", value: "Marketing A" },
          {
            label: "Does Client send out own marketing?",
            value: true,
            format: "boolean",
          },
          {
            label: "Use contract path for marketing?",
            value: false,
            format: "boolean",
            lastChild: true,
          },
        ],
        col2: [
          { label: "Hold all marketing", value: true, format: "boolean" },
          {
            label: "Date marketing put on hold",
            value: "2023-01-01",
            format: "date",
          },
          { label: "Ready for automation", value: false, format: "boolean" },
          { label: "Campaign type", value: "Type A" },
          { label: "Campaign options", value: "Options A", lastChild: true },
        ],
      },
      "Marketing language preferences": {
        col1: [
          { label: "Remove Spanish", value: true, format: "boolean" },
          {
            label: "At no cost to you alt text",
            value: false,
          },
          { label: "Join alt text", value: true, format: "boolean" },
          { label: "General eligibility sentence", value: "Sentence A" },
          {
            label: "General spanish eligibility sentence",
            value: "Sentence B",
          },
          { label: "100% paid for by", value: "Paid By A" },
          {
            label: "Lowercase registration code",
            value: true,
            format: "boolean",
          },
          {
            label: "Remove 'new'",
            value: false,
            format: "boolean",
            lastChild: true,
          },
        ],
        col2: [
          { label: "Health benefit alt text", value: undefined },
          { label: "Strips and lancets alt text", value: undefined },
          { label: "General disclaimer", value: undefined },
          { label: "General spanish disclaimer", value: undefined },
          { label: "Remove unlimited", format: "boolean", value: undefined },
          { label: "No OEP direct mail inserts", format: "boolean", value: undefined },
          { label: "Hold member marketing", format: "boolean", value: undefined },
          {
            label: "Member comms need client approval",
            format: "boolean",
            lastChild: true,
            value: undefined,
          },
        ],
      },
      "Allowed communication methods": {
        col1: [
          { label: "Client allows A/B testing of", value: "Testing A" },
          { label: "Marketing channel type", value: "Channel A" },
          {
            label: "Campaign lifecycle participation",
            value: "Participation A",
          },
          { label: "Union client", value: true, format: "boolean" },
          { label: "U18 marketing?", value: undefined, format: "boolean" },
          { label: "Phone campaign", value: true },
        ],
        col2: [
          { label: "Marketing incentive type", value: undefined },
          { label: "CCM incentives: gift cards", format: "boolean", value: undefined },
          { label: "CCM incentives: gift cards date", format: "date", value: undefined },
          { label: "CCM incentives: goods and services", format: "boolean", value: undefined },
          { label: "CCM incentives: goods and services date", format: "date", value: undefined },
          {
            label: "Use for Actication/Usage?",
            format: "boolean",
            value: undefined,
          },
          {
            label: "Type of Incentive to Exclude",
            lastChild: true,
            value: undefined,
          },
        ],
      },
    }); // Use snapshot testing for large structures
  });

  it("handles missing data gracefully", () => {
    const mockData: any = {
      ccm: {
        groupOverview: {},
        marketingPreferences: {},
        allowedCommunicationMethods: {},
        marketingLanguagePreferences: {},
      },
    };

    const result = renderMarketingCcm(mockData);

    expect(stripMetaFields(result)).toEqual({
      "Group overview": {
        col1: [{ label: "Outreach stratification", lastChild: true, value: undefined }],
        col2: [
          {
            label: "Outreach stratification date",
            format: "date",
            lastChild: true,
            value: undefined,
          },
        ],
      },
      "Marketing preferences": {
        col1: [
          { label: "Client allows targeted marketing?", format: "boolean", value: undefined },
          { label: "Client must approve assets", format: "boolean", value: undefined },
          { label: "Employee title", value: undefined },
          { label: "Marketing name", value: undefined },
          { label: "Does Client send out own marketing?", format: "boolean", value: undefined },
          {
            label: "Use contract path for marketing?",
            format: "boolean",
            lastChild: true,
            value: undefined,
          },
        ],
        col2: [
          { label: "Hold all marketing", format: "boolean", value: undefined },
          { label: "Date marketing put on hold", format: "date", value: undefined },
          { label: "Ready for automation", format: "boolean", value: undefined },
          { label: "Campaign type", value: undefined },
          { label: "Campaign options", lastChild: true, value: undefined },
        ],
      },
      "Marketing language preferences": {
        col1: [
          { label: "Remove Spanish", format: "boolean", value: undefined },
          { label: "At no cost to you alt text", value: undefined },
          { label: "Join alt text", format: "boolean", value: undefined },
          { label: "General eligibility sentence", value: undefined },
          { label: "General spanish eligibility sentence", value: undefined },
          { label: "100% paid for by", value: undefined },
          { label: "Lowercase registration code", format: "boolean", value: undefined },
          { label: "Remove 'new'", format: "boolean", lastChild: true, value: undefined },
        ],
        col2: [
          { label: "Health benefit alt text", value: undefined },
          { label: "Strips and lancets alt text", value: undefined },
          { label: "General disclaimer", value: undefined },
          { label: "General spanish disclaimer", value: undefined },
          { label: "Remove unlimited", format: "boolean", value: undefined },
          { label: "No OEP direct mail inserts", format: "boolean", value: undefined },
          { label: "Hold member marketing", format: "boolean", value: undefined },
          {
            label: "Member comms need client approval",
            format: "boolean",
            lastChild: true,
            value: undefined,
          },
        ],
      },
      "Allowed communication methods": {
        col1: [
          { label: "Client allows A/B testing of", value: undefined },
          { label: "Marketing channel type", value: undefined },
          { label: "Campaign lifecycle participation", value: undefined },
          { label: "Union client", format: "boolean", value: undefined },
          { label: "U18 marketing?", format: "boolean", value: undefined },
          { label: "Phone campaign", value: undefined },
        ],
        col2: [
          { label: "Marketing incentive type", value: undefined },
          { label: "CCM incentives: gift cards", format: "boolean", value: undefined },
          { label: "CCM incentives: gift cards date", value: undefined, format: "date" },
          { label: "CCM incentives: goods and services", format: "boolean", value: undefined },
          { label: "CCM incentives: goods and services date", format: "date", value: undefined },
          {
            label: "Use for Actication/Usage?",
            format: "boolean",
            value: undefined,
          },
          {
            label: "Type of Incentive to Exclude",
            lastChild: true,
            value: undefined,
          },
        ],
      },
    });
  });

  it("returns empty structure when no data is provided", () => {
    const result = renderMarketingCcm(undefined as any);
    expect(stripMetaFields(result)).toEqual({
      "Group overview": {
        col1: [{ label: "Outreach stratification", lastChild: true, value: undefined }],
        col2: [
          {
            label: "Outreach stratification date",
            format: "date",
            lastChild: true,
            value: undefined,
          },
        ],
      },
      "Marketing preferences": {
        col1: [
          { label: "Client allows targeted marketing?", format: "boolean", value: undefined },
          { label: "Client must approve assets", format: "boolean", value: undefined },
          { label: "Employee title", value: undefined },
          { label: "Marketing name", value: undefined },
          { label: "Does Client send out own marketing?", format: "boolean", value: undefined },
          {
            label: "Use contract path for marketing?",
            format: "boolean",
            lastChild: true,
            value: undefined,
          },
        ],
        col2: [
          { label: "Hold all marketing", format: "boolean", value: undefined },
          { label: "Date marketing put on hold", format: "date", value: undefined },
          { label: "Ready for automation", format: "boolean", value: undefined },
          { label: "Campaign type", value: undefined },
          { label: "Campaign options", lastChild: true, value: undefined },
        ],
      },
      "Marketing language preferences": {
        col1: [
          { label: "Remove Spanish", format: "boolean", value: undefined },
          { label: "At no cost to you alt text", value: undefined },
          { label: "Join alt text", format: "boolean", value: undefined },
          { label: "General eligibility sentence", value: undefined },
          { label: "General spanish eligibility sentence", value: undefined },
          { label: "100% paid for by", value: undefined },
          { label: "Lowercase registration code", format: "boolean", value: undefined },
          { label: "Remove 'new'", format: "boolean", lastChild: true, value: undefined },
        ],
        col2: [
          { label: "Health benefit alt text", value: undefined },
          { label: "Strips and lancets alt text", value: undefined },
          { label: "General disclaimer", value: undefined },
          { label: "General spanish disclaimer", value: undefined },
          { label: "Remove unlimited", format: "boolean", value: undefined },
          { label: "No OEP direct mail inserts", format: "boolean", value: undefined },
          { label: "Hold member marketing", format: "boolean", value: undefined },
          {
            label: "Member comms need client approval",
            format: "boolean",
            lastChild: true,
            value: undefined,
          },
        ],
      },
      "Allowed communication methods": {
        col1: [
          { label: "Client allows A/B testing of", value: undefined },
          { label: "Marketing channel type", value: undefined },
          { label: "Campaign lifecycle participation", value: undefined },
          { label: "Union client", format: "boolean", value: undefined },
          { label: "U18 marketing?", format: "boolean", value: undefined },
          { label: "Phone campaign", value: undefined },
        ],
        col2: [
          { label: "Marketing incentive type", value: undefined },
          { label: "CCM incentives: gift cards", format: "boolean", value: undefined },
          { label: "CCM incentives: gift cards date", value: undefined, format: "date" },
          { label: "CCM incentives: goods and services", format: "boolean", value: undefined },
          { label: "CCM incentives: goods and services date", format: "date", value: undefined },
          {
            label: "Use for Actication/Usage?",
            format: "boolean",
            value: undefined,
          },
          {
            label: "Type of Incentive to Exclude",
            lastChild: true,
            value: undefined,
          },
        ],
      },
    });
  });
});
