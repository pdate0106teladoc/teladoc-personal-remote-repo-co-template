import * as React from "react";
import {
  CurrencyField,
  EditSection,
  RadioField,
  SelectField,
  TextField,
} from "./fields";
import type {
  ProgramOverviewEditField,
  ProgramOverviewEditForm,
} from "./programOverviewForm";

interface ProgramOverviewBillingProps {
  form: ProgramOverviewEditForm;
  onChange: (field: ProgramOverviewEditField, value: string | boolean) => void;
}

const ProgramOverviewBilling: React.FC<ProgramOverviewBillingProps> = ({
  form,
  onChange,
}) => (
  <div className="edit-form edit-program-billing">
    <EditSection title="Contract: Program Schedule">
      <div className="edit-fields-grid">
        <div className="edit-fields-column">
          <TextField
            label="Unique Contract Terms"
            field="uniqueContractTerms"
            value={form.uniqueContractTerms}
            onChange={(value) => onChange("uniqueContractTerms", value)}
          />
          <CurrencyField
            label="Lost/Damaged Device Price 1"
            field="lostDamagedDevicePrice1"
            value={form.lostDamagedDevicePrice1}
            onChange={(value) => onChange("lostDamagedDevicePrice1", value)}
          />
          <CurrencyField
            label="PPPM"
            field="pppm"
            value={form.pppm}
            onChange={(value) => onChange("pppm", value)}
          />
          <CurrencyField
            label="PMPM"
            field="pmpm"
            value={form.pmpm}
            onChange={(value) => onChange("pmpm", value)}
          />
          <TextField
            label="Tier 2 PPPM Start Month"
            field="tier2PppmStartMonth"
            value={form.tier2PppmStartMonth}
            onChange={(value) => onChange("tier2PppmStartMonth", value)}
          />
          <CurrencyField
            label="Tier 2 PPPM"
            field="tier2Pppm"
            value={form.tier2Pppm}
            onChange={(value) => onChange("tier2Pppm", value)}
          />
          <TextField
            label="Tier 3 PPPM Start Month"
            field="tier3PppmStartMonth"
            value={form.tier3PppmStartMonth}
            onChange={(value) => onChange("tier3PppmStartMonth", value)}
          />
          <CurrencyField
            label="Tier 3 PPPM"
            field="tier3Pppm"
            value={form.tier3Pppm}
            onChange={(value) => onChange("tier3Pppm", value)}
          />
          <TextField
            label="Consecutive Inactive Months to Lapse"
            field="consecutiveInactiveMonthsToLapse"
            value={form.consecutiveInactiveMonthsToLapse}
            onChange={(value) =>
              onChange("consecutiveInactiveMonthsToLapse", value)
            }
          />
          <TextField
            label="Minimum Number of Participants"
            field="minimumNumberOfParticipants"
            value={form.minimumNumberOfParticipants}
            onChange={(value) => onChange("minimumNumberOfParticipants", value)}
          />
          <RadioField
            label="Is there a PTMM?"
            value={form.hasPtmm}
            onChange={(value) => onChange("hasPtmm", value)}
          />
          <TextField
            label="Participant Term Minimum Months"
            field="participantTermMinimumMonths"
            value={form.participantTermMinimumMonths}
            onChange={(value) =>
              onChange("participantTermMinimumMonths", value)
            }
          />
          <TextField
            label="Multiprogram Discount"
            field="multiprogramDiscount"
            value={form.multiprogramDiscount}
            onChange={(value) => onChange("multiprogramDiscount", value)}
          />
          <RadioField
            label="Milestone Billing"
            value={form.milestoneBilling}
            onChange={(value) => onChange("milestoneBilling", value)}
          />
          <SelectField
            label="Milestone Billing Configuration"
            value={form.milestoneBillingConfiguration}
            options={["Livongo Standard 2.0", "Livongo Standard", "Custom"]}
            onChange={(value) =>
              onChange("milestoneBillingConfiguration", value)
            }
          />
        </div>

        <div className="edit-fields-column">
          <CurrencyField
            label="Low Acuity Price"
            field="lowAcuityPrice"
            value={form.lowAcuityPrice}
            onChange={(value) => onChange("lowAcuityPrice", value)}
          />
          <CurrencyField
            label="Upfront Per Member"
            field="upfrontPerMember"
            value={form.upfrontPerMember}
            onChange={(value) => onChange("upfrontPerMember", value)}
          />
          <TextField
            label="Unique Contract Terms"
            field="billingUniqueContractTerms"
            value={form.billingUniqueContractTerms}
            onChange={(value) =>
              onChange("billingUniqueContractTerms", value)
            }
          />
          <CurrencyField
            label="Billing Partner Fee"
            field="billingPartnerFee"
            value={form.billingPartnerFee}
            onChange={(value) => onChange("billingPartnerFee", value)}
          />
          <SelectField
            label="Billing Partner Fee Type"
            value={form.billingPartnerFeeType}
            options={["Administrative", "Percentage", "Flat fee"]}
            onChange={(value) => onChange("billingPartnerFeeType", value)}
          />
          <SelectField
            label="PPPM Billing Trigger"
            value={form.pppmBillingTrigger}
            options={["First Device Reading", "Enrollment", "Activation"]}
            onChange={(value) => onChange("pppmBillingTrigger", value)}
          />
          <RadioField
            label="Is there Lapse Criteria?"
            value={form.hasLapseCriteria}
            onChange={(value) => onChange("hasLapseCriteria", value)}
          />
          <SelectField
            label="Lapsed Criteria Source"
            value={form.lapsedCriteriaSource}
            options={["Program Agreement", "Master Agreement", "Custom"]}
            onChange={(value) => onChange("lapsedCriteriaSource", value)}
          />
          <SelectField
            label="Lapse Criteria"
            value={form.lapseCriteria}
            options={["Any Activity V2", "Any Activity", "Custom"]}
            onChange={(value) => onChange("lapseCriteria", value)}
          />
          <TextField
            label="Lapsed User Custom Detail"
            field="lapsedUserCustomDetail"
            value={form.lapsedUserCustomDetail}
            onChange={(value) => onChange("lapsedUserCustomDetail", value)}
          />
          <SelectField
            label="Lost/Damaged Device 1"
            value={form.lostDamagedDevice1}
            options={["Blood Glucose Meter", "Blood Pressure Monitor", "Scale"]}
            onChange={(value) => onChange("lostDamagedDevice1", value)}
          />
          <CurrencyField
            label="Lost/Damaged Device Price 1"
            field="replacementDevicePrice1"
            value={form.replacementDevicePrice1}
            onChange={(value) => onChange("replacementDevicePrice1", value)}
          />
          <SelectField
            label="Lost/Damaged Device 2"
            value={form.lostDamagedDevice2}
            options={["Blood Glucose Meter", "Blood Pressure Monitor", "Scale"]}
            onChange={(value) => onChange("lostDamagedDevice2", value)}
          />
          <CurrencyField
            label="Lost/Damaged Device Price 2"
            field="lostDamagedDevicePrice2"
            value={form.lostDamagedDevicePrice2}
            onChange={(value) => onChange("lostDamagedDevicePrice2", value)}
          />
          <SelectField
            label="Lost/Damaged Device Responsibility"
            value={form.lostDamagedDeviceResponsibility}
            options={["Livongo", "Client", "Member"]}
            onChange={(value) =>
              onChange("lostDamagedDeviceResponsibility", value)
            }
          />
        </div>
      </div>
    </EditSection>

    <EditSection title="Program overview">
      <div className="edit-fields-grid">
        <div className="edit-fields-column">
          <SelectField
            label="Claims configuration"
            value={form.claimsConfiguration}
            options={["Standard", "Custom", "None"]}
            onChange={(value) => onChange("claimsConfiguration", value)}
          />
          <SelectField
            label="New device type"
            value={form.newDeviceType}
            options={["HT900", "BP800", "Scale"]}
            onChange={(value) => onChange("newDeviceType", value)}
          />
        </div>

        <div className="edit-fields-column">
          <SelectField
            label="CDC payer type"
            value={form.cdcPayerType}
            options={["Commercial", "Medicare", "Medicaid"]}
            onChange={(value) => onChange("cdcPayerType", value)}
          />
          <CurrencyField
            label="Partner pass through price"
            field="partnerPassThroughPrice"
            value={form.partnerPassThroughPrice}
            onChange={(value) => onChange("partnerPassThroughPrice", value)}
          />
        </div>
      </div>
    </EditSection>

    <EditSection title="Member support">
      <div className="edit-fields-grid">
        <div className="edit-fields-column">
          <SelectField
            label="Replacement device coverage"
            value={form.replacementDeviceCoverage}
            options={["Livongo", "Client", "Member"]}
            onChange={(value) => onChange("replacementDeviceCoverage", value)}
          />
        </div>

        <div className="edit-fields-column" />
      </div>
    </EditSection>

    <EditSection title="Performance Guarantees">
      <div className="edit-fields-grid">
        <div className="edit-fields-column">
          <RadioField
            label="Is performance guarantees applicable?"
            value={form.performanceGuaranteesApplicable}
            onChange={(value) =>
              onChange("performanceGuaranteesApplicable", value)
            }
          />
          <RadioField
            label="A1C reduction"
            value={form.a1cReduction}
            onChange={(value) => onChange("a1cReduction", value)}
          />
          <RadioField
            label="Participant satisfaction"
            value={form.participantSatisfaction}
            onChange={(value) => onChange("participantSatisfaction", value)}
          />
          <RadioField
            label="Reduction in BG"
            value={form.reductionInBg}
            onChange={(value) => onChange("reductionInBg", value)}
          />
          <RadioField
            label="Custom BG type"
            value={form.customBgType}
            onChange={(value) => onChange("customBgType", value)}
          />
          <TextField
            label="PG custom detail"
            field="pgCustomDetail"
            value={form.pgCustomDetail}
            onChange={(value) => onChange("pgCustomDetail", value)}
          />
          <TextField
            label="PG analysis due date"
            field="pgAnalysisDueDate"
            type="date"
            value={form.pgAnalysisDueDate}
            onChange={(value) => onChange("pgAnalysisDueDate", value)}
          />
        </div>

        <div className="edit-fields-column">
          <CurrencyField
            label="PG A1C reduction PPPM"
            field="pgA1cReductionPppm"
            value={form.pgA1cReductionPppm}
            onChange={(value) => onChange("pgA1cReductionPppm", value)}
          />
          <TextField
            label="PG A1C reduction percent"
            field="pgA1cReductionPercent"
            value={form.pgA1cReductionPercent}
            onChange={(value) => onChange("pgA1cReductionPercent", value)}
          />
          <CurrencyField
            label="PG reduction in out of range time PPPM"
            field="pgReductionOutOfRangeTimePppm"
            value={form.pgReductionOutOfRangeTimePppm}
            onChange={(value) =>
              onChange("pgReductionOutOfRangeTimePppm", value)
            }
          />
          <TextField
            label="PG reduction in out of range time Percent"
            field="pgReductionOutOfRangeTimePercent"
            value={form.pgReductionOutOfRangeTimePercent}
            onChange={(value) =>
              onChange("pgReductionOutOfRangeTimePercent", value)
            }
          />
          <CurrencyField
            label="PG satisfaction PPPM"
            field="pgSatisfactionPppm"
            value={form.pgSatisfactionPppm}
            onChange={(value) => onChange("pgSatisfactionPppm", value)}
          />
          <TextField
            label="PG satisfaction percent"
            field="pgSatisfactionPercent"
            value={form.pgSatisfactionPercent}
            onChange={(value) => onChange("pgSatisfactionPercent", value)}
          />
        </div>
      </div>
    </EditSection>
  </div>
);

export default ProgramOverviewBilling;
