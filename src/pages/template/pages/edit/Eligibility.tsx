import * as React from "react";
import {
  EditSection,
  RadioField,
  SelectField,
  TextField,
} from "./fields";
import type {
  ClientOverviewTemplateField,
  ClientOverviewTemplateForm,
} from "./types";

interface EligibilityProps {
  form: ClientOverviewTemplateForm;
  onChange: (
    field: ClientOverviewTemplateField,
    value: string | boolean,
  ) => void;
}

const Eligibility: React.FC<EligibilityProps> = ({ form, onChange }) => (
  <div className="edit-form edit-eligibility">
    <EditSection title="Eligibility Details">
      <div className="edit-fields-grid">
        <div className="edit-fields-column">
          <TextField
            label="Link to Box folder - PHI Release"
            field="linkToBoxFolderPhiRelease"
            value={form.linkToBoxFolderPhiRelease}
            onChange={(value) => onChange("linkToBoxFolderPhiRelease", value)}
          />
          <RadioField
            label="Program Eligibility Flag"
            value={form.programEligibilityFlag}
            onChange={(value) => onChange("programEligibilityFlag", value)}
          />
          <RadioField
            label="Is Eligibility Divertised?"
            value={form.isEligibilityDivertised}
            onChange={(value) => onChange("isEligibilityDivertised", value)}
          />
          <SelectField
            label="Eligibility Verification Method"
            value={form.eligibilityVerificationMethod}
            options={["File", "API", "Manual"]}
            onChange={(value) =>
              onChange("eligibilityVerificationMethod", value)
            }
          />
          <SelectField
            label="Eligibility File Cadence"
            value={form.eligibilityFileCadence}
            options={["Daily", "Weekly", "Monthly"]}
            onChange={(value) => onChange("eligibilityFileCadence", value)}
          />
          <TextField
            label="Links to Eligibility Verification Folder"
            field="linksToEligibilityVerificationFolder"
            value={form.linksToEligibilityVerificationFolder}
            onChange={(value) =>
              onChange("linksToEligibilityVerificationFolder", value)
            }
          />
          <TextField
            label="Eligibility Exceptions/Rules"
            field="eligibilityExceptionsRules"
            value={form.eligibilityExceptionsRules}
            onChange={(value) => onChange("eligibilityExceptionsRules", value)}
          />
        </div>
        <div className="edit-fields-column">
          <TextField
            label="Monthly Escalation Path"
            field="monthlyEscalationPath"
            value={form.monthlyEscalationPath}
            onChange={(value) => onChange("monthlyEscalationPath", value)}
          />
          <TextField
            label="Eligibility Team Notes"
            field="eligibilityTeamNotes"
            value={form.eligibilityTeamNotes}
            onChange={(value) => onChange("eligibilityTeamNotes", value)}
          />
          <RadioField
            label="Disable Live Program Eligibility Check"
            value={form.disableLiveProgramEligibilityCheck}
            onChange={(value) =>
              onChange("disableLiveProgramEligibilityCheck", value)
            }
          />
          <TextField
            label="Eligible Group IDs"
            field="eligibleGroupIds"
            value={form.eligibleGroupIds}
            onChange={(value) => onChange("eligibleGroupIds", value)}
          />
          <RadioField
            label="Manual Check"
            value={form.manualCheck}
            onChange={(value) => onChange("manualCheck", value)}
          />
          <TextField
            label="Population Data Sources"
            field="populationDataSources"
            value={form.populationDataSources}
            onChange={(value) => onChange("populationDataSources", value)}
          />
        </div>
      </div>
    </EditSection>

    <EditSection title="CCM Integrations">
      <div className="edit-fields-grid">
        <div className="edit-fields-column">
          <SelectField
            label="SSO Partner"
            value={form.ssoPartner}
            options={["Okta", "Ping", "Azure AD", "None"]}
            onChange={(value) => onChange("ssoPartner", value)}
          />
          <TextField
            label="CVS/TDC Eligibility Criteria"
            field="cvsTdcEligibilityCriteria"
            value={form.cvsTdcEligibilityCriteria}
            onChange={(value) => onChange("cvsTdcEligibilityCriteria", value)}
          />
          <TextField
            label="Incentives API Partner"
            field="incentivesApiPartner"
            value={form.incentivesApiPartner}
            onChange={(value) => onChange("incentivesApiPartner", value)}
          />
        </div>
        <div className="edit-fields-column">
          <TextField
            label="Incentives API Start Date"
            field="incentivesApiStartDate"
            type="date"
            value={form.incentivesApiStartDate}
            onChange={(value) => onChange("incentivesApiStartDate", value)}
          />
          <SelectField
            label="Incentive Reporting Partner"
            value={form.incentiveReportingPartner}
            options={["Standard", "Custom", "None"]}
            onChange={(value) => onChange("incentiveReportingPartner", value)}
          />
        </div>
      </div>
    </EditSection>

    <EditSection title="Member Support Details">
      <TextField
        label="Member Support Details"
        field="memberSupportDetails"
        value={form.memberSupportDetails}
        onChange={(value) => onChange("memberSupportDetails", value)}
      />
    </EditSection>
  </div>
);

export default Eligibility;
