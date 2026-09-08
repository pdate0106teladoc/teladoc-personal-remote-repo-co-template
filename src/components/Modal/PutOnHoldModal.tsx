import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { Button, CustomCheckbox, CustomDropdown, CustomTextarea } from "@ucc/common-ui";
import "./PutOnHoldModal.scss";

interface PutOnHoldModalProps {
    show: boolean;
    handleClose: () => void;
    onConfirm: (reasonCode: string, comments: string) => Promise<void>;
}

const REASON_OPTIONS = [
    { label: "Delayed launch - Client initiated", value: "Delayed launch - Client initiated" },
    { label: "Delayed launch - Teladoc initiated", value: "Delayed launch - Teladoc initiated" },
    { label: "Contract pending", value: "Contract pending" },
    { label: "Other", value: "Other" },
];

const isCommentsRequired = (reason: string) => reason === "Other";

const PutOnHoldModal: React.FC<PutOnHoldModalProps> = ({ show, handleClose, onConfirm }) => {
    const [reasonCode, setReasonCode] = useState("");
    const [comments, setComments] = useState("");
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [reasonError, setReasonError] = useState("");
    const [commentsError, setCommentsError] = useState("");

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
            if (isCommentsRequired(reasonCode) && !comments) setCommentsError("Comments are required.");
        }
        setIsConfirmed(checked);
    };

    const isSubmitDisabled = !reasonCode || !isConfirmed || (isCommentsRequired(reasonCode) && !comments);

    const handleSubmit = async () => {
        if (!isSubmitDisabled) {
            try {
                await onConfirm(reasonCode, comments);
                handleModalClose();
            } catch(error) {
                console.log(error)
            }
        }
    };

    return (
        <Modal show={show} onHide={handleModalClose} centered className="put-on-hold-modal">
            <Modal.Header closeButton>
                <Modal.Title>Put on hold</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="modal-content-wrapper">
                    <CustomDropdown
                        label="Reason"
                        options={REASON_OPTIONS}
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
                        placeholder="Describe the reason to put on hold."
                        value={comments}
                        required={isCommentsRequired(reasonCode)}
                        rows={3}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => { setComments(e.target.value); setCommentsError(""); }}
                        error={commentsError}
                    />
                    <div className="confirm-checkbox">
                        <CustomCheckbox
                            checked={isConfirmed}
                            onChange={handleCheckboxChange}
                            size="lg"
                        />
                        <label className="check-label">
                            Confirm to put on hold until further action.<span className="required">&nbsp;*</span>
                        </label>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <div className="footer d-flex flex-row justify-content-between w-100">
                    <Button className="signin-button" onClick={handleModalClose}>
                        Cancel
                    </Button>
                    <Button className="danger" onClick={handleSubmit} disabled={isSubmitDisabled}>
                        Put on hold
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default PutOnHoldModal;
