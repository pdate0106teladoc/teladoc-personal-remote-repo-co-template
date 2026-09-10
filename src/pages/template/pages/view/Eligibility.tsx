import * as React from "react";
import { EditSection, ReadOnlyField } from "@/pages/template/pages/edit/fields";
import { FieldColumns } from "./FieldColumns";
import type { TemplateDetail } from "./types";
import "@/pages/template/style/GeneralSettings.scss";

interface EligibilityProps {
  detail: TemplateDetail;
}

const Eligibility: React.FC<EligibilityProps> = ({ detail }) => (
  <div className="template-readonly-form edit-form">
    <EditSection title="Eligibility Details">
      <FieldColumns
        left={detail.eligibilityDetailsLeft}
        right={detail.eligibilityDetailsRight}
      />
    </EditSection>
    <EditSection title="CCM Integrations">
      <FieldColumns
        left={detail.ccmIntegrationsLeft}
        right={detail.ccmIntegrationsRight}
      />
    </EditSection>
    <EditSection title="Member Support Details">
      {detail.memberSupportDetails.map((field) => (
        <ReadOnlyField
          key={field.label}
          label={field.label}
          value={field.value}
        />
      ))}
    </EditSection>
  </div>
);

export default Eligibility;
