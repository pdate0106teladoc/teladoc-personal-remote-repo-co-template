import * as React from "react";
import { useEffect, useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { Button, CustomInput, SideModal } from "@ucc/common-ui";
import {
  Billing,
  buildClientOverviewTemplateForm,
  buildProgramOverviewEditForm,
  Eligibility,
  GeneralSettings,
  isClientOverviewTemplateFormComplete,
  Marketing,
  ProgramOverviewDetail,
  ProgramOverviews,
} from "@/components/template/edit";
import type {
  ClientOverviewTemplateField,
  ClientOverviewTemplateForm,
  ProgramOverviewEditField,
  ProgramOverviewEditForm,
} from "@/components/template/edit";
import { ALLIED_PROGRAM_OVERVIEWS } from "@/components/template/view";
import type {
  ProgramOverviewSummary,
  TemplateSummary,
} from "@/components/template/view";
import "./EditClientOverviewTemplateDrawer.scss";

interface EditTabContext {
  form: ClientOverviewTemplateForm;
  onChange: (
    field: ClientOverviewTemplateField,
    value: string | boolean,
  ) => void;
  programOverviews: ProgramOverviewSummary[];
  onSelectProgramOverview: (overview: ProgramOverviewSummary) => void;
  onDeleteProgramOverview: (overview: ProgramOverviewSummary) => void;
}

interface EditTab {
  key: string;
  title: string;
  render: (context: EditTabContext) => React.ReactNode;
}

const EDIT_TABS: EditTab[] = [
  {
    key: "general-settings",
    title: "General settings",
    render: ({ form, onChange }) => (
      <GeneralSettings form={form} onChange={onChange} />
    ),
  },
  { key: "billing", title: "Billing", render: () => <Billing /> },
  { key: "marketing", title: "Marketing", render: () => <Marketing /> },
  { key: "eligibility", title: "Eligibility", render: () => <Eligibility /> },
  {
    key: "program-overviews",
    title: "Program Overviews",
    render: ({
      programOverviews,
      onSelectProgramOverview,
      onDeleteProgramOverview,
    }) => (
      <ProgramOverviews
        overviews={programOverviews}
        onSelectProgramOverview={onSelectProgramOverview}
        onDeleteProgramOverview={onDeleteProgramOverview}
      />
    ),
  },
];

interface EditClientOverviewTemplateDrawerProps {
  show: boolean;
  template: TemplateSummary | null;
  onHide: () => void;
  onSave: (
    template: TemplateSummary,
    form: ClientOverviewTemplateForm,
  ) => void;
}

const EditClientOverviewTemplateDrawer: React.FC<
  EditClientOverviewTemplateDrawerProps
> = ({ show, template, onHide, onSave }) => {
  const [form, setForm] = useState<ClientOverviewTemplateForm>(() =>
    buildClientOverviewTemplateForm(template?.name ?? ""),
  );
  const [programOverviews, setProgramOverviews] = useState(
    ALLIED_PROGRAM_OVERVIEWS,
  );
  const [selectedOverview, setSelectedOverview] =
    useState<ProgramOverviewSummary | null>(null);
  // Keyed by overview so edits survive going back to the list and in again.
  const [programForms, setProgramForms] = useState<
    Record<string, ProgramOverviewEditForm>
  >({});

  useEffect(() => {
    setForm(buildClientOverviewTemplateForm(template?.name ?? ""));
    setProgramOverviews(ALLIED_PROGRAM_OVERVIEWS);
    setSelectedOverview(null);
    setProgramForms({});
  }, [show, template?.id, template?.name]);

  const updateField = (
    field: ClientOverviewTemplateField,
    value: string | boolean,
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
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
    setProgramForms((current) => ({
      ...current,
      [selectedOverview.id]: {
        ...(current[selectedOverview.id] ??
          buildProgramOverviewEditForm(selectedOverview)),
        [field]: value,
      },
    }));
  };

  const canSave = isClientOverviewTemplateFormComplete(form);

  const save = () => {
    if (template && canSave) {
      onSave(template, { ...form, templateName: form.templateName.trim() });
    }
  };

  return (
    <SideModal
      show={show && Boolean(template)}
      onHide={onHide}
      title="Edit Client Overview template"
      type="lg"
    >
      {template && (
        <div className="edit-template-drawer">
          <div className="edit-template-drawer__content">
            {selectedOverview && programForm ? (
              <ProgramOverviewDetail
                overview={selectedOverview}
                form={programForm}
                onChange={updateProgramField}
                onBack={() => setSelectedOverview(null)}
              />
            ) : (
              <>
                <h3 className="edit-template-name-heading">{template.name}</h3>
                <div className="template-name-field">
                  <CustomInput
                    id="edit-template-name"
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
                  id={`edit-template-tabs-${template.id}`}
                  className="edit-template-tabs"
                >
                  {EDIT_TABS.map((tab) => (
                    <Tab eventKey={tab.key} title={tab.title} key={tab.key}>
                      {tab.render({
                        form,
                        onChange: updateField,
                        programOverviews,
                        onSelectProgramOverview: setSelectedOverview,
                        onDeleteProgramOverview: (overview) =>
                          setProgramOverviews((current) =>
                            current.filter((item) => item.id !== overview.id),
                          ),
                      })}
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

export default EditClientOverviewTemplateDrawer;
