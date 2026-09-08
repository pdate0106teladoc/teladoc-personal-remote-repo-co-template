import * as React from "react";
import { useCallback, useState } from "react";
import "@/pages/grp-detail/styles/Products.scss";
import { hasAny } from "@/utils";
import { API_ENDPOINTS, LABELS } from "@/constants";
import "./ContactFilterSidebar.scss"
import { useContactFilterStore } from "@/store/useContactFilterStore";
import {MultiSelectSearch} from "@ucc/common-ui";
import { Button, CheckboxGroup } from "@ucc/common-ui";
import { useLocation, useParams } from "react-router-dom";
import api from "@/api/apiService";

const extContact = [
    { label: "Primary daily", value: "Primary daily" },
    { label: "Primary billing", value: "Primary billing" },
    { label: "Secondary billing", value: "Secondary billing" },
    { label: "Eligibility", value: "Eligibility" },
    { label: "Marketing - Telemed", value: "Marketing - Telemed" },
    { label: "Marketing - CCM", value: "Marketing - CCM" },
    { label: "Reporting", value: "Reporting" },
];

const intContact = [
    { label: "Client Manager", value: "Client Manager" },
    { label: "Client Implementation Manager", value: "Client Implementation Manager" },
    { label: "Client Operations Manager", value: "Client Operations Manager" },
    { label: "Sales Agent", value: "Sales Agent" },
];

interface ContactFilters {
    setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
    onExposeClear?: (fn: () => void) => void;
    onFiltersApplied?: () => void;
}

const ContactFilters: React.FC<ContactFilters> = ({
    setOpenModal,
    onExposeClear,
    onFiltersApplied
}) => {
    const searchUrl = import.meta.env.VITE_SEARCH_BASE_URL;
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const getFilters = useContactFilterStore((s) => s.getFilters);
    const setFilters = useContactFilterStore((s) => s.setFilters);
    const setApplied = useContactFilterStore((s) => s.setApplied);
    const clearStore = useContactFilterStore((s) => s.clear);
    const initial = getFilters();
    const [contactTypeIntFilter, setContactTypeIntFilter] = useState<string[]>(
        initial.contactTypeIntFilter,
    );
    const [contactTypeExtFilter, setContactTypeExtFilter] = useState<string[]>(
        initial.contactTypeExtFilter,
    );
    const [nameFilter, setNameFilter] = useState<Record<string, string>>(
        initial.nameFilter,
    );
    const [orgFilter, setOrgFilter] = useState<Record<string, string>>(
        initial.orgFilter,
    );
    const [grpFilter, setGrpFilter] = useState<Record<string, string>>(
        initial.grpFilter,
    );

    const handleApplyFilters = () => {
        const appliedKeys = computeApplied();
        const appliedCount = computeAppliedFiltersCount();
        setFilters({
            contactTypeIntFilter,
            contactTypeExtFilter,
            nameFilter,
            orgFilter,
            grpFilter,
        });
        setApplied({
            filteredAppliedKeys: appliedKeys,
            filterApplied: appliedCount,
        });
        setOpenModal(false);
        onFiltersApplied?.();
    };

    const handleClearFilters = useCallback(() => {
        setContactTypeIntFilter([]);
        setContactTypeExtFilter([]);
        setNameFilter({});
        setOrgFilter({});
        setGrpFilter({});
        clearStore();
        setOpenModal(false);
    }, [clearStore, setOpenModal]);

    onExposeClear?.(handleClearFilters);

    const computeAppliedFiltersCount = () => {
        let count = 0;
        count += Object.values(nameFilter).some(Boolean) ? 1 : 0;
        count += hasAny(contactTypeIntFilter) ? 1 : 0;
        count += hasAny(contactTypeExtFilter) ? 1 : 0;
        count += Object.values(orgFilter).some(Boolean) ? 1 : 0;
        count += Object.values(grpFilter).some(Boolean) ? 1 : 0;
        return count;
    };

    const computeApplied = (): string[] => {
        const applied: string[] = [];
        if (Object.values(nameFilter).some(Boolean)) applied.push("Name");
        if (contactTypeIntFilter.length) applied.push("Contact type (internal user)");
        if (contactTypeExtFilter.length) applied.push("Contact type (external contact)");
        if (Object.values(orgFilter).some(Boolean)) applied.push("Organization");
        if (Object.values(grpFilter).some(Boolean)) applied.push("Group");
        return applied;
    };

    const buildSearchParams = (searchTerm: string, searchType: string) => {
        let globalSearchTerm = "", globalSearchType = "";
        if (location.pathname.includes("org-detail") || location.pathname.includes("groups")) {
            globalSearchTerm = id ? id : "";
            globalSearchType = location.pathname.includes("org-detail") ? "organization" : "group";
        } else {
            const searchParams = new URLSearchParams(location.search);
            const term = searchParams.get("searchTerm");
            globalSearchTerm = term ? term : "";
            globalSearchType = "name";
        }
        return {
            globalSearchTerm,
            globalSearchType,
            searchTerm,
            searchType,
        };
    };

    const apiUrl = `${searchUrl}${API_ENDPOINTS.contactFilterSearch}`;

    return (
        <div className="contact-filter-container">
            <div className="d-flex flex-column content">
                <div>
                    <MultiSelectSearch
                        label="Name"
                        preSelected={nameFilter}
                        onChange={(selected) => setNameFilter(selected)}
                        api={api}
                        apiUrl={apiUrl}
                        buildSearchParams={buildSearchParams}
                        maxResults={5}
                    />
                </div>
                <div>
                    <MultiSelectSearch
                        label="Organization"
                        preSelected={orgFilter}
                        onChange={(selected) => setOrgFilter(selected)}
                        api={api}
                        apiUrl={apiUrl}
                        buildSearchParams={buildSearchParams}
                        maxResults={5}
                    />
                </div>
                <div>
                    <MultiSelectSearch
                        label="Group"
                        preSelected={grpFilter}
                        onChange={(selected) => setGrpFilter(selected)}
                        api={api}
                        apiUrl={apiUrl}
                        buildSearchParams={buildSearchParams}
                        maxResults={5}
                    />
                </div>
                <CheckboxGroup
                    title="Contact type (external contact)"
                    options={extContact}
                    selectedValues={contactTypeExtFilter}
                    onChange={(values) => {
                        setContactTypeExtFilter(values);
                    }}
                    customClassName="filter-check"
                />
                <CheckboxGroup
                    title="Contact type (internal user)"
                    options={intContact}
                    selectedValues={contactTypeIntFilter}
                    onChange={(values) => {
                        setContactTypeIntFilter(values);
                    }}
                    customClassName="filter-check"
                />
            </div>
            <div className="footer">
                <Button variant="secondary" onClick={handleClearFilters}>
                    {LABELS.products.CLEAR_ALL}
                </Button>
                <Button variant="primary" onClick={handleApplyFilters}>
                    {LABELS.products.SHOW_RESULTS}
                </Button>
            </div>
        </div>
    );
};

export default ContactFilters;
