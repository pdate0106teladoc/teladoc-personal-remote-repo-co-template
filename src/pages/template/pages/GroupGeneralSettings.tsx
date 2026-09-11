import * as React from "react";
import { ReadOnlyTemplateSections } from "./TemplateSections";
import {
  EditSection,
  PersonSelectField,
  RadioField,
  SelectField,
  TextField,
} from "./fields";
import type { GroupTemplateField, GroupTemplateForm } from "./form";

interface GroupGeneralSettingsEditProps {
  form: GroupTemplateForm;
  onChange: (field: GroupTemplateField, value: string | boolean) => void;
}

type GroupGeneralSettingsProps =
  | GroupGeneralSettingsEditProps
  | Record<string, never>;

const TEAM_OPTIONS = [
  "Chloe O’Malley",
  "Allison Miller",
  "Brian Cosgrove",
  "Bill Cosgrove",
  "Joel Miller",
];

const VIEW_SECTIONS = [
  {
    title: "Group overview",
    left: [
      { label: "Group name (Admin)", value: "Aetna Primary Aetna" },
      { label: "Client account (LCRM-Teladoc)", value: "Aetna" },
      { label: "Client account (LCRM-Livongo)", value: "Aetna" },
      { label: "Account (Client Overview)", value: "Aetna" },
      { label: "Legacy group ID", value: "21571" },
      { label: "Group ID", value: "234" },
      { label: "Revenue bucket", value: "USGH" },
      { label: "Line of business", value: "Commercial ASO" },
      { label: "Sold to account UUID", value: "-" },
      { label: "Namespace", value: "Standard" },
    ],
    right: [
      {
        label: "Client Manager",
        value: "Brian Cosgrove",
        format: "person" as const,
      },
      {
        label: "Client Implementation Manager",
        value: "Chloe O’Malley",
        format: "person" as const,
      },
      { label: "Status", value: "Active" },
      { label: "Effective start date", value: "Jan 1, 2025" },
      { label: "Effective end date", value: "-" },
      { label: "Termination date", value: "-" },
      { label: "Client Overview name", value: "Aetna-Livongo" },
      { label: "Client Overview status", value: "Active" },
      { label: "Contract path", value: "Livongo" },
      { label: "Domestic country", value: "United States of America" },
    ],
  },
  {
    title: "Brand",
    left: [
      { label: "OneApp access", value: "Yes" },
      { label: "Health assistant", value: "Yes" },
    ],
    right: [
      { label: "OneApp start date", value: "Jan 1, 2024" },
      { label: "Migration group number", value: "-" },
    ],
  },
  {
    title: "CCM configuration",
    left: [
      { label: "Livongo registration code", value: "AETNA-PD" },
      { label: "Livongo Client Member Code", value: "AETNA-PD" },
    ],
    right: [
      { label: "CCM registration flow scenarios", value: "Direct to Consumer" },
      { label: "Registration customizations", value: "Insurance - Required" },
    ],
  },
];

