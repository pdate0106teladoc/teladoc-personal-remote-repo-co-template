import { useState, useMemo, useEffect } from "react";
import { Loader, WarningIcon, showCustomToast } from "@ucc/common-ui";
import "./TaskCreate.scss";
import { MultiSelectDropdown } from "@ucc/common-ui";
import { Button } from "@ucc/common-ui";
import { LABELS, MODAL_MSSG, ToastType } from "@/constants";
import { DatePicker } from "@ucc/common-ui";
import { DropdownWithIcon } from "@ucc/common-ui";
import { CustomInput } from "@ucc/common-ui";
import { CustomRadioToggle } from "@ucc/common-ui";
import { renderTooltip } from "@ucc/common-ui";
import { OverlayTrigger } from "react-bootstrap";
import api from "@/api/apiService";
import { ERROR_MESSAGES } from "@/constants";
import { useParams } from "react-router-dom";
import FileUpload from "../FileUpload/FileUpload";
import { EditConfigPayload, EditTypesResponse, Task } from "@/types/edit";
import { MultiSelectSearch } from "@ucc/common-ui";
import { InfoGreyIcon } from "@/assets";
import { InfoIcon } from "@ucc/common-ui";
import { isValidURL } from "@/utils";

export interface EditConfigResponse {
  taskId: string;
  workflowTaskId: string;
  entityType: string;
  entityId: string;
  status: string;
}

const dropdownOptionsIcon = [
  { label: "Normal", value: "NORMAL" },
  { label: "High", value: "HIGH" },
  { label: "Urgent", value: "URGENT" },
];

type ENTITY = "organization" | "group";

