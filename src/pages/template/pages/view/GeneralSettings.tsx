import * as React from "react";
import { FieldGrid } from "./FieldGrid";
import type { TemplateDetail } from "./types";
import "@/pages/template/style/GeneralSettings.scss";

interface GeneralSettingsProps {
  detail: TemplateDetail;
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({ detail }) => (
  <div className="template-general-settings">
    <section className="detail-section">
      <h3>Overview</h3>
      <div className="overview-columns">
        <FieldGrid fields={detail.overviewLeft} />
        <FieldGrid fields={detail.overviewRight} />
      </div>
    </section>
    <section className="detail-section">
      <h3>Group relationship</h3>
      <FieldGrid fields={detail.groupRelationship} />
    </section>
  </div>
);

export default GeneralSettings;
