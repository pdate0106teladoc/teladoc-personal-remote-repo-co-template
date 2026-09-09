import * as React from "react";
import { BsFileEarmark, BsLink45Deg } from "react-icons/bs";
import { Button, CalendarIcon } from "@ucc/common-ui";
import { DarkPlusIcon, RightArrow } from "@/assets";
import { formatUTCtoDateOnly } from "@/utils";
import {
  ALLIED_PROGRAM_OVERVIEWS,
  ProgramOverviewSummary,
} from "./programOverviewData";
import "./ProgramOverviews.scss";

interface ProgramOverviewsProps {
  overviews?: ProgramOverviewSummary[];
  onSelectProgramOverview?: (overview: ProgramOverviewSummary) => void;
  onAddProgramOverview?: () => void;
}

const ProgramOverviews: React.FC<ProgramOverviewsProps> = ({
  overviews = ALLIED_PROGRAM_OVERVIEWS,
  onSelectProgramOverview,
  onAddProgramOverview,
}) => {
  const isEmpty = overviews.length === 0;

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
            <Button
              variant="add"
              className="add-program-overview-btn"
              onClick={() => onAddProgramOverview?.()}
            >
              <DarkPlusIcon className="add-icon" aria-hidden />
              Add Program Overview
            </Button>
          </div>
        ) : (
          <>
            <h3 className="panel-title">
              {`${overviews.length} Program Overview${overviews.length === 1 ? "" : "s"}`}
            </h3>
            <ul className="program-overview-list">
              {overviews.map((overview) => (
                <li className="program-overview-card" key={overview.id}>
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
