export interface Address {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    county?: string;
}
export interface contactInfo {
    contactId: string;
    fullName: string;
    title: string;
    primaryEmail: string;
    primaryPhone: string;
    addresses: Address[];
    contactRoles: string[];
}

export interface contactDetails {
    contactInfo: contactInfo;
}

