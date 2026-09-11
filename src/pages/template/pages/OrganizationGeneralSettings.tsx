import * as React from "react";
import { BsSearch, BsX } from "react-icons/bs";
import { ReadOnlyTemplateSections } from "./TemplateSections";
import {
  EditSection,
  Field,
  PersonSelectField,
  RadioField,
  SelectField,
  TextField,
} from "./fields";
import type {
  OrganizationTemplateField,
  OrganizationTemplateForm,
} from "./organizationForm";

interface OrganizationGeneralSettingsEditProps {
  form: OrganizationTemplateForm;
  onChange: (
    field: OrganizationTemplateField,
    value: string | boolean,
  ) => void;
}

type OrganizationGeneralSettingsProps =
  | OrganizationGeneralSettingsEditProps
  | Record<string, never>;

const TEAM_OPTIONS = [
  "Chloe O’Malley",
  "Allison Miller",
  "Sal Aster",
  "Bill Cosgrove",
  "Joel Miller",
  "Brian Cosgrove",
  "Brian Cooper",
];

const VIEW_SECTIONS = [
  {
    title: "Account overview",
    left: [
      { label: "Organization name (Admin)", value: "Aetna Primary Aetna" },
      { label: "Name (LCRM-Telemed)", value: "Aetna Dependent" },
      { label: "Name (LCRM - CCM)", value: "Aetna" },
      { label: "Friendly account name", value: "-" },
      { label: "Doing business as", value: "-" },
      { label: "Parent account", value: "Aetna" },
      { label: "Account status", value: "Client" },
      { label: "Benefit restriction code", value: "None" },
    ],
    right: [
      { label: "Record type", value: "Client Account" },
      { label: "Client type", value: "Insurance" },
      { label: "Account business type", value: "Health Plan" },
      { label: "Account effective start date", value: "Jan 1, 2005" },
      { label: "Account effective end date", value: "Dec 31, 2035" },
      { label: "Business region", value: "United States of America" },
      { label: "Is this organization the employer?", value: "Yes" },
      {
        label: "Is there a broker/referral company for this organization?",
        value: "Yes",
      },
    ],
  },
  {
    title: "Account team",
    left: [
      { label: "Client Operations Manager", value: "Chloe O’Malley", format: "person" as const },
      { label: "Account Manager", value: "Allison Miller", format: "person" as const },
    ],
    right: [{ label: "Sales Agent", value: "Sal Aster", format: "person" as const }],
  },
  {
    title: "Client team",
    left: [
      { label: "Primary daily contact", value: "Bill Cosgrove", format: "person" as const },
      { label: "Primary billing contact", value: "Joel Miller", format: "person" as const },
    ],
    right: [
      { label: "Secondary billing contact", value: "Brian Cosgrove", format: "person" as const },
      { label: "Primary marketing contact", value: "Allison Miller", format: "person" as const },
    ],
  },
];

const OrganizationGeneralSettings: React.FC<
  OrganizationGeneralSettingsProps
