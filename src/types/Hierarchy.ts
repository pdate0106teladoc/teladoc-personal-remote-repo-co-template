export type OrgUnit = {
    id: string;
    name: string;
    isBillingOrg?: boolean;
    countOfChildren?: number;
};

export type Group = {
    id: string;
    name: string;
};

export type OrgData = {
    org?: OrgUnit;
    parents?: OrgUnit[];
    children?: OrgUnit[];
    groups?: Group[];
};

export type DynamicMap = Record<string, { children?: OrgUnit[]; groups?: Group[] }>;
