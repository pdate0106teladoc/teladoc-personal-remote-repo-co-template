import * as React from "react";
import { EditSection, RadioField, SelectField, TextField } from "./fields";
import type {
  ProgramOverviewEditField,
  ProgramOverviewEditForm,
} from "./form";

interface ProgramOverviewEligibilityProps {
  form: ProgramOverviewEditForm;
  onChange: (field: ProgramOverviewEditField, value: string | boolean) => void;
}

const ProgramOverviewEligibility: React.FC<
  ProgramOverviewEligibilityProps
> = ({ form, onChange }) => (
  <div className="edit-form edit-program-eligibility">
    <EditSection title="Program Eligibility">
      <div className="edit-fields-grid">
        <div className="edit-fields-column">
          <SelectField
            label="Program Eligibility Verification Method"
            value={form.programEligibilityVerificationMethod}
            options={[
              "RTE + (File OR Group ID)",
              "File",
              "Group ID",
              "RTE",
            ]}
            onChange={(value) =>
              onChange("programEligibilityVerificationMethod", value)
            }
          />
          <SelectField
            label="Program Eligibility File Cadence"
            value={form.programEligibilityFileCadence}
            options={["Daily", "Weekly", "Monthly"]}
            onChange={(value) =>
              onChange("programEligibilityFileCadence", value)
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
        </div>
        <div className="edit-fields-column">
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
            onChange={(value) =>
              onChange("eligibilityExceptionsRules", value)
            }
          />
          <TextField
            label="Eligibility team notes"
            field="eligibilityTeamNotes"
            value={form.eligibilityTeamNotes}
            onChange={(value) => onChange("eligibilityTeamNotes", value)}
          />
          <TextField
            label="Complex Escalation Details"
            field="complexEscalationDetails"
            value={form.complexEscalationDetails}
            onChange={(value) => onChange("complexEscalationDetails", value)}
          />
        </div>
      </div>
    </EditSection>
  </div>
);

export default ProgramOverviewEligibility;
