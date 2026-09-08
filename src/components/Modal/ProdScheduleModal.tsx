import { CustomRadioToggle, DatePicker, Button, CustomCheckbox } from "@ucc/common-ui";
import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { FaTriangleExclamation } from "react-icons/fa6";
import "./ProdScheduleModal.scss";
import { formatUTCtoDateOnly, isDateInPast } from "@/utils";

function buildTodayUtcDate(): Date {
    const now = new Date();
    return new Date(
        Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate(),
            now.getUTCHours(),
            now.getUTCMinutes(),
            now.getUTCSeconds(),
            now.getUTCMilliseconds(),
        ),
    );
}

function isSameUtcDayAsToday(isoDate: string): boolean {
    if (!isoDate) return false;
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return false;
    const now = new Date();
    return (
        d.getUTCFullYear() === now.getUTCFullYear() &&
        d.getUTCMonth() === now.getUTCMonth() &&
        d.getUTCDate() === now.getUTCDate()
    );
}

const ProdScheduleModal = ({ show, onClose, schedule, taskPlannedLaunchDate }: {
    show: boolean;
    onClose: () => void;
    schedule?: any;
    taskPlannedLaunchDate?: string;
}) => {
    const [launchOption, setLaunchOption] = useState<"today" | "later" | "">("");
    const [plannedLaunchDate, setPlannedLaunchDate] = useState<string>("");
    const [isConfirmed, setIsConfirmed] = useState<boolean>(false);

    useEffect(() => {
        if (!show) return;
        setPlannedLaunchDate(taskPlannedLaunchDate ?? "");
        setLaunchOption(
            taskPlannedLaunchDate
                ? (isSameUtcDayAsToday(taskPlannedLaunchDate) ? "today" : "later")
                : "",
        );
        setIsConfirmed(false);
    }, [show, taskPlannedLaunchDate]);
    
    const handleCheckboxChange = (checked: boolean) => {
        setIsConfirmed(checked);
    };
    const handleClose = () => {
        setLaunchOption("");
        setPlannedLaunchDate("");
        setIsConfirmed(false);
        onClose();
    }

    return (
        <Modal
            show={show}
            onHide={handleClose}
            centered
            dialogClassName="prod-schedule-modal"
        >
            <Modal.Header closeButton>
                <Modal.Title>Schedule for production</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="modal-content-wrapper">
                    {isDateInPast(taskPlannedLaunchDate) && (
                        <div className="warning-banner">
                            <FaTriangleExclamation />
                            <div className="warning-text">
                                <strong>Planned launch date is in the past</strong>
                                <span>
                                    The planned launch date ({formatUTCtoDateOnly(taskPlannedLaunchDate)}) has already
                                    passed. Select a new launch date to continue.
                                </span>
                            </div>
                        </div>
                    )}
                    <div className="launch-option-section d-flex flex-column gap-2">
                        <label className="launch-option-label">
                            Launch date
                            <span className="required"> *</span>
                        </label>
                        <CustomRadioToggle
                            name="launch-option"
                            value={launchOption}
                            onChange={(value) => {
                                const option = value as "today" | "later" | "";
                                setLaunchOption(option);
                                if (option === "today") {
                                    setPlannedLaunchDate(buildTodayUtcDate().toISOString());
                                } else if (option === "later") {
                                    setPlannedLaunchDate("");
                                }
                            }}
                            options={[
                                {
                                    label: (
                                        <span className="launch-option-text">
                                            <strong>Now</strong> - send it to production immediately
                                        </span>
                                    ) as unknown as string,
                                    value: "today",
                                },
                                {
                                    label: (
                                        <span className="launch-option-text">
                                            <strong>Schedule for later</strong> - select a future date to
                                            go to production
                                        </span>
                                    ) as unknown as string,
                                    value: "later",
                                },
                            ]}
                        />
                        {launchOption === "later" && (
                            <DatePicker
                                value={plannedLaunchDate ? new Date(plannedLaunchDate) : null}
                                disablePastAndTodayDates={true}
                                onChange={(date) =>
                                    setPlannedLaunchDate(date ? date.toISOString() : "")
                                }
                                label=""
                                placeholder=" "
                                isRequired
                                customClass="input-w-190 date-picker-later"
                                exactUtcTime={true}
                            />
                        )}
                    </div>
                    <div className="confirm-section">
                        <span className="confirm-text">
                            By confirming, the configuration will be sent to production.
                        </span>
                        <div className="confirm-checkbox">
                            <CustomCheckbox
                                checked={isConfirmed}
                                onChange={handleCheckboxChange}
                                size="lg"
                            />
                            <label className="check-label">
                                Confirm to send it to production.<span className="required">&nbsp;*</span>
                            </label>
                        </div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <div className="footer d-flex flex-row justify-content-between w-100">
                    <Button className="signin-button" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        disabled={!launchOption ||
                            (launchOption === "later" && !plannedLaunchDate) ||
                            isDateInPast(plannedLaunchDate) ||
                            !isConfirmed}
                        onClick={() => {
                            schedule(plannedLaunchDate);
                            handleClose();
                        }}
                    >
                        Schedule
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default ProdScheduleModal;
