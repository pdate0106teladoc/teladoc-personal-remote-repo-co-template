import * as React from "react";
import { Button, Modal } from "@ucc/common-ui";
import { DustbinIcon } from "@/assets";
import "./DeleteTemplateModal.scss";

interface DeleteTemplateModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
}

const DeleteTemplateModal: React.FC<DeleteTemplateModalProps> = ({
  show,
  onHide,
  onConfirm,
}) => (
  <Modal
    show={show}
    onHide={onHide}
    title="Remove template?"
    backdrop="static"
    dialogClassName="delete-template-modal"
    size="md"
    footer={
      <div className="delete-template-footer">
        <Button variant="secondary" onClick={onHide}>
          Keep template
        </Button>
        <Button
          className="delete-template-btn"
          variant="danger"
          onClick={onConfirm}
        >
          <DustbinIcon aria-hidden />
          Delete template
        </Button>
      </div>
    }
  >
    <p className="delete-template-description">
      Are you sure you want to remove this template ? This action can't be
      undone.
    </p>
  </Modal>
);

export default DeleteTemplateModal;
