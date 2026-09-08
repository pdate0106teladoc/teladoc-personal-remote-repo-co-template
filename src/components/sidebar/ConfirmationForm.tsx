import React from "react";
import "./SubmitUpdateForm.scss";
import { CustomCheckbox, CustomTable, Loader, TableColumn } from "@ucc/common-ui";
import { formatUTCtoDateOnly } from "@/utils";
import { MODAL_MSSG } from "@/constants";
import { TaskResponse } from "@/types/edit";
import ExpandCollapse from "../ExpandCollapse/ExpandCollapse";
import RoundedLabel from "@/components/RoundedLabel/RoundedLabel";
import {
  ChangedFieldRow,
  ChangeResponse,
  transformChangesToSections,
} from "@/data/fieldLabelRegistry";

export type ConfirmationFormProps = {
  confirmed: boolean;
  onConfirmedChange: (checked: boolean) => void;
  taskDetails?: TaskResponse;
  diffData?: ChangeResponse;
  loading?: boolean;
};

const CHANGED_FIELDS_COLUMNS: TableColumn<ChangedFieldRow>[] = [
  { label: "", field: "field" },
  { label: "Previous value", field: "previousValue" },
  { label: "Updated value", field: "updatedValue" },
];

const ConfirmationForm: React.FC<ConfirmationFormProps> = ({
  confirmed,
  onConfirmedChange,
  taskDetails,
  diffData,
  loading = false,
}) => {
  const { sections, arrayChangeSections } = transformChangesToSections(diffData);

  return (
    <div className="basic-form-content d-flex flex-column">
      <div className="Additional-details-table">
        {loading ? (
          <Loader text="Loading..." />
        ) : sections.length === 0 && arrayChangeSections.length === 0 ? (
          <div className="changed-fields-empty">No changes to display.</div>
        ) : (
          <div className="changed-fields-wrapper">
            {sections.map(({ title, rows }) => (
              <ExpandCollapse
                key={title}
                title={title}
                defaultExpanded={false}
                data={rows}
                columns={CHANGED_FIELDS_COLUMNS}
                contentClassName="changed-fields-table"
              />
            ))}
            {arrayChangeSections.map(({ tabLabel, items }) => (
              <div key={tabLabel} className="array-change-section">
                {items.map((item) => (
                  <div key={item.id} className="array-change-item">
                    <div className="array-change-item-header">
                      <RoundedLabel text={tabLabel} variant="grey" />
                      <span className="array-change-item-id">{item.id}</span>
                    </div>
                    <CustomTable
                      data={item.rows}
                      columns={CHANGED_FIELDS_COLUMNS}
                      showPagination={false}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <span className="label">{MODAL_MSSG.CONFIRM_SUBMIT}</span>
        <div className="d-flex flex-row align-items-center m-3">
          <CustomCheckbox
            checked={confirmed}
            onChange={onConfirmedChange}
            size="lg"
          />
          <label className="ms-2 check-label" htmlFor="custom-checkbox">
            {`${MODAL_MSSG.CONFIRM_UPDATE}${formatUTCtoDateOnly(taskDetails?.plannedLaunchDate)}`}
            <span className="required">&nbsp;*</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationForm;
