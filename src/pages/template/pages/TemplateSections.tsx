import * as React from "react";
import { useState } from "react";
import { BsChevronDown, BsChevronRight } from "react-icons/bs";
import { DisplayRow } from "@ucc/common-ui";
import { EditSection, ReadOnlyField } from "./fields";
import type { FieldPair } from "./templateTypes";
import type { ProgramOverviewField } from "./programOverviewData";

export interface TemplateSection<T> {
  title: string;
  left: T[];
  right: T[];
}

interface TwoColumnFieldsProps<T> {
  left: T[];
  right: T[];
  renderField: (field: T, index: number) => React.ReactNode;
  className?: string;
}

/** Shared two-column layout used by editable and read-only template screens. */
export const TwoColumnFields = <T,>({
  left,
  right,
  renderField,
  className = "edit-fields",
}: TwoColumnFieldsProps<T>) => (
  <div className={`${className}-grid`}>
    {[left, right].map((column, columnIndex) => (
      <div className={`${className}-column`} key={columnIndex}>
        {column.map(renderField)}
      </div>
    ))}
  </div>
);

/** Client Overview view mode, using the same sections and grid as edit mode. */
export const ReadOnlyTemplateSections = ({
  sections,
}: {
  sections: TemplateSection<FieldPair>[];
}) => (
  <div className="template-readonly-form edit-form">
    {sections.map((section) => (
      <EditSection title={section.title} key={section.title}>
        <TwoColumnFields
          left={section.left}
          right={section.right}
          renderField={(field) => (
            <ReadOnlyField
              key={field.label}
              label={field.label}
              value={field.value}
            />
          )}
        />
      </EditSection>
    ))}
  </div>
);

/** Program Overview view mode, preserving today's grey accordion cards. */
export const ReadOnlyProgramSections = ({
  sections,
  className = "",
}: {
  sections: TemplateSection<ProgramOverviewField>[];
  className?: string;
}) => {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  return (
    <div className={`program-general-settings ${className}`.trim()}>
      {sections.map((section) => {
        const expanded = !collapsed[section.title];

        return (
          <section className="program-detail-section" key={section.title}>
            <button
              type="button"
              className="section-toggle"
              onClick={() =>
                setCollapsed((current) => ({
                  ...current,
                  [section.title]: !current[section.title],
                }))
              }
              aria-expanded={expanded}
            >
              {expanded ? (
                <BsChevronDown className="section-caret" aria-hidden />
              ) : (
                <BsChevronRight className="section-caret" aria-hidden />
              )}
              <h4 className="section-title">{section.title}</h4>
            </button>
            {expanded && (
              <TwoColumnFields
                className="program-billing"
                left={section.left}
                right={section.right}
                renderField={(field, index) => (
                  <div
                    className="section-field"
                    key={`${field.label}-${index}`}
                  >
                    <DisplayRow
                      label={field.label}
                      value={field.value}
                      format={field.format}
                      personMeta={field.personMeta}
                      lastChild
                    />
                  </div>
                )}
              />
            )}
          </section>
        );
      })}
    </div>
  );
};
