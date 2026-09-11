import * as React from "react";
import {
  CurrencyField,
  EditSection,
  PersonSelectField,
  RadioField,
  ReadOnlyField,
  SelectField,
  TextField,
} from "./fields";
import type {
  ProgramOverviewContext,
  ProgramOverviewEditField,
  ProgramOverviewEditForm,
} from "./form";

interface ProgramOverviewGeneralSettingsProps {
  form: ProgramOverviewEditForm;
  context: ProgramOverviewContext;
  onChange: (field: ProgramOverviewEditField, value: string | boolean) => void;
}

const ProgramOverviewGeneralSettings: React.FC<
  ProgramOverviewGeneralSettingsProps
> = ({ form, context, onChange }) => (
  <div className="edit-form edit-program-general-settings">
    <EditSection title="Program Overview">
      <div className="edit-fields-grid">
        <div className="edit-fields-column">
          <ReadOnlyField label="Program" value={context.program} />
          <SelectField
            label="Program Platform Version"
            value={form.programPlatformVersion}
            options={["Retrofit", "Greenfield", "Legacy"]}
            onChange={(value) => onChange("programPlatformVersion", value)}
          />
          <ReadOnlyField label="Account" value={context.account} />
          <ReadOnlyField
            label="Client Overview"
            value={context.clientOverview}
          />
          <SelectField
            label="Program Implementation Status"
            value={form.programImplementationStatus}
            options={["Launched +90", "Launched", "In implementation"]}
            onChange={(value) =>
              onChange("programImplementationStatus", value)
            }
          />
          <SelectField
            label="Status"
            value={form.status}
            options={["Active", "Inactive", "Pending"]}
            onChange={(value) => onChange("status", value)}
          />
          <SelectField
            label="Registration Status"
            value={form.registrationStatus}
            options={["Open", "Closed", "Paused"]}
            onChange={(value) => onChange("registrationStatus", value)}
          />
          <SelectField
            label="Health Plan Partner Customization"
            value={form.healthPlanPartnerCustomization}
            options={[
              "Aetna Diabetes Management",
              "Aetna Hypertension Management",
              "None",
            ]}
            onChange={(value) =>
              onChange("healthPlanPartnerCustomization", value)
            }
          />
          <PersonSelectField
            label="Client Success Manager"
            value={form.clientSuccessManager}
            options={["Connor Hudson", "Alex Morgan"]}
            onChange={(value) => onChange("clientSuccessManager", value)}
          />
          <PersonSelectField
            label="Client Implementation Manager"
            value={form.clientImplementationManager}
            options={["Jane Williams", "Taylor Reed"]}
            onChange={(value) =>
              onChange("clientImplementationManager", value)
            }
          />
          <RadioField
            label="Disable Mental Health Guidance"
            value={form.disableMentalHealthGuidance}
            onChange={(value) => onChange("disableMentalHealthGuidance", value)}
          />
          <RadioField
            label="Disable Teletherapy"
            value={form.disableTeletherapy}
            onChange={(value) => onChange("disableTeletherapy", value)}
          />
          <RadioField
            label="Transitioning DPP Year 2 members"
            value={form.transitioningDppYear2Members}
            onChange={(value) =>
              onChange("transitioningDppYear2Members", value)
            }
          />
          <SelectField
            label="CDC Payer Type"
            value={form.cdcPayerType}
            options={["Commercial", "Medicare", "Medicaid"]}
            onChange={(value) => onChange("cdcPayerType", value)}
          />
          <SelectField
            label="CDC Enrollment Source"
            value={form.cdcEnrollmentSource}
            options={["Self referral", "Provider referral", "Client file"]}
            onChange={(value) => onChange("cdcEnrollmentSource", value)}
          />
        </div>
        <div className="edit-fields-column">
          <RadioField
            label="Provider Based Care"
            value={form.providerBasedCare}
            onChange={(value) => onChange("providerBasedCare", value)}
          />
          <TextField
            label="Kickoff Date"
            field="kickoffDate"
            type="date"
            value={form.kickoffDate}
            onChange={(value) => onChange("kickoffDate", value)}
          />
          <TextField
            label="Initial Launch Date"
            field="initialLaunchDate"
            type="date"
            value={form.initialLaunchDate}
            onChange={(value) => onChange("initialLaunchDate", value)}
          />
          <TextField
            label="Expected Launch Date"
            field="expectedLaunchDate"
            type="date"
            value={form.expectedLaunchDate}
            onChange={(value) => onChange("expectedLaunchDate", value)}
          />
          <TextField
            label="MyStrength Transition Date"
            field="myStrengthTransitionDate"
            type="date"
            value={form.myStrengthTransitionDate}
            onChange={(value) => onChange("myStrengthTransitionDate", value)}
          />
          <TextField
            label="Recruitable Population - Current"
            field="recruitablePopulationCurrent"
            value={form.recruitablePopulationCurrent}
            onChange={(value) =>
              onChange("recruitablePopulationCurrent", value)
            }
          />
          <TextField
            label="Recruitable Population (D+HTN)"
            field="recruitablePopulationDiabetesHypertension"
            value={form.recruitablePopulationDiabetesHypertension}
            onChange={(value) =>
              onChange("recruitablePopulationDiabetesHypertension", value)
            }
          />
          <TextField
            label="Enrollment Cap"
            field="enrollmentCap"
            value={form.enrollmentCap}
            onChange={(value) => onChange("enrollmentCap", value)}
          />
          <SelectField
            label="Program Qualification Dependency"
            value={form.programQualificationDependency}
            options={["Diabetes", "Hypertension", "None"]}
            onChange={(value) =>
              onChange("programQualificationDependency", value)
            }
          />
          <TextField
            label="Program Transition"
            field="programTransition"
            type="date"
            value={form.programTransition}
            onChange={(value) => onChange("programTransition", value)}
          />
          <SelectField
            label="New Device Type"
            value={form.newDeviceType}
            options={["HT900", "HT500", "None"]}
            onChange={(value) => onChange("newDeviceType", value)}
          />
          <RadioField
            label="CKD Aware Variant"
            value={form.ckdAwareVariant}
            onChange={(value) => onChange("ckdAwareVariant", value)}
          />
          <TextField
            label="Claims Configuration"
            field="claimsConfiguration"
            value={form.claimsConfiguration}
            onChange={(value) => onChange("claimsConfiguration", value)}
          />
          <CurrencyField
            label="Partner Pass Through Price"
            field="partnerPassThroughPrice"
            value={form.partnerPassThroughPrice}
            onChange={(value) => onChange("partnerPassThroughPrice", value)}
          />
        </div>
      </div>
    </EditSection>

    <EditSection title="Program Schedule">
      <div className="edit-fields-grid">
        <div className="edit-fields-column">
          <TextField
            label="Name"
            field="scheduleName"
            value={form.scheduleName}
            onChange={(value) => onChange("scheduleName", value)}
          />
          <TextField
            label="Program start date"
            field="programStartDate"
            type="date"
            value={form.programStartDate}
            onChange={(value) => onChange("programStartDate", value)}
          />
          <TextField
            label="Program end date"
            field="programEndDate"
            type="date"
            value={form.programEndDate}
            onChange={(value) => onChange("programEndDate", value)}
          />
        </div>
        <div className="edit-fields-column">
          <TextField
            label="Contract term"
            field="contractTerm"
            value={form.contractTerm}
            onChange={(value) => onChange("contractTerm", value)}
          />
          <RadioField
            label="Auto renewal"
            value={form.autoRenewal}
            onChange={(value) => onChange("autoRenewal", value)}
          />
          <TextField
            label="Renewal notice period"
            field="renewalNoticePeriod"
            value={form.renewalNoticePeriod}
            onChange={(value) => onChange("renewalNoticePeriod", value)}
          />
        </div>
      </div>
    </EditSection>

    <EditSection title="Client Incentives">
      <div className="edit-fields-grid">
        <div className="edit-fields-column">
          <TextField
            label="Client plan design inclusions"
            field="clientPlanDesignInclusions"
            value={form.clientPlanDesignInclusions}
            onChange={(value) => onChange("clientPlanDesignInclusions", value)}
          />
        </div>
        <div className="edit-fields-column">
          <RadioField
            label="Provider based care"
            value={form.providerBasedCare}
            onChange={(value) => onChange("providerBasedCare", value)}
          />
        </div>
      </div>
    </EditSection>

    <EditSection title="Client implementation">
      <div className="edit-fields-grid">
        <div className="edit-fields-column">
          <TextField
            label="Cumulative program cap"
            field="cumulativeProgramCap"
            value={form.cumulativeProgramCap}
            onChange={(value) => onChange("cumulativeProgramCap", value)}
          />
          <TextField
            label="BMI limit"
            field="bmiLimit"
            value={form.bmiLimit}
            onChange={(value) => onChange("bmiLimit", value)}
          />
          <RadioField
            label="Confirm on no recruitable match"
            value={form.confirmOnNoRecruitableMatch}
            onChange={(value) => onChange("confirmOnNoRecruitableMatch", value)}
          />
          <TextField
            label="Qualification minimum age"
            field="qualificationMinimumAge"
            value={form.qualificationMinimumAge}
            onChange={(value) => onChange("qualificationMinimumAge", value)}
          />
        </div>
        <div className="edit-fields-column">
          <TextField
            label="Opt out questions"
            field="optOutQuestions"
            value={form.optOutQuestions}
            onChange={(value) => onChange("optOutQuestions", value)}
          />
          <TextField
            label="Additional questions"
            field="additionalQuestions"
            value={form.additionalQuestions}
            onChange={(value) => onChange("additionalQuestions", value)}
          />
          <TextField
            label="Insurance question group"
            field="insuranceQuestionGroup"
            value={form.insuranceQuestionGroup}
            onChange={(value) => onChange("insuranceQuestionGroup", value)}
          />
        </div>
      </div>
    </EditSection>
  </div>
);

export default ProgramOverviewGeneralSettings;
