import React, { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Button, CustomInput, CustomRadioToggle, Loader, Modal, SearchBar, showCustomToast, SideModal, ToastType } from "@ucc/common-ui";
import { ErrorIcon } from "@/assets";
import CreateContactDrawer from "./ContactOpsDrawer";
import api from "@/api/apiService";
import "./AddContactModal.scss";
import { API_ENDPOINTS } from "@/constants";

type ModalView = "add" | "associate" | "existing-same-org" | "existing-other-org" | "no-match";

interface AddContactModalProps {
    show: boolean;
    onHide: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AddContactModal: React.FC<AddContactModalProps> = ({ show, onHide }) => {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const entityType = location.pathname.includes("org-detail") ? "ORGANIZATION" : "GROUP";
    const isSearchPage = location.pathname.includes("search-results");
    const [view, setView] = useState<ModalView>("add");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [nameError, setNameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [showCreateContact, setShowCreateContact] = useState(false);
    const [loading, setLoading] = useState(false);
    const [contactId, setContactId] = useState<string>("");
    const [mongoId, setMongoId] = useState<string>("");
    const [entityInfo, setEntityInfo] = useState<{ name: string | null, type: "ORGANIZATION" | "GROUP", id: string | null }>({ name: null, type: "ORGANIZATION", id: null });
    const editUrl = import.meta.env.VITE_EDIT_URL ?? "";
    const searchBaseUrl = import.meta.env.VITE_SEARCH_BASE_URL ?? "";

    const resetAndHide = () => {
        setView("add");
        setName("");
        setEmail("");
        setNameError("");
        setEmailError("");
        setEntityInfo({ name: null, type: "ORGANIZATION", id: null });
        setShowCreateContact(false);
        onHide();
    };

    const backToAdd = () => {
        setView("add");
        setEntityInfo({ name: null, type: "ORGANIZATION", id: null });
    };

    const validateFields = (): boolean => {
        let valid = true;
        if (!name.trim()) {
            setNameError("Name is required.");
            valid = false;
        } else if (name.trim().length < 2) {
            setNameError("Name must be at least 2 characters.");
            valid = false;
        } else {
            setNameError("");
        }
        if (!email.trim()) {
            setEmailError("Email is required.");
            valid = false;
        } else if (!EMAIL_REGEX.test(email.trim())) {
            setEmailError("Enter a valid email address.");
            valid = false;
        } else {
            setEmailError("");
        }
        return valid;
    };

    const runDuplicateCheck = async (entityCtx: { type: "ORGANIZATION" | "GROUP"; id: string }) => {
        setLoading(true);
        try {
            const res: any = await api.post(
                `${editUrl}client-configurations/${entityCtx.type}/${entityCtx.id}/contacts/duplicate-check`,
                { name: name.trim(), email: email.trim() }
            );
            const data = res?.data || res;
            const status = data?.status;
            setContactId(data?.contactId ?? "");
            setMongoId(data?.id ?? "");
            if (status === "DUPLICATE_IN_CURRENT_ORG") {
                setView("existing-same-org");
            } else if (status === "DUPLICATE_IN_OTHER_ORG") {
                setView("existing-other-org");
            } else if (status === "UNIQUE") {
                setView("no-match");
            }
        } catch {
            showCustomToast({
                type: ToastType.Error,
                title: "Failed",
                message: "Something went wrong. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleContinue = async () => {
        if (!validateFields()) return;
        if (isSearchPage) {
            setView("associate");
            return;
        }
        if (!id) {
            showCustomToast({
                type: ToastType.Error,
                title: "Failed",
                message: "Something went wrong. Please try again.",
            });
            return;
        }
        await runDuplicateCheck({ type: entityType, id });
    };

    const handleAssociateContinue = async () => {
        if (!entityInfo?.id) return;
        await runDuplicateCheck({ type: entityInfo.type, id: entityInfo.id });
    };

    const handleAddAndEdit = async () => {
        try {
            await api.patch(
                `${editUrl}client-configurations/${entityInfo?.id ? entityInfo.type : entityType}/${entityInfo?.id ?? id}/contact-relations`,
                {
                    add: [
                        {
                            contactId,
                            contactTypes: [],
                        },
                    ],
                }
            );
            setShowCreateContact(true);
        } catch {
            showCustomToast({
                type: ToastType.Error,
                title: "Failed",
                message: "Something went wrong. Please try again.",
            });
        }
    };

    const isContinueDisabled = !name.trim() || !email.trim();

    if (view === "associate") {
        return (
            <>
                <Modal
                    show={show && !showCreateContact}
                    onHide={resetAndHide}
                    title="Associate contact to org/group"
                    backdrop="static"
                    dialogClassName="add-contact-modal"
                    size="md"
                    footer={
                        <div className="add-contact-footer">
                            <Button variant="secondary" onClick={backToAdd}>
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleAssociateContinue}
                                disabled={!entityInfo?.id || !entityInfo?.name || loading}
                            >
                                Associate
                            </Button>
                        </div>
                    }
                >
                    <div className="mb-4 ms-3">
                        <CustomRadioToggle
                            name="entity-type"
                            value={entityInfo?.type ?? "ORGANIZATION"}
                            options={[
                                { label: "Org", value: "ORGANIZATION" },
                                { label: "Group", value: "GROUP" },
                            ]}
                            onChange={(value) => setEntityInfo({ name: null, id: null, type: value as "ORGANIZATION" | "GROUP" })}
                        />
                    </div>
                    <span className="input-label">
                        {`${entityInfo?.type === "GROUP" ? "Group" : "Org"} name/ID `}
                        <span className="required">*</span>
                    </span>
                    <div className="associate-searchbar-wrapper">
                        <SearchBar
                            type="md"
                            placeholder={entityInfo?.type === "GROUP" ? "Enter group name or group ID" : "Enter org name or org ID"}
                            api={api}
                            onChange={(e) => setEntityInfo((prev) => ({ ...prev, name: e.target.value, id: null }))}
                            value={entityInfo?.name ?? ""}
                            searchBaseUrl={searchBaseUrl}
                            suggestedSearchEndpoint={API_ENDPOINTS.suggestedSearch}
                            isAddContactFlow
                            allowedType={entityInfo?.type === "GROUP" ? "group" : "organization"}
                            onSuggestionClick={(item) => setEntityInfo({
                                ...entityInfo,
                                name: item.name ?? item.organizationName ?? item.groupName ?? null,
                                id: item.id ?? null,
                            })}
                        />
                    </div>
                </Modal>
            </>
        )
    }

    if (view === "existing-other-org") {
        return (
            <>
                <Modal
                    show={show && !showCreateContact}
                    onHide={resetAndHide}
                    title="The contact exists in another organization"
                    backdrop="static"
                    dialogClassName="add-contact-modal"
                    size="md"
                    footer={
                        <div className="add-contact-footer">
                            <Button variant="secondary" onClick={backToAdd}>
                                Back
                            </Button>
                            <Button variant="primary" onClick={handleAddAndEdit}>
                                Add and edit contact
                            </Button>
                        </div>
                    }
                >
                    <p className="add-contact-description">
                        A contact named <strong>{name}</strong> ({email}) exists in another
                        organization. Would you like to add this contact to the current organization?
                    </p>
                </Modal>
                <SideModal
                    show={showCreateContact}
                    onHide={resetAndHide}
                    title={`Edit contact: ${name}`}
                >
                    <CreateContactDrawer
                        onHide={resetAndHide}
                        editMode={true}
                        contactId={contactId}
                        mongoId={mongoId}
                        entityType={entityInfo?.id ? entityInfo.type : entityType}
                        entityId={entityInfo?.id ?? id}
                        editName={name.trim()}
                    />
                </SideModal>
            </>
        );
    }

    if (view === "no-match") {
        return (
            <>
                <Modal
                    show={show && !showCreateContact}
                    onHide={resetAndHide}
                    title="No matching contact found"
                    backdrop="static"
                    dialogClassName="add-contact-modal"
                    size="md"
                    footer={
                        <div className="add-contact-footer">
                            <Button variant="secondary" onClick={backToAdd}>
                                Back
                            </Button>
                            <Button variant="primary" onClick={() => setShowCreateContact(true)}>
                                Create new contact
                            </Button>
                        </div>
                    }
                >
                    <p className="add-contact-description">
                        No matching contact found. Would you like to create a new contact?
                    </p>
                </Modal>
                <SideModal
                    show={showCreateContact}
                    onHide={resetAndHide}
                    title="Create new contact"
                >
                    <CreateContactDrawer
                        onHide={resetAndHide}
                        prefillValues={{ name: name.trim(), email: email.trim() }}
                        entityType={entityInfo?.id ? entityInfo.type : entityType}
                        entityId={entityInfo?.id ?? id}
                    />
                </SideModal>
            </>
        );
    }

    return (
        <Modal
            show={show}
            onHide={resetAndHide}
            title="Add contact"
            backdrop="static"
            dialogClassName="add-contact-modal"
            size="md"
            footer={
                <div className="add-contact-footer">
                    <Button
                        variant="primary"
                        onClick={handleContinue}
                        disabled={isContinueDisabled || loading || view === "existing-same-org"}
                    >
                        Continue
                    </Button>
                </div>
            }
        >
            {(view === "existing-same-org" && !loading) && (
                <div className="add-contact-duplicate-banner">
                    <ErrorIcon className="add-contact-duplicate-icon" aria-hidden />
                    <span>
                        <strong>Duplicate with an existing contact in the current organization.</strong>
                        Please review and enter the correct information.
                    </span>
                </div>
            )}
            {loading ? <Loader text="loading..." /> : <div className="add-contact-form">
                <CustomInput
                    className="input-style"
                    id="add-contact-name"
                    name="add-contact-name"
                    label="Name"
                    required
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        if (e.target.value.trim()) setNameError("");
                    }}
                    error={nameError}
                    autoComplete="off"
                />
                <CustomInput
                    className="input-style"
                    id="add-contact-email"
                    name="add-contact-email"
                    label="Email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                        setView("add");
                        setEmail(e.target.value);
                        if (e.target.value.trim()) setEmailError("");
                    }}
                    error={emailError}
                    autoComplete="off"
                />
            </div>}
        </Modal>
    );
};

export default AddContactModal;
