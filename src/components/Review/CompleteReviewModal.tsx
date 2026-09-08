import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import {
  Button,
  CustomCheckbox,
  MultiSelectDropdown,
  CustomTextarea,
} from "@ucc/common-ui";
import { FaTriangleExclamation } from "react-icons/fa6";
import { SuccessIcon } from "@/assets"
import { MODAL_MSSG } from "@/constants";
import "./CompleteReviewModal.scss";

interface CompleteReviewModalProps {
  show: boolean;
  handleClose: () => void;
  onConfirm: (errorTypes: string[], comments: string) => Promise<void>;
  hasFailedItems?: boolean;
  isSubmitting?: boolean;
  errorCategories?: string[];
  errorTypeOptions?: { label: string; value: string }[];
  successMessage?: string;
  confirmText?: string;
  checkboxLabel?: string;
  rejectConfirmText?: string;
  rejectCheckboxLabel?: string;
  /** "rebuttal" swaps the copy/actions to the configurator's send-rebuttal flow. */
  variant?: "review" | "rebuttal";
  /** Days remaining from the review API; null when the backend gives no deadline. */
  rebuttalDaysLeft?: number | null;
}

const DEFAULT_ERROR_TYPE_OPTIONS = [
  { label: "Billing Error", value: "Billing Error" },
  { label: "Permissions Error", value: "Permissions Error" },
  { label: "Eligibility Error", value: "Eligibility Error" },
  { label: "Configuration Error", value: "Configuration Error" },
  { label: "Other", value: "Other" },
];

