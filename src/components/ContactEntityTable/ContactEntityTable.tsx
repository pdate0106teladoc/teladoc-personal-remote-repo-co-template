import { useEffect, useState } from "react";
import { CustomTable, ERROR_MESSAGES, Loader, showCustomToast, TableColumn, ToastType } from "@ucc/common-ui";
import { GRP_DETAIL_PATH, ORG_DETAIL_PATH } from "@/router/routes";
import { API_ENDPOINTS, NO_OF_RECORDS_PER_PAGE_INDIVIDUAL } from "@/constants";
import api from "@/api/apiService";

interface OrgRow {
    organizationId?: string;
    organizationUuid: string;
    organizationName: string;
    contactTypes: string[];
}

interface GrpRow {
    groupId?: string;
    groupUuid: string;
    groupName: string;
    parentOrganization: string;
    contactTypes: string[];
}

type EntityType = "organization" | "group";
type SortState = { sortBy: string; sortOrder: string };
type FilterState = Record<string, string[]>;

const initialSort: SortState = { sortBy: "", sortOrder: "" };

const CONTACT_TYPE_OPTIONS = [
    "Primary daily",
    "Primary billing",
    "Secondary billing",
    "Marketing",
    "Eligibility",
    "Reporting",
    "Client Manager",
    "Client Implementation Manager",
    "Client Operations Manager",
    "Sales Agent",
];

const orgColumns: TableColumn<OrgRow>[] = [
    {
        label: "Org(s)",
        field: "organizationName",
        render: (_v, row) => (
            <a href={`${ORG_DETAIL_PATH}/${row.organizationUuid}`} className="info-link table-link">
                {row.organizationName}
            </a>
        ),
        hasToggleMenu: true,
        showSorting: true,
        showFiltering: true,
    },
    {
        label: "Contact type",
        field: "contactTypes",
        render: (_v, row) => (row?.contactTypes?.length ? row.contactTypes.join(", ") : "-"),
        hasToggleMenu: true,
        showSorting: false,
        showFiltering: true,
        isMultiSelect: true,
        filterOptions: CONTACT_TYPE_OPTIONS,
    },
];

const grpColumns: TableColumn<GrpRow>[] = [
    {
        label: "Group(s)",
        field: "groupName",
        render: (_v, row) => (
            <div className="d-flex flex-column">
                <a href={`${GRP_DETAIL_PATH}/${row.groupUuid}`} className="info-link table-link">
                    {row.groupName}
                </a>
                {row.parentOrganization && (
                    <span className="parent-org">Parent org: {row.parentOrganization}</span>
                )}
            </div>
        ),
        hasToggleMenu: true,
        showSorting: true,
        showFiltering: true,
    },
    {
        label: "Contact type",
        field: "contactTypes",
        render: (_v, row) => (row?.contactTypes?.length ? row.contactTypes.join(", ") : "-"),
        hasToggleMenu: true,
        showSorting: false,
        showFiltering: true,
        isMultiSelect: true,
        filterOptions: CONTACT_TYPE_OPTIONS,
    },
];

const toFilterString = (v: string | string[] | undefined): string =>
    Array.isArray(v) ? v.join(", ") : (v ?? "");

interface ContactEntityTableProps {
    type: EntityType;
    contactId?: string;
}

const ContactEntityTable: React.FC<ContactEntityTableProps> = ({ type, contactId }) => {
    const [data, setData] = useState<(OrgRow | GrpRow)[]>([]);
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [sort, setSort] = useState<SortState>({ ...initialSort });
    const [filters, setFilters] = useState<FilterState>({});
    const [loading, setLoading] = useState<boolean>(!!contactId);
    const searchUrl = import.meta.env.VITE_SEARCH_BASE_URL;

    const fetchData = async (p: number, f: FilterState, s: SortState) => {
        if (!contactId) return;
        setLoading(true);
        try {
            const res: any = await api.get(
                `${searchUrl}${API_ENDPOINTS.contact}/${contactId}/${type}`,
                {
                    organizationName: toFilterString(f.organizationName),
                    groupName: toFilterString(f.groupName),
                    contactTypes: toFilterString(f.contactTypes),
                    page: p,
                    limit: NO_OF_RECORDS_PER_PAGE_INDIVIDUAL,
                    sortBy: s.sortBy,
                    sortOrder: s.sortOrder,
                },
            );
            const payload = res?.data || res;
            const key = type === "organization" ? "organizations" : "groups";
            setData(payload?.[key] ?? []);
            setTotal(payload?.page?.totalResults ?? 0);
            setPage(p);
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
        setSort({ ...initialSort });
        setFilters({});
        setPage(0);
        if (!contactId) {
            setData([]);
            setTotal(0);
            return;
        }
        fetchData(0, {}, { ...initialSort });
    }, [contactId, type]); // eslint-disable-line react-hooks/exhaustive-deps

    const handlePageChange = (newPage: number) => {
        fetchData(newPage, filters, sort);
    };

    const handleSortChange = (sortByField: string | number | symbol | null, asc: boolean) => {
        const newSort: SortState = {
            sortBy: sortByField ? String(sortByField) : "",
            sortOrder: sortByField ? (asc ? "asc" : "desc") : "",
        };
        setSort(newSort);
        fetchData(0, filters, newSort);
    };

    const handleFilterChange = (newFilters: Record<string, string | string[]>) => {
        const normalized: FilterState = Object.fromEntries(
            Object.entries(newFilters).map(([k, v]) => [k, Array.isArray(v) ? v : [v]])
        );
        setFilters(normalized);
        fetchData(0, normalized, sort);
    };

    const columns = (type === "organization" ? orgColumns : grpColumns) as TableColumn<any>[];

    if (loading) return <Loader />;

    return (
        <CustomTable<any>
            data={data}
            columns={columns}
            showPagination
            totalRecords={total}
            page={page}
            rowsPerPage={NO_OF_RECORDS_PER_PAGE_INDIVIDUAL}
            onPageChange={handlePageChange}
            serverSideFiltering
            controlledServerFilters={filters}
            onServerFilterChange={handleFilterChange}
            onChangeSortParams={handleSortChange}
        />
    );
};

export default ContactEntityTable;
