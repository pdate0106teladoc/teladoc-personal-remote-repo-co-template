import { CustomInput, showCustomToast } from "@ucc/common-ui";
import { MultiSelectDropdown, MultiSelectSearch } from "@ucc/common-ui";
import { useEffect, useMemo, useRef, useState } from "react";
import { SuccessIcon } from "@/assets";
import "./SubmitUpdateForm.scss";
import { DropdownWithIcon } from "@ucc/common-ui";
import { DatePicker } from "@ucc/common-ui";
import { Button } from "@ucc/common-ui";
import { CustomRadioToggle } from "@ucc/common-ui";
import { ERROR_MESSAGES, MODAL_MSSG, ToastType } from "@/constants";
import api from "@/api/apiService";
import { fileLinkItemsToEncodedStrings, isDateInPast, isValidURL, parseFileLinkEntry } from "@/utils";
import { useLocation, useParams } from "react-router-dom";
import { ApiReturnedFile, EditTypesResponse, Opportunity, TaskResponse } from "@/types/edit";
import FileUpload from "../FileUpload/FileUpload";

function normalizePriorityForDropdown(priority: string | undefined): string {
  if (!priority) return "";
  const p = priority.toLowerCase();
  if (p === "normal") return "NORMAL";
  if (p === "high") return "HIGH";
  if (p === "urgent") return "URGENT";
  return priority;
}

function formatOpportunityLabel(opp: Opportunity): string {
  return `${opp.opportunityName} - ${opp.opportunityGuid}`;
}

function opportunityRecordFromApi(
  opportunityArr: Opportunity[],
): Record<string, string> {
  return Object.fromEntries(
    opportunityArr.map((opp) => [
      opp.opportunityGuid,
      formatOpportunityLabel(opp),
    ]),
  );
}

