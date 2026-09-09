import * as React from "react";
import { useState } from "react";
import {
  ALLIED_PROGRAM_OVERVIEWS,
  ProgramOverviews as ProgramOverviewList,
} from "@/components/template/view";
import type { ProgramOverviewSummary } from "@/components/template/view";

interface ProgramOverviewsProps {
  overviews?: ProgramOverviewSummary[];
  onAddProgramOverview?: () => void;
  onSelectProgramOverview?: (overview: ProgramOverviewSummary) => void;
  /** Supplied when the drawer owns the list so deletes survive a drill-down. */
  onDeleteProgramOverview?: (overview: ProgramOverviewSummary) => void;
}

/** Same list as the view tab, plus the add and delete controls of edit mode. */
const ProgramOverviews: React.FC<ProgramOverviewsProps> = ({
  overviews,
  onAddProgramOverview,
  onSelectProgramOverview,
  onDeleteProgramOverview,
}) => {
  const [ownList, setOwnList] = useState(
    overviews ?? ALLIED_PROGRAM_OVERVIEWS,
  );
  const controlled = overviews !== undefined && onDeleteProgramOverview !== undefined;

  return (
    <ProgramOverviewList
      overviews={controlled ? overviews : ownList}
      editable
      onAddProgramOverview={onAddProgramOverview}
      onSelectProgramOverview={onSelectProgramOverview}
      onDeleteProgramOverview={
        controlled
          ? onDeleteProgramOverview
          : (overview) =>
              setOwnList((current) =>
                current.filter((item) => item.id !== overview.id),
              )
      }
    />
  );
};

export default ProgramOverviews;
