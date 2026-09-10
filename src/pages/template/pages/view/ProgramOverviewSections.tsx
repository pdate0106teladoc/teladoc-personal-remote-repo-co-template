import * as React from "react";
import { useState } from "react";
import { BsChevronDown, BsChevronRight } from "react-icons/bs";
import { DisplayRow } from "@ucc/common-ui";
import type {
  ProgramOverviewField,
  ProgramOverviewFieldSection,
} from "./programOverviewData";

interface ProgramOverviewSectionsProps {
  sections: ProgramOverviewFieldSection[];
}

const renderColumn = (fields: ProgramOverviewField[]) => (
  <div className="program-billing-column">
    {fields.map((field, index) => (
      <div className="section-field" key={`${field.label}-${index}`}>
        <DisplayRow
          label={field.label}
          value={field.value}
          format={field.format}
          personMeta={field.personMeta}
          lastChild
        />
      </div>
    ))}
  </div>
);

const ProgramOverviewSections: React.FC<ProgramOverviewSectionsProps> = ({
  sections,
}) => {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  return (
    <div className="program-general-settings">
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
              <div className="program-billing-columns">
                {renderColumn(section.left)}
                {renderColumn(section.right)}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
};

export default ProgramOverviewSections;
