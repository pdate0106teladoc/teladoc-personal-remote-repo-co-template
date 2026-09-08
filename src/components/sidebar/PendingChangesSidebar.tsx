import React, { useState } from "react";
import "./PendingChangesSidebar.scss";
import { DatePicker, FailSafePage } from "@ucc/common-ui";
import { extractDisplayValue, DisplayType } from "../ExtractValue/ExtractDisplayValue";
import TaskDetailSidebar from "./TaskDetailSidebar";
import { ClearIcon, RightArrow } from "@/assets";
import { Task } from "@/types/edit";
import { formatToMMDDYYYY, formatUTCtoDateOnly } from "@/utils";
import { canOpenTaskForEdit } from "@/utils/taskAccess";
import { useNavigate, useParams } from "react-router-dom";
interface InfoTabType {
    label: string;
    value: string;
    format?: DisplayType;
    linkAppearance?: boolean;
}


const TaskCard: React.FC<{ data: InfoTabType[]; taskId: string; onViewDetails: (taskId: string) => void }> = ({ data, taskId, onViewDetails }) => {
    const navigate = useNavigate();
    const { id } = useParams();

    const getUrlParts = () => {
        const grpType = location.pathname.includes("/org-detail/") ? "org-detail" : "groups";
        return { grpType };
    };

    const renderOverviewValueCell = (item: InfoTabType) => {
        if (item.format === "date") {
            return <span className="task-detail-overview-value-inner">{formatUTCtoDateOnly(item.value)}</span>;
        }
        const display = extractDisplayValue(item.value, item.format ?? "text").jsx;
        if (item.linkAppearance && item.value && item.value !== "-") {
            const { grpType } = getUrlParts();
            const handleClick = () => {
                navigate(`/CCC/${grpType}/${id}/edit/${taskId}/general-settings`);
            };
            return (
                <span
                    className="task-detail-overview-link task-detail-overview-link--text cursor-pointer"
                    onClick={handleClick}
                >
                    {display}
                </span>
            );
        }
        return <span className="task-detail-overview-value-inner">{display}</span>;
    };

    return (
        <div className="task-card d-flex flex-column p-3 gap-3">
            {data.map((item, idx) => (
                <div key={idx} className="d-flex info-row mt-2">
                    <span className="info-label">{item.label}</span>
                    <span className="info-value">
                        {renderOverviewValueCell(item)}
                    </span>
                </div>
            ))}
            <div className="details mt-2">
                <a className="view-details" onClick={() => onViewDetails(taskId)}>View details <RightArrow className="pl-2" /></a>
            </div>
        </div>
    );
};

const PendingChangesSidebar: React.FC<{ data?: Task[] }> = ({ data }) => {
    const [dateValue, setDateValue] = useState<Date | null>(null);
    const [openTaskDetailTab, setOpenTaskDetailTab] = useState<string | null>(null);
    const filteredTasks = dateValue && Array.isArray(data)
        ? data.filter(task => formatToMMDDYYYY(task?.plannedLaunchDate) === formatToMMDDYYYY(dateValue.toDateString()))
        : Array.isArray(data) ? data : [];
    const userName = sessionStorage.getItem("name");
    const handleBack = () => {
        setOpenTaskDetailTab(null);
    };

    if (openTaskDetailTab) {
        const selectedTask = data?.find(task => task.taskId === openTaskDetailTab);
        return (
            <TaskDetailSidebar
                taskId={openTaskDetailTab}
                data={selectedTask as any}
                onBack={handleBack}
                groupsRequired={false}
            />
        );
    }

    return (
        <div className="pending-changes-sidebar">
            <div className="filter mb-3 d-flex flex-row justify-content-between w-100">
                <DatePicker
                    value={dateValue}
                    disablePastDates={false}
                    onChange={(date) => setDateValue(date)}
                    label="Planned launch date"
                    placeholder=" "
                    customClass="input-w-190"
                />
                {
                    dateValue && <div className="clear-button" onClick={() => setDateValue(null)}><ClearIcon />&nbsp;Clear filters</div>
                }
            </div>

            <div className="task-list">
                {filteredTasks?.length > 0 ? filteredTasks?.map((task) => {
                    const infoTabData: InfoTabType[] = [
                        {
                            label: "Task ID",
                            value: task?.taskId,
                            linkAppearance: canOpenTaskForEdit({
                                userName,
                                ownerName: task?.updatedBy,
                                taskStatus: task?.currentStatus,
                            }),
                        },
                        { label: "Type of edit", value: task?.typeOfChange?.join(", ") ?? "-" },
                        { label: "Priority", value: task?.priority, format: "priority" },
                        { label: "Updated by", value: task?.updatedBy, format: "person" },
                        { label: "Planned launch date", value: task?.plannedLaunchDate, format: "date" },
                    ];

                    return <TaskCard key={task.taskId} data={infoTabData} taskId={task.taskId} onViewDetails={setOpenTaskDetailTab} />;
                }) :
                    <FailSafePage cardType="noData" />
                }
            </div>
        </div>
    );
};

export default PendingChangesSidebar;