const SubmitSettingForm: React.FC<{
  onContinue?: () => void;
  onTaskDetailsChange?: (details: TaskResponse | undefined) => void;
}> = ({ onContinue, onTaskDetailsChange }) => {
  const taskUrl = import.meta.env.VITE_TASK_URL;
  const searchUrl = import.meta.env.VITE_SEARCH_BASE_URL;
  const { candidateId } = useParams<{ candidateId?: string }>();
  const location = useLocation();
  const entityType = location.pathname.includes("/groups/")
    ? "GROUP"
    : "ORGANIZATION";
  const [tasksDetails, setTasksDetails] = useState<TaskResponse | undefined>();
  const initialValuesRef = useRef<{
    priority: string;
    plannedLaunchDate: string;
    workfrontId: string;
    opportunity: string[];
    playbookURL: string;
    files: string[];
    typeOfEdit: string[];
  } | null>(null);
  const dropdownOptionsIcon = [
    { label: "Normal", value: "NORMAL"},
    { label: "High", value: "HIGH"},
    { label: "Urgent", value: "URGENT"},
  ];
  const [dropdownPriority, setDropdownPriority] = useState("");
  const [launchOption, setLaunchOption] = useState<"today" | "later" | "">("");
  const [plannedLaunchDate, setPlannedLaunchDate] = useState<string>("");
  const [workfrontId, setWorkfrontId] = useState("");
  const [opportunity, setOpportunity] = useState<Record<string, string>>({});
  const [playbookLink, setPlaybookLink] = useState("");
  const [playbookLinkError, setPlaybookLinkError] = useState<boolean>(false);
  const [fileLinks, setFileLinks] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [typeOfEdit, setTypeOfEdit] = useState<string[]>([]);
  const [typeOfEditOptions, setTypeOfEditOptions] = useState<
    Record<string, boolean>
  >({});
  const [editTypeLabelToId, setEditTypeLabelToId] = useState<
    Record<string, string>
  >({});

  const buildOpportunityParams = (searchTerm: string, _searchType: string) => ({
    searchTerm,
    entity: "opportunity",
    limit: "25",
    contactLimit: "5",
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
            opportunityName: formatOpportunityLabel(opp),
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

  function isSameUtcDayAsToday(isoDate: string): boolean {
    if (!isoDate) return false;
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return false;
    const now = new Date();
    return (
      d.getUTCFullYear() === now.getUTCFullYear() &&
      d.getUTCMonth() === now.getUTCMonth() &&
      d.getUTCDate() === now.getUTCDate()
    );
  }

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        const response: TaskResponse = await api.get(
          `${taskUrl}client-configurations/tasks/${candidateId}`,
        );
        setTasksDetails(response);
      } catch {
        showCustomToast({
          type: ToastType.Error,
          title: "Failed",
          message: "Failed to fetch task details. Please try again.",
        });
      }
    };
    if (candidateId) fetchTaskDetails();
  }, [candidateId, taskUrl]);

  useEffect(() => {
    const fetchEditTypes = async () => {
      try {
        const data = await api.get<EditTypesResponse>(
          `${taskUrl}client-configurations/${entityType}/edit-types`,
        );
        const sorted = [...data.editTypes]
          .filter((t) => t.active)
          .sort((a, b) => a.displayOrder - b.displayOrder);
        const labelToId = sorted.reduce<Record<string, string>>((acc, t) => {
          acc[t.label] = t.id;
          return acc;
        }, {});
        setEditTypeLabelToId(labelToId);
        const selectedLabels = new Set(tasksDetails?.typeOfEdit ?? []);
        const options = sorted.reduce<Record<string, boolean>>((acc, t) => {
          acc[t.label] = selectedLabels.has(t.label);
          return acc;
        }, {});
        setTypeOfEditOptions(options);
        const selectedTypeOfEdit = sorted
          .map((t) => t.label)
          .filter((l) => selectedLabels.has(l));
        setTypeOfEdit(selectedTypeOfEdit);
        if (initialValuesRef.current) {
          initialValuesRef.current.typeOfEdit = [...selectedTypeOfEdit];
        }
      } catch {
        showCustomToast({
          type: ToastType.Error,
          title: "Failed",
          message: ERROR_MESSAGES.SOMETHINGS_WRONG,
        });
      }
    };
    if (tasksDetails) fetchEditTypes();
  }, [entityType, taskUrl, tasksDetails]);

  useEffect(() => {
    onTaskDetailsChange?.(tasksDetails);
  }, [tasksDetails, onTaskDetailsChange]);

  useEffect(() => {
    if (!tasksDetails) return;
    const priority = normalizePriorityForDropdown(tasksDetails.priority);
    const plannedLaunchDateStr = tasksDetails.plannedLaunchDate ?? "";
    setDropdownPriority(priority);
    setPlannedLaunchDate(plannedLaunchDateStr);
    if (plannedLaunchDateStr) {
      setLaunchOption(isSameUtcDayAsToday(plannedLaunchDateStr) ? "today" : "later");
    } else {
      setLaunchOption("");
    }
    setWorkfrontId(tasksDetails.workfrontId ?? "");
    const opportunityArr = tasksDetails.opportunity ?? [];
    const opportunityRecord = opportunityRecordFromApi(opportunityArr);
    setOpportunity(opportunityRecord);
    setPlaybookLink(tasksDetails.playbookURL ?? "");
    const links = fileLinkItemsToEncodedStrings(tasksDetails.fileLink);
    setFileLinks(links);
    initialValuesRef.current = {
      priority,
      plannedLaunchDate: plannedLaunchDateStr,
      workfrontId: tasksDetails.workfrontId ?? "",
      opportunity: Object.values(opportunityRecord).map((v) => v.trim()),
      playbookURL: tasksDetails.playbookURL ?? "",
      files: links,
      typeOfEdit: tasksDetails.typeOfEdit ?? [],
    };
  }, [tasksDetails]);

  const buildUpdatePayload = (): Record<string, unknown> => {
    const initial = initialValuesRef.current;
    const payload: Record<string, unknown> = {
      priority: dropdownPriority,
      plannedLaunchDate,
    };

    if (initial) {
      if (workfrontId !== initial.workfrontId)
        payload.workfrontId = workfrontId;
      const currentOpportunity = Object.values(opportunity).map((v) => v.trim());
      if (
        JSON.stringify(currentOpportunity) !==
        JSON.stringify(initial.opportunity)
      )
        payload.opportunity = Object.keys(opportunity);
      if (playbookLink !== initial.playbookURL)
        payload.playbookLink = playbookLink;
      const filesChanged =
        fileLinks.length !== initial.files.length ||
        fileLinks.some((f, i) => f !== initial.files[i]);
      if (filesChanged) payload.files = fileLinks;
      if (JSON.stringify(typeOfEdit) !== JSON.stringify(initial.typeOfEdit)) {
        payload.typeOfEdit = typeOfEdit.map(
          (label) => editTypeLabelToId[label] ?? label,
        );
      }
    }

    return payload;
  };

  const handleUpdateTask = async () => {
    if (!candidateId) return;
    if (!dropdownPriority.trim() || !plannedLaunchDate.trim()) {
      showCustomToast({
        type: ToastType.Error,
        title: "Validation",
        message: "Priority and Planned launch date are required.",
      });
      return;
    }
    if (playbookLink.trim() && !isValidURL(playbookLink)) {
      setPlaybookLinkError(true);
      return;
    }
    setIsUpdating(true);
    try {
      const payload = buildUpdatePayload();
      const response: TaskResponse = await api.patch(
        `${taskUrl}client-configurations/tasks/${candidateId}`,
        payload,
      );
      showCustomToast({
        type: ToastType.Success,
        title: "Success",
        message: "Task updated successfully.",
      });
      setTasksDetails(response);
      const responseFileList =
        response.fileLink !== undefined && response.fileLink !== null
          ? fileLinkItemsToEncodedStrings(response.fileLink)
          : fileLinks;
      setFileLinks(responseFileList);
      initialValuesRef.current = {
        priority: dropdownPriority,
        plannedLaunchDate,
        workfrontId,
        opportunity: Object.values(opportunity).map((v) => v.trim()),
        playbookURL: playbookLink,
        files: responseFileList,
        typeOfEdit: [...typeOfEdit],
      };
    } catch {
      showCustomToast({
        type: ToastType.Error,
        title: "Failed",
        message: "Failed to update task. Please try again.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const hasChanges = (() => {
    const initial = initialValuesRef.current;
    if (!initial) return false;
    if (
      dropdownPriority !== initial.priority ||
      plannedLaunchDate !== initial.plannedLaunchDate
    )
      return true;
    const currentOpportunity = Object.values(opportunity).map((v) => v.trim());
    if (
      workfrontId !== initial.workfrontId ||
      JSON.stringify(currentOpportunity) !== JSON.stringify(initial.opportunity) ||
      playbookLink !== initial.playbookURL
    )
      return true;
    if (
      fileLinks.length !== initial.files.length ||
      fileLinks.some((f, i) => f !== initial.files[i])
    )
      return true;
    if (JSON.stringify(typeOfEdit) !== JSON.stringify(initial.typeOfEdit))
      return true;
    return false;
  })();

  const files: ApiReturnedFile[] = useMemo(
    () =>
      fileLinks.map((entry) => {
        const { storageName, sizeBytes } = parseFileLinkEntry(entry);
        return {
          apiReturnedFileName: storageName,
          size: sizeBytes,
          status: "success" as const,
        };
      }),
    [fileLinks],
  );

  return (
    <div className="basic-form-content d-flex flex-column">
      <div className="d-flex flex-column gap-3">
        <div className="info-box d-flex flex-row">
          <SuccessIcon />
          <span className="regular-text">{MODAL_MSSG.PROGRESS_SAVED}</span>
        </div>
        <div className="d-flex align-items-center info-text">
          <span className="required">* </span>
          <span className="required-label">indicates a required field</span>
        </div>
      </div>
      <div className="d-flex flex-column">
        <span className="label">Task ID</span>
        <span className="sublabel">{tasksDetails?.taskId}</span>
      </div>
      <DropdownWithIcon
        value={dropdownPriority}
        label="Priority"
        dropdownOptions={dropdownOptionsIcon}
        customClass="input-w-190"
        onChange={(value) => setDropdownPriority(value)}
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
          onChange={(value) => {
            const option = value as "today" | "later" | "";
            setLaunchOption(option);
            if (option === "today") {
              setPlannedLaunchDate(buildTodayUtcDate().toISOString());
            } else if (option === "later") {
              setPlannedLaunchDate("");
            }
          }}
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
                </span>
              ) as unknown as string,
              value: "later",
            },
          ]}
        />
        {launchOption === "later" && (
          <DatePicker
            value={plannedLaunchDate ? new Date(plannedLaunchDate) : null}
            disablePastAndTodayDates={true}
            onChange={(date) =>
              setPlannedLaunchDate(date ? date.toISOString() : "")
            }
            label=""
            placeholder=" "
            isRequired
            customClass="input-w-190 date-picker-later"
            exactUtcTime={true}
          />
        )}
      </div>
      <CustomInput
        label="Workfront link (if any)"
        value={workfrontId}
        onChange={(e) => setWorkfrontId(e.target.value)}
        placeholder=" "
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
        />
        {playbookLinkError && (
          <span className="error-message">Please enter a valid URL</span>
        )}
      </div>
      <FileUpload
        fileList={files}
        onUpload={(updatedFiles) => setFileLinks(updatedFiles)}
      />
      <div className="mt-3 d-flex justify-content-end">
        <Button
          className="continue-button"
          onClick={hasChanges ? handleUpdateTask : () => onContinue?.()}
          disabled={isUpdating || isDateInPast(plannedLaunchDate)}
        >
          {isUpdating ? "Updating..." : hasChanges ? "Update" : "Continue"}
        </Button>
      </div>
    </div>
  );
};

export default SubmitSettingForm;