> = (props) => {
  if (!("form" in props)) {
    return (
      <div className="edit-form edit-general-settings">
        <EditSection title="Overview">
          <ReadOnlyTemplateSections
            sections={VIEW_SECTIONS}
            collapsible={false}
          />
        </EditSection>
      </div>
    );
  }

  const { form, onChange } = props;

  return (
    <div className="edit-form edit-general-settings">
      <EditSection title="Overview">
        <EditSection title="Account overview" collapsible={false}>
          <div className="edit-fields-grid">
            <div className="edit-fields-column">
              <TextField
                label="Organization name (Admin)"
                field="organizationNameAdmin"
                value={form.organizationNameAdmin}
                onChange={(value) => onChange("organizationNameAdmin", value)}
              />
              <Field label="Name (LCRM-Telemed)">
                <span className="lookup-control">
                  <BsSearch aria-hidden />
                  <span className="lookup-value">{form.nameLcrmTelemed}</span>
                  {form.nameLcrmTelemed ? (
                    <button
                      type="button"
                      aria-label="Clear Name (LCRM-Telemed)"
                      onClick={() => onChange("nameLcrmTelemed", "")}
                    >
                      <BsX aria-hidden />
                    </button>
                  ) : null}
                </span>
              </Field>
              <SelectField
                label="Name (LCRM - CCM)"
                value={form.nameLcrmCcm}
                options={["Aetna", "Allied", "None"]}
                onChange={(value) => onChange("nameLcrmCcm", value)}
              />
              <SelectField
                label="Friendly account name"
                value={form.friendlyAccountName}
                options={["Aetna", "Allied"]}
                onChange={(value) => onChange("friendlyAccountName", value)}
              />
              <SelectField
                label="Doing business as"
                value={form.doingBusinessAs}
                options={["Aetna", "Allied"]}
                onChange={(value) => onChange("doingBusinessAs", value)}
              />
              <SelectField
                label="Parent account"
                value={form.parentAccount}
                options={["Aetna", "Allied", "None"]}
                onChange={(value) => onChange("parentAccount", value)}
              />
              <SelectField
                label="Account status"
                value={form.accountStatus}
                options={["Client", "Prospect", "Inactive"]}
                onChange={(value) => onChange("accountStatus", value)}
              />
              <SelectField
                label="Benefit restriction code"
                value={form.benefitRestrictionCode}
                options={["None", "Restricted"]}
                onChange={(value) => onChange("benefitRestrictionCode", value)}
              />
            </div>
            <div className="edit-fields-column">
              <SelectField
                label="Record type"
                value={form.recordType}
                options={["Client Account", "Partner Account"]}
                onChange={(value) => onChange("recordType", value)}
              />
              <SelectField
                label="Client type"
                value={form.clientType}
                options={["Insurance", "Employer", "Health Plan"]}
                onChange={(value) => onChange("clientType", value)}
              />
              <SelectField
                label="Account business type"
                value={form.accountBusinessType}
                options={["Health Plan", "Employer", "TPA"]}
                onChange={(value) => onChange("accountBusinessType", value)}
              />
              <TextField
                label="Account effective start date"
                field="accountEffectiveStartDate"
                type="date"
                value={form.accountEffectiveStartDate}
                onChange={(value) =>
                  onChange("accountEffectiveStartDate", value)
                }
              />
              <TextField
                label="Account effective end date"
                field="accountEffectiveEndDate"
                type="date"
                value={form.accountEffectiveEndDate}
                onChange={(value) => onChange("accountEffectiveEndDate", value)}
              />
              <SelectField
                label="Business region"
                value={form.businessRegion}
                options={["United States of America", "International"]}
                onChange={(value) => onChange("businessRegion", value)}
              />
              <RadioField
                label="Is this organization the employer?"
                value={form.isOrganizationTheEmployer}
                onChange={(value) =>
                  onChange("isOrganizationTheEmployer", value)
                }
              />
              <RadioField
                label="Is there a broker/referral company for this organization?"
                value={form.hasBrokerReferralCompany}
                onChange={(value) =>
                  onChange("hasBrokerReferralCompany", value)
                }
              />
            </div>
          </div>
        </EditSection>

        <EditSection title="Account team" collapsible={false}>
          <div className="edit-fields-grid">
            <div className="edit-fields-column">
              <PersonSelectField
                label="Client Operations Manager"
                value={form.clientOperationsManager}
                options={TEAM_OPTIONS}
                onChange={(value) => onChange("clientOperationsManager", value)}
              />
              <PersonSelectField
                label="Account Manager"
                value={form.accountManager}
                options={TEAM_OPTIONS}
                onChange={(value) => onChange("accountManager", value)}
              />
            </div>
            <div className="edit-fields-column">
              <PersonSelectField
                label="Sales Agent"
                value={form.salesAgent}
                options={TEAM_OPTIONS}
                onChange={(value) => onChange("salesAgent", value)}
              />
            </div>
          </div>
        </EditSection>

        <EditSection title="Client team" collapsible={false}>
          <div className="edit-fields-grid">
            <div className="edit-fields-column">
              <PersonSelectField
                label="Primary daily contact"
                value={form.primaryDailyContact}
                options={TEAM_OPTIONS}
                onChange={(value) => onChange("primaryDailyContact", value)}
              />
              <PersonSelectField
                label="Primary billing contact"
                value={form.primaryBillingContact}
                options={TEAM_OPTIONS}
                onChange={(value) => onChange("primaryBillingContact", value)}
              />
            </div>
            <div className="edit-fields-column">
              <PersonSelectField
                label="Secondary billing contact"
                value={form.secondaryBillingContact}
                options={TEAM_OPTIONS}
                onChange={(value) => onChange("secondaryBillingContact", value)}
              />
              <PersonSelectField
                label="Primary marketing contact"
                value={form.primaryMarketingContact}
                options={TEAM_OPTIONS}
                onChange={(value) => onChange("primaryMarketingContact", value)}
              />
            </div>
          </div>
        </EditSection>
      </EditSection>
    </div>
  );
};

export default OrganizationGeneralSettings;
