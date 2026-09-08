import * as React from "react";
import { ConfigHeader as UIConfigHeader } from "@ucc/common-ui";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import { useLocation, useParams } from "react-router-dom";
import { EditIndicatorIcon } from "@/assets";
import { resolveConfigHeaderIndicator } from "@/utils/configHeaderIndicator";
import "./ConfigHeader.scss";

interface ConfigHeaderProps {
  name: string;
  id: string | number;
  label: string;
  iconType: "Group" | "Org";
  actions?: React.ReactNode;
  syncStatus?: React.ReactNode;
  taskStatus?: string;
}

const ConfigHeader: React.FC<ConfigHeaderProps> = ({
  name,
  id,
  label,
  iconType,
  actions,
  syncStatus,
  taskStatus,
}) => {
  const { candidateId } = useParams<{ candidateId?: string }>();
  const { pathname } = useLocation();
  const indicator = resolveConfigHeaderIndicator({
    pathname,
    taskId: candidateId,
    taskStatus,
  });
  const isTaskMode = indicator.type !== "breadcrumb";

  return (
    <UIConfigHeader
      name={name}
      id={id}
      label={label}
      iconType={iconType}
      actions={actions}
      syncStatus={syncStatus}
      isEditMode={isTaskMode}
    >
      {indicator.type === "breadcrumb" ? (
        <Breadcrumb isOrgLayout={iconType === "Org"} />
      ) : indicator.type === "reviewing" ? (
        <div className="config-header-indicator config-header-indicator--reviewing">
          <span className="reviewing-indicator-label">Reviewing</span>
          <span className="reviewing-indicator-task">
            Task {indicator.taskId}
          </span>
        </div>
      ) : (
        <div className="config-header-indicator config-header-indicator--editing d-flex align-items-center gap-2">
          <EditIndicatorIcon height={16} width={16} />
          <span className="editing-indicator-text">Editing</span>
        </div>
      )}
    </UIConfigHeader>
  );
};

export default ConfigHeader;
