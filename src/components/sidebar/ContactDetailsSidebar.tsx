import { phoneFormat } from "@/utils";
import { Tabs, Tab } from "react-bootstrap";
import "./ContactDetailsSidebar.scss"
import { ReactNode, useEffect, useState } from "react";
import { ERROR_MESSAGES, Loader, showCustomToast, ToastType } from "@ucc/common-ui";
import { API_ENDPOINTS } from "@/constants";
import api from "@/api/apiService";
import ContactEntityTable from "@/components/ContactEntityTable/ContactEntityTable";
import { contactDetails } from "@/pages/contacts/types/contactDetailsTypes";

interface InfoTabType {
    label: string;
    value: string | string[] | ReactNode;
}

const renderContactInfo = (data: InfoTabType[]) => {
    return data.map((item, idx) => {
        let value = item.value;
        if (Array.isArray(value)) {
            value = value.join(", ");
        }
        if (item.label.toLowerCase().includes("email")) {
            return (
                <div key={idx} className="d-flex flex-column mt-4 text-decoration-none">
                    <span className="info-label">{item.label}</span>
                    <span>
                        <a href={`mailto:${value}`} className="info-link">{value}</a>
                    </span>
                </div>
            );
        }
        if (item.label.toLowerCase().includes("phone")) {
            return (
                <div key={idx} className="d-flex flex-column mt-4">
                    <span className="info-label">{item.label}</span>
                    <span className="info-value">{item.label === "Phone" && typeof value === "string"
                        ? phoneFormat(value)
                        : value}</span>
                </div>
            );
        }
        return (
            <div key={idx} className="d-flex flex-column mt-4">
                <span className="info-label">{item.label}</span>
                <span className="info-value">{value}</span>
            </div>
        );
    });
};

const ContactDetails: React.FC<{ tabKey: string; mongoId: string; contactId: string; }> = ({ tabKey, mongoId, contactId }) => {
    const [detailsCache, setDetailsCache] = useState<Record<string, Partial<contactDetails>>>({});
    const [loading, setLoading] = useState<boolean>(false);

    const currentDetails = detailsCache[mongoId] ?? {};

    const fetchContactInfo = async () => {
        if (detailsCache[mongoId]?.contactInfo !== undefined) return;
        setLoading(true);
        try {
            const res: any = await api.get<any>(`${API_ENDPOINTS.contact}/${mongoId}`);
            const responseData = res?.data || res;
            setDetailsCache(prev => ({
                ...prev,
                [mongoId]: { ...prev[mongoId], contactInfo: responseData },
            }));
        } catch {
            showCustomToast({
                type: ToastType.Error,
                title: "Failed",
                message: ERROR_MESSAGES.SOMETHINGS_WRONG,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContactInfo();
    }, [mongoId]); // eslint-disable-line react-hooks/exhaustive-deps

    const infoTabData: InfoTabType[] = [
        { label: "Title", value: currentDetails?.contactInfo?.title ?? "-" },
        {
            label: "Contact role",
            value: currentDetails?.contactInfo?.contactRoles?.length
                ? currentDetails.contactInfo.contactRoles.join("; ")
                : "-",
        },
        { label: "Email", value: currentDetails?.contactInfo?.primaryEmail ?? "-" },
        { label: "Phone", value: currentDetails?.contactInfo?.primaryPhone ?? "-" },
        {
            label: "Address",
            value: (() => {
                const address = currentDetails?.contactInfo?.addresses?.[0];
                const stateZip = [address?.state, address?.postalCode].filter(Boolean).join(" ");
                const cityLine = [address?.city, stateZip].filter(Boolean).join(", ");
                if (!address?.street && !cityLine) return <span>-</span>;
                return (
                    <>
                        {address?.street}
                        {address?.street && cityLine ? <br /> : null}
                        {cityLine}
                    </>
                );
            })(),
        },
        {
            label: "County",
            value: (
                <>
                    {(currentDetails?.contactInfo?.addresses?.length ?? 0) > 0 ? (
                        <span>{currentDetails?.contactInfo?.addresses[0]?.county}</span>
                    ) : (
                        <span>-</span>
                    )}
                </>
            ),
        },
    ];

    return (
        <div className="contact-details-sidebar">
            <Tabs
                id="uncontrolled-tab-example-sidebar"
                defaultActiveKey={tabKey}
                className="mb-3"
                mountOnEnter
            >
                <Tab eventKey="contactInfo" title="Contact information">
                    <div className="tab-content-section">
                        {loading ? (
                            <Loader />
                        ) : (
                            renderContactInfo(infoTabData)
                        )}
                    </div>
                </Tab>
                <Tab eventKey="organizations" title="Organizations">
                    <div className="tab-content-section mt-3 custom-table-wrapper">
                        <ContactEntityTable type="organization" contactId={contactId} />
                    </div>
                </Tab>
                <Tab eventKey="groups" title="Groups">
                    <div className="tab-content-section mt-3">
                        <ContactEntityTable type="group" contactId={contactId} />
                    </div>
                </Tab>
            </Tabs>
        </div>
    );
};

export default ContactDetails;
