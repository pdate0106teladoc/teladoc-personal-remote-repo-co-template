import * as React from "react";
import { EditSection, SelectField, TextField } from "./fields";
import type {
  ProgramOverviewEditField,
  ProgramOverviewEditForm,
} from "./programOverviewForm";

interface ProgramOverviewMarketingProps {
  form: ProgramOverviewEditForm;
  onChange: (field: ProgramOverviewEditField, value: string | boolean) => void;
}

const ProgramOverviewMarketing: React.FC<ProgramOverviewMarketingProps> = ({
  form,
  onChange,
}) => (
  <div className="edit-form edit-program-marketing">
    <EditSection title="Client Incentives">
      <div className="edit-fields-grid">
        <div className="edit-fields-column">
          <SelectField
            label="Incentive Criteria"
            value={form.incentiveCriteria}
            options={["Days Checking", "Activity", "Enrollment"]}
            onChange={(value) => onChange("incentiveCriteria", value)}
          />
          <SelectField
            label="Frequency of Award"
            value={form.frequencyOfAward}
            options={["Weekly", "Monthly", "Quarterly"]}
            onChange={(value) => onChange("frequencyOfAward", value)}
          />
          <SelectField
            label="Incentives Report Delivery"
            value={form.incentivesReportDelivery}
            options={["Secure FTP", "Email", "None"]}
            onChange={(value) => onChange("incentivesReportDelivery", value)}
          />
          <SelectField
            label="Incentives Report Frequency"
            value={form.incentivesReportFrequency}
            options={["Weekly", "Monthly", "Quarterly"]}
            onChange={(value) => onChange("incentivesReportFrequency", value)}
          />
          <TextField
            label="Client Incentives Disclaimer"
            field="clientIncentivesDisclaimer"
            value={form.clientIncentivesDisclaimer}
            onChange={(value) => onChange("clientIncentivesDisclaimer", value)}
          />
        </div>
        <div className="edit-fields-column">
          <TextField
            label="Client Incentives Header"
            field="clientIncentivesHeader"
            value={form.clientIncentivesHeader}
            onChange={(value) => onChange("clientIncentivesHeader", value)}
          />
          <TextField
            label="Client Incentive Step 1"
            field="clientIncentiveStep1"
            value={form.clientIncentiveStep1}
            onChange={(value) => onChange("clientIncentiveStep1", value)}
          />
          <TextField
            label="Client Incentive Step 2"
            field="clientIncentiveStep2"
            value={form.clientIncentiveStep2}
            onChange={(value) => onChange("clientIncentiveStep2", value)}
          />
          <TextField
            label="Client Incentive Step 3"
            field="clientIncentiveStep3"
            value={form.clientIncentiveStep3}
            onChange={(value) => onChange("clientIncentiveStep3", value)}
          />
        </div>
      </div>
    </EditSection>

    <EditSection title="Program Overview">
      <div className="edit-fields-grid">
        <div className="edit-fields-column">
          <TextField
            label="Initial Member Recruitment"
            field="initialMemberRecruitment"
            value={form.initialMemberRecruitment}
            onChange={(value) => onChange("initialMemberRecruitment", value)}
          />
          <TextField
            label="WP Transition Member Recruitment"
            field="wpTransitionMemberRecruitment"
            value={form.wpTransitionMemberRecruitment}
            onChange={(value) =>
              onChange("wpTransitionMemberRecruitment", value)
            }
          />
        </div>
        <div className="edit-fields-column">
          <TextField
            label="Whole Person Transition Date"
            field="wholePersonTransitionDate"
            type="date"
            value={form.wholePersonTransitionDate}
            onChange={(value) => onChange("wholePersonTransitionDate", value)}
          />
        </div>
      </div>
    </EditSection>

    <EditSection title="Enrollment Marketing">
      <div className="edit-fields-grid">
        <div className="edit-fields-column">
          <TextField
            label="WP Transition Target Marketing"
            field="wpTransitionTargetMarketing"
            value={form.wpTransitionTargetMarketing}
            onChange={(value) =>
              onChange("wpTransitionTargetMarketing", value)
            }
          />
        </div>
        <div className="edit-fields-column">
          <SelectField
            label="Phone Campaign"
            value={form.phoneCampaign}
            options={["Phone + SMS", "Phone", "SMS", "None"]}
            onChange={(value) => onChange("phoneCampaign", value)}
          />
        </div>
      </div>
    </EditSection>
  </div>
);

export default ProgramOverviewMarketing;
