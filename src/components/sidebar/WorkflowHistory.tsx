import React from "react";
import "./WorkflowHistory.scss";
import { extractDisplayValue } from "@/components/ExtractValue/ExtractDisplayValue";
import { formatUTCtoDateOnly } from "@/utils";
import { FileIcon } from "@/assets";
import { FailSafePage } from "@ucc/common-ui";

export type StatusType =
  | "Completed"
  | "Scheduled"
  | "Approved"
  | "Quality Review"
  | "Pending Quality Review"
  | "Peer Review"
  | "Pending Peer Review"
  | "draft"
  | "Draft";

export type WorkflowHistoryItem = {
  dateTime: string | Date;
  statusCode?: string;
  statusLabel?: string;
  userName?: string;
  reason?: string | null;
  comments?: string | null;
};

interface WorkflowHistoryProps {
  items?: WorkflowHistoryItem[];
  onDownload?: () => void;
}

const WorkflowHistory: React.FC<WorkflowHistoryProps> = ({ items }) => {
  return items?.length === 0 ? (
    <FailSafePage cardType="noData" />
  ) : (
    <div className="workflow-history">
      <div className="workflow-list">
        {items?.map((item, index) => {
          const isLast = index === items?.length - 1 ? 1 : 0;

          // Support both new and legacy data formats
          const timestamp = item.dateTime;
          const statusLabel = item.statusLabel;
          const userName = item.userName;
          const reason = item.reason;
          const comments = item.comments;

          return (
            <div className="workflow-item">
              <div className="workflow-time">
                {formatUTCtoDateOnly(timestamp.toString(), true, true).replace(
                  /,([^,]*)$/,
                  " -$1",
                )}
              </div>

              <div className="workflow-timeline">
                <div className="workflow-dot">
                  <FileIcon />
                </div>
                <div className={`workflow-line${isLast ? "-isLast" : ""}`} />
              </div>

              <div className="workflow-content">
                <div className="workflow-status">
                  Status: <strong>{statusLabel}</strong>
                </div>

                {userName && (
                  <div className="workflow-actor">
                    <div className="actor-indicator"></div>
                    <div className="d-flex flex-row align-items-center">
                      <span className="actor-name">
                        {extractDisplayValue(userName, "person").jsx}
                      </span>
                      <div className="reason-comments-container">
                        {reason && (
                          <div className="d-flex flex-row align-items-center comment-box">
                            <span className="field-title">Reason</span>
                            <span className="comment-value">{reason}</span>
                          </div>
                        )}
                        {comments && (
                          <div className="d-flex flex-row align-items-center comment-box">
                            <span className="field-title">Comments</span>
                            <span className="comment-value">{comments}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowHistory;
