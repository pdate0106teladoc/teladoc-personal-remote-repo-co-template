import * as React from "react";
import { EditSection, ReadOnlyField } from "@/pages/template/pages/edit/fields";
import { FieldColumns } from "./FieldColumns";
import type { TemplateDetail } from "./types";
import "@/pages/template/style/GeneralSettings.scss";

interface GeneralSettingsProps {
  detail: TemplateDetail;
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({ detail }) => (
  <div className="template-readonly-form edit-form">
    <EditSection title="Overview">
      <FieldColumns left={detail.overviewLeft} right={detail.overviewRight} />
    </EditSection>
    <EditSection title="Group relationship">
      {detail.groupRelationship.map((field) => (
        <ReadOnlyField
          key={field.label}
          label={field.label}
          value={field.value}
        />
      ))}
    </EditSection>
    <EditSection title="Group permissions">
      <FieldColumns
        left={detail.groupPermissionsLeft}
        right={detail.groupPermissionsRight}
      />
    </EditSection>
    <EditSection title="Clinical and member support">
      <FieldColumns
        left={detail.clinicalAndMemberSupportLeft}
        right={detail.clinicalAndMemberSupportRight}
      />
    </EditSection>
  </div>
);

export default GeneralSettings;
