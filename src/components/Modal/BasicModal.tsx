import React, { useEffect, useState } from "react";
import { Modal, Button } from "@ucc/common-ui";
import "./BasicModal.scss";

interface BasicModalProps {
  title: string;
  content: any;
  show: boolean;
  button1?: string;
  button2?: string;
  handleClose: () => void;
  /** May be async; the confirm button stays disabled until it settles. */
  onBtnClick2?: () => void | Promise<void>;
}

const BasicModal: React.FC<BasicModalProps> = ({
  title,
  content,
  button1,
  button2,
  show,
  handleClose,
  onBtnClick2,
}) => {
  const [busy, setBusy] = useState(false);

  // Re-enable on reopen so a failed action can be retried.
  useEffect(() => {
    if (show) setBusy(false);
  }, [show]);

  // Guards against a second click firing the action again while it is in flight.
  const handleBtnClick2 = async () => {
    if (busy || !onBtnClick2) return;
    setBusy(true);
    try {
      await onBtnClick2();
    } finally {
      setBusy(false);
    }
  };

  const footer =
    button1 || button2 ? (
      <div className="footer">
        {button1 && (
          <Button className="signin-button" onClick={handleClose}>
            {button1}
          </Button>
        )}
        {button2 && (
          <Button onClick={handleBtnClick2} disabled={busy}>
            {button2}
          </Button>
        )}
      </div>
    ) : undefined;

  return (
    <Modal
      show={show}
      onHide={handleClose}
      title={title}
      dialogClassName="basic-modal"
      footer={footer}
    >
      <span>{content}</span>
    </Modal>
  );
};

export default BasicModal;
