import * as React from "react";
import { useState } from "react";
import { Card } from "react-bootstrap";
import { AccountRelationshipDetail } from "@/types/OrgView";
import { DisplayRow, SideModal } from "@ucc/common-ui";
import BrokerSidebar from "../sidebar/BrokerSidebar";
import { renderBrokerCommisionData } from "@/data/organization/general-settings";

const fieldsOrderCommission = [
    { key: "commissionName", label: "Commissions - Name", lastChild: true },
    { key: "standardCommission", label: "Standard commission?", lastChild: true, format: "boolean" },
    { key: "commissionFlag", label: "Commissions - Flag", lastChild: true, format: "boolean" },
    { key: "commissionFlatRate", label: "Commissions - Flat rate", lastChild: true },
    { key: "commissionPercentage", label: "Commissions - Percentage", lastChild: true },
    { key: "chronicCareBrokerFlatRate", label: "Chronic care broker flat rate", lastChild: true, format: "currency" },
    { key: "chronicCareBrokerPercentage", label: "Chronic care broker percentage", lastChild: true },
];


const fieldsOrderLocations = [
    { key: "locationName", label: "Location name", lastChild: true },
    { key: "locationId", label: "Location ID", lastChild: true },
    { key: "taxId", label: "Tax ID", lastChild: true },
    { key: "taxIdentifierType", label: "Tax identifier type", lastChild: true },
    { key: "attentionDepartment", label: "Attention department", lastChild: true },
    { key: "remitFlag", label: "Remit flag", lastChild: true, format: "boolean" },
    { key: "remitToLocation", label: "Remit to location", lastChild: true },
    { key: "remitToName", label: "Remit to name", lastChild: true },
    { key: "addressLine1", label: "Address line 1", lastChild: true },
    { key: "addressLine2", label: "Address line 2", lastChild: true },
    { key: "city", label: "City", lastChild: true },
    { key: "state", label: "State", lastChild: true },
    { key: "postalCode", label: "Postal code", lastChild: true },
    { key: "contactEmail", label: "Contact email", lastChild: true },
    { key: "contactPhone", label: "Contact phone", lastChild: true },
    { key: "effectiveStartDate", label: "Effective start date", lastChild: true, format: "date" },
    { key: "effectiveEndDate", label: "Effective end date", lastChild: true, format: "date" },
    { key: "note", label: "Note", lastChild: true },
];

const fieldsOrderAdditionalInformation = [
    { key: "brokerContact", label: "Broker contact", lastChild: true },
    { key: "salesforceId", label: "Salesforce ID", lastChild: true },
    { key: "compositeKey", label: "Composite Key", lastChild: true },
];
export const tabData = [
    {
        eventKey: "commission",
        title: "Commission",
        fields: fieldsOrderCommission,
    },
    {
        eventKey: "locations",
        title: "Locations",
        fields: fieldsOrderLocations,
    },
    {
        eventKey: "additionalInformation",
        title: "Additional Information",
        fields: fieldsOrderAdditionalInformation,
    }
];

interface CustomCardsProps {
    title?: string;
    children?: React.ReactNode;
    className?: string;
    brokerType?: string;
    data?: Record<string, any>;
}

const CustomCards = ({
    children,
    title,
    className,
    brokerType,
    data
}: CustomCardsProps) => {
    const [openModal, setOpenModal] = useState(false);
    const dataToDisplay = data?.find((item: any) => item.partnerAccount === title);
    return (
        <>
            <Card className={`custom-card ${className}`}>
                {title && <Card.Header className="custom-card-header">
                    <div className="d-flex flex-row align-items-center">
                        <div className="title-pill-gray">
                            <span className="pill-text-gray">{brokerType}</span>
                        </div>
                        <span className="clickable-text" onClick={() => setOpenModal(true)}>{title}</span>
                    </div>
                </Card.Header>}
                <Card.Body className="custom-card-body">
                    <div className="row">{children}</div>
                </Card.Body>
            </Card>
            <SideModal show={openModal} onHide={() => setOpenModal(false)} title={title}>
                <BrokerSidebar tabs={tabData} data={dataToDisplay} />
            </SideModal>
        </>
    );
};

interface BrokerCardProps {
    className?: string;
    dataForBroker?: Array<AccountRelationshipDetail>;
}

const BrokerCard: React.FC<BrokerCardProps> = ({ className, dataForBroker }) => {
    const data = renderBrokerCommisionData(dataForBroker || []);
    return (
        <>
            {data.map((sectionData, idx) =>
                Object.entries(sectionData).map(([sectionTitle, sectionColumns]) => {
                    const columns = Object.entries(sectionColumns?.rows);
                    const colWidth = Math.floor(12 / columns.length);
                    const brokerType = sectionColumns?.brokerType;
                    return (
                        <CustomCards key={sectionTitle + idx} data={dataForBroker} title={sectionTitle} brokerType={brokerType} data-testid={'custom-card'} className={className}>
                            {columns.map(([colKey, items]) => (
                                <div
                                    key={`${sectionTitle}-${colKey}`}
                                    className={`col-${colWidth}`}
                                >
                                    {items.map((item, itemIndex) => (
                                        <DisplayRow
                                            key={`${colKey}-${itemIndex}`}
                                            label={item.label}
                                            value={item.value}
                                            format={item.format}
                                            lastChild={item.lastChild}
                                            tooltipContent={item.tooltipContent}
                                            personMeta={item.personMeta}
                                        />
                                    ))}
                                </div>
                            ))}
                        </CustomCards>
                    );
                })
            )}
        </>
    );
};


export default BrokerCard;
