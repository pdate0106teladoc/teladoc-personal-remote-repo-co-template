export interface BasicFormValues {
    name: string;
    title: string;
    phone: string;
    email: string;
    street: string;
    city: string;
    county: string;
    state: string;
    zip: string;
    roles: Record<string, boolean>;
}

export interface BasicFormErrors {
    name?: string;
    phone?: string;
    email?: string;
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
}

export const INITIAL_BASIC_FORM: BasicFormValues = {
    name: "",
    title: "",
    phone: "",
    email: "",
    street: "",
    city: "",
    county: "",
    state: "",
    zip: "",
    roles: {
        "ACO Point of Contact": false,
        "Admin/Coordinator": false,
        "Attorney": false,
        "Benefits VP/Dir/Mgr": false,
        "Billing": false,
        "Broker": false,
        "Consultant": false,
        "C-Suite": false,
        "Decision Maker": false,
        "Executive": false,
        "IT": false,
        "Lobbyist": false,
        "Medical Director": false,
        "Member Communication": false,
        "Partner Relations": false,
        "PLE-Public Labor & Education": false,
        "Primary": false,
        "Reporting": false,
        "SME - Hospital/Healthcare (Consultants)": false,
        "SME - Public & Labor (Consultants)": false,
        "SME - Telemedicine": false,
    },
};
