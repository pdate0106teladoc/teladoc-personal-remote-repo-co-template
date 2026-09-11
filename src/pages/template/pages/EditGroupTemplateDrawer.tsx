import * as React from "react";
import { useEffect, useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { Button, CustomInput, FailSafePage, SideModal } from "@ucc/common-ui";
import GroupGeneralSettings from "./GroupGeneralSettings";
import {
  buildGroupTemplateForm,
  isGroupTemplateFormComplete,
} from "./groupForm";
import type { GroupTemplateField, GroupTemplateForm } from "./groupForm";
import type { TemplateSummary } from "./templateTypes";
import "@/pages/template/style/EditClientOverviewTemplateDrawer.scss";

const EDIT_TABS = [
  { key: "general-settings", title: "General settings", comingSoon: false },
  { key: "billing", title: "Billing", comingSoon: true },
  { key: "marketing", title: "Marketing", comingSoon: true },
  { key: "reporting", title: "Reporting", comingSoon: true },
  { key: "eligibility-and-claims", title: "Eligibility and claims", comingSoon: true },
  { key: "products", title: "Products", comingSoon: true },
  { key: "hierarchy", title: "Hierarchy", comingSoon: true },
  { key: "contacts", title: "Contacts", comingSoon: true },
];

interface EditGroupTemplateDrawerProps {
  show: boolean;
  template: TemplateSummary | null;
  onHide: () => void;
  onSave: (template: TemplateSummary, form: GroupTemplateForm) => void;
}

const EditGroupTemplateDrawer: React.FC<EditGroupTemplateDrawerProps> = ({
  show,
  template,
  onHide,
  onSave,
}) => {
  const [form, setForm] = useState<GroupTemplateForm>(() =>
    buildGroupTemplateForm(template?.name ?? ""),
  );

  useEffect(() => {
    setForm(buildGroupTemplateForm(template?.name ?? ""));
  }, [show, template?.id, template?.name]);

  const updateField = (
    field: GroupTemplateField,
    value: string | boolean,
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const canSave = isGroupTemplateFormComplete(form);

  const save = () => {
    if (template && canSave) {
      onSave(template, { ...form, templateName: form.templateName.trim() });
    }
  };

  return (
    <SideModal
      show={show && Boolean(template)}
      onHide={onHide}
      title="Edit Group template"
      type="lg"
    >
      {template && (
        <div className="edit-template-drawer">
          <div className="edit-template-drawer__content">
            <h3 className="edit-template-name-heading">{template.name}</h3>
            <div className="template-name-field">
              <CustomInput
                id="edit-group-template-name"
                name="templateName"
                label="Template name"
                className="input-style"
                value={form.templateName}
                onChange={(event) =>
                  updateField("templateName", event.target.value)
                }
                autoComplete="off"
              />
            </div>
            <Tabs
              defaultActiveKey={EDIT_TABS[0].key}
              id={`edit-group-tabs-${template.id}`}
              className="edit-template-tabs"
            >
              {EDIT_TABS.map((tab) => (
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
      )}
    </SideModal>
  );
};

export default EditGroupTemplateDrawer;
