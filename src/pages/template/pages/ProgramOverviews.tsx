import * as React from "react";
import { useState } from "react";
import { BsFileEarmark, BsLink45Deg } from "react-icons/bs";
import { Button, CalendarIcon } from "@ucc/common-ui";
import { DarkPlusIcon, DustbinIcon, RightArrow } from "@/assets";
import { formatUTCtoDateOnly } from "@/utils";
import {
  ALLIED_PROGRAM_OVERVIEWS,
  ProgramOverviewSummary,
} from "./programOverviewData";
import "@/pages/template/style/ProgramOverviews.scss";

interface ProgramOverviewsProps {
  overviews?: ProgramOverviewSummary[];
  /** Edit mode adds the panel's add action and a delete control per card. */
  editable?: boolean;
  onSelectProgramOverview?: (overview: ProgramOverviewSummary) => void;
  onAddProgramOverview?: () => void;
  onDeleteProgramOverview?: (overview: ProgramOverviewSummary) => void;
}

const ProgramOverviews: React.FC<ProgramOverviewsProps> = ({
  overviews,
  editable = false,
  onSelectProgramOverview,
  onAddProgramOverview,
  onDeleteProgramOverview,
}) => {
  const [ownList, setOwnList] = useState(
    overviews ?? ALLIED_PROGRAM_OVERVIEWS,
  );
  const controlled =
    overviews !== undefined && onDeleteProgramOverview !== undefined;
  const displayedOverviews = overviews ?? ownList;
  const isEmpty = displayedOverviews.length === 0;

  const deleteOverview = (overview: ProgramOverviewSummary) => {
    if (controlled) {
      onDeleteProgramOverview(overview);
      return;
    }
    setOwnList((current) =>
      current.filter((item) => item.id !== overview.id),
    );
    onDeleteProgramOverview?.(overview);
  };

  const addButton = (
    <Button
      variant="add"
      className="add-program-overview-btn"
      onClick={() => onAddProgramOverview?.()}
    >
      <DarkPlusIcon className="add-icon" aria-hidden />
      Add Program Overview
    </Button>
  );

  return (
    <div className="template-program-overviews">
      <section
        className={`program-overview-panel${isEmpty ? " program-overview-panel--empty" : ""}`}
      >
        {isEmpty ? (
          <div className="program-overview-empty">
            <span className="empty-icon" aria-hidden>
              <BsFileEarmark />
            </span>
            <p className="empty-title">No Program Overview</p>
            {addButton}
          </div>
        ) : (
          <>
            <div className="panel-header">
              <h3 className="panel-title">
                {`${displayedOverviews.length} Program Overview${displayedOverviews.length === 1 ? "" : "s"}`}
              </h3>
              {editable && addButton}
            </div>
            <ul className="program-overview-list">
              {displayedOverviews.map((overview) => (
                <li className="program-overview-card" key={overview.id}>
                  <div className="program-overview-card-main">
                    <button
                      type="button"
                      className="program-overview-link"
                      onClick={() => onSelectProgramOverview?.(overview)}
                    >
                      {overview.name}
                      <RightArrow className="program-overview-arrow" aria-hidden />
                    </button>
                    <div className="program-overview-meta">
                      <span className="meta-item">
                        <BsLink45Deg className="meta-icon" aria-hidden />
                        <span className="meta-label">Program</span>
                        <span className="meta-value">{overview.program}</span>
                      </span>
                      <span className="meta-item">
                        <CalendarIcon className="meta-icon" aria-hidden />
                        <span className="meta-label">Initial launch date</span>
                        <span className="meta-value">
                          {formatUTCtoDateOnly(overview.initialLaunchDate)}
                        </span>
                      </span>
                    </div>
                  </div>
                  {editable && (
                    <button
                      type="button"
                      className="program-overview-delete"
                      aria-label={`Delete ${overview.name}`}
                      onClick={() => deleteOverview(overview)}
                    >
                      <DustbinIcon aria-hidden />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
};

export default ProgramOverviews;
