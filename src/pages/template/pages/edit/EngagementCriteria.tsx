import * as React from "react";
import { EditSection, SelectField, TextField } from "./fields";
import type {
  ProgramOverviewEditField,
  ProgramOverviewEditForm,
} from "./programOverviewForm";

interface EngagementCriteriaProps {
  form: ProgramOverviewEditForm;
  onChange: (field: ProgramOverviewEditField, value: string | boolean) => void;
}

const EngagementCriteria: React.FC<EngagementCriteriaProps> = ({
  form,
  onChange,
}) => (
  <div className="edit-form edit-program-engagement">
    <EditSection title="Program Engagement Criteria">
      <div className="edit-fields-grid">
        <div className="edit-fields-column">
          <TextField
            label="Time horizon for criteria below (days)"
            field="criteriaTimeHorizonDays"
            value={form.criteriaTimeHorizonDays}
            onChange={(value) => onChange("criteriaTimeHorizonDays", value)}
          />
          <SelectField
            label="Engagement Criteria Option"
            value={form.engagementCriteriaOption}
            options={["Default ESI", "Custom", "None"]}
            onChange={(value) => onChange("engagementCriteriaOption", value)}
          />
          <TextField
            label="Time in program threshold (days)"
            field="timeInProgramThresholdDays"
            value={form.timeInProgramThresholdDays}
            onChange={(value) =>
              onChange("timeInProgramThresholdDays", value)
            }
          />
          <TextField
            label="Unique weight-in days"
            field="uniqueWeightInDays"
            value={form.uniqueWeightInDays}
            onChange={(value) => onChange("uniqueWeightInDays", value)}
          />
        </div>
        <div className="edit-fields-column">
          <TextField
            label="Unique days any app or web engagement"
            field="uniqueEngagementDays"
            value={form.uniqueEngagementDays}
            onChange={(value) => onChange("uniqueEngagementDays", value)}
          />
          <TextField
            label="Unique days lesson taken or tool logged"
            field="uniqueLessonOrToolDays"
            value={form.uniqueLessonOrToolDays}
            onChange={(value) => onChange("uniqueLessonOrToolDays", value)}
          />
          <TextField
            label="GLP-1 Model"
            field="glp1Model"
            value={form.glp1Model}
            onChange={(value) => onChange("glp1Model", value)}
          />
          <TextField
            label="Coaching Sessions"
            field="coachingSessions"
            value={form.coachingSessions}
            onChange={(value) => onChange("coachingSessions", value)}
          />
        </div>
      </div>
    </EditSection>

    <EditSection title="(Legacy Fields)">
      <div className="edit-fields-grid">
        <div className="edit-fields-column">
          <SelectField
            label="Required coaching interactions"
            value={form.requiredCoachingInteractions}
            options={["None", "1", "2", "3", "4", "5"]}
            onChange={(value) =>
              onChange("requiredCoachingInteractions", value)
            }
          />
          <TextField
            label="Required coaching sessions"
            field="requiredCoachingSessions"
            value={form.requiredCoachingSessions}
            onChange={(value) => onChange("requiredCoachingSessions", value)}
          />
          <TextField
            label="Cumulative unique days with weigh-ins"
            field="cumulativeUniqueWeightInDays"
            value={form.cumulativeUniqueWeightInDays}
            onChange={(value) =>
              onChange("cumulativeUniqueWeightInDays", value)
            }
          />
        </div>
        <div className="edit-fields-column">
          <TextField
            label="Coaching interaction threshold (days)"
            field="coachingInteractionThresholdDays"
            value={form.coachingInteractionThresholdDays}
            onChange={(value) =>
              onChange("coachingInteractionThresholdDays", value)
            }
          />
          <TextField
            label="Unique weigh-in days (last 14)"
            field="uniqueWeightInDaysLast14"
            value={form.uniqueWeightInDaysLast14}
            onChange={(value) => onChange("uniqueWeightInDaysLast14", value)}
          />
          <TextField
            label="GLP-1 Model"
            field="legacyGlp1Model"
            value={form.legacyGlp1Model}
            onChange={(value) => onChange("legacyGlp1Model", value)}
          />
        </div>
      </div>
    </EditSection>
  </div>
);

export default EngagementCriteria;
