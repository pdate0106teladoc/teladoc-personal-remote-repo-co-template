import * as React from "react";
import { useMemo, useState } from "react";
import { BsChevronDown, BsChevronRight } from "react-icons/bs";
import { DisplayRow } from "@ucc/common-ui";
import {
  buildProgramOverviewFields,
  ProgramOverviewSummary,
} from "./programOverviewData";

interface ProgramOverviewGeneralSettingsProps {
  overview: ProgramOverviewSummary;
}

const ProgramOverviewGeneralSettings: React.FC<
  ProgramOverviewGeneralSettingsProps
> = ({ overview }) => {
  const [expanded, setExpanded] = useState(true);
  const fields = useMemo(() => buildProgramOverviewFields(overview), [overview]);

  return (
    <div className="program-general-settings">
      <section className="program-detail-section">
        <button
          type="button"
          className="section-toggle"
          onClick={() => setExpanded((previous) => !previous)}
          aria-expanded={expanded}
        >
          {expanded ? (
            <BsChevronDown className="section-caret" aria-hidden />
          ) : (
            <BsChevronRight className="section-caret" aria-hidden />
          )}
          <h4 className="section-title">Program Overview</h4>
        </button>
        {expanded && (
          <div className="section-fields">
            {fields.map((field) => (
              <div className="section-field" key={field.label}>
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
        )}
      </section>
    </div>
  );
};

export default ProgramOverviewGeneralSettings;
