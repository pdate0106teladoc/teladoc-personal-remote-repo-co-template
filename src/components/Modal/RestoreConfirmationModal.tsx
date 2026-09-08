import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import "./RestoreConfirmationModal.scss";
import { MODAL_MSSG, ToastType } from "@/constants";
import {
  Button,
  CustomCheckbox,
  CustomInput,
  showCustomToast,
} from "@ucc/common-ui";
import { OrgHistory } from "@/types/edit";
import api from "@/api/apiService";
import { formatUTCtoDateOnly } from "@/utils";

interface RestoreConfirmationModalProps {
  show: boolean;
  handleClose: () => void;
  onRestoreSuccess?: () => void;
  selectedRow?: OrgHistory | null;
}

const RestoreConfirmationModal: React.FC<RestoreConfirmationModalProps> = ({
  show,
  handleClose,
  onRestoreSuccess,
  selectedRow,
}) => {
  const taskURL = import.meta.env.VITE_TASK_URL;
  const versionDate = formatUTCtoDateOnly(
    selectedRow?.versionTimestamp,
    true,
    true,
  );
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleRestore = async () => {
    try {
      const url = `${taskURL}client-configurations/history/${selectedRow?.versionMongoId}/restore`;
      await api.post(url);
      showCustomToast({
        type: ToastType.Success,
        title: "Restore Successful",
        message: "The version has been successfully restored.",
      });
      handleClose();
      onRestoreSuccess?.();
    } catch {
      showCustomToast({
        type: ToastType.Error,
        title: "Restore Failed",
        message: "Failed to restore the version.",
      });
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      className="restore-confirmation-modal"
      enforceFocus={false}
      restoreFocus={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>Restore Version</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="modal-content b-0">
          <div>
            <CustomInput
              label="Version"
              value={versionDate}
              readOnly
              className="input-style"
            />
          </div>
          <div>
            <span className="restore-label">{MODAL_MSSG.CONFIRM_RESTORE}</span>
            <div className="d-flex flex-row align-items-center m-3">
              <CustomCheckbox
                checked={isConfirmed}
                onChange={(checked) => setIsConfirmed(checked)}
                size="lg"
              />
              <label className="ms-2 check-label" htmlFor="custom-checkbox">
                {MODAL_MSSG.CONFIRM_ROLLBACK}
                <span className="required">&nbsp;*</span>
              </label>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="d-flex flex-row w-100 justify-content-between">
          <Button className="signin-button" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleRestore} disabled={!isConfirmed}>
            Restore
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default RestoreConfirmationModal;
