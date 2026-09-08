import { useState } from "react";
import "./RefreshRibbon.scss";
import { ErrorIcon, WarningIcon } from "@ucc/common-ui";

export interface RefreshRibbonProps {
  onRefresh: () => void | Promise<void>;
  title?: string;
  message?: string;
  buttonLabel?: string;
  viewDetailsLink?: boolean;
  variant?: "warning" | "error";
}

const RefreshRibbon = ({
  onRefresh,
  title = "Production data changed",
  message = "The data in production has been updated since you started editing. Refresh to get the latest production data. We'll keep your changes.",
  buttonLabel = "",
  viewDetailsLink = false,
  variant = "warning"
}: RefreshRibbonProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleClick = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="refresh-ribbon" role="alert">
      <div className="message">
        {variant === "error" ? (
          <ErrorIcon className="me-2" />
        ) : (
          <WarningIcon className="me-2" />
        )}
        <strong>{title}</strong>&nbsp;{message}
        {buttonLabel.length === 0 && <div className="view-details" onClick={handleClick}>View details</div>}
      </div>
      {!viewDetailsLink && <div>
        <button
          className="btn-refresh"
          onClick={handleClick}
          disabled={isRefreshing}
          aria-label={buttonLabel}
        >
          <div>{buttonLabel}</div>
        </button>
      </div>}
    </div >
  );
};

export default RefreshRibbon;
