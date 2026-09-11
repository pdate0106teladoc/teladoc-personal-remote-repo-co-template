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
} from "./form";

interface ClientOverviewBillingEditProps {
  form: ClientOverviewTemplateForm;
  onChange: (
    field: ClientOverviewTemplateField,
    value: string | boolean,
  ) => void;
}

interface ClientOverviewBillingViewProps {
  detail: TemplateDetail;
}

type ClientOverviewBillingProps = ClientOverviewBillingEditProps | ClientOverviewBillingViewProps;

const ClientOverviewBilling: React.FC<ClientOverviewBillingProps> = (props) => {
  if ("detail" in props) {
    return (
      <ReadOnlyTemplateSections
        sections={getClientOverviewSections("billing", props.detail)}
      />
    );
  }

  const { form, onChange } = props;

  return (

  <div className="edit-form edit-billing">
    <EditSection title="CCM billing details">
      <div className="edit-fields-grid">
        <div className="edit-fields-column">
          <SelectField
            label="Billing partner"
            value={form.billingPartner}
            options={["Livongo", "Teladoc", "Partner"]}
            onChange={(value) => onChange("billingPartner", value)}
          />
          <SelectField
            label="Billing method"
            value={form.billingMethod}
            options={["PEPM", "Claims", "Invoice"]}
            onChange={(value) => onChange("billingMethod", value)}
          />
          <RadioField
            label="Detailed invoice?"
            value={form.detailedInvoice}
            onChange={(value) => onChange("detailedInvoice", value)}
          />
          <SelectField
            label="Billing point of contact"
            value={form.billingPointOfContact}
            options={["Finance", "Client Success", "Implementation"]}
            onChange={(value) => onChange("billingPointOfContact", value)}
          />
          <SelectField
            label="HIPAA covered entity"
            value={form.hipaaCoveredEntity}
            options={["Covered entity", "Business associate", "Not applicable"]}
            onChange={(value) => onChange("hipaaCoveredEntity", value)}
          />
          <TextField
            label="Detailed invoice recipients"
            field="detailedInvoiceRecipients"
            value={form.detailedInvoiceRecipients}
            onChange={(value) => onChange("detailedInvoiceRecipients", value)}
          />
          <SelectField
            label="Payment terms"
            value={form.paymentTerms}
            options={["Net 30", "Net 45", "Net 60"]}
            onChange={(value) => onChange("paymentTerms", value)}
          />
          <SelectField
            label="Pricing model"
            value={form.pricingModel}
            options={["PEPM", "PMPM", "Bundled"]}
            onChange={(value) => onChange("pricingModel", value)}
          />
          <TextField
            label="Detailed invoice tags"
            field="detailedInvoiceTags"
            value={form.detailedInvoiceTags}
            onChange={(value) => onChange("detailedInvoiceTags", value)}
          />
        </div>
        <div className="edit-fields-column">
          <TextField
            label="Bundled pricing discount"
            field="bundledPricingDiscount"
            value={form.bundledPricingDiscount}
            onChange={(value) => onChange("bundledPricingDiscount", value)}
          />
          <RadioField
            label="Prorated enrollment"
            value={form.proratedEnrollment}
            onChange={(value) => onChange("proratedEnrollment", value)}
          />
          <RadioField
            label="Fast start credit offered"
            value={form.fastStartCreditOffered}
            onChange={(value) => onChange("fastStartCreditOffered", value)}
          />
          <SelectField
            label="Fast start credit type"
            value={form.fastStartCreditType}
            options={["Standard", "Custom", "None"]}
            onChange={(value) => onChange("fastStartCreditType", value)}
          />
          <TextField
            label="Fast start participation rate"
            field="fastStartParticipationRate"
            value={form.fastStartParticipationRate}
            onChange={(value) => onChange("fastStartParticipationRate", value)}
          />
          <TextField
            label="Fast start launch date"
            field="fastStartLaunchDate"
            type="date"
            value={form.fastStartLaunchDate}
            onChange={(value) => onChange("fastStartLaunchDate", value)}
          />
          <TextField
            label="Fast start close date"
            field="fastStartCloseDate"
            type="date"
            value={form.fastStartCloseDate}
            onChange={(value) => onChange("fastStartCloseDate", value)}
          />
          <TextField
            label="Fast start custom"
            field="fastStartCustom"
            value={form.fastStartCustom}
            onChange={(value) => onChange("fastStartCustom", value)}
          />
          <TextField
            label="Billing address - CCM"
            field="billingAddressCcm"
            value={form.billingAddressCcm}
            onChange={(value) => onChange("billingAddressCcm", value)}
          />
        </div>
      </div>
    </EditSection>

    <EditSection title="Contract Details">
      <div className="edit-fields-grid">
        <div className="edit-fields-column">
          <SelectField
            label="Contract Type"
            value={form.contractType}
            options={["Program Agreement", "Master Agreement", "Amendment"]}
            onChange={(value) => onChange("contractType", value)}
          />
          <TextField
            label="Legal Name"
            field="legalName"
            value={form.legalName}
            onChange={(value) => onChange("legalName", value)}
          />
          <TextField
            label="Contract Effective Date"
            field="contractEffectiveDate"
            type="date"
            value={form.contractEffectiveDate}
            onChange={(value) => onChange("contractEffectiveDate", value)}
          />
          <TextField
            label="Contract Termination Date"
            field="contractTerminationDate"
            type="date"
            value={form.contractTerminationDate}
            onChange={(value) => onChange("contractTerminationDate", value)}
          />
          <RadioField
            label="BAA Signed?"
            value={form.baaSigned}
            onChange={(value) => onChange("baaSigned", value)}
          />
          <TextField
            label="Unique Contract Terms"
            field="uniqueContractTerms"
            value={form.uniqueContractTerms}
            onChange={(value) => onChange("uniqueContractTerms", value)}
          />
          <RadioField
            label="Marketing & DOPS requirement"
            value={form.marketingAndDopsRequirement}
            onChange={(value) => onChange("marketingAndDopsRequirement", value)}
          />
          <RadioField
            label="Account has SLA?"
            value={form.accountHasSla}
            onChange={(value) => onChange("accountHasSla", value)}
          />
        </div>
        <div className="edit-fields-column">
          <TextField
            label="SLA Details"
            field="slaDetails"
            value={form.slaDetails}
            onChange={(value) => onChange("slaDetails", value)}
          />
          <TextField
            label="Days notice for termination"
            field="daysNoticeForTermination"
            value={form.daysNoticeForTermination}
            onChange={(value) => onChange("daysNoticeForTermination", value)}
          />
          <RadioField
            label="Termination for convenience?"
            value={form.terminationForConvenience}
            onChange={(value) => onChange("terminationForConvenience", value)}
          />
          <TextField
            label="Days notice for convenience term"
            field="daysNoticeForConvenienceTerm"
            value={form.daysNoticeForConvenienceTerm}
            onChange={(value) =>
              onChange("daysNoticeForConvenienceTerm", value)
            }
          />
          <RadioField
            label="Bill early termination through claims"
            value={form.billEarlyTerminationThroughClaims}
            onChange={(value) =>
              onChange("billEarlyTerminationThroughClaims", value)
            }
          />
          <TextField
            label="Customer signed date"
            field="customerSignedDate"
            type="date"
            value={form.customerSignedDate}
            onChange={(value) => onChange("customerSignedDate", value)}
          />
          <TextField
            label="Company signed date"
            field="companySignedDate"
            type="date"
            value={form.companySignedDate}
            onChange={(value) => onChange("companySignedDate", value)}
          />
        </div>
      </div>
    </EditSection>

    <EditSection title="Lapsed User Details">
      <div className="edit-fields-grid">
        <div className="edit-fields-column">
          <RadioField
            label="Clause: Claims data"
            value={form.lapsedClauseClaimsData}
            onChange={(value) => onChange("lapsedClauseClaimsData", value)}
          />
          <RadioField
            label="Clause: Optimized enrollment plan"
            value={form.lapsedClauseOptimizedEnrollmentPlan}
            onChange={(value) =>
              onChange("lapsedClauseOptimizedEnrollmentPlan", value)
            }
          />
          <RadioField
            label="Is there a lapsed user clause"
            value={form.isThereALapsedUserClause}
            onChange={(value) => onChange("isThereALapsedUserClause", value)}
          />
        </div>
        <div className="edit-fields-column">
          <RadioField
            label="Clause: Multi-Channel marketing"
            value={form.lapsedClauseMultiChannelMarketing}
            onChange={(value) =>
              onChange("lapsedClauseMultiChannelMarketing", value)
            }
          />
          <RadioField
            label="Clause: Use of incentives"
            value={form.lapsedClauseUseOfIncentives}
            onChange={(value) => onChange("lapsedClauseUseOfIncentives", value)}
          />
        </div>
      </div>
    </EditSection>
  </div>
  );
};

export default ClientOverviewBilling;
