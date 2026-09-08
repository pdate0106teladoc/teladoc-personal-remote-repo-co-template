import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    API_ENDPOINTS,
    ERROR_MESSAGES,
    NO_OF_RECORDS_PER_PAGE_INDIVIDUAL,
    SHOW_RECORDS_PER_PAGE_CONTACTS,
    SHOW_RECORDS_PER_PAGE_GLOBAL_SEARCH,
    SHOW_RECORDS_PER_PAGE_GLOBAL_SEARCH_CONTACTS,
    ToastType,
} from "@/constants";
import api from "@/api/apiService";
import { showCustomToast } from "@ucc/common-ui";
import { searchResults } from "@/types/search";
import { DASHBOARD_PATH } from "@/router/routes";
import { useContactFilterStore } from "@/store/useContactFilterStore";
import { buildFilterQuery } from "@/utils";

export type SearchType = "organization" | "group" | "opportunity" | "egragr" | "all" | "egr" | "agr" | "contacts";

export const useSearchResults = () => {
    const searchUrl = import.meta.env.VITE_SEARCH_BASE_URL;
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const [searchType, setSearchType] = useState<SearchType>("all");
    const page = Number(searchParams.get("page") ?? 0);
    const searchTerm = searchParams.get("searchTerm") || "";
    const searchCriteria = searchParams.get("searchCriteria") || "";
    const [data, setData] = useState<searchResults | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const [sortOrder, setSortOrder] = useState<string>("asc");
    const [sortBy, setSortBy] = useState<string>("");
    const [sortType, setSortType] = useState<string>("");

    const prevSearchTerm = useRef<string>(searchTerm);
    const prevSearchCriteria = useRef<string>(searchCriteria);
    const [viewMore, setViewMore] = useState<boolean>(false);

    // Server-side column filters for EGR/AGR search result tables
    const [egrFilters, setEgrFilters] = useState<Record<string, string[]>>({});
    const [agrFilters, setAgrFilters] = useState<Record<string, string[]>>({});
    const [egrFilteredPage, setEgrFilteredPage] = useState(0);
    const [agrFilteredPage, setAgrFilteredPage] = useState(0);
    const egrFiltersRef = useRef<Record<string, string[]>>({});
    const agrFiltersRef = useRef<Record<string, string[]>>({});
    const egrDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const agrDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const fetchSearchResultDataRef = useRef<(silent?: boolean) => void>(() => { });
    const egrGroupObjectIdRef = useRef<string | null>(null);
    const agrGroupObjectIdRef = useRef<string | null>(null);
    const egrFilterAbortRef = useRef<AbortController>(new AbortController());
    const agrFilterAbortRef = useRef<AbortController>(new AbortController());
    const egrFilteredSortByRef = useRef("");
    const egrFilteredSortDirRef = useRef("asc");
    const agrFilteredSortByRef = useRef("");
    const agrFilteredSortDirRef = useRef("asc");

    const type = searchParams.get("entity")?.toLowerCase() as SearchType;
    const clearFilters = useContactFilterStore((s) => s.clear);
    const appliedMeta = useContactFilterStore((s) => s.getApplied());
    const isFiltering = appliedMeta.filterApplied > 0;

    useEffect(() => {
        if (type && ["opportunity", "group", "organization", "contacts", "agr", "egr", "egragr"].includes(type)) {
            setSearchType(type);
        } else {
            setSearchType("all");
        }
    }, [type]);

    const handleBack = () => {
        clearFilters();
        handlePageChange(0);
        const currentUrl = new URL(window.location.href);
        const searchParams = currentUrl.searchParams;
        const entity = searchParams.get("entity");

        if (entity === "all" || entity === "egragr" || searchCriteria) {
            navigate(DASHBOARD_PATH);
        } else {
            if (entity === "egr" || entity === "agr") {
                searchParams.set("entity", "egragr");
            } else {
                searchParams.set("entity", "all");
            }
            searchParams.delete("page");
            const newUrl = currentUrl.pathname + "?" + searchParams.toString();
            navigate(newUrl);
        }
        setViewMore(false);
    };

    const fetchSearchResultData = async (silent = false) => {
        if (isFiltering) return;
        const transitioningToAdvancedSearch = !prevSearchCriteria.current && searchCriteria;
        if (transitioningToAdvancedSearch && (sortBy || sortOrder !== "asc" || sortType)) {
            setSortBy("");
            setSortOrder("asc");
            setSortType("");
            prevSearchCriteria.current = searchCriteria;
            return;
        }

        prevSearchCriteria.current = searchCriteria;
        if (!silent) setLoading(true);

        try {
            const limit =
                type === "all"
                    ? `limit=${SHOW_RECORDS_PER_PAGE_GLOBAL_SEARCH}`
                    : `limit=${NO_OF_RECORDS_PER_PAGE_INDIVIDUAL}`;
            const contactLimit = `&contactLimit=${type === "all"
                ? SHOW_RECORDS_PER_PAGE_GLOBAL_SEARCH_CONTACTS
                : SHOW_RECORDS_PER_PAGE_CONTACTS
                }`;
            const baseUrl =
                type !== "contacts"
                    ? sortBy.length === 0
                        ? `${API_ENDPOINTS.search}?searchTerm=${encodeURIComponent(searchTerm)}&entity=${type}&${limit}${contactLimit}&page=${page}`
                        : `${API_ENDPOINTS.search}?searchTerm=${encodeURIComponent(searchTerm)}&entity=${sortType}&${limit}${contactLimit}&page=${page}&sortBy=${sortBy}&sortOrder=${sortOrder}`
                    : `${API_ENDPOINTS.contacts}?searchTerm=${encodeURIComponent(searchTerm)}&searchType=name&limit=${SHOW_RECORDS_PER_PAGE_CONTACTS}&page=${page}`;

            const finalUrl = searchCriteria
                ? `${baseUrl}&searchCriteria=${encodeURIComponent(searchCriteria)}`
                : baseUrl;

            const response = await api.get<searchResults>(finalUrl, {}, { baseURL: searchUrl });
            const resposeData = {
                data: response?.data || response,
            };
            let searchTermChanged = prevSearchTerm.current !== searchTerm;
            if (searchTermChanged) {
                setSortBy("");
                setSortOrder("asc");
                searchTermChanged = false;
                prevSearchTerm.current = searchTerm;
            }

            const sanitizeSearchResults = (res: searchResults): searchResults =>
                sortBy.length > 0 || viewMore
                    ? {
                        ...res,
                        data: {
                            ...res?.data,
                            organizations: res?.data?.organizations?.length ? res?.data?.organizations : data?.data?.organizations || [],
                            groups: res?.data?.groups?.length ? res?.data?.groups : data?.data?.groups || [],
                            opportunities: res?.data?.opportunities?.length ? res?.data?.opportunities : data?.data?.opportunities || [],
                            contacts: res?.data?.contacts?.length ? res?.data?.contacts : data?.data?.contacts || [],
                            egr: res?.data?.egr?.length ? res?.data?.egr : data?.data?.egr || [],
                            agr: res?.data?.agr?.length ? res?.data?.agr : data?.data?.agr || [],
                            page: {
                                ...res?.data?.page,
                                entityCounts: {
                                    organizations:
                                        String(res?.data?.page?.entityCounts?.organizations) !== "0"
                                            ? res?.data?.page?.entityCounts?.organizations
                                            : data?.data?.page?.entityCounts?.organizations || 0,
                                    groups:
                                        String(res?.data?.page?.entityCounts?.groups) !== "0"
                                            ? res?.data?.page?.entityCounts?.groups
                                            : data?.data?.page?.entityCounts?.groups || 0,
                                    opportunities:
                                        String(res?.data?.page?.entityCounts?.opportunities) !== "0"
                                            ? res?.data?.page?.entityCounts?.opportunities
                                            : data?.data?.page?.entityCounts?.opportunities || 0,
                                    contacts:
                                        String(res?.data?.page?.entityCounts?.contacts) !== "0"
                                            ? res?.data?.page?.entityCounts?.contacts
                                            : (data?.data?.page?.entityCounts?.contacts ?? data?.data?.page?.totalResults) || 0,
                                    egr:
                                        String(res?.data?.page?.entityCounts?.egr) !== "0"
                                            ? res?.data?.page?.entityCounts?.egr
                                            : (data?.data?.page?.entityCounts?.egr ?? data?.data?.page?.totalResults) || 0,
                                    agr:
                                        String(res?.data?.page?.entityCounts?.agr) !== "0"
                                            ? res?.data?.page?.entityCounts?.agr
                                            : (data?.data?.page?.entityCounts?.agr ?? data?.data?.page?.totalResults) || 0,
                                },
                            },
                        },
                    }
                    : {
                        ...res,
                        data: {
                            ...res?.data,
                            organizations: res?.data?.organizations || [],
                            groups: res?.data?.groups || [],
                            opportunities: res?.data?.opportunities || [],
                            contacts: res?.data?.contacts || [],
                            egr: res?.data?.egr || [],
                            agr: res?.data?.agr || [],
                        },
                    };

            setData(sanitizeSearchResults(resposeData));
        } catch {
            showCustomToast({
                type: ToastType.Error,
                title: "Failed",
                message: ERROR_MESSAGES.SOMETHINGS_WRONG,
            });
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        if (!isFiltering) fetchSearchResultData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFiltering, searchParams, sortBy, sortOrder]);

    const handlePageChange = (newPage: number) => {
        setSearchParams((prev) => {
            const newParams = new URLSearchParams(prev);
            newParams.set("page", String(newPage));
            return newParams;
        });
    };

    const handleSortChange = (sortByValue: string | null, sortOrderValue: boolean, entityType: string) => {
        setSortBy(sortByValue || "");
        setSortOrder(sortOrderValue ? "asc" : "desc");
        setSortType(entityType);
    };

    const handleViewMore = (section: string) => {
        setViewMore(true);
        setSortBy("");
        setSortOrder("asc");
        if (searchType === "egragr" && (section === "egr" || section === "agr")) {
            setSearchType(section as SearchType);
            setSearchParams((prev) => {
                const newParams = new URLSearchParams(prev);
                newParams.set("page", "0");
                return newParams;
            });
        } else {
            setSearchParams({ searchTerm, entity: section, page: "0" });
        }
    };

    useEffect(() => { fetchSearchResultDataRef.current = fetchSearchResultData; });

    useEffect(() => {
        return () => {
            if (egrDebounceTimerRef.current) clearTimeout(egrDebounceTimerRef.current);
            if (agrDebounceTimerRef.current) clearTimeout(agrDebounceTimerRef.current);
            egrFilterAbortRef.current.abort();
            agrFilterAbortRef.current.abort();
        };
    }, []);

    useEffect(() => {
        if (data?.data?.egr !== undefined) {
            const newEgrId = data.data.egr[0]?.groupObjectId;
            const hasActiveEgrFilters = Object.values(egrFiltersRef.current).some((v) => v.length > 0);
            if (newEgrId) {
                egrGroupObjectIdRef.current = newEgrId;
            } else if (!hasActiveEgrFilters) {
                egrGroupObjectIdRef.current = null;
            }
        }
        if (data?.data?.agr !== undefined) {
            const newAgrId = data.data.agr[0]?.groupObjectId;
            const hasActiveAgrFilters = Object.values(agrFiltersRef.current).some((v) => v.length > 0);
            if (newAgrId) {
                agrGroupObjectIdRef.current = newAgrId;
            } else if (!hasActiveAgrFilters) {
                agrGroupObjectIdRef.current = null;
            }
        }
    }, [data]);

    const fetchEgrWithFilters = async (groupObjectId: string, filters: Record<string, string[]>, signal?: AbortSignal, page = 0, sortBy = "", sortDir = "asc") => {
        const filterQuery = buildFilterQuery(filters);
        const sortQuery = sortBy ? `&sortBy=${sortBy}&sortDir=${sortDir}` : "";
        try {
            const response = await api.get(
                `${API_ENDPOINTS.groups}/${groupObjectId}${API_ENDPOINTS.egr}?page=${page}&limit=${NO_OF_RECORDS_PER_PAGE_INDIVIDUAL}${filterQuery ? `&${filterQuery}` : ""}${sortQuery}`,
                undefined,
                { signal },
            );
            const egrData = (response as { data?: { egr?: unknown[]; page?: { totalResults?: number } } })?.data || response;
            setData((prev) =>
                prev
                    ? {
                        ...prev,
                        data: {
                            ...prev.data,
                            egr: (egrData as { egr?: unknown[] }).egr || [],
                            page: {
                                ...prev.data.page,
                                entityCounts: {
                                    ...prev.data.page.entityCounts,
                                    egr: (egrData as { page?: { totalResults?: number } }).page?.totalResults ?? 0,
                                },
                            },
                        },
                    }
                    : prev,
            );
        } catch (error) {
            if ((error as { name?: string }).name === "CanceledError") return;
            showCustomToast({ type: ToastType.Error, title: "Failed", message: ERROR_MESSAGES.SOMETHINGS_WRONG });
        }
    };

    const fetchAgrWithFilters = async (groupObjectId: string, filters: Record<string, string[]>, signal?: AbortSignal, page = 0, sortBy = "", sortDir = "asc") => {
        const filterQuery = buildFilterQuery(filters);
        const sortQuery = sortBy ? `&sortBy=${sortBy}&sortDir=${sortDir}` : "";
        try {
            const response = await api.get(
                `${API_ENDPOINTS.groups}/${groupObjectId}${API_ENDPOINTS.agr}?page=${page}&limit=${NO_OF_RECORDS_PER_PAGE_INDIVIDUAL}${filterQuery ? `&${filterQuery}` : ""}${sortQuery}`,
                undefined,
                { signal },
            );
            const agrData = (response as { data?: { agr?: unknown[]; page?: { totalResults?: number } } })?.data || response;
            setData((prev) =>
                prev
                    ? {
                        ...prev,
                        data: {
                            ...prev.data,
                            agr: (agrData as { agr?: unknown[] }).agr || [],
                            page: {
                                ...prev.data.page,
                                entityCounts: {
                                    ...prev.data.page.entityCounts,
                                    agr: (agrData as { page?: { totalResults?: number } }).page?.totalResults ?? 0,
                                },
                            },
                        },
                    }
                    : prev,
            );
        } catch (error) {
            if ((error as { name?: string }).name === "CanceledError") return;
            showCustomToast({ type: ToastType.Error, title: "Failed", message: ERROR_MESSAGES.SOMETHINGS_WRONG });
        }
    };

    const handleEgrFilterChange = (filters: Record<string, string | string[]>) => {
        const normalized: Record<string, string[]> = Object.fromEntries(
            Object.entries(filters).map(([k, v]) => [k, Array.isArray(v) ? v : [v]]),
        );
        setEgrFilters(normalized);
        setEgrFilteredPage(0);
        egrFiltersRef.current = normalized;
        egrFilterAbortRef.current.abort();
        egrFilterAbortRef.current = new AbortController();
        const egrSignal = egrFilterAbortRef.current.signal;
        if (egrDebounceTimerRef.current) clearTimeout(egrDebounceTimerRef.current);
        egrDebounceTimerRef.current = setTimeout(() => {
            const activeFilters = egrFiltersRef.current;
            const hasFilters = Object.values(activeFilters).some((v) => v.length > 0);
            if (!hasFilters) {
                fetchSearchResultDataRef.current(true);
            } else {
                const groupObjectId = egrGroupObjectIdRef.current;
                if (groupObjectId) fetchEgrWithFilters(groupObjectId, activeFilters, egrSignal, 0, egrFilteredSortByRef.current, egrFilteredSortDirRef.current);
            }
        }, 400);
    };

    const handleAgrFilterChange = (filters: Record<string, string | string[]>) => {
        const normalized: Record<string, string[]> = Object.fromEntries(
            Object.entries(filters).map(([k, v]) => [k, Array.isArray(v) ? v : [v]]),
        );
        setAgrFilters(normalized);
        setAgrFilteredPage(0);
        agrFiltersRef.current = normalized;
        agrFilterAbortRef.current.abort();
        agrFilterAbortRef.current = new AbortController();
        const agrSignal = agrFilterAbortRef.current.signal;
        if (agrDebounceTimerRef.current) clearTimeout(agrDebounceTimerRef.current);
        agrDebounceTimerRef.current = setTimeout(() => {
            const activeFilters = agrFiltersRef.current;
            const hasFilters = Object.values(activeFilters).some((v) => v.length > 0);
            if (!hasFilters) {
                fetchSearchResultDataRef.current(true);
            } else {
                const groupObjectId = agrGroupObjectIdRef.current;
                if (groupObjectId) fetchAgrWithFilters(groupObjectId, activeFilters, agrSignal, 0, agrFilteredSortByRef.current, agrFilteredSortDirRef.current);
            }
        }, 400);
    };

    const handleEgrFilteredPageChange = (newPage: number) => {
        setEgrFilteredPage(newPage);
        egrFilterAbortRef.current.abort();
        egrFilterAbortRef.current = new AbortController();
        const groupObjectId = egrGroupObjectIdRef.current;
        if (groupObjectId) {
            fetchEgrWithFilters(groupObjectId, egrFiltersRef.current, egrFilterAbortRef.current.signal, newPage, egrFilteredSortByRef.current, egrFilteredSortDirRef.current);
        }
    };

    const handleAgrFilteredPageChange = (newPage: number) => {
        setAgrFilteredPage(newPage);
        agrFilterAbortRef.current.abort();
        agrFilterAbortRef.current = new AbortController();
        const groupObjectId = agrGroupObjectIdRef.current;
        if (groupObjectId) {
            fetchAgrWithFilters(groupObjectId, agrFiltersRef.current, agrFilterAbortRef.current.signal, newPage, agrFilteredSortByRef.current, agrFilteredSortDirRef.current);
        }
    };

    const handleEgrSortChange = (sortByValue: string | null, sortAscending: boolean) => {
        const newSortBy = sortByValue ? String(sortByValue) : "";
        const newSortDir = newSortBy ? (sortAscending ? "asc" : "desc") : "asc";
        egrFilteredSortByRef.current = newSortBy;
        egrFilteredSortDirRef.current = newSortDir;
        const hasFilters = Object.values(egrFiltersRef.current).some((v) => v.length > 0);
        if (hasFilters) {
            setEgrFilteredPage(0);
            egrFilterAbortRef.current.abort();
            egrFilterAbortRef.current = new AbortController();
            const groupObjectId = egrGroupObjectIdRef.current;
            if (groupObjectId) {
                fetchEgrWithFilters(groupObjectId, egrFiltersRef.current, egrFilterAbortRef.current.signal, 0, newSortBy, newSortDir);
            }
        } else {
            handleSortChange(sortByValue, sortAscending, type === "egragr" ? "egragr" : "egr");
        }
    };

    const handleAgrSortChange = (sortByValue: string | null, sortAscending: boolean) => {
        const newSortBy = sortByValue ? String(sortByValue) : "";
        const newSortDir = newSortBy ? (sortAscending ? "asc" : "desc") : "asc";
        agrFilteredSortByRef.current = newSortBy;
        agrFilteredSortDirRef.current = newSortDir;
        const hasFilters = Object.values(agrFiltersRef.current).some((v) => v.length > 0);
        if (hasFilters) {
            setAgrFilteredPage(0);
            agrFilterAbortRef.current.abort();
            agrFilterAbortRef.current = new AbortController();
            const groupObjectId = agrGroupObjectIdRef.current;
            if (groupObjectId) {
                fetchAgrWithFilters(groupObjectId, agrFiltersRef.current, agrFilterAbortRef.current.signal, 0, newSortBy, newSortDir);
            }
        } else {
            handleSortChange(sortByValue, sortAscending, type === "egragr" ? "egragr" : "agr");
        }
    };

    const memoizedContacts = useMemo(() => data?.data?.contacts || [], [data?.data?.contacts]);
    const memoizedOrgs = useMemo(() => data?.data?.organizations || [], [data?.data?.organizations]);
    const memoizedGroups = useMemo(() => data?.data?.groups || [], [data?.data?.groups]);
    const memoizedOpps = useMemo(() => data?.data?.opportunities || [], [data?.data?.opportunities]);

    return {
        searchType,
        page,
        searchTerm,
        data,
        loading,
        memoizedOrgs,
        memoizedGroups,
        memoizedOpps,
        memoizedContacts,
        type,
        handleBack,
        handlePageChange,
        handleSortChange,
        handleViewMore,
        fetchSearchResultData,
        setSortType,
        egrFilters,
        agrFilters,
        egrFilteredPage,
        agrFilteredPage,
        handleEgrFilterChange,
        handleAgrFilterChange,
        handleEgrFilteredPageChange,
        handleAgrFilteredPageChange,
        handleEgrSortChange,
        handleAgrSortChange,
    };
};
