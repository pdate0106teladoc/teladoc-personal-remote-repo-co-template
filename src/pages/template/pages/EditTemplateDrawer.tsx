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
import ProgramOverviewDetail from "./ProgramOverviewDetail";
import ProgramOverviews from "./ProgramOverviews";
import {
  buildClientOverviewTemplateForm,
  buildGroupTemplateForm,
  buildOrganizationTemplateForm,
  buildProgramOverviewEditForm,
  isClientOverviewTemplateFormComplete,
  isGroupTemplateFormComplete,
  isOrganizationTemplateFormComplete,
} from "./form";
import type {
  ClientOverviewTemplateField,
  ClientOverviewTemplateForm,
  GroupTemplateField,
  GroupTemplateForm,
  OrganizationTemplateField,
  OrganizationTemplateForm,
  ProgramOverviewEditField,
  ProgramOverviewEditForm,
} from "./form";
import { ALLIED_PROGRAM_OVERVIEWS, type ProgramOverviewSummary } from "./programOverviewData";
import type { TemplateScope, TemplateSummary } from "./templateTypes";
import "@/pages/template/style/EditClientOverviewTemplateDrawer.scss";

type EditTemplateForm =
  | ClientOverviewTemplateForm
  | OrganizationTemplateForm
  | GroupTemplateForm;

interface EditTab {
  key: string;
  title: string;
  comingSoon?: boolean;
}

const EDIT_CONFIG: Record<
  TemplateScope,
  { title: string; tabs: EditTab[] }
> = {
  "client-overview": {
    title: "Edit Client Overview template",
    tabs: [
      { key: "general-settings", title: "General settings" },
      { key: "billing", title: "Billing" },
      { key: "marketing", title: "Marketing" },
      { key: "eligibility", title: "Eligibility" },
      { key: "program-overviews", title: "Program Overviews" },
    ],
  },
  organization: {
    title: "Edit Organization template",
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
    title: "Edit Group template",
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

const buildForm = (
  scope: TemplateScope,
  name: string,
): EditTemplateForm => {
  if (scope === "organization") {
    return buildOrganizationTemplateForm(name);
  }
  if (scope === "group") {
    return buildGroupTemplateForm(name);
  }
  return buildClientOverviewTemplateForm(name);
};

const isFormComplete = (scope: TemplateScope, form: EditTemplateForm) => {
  if (scope === "organization") {
    return isOrganizationTemplateFormComplete(form as OrganizationTemplateForm);
  }
  if (scope === "group") {
    return isGroupTemplateFormComplete(form as GroupTemplateForm);
  }
  return isClientOverviewTemplateFormComplete(
    form as ClientOverviewTemplateForm,
  );
};

interface DrawerState {
  scope: TemplateScope;
  templateId: string;
  form: EditTemplateForm;
  activeTab: string;
  programOverviews: ProgramOverviewSummary[];
  selectedOverview: ProgramOverviewSummary | null;
  programForms: Record<string, ProgramOverviewEditForm>;
}

const buildState = (
  scope: TemplateScope,
  template: TemplateSummary | null,
): DrawerState => ({
  scope,
  templateId: template?.id ?? "",
  form: buildForm(scope, template?.name ?? ""),
  activeTab: EDIT_CONFIG[scope].tabs[0].key,
  programOverviews: ALLIED_PROGRAM_OVERVIEWS,
  selectedOverview: null,
  programForms: {},
});

interface EditTemplateDrawerProps {
  show: boolean;
  scope: TemplateScope;
  template: TemplateSummary | null;
  onHide: () => void;
  onSave: (
    scope: TemplateScope,
    template: TemplateSummary,
    form: EditTemplateForm,
  ) => void;
}

const EditTemplateDrawer: React.FC<EditTemplateDrawerProps> = ({
  show,
  scope,
  template,
  onHide,
  onSave,
}) => {
  const config = EDIT_CONFIG[scope];
  const [state, setState] = useState<DrawerState>(() =>
    buildState(scope, template),
  );

  const current =
    state.scope === scope && state.templateId === (template?.id ?? "")
      ? state
      : buildState(scope, template);
  if (current !== state) {
    setState(current);
  }

  const {
    form,
    activeTab,
    programOverviews,
    selectedOverview,
    programForms,
  } = current;

  useEffect(() => {
    setState(buildState(scope, template));
  }, [show, scope, template?.id, template?.name]);

  const updateField = (field: string, value: string | boolean) => {
    setState((previous) => ({
      ...previous,
      form: { ...previous.form, [field]: value },
    }));
  };

  const programForm = selectedOverview
    ? (programForms[selectedOverview.id] ??
      buildProgramOverviewEditForm(selectedOverview))
    : null;

  const updateProgramField = (
    field: ProgramOverviewEditField,
    value: string | boolean,
  ) => {
    if (!selectedOverview) {
      return;
    }
    setState((previous) => ({
      ...previous,
      programForms: {
        ...previous.programForms,
        [selectedOverview.id]: {
          ...(previous.programForms[selectedOverview.id] ??
            buildProgramOverviewEditForm(selectedOverview)),
          [field]: value,
        },
      },
    }));
  };

  const canSave = isFormComplete(scope, form);

  const save = () => {
    if (template && canSave) {
      onSave(scope, template, {
        ...form,
        templateName: form.templateName.trim(),
      });
    }
  };

  const renderTab = (tab: EditTab) => {
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
    if (tab.key === "program-overviews") {
      return (
        <ProgramOverviews
          overviews={programOverviews}
          editable
          onSelectProgramOverview={(overview) =>
            setState((previous) => ({
              ...previous,
              selectedOverview: overview,
            }))
          }
          onDeleteProgramOverview={(overview) =>
            setState((previous) => ({
              ...previous,
              programOverviews: previous.programOverviews.filter(
                (item) => item.id !== overview.id,
              ),
            }))
          }
        />
      );
    }
    return (
      <ClientOverviewGeneralSettings form={clientForm} onChange={onChange} />
    );
  };

  return (
    <SideModal
      show={show && Boolean(template)}
      onHide={onHide}
      title={config.title}
      type="lg"
    >
      {template && (
        <div className="edit-template-drawer">
          <div className="edit-template-drawer__content">
            {selectedOverview && programForm && scope === "client-overview" ? (
              <ProgramOverviewDetail
                overview={selectedOverview}
                form={programForm}
                onChange={updateProgramField}
                onBack={() =>
                  setState((previous) => ({
                    ...previous,
                    selectedOverview: null,
                  }))
                }
              />
            ) : (
              <>
                <h3 className="edit-template-name-heading">{template.name}</h3>
                <div className="template-name-field">
                  <CustomInput
                    id={`edit-${scope}-template-name`}
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
                  activeKey={activeTab}
                  onSelect={(key) =>
                    key &&
                    setState((previous) => ({ ...previous, activeTab: key }))
                  }
                  id={`edit-${scope}-tabs-${template.id}`}
                  className="edit-template-tabs"
                >
                  {config.tabs.map((tab) => (
                    <Tab eventKey={tab.key} title={tab.title} key={tab.key}>
                      {renderTab(tab)}
                    </Tab>
                  ))}
                </Tabs>
              </>
            )}
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

export default EditTemplateDrawer;
