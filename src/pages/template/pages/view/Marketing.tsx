import * as React from "react";
import { EditSection } from "@/pages/template/pages/edit/fields";
import { FieldColumns } from "./FieldColumns";
import type { TemplateDetail } from "./types";
import "@/pages/template/style/GeneralSettings.scss";

interface MarketingProps {
  detail: TemplateDetail;
}

const Marketing: React.FC<MarketingProps> = ({ detail }) => (
  <div className="template-readonly-form edit-form">
    <EditSection title="Group Overview">
      <FieldColumns
        left={detail.groupOverviewLeft}
        right={detail.groupOverviewRight}
      />
    </EditSection>
    <EditSection title="CCM Logos">
      <FieldColumns left={detail.ccmLogosLeft} right={detail.ccmLogosRight} />
    </EditSection>
    <EditSection title="Allowed Communication Methods">
      <FieldColumns
        left={detail.allowedCommunicationLeft}
        right={detail.allowedCommunicationRight}
      />
    </EditSection>
    <EditSection title="Marketing Preferences">
      <FieldColumns
        left={detail.marketingPreferencesLeft}
        right={detail.marketingPreferencesRight}
      />
    </EditSection>
    <EditSection title="Additional marketing details">
      <FieldColumns
        left={detail.additionalMarketingLeft}
        right={detail.additionalMarketingRight}
      />
    </EditSection>
  </div>
);

export default Marketing;
