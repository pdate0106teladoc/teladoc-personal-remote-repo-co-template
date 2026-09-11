import * as React from "react";
import { useEffect, useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { Button, CustomInput, FailSafePage, SideModal } from "@ucc/common-ui";
import OrganizationGeneralSettings from "./OrganizationGeneralSettings";
import {
  buildOrganizationTemplateForm,
  isOrganizationTemplateFormComplete,
} from "./organizationForm";
import type {
  OrganizationTemplateField,
  OrganizationTemplateForm,
} from "./organizationForm";
import type { TemplateSummary } from "./templateTypes";
import "@/pages/template/style/EditClientOverviewTemplateDrawer.scss";

const EDIT_TABS = [
  { key: "general-settings", title: "General settings", comingSoon: false },
  { key: "billing", title: "Billing", comingSoon: true },
  { key: "marketing", title: "Marketing", comingSoon: true },
  { key: "reporting", title: "Reporting", comingSoon: true },
  { key: "opportunities", title: "Opportunities", comingSoon: true },
  { key: "hierarchy", title: "Hierarchy", comingSoon: true },
  { key: "contact", title: "Contact", comingSoon: true },
];

interface EditOrganizationTemplateDrawerProps {
  show: boolean;
  template: TemplateSummary | null;
  onHide: () => void;
  onSave: (template: TemplateSummary, form: OrganizationTemplateForm) => void;
}

const EditOrganizationTemplateDrawer: React.FC<
  EditOrganizationTemplateDrawerProps
> = ({ show, template, onHide, onSave }) => {
  const [form, setForm] = useState<OrganizationTemplateForm>(() =>
    buildOrganizationTemplateForm(template?.name ?? ""),
  );

  useEffect(() => {
    setForm(buildOrganizationTemplateForm(template?.name ?? ""));
  }, [show, template?.id, template?.name]);

  const updateField = (
    field: OrganizationTemplateField,
    value: string | boolean,
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const canSave = isOrganizationTemplateFormComplete(form);

  const save = () => {
    if (template && canSave) {
      onSave(template, { ...form, templateName: form.templateName.trim() });
    }
  };

  return (
    <SideModal
      show={show && Boolean(template)}
      onHide={onHide}
      title="Edit Organization template"
      type="lg"
    >
      {template && (
        <div className="edit-template-drawer">
          <div className="edit-template-drawer__content">
            <h3 className="edit-template-name-heading">{template.name}</h3>
            <div className="template-name-field">
              <CustomInput
                id="edit-organization-template-name"
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
              id={`edit-organization-tabs-${template.id}`}
              className="edit-template-tabs"
            >
              {EDIT_TABS.map((tab) => (
                <Tab eventKey={tab.key} title={tab.title} key={tab.key}>
                  {tab.comingSoon ? (
                    <FailSafePage cardType="comingSoon" />
                  ) : (
                    <OrganizationGeneralSettings
                      form={form}
                      onChange={updateField}
                    />
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

export default EditOrganizationTemplateDrawer;
