import * as React from "react";
import { EditSection } from "@/pages/template/pages/edit/fields";
import { FieldColumns } from "./FieldColumns";
import type { TemplateDetail } from "./types";
import "@/pages/template/style/GeneralSettings.scss";

interface BillingProps {
  detail: TemplateDetail;
}

const Billing: React.FC<BillingProps> = ({ detail }) => (
  <div className="template-readonly-form edit-form">
    <EditSection title="CCM billing details">
      <FieldColumns
        left={detail.ccmBillingLeft}
        right={detail.ccmBillingRight}
      />
    </EditSection>
    <EditSection title="Contract Details">
      <FieldColumns
        left={detail.contractDetailsLeft}
        right={detail.contractDetailsRight}
      />
    </EditSection>
    <EditSection title="Lapsed User Details">
      <FieldColumns
        left={detail.lapsedUserLeft}
        right={detail.lapsedUserRight}
      />
    </EditSection>
  </div>
);

export default Billing;
