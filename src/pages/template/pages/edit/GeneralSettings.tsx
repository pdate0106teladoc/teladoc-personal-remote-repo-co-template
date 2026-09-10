import * as React from "react";
import { BsSearch, BsX } from "react-icons/bs";
import {
  EditSection,
  Field,
  RadioField,
  SelectField,
  TextAreaField,
  TextField,
} from "./fields";
import type {
  ClientOverviewTemplateField,
  ClientOverviewTemplateForm,
} from "./types";

interface GeneralSettingsProps {
  form: ClientOverviewTemplateForm;
  onChange: (
    field: ClientOverviewTemplateField,
    value: string | boolean,
  ) => void;
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  form,
  onChange,
}) => (
  <div className="edit-form edit-general-settings">
    <EditSection title="Overview">
      <div className="edit-fields-grid">
        <div className="edit-fields-column">
          <TextField
            label="Account name (LCRM Livongo)"
            field="accountName"
            value={form.accountName}
            onChange={(value) => onChange("accountName", value)}
          />
          <Field label="Organization" required>
            <span className="lookup-control">
              <BsSearch aria-hidden />
              <span className="lookup-value">{form.organization}</span>
              <button
                type="button"
                aria-label="Clear organization"
                onClick={() => onChange("organization", "")}
              >
                <BsX aria-hidden />
              </button>
            </span>
          </Field>
          <SelectField
            label="Contract path"
            value={form.contractPath}
            options={["Allied", "Direct", "Partner"]}
            onChange={(value) => onChange("contractPath", value)}
          />
          <SelectField
            label="Revenue bucket"
            value={form.revenueBucket}
            options={["USGH", "International", "Other"]}
            onChange={(value) => onChange("revenueBucket", value)}
          />
          <SelectField
            label="Client Success Manager"
            value={form.clientSuccessManager}
            options={["Connor Hudson", "Alex Morgan"]}
            onChange={(value) => onChange("clientSuccessManager", value)}
          />
          <SelectField
            label="Client Implementation Manager"
            value={form.clientImplementationManager}
            options={["Jane Williams", "Taylor Reed"]}
            onChange={(value) =>
              onChange("clientImplementationManager", value)
            }
          />
          <SelectField
            label="Registration customizations"
            value={form.registrationCustomizations}
            options={["Standard", "Custom"]}
            onChange={(value) => onChange("registrationCustomizations", value)}
          />
        </div>
        <div className="edit-fields-column">
          <SelectField
            label="Chronic care population type"
            value={form.chronicCarePopulationType}
            options={["Fully insured", "ASO Downmarket", "Self funded"]}
            onChange={(value) => onChange("chronicCarePopulationType", value)}
          />
          <SelectField
            label="Chronic care population coverage"
            value={form.chronicCarePopulationCoverage}
            options={[
              "Employees; Spouse; Children",
              "Employees only",
              "Employees; Spouse",
            ]}
            onChange={(value) =>
              onChange("chronicCarePopulationCoverage", value)
            }
          />
          <SelectField
            label="CCM registration address type"
            value={form.ccmRegistrationAddressType}
            options={["US Territory", "Mailing address", "Residential address"]}
            onChange={(value) =>
              onChange("ccmRegistrationAddressType", value)
            }
          />
          <SelectField
            label="CCM registration flow scenarios"
            value={form.ccmRegistrationFlowScenarios}
            options={["Direct-to-Consumer", "Client directed", "Standard"]}
            onChange={(value) =>
              onChange("ccmRegistrationFlowScenarios", value)
            }
          />
          <RadioField
            label="Cardio feature enabled"
            value={form.cardioFeatureEnabled}
            onChange={(value) => onChange("cardioFeatureEnabled", value)}
          />
          <TextField
            label="Cardio start date"
            field="cardioStartDate"
            type="date"
            value={form.cardioStartDate}
            onChange={(value) => onChange("cardioStartDate", value)}
          />
          <RadioField
            label="Welcome kits shipped by UPS, not Fedex"
            value={form.welcomeKitsShippedByUps}
            onChange={(value) => onChange("welcomeKitsShippedByUps", value)}
          />
        </div>
      </div>
    </EditSection>

    <EditSection title="Group relationship">
      <RadioField
        label="Has broker"
        value={form.hasBroker}
        onChange={(value) => onChange("hasBroker", value)}
      />
    </EditSection>

    <EditSection title="Group permissions">
      <div className="edit-fields-grid">
        <div className="edit-fields-column">
          <SelectField
            label="CCM multifactor authentication"
            value={form.ccmMultifactorAuthentication}
            options={["MFA Required", "MFA Optional", "No MFA"]}
            onChange={(value) =>
              onChange("ccmMultifactorAuthentication", value)
            }
          />
        </div>
        <div className="edit-fields-column">
          <RadioField
            label="Hide sexual orientation and gender identity questions?"
            value={form.hideSexualOrientationQuestions}
            onChange={(value) =>
              onChange("hideSexualOrientationQuestions", value)
            }
          />
        </div>
      </div>
    </EditSection>

    <EditSection title="Clinical and member support">
      <div className="edit-fields-grid">
        <div className="edit-fields-column">
          <SelectField
            label="Clinical model"
            value={form.clinicalModel}
            options={["Care coordination", "Standard care", "Guided care"]}
            onChange={(value) => onChange("clinicalModel", value)}
          />
          <SelectField
            label="Clinical data sharing and access"
            value={form.clinicalDataSharingAndAccess}
            options={["None", "One-way", "Bi-Directional"]}
            onChange={(value) => onChange("clinicalDataSharingAndAccess", value)}
          />
          <SelectField
            label="Clinical referrals"
            value={form.clinicalReferrals}
            options={["None", "One-way", "Bi-Directional"]}
            onChange={(value) => onChange("clinicalReferrals", value)}
          />
          <TextAreaField
            label="Clinical model details"
            field="clinicalModelDetails"
            value={form.clinicalModelDetails}
            onChange={(value) => onChange("clinicalModelDetails", value)}
          />
        </div>
        <div className="edit-fields-column">
          <TextField
            label="Member support phone"
            field="memberSupportPhone"
            type="tel"
            value={form.memberSupportPhone}
            onChange={(value) => onChange("memberSupportPhone", value)}
          />
          <TextAreaField
            label="Member support URL"
            field="memberSupportUrl"
            value={form.memberSupportUrl}
            onChange={(value) => onChange("memberSupportUrl", value)}
          />
        </div>
      </div>
    </EditSection>
  </div>
);

export default GeneralSettings;
