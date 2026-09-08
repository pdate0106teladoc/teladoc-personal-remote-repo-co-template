import React, { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Button, FailSafePage, Loader, showCustomToast, ToastType } from "@ucc/common-ui";
import { Tabs, Tab } from "react-bootstrap";
import ContactBasicForm from "./ContactBasicForm";
import EditContactBasicForm from "./EditContactBasicForm";
import { BasicFormValues, BasicFormErrors, INITIAL_BASIC_FORM } from "./types/contactBasicFormTypes";
import "./CreateContactDrawer.scss";
import { isAxiosError } from "axios";
import api from "@/api/apiService";
import { API_ENDPOINTS, EMAIL_REGEX } from "@/constants";
import { extractEntityData } from "@/utils";
import ContactEntityTable from "@/components/ContactEntityTable/ContactEntityTable";

function validateBasicForm(values: BasicFormValues): BasicFormErrors {
    const errors: BasicFormErrors = {};
    if (!values.name.trim()) {
        errors.name = "Name is required.";
    } else if (values.name.trim().length < 2) {
        errors.name = "Name must be at least 2 characters.";
    }
    if (values.phone.trim()) {
        if (/\D/.test(values.phone)) {
            errors.phone = "Phone must contain digits only.";
        } else if (values.phone.length !== 10) {
            errors.phone = "Phone must be exactly 10 digits.";
        }
    }
    if (!values.email.trim()) {
        errors.email = "Email is required.";
    } else if (!EMAIL_REGEX.test(values.email.trim())) {
        errors.email = "Enter a valid email address.";
    }
    if (!!values.zip && values.zip.length !== 5) {
        errors.zip = "ZIP/Postal code must be exactly 5 digits.";
    }
    return errors;
}

function buildBasicFormValues(d: any, editMode: boolean, meta?: any): BasicFormValues {
    const addr = d?.addresses?.[0];
    let roles: Record<string, boolean>;
    if (editMode) {
        const allowedRoles: string[] = meta?.contactRole?.allowedValues ?? [];
        const baseRoles = allowedRoles.reduce<Record<string, boolean>>((acc, r) => {
            acc[r] = false; return acc;
        }, {});
        const selectedRoles: string[] = Array.isArray(d?.contactRole)
            ? d.contactRole
            : Array.isArray(d?.contactRole?.value)
                ? d.contactRole.value
                : [];
        roles = selectedRoles.reduce<Record<string, boolean>>((acc, r) => {
            acc[r] = true; return acc;
        }, baseRoles);
    } else {
        const selectedRoles: string[] = Array.isArray(d?.contactRole) ? d.contactRole : [];
        roles = selectedRoles.reduce<Record<string, boolean>>((acc, r) => {
            acc[r] = true; return acc;
        }, { ...INITIAL_BASIC_FORM.roles });
    }
    return {
        name: d?.name ?? "",
        email: d?.email ?? "",
        title: d?.title ?? "",
        phone: (d?.phone ?? "").replace(/\D/g, ""),
        street: addr?.street ?? "",
        city: addr?.city ?? "",
        state: addr?.state ?? "",
        zip: addr?.postalCode ?? "",
        county: addr?.county ?? "",
        roles,
    };
}

interface ContactOpsDrawerProps {
    onHide: () => void;
    prefillValues?: { name?: string; email?: string };
    editMode?: boolean;
    contactId?: string;
    mongoId?: string;
    entityType?: "ORGANIZATION" | "GROUP";
    entityId?: string | null;
    editName?: string;
}

const TAB_KEYS = ["contactInfo", "org", "grp"] as const;
type TabKey = typeof TAB_KEYS[number];

