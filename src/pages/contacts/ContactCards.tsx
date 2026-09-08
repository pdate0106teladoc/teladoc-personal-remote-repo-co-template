import { DustbinIcon, EditIndicatorIcon, MailIcon, PhoneIcon } from "@/assets";
import CreateContactDrawer from "./ContactOpsDrawer";
import { getSafeString, phoneFormat } from "@/utils";
import "./ContactCards.scss";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import ContactDetails from "@/components/sidebar/ContactDetailsSidebar";
import { API_ENDPOINTS, ERROR_MESSAGES, ToastType, TOOLTIP_MESSAGES } from "@/constants";
import api from "@/api/apiService";
import { Button, Modal, renderTooltip, showCustomToast, SideModal, WarningIcon } from "@ucc/common-ui";
import { OverlayTrigger } from "react-bootstrap";

interface Props {
    data: contact;
    isEdit?: boolean;
    idOpen?: boolean;
    onRefetch?: () => void;
}

export interface contact {
    id: string;
    contactId: string;
    fullName: string;
    title: string;
    primaryEmail: string;
    primaryPhone: string;
    organization: Record<string, any>;
    group: Record<string, any>;
    contactTypes: string[];
}

const ContactCards: React.FC<Props> = ({ data, isEdit, idOpen, onRefetch }) => {
    const [contactDetailsTab, setContactDetailsTab] = useState<"contactInfo" | "organizations" | "groups" | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showEditDrawer, setShowEditDrawer] = useState(false);
    const [removing, setRemoving] = useState(false);
    const editUrl = import.meta.env.VITE_EDIT_URL ?? "";
    const location = useLocation();
    const { id: entityId } = useParams<{ id: string }>();
    const entityType = location.pathname.includes("org-detail") ? "ORGANIZATION" : "GROUP";
    const entityLabel = entityType === "ORGANIZATION" ? "org" : "group";

    const handleConfirmDelete = async () => {
        setDeleting(true);
        try {
            await api.delete(`${editUrl}${API_ENDPOINTS.contact}/${data.id}`);
            setShowDeleteModal(false);
            showCustomToast({ type: ToastType.Success, title: "Contact removed" });
            onRefetch?.();
        } catch {
            showCustomToast({ type: ToastType.Error, title: "Failed", message: ERROR_MESSAGES.SOMETHINGS_WRONG });
        } finally {
            setDeleting(false);
        }
    };

    const handleRemoveFromEntity = async () => {
        setRemoving(true);
        try {
            await api.patch(
                `${editUrl}client-configurations/${entityType}/${entityId}/contact-relations`,
                {
                    remove: [
                        {
                            contactId: data.contactId,
                            contactTypes: data.contactTypes ?? [],
                        },
                    ],
                }
            );
            setShowDeleteModal(false);
            showCustomToast({
                type: ToastType.Success,
                title: `Contact removed from current ${entityLabel}`
            });
            onRefetch?.();
        } catch {
            showCustomToast({
                type: ToastType.Error,
                title: "Failed",
                message: ERROR_MESSAGES.SOMETHINGS_WRONG
            });
        } finally {
            setRemoving(false);
        }
    };
    useEffect(() => {
        if (idOpen) {
            setContactDetailsTab("contactInfo")
        }
    }, [idOpen]);

    const sanitizeData = (data: any) => {
        if (idOpen) {
            const organizationList: string[] = data?.organizations?.length ? [data?.organizations[0]?.organizationName] : [];
            const organizationCount: number = data?.organizationsTotal ?? data?.organizations?.length ?? 0;
            const groupList: string[] = data?.groups?.length ? [data?.groups[0]?.groupName] : [];
            const groupCount: number = data?.groupsTotal ?? data?.groups?.length ?? 0;
            return {
                ...data,
                "organization": {
                    "organizationCount": organizationCount,
                    "organizationList": organizationList,
                },
                "group": {
                    "groupCount": groupCount,
                    "groupList": groupList,
                },
                "contactTypes": data?.contactTypes ?? [],
            }
        }
        else
            return data;
    };
    const finalData: contact = sanitizeData(data);
    const withDisabledTooltip = (button: React.ReactNode, tooltipId: string) =>
        isEdit ? (
            <OverlayTrigger
                placement="top"
                overlay={renderTooltip(TOOLTIP_MESSAGES.EDIT_DISABLED, tooltipId)}
            >
                <span className="d-inline-block">{button}</span>
            </OverlayTrigger>
        ) : (
            button
        );

    return (
        <div className={`contact-summary-card d-flex flex-row justify-content-between ${isEdit ? "editting-mode" : ""}`}>
            <div className="contact-action-btns">
                {withDisabledTooltip(
                    <Button
                        variant="secondary"
                        className="contact-edit-btn"
                        aria-label="Edit contact"
                        onClick={(e) => { e.stopPropagation(); setShowEditDrawer(true); }}
                        disabled={isEdit}
                    >
                        <EditIndicatorIcon /> &nbsp; Edit
                    </Button>,
                    "contact-edit-tooltip"
                )}
                {withDisabledTooltip(
                    <Button
                        variant="secondary"
                        className="contact-delete-btn"
                        aria-label="Remove contact"
                        onClick={(e) => { e.stopPropagation(); setShowDeleteModal(true); }}
                        disabled={isEdit}
                    >
                        <DustbinIcon /> &nbsp; Delete
                    </Button>,
                    "contact-remove-tooltip"
                )}
            </div>
            <div className="left-section">
                <div className="title-section d-flex flex-column align-items-start" onClick={() => setContactDetailsTab("contactInfo")}>
                    <h6 className="contact-name">{finalData.fullName}</h6>
                    <span className="contact-title">{finalData.title}</span>
                </div>

                <div className="contact-info">
                    <div className="info-item">
                        <MailIcon className="icon" />
                        <a className="mail-link no-wrap" href={`mailto:${finalData?.primaryEmail}`}>
                            {finalData?.primaryEmail}
                        </a>
                    </div>
                    <div className="info-item">
                        <PhoneIcon className="icon" />
                        <span>{phoneFormat(finalData.primaryPhone)}</span>
                    </div>
                </div>
            </div>
            <div className="right-section">
                <div className="detail-row">
                    <span className="detail-label">Organization</span>
                    <span className="detail-value">
                        {finalData?.organization?.organizationCount > 1 ? (
                            <>
                                {finalData?.organization?.organizationList[0]} <span className="more-text" onClick={() => setContactDetailsTab("organizations")}>+ {finalData?.organization?.organizationCount - 1} more</span>
                            </>
                        ) : getSafeString(finalData?.organization?.organizationList[0])}
                    </span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">Group</span>
                    <span className="detail-value">
                        {finalData?.group?.groupCount > 1 ? (
                            <>
                                {finalData?.group?.groupList[0]} <span className="more-text" onClick={() => setContactDetailsTab("groups")}>+ {finalData?.group?.groupCount - 1} more</span>
                            </>
                        ) : getSafeString(finalData?.group?.groupList[0])}
                    </span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">Contact type</span>
                    <span className="detail-value">{finalData?.contactTypes?.length ? finalData?.contactTypes?.join(", ") : "-"}</span>
                </div>
            </div>
            <SideModal
                title={finalData.fullName}
                show={contactDetailsTab != null}
                onHide={() => setContactDetailsTab(null)}
            >
                {contactDetailsTab && (
                    <ContactDetails tabKey={contactDetailsTab} mongoId={data.id} contactId={data.contactId} />
                )}
            </SideModal>
            <SideModal
                show={showEditDrawer}
                onHide={() => {
                    setShowEditDrawer(false);
                    onRefetch?.();
                }}
                title={`Edit contact: ${finalData.fullName}`}
            >
                <CreateContactDrawer
                    onHide={() => {
                        setShowEditDrawer(false);
                        onRefetch?.();
                    }}
                    editMode={true}
                    mongoId={data.id}
                    contactId={data.contactId}
                />
            </SideModal>
            <Modal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                title="Remove contact?"
                backdrop="static"
                dialogClassName="remove-contact-modal"
                size="md"
                footer={
                    <div className="remove-contact-footer">
                        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                            Keep contact
                        </Button>
                        <div className="d-flex flex-row gap-2">
                            <Button
                                variant="secondary"
                                onClick={handleRemoveFromEntity}
                                disabled={removing || deleting}
                            >
                                {`Remove from current ${entityLabel}`}
                            </Button>
                            <Button
                                className="remove-contact-delete-btn"
                                onClick={handleConfirmDelete}
                                disabled={removing || deleting}
                                variant="danger"
                            >
                                <DustbinIcon />
                                &nbsp;{"Delete contact"}
                            </Button>
                        </div>
                    </div>
                }
            >
                <div className="remove-contact-warning">
                    <WarningIcon aria-hidden />
                    <span>Removing a contact with active associations may affect org and group settings.</span>
                </div>
                <p className="remove-contact-description">
                    This contact will be removed. This action can't be undone.
                </p>
            </Modal>
        </div>
    );
};

export default ContactCards;
