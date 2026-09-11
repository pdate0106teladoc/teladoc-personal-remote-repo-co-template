import * as React from "react";
import { useEffect, useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { Button, CustomInput, FailSafePage, SideModal } from "@ucc/common-ui";
import GroupGeneralSettings from "./GroupGeneralSettings";
import {
  buildNewGroupTemplateForm,
  isGroupTemplateFormComplete,
} from "./groupForm";
import type { GroupTemplateField, GroupTemplateForm } from "./groupForm";
import "@/pages/template/style/EditClientOverviewTemplateDrawer.scss";
import "@/pages/template/style/CreateClientOverviewTemplateDrawer.scss";

const CREATE_TABS = [
  { key: "general-settings", title: "General settings", comingSoon: false },
  { key: "billing", title: "Billing", comingSoon: true },
  { key: "marketing", title: "Marketing", comingSoon: true },
  { key: "reporting", title: "Reporting", comingSoon: true },
  { key: "eligibility-and-claims", title: "Eligibility and claims", comingSoon: true },
  { key: "products", title: "Products", comingSoon: true },
  { key: "hierarchy", title: "Hierarchy", comingSoon: true },
  { key: "contacts", title: "Contacts", comingSoon: true },
];

interface CreateGroupTemplateDrawerProps {
  show: boolean;
  onHide: () => void;
  onSave: (form: GroupTemplateForm) => void;
}

const CreateGroupTemplateDrawer: React.FC<CreateGroupTemplateDrawerProps> = ({
  show,
  onHide,
  onSave,
}) => {
  const [form, setForm] = useState<GroupTemplateForm>(buildNewGroupTemplateForm);

  useEffect(() => {
    setForm(buildNewGroupTemplateForm());
  }, [show]);

  const updateField = (
    field: GroupTemplateField,
    value: string | boolean,
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const canSave = isGroupTemplateFormComplete(form);

  const save = () => {
    if (canSave) {
      onSave({ ...form, templateName: form.templateName.trim() });
    }
  };

  return (
    <SideModal
      show={show}
      onHide={onHide}
      title="Create Group template"
      type="lg"
    >
      <div className="edit-template-drawer create-template-drawer">
        <div className="edit-template-drawer__content">
          <div className="create-template-fields">
            <div className="template-name-field">
              <CustomInput
                id="create-group-template-name"
                name="templateName"
                label="Template name"
                className="input-style"
                required
                autoFocus
                value={form.templateName}
                onChange={(event) =>
                  updateField("templateName", event.target.value)
                }
                autoComplete="off"
              />
            </div>
            <div className="template-name-field">
              <CustomInput
                id="create-group-template-type"
                name="templateType"
                label="Template type"
                className="input-style readonly-field"
                readOnly
                value="Group"
              />
            </div>
          </div>
          <Tabs
            defaultActiveKey={CREATE_TABS[0].key}
            id="create-group-template-tabs"
            className="edit-template-tabs"
          >
            {CREATE_TABS.map((tab) => (
              <Tab eventKey={tab.key} title={tab.title} key={tab.key}>
                {tab.comingSoon ? (
                  <FailSafePage cardType="comingSoon" />
                ) : (
                  <GroupGeneralSettings form={form} onChange={updateField} />
                )}
              </Tab>
            ))}
          </Tabs>
        </div>
        <div className="edit-template-drawer__footer">
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" onClick={save} disabled={!canSave}>
            Save
          </Button>
        </div>
      </div>
    </SideModal>
  );
};

export default CreateGroupTemplateDrawer;
