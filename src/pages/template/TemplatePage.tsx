import * as React from "react";
import { useMemo, useState } from "react";
import { Dropdown, Tab, Tabs } from "react-bootstrap";
import { BsChevronDown, BsFileEarmark, BsFileEarmarkText } from "react-icons/bs";
import {
  Button,
  CalendarIcon,
  FailSafePage,
  GroupIcon,
  PencilIcon,
  SearchBar,
} from "@ucc/common-ui";
import { DarkPlusIcon } from "@/assets";
import { formatUTCtoDateOnly } from "@/utils";
import TemplateDetailModal from "@/components/Modal/TemplateDetailModal";
import type { TemplateSummary } from "@/components/template/view";
import "./TemplatePage.scss";

export type TemplateScope = "client-overview" | "organization" | "group";
export type { TemplateSummary };

interface TemplateTab {
  scope: TemplateScope;
  title: string;
  entityLabelPlural: string;
  showCounts: boolean;
}

interface TemplatePageProps {
  templates?: Record<TemplateScope, TemplateSummary[]>;
  editActions?: string[];
  onCreateTemplate?: (scope: TemplateScope) => void;
  onSelectTemplate?: (template: TemplateSummary, scope: TemplateScope) => void;
  onEditAction?: (
    action: string,
    template: TemplateSummary,
    scope: TemplateScope,
  ) => void;
}

const TEMPLATE_TABS: TemplateTab[] = [
  {
    scope: "client-overview",
    title: "Client Overview",
    entityLabelPlural: "Client Overviews",
    showCounts: true,
  },
  {
    scope: "organization",
    title: "Organization",
    entityLabelPlural: "Organizations",
    showCounts: false,
  },
  { scope: "group", title: "Group", entityLabelPlural: "Groups", showCounts: false },
];

const EDIT_ACTIONS = ["Edit template", "Duplicate template", "Delete template"];
const DUPLICATE_ACTION = "Duplicate template";
const COPY_NAME = /^(.*) \((\d+)\)$/;

const nextDuplicateName = (name: string, existing: TemplateSummary[]) => {
  const base = name.match(COPY_NAME)?.[1] ?? name;
  const copyOfBase = new RegExp(
    `^${base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} \\((\\d+)\\)$`,
  );
  const nextIndex =
    existing.reduce((highest, template) => {
      const match = template.name.match(copyOfBase);
      return match ? Math.max(highest, Number(match[1])) : highest;
    }, 0) + 1;
  return `${base} (${nextIndex})`;
};

const SAMPLE_TEMPLATES: Record<TemplateScope, TemplateSummary[]> = {
  "client-overview": [
    {
      id: "allied",
      name: "Allied Template",
      totalCount: 20,
      activeCount: 20,
      createdOn: "2025-03-05",
      lastUsedOn: "2025-12-01",
    },
    {
      id: "ecm",
      name: "ECM Template",
      totalCount: 15,
      activeCount: 10,
      createdOn: "2025-03-05",
      lastUsedOn: "2025-12-01",
    },
  ],
  organization: [
    {
      id: "bcbs-nc",
      name: "BCBS NC Template",
      createdOn: "2025-03-05",
      lastUsedOn: "2025-12-01",
    },
    {
      id: "bcbs-aso",
      name: "BCBS ASO Master Template",
      createdOn: "2025-03-05",
      lastUsedOn: "2025-12-01",
    },
  ],
  group: [
    {
      id: "bcbs-nc-group",
      name: "BCBS NC Template",
      createdOn: "2025-03-05",
      lastUsedOn: "2025-12-01",
    },
    {
      id: "bcbs-aso-group",
      name: "BCBS ASO Master Template",
      createdOn: "2025-03-05",
      lastUsedOn: "2025-12-01",
    },
  ],
};

const EMPTY_SEARCH: Record<TemplateScope, string> = {
  "client-overview": "",
  organization: "",
  group: "",
};