const EditConfig: React.FC<{
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onClose: (response?: EditConfigResponse) => void;
  entity: ENTITY;
  pendingChanges: Task[];
}> = ({ setOpen, onClose, entity, pendingChanges }) => {
  const searchUrl = import.meta.env.VITE_SEARCH_BASE_URL;
  const taskURL = import.meta.env.VITE_TASK_URL;
  const [dropdownPriority, setDropdownPriority] = useState("");
  const [typeOfEdit, setTypeOfEdit] = useState<string[]>([]);
  const [launchOption, setLaunchOption] = useState<"today" | "later" | "">("");
  const [dateValue, setDateValue] = useState<Date | null>(null);
  const [workfrontId, setWorkfrontId] = useState("");
  const [opportunity, setOpportunity] = useState<Record<string, string>>({});
  const [playbookLink, setPlaybookLink] = useState("");
  const [playbookLinkError, setPlaybookLinkError] = useState<boolean>(false);
  const [files, setFiles] = useState<string[]>([]);
  const [incomplete, setIncomplete] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [typeOfEditOptions, setTypeOfEditOptions] = useState<
    Record<string, boolean>
  >({});
  const [editTypeLabelToId, setEditTypeLabelToId] = useState<
    Record<string, string>
  >({});
  const { id } = useParams<{ id: string }>();

  const buildOpportunityParams = (searchTerm: string, _searchType: string) => ({
    searchTerm,
    entity: "opportunity",
    limit: "5",
    page: "0",
  });

  const opportunityApi = useMemo(
    () => ({
      get: async (url: string) => {
        const res: any = await api.get(url);
        const payload = res?.data ?? res;
        const opportunities = payload?.opportunities;
        if (Array.isArray(opportunities)) {
          payload.opportunities = opportunities.map((opp: any) => ({
            ...opp,
            id: opp.opportunityGuid,
            opportunityName: `${opp.opportunityName} - ${opp.opportunityGuid}`,
          }));
        }
        return res;
      },
    }),
    [],
  );

  function buildTodayUtcDate(): Date {
    const now = new Date();
    return new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        now.getUTCHours(),
        now.getUTCMinutes(),
        now.getUTCSeconds(),
        now.getUTCMilliseconds(),
      ),
    );
  }

  function buildPayload(): EditConfigPayload {
    const launchDate =
      launchOption === "today" ? buildTodayUtcDate() : dateValue;
    return {
      priority: dropdownPriority,
      typeOfEdit: typeOfEdit.map((label) => editTypeLabelToId[label] ?? label),
      plannedLaunchDate: launchDate ? launchDate.toISOString() : "",
      workfrontId: workfrontId.trim(),
      opportunity: Object.keys(opportunity),
      playbookLink: playbookLink.trim(),
      files: [...files],
    };
  }

  const launchDateMissing =
    launchOption === "" || (launchOption === "later" && !dateValue);

  async function handleContinue() {
    if (!dropdownPriority || launchDateMissing) {
      setIncomplete(true);
      return;
    }
    // Validate playbook URL if it has content
    if (playbookLink.trim() && !isValidURL(playbookLink)) {
      setPlaybookLinkError(true);
      return;
    }
    const payload = buildPayload();
    setSubmitting(true);
    try {
      const editBaseUrl = import.meta.env.VITE_EDIT_URL ?? "";
      const entityPath = entity === "organization" ? "organizations" : "groups";
      const response: EditConfigResponse = await api.post(
        `${editBaseUrl}client-configurations/${entityPath}/${id}/edits`,
        payload,
      );
      showCustomToast({
        type: ToastType.Success,
        title: "Success",
        message: "Edit configuration saved.",
      });
      onClose(response);
    } catch {
      showCustomToast({
        type: ToastType.Error,
        title: "Failed",
        message: ERROR_MESSAGES.SOMETHINGS_WRONG,
      });
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    const fetchEditTypes = async () => {
      const entityType = entity === "organization" ? "ORGANIZATION" : "GROUP";
      try {
        const data = await api.get<EditTypesResponse>(
          `${taskURL}client-configurations/${entityType}/edit-types`,
        );
        const sorted = [...data.editTypes]
          .filter((t) => t.active)
          .sort((a, b) => a.displayOrder - b.displayOrder);
        const options = sorted.reduce<Record<string, boolean>>((acc, t) => {
          acc[t.label] = false;
          return acc;
        }, {});
        const labelToId = sorted.reduce<Record<string, string>>((acc, t) => {
          acc[t.label] = t.id;
          return acc;
        }, {});
        setTypeOfEditOptions(options);
        setEditTypeLabelToId(labelToId);
      } catch {
        showCustomToast({
          type: ToastType.Error,
          title: "Failed",
          message: ERROR_MESSAGES.SOMETHINGS_WRONG,
        });
      }
    };
    fetchEditTypes();
  }, [entity, taskURL]);

  const updatedByNames = useMemo(() => {
    return [
      ...new Set(
        pendingChanges.map((change) => change.updatedBy).filter((name) => name),
      ),
    ].join(", ");
  }, [pendingChanges]);
  if (submitting) return <Loader text="Submitting..." />;
  return (
    <div className="edit-right-modal-basics d-flex flex-column">
      <div className="d-flex flex-column gap-3">
        <div className="info-box d-flex flex-row gap-2">
          <InfoGreyIcon className="info-grey-icon" />
          <div className="d-flex flex-column">
            <span className="bold-text">{MODAL_MSSG.ENTER_EDIT_MODE}</span>
            <span className="regular-text">
              {MODAL_MSSG.PLEASE_SET_PRIORITY_AND_CHOOSE_LAUNCH_DATE}
            </span>
          </div>
        </div>
        {pendingChanges.length > 0 && (
          <div className="warning-box d-flex flex-row gap-2">
            <div className="p-1">
              <WarningIcon />
            </div>
            <div className="d-flex flex-column">
              <span className="bold-text">
                {entity === "organization"
                  ? MODAL_MSSG.ORG_BEING_EDITED
                  : MODAL_MSSG.GRP_BEING_EDITED}
              </span>
              <span className="regular-text">
                It is being edited by {updatedByNames}
                <br />
                {MODAL_MSSG.OVERLAPPING_CHANGES_WARNING}
              </span>
            </div>
          </div>
        )}
        <div className="d-flex align-items-center info-text">
          <span className="required">* </span>
          <span className="required-label">indicates a required field</span>
        </div>
      </div>
      <DropdownWithIcon
        value={dropdownPriority}
        label="Priority"
        dropdownOptions={dropdownOptionsIcon}
        customClass="input-w-190"
        onChange={(value) => setDropdownPriority(value)}
        onError={incomplete && !dropdownPriority}
        isRequired
      />
      <MultiSelectDropdown
        label="Type of edit"
        options={typeOfEditOptions}
        placeholder=""
        onChange={(selectedKeys) => setTypeOfEdit(selectedKeys)}
        customClass="multi-drop"
        enforceLimit
      />
      <div className="launch-option-section d-flex flex-column gap-2">
        <label className="launch-option-label">
          When should this go to production?
          <span className="required"> *</span>
        </label>
        <CustomRadioToggle
          name="launch-option"
          value={launchOption}
          onChange={(value) => setLaunchOption(value as "today" | "later" | "")}
          options={[
            {
              label: (
                <span className="launch-option-text">
                  <strong>Today</strong> - send it to production immediately
                </span>
              ) as unknown as string,
              value: "today",
            },
            {
              label: (
                <span className="launch-option-text">
                  <strong>Schedule for later</strong> - select a future date to
                  go to production
                  <OverlayTrigger
                    placement="top"
                    overlay={renderTooltip(
                      LABELS.editConfig.SCHEDULE_FOR_LATER_TOOLTIP,
                      "schedule-for-later",
                    )}
                  >
                    <span className="info-icon ms-2 text-center">
                      <InfoIcon />
                    </span>
                  </OverlayTrigger>
                </span>
              ) as unknown as string,
              value: "later",
            },
          ]}
        />
        {launchOption === "later" && (
          <DatePicker
            value={dateValue}
            disablePastAndTodayDates={true}
            onChange={(date) => setDateValue(date)}
            label=""
            placeholder=" "
            isRequired
            customClass="input-w-190 date-picker-later"
            tooltipContent={LABELS.editConfig.PLANNED_LAUNCH_DATE_TOOLTIP}
            onError={incomplete && !dateValue}
            exactUtcTime={true}
          />
        )}
      </div>
      <CustomInput
        label="Workfront link (if any)"
        value={workfrontId}
        onChange={(e) => setWorkfrontId(e.target.value)}
        placeholder=" "
        className="input-style"
      />
      <MultiSelectSearch
        label="Opportunity (if required)"
        preSelected={opportunity}
        onChange={(selected) => setOpportunity(selected)}
        api={opportunityApi}
        apiUrl={`${searchUrl}client-configurations/search`}
        buildSearchParams={buildOpportunityParams}
        maxResults={5}
        responseDataPath="opportunities"
        responseNameField="opportunityName"
      />
      <div>
        <CustomInput
          label="Playbook link (if applicable)"
          value={playbookLink}
          onChange={(e) => {
            setPlaybookLink(e.target.value);
            setPlaybookLinkError(false);
          }}
          placeholder=" "
          className="input-style"
        />
        {playbookLinkError && (
          <span className="error-message">Please enter a valid URL</span>
        )}
      </div>
      <FileUpload onUpload={(filenames) => setFiles(filenames)} />
      <div className="footer">
        <Button
          variant="secondary"
          onClick={() => setOpen(false)}
          disabled={submitting}
        >
          {LABELS.editConfig.CANCEL}
        </Button>
        <Button
          variant="primary"
          onClick={handleContinue}
          disabled={submitting || launchDateMissing || !dropdownPriority}
        >
          {submitting ? "Starting…" : LABELS.editConfig.START_EDITING}
        </Button>
      </div>
    </div>
  );
};

export default EditConfig;