const CompleteReviewModal: React.FC<CompleteReviewModalProps> = ({
  show,
  handleClose,
  onConfirm,
  hasFailedItems = false,
  isSubmitting = false,
  errorCategories = [],
  errorTypeOptions = DEFAULT_ERROR_TYPE_OPTIONS,
  successMessage = MODAL_MSSG.REVIEW_SUCCESS_MESSAGE,
  confirmText = MODAL_MSSG.REVIEW_CONFIRM_TEXT,
  checkboxLabel = MODAL_MSSG.REVIEW_CHECKBOX_LABEL,
  rejectConfirmText = MODAL_MSSG.REVIEW_REJECT_CONFIRM_TEXT,
  rejectCheckboxLabel = MODAL_MSSG.REVIEW_REJECT_CHECKBOX_LABEL,
  variant = "review",
  rebuttalDaysLeft = null,
}) => {
  const [errorTypes, setErrorTypes] = useState<string[]>([]);
  const [comments, setComments] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [errorTypeError, setErrorTypeError] = useState("");

  const isRebuttal = variant === "rebuttal";
  /** Omitted entirely when the API reports no deadline, rather than showing "null days". */
  const daysLeftMessage =
    typeof rebuttalDaysLeft === "number"
      ? `You have ${rebuttalDaysLeft} ${rebuttalDaysLeft === 1 ? "day" : "days"} left to send rebuttal`
      : null;
  /** Rebuttal always needs a reason; review only needs one when something failed. */
  const requiresReasonSelection = isRebuttal || hasFailedItems;

  const handleModalClose = () => {
    setErrorTypes([]);
    setComments("");
    setIsConfirmed(false);
    setErrorTypeError("");
    handleClose();
  };

  const isSubmitDisabled = requiresReasonSelection
    ? errorTypes.length === 0 || !isConfirmed
    : !isConfirmed;

  const handleSubmit = async () => {
    if (requiresReasonSelection && errorTypes.length === 0) {
      setErrorTypeError(
        isRebuttal ? "Rebuttal reason is required." : "Error type is required.",
      );
      return;
    }
    if (!isSubmitDisabled) {
      await onConfirm(errorTypes, comments);
      handleModalClose();
    }
  };

  const handleReasonChange = (selectedKeys: string[]) => {
    const selectedValues = selectedKeys.map(
      (key) => errorTypeOptions.find((opt) => opt.label === key)?.value || key,
    );
    setErrorTypes(selectedValues);
    setErrorTypeError("");
  };

  /** MultiSelectDropdown is keyed by label, so map selection back through it. */
  const reasonOptions = errorTypeOptions.reduce(
    (acc, opt) => {
      acc[opt.label] = errorTypes.includes(opt.value);
      return acc;
    },
    {} as Record<string, boolean>,
  );

  return (
    <Modal show={show} onHide={handleModalClose} centered className="complete-review-modal">
      <Modal.Header closeButton>
        <Modal.Title>{isRebuttal ? "Send rebuttal" : "Complete review"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="modal-content-wrapper">
          {isRebuttal ? (
            <>
              <div className="complete-review-modal__warning">
                <FaTriangleExclamation className="complete-review-modal__warning-icon" />
                <div>
                  {daysLeftMessage && (
                    <p className="complete-review-modal__warning-title">
                      {daysLeftMessage}
                    </p>
                  )}
                  <p className="complete-review-modal__warning-desc">
                    {MODAL_MSSG.REBUTTAL_WARNING_DESC}
                  </p>
                </div>
              </div>

              <p className="complete-review-modal__required-hint">
                <span className="required">*</span> {MODAL_MSSG.REQUIRED_FIELD_HINT}
              </p>

              <div className="complete-review-modal__labelled-field">
                <label className="complete-review-modal__field-title">
                  Rebuttal reason<span className="required">&nbsp;*</span>
                </label>
                <MultiSelectDropdown
                  label=""
                  options={reasonOptions}
                  placeholder={MODAL_MSSG.REBUTTAL_REASON_PLACEHOLDER}
                  onChange={handleReasonChange}
                />
              </div>
              {errorTypeError && (
                <span className="complete-review-modal__error-text">{errorTypeError}</span>
              )}

              <CustomTextarea
                label="Add comments"
                placeholder={MODAL_MSSG.REBUTTAL_COMMENTS_PLACEHOLDER}
                value={comments}
                rows={4}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setComments(e.target.value);
                }}
              />

              <p className="complete-review-modal__confirm-text">
                {MODAL_MSSG.SEND_REBUTTAL_CONFIRM_TEXT}
              </p>

              <div className="confirm-checkbox">
                <CustomCheckbox
                  checked={isConfirmed}
                  onChange={(checked: boolean) => setIsConfirmed(checked)}
                  size="lg"
                />
                <label className="check-label">
                  {MODAL_MSSG.SEND_REBUTTAL_CHECKBOX_LABEL}
                  <span className="required">&nbsp;*</span>
                </label>
              </div>
            </>
          ) : hasFailedItems ? (
            <>
              <div className="complete-review-modal__warning">
                <FaTriangleExclamation className="complete-review-modal__warning-icon" />
                <div>
                  <p className="complete-review-modal__warning-title">
                    One or more items failed review
                  </p>
                  <p className="complete-review-modal__warning-desc">
                    This action will reject the update and return it to the configurator.
                  </p>
                </div>
              </div>

              {errorCategories.length > 0 && (
                <div className="complete-review-modal__field">
                  <span className="complete-review-modal__field-label">Error category</span>
                  <span className="complete-review-modal__field-value">
                    {errorCategories.join("; ")}
                  </span>
                </div>
              )}

              <MultiSelectDropdown
                label="Error type"
                options={reasonOptions}
                placeholder="Select error type"
                onChange={handleReasonChange}
              />
              {errorTypeError && (
                <span className="complete-review-modal__error-text">{errorTypeError}</span>
              )}

              <CustomTextarea
                label="Add comments"
                placeholder="Describe the issue and the expected change."
                value={comments}
                rows={4}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setComments(e.target.value);
                }}
              />

              <p className="complete-review-modal__confirm-text">
                {rejectConfirmText}
              </p>

              <div className="confirm-checkbox">
                <CustomCheckbox
                  checked={isConfirmed}
                  onChange={(checked: boolean) => setIsConfirmed(checked)}
                  size="lg"
                />
                <label className="check-label">
                  {rejectCheckboxLabel}<span className="required">&nbsp;*</span>
                </label>
              </div>
            </>
          ) : (
            <>
              <div className="complete-review-modal__success">
                <SuccessIcon className="complete-review-modal__success-icon" />
                <span className="complete-review-modal__success-text">
                  {successMessage}
                </span>
              </div>

              <p className="complete-review-modal__confirm-text">
                {confirmText}
              </p>

              <div className="confirm-checkbox">
                <CustomCheckbox
                  checked={isConfirmed}
                  onChange={(checked: boolean) => setIsConfirmed(checked)}
                  size="lg"
                />
                <label className="check-label">
                  {checkboxLabel}<span className="required">&nbsp;*</span>
                </label>
              </div>
            </>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="footer d-flex flex-row justify-content-between w-100">
          <Button className="signin-button" onClick={handleModalClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button className="primary" onClick={handleSubmit} disabled={isSubmitDisabled || isSubmitting}>
            {isRebuttal
              ? isSubmitting
                ? "Sending..."
                : "Send rebuttal"
              : isSubmitting
                ? "Completing..."
                : "Complete review"}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default CompleteReviewModal;