const TemplatePage: React.FC<TemplatePageProps> = ({
  templates = SAMPLE_TEMPLATES,
  editActions = EDIT_ACTIONS,
  onCreateTemplate,
  onSelectTemplate,
  onEditAction,
}) => {
  const [templatesByScope, setTemplatesByScope] =
    useState<Record<TemplateScope, TemplateSummary[]>>(templates);
  const [searchByScope, setSearchByScope] =
    useState<Record<TemplateScope, string>>(EMPTY_SEARCH);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateSummary | null>(
    null,
  );

  const visibleTemplates = useMemo(
    () =>
      TEMPLATE_TABS.reduce(
        (acc, { scope }) => {
          const query = (searchByScope[scope] || "").trim().toLowerCase();
          acc[scope] = (templatesByScope[scope] || []).filter((template) =>
            template.name.toLowerCase().includes(query),
          );
          return acc;
        },
        {} as Record<TemplateScope, TemplateSummary[]>,
      ),
    [templatesByScope, searchByScope],
  );

  const handleSearch = (scope: TemplateScope, value: string) =>
    setSearchByScope((prev) => ({ ...prev, [scope]: value }));

  const openTemplateDetail = (template: TemplateSummary, scope: TemplateScope) => {
    setSelectedTemplate(template);
    onSelectTemplate?.(template, scope);
  };

  const duplicateTemplate = (template: TemplateSummary, tab: TemplateTab) => {
    setTemplatesByScope((prev) => {
      const list = prev[tab.scope] || [];
      const index = list.findIndex((item) => item.id === template.id);
      const duplicate: TemplateSummary = {
        id: `${template.id}-copy-${Date.now()}`,
        name: nextDuplicateName(template.name, list),
        createdOn: new Date().toISOString(),
        lastUsedOn: "",
        ...(tab.showCounts ? { totalCount: 0, activeCount: 0 } : {}),
      };
      const next = [...list];
      next.splice(index < 0 ? list.length : index + 1, 0, duplicate);
      return { ...prev, [tab.scope]: next };
    });
  };

  const handleEditAction = (
    action: string,
    template: TemplateSummary,
    tab: TemplateTab,
  ) => {
    if (action === DUPLICATE_ACTION) {
      duplicateTemplate(template, tab);
    }
    onEditAction?.(action, template, tab.scope);
  };

  const renderCreateButton = (tab: TemplateTab) => (
    <Button
      variant="add"
      className="template-create-btn"
      onClick={() => onCreateTemplate?.(tab.scope)}
    >
      <DarkPlusIcon className="add-icon" aria-hidden />
      {`Create ${tab.title} template`}
    </Button>
  );

  const renderEmptyState = (tab: TemplateTab) => (
    <div className="template-empty">
      <span className="empty-icon" aria-hidden>
        <BsFileEarmark />
      </span>
      <p className="empty-title">{`No ${tab.title} template`}</p>
      <p className="empty-message">Once a template is created, it will appear here.</p>
      {renderCreateButton(tab)}
    </div>
  );

  const renderTemplateRow = (template: TemplateSummary, tab: TemplateTab) => (
    <div className="template-row" key={template.id}>
      <div className="template-row-details">
        <button
          type="button"
          className="template-name"
          onClick={() => openTemplateDetail(template, tab.scope)}
        >
          {template.name}
        </button>
        <div className="template-meta">
          {tab.showCounts && (
            <>
              <span className="meta-item">
                <GroupIcon className="meta-icon" aria-hidden />
                <span className="meta-label">{`Total ${tab.entityLabelPlural}`}</span>
                <span className="meta-count">{template.totalCount}</span>
              </span>
              <span className="meta-item">
                <GroupIcon className="meta-icon" aria-hidden />
                <span className="meta-label">{`Active ${tab.entityLabelPlural}`}</span>
                <span className="meta-count">{template.activeCount}</span>
              </span>
            </>
          )}
          <span className="meta-item">
            <CalendarIcon className="meta-icon" aria-hidden />
            <span className="meta-label">Created on</span>
            <span className="meta-value">
              {formatUTCtoDateOnly(template.createdOn)}
            </span>
          </span>
          <span className="meta-item">
            {tab.showCounts ? (
              <CalendarIcon className="meta-icon" aria-hidden />
            ) : (
              <BsFileEarmarkText className="meta-icon" aria-hidden />
            )}
            <span className="meta-label">Last used on</span>
            <span className="meta-value">
              {formatUTCtoDateOnly(template.lastUsedOn)}
            </span>
          </span>
        </div>
      </div>
      <Dropdown align="end" className="template-edit">
        <Dropdown.Toggle
          as="button"
          type="button"
          className="template-edit-toggle"
          aria-label={`Edit ${template.name}`}
        >
          <PencilIcon className="edit-icon" aria-hidden />
          Edit
          <BsChevronDown className="edit-caret" aria-hidden />
        </Dropdown.Toggle>
        <Dropdown.Menu className="template-edit-menu">
          {editActions.map((action) => (
            <Dropdown.Item
              key={action}
              onClick={() => handleEditAction(action, template, tab)}
            >
              {action}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );

  return (
    <div className="template-page">
      <div className="template-content">
        <h2 className="template-heading">Templates</h2>
        <Tabs
          defaultActiveKey={TEMPLATE_TABS[0].scope}
          id="template-tabs"
          className="template-tabs"
          mountOnEnter
          unmountOnExit
        >
          {TEMPLATE_TABS.map((tab) => (
            <Tab eventKey={tab.scope} title={tab.title} key={tab.scope}>
              {(templatesByScope[tab.scope] || []).length === 0 ? (
                renderEmptyState(tab)
              ) : (
                <>
                  <div className="template-toolbar">
                    <div className="search-bar">
                      <SearchBar
                        placeholder="Find template"
                        value={searchByScope[tab.scope]}
                        onChange={(e) => handleSearch(tab.scope, e.target.value)}
                        overlayRequired={false}
                        type="md"
                        closeIcon={false}
                        useLocalSearch={true}
                        customClass="template-search"
                      />
                    </div>
                    <div className="create-btn">{renderCreateButton(tab)}</div>
                  </div>
                  <div className="template-list">
                    {visibleTemplates[tab.scope].length === 0 ? (
                      <FailSafePage cardType="emptyState" />
                    ) : (
                      visibleTemplates[tab.scope].map((template) =>
                        renderTemplateRow(template, tab),
                      )
                    )}
                  </div>
                </>
              )}
            </Tab>
          ))}
        </Tabs>
        <TemplateDetailModal
          show={Boolean(selectedTemplate)}
          template={selectedTemplate}
          onHide={() => setSelectedTemplate(null)}
        />
      </div>
    </div>
  );
};

export default TemplatePage;
