import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { isAxiosError } from "axios";
import { Button, CustomInput, Modal, showCustomToast, ToastType } from "@ucc/common-ui";
import api from "@/api/apiService";
import { ErrorIcon } from "@/assets";
import { API_ENDPOINTS, ERROR_MESSAGES, LABELS, VALIDATION_REGEX } from "@/constants";
import { GRP_DETAIL_PATH } from "@/router/routes";
import "./CreateReportContactModal.scss";

interface CreateReportContactModalProps {
  show: boolean;
  /** Email typed into the lookup; the starting value of the email field. */
  initialEmail: string;
  /** Recipient field that opened the modal — names the primary action. */
  recipientLabel: string;
  onHide: () => void;
  onBackToSearch: () => void;
  onCreated: (contact: { email: string; name: string }) => void;
}

const reportingLabels = LABELS.reporting;

/**
 * Create-contact step for a report being added.
 *
 * The saved reports open the full `AddContactModal` flow (duplicate check, then
 * the contact drawer); a report still being drafted collects just the email and
 * name here and posts to the same create-contact endpoints, so the user can carry
 * on filling the report.
 */
const CreateReportContactModal: React.FC<CreateReportContactModalProps> = ({
  show,
  initialEmail,
  recipientLabel,
  onHide,
  onBackToSearch,
  onCreated,
}) => {
  const { id = "" } = useParams<{ id: string }>();
  const location = useLocation();
  const entityType = location.pathname.startsWith(GRP_DETAIL_PATH)
    ? "GROUP"
    : "ORGANIZATION";
  const editUrl = import.meta.env.VITE_EDIT_URL ?? "";

  const [email, setEmail] = useState(initialEmail);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailError, setEmailError] = useState("");
  const [saving, setSaving] = useState(false);

  // Reopening for a different search term starts from that term.
  useEffect(() => {
    if (!show) return;
    setEmail(initialEmail);
    setFirstName("");
    setLastName("");
    setEmailError("");
  }, [show, initialEmail]);

  const validate = (trimmedEmail: string): boolean => {
    if (!trimmedEmail) {
      setEmailError(reportingLabels.CONTACT_EMAIL_REQUIRED);
      return false;
    }
    if (!VALIDATION_REGEX.EMAIL.test(trimmedEmail)) {
      setEmailError(reportingLabels.CONTACT_EMAIL_INVALID);
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleCreate = async () => {
    const trimmedEmail = email.trim();
    if (!validate(trimmedEmail) || saving) return;

    // Per the note above the form, an unnamed contact displays as its email.
    const name =
      [firstName.trim(), lastName.trim()].filter(Boolean).join(" ") || trimmedEmail;

    setSaving(true);
    try {
      const res: any = await api.post(`${editUrl}${API_ENDPOINTS.contact}`, {
        name,
        email: trimmedEmail,
        contactRole: [],
      });
      const createdId = res?.data?.contactId ?? res?.contactId;

      if (createdId && id) {
        await api.patch(
          `${editUrl}client-configurations/${entityType}/${id}/contact-relations`,
          { add: [{ contactId: createdId, contactTypes: [] }] },
        );
      }

      onCreated({ email: trimmedEmail, name });
    } catch (err: unknown) {
      const apiErrorCode = isAxiosError(err)
        ? (err.response?.data as { error?: string } | undefined)?.error
        : undefined;

      if (apiErrorCode === "EMAIL_ALREADY_EXISTS") {
        setEmailError(reportingLabels.CONTACT_EMAIL_EXISTS);
      } else {
        showCustomToast({
          type: ToastType.Error,
          title: "Failed",
          message: ERROR_MESSAGES.SOMETHINGS_WRONG,
        });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      title={reportingLabels.CREATE_NEW_CONTACT}
      backdrop="static"
      dialogClassName="create-report-contact-modal"
      size="md"
      footer={
        <div className="create-report-contact-footer">
          <Button variant="secondary" onClick={onBackToSearch} disabled={saving}>
            {reportingLabels.BACK_TO_SEARCH}
          </Button>
          <Button
            variant="primary"
            onClick={handleCreate}
            disabled={!email.trim() || saving}
          >
            {`${reportingLabels.CREATE_AND_ADD_TO} “${recipientLabel}”`}
          </Button>
        </div>
      }
    >
      <div className="create-report-contact-note">
        <ErrorIcon className="create-report-contact-note-icon" aria-hidden />
        <span>
          <strong>{reportingLabels.CONTACT_NOTE_TITLE}</strong>
          {reportingLabels.CONTACT_NOTE_MESSAGE}
        </span>
      </div>
      <div className="create-report-contact-form">
        <CustomInput
          className="input-style"
          id="create-report-contact-email"
          name="create-report-contact-email"
          label={reportingLabels.EMAIL}
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (e.target.value.trim()) setEmailError("");
          }}
          error={emailError}
          autoComplete="off"
        />
        <div className="create-report-contact-names">
          <CustomInput
            className="input-style"
            id="create-report-contact-first-name"
            name="create-report-contact-first-name"
            label={reportingLabels.FIRST_NAME}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="off"
          />
          <CustomInput
            className="input-style"
            id="create-report-contact-last-name"
            name="create-report-contact-last-name"
            label={reportingLabels.LAST_NAME}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="off"
          />
        </div>
      </div>
    </Modal>
  );
};

export default CreateReportContactModal;
