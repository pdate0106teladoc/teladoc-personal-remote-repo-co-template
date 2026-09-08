import React, { useState, useCallback, useEffect, useRef } from "react";
import "./HistoryLogsFilterSidebar.scss";
import {
  Button,
  MultiSelectDropdown,
  DatePicker,
  MultiSelectSearch,
  showCustomToast,
} from "@ucc/common-ui";
import api from "@/api/apiService";
import { useLocation, useParams } from "react-router-dom";
import { GRP_DETAIL_PATH } from "@/router/routes";
import { EditTypesResponse } from "@/types/edit";
import { ToastType } from "@/constants";
import { ERROR_MESSAGES } from "@/constants";
import { useHistoryFilterStore } from "@/store/useHistoryFilterStore";
import { dateRangeCount, hasAny } from "@/utils";

const historyLookupApi = {
  get: async (url: string) => {
    const res = await api.get<{ lookupType: string; values: string[] }>(url);
    const data =
      (res as { data?: { values?: string[] } })?.data ??
      (res as { values?: string[] });
    return {
      values: (data?.values ?? []).map((v: string) => ({ id: v, name: v })),
    };
  },
};

interface HistoryLogsFilterSidebarProps {
  setOpenModal?: React.Dispatch<React.SetStateAction<boolean>>;
  onExposeClear?: (fn: () => void) => void;
  /** Reset pagination before applied filters hit the store (same idea as ContactFilters `onFiltersApplied`). */
  onFiltersApplied?: () => void;
}

