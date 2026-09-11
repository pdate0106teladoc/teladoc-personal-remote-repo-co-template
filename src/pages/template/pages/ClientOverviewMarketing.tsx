import * as React from "react";
import { ReadOnlyTemplateSections } from "./TemplateSections";
import { getClientOverviewSections } from "./clientOverviewSections";
import type { TemplateDetail } from "./templateTypes";
import {
  EditSection,
  RadioField,
  SelectField,
  TextField,
} from "./fields";
import type {
  ClientOverviewTemplateField,
  ClientOverviewTemplateForm,
} from "./clientOverviewForm";

interface ClientOverviewMarketingEditProps {
  form: ClientOverviewTemplateForm;
  onChange: (
    field: ClientOverviewTemplateField,
    value: string | boolean,
  ) => void;
}

interface ClientOverviewMarketingViewProps {
  detail: TemplateDetail;
}

type ClientOverviewMarketingProps = ClientOverviewMarketingEditProps | ClientOverviewMarketingViewProps;

const ClientOverviewMarketing: React.FC<ClientOverviewMarketingProps> = (props) => {
  if ("detail" in props) {
    return (
      <ReadOnlyTemplateSections
        sections={getClientOverviewSections("marketing", props.detail)}
      />
    );
  }

  const { form, onChange } = props;

  return (

  <div className="edit-form edit-marketing">
    <EditSection title="Group Overview">
      <div className="edit-fields-grid">
        <div className="edit-fields-column">
          <TextField
            label="Enrollment Marketing Lead"
            field="enrollmentMarketingLead"
            value={form.enrollmentMarketingLead}
            onChange={(value) => onChange("enrollmentMarketingLead", value)}
          />
          <SelectField
            label="Outreach Stratification"
            value={form.outreachStratification}
            options={["High", "Medium", "Low"]}
            onChange={(value) => onChange("outreachStratification", value)}
          />
        </div>
        <div className="edit-fields-column">
          <TextField
            label="Outreach Stratification Date"
            field="outreachStratificationDate"
            type="date"
            value={form.outreachStratificationDate}
            onChange={(value) => onChange("outreachStratificationDate", value)}
          />
        </div>
      </div>
    </EditSection>

    <EditSection title="CCM Logos">
      <div className="edit-fields-grid">
        <div className="edit-fields-column">
          <TextField
            label="Client Logo Link"
            field="clientLogoLink"
            value={form.clientLogoLink}
            onChange={(value) => onChange("clientLogoLink", value)}
          />
        </div>
        <div className="edit-fields-column">
          <TextField
            label="Logo File Name"
            field="logoFileName"
            value={form.logoFileName}
            onChange={(value) => onChange("logoFileName", value)}
          />
        </div>
      </div>
    </EditSection>

    <EditSection title="Allowed Communication Methods">
      <div className="edit-fields-grid">
        <div className="edit-fields-column">
          <SelectField
            label="Client Allows A/B Testing of"
            value={form.clientAllowsAbTestingOf}
            options={["Email", "Direct mail", "All channels", "None"]}
            onChange={(value) => onChange("clientAllowsAbTestingOf", value)}
          />
          <SelectField
            label="Marketing Channel Type"
            value={form.marketingChannelType}
            options={["Email", "Direct mail", "Phone", "Multi-channel"]}
            onChange={(value) => onChange("marketingChannelType", value)}
          />
          <RadioField
            label="Union Client"
            value={form.unionClient}
            onChange={(value) => onChange("unionClient", value)}
          />
        </div>
        <div className="edit-fields-column">
          <RadioField
            label="U18 Marketing?"
            value={form.u18Marketing}
            onChange={(value) => onChange("u18Marketing", value)}
          />
          <SelectField
            label="Marketing Incentive Type"
            value={form.marketingIncentiveType}
            options={["Gift cards", "Goods and Services", "None"]}
            onChange={(value) => onChange("marketingIncentiveType", value)}
          />
          <SelectField
            label="Phone Campaign"
            value={form.phoneCampaign}
            options={["Standard", "Custom", "None"]}
            onChange={(value) => onChange("phoneCampaign", value)}
          />
        </div>
      </div>
    </EditSection>

    <EditSection title="Marketing Preferences">
      <div className="edit-fields-grid">
        <div className="edit-fields-column">
          <RadioField
            label="Client allows targeted marketing?"
            value={form.clientAllowsTargetedMarketing}
            onChange={(value) =>
              onChange("clientAllowsTargetedMarketing", value)
            }
          />
          <RadioField
            label="Clients must approve assets"
            value={form.clientsMustApproveAssets}
            onChange={(value) => onChange("clientsMustApproveAssets", value)}
          />
          <TextField
            label="Employee title"
            field="employeeTitle"
            value={form.employeeTitle}
            onChange={(value) => onChange("employeeTitle", value)}
          />
          <TextField
            label="Marketing name"
            field="marketingName"
            value={form.marketingName}
            onChange={(value) => onChange("marketingName", value)}
          />
          <RadioField
            label="Client send out their own marketing?"
            value={form.clientSendsOwnMarketing}
            onChange={(value) => onChange("clientSendsOwnMarketing", value)}
          />
          <RadioField
            label="Remove spanish"
            value={form.removeSpanish}
            onChange={(value) => onChange("removeSpanish", value)}
          />
          <TextField
            label="At no cost to you Alt text"
            field="atNoCostToYouAltText"
            value={form.atNoCostToYouAltText}
            onChange={(value) => onChange("atNoCostToYouAltText", value)}
          />
          <TextField
            label="Join Alt text"
            field="joinAltText"
            value={form.joinAltText}
            onChange={(value) => onChange("joinAltText", value)}
          />
          <TextField
            label="General eligibility sentence"
            field="generalEligibilitySentence"
            value={form.generalEligibilitySentence}
            onChange={(value) => onChange("generalEligibilitySentence", value)}
          />
          <TextField
            label="General spanish eligibility sentence"
            field="generalSpanishEligibilitySentence"
            value={form.generalSpanishEligibilitySentence}
            onChange={(value) =>
              onChange("generalSpanishEligibilitySentence", value)
            }
          />
          <TextField
            label="100% paid for by"
            field="paidForBy"
            value={form.paidForBy}
            onChange={(value) => onChange("paidForBy", value)}
          />
          <RadioField
            label="No OEP direct mail inserts"
            value={form.noOepDirectMailInserts}
            onChange={(value) => onChange("noOepDirectMailInserts", value)}
          />
          <RadioField
            label="Use for activation/usage?"
            value={form.useForActivationUsage}
            onChange={(value) => onChange("useForActivationUsage", value)}
          />
          <RadioField
            label="Type of incentive to exclude"
            value={form.typeOfIncentiveToExclude}
            onChange={(value) => onChange("typeOfIncentiveToExclude", value)}
          />
          <SelectField
            label="Hold member marketing"
            value={form.holdMemberMarketing}
            options={["Hospitality Incentives", "None", "All"]}
            onChange={(value) => onChange("holdMemberMarketing", value)}
          />
          <RadioField
            label="Member comms need client approval"
            value={form.memberCommsNeedClientApproval}
            onChange={(value) =>
              onChange("memberCommsNeedClientApproval", value)
            }
          />
          <RadioField
            label="Hold all marketing"
            value={form.holdAllMarketing}
            onChange={(value) => onChange("holdAllMarketing", value)}
          />
          <TextField
            label="Lowercase registration code"
            field="lowercaseRegistrationCode"
            value={form.lowercaseRegistrationCode}
            onChange={(value) => onChange("lowercaseRegistrationCode", value)}
          />
        </div>
        <div className="edit-fields-column">
          <RadioField
            label="Use contract path for marketing"
            value={form.useContractPathForMarketing}
            onChange={(value) =>
              onChange("useContractPathForMarketing", value)
            }
          />
          <TextField
            label="Date marketing put on hold"
            field="dateMarketingPutOnHold"
            type="date"
            value={form.dateMarketingPutOnHold}
            onChange={(value) => onChange("dateMarketingPutOnHold", value)}
          />
          <RadioField
            label="Ready for automation"
            value={form.readyForAutomation}
            onChange={(value) => onChange("readyForAutomation", value)}
          />
          <RadioField
            label="Campaign lifecycle participation"
            value={form.campaignLifecycleParticipation}
            onChange={(value) =>
              onChange("campaignLifecycleParticipation", value)
            }
          />
          <SelectField
            label="Campaign type"
            value={form.campaignType}
            options={["Standard", "Custom"]}
            onChange={(value) => onChange("campaignType", value)}
          />
          <SelectField
            label="Campaign options"
            value={form.campaignOptions}
            options={["Optimized Enrollment Plan", "Standard", "None"]}
            onChange={(value) => onChange("campaignOptions", value)}
          />
          <RadioField
            label="Remove 'New'"
            value={form.removeNew}
            onChange={(value) => onChange("removeNew", value)}
          />
          <TextField
            label="Health benefit Alt text"
            field="healthBenefitAltText"
            value={form.healthBenefitAltText}
            onChange={(value) => onChange("healthBenefitAltText", value)}
          />
          <TextField
            label="Strips and lancets Alt text"
            field="stripsAndLancetsAltText"
            value={form.stripsAndLancetsAltText}
            onChange={(value) => onChange("stripsAndLancetsAltText", value)}
          />
          <TextField
            label="General disclaimer"
            field="generalDisclaimer"
            value={form.generalDisclaimer}
            onChange={(value) => onChange("generalDisclaimer", value)}
          />
          <TextField
            label="General spanish disclaimer"
            field="generalSpanishDisclaimer"
            value={form.generalSpanishDisclaimer}
            onChange={(value) => onChange("generalSpanishDisclaimer", value)}
          />
          <RadioField
            label="Remove unlimited"
            value={form.removeUnlimited}
            onChange={(value) => onChange("removeUnlimited", value)}
          />
          <RadioField
            label="CCM incentives: Gift cards"
            value={form.ccmIncentivesGiftCards}
            onChange={(value) => onChange("ccmIncentivesGiftCards", value)}
          />
          <TextField
            label="CCM incentives: Gift cards date"
            field="ccmIncentivesGiftCardsDate"
            type="date"
            value={form.ccmIncentivesGiftCardsDate}
            onChange={(value) => onChange("ccmIncentivesGiftCardsDate", value)}
          />
          <TextField
            label="CCM Incentives: Goods and Services"
            field="ccmIncentivesGoodsAndServices"
            value={form.ccmIncentivesGoodsAndServices}
            onChange={(value) =>
              onChange("ccmIncentivesGoodsAndServices", value)
            }
          />
          <TextField
            label="CCM Incentives: Goods and Services date"
            field="ccmIncentivesGoodsAndServicesDate"
            type="date"
            value={form.ccmIncentivesGoodsAndServicesDate}
            onChange={(value) =>
              onChange("ccmIncentivesGoodsAndServicesDate", value)
            }
          />
          <TextField
            label="CCM Incentives: Content guides"
            field="ccmIncentivesContentGuides"
            type="date"
            value={form.ccmIncentivesContentGuides}
            onChange={(value) => onChange("ccmIncentivesContentGuides", value)}
          />
          <TextField
            label="CCM Incentives: Content Guides Date"
            field="ccmIncentivesContentGuidesDate"
            type="date"
            value={form.ccmIncentivesContentGuidesDate}
            onChange={(value) =>
              onChange("ccmIncentivesContentGuidesDate", value)
            }
          />
        </div>
      </div>
    </EditSection>

    <EditSection title="Additional marketing details">
      <div className="edit-fields-grid">
        <div className="edit-fields-column">
          <TextField
            label="Enrollment marketing customizations"
            field="enrollmentMarketingCustomizations"
            value={form.enrollmentMarketingCustomizations}
            onChange={(value) =>
              onChange("enrollmentMarketingCustomizations", value)
            }
          />
          <TextField
            label="Enrollment on autopilot"
            field="enrollmentOnAutopilot"
            value={form.enrollmentOnAutopilot}
            onChange={(value) => onChange("enrollmentOnAutopilot", value)}
          />
        </div>
        <div className="edit-fields-column">
          <RadioField
            label="Livongo led marketing"
            value={form.livongoLedMarketing}
            onChange={(value) => onChange("livongoLedMarketing", value)}
          />
          <TextField
            label="Marketing team notes"
            field="marketingTeamNotes"
            value={form.marketingTeamNotes}
            onChange={(value) => onChange("marketingTeamNotes", value)}
          />
        </div>
      </div>
    </EditSection>
  </div>
  );
};

export default ClientOverviewMarketing;