const ContactOpsDrawer: React.FC<ContactOpsDrawerProps> = ({ onHide, prefillValues, editMode = false, contactId, mongoId, entityType: entityTypeProp, entityId: entityIdProp, editName }) => {
    const [activeTab, setActiveTab] = useState<TabKey>("contactInfo");
    const [basicForm, setBasicForm] = useState<BasicFormValues>({
        ...INITIAL_BASIC_FORM,
        name: prefillValues?.name ?? "",
        email: prefillValues?.email ?? "",
    });
    const [basicErrors, setBasicErrors] = useState<BasicFormErrors>({});
    const originalBasicFormRef = useRef<BasicFormValues | null>(null);
    const [loading, setLoading] = useState(false);
    const editUrl = import.meta.env.VITE_EDIT_URL ?? "";
    const location = useLocation();
    const { id: entityIdFromUrl } = useParams<{ id: string }>();
    const entityId = entityIdProp ?? entityIdFromUrl;
    const entityType = entityTypeProp ?? (location.pathname.includes("org-detail") ? "ORGANIZATION" : "GROUP");
    const [newContactId, setNewContactId] = useState<string>("");
    const [fieldMeta, setFieldMeta] = useState<Record<string, any>>({});
    const [loadError, setLoadError] = useState(false);
    const isSubmittingRef  = useRef(false);
    const hasChange = (() => {
        if (!editMode || !originalBasicFormRef.current) return true;
        const orig = originalBasicFormRef.current;
        const stringsChanged = (["name", "title", "phone", "email", "street", "city", "county", "state", "zip"] as const)
            .some(k => basicForm[k].trim() !== orig[k].trim());
        const rolesChanged = Object.keys({ ...basicForm.roles, ...orig.roles })
            .some(k => basicForm.roles[k] !== orig.roles[k]);
        return stringsChanged || rolesChanged;
    })();
    const displayErrors: BasicFormErrors = (editMode && editName && editName.trim() !== basicForm.name.trim())
        ? { ...basicErrors, name: "The contact name you entered doesn't match the existing record." }
        : basicErrors;

    const getContactInfo = async (editMode: boolean, mongoId: string) => {
        if (editMode) {
            const editResponse: any = await api.get(`${editUrl}${API_ENDPOINTS.metadata}/contacts/${mongoId}`);
            const meta = editResponse?.data ?? editResponse;
            setFieldMeta(meta ?? {});
            const loaded = buildBasicFormValues(extractEntityData(meta), true, meta);
            setBasicForm(loaded);
            originalBasicFormRef.current = loaded;
        }
        else {
            const normResponse: any = await api.get(`${API_ENDPOINTS.contact}/${mongoId}`);
            const d = normResponse?.data ?? normResponse;
            const loaded = buildBasicFormValues(d, false);
            setBasicForm(loaded);
            originalBasicFormRef.current = loaded;
        }
    }

    useEffect(() => {
        if (!editMode || !mongoId) return;
        setLoading(true);
        setLoadError(false);
        getContactInfo(editMode, mongoId)
            .catch(() => {
                setLoadError(true);
                showCustomToast({
                    type: ToastType.Error,
                    title: "Failed",
                    message: "Could not load contact details.",
                });
            })
            .finally(() => setLoading(false));
    }, [editMode, mongoId]);

    const handleBasicChange = (
        field: keyof BasicFormValues,
        value: string | Record<string, boolean>
    ) => {
        const nextValue =
            field === "zip" && typeof value === "string"
                ? value.replace(/\D/g, "").slice(0, 5)
                : value;
        setBasicForm((prev) => ({ ...prev, [field]: nextValue }));
        if (field === "phone" && typeof value === "string") {
            setBasicErrors((prev) => ({
                ...prev,
                phone: value && /\D/.test(value) ? "Phone must contain digits only." : undefined,
            }));
            return;
        }
        if (field in basicErrors) {
            setBasicErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const handleHide = () => {
        setActiveTab("contactInfo");
        setBasicForm(INITIAL_BASIC_FORM);
        setBasicErrors({});
        onHide();
    };

    const handleSave = async () => {
        if (activeTab === "contactInfo") {
            const errors = validateBasicForm(basicForm);
            if (Object.keys(errors).length > 0) {
                setBasicErrors(errors);
                return;
            }
            if (isSubmittingRef .current) return;
            isSubmittingRef .current = true;
            setLoading(true);
            const contactRole: string[] = Object.keys(basicForm.roles).filter((r) => basicForm.roles[r]);
            const address = {
                type: "MAILING",
                streetAddress: basicForm.street,
                city: basicForm.city,
                county: basicForm.county,
                state: basicForm.state,
                zip: basicForm.zip,
            }
            const payload = {
                name: basicForm.name.trim(),
                email: basicForm.email.trim(),
                title: basicForm.title,
                contactRole,
                phone: basicForm.phone,
                addresses: [address]
            };
            try {
                if (editMode) {
                    await api.patch(`${editUrl}${API_ENDPOINTS.contact}/${mongoId}`, payload);
                    originalBasicFormRef.current = { ...basicForm };
                    setActiveTab("org");
                } else {
                    const res: any = await api.post(`${editUrl}${API_ENDPOINTS.contact}`, payload);
                    const createdId = res?.data?.contactId ?? res?.contactId;
                    setNewContactId(createdId);
                    if (createdId) {
                        await api.patch(`${editUrl}client-configurations/${entityType}/${entityId}/contact-relations`, {
                            add: [
                                {
                                    contactId: createdId,
                                    contactTypes: []
                                }
                            ]
                        });
                        setActiveTab("org");
                    }
                }
            } catch (err: unknown) {
                const apiErrorCode = isAxiosError(err)
                    ? (err.response?.data as { error?: string } | undefined)?.error
                    : undefined;
                if (apiErrorCode === "EMAIL_ALREADY_EXISTS") {
                    setBasicErrors((prev) => ({ ...prev, email: "A contact with this email already exists." }));
                    setActiveTab("contactInfo");
                } else {
                    showCustomToast({
                        type: ToastType.Error,
                        title: "Failed",
                        message: "Something went wrong. Please try again.",
                    });
                }
            } finally {
                setLoading(false);
                isSubmittingRef .current = false;
            }
            return;
        }
        handleHide();
    };

    const isSaveDisabled =
        (!editMode && newContactId.length > 0) ||
        loading ||
        (activeTab === "contactInfo" &&
            (!basicForm.name.trim() ||
                !basicForm.email.trim() ||
                !hasChange));

    return (
        <div className="create-contact-drawer">
            {loading ? (
                <Loader text="loading..." />
            ) : (
                <div className="create-contact-drawer__content">
                    <Tabs
                        id="create-contact-tabs"
                        activeKey={activeTab}
                        onSelect={(k) => setActiveTab((k as TabKey) ?? "contactInfo")}
                        className="mb-3"
                        mountOnEnter
                    >
                        <Tab eventKey="contactInfo" title={`${editMode ? "Edit c" : "C"}ontact information`}>
                            {editMode && loadError ? (
                                <FailSafePage cardType="dataFailed" />
                            ) : editMode ? (
                                <EditContactBasicForm
                                    values={basicForm}
                                    errors={displayErrors}
                                    metadata={fieldMeta}
                                    onChange={handleBasicChange}
                                />
                            ) : (
                                <ContactBasicForm
                                    values={basicForm}
                                    errors={displayErrors}
                                    onChange={handleBasicChange}
                                />
                            )}
                        </Tab>
                        <Tab eventKey="org" title="View organizations">
                            <div className="tab-content-section mt-3 custom-table-wrapper">
                                <ContactEntityTable type="organization" contactId={editMode ? contactId : newContactId} />
                            </div>
                        </Tab>
                        <Tab eventKey="grp" title="View groups">
                            <div className="tab-content-section mt-3">
                                <ContactEntityTable type="group" contactId={editMode ? contactId : newContactId} />
                            </div>
                        </Tab>
                    </Tabs>
                </div>
            )}
            {activeTab === "contactInfo" && (
                <div className="create-contact-drawer__footer">
                    <Button variant="primary" onClick={handleSave} disabled={isSaveDisabled}>
                        Save
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ContactOpsDrawer;
