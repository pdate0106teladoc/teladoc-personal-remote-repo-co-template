import * as React from "react";
import { useEffect, useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { Button, CustomInput, SideModal } from "@ucc/common-ui";
import {
  Billing,
  buildNewClientOverviewTemplateForm,
  Eligibility,
  GeneralSettings,
  isNewClientOverviewTemplateFormComplete,
  Marketing,
} from "@/pages/template/pages/edit";
import type {
  ClientOverviewTemplateField,
  ClientOverviewTemplateForm,
} from "@/pages/template/pages/edit";
import "@/pages/template/style/EditClientOverviewTemplateDrawer.scss";
import "@/pages/template/style/CreateClientOverviewTemplateDrawer.scss";

interface CreateTab {
  key: string;
  title: string;
  render: (context: {
    form: ClientOverviewTemplateForm;
    onChange: (
      field: ClientOverviewTemplateField,
      value: string | boolean,
    ) => void;
  }) => React.ReactNode;
}

// Program overviews are attached after the template exists, so they are not
// part of creating one.
const CREATE_TABS: CreateTab[] = [
  {
    key: "general-settings",
    title: "General settings",
    render: ({ form, onChange }) => (
      <GeneralSettings form={form} onChange={onChange} />
    ),
  },
  {
    key: "billing",
    title: "Billing",
    render: ({ form, onChange }) => (
      <Billing form={form} onChange={onChange} />
    ),
  },
  {
    key: "marketing",
    title: "Marketing",
    render: ({ form, onChange }) => (
      <Marketing form={form} onChange={onChange} />
    ),
  },
  {
    key: "eligibility",
    title: "Eligibility",
    render: ({ form, onChange }) => (
      <Eligibility form={form} onChange={onChange} />
    ),
  },
];

interface CreateClientOverviewTemplateDrawerProps {
  show: boolean;
  onHide: () => void;
  onSave: (form: ClientOverviewTemplateForm) => void;
}

const CreateClientOverviewTemplateDrawer: React.FC<
  CreateClientOverviewTemplateDrawerProps
> = ({ show, onHide, onSave }) => {
  const [form, setForm] = useState<ClientOverviewTemplateForm>(
    buildNewClientOverviewTemplateForm,
  );

  useEffect(() => {
    setForm(buildNewClientOverviewTemplateForm());
  }, [show]);

  const updateField = (
    field: ClientOverviewTemplateField,
    value: string | boolean,
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const canSave = isNewClientOverviewTemplateFormComplete(form);

  const save = () => {
    if (canSave) {
      onSave({ ...form, templateName: form.templateName.trim() });
    }
  };

  return (
    <SideModal
      show={show}
      onHide={onHide}
      title="Create Client Overview template"
      type="lg"
    >
      <div className="edit-template-drawer create-template-drawer">
        <div className="edit-template-drawer__content">
          <div className="create-template-fields">
            <div className="template-name-field">
              <CustomInput
                id="create-template-name"
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
                id="create-template-type"
                name="templateType"
                label="Template type"
                className="input-style readonly-field"
                readOnly
                value="Client Overview"
              />
            </div>
          </div>
          <Tabs
            defaultActiveKey={CREATE_TABS[0].key}
            id="create-template-tabs"
            className="edit-template-tabs"
          >
            {CREATE_TABS.map((tab) => (
              <Tab eventKey={tab.key} title={tab.title} key={tab.key}>
                {tab.render({ form, onChange: updateField })}
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

export default CreateClientOverviewTemplateDrawer;
