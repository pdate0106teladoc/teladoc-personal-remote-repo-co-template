import React from "react";
import { Modal } from "react-bootstrap";
import { Button } from "@ucc/common-ui";
import { FaTriangleExclamation } from "react-icons/fa6";
import type {
  RebuttalSummary,
  ReviewSummary,
} from "@/components/Review/reviewFieldRegistry";
import "./ReviewSummaryModal.scss";

interface ReviewSummaryModalProps {
  show: boolean;
  summary: ReviewSummary | RebuttalSummary;
  onClose: () => void;
  /** "rebuttal" swaps the title and shows the rebuttal reason instead of error category/type. */
  variant?: "review" | "rebuttal";
}

const isRebuttalSummary = (
  summary: ReviewSummary | RebuttalSummary,
): summary is RebuttalSummary => "rebuttalReason" in summary;

const splitSummaryMessage = (message: string) => {
  const separatorIndex = message.indexOf(". ");
  if (separatorIndex === -1) {
    return { title: message, description: "" };
  }
  return {
    title: message.slice(0, separatorIndex + 1),
    description: message.slice(separatorIndex + 2),
  };
};

const ReviewSummaryModal: React.FC<ReviewSummaryModalProps> = ({
  show,
  summary,
  onClose,
  variant = "review",
}) => {
  const { title, description } = splitSummaryMessage(summary.message);

  const detailFields: { label: string; value: string }[] = [];
  if (variant === "rebuttal") {
    if (isRebuttalSummary(summary) && summary.rebuttalReason.length > 0) {
      detailFields.push({
        label: "Rebuttal reason",
        value: summary.rebuttalReason.join("; "),
      });
    }
  } else if (!isRebuttalSummary(summary)) {
    if (summary.errorCategories.length > 0) {
      detailFields.push({
        label: "Error category",
        value: summary.errorCategories.join("; "),
      });
    }
    if (summary.errorTypes.length > 0) {
      detailFields.push({
        label: "Error type",
        value: summary.errorTypes.join("; "),
      });
    }
  }
  if (summary.comments) {
    detailFields.push({ label: "Comments", value: summary.comments });
  }

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      className="review-summary-modal"
      data-testid="review-summary-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {variant === "rebuttal" ? "Review rebuttal" : "Review summary"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="review-summary-modal__content">
          <div className="review-summary-modal__warning">
            <FaTriangleExclamation className="review-summary-modal__warning-icon" />
            <div>
              <p className="review-summary-modal__warning-title">{title}</p>
              {description && (
                <p className="review-summary-modal__warning-desc">{description}</p>
              )}
            </div>
          </div>

          {detailFields.map((field) => (
            <div key={field.label} className="review-summary-modal__field">
              <span className="review-summary-modal__field-label">{field.label}</span>
              <span className="review-summary-modal__field-value">{field.value}</span>
            </div>
          ))}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="review-summary-modal__footer">
          <Button className="primary" onClick={onClose}>
            Continue
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ReviewSummaryModal;
