import * as React from "react";
import { useMemo, useState } from "react";
import { BsChevronDown, BsChevronRight } from "react-icons/bs";
import { DisplayRow } from "@ucc/common-ui";
import { buildProgramOverviewBillingSections } from "./programOverviewData";
import type { ProgramOverviewField } from "./programOverviewData";

const renderColumn = (column: ProgramOverviewField[]) => (
  <div className="program-billing-column">
    {column.map((field, index) => (
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

const ProgramOverviewBilling = () => {
  const sections = useMemo(buildProgramOverviewBillingSections, []);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggle = (title: string) =>
    setCollapsed((current) => ({ ...current, [title]: !current[title] }));

  return (
    <div className="program-general-settings program-billing-view">
      {sections.map((section) => {
        const expanded = !collapsed[section.title];

        return (
          <section className="program-detail-section" key={section.title}>
            <button
              type="button"
              className="section-toggle"
              onClick={() => toggle(section.title)}
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

export default ProgramOverviewBilling;