const HistoryLogsFilterSidebar: React.FC<HistoryLogsFilterSidebarProps> = ({
  setOpenModal,
  onExposeClear,
  onFiltersApplied,
}) => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isGroup = location.pathname.startsWith(GRP_DETAIL_PATH);
  const entityType = isGroup ? "GROUP" : "ORGANIZATION";
  const taskUrl = import.meta.env.VITE_TASK_URL;

  const initial = useHistoryFilterStore((s) => s.filters);
  const setFilters = useHistoryFilterStore((s) => s.setFilters);
  const setApplied = useHistoryFilterStore((s) => s.setApplied);
  const clearStore = useHistoryFilterStore((s) => s.clear);
  const initialTypeOfEditRef = useRef(initial.typeOfEdit);

  const [effectiveDateStart, setEffectiveDateStart] = useState<Date | null>(
    initial.fromEffectiveDateRange
      ? new Date(initial.fromEffectiveDateRange)
      : null,
  );
  const [effectiveDateEnd, setEffectiveDateEnd] = useState<Date | null>(
    initial.toEffectiveDateRange
      ? new Date(initial.toEffectiveDateRange)
      : null,
  );
  const [typeOfEdit, setTypeOfEdit] = useState<string[]>(initial.typeOfEdit);
  const [workflowStartDateStart, setWorkflowStartDateStart] =
    useState<Date | null>(
      initial.fromWorkflowStartDate
        ? new Date(initial.fromWorkflowStartDate)
        : null,
    );
  const [workflowStartDateEnd, setWorkflowStartDateEnd] = useState<Date | null>(
    initial.toWorkflowStartDate ? new Date(initial.toWorkflowStartDate) : null,
  );
  const [workflowId, setWorkflowId] = useState<Record<string, string>>(
    initial.workflowId,
  );
  const [opportunityId, setOpportunityId] = useState<Record<string, string>>(
    initial.opportunityId,
  );
  const [changeRequest, setChangeRequest] = useState<Record<string, string>>(
    initial.changeRequest,
  );
  const [updatedBy, setUpdatedBy] = useState<Record<string, string>>(
    initial.updatedBy,
  );
  const [typeOfEditOptions, setTypeOfEditOptions] = useState<
    Record<string, boolean>
  >({});
  const [editTypeLabelToId, setEditTypeLabelToId] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    const fetchEditTypes = async () => {
      try {
        const data = await api.get<EditTypesResponse>(
          `${taskUrl}client-configurations/${entityType}/edit-types`,
        );
        const sorted = [...data.editTypes]
          .filter((t) => t.active)
          .sort((a, b) => a.displayOrder - b.displayOrder);
        const initialSelections = initialTypeOfEditRef.current;
        const selectedLabels = sorted
          .filter(
            (t) =>
              initialSelections.includes(t.label) ||
              initialSelections.includes(t.id),
          )
          .map((t) => t.label);
        const options = sorted.reduce<Record<string, boolean>>((acc, t) => {
          acc[t.label] = selectedLabels.includes(t.label);
          return acc;
        }, {});
        const labelToId = sorted.reduce<Record<string, string>>((acc, t) => {
          acc[t.label] = t.id;
          return acc;
        }, {});
        setTypeOfEdit(selectedLabels);
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
  }, [entityType, taskUrl]);

  const buildLookupParams = (searchTerm: string) => ({
    lookupValue: searchTerm,
  });

  const computeAppliedCount = () => {
    let count = 0;
    count += dateRangeCount(
      effectiveDateStart?.toISOString() ?? "",
      effectiveDateEnd?.toISOString() ?? "",
    );
    count += hasAny(typeOfEdit) ? 1 : 0;
    count += dateRangeCount(
      workflowStartDateStart?.toISOString() ?? "",
      workflowStartDateEnd?.toISOString() ?? "",
    );
    count += Object.keys(workflowId).length > 0 ? 1 : 0;
    count += Object.keys(opportunityId).length > 0 ? 1 : 0;
    count += Object.keys(changeRequest).length > 0 ? 1 : 0;
    count += Object.keys(updatedBy).length > 0 ? 1 : 0;
    return count;
  };

  const computeAppliedKeys = (): string[] => {
    const applied: string[] = [];
    if (effectiveDateStart || effectiveDateEnd)
      applied.push("Effective Date Range");
    if (typeOfEdit.length) applied.push("Type of Edit");
    if (workflowStartDateStart || workflowStartDateEnd)
      applied.push("Workflow Start Date Range");
    if (Object.keys(workflowId).length > 0) applied.push("Workflow ID");
    if (Object.keys(opportunityId).length > 0) applied.push("Opportunity ID");
    if (Object.keys(changeRequest).length > 0) applied.push("Change Request");
    if (Object.keys(updatedBy).length > 0) applied.push("Updated By");
    return applied;
  };

  const isEffectiveDateRangeInvalid =
    !!effectiveDateStart &&
    !!effectiveDateEnd &&
    effectiveDateStart > effectiveDateEnd;

  const isWorkflowDateRangeInvalid =
    !!workflowStartDateStart &&
    !!workflowStartDateEnd &&
    workflowStartDateStart > workflowStartDateEnd;

  const disableApplyFilters =
    isEffectiveDateRangeInvalid || isWorkflowDateRangeInvalid;

  const handleApplyFilters = () => {
    if (disableApplyFilters) return;
    onFiltersApplied?.();
    setFilters({
      fromEffectiveDateRange: effectiveDateStart?.toISOString() ?? "",
      toEffectiveDateRange: effectiveDateEnd?.toISOString() ?? "",
      typeOfEdit: typeOfEdit.map((label) => editTypeLabelToId[label] ?? label),
      fromWorkflowStartDate: workflowStartDateStart?.toISOString() ?? "",
      toWorkflowStartDate: workflowStartDateEnd?.toISOString() ?? "",
      workflowId,
      opportunityId,
      changeRequest,
      updatedBy,
    });
    setApplied({
      filterApplied: computeAppliedCount(),
      filteredAppliedKeys: computeAppliedKeys(),
    });
    setOpenModal?.(false);
  };

  const handleClearFilters = useCallback(() => {
    setEffectiveDateStart(null);
    setEffectiveDateEnd(null);
    setTypeOfEdit([]);
    setTypeOfEditOptions((prev) =>
      Object.fromEntries(Object.keys(prev).map((k) => [k, false])),
    );
    setWorkflowStartDateStart(null);
    setWorkflowStartDateEnd(null);
    setWorkflowId({});
    setOpportunityId({});
    setChangeRequest({});
    setUpdatedBy({});
    clearStore();
  }, [clearStore]);

   useEffect(() => {
   onExposeClear?.(handleClearFilters);
 }, [onExposeClear, handleClearFilters]);

  return (
    <div className="history-logs-filter-container">
      <div className="d-flex flex-column content">
        <div className="filter-section">
          <h6 className="filter-section-title">Effective date range</h6>
          <div className="date-range-inputs">
            <div className="history-date-picker-wrapper">
              <DatePicker
                placeholder="Start date"
                value={effectiveDateStart ?? null}
                onChange={(date) => setEffectiveDateStart(date)}
                disablePastDates={false}
              />
            </div>
            <span className="date-separator">-</span>
            <div className="history-date-picker-wrapper">
              <DatePicker
                placeholder="End date"
                value={effectiveDateEnd ?? null}
                onChange={(date) => setEffectiveDateEnd(date)}
                disablePastDates={false}
              />
            </div>
          </div>
          {isEffectiveDateRangeInvalid && (
            <div className="date-range-warning">
              Start date cannot be greater than end date.
            </div>
          )}
        </div>

        <div className="filter-section">
          <MultiSelectDropdown
            label="Type of edit"
            options={typeOfEditOptions}
            placeholder=""
            onChange={(selectedKeys) => setTypeOfEdit(selectedKeys)}
            customClass="multi-drop"
            enforceLimit
          />
        </div>

        <div className="filter-section">
          <h6 className="filter-section-title">Work flow start date range</h6>
          <div className="date-range-inputs">
            <div className="history-date-picker-wrapper">
              <DatePicker
                placeholder="Start date"
                value={workflowStartDateStart ?? null}
                onChange={(date) => setWorkflowStartDateStart(date)}
                disablePastDates={false}
              />
            </div>
            <span className="date-separator">-</span>
            <div className="history-date-picker-wrapper">
              <DatePicker
                placeholder="End date"
                value={workflowStartDateEnd ?? null}
                onChange={(date) => setWorkflowStartDateEnd(date)}
                disablePastDates={false}
              />
            </div>
          </div>
          {isWorkflowDateRangeInvalid && (
            <div className="date-range-warning">
              Start date cannot be greater than end date.
            </div>
          )}
        </div>

        <div className="filter-section">
          <MultiSelectSearch
            label="Workfront link"
            preSelected={workflowId}
            onChange={(selected) => setWorkflowId(selected)}
            api={historyLookupApi}
            apiUrl={`${taskUrl}client-configurations/${entityType}/${id}/history/lookups/WORKFRONT_ID`}
            buildSearchParams={buildLookupParams}
            maxResults={5}
            multiSelect={false}
            responseDataPath="values"
          />
        </div>

        <div className="filter-section">
          <MultiSelectSearch
            label="Opportunity ID"
            preSelected={opportunityId}
            onChange={(selected) => setOpportunityId(selected)}
            api={historyLookupApi}
            apiUrl={`${taskUrl}client-configurations/${entityType}/${id}/history/lookups/OPPORTUNITY_ID`}
            buildSearchParams={buildLookupParams}
            maxResults={5}
            multiSelect={false}
            responseDataPath="values"
          />
        </div>

        <div className="filter-section">
          <MultiSelectSearch
            label="Change Request"
            preSelected={changeRequest}
            onChange={(selected) => setChangeRequest(selected)}
            api={historyLookupApi}
            apiUrl={`${taskUrl}client-configurations/${entityType}/${id}/history/lookups/CHANGE_REQUEST_ID`}
            buildSearchParams={buildLookupParams}
            maxResults={5}
            multiSelect={false}
            responseDataPath="values"
          />
        </div>

        <div className="filter-section">
          <MultiSelectSearch
            label="Updated by"
            preSelected={updatedBy}
            onChange={(selected) => setUpdatedBy(selected)}
            api={historyLookupApi}
            apiUrl={`${taskUrl}client-configurations/${entityType}/${id}/history/lookups/UPDATED_BY`}
            buildSearchParams={buildLookupParams}
            maxResults={5}
            multiSelect={false}
            responseDataPath="values"
          />
        </div>
      </div>

      <div className="footer">
        <Button variant="secondary" onClick={handleClearFilters}>
          Clear all
        </Button>
        <Button
          variant="primary"
          onClick={handleApplyFilters}
          disabled={disableApplyFilters}
        >
          Show results
        </Button>
      </div>
    </div>
  );
};

export default HistoryLogsFilterSidebar;