const GroupGeneralSettings: React.FC<GroupGeneralSettingsProps> = (props) => {
  if (!("form" in props)) {
    return (
      <div className="edit-form edit-general-settings">
        <EditSection title="Overview">
          <ReadOnlyTemplateSections
            sections={VIEW_SECTIONS}
            collapsible={false}
          />
        </EditSection>
      </div>
    );
  }

  const { form, onChange } = props;

  return (
    <div className="edit-form edit-general-settings">
      <EditSection title="Overview">
        <EditSection title="Group overview" collapsible={false}>
          <div className="edit-fields-grid">
            <div className="edit-fields-column">
              <TextField
                label="Group name (Admin)"
                field="groupNameAdmin"
                value={form.groupNameAdmin}
                onChange={(value) => onChange("groupNameAdmin", value)}
              />
              <SelectField
                label="Client account (LCRM-Teladoc)"
                value={form.clientAccountLcrmTeladoc}
                options={["Aetna", "Allied"]}
                onChange={(value) => onChange("clientAccountLcrmTeladoc", value)}
              />
              <SelectField
                label="Client account (LCRM-Livongo)"
                value={form.clientAccountLcrmLivongo}
                options={["Aetna", "Allied"]}
                onChange={(value) =>
                  onChange("clientAccountLcrmLivongo", value)
                }
              />
              <SelectField
                label="Account (Client Overview)"
                value={form.accountClientOverview}
                options={["Aetna", "Allied"]}
                onChange={(value) => onChange("accountClientOverview", value)}
              />
              <TextField
                label="Legacy group ID"
                field="legacyGroupId"
                value={form.legacyGroupId}
                onChange={(value) => onChange("legacyGroupId", value)}
              />
              <TextField
                label="Group ID"
                field="groupId"
                value={form.groupId}
                onChange={(value) => onChange("groupId", value)}
              />
              <SelectField
                label="Revenue bucket"
                value={form.revenueBucket}
                options={["USGH", "International", "Other"]}
                onChange={(value) => onChange("revenueBucket", value)}
              />
              <SelectField
                label="Line of business"
                value={form.lineOfBusiness}
                options={["Commercial ASO", "Fully insured", "Medicare"]}
                onChange={(value) => onChange("lineOfBusiness", value)}
              />
              <TextField
                label="Sold to account UUID"
                field="soldToAccountUuid"
                value={form.soldToAccountUuid}
                onChange={(value) => onChange("soldToAccountUuid", value)}
              />
              <SelectField
                label="Namespace"
                value={form.namespace}
                options={["Standard", "Custom"]}
                onChange={(value) => onChange("namespace", value)}
              />
            </div>
            <div className="edit-fields-column">
              <PersonSelectField
                label="Client Manager"
                value={form.clientManager}
                options={TEAM_OPTIONS}
                onChange={(value) => onChange("clientManager", value)}
              />
              <PersonSelectField
                label="Client Implementation Manager"
                value={form.clientImplementationManager}
                options={TEAM_OPTIONS}
                onChange={(value) =>
                  onChange("clientImplementationManager", value)
                }
              />
              <SelectField
                label="Status"
                value={form.status}
                options={["Active", "Inactive", "Terminated"]}
                onChange={(value) => onChange("status", value)}
              />
              <TextField
                label="Effective start date"
                field="effectiveStartDate"
                type="date"
                value={form.effectiveStartDate}
                onChange={(value) => onChange("effectiveStartDate", value)}
              />
              <TextField
                label="Effective end date"
                field="effectiveEndDate"
                type="date"
                value={form.effectiveEndDate}
                onChange={(value) => onChange("effectiveEndDate", value)}
              />
              <TextField
                label="Termination date"
                field="terminationDate"
                type="date"
                value={form.terminationDate}
                onChange={(value) => onChange("terminationDate", value)}
              />
              <TextField
                label="Client Overview name"
                field="clientOverviewName"
                value={form.clientOverviewName}
                onChange={(value) => onChange("clientOverviewName", value)}
              />
              <SelectField
                label="Client Overview status"
                value={form.clientOverviewStatus}
                options={["Active", "Inactive", "Terminated"]}
                onChange={(value) => onChange("clientOverviewStatus", value)}
              />
              <SelectField
                label="Contract path"
                value={form.contractPath}
                options={["Livongo", "Allied", "Direct"]}
                onChange={(value) => onChange("contractPath", value)}
              />
              <SelectField
                label="Domestic country"
                value={form.domesticCountry}
                options={["United States of America", "International"]}
                onChange={(value) => onChange("domesticCountry", value)}
              />
            </div>
          </div>
        </EditSection>

        <EditSection title="Brand" collapsible={false}>
          <div className="edit-fields-grid">
            <div className="edit-fields-column">
              <RadioField
                label="OneApp access"
                value={form.oneAppAccess}
                onChange={(value) => onChange("oneAppAccess", value)}
              />
              <RadioField
                label="Health assistant"
                value={form.healthAssistant}
                onChange={(value) => onChange("healthAssistant", value)}
              />
            </div>
            <div className="edit-fields-column">
              <TextField
                label="OneApp start date"
                field="oneAppStartDate"
                type="date"
                value={form.oneAppStartDate}
                onChange={(value) => onChange("oneAppStartDate", value)}
              />
              <TextField
                label="Migration group number"
                field="migrationGroupNumber"
                value={form.migrationGroupNumber}
                onChange={(value) => onChange("migrationGroupNumber", value)}
              />
            </div>
          </div>
        </EditSection>

        <EditSection title="CCM configuration" collapsible={false}>
          <div className="edit-fields-grid">
            <div className="edit-fields-column">
              <TextField
                label="Livongo registration code"
                field="livongoRegistrationCode"
                value={form.livongoRegistrationCode}
                onChange={(value) =>
                  onChange("livongoRegistrationCode", value)
                }
              />
              <TextField
                label="Livongo Client Member Code"
                field="livongoClientMemberCode"
                value={form.livongoClientMemberCode}
                onChange={(value) =>
                  onChange("livongoClientMemberCode", value)
                }
              />
            </div>
            <div className="edit-fields-column">
              <SelectField
                label="CCM registration flow scenarios"
                value={form.ccmRegistrationFlowScenarios}
                options={["Direct to Consumer", "Client directed", "Standard"]}
                onChange={(value) =>
                  onChange("ccmRegistrationFlowScenarios", value)
                }
              />
              <SelectField
                label="Registration customizations"
                value={form.registrationCustomizations}
                options={["Insurance - Required", "Standard", "Custom"]}
                onChange={(value) =>
                  onChange("registrationCustomizations", value)
                }
              />
            </div>
          </div>
        </EditSection>
      </EditSection>
    </div>
  );
};

export default GroupGeneralSettings;
