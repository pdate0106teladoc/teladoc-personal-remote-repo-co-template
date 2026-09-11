import * as React from "react";
import { useEffect, useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { Button, CustomInput, FailSafePage, SideModal } from "@ucc/common-ui";
import ClientOverviewBilling from "./ClientOverviewBilling";
import ClientOverviewEligibility from "./ClientOverviewEligibility";
import ClientOverviewGeneralSettings from "./ClientOverviewGeneralSettings";
import ClientOverviewMarketing from "./ClientOverviewMarketing";
import GroupGeneralSettings from "./GroupGeneralSettings";
import OrganizationGeneralSettings from "./OrganizationGeneralSettings";
import {
  buildNewClientOverviewTemplateForm,
  buildNewGroupTemplateForm,
  buildNewOrganizationTemplateForm,
  isGroupTemplateFormComplete,
  isNewClientOverviewTemplateFormComplete,
  isOrganizationTemplateFormComplete,
} from "./form";
import type {
  ClientOverviewTemplateField,
  ClientOverviewTemplateForm,
  GroupTemplateField,
  GroupTemplateForm,
  OrganizationTemplateField,
  OrganizationTemplateForm,
} from "./form";
import type { TemplateScope } from "./templateTypes";
import "@/pages/template/style/EditClientOverviewTemplateDrawer.scss";
import "@/pages/template/style/CreateClientOverviewTemplateDrawer.scss";

export type CreateTemplateScope = TemplateScope;

type CreateTemplateForm =
  | ClientOverviewTemplateForm
  | OrganizationTemplateForm
  | GroupTemplateForm;

interface CreateTab {
  key: string;
  title: string;
  comingSoon?: boolean;
}

const SCOPE_CONFIG: Record<
  CreateTemplateScope,
  { title: string; typeLabel: string; tabs: CreateTab[] }
> = {
  "client-overview": {
    title: "Create Client Overview template",
    typeLabel: "Client Overview",
    tabs: [
      { key: "general-settings", title: "General settings" },
      { key: "billing", title: "Billing" },
      { key: "marketing", title: "Marketing" },
      { key: "eligibility", title: "Eligibility" },
    ],
  },
  organization: {
    title: "Create Organisation template",
    typeLabel: "Organisation",
    tabs: [
      { key: "general-settings", title: "General settings" },
      { key: "billing", title: "Billing", comingSoon: true },
      { key: "marketing", title: "Marketing", comingSoon: true },
      { key: "reporting", title: "Reporting", comingSoon: true },
      { key: "opportunities", title: "Opportunities", comingSoon: true },
      { key: "hierarchy", title: "Hierarchy", comingSoon: true },
      { key: "contact", title: "Contact", comingSoon: true },
    ],
  },
  group: {
    title: "Create Group template",
    typeLabel: "Group",
    tabs: [
      { key: "general-settings", title: "General settings" },
      { key: "billing", title: "Billing", comingSoon: true },
      { key: "marketing", title: "Marketing", comingSoon: true },
      { key: "reporting", title: "Reporting", comingSoon: true },
      {
        key: "eligibility-and-claims",
        title: "Eligibility and claims",
        comingSoon: true,
      },
      { key: "products", title: "Products", comingSoon: true },
      { key: "hierarchy", title: "Hierarchy", comingSoon: true },
      { key: "contacts", title: "Contacts", comingSoon: true },
    ],
  },
};

const buildNewForm = (scope: CreateTemplateScope): CreateTemplateForm => {
  if (scope === "organization") {
    return buildNewOrganizationTemplateForm();
  }
  if (scope === "group") {
    return buildNewGroupTemplateForm();
  }
  return buildNewClientOverviewTemplateForm();
};

const isFormComplete = (
  scope: CreateTemplateScope,
  form: CreateTemplateForm,
): boolean => {
  if (scope === "organization") {
    return isOrganizationTemplateFormComplete(form as OrganizationTemplateForm);
  }
  if (scope === "group") {
    return isGroupTemplateFormComplete(form as GroupTemplateForm);
  }
  return isNewClientOverviewTemplateFormComplete(
    form as ClientOverviewTemplateForm,
  );
};

interface DrawerState {
  scope: CreateTemplateScope;
  form: CreateTemplateForm;
  activeTab: string;
}

const buildState = (scope: CreateTemplateScope): DrawerState => ({
  scope,
  form: buildNewForm(scope),
  activeTab: SCOPE_CONFIG[scope].tabs[0].key,
});

interface CreateTemplateDrawerProps {
  show: boolean;
  scope: CreateTemplateScope;
  onHide: () => void;
  onSave: (scope: CreateTemplateScope, form: CreateTemplateForm) => void;
}

const CreateTemplateDrawer: React.FC<CreateTemplateDrawerProps> = ({
  show,
  scope,
  onHide,
  onSave,
}) => {
  const config = SCOPE_CONFIG[scope];
  const [state, setState] = useState<DrawerState>(() => buildState(scope));

  // The form has to switch with the scope in the same render, so a group form
  // is never handed to the organisation fields.
  const current = state.scope === scope ? state : buildState(scope);
  if (current !== state) {
    setState(current);
  }

  const { form, activeTab } = current;

  useEffect(() => {
    setState(buildState(scope));
  }, [show, scope]);

  const setActiveTab = (key: string) =>
    setState((previous) => ({ ...previous, activeTab: key }));

  const updateField = (field: string, value: string | boolean) => {
    setState((previous) => ({
      ...previous,
      form: { ...previous.form, [field]: value },
    }));
  };

  const canSave = isFormComplete(scope, form);

  const save = () => {
    if (canSave) {
      onSave(scope, {
        ...form,
        templateName: form.templateName.trim(),
      });
    }
  };

  const renderTab = (tab: CreateTab) => {
    if (tab.comingSoon) {
      return <FailSafePage cardType="comingSoon" />;
    }

    if (scope === "organization") {
      return (
        <OrganizationGeneralSettings
          form={form as OrganizationTemplateForm}
          onChange={(field: OrganizationTemplateField, value) =>
            updateField(field, value)
          }
        />
      );
    }

    if (scope === "group") {
      return (
        <GroupGeneralSettings
          form={form as GroupTemplateForm}
          onChange={(field: GroupTemplateField, value) =>
            updateField(field, value)
          }
        />
      );
    }

    const clientForm = form as ClientOverviewTemplateForm;
    const onChange = (
      field: ClientOverviewTemplateField,
      value: string | boolean,
    ) => updateField(field, value);

    if (tab.key === "billing") {
      return <ClientOverviewBilling form={clientForm} onChange={onChange} />;
    }
    if (tab.key === "marketing") {
      return <ClientOverviewMarketing form={clientForm} onChange={onChange} />;
    }
    if (tab.key === "eligibility") {
      return (
        <ClientOverviewEligibility form={clientForm} onChange={onChange} />
      );
    }
    return (
      <ClientOverviewGeneralSettings form={clientForm} onChange={onChange} />
    );
  };

  return (
    <SideModal show={show} onHide={onHide} title={config.title} type="lg">
      <div className="edit-template-drawer create-template-drawer">
        <div className="edit-template-drawer__content">
          <div className="create-template-fields">
            <div className="template-name-field">
              <CustomInput
                id={`create-${scope}-template-name`}
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
                id={`create-${scope}-template-type`}
                name="templateType"
                label="Template type"
                className="input-style readonly-field"
                readOnly
                value={config.typeLabel}
              />
            </div>
          </div>
          <Tabs
            activeKey={activeTab}
            onSelect={(key) => key && setActiveTab(key)}
            id={`create-${scope}-template-tabs`}
            className="edit-template-tabs"
          >
            {config.tabs.map((tab) => (
              <Tab eventKey={tab.key} title={tab.title} key={tab.key}>
                {renderTab(tab)}
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

export default CreateTemplateDrawer;
