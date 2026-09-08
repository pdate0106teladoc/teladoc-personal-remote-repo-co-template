import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { Button, CustomCheckbox, CustomDropdown, CustomTextarea, showCustomToast } from "@ucc/common-ui";
import "./PutOnHoldModal.scss";
import { ERROR_MESSAGES, ToastType } from "@/constants";

interface ReasonOption {
    label: string;
    value: string;
}

interface TaskActionModalProps {
    show: boolean;
    handleClose: () => void;
    onConfirm: (reasonCode: string, comments: string) => Promise<void>;
    title: string;
    confirmLabel: string;
    cancelLabel?: string;
    description?: string;
    reasonOptions: ReasonOption[];
    commentsPlaceholder?: string;
    showConfirmCheckbox?: boolean;
    checkboxLabel?: string;
}

const TaskActionModal: React.FC<TaskActionModalProps> = ({
    show,
    handleClose,
    onConfirm,
    title,
    confirmLabel,
    cancelLabel = "Cancel",
    description,
    reasonOptions,
    commentsPlaceholder = "Add comments.",
    showConfirmCheckbox = false,
    checkboxLabel = "Confirm this action.",
}) => {
    const [reasonCode, setReasonCode] = useState("");
    const [comments, setComments] = useState("");
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [reasonError, setReasonError] = useState("");
    const [commentsError, setCommentsError] = useState("");

    const isCommentsRequired = reasonCode === "Other";

    const handleModalClose = () => {
        setReasonCode("");
        setComments("");
        setIsConfirmed(false);
        setReasonError("");
        setCommentsError("");
        handleClose();
    };

    const handleCheckboxChange = (checked: boolean) => {
        if (checked) {
            if (!reasonCode) setReasonError("Reason is required.");
            if (isCommentsRequired && !comments) setCommentsError("Comments are required.");
        }
        setIsConfirmed(checked);
    };

    const isSubmitDisabled =
        !reasonCode ||
        (showConfirmCheckbox && !isConfirmed) ||
        (isCommentsRequired && !comments);

    const handleSubmit = async () => {
        if (!isSubmitDisabled) {
            try {
                await onConfirm(reasonCode, comments);
                handleModalClose();
            } catch {
            showCustomToast({
                type: ToastType.Error,
                title: "Failed",
                message: ERROR_MESSAGES.SOMETHINGS_WRONG,
                });
            }
        }
    };

    return (
        <Modal show={show} onHide={handleModalClose} centered className="put-on-hold-modal">
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="modal-content-wrapper">
                    {description && (
                        <p className="modal-description">{description}</p>
                    )}
                    <CustomDropdown
                        label="Reason"
                        options={reasonOptions}
                        placeholder="Select a reason"
                        isRequired
                        value={reasonCode}
                        onChange={(val) => {
                            setReasonCode(val);
                            setReasonError("");
                            if (val !== "Other") setCommentsError("");
                        }}
                        error={reasonError}
                    />
                    <CustomTextarea
                        label="Comments"
                        placeholder={commentsPlaceholder}
                        value={comments}
                        required={isCommentsRequired}
                        rows={3}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                            setComments(e.target.value);
                            setCommentsError("");
                        }}
                        error={commentsError}
                    />
                    {showConfirmCheckbox && (
                        <div className="confirm-checkbox">
                            <CustomCheckbox
                                checked={isConfirmed}
                                onChange={handleCheckboxChange}
                                size="lg"
                            />
                            <label className="check-label">
                                {checkboxLabel}<span className="required">&nbsp;*</span>
                            </label>
                        </div>
                    )}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <div className="footer d-flex flex-row justify-content-between w-100">
                    <Button className="signin-button" onClick={handleModalClose}>
                        {cancelLabel}
                    </Button>
                    <Button className="danger" onClick={handleSubmit} disabled={isSubmitDisabled}>
                        {confirmLabel}
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default TaskActionModal;
