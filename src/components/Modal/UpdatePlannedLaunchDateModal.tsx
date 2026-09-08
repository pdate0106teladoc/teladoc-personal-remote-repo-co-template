import React, { useState } from "react";
import { FaTriangleExclamation } from "react-icons/fa6";
import { Button, CustomCheckbox, DatePicker, Modal } from "@ucc/common-ui";
import "./UpdatePlannedLaunchDateModal.scss";

interface UpdatePlannedLaunchDateModalProps {
  show: boolean;
  handleClose: () => void;
  plannedLaunchDate: string;
  onUpdate: (newDate: Date) => void;
}

const UpdatePlannedLaunchDateModal: React.FC<
  UpdatePlannedLaunchDateModalProps
> = ({ show, handleClose, plannedLaunchDate, onUpdate }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleUpdate = () => {
    if (selectedDate && isConfirmed) {
      onUpdate(selectedDate);
      handleClose();
    }
  };

  const handleModalClose = () => {
    setSelectedDate(null);
    setIsConfirmed(false);
    handleClose();
  };

  return (
    <Modal
      show={show}
      onHide={handleModalClose}
      title="Update planned launch date"
      dialogClassName="update-launch-date-modal"
      footer={
        <div className="d-flex flex-row w-100 justify-content-between">
          <Button className="signin-button" onClick={handleModalClose}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={!selectedDate || !isConfirmed}
          >
            Update
          </Button>
        </div>
      }
    >
      <div className="modal-content-wrapper">
        <div className="warning-banner">
          <FaTriangleExclamation />
          <div className="warning-text">
            <strong>Planned launch date is in the past</strong>
            <span>
              The planned launch date ({plannedLaunchDate}) has already passed.
              Select a new launch date to continue.
            </span>
          </div>
        </div>

        <DatePicker
          label="Planned launch date"
          isRequired
          value={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          disablePastDates
          placeholder="Select a date..."
        />

        <div className="confirm-section">
          <span className="confirm-text">
            By confirming, the configuration will be launched on the selected date.
          </span>
          <div className="confirm-checkbox">
            <CustomCheckbox
              checked={isConfirmed}
              onChange={(checked) => setIsConfirmed(checked)}
              size="lg"
            />
            <label className="check-label" htmlFor="custom-checkbox">
              Confirm the new planned launch date.
              <span className="required">&nbsp;*</span>
            </label>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default UpdatePlannedLaunchDateModal;
