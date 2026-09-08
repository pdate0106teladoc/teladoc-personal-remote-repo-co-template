import "./ViewContacts.scss"
import ContactCards, { contact } from "./ContactCards";
import { useCallback, useEffect, useRef, useState } from "react";
import ContactFilters from "@/components/sidebar/ContactFilterSidebar";
import { useContactFilterStore } from "@/store/useContactFilterStore";
import { API_ENDPOINTS, ERROR_MESSAGES, LABELS, ToastType, TOOLTIP_MESSAGES } from "@/constants";
import api from "@/api/apiService";
import { useLocation, useParams } from "react-router-dom";
import { Button, ContactIcon, FailSafePage, FilterButton, FilteredByBar, Loader, PaginationView, renderTooltip, showCustomToast, SideModal } from "@ucc/common-ui";
import AddContactModal from "./AddContactModal";
import { DarkPlusIcon } from "@/assets";
import { OverlayTrigger } from "react-bootstrap";

interface props {
    data?: Array<contact>;
    totalRecords?: number;
    pageSize?: number;
    showPagination?: boolean;
    page?: number;
    searchTerm?: string;
    searchType?: string;
    onPageChange?: (page: number) => void;
    onClearFilter?: () => void;
    onRefetch?: () => void;
    clearOnUnmount?: boolean;
}

type ApiFilterPayload = {
    nameList: string[];
    organizationList: string[];
    groupList: string[];
    internalContactList: string[];
    externalContactList: string[];
};

const ViewContacts: React.FC<props> = ({
    totalRecords = 0,
    pageSize = 5,
    page = 0,
    data = [],
    onPageChange,
    onClearFilter,
    onRefetch,
    searchTerm,
    searchType,
    clearOnUnmount = false,
}) => {
    const searchUrl = import.meta.env.VITE_SEARCH_BASE_URL;
    const [loading, setLoading] = useState<boolean>(false);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [showAddContact, setShowAddContact] = useState<boolean>(false);

    const [filteredData, setFilteredData] = useState<Array<contact>>([]);
    const [filteredTotal, setFilteredTotal] = useState<number>(0);
    const [singleContact, setSingleContact] = useState<contact | null>(null);

    const { id } = useParams<{ id: string; }>();
    const location = useLocation();
    const isDetailPage = location.pathname.includes("/groups/") || location.pathname.includes("/org-detail/");
    const isEditMode = location.pathname.includes("/edit/");

    const appliedActiveCount = useContactFilterStore((s) => s.selectedFilters.applied.filterApplied);
    const activeFilteredKeys = useContactFilterStore((s) => s.selectedFilters.applied.filteredAppliedKeys);
    const clearFilters = useContactFilterStore((s) => s.clear);
    const getFilters = useContactFilterStore((s) => s.getFilters);
    const clearRefActive = useRef<() => void>(null);

    const isSingleView = !!id && !isDetailPage;
    const isFiltering = appliedActiveCount > 0;

    let displayData: Array<contact> = data;
    let displayTotal: number = totalRecords;

    if (isSingleView) {
        displayData = singleContact ? [singleContact] : [];
        displayTotal = singleContact ? 1 : 0;
    } else if (isFiltering) {
        displayData = filteredData;
        displayTotal = filteredTotal;
    }

    const rowsPerPage = pageSize;
    const currentPage = page;

    const contextKey = `${searchTerm}-${searchType}`;
    const prevContextRef = useRef(contextKey);

    useEffect(() => {
        if (prevContextRef.current !== contextKey) {
            clearFilters();
            prevContextRef.current = contextKey;
        }
    }, [contextKey, clearFilters]);

    useEffect(() => {
        return () => {
            if (clearOnUnmount) clearFilters();
        };
    }, [clearOnUnmount, clearFilters]);

    const withDisabledTooltip = (button: React.ReactNode, tooltipId: string) =>
        isEditMode ? (
            <OverlayTrigger
                placement="top"
                overlay={renderTooltip(TOOLTIP_MESSAGES.EDIT_DISABLED, tooltipId)}
            >
                <span className="d-inline-block">{button}</span>
            </OverlayTrigger>
        ) : (
            button
        );

    const fetchSingleContact = useCallback(async (id: string) => {
        setLoading(true);
        try {
            const summaryParams = {
                organizationName: "",
                groupName: "",
                contactTypes: "",
                page: 0,
                limit: 1,
                sortBy: "",
                sortOrder: "",
            };
            const contactRes: any = await api.get(`${API_ENDPOINTS.contact}/${id}`);
            const contactData = contactRes?.data || contactRes;
            const resolvedContactId = contactData?.contactId;
            const [orgRes, grpRes]: any[] = await Promise.all([
                api.get(`${searchUrl}${API_ENDPOINTS.contact}/${resolvedContactId}/organization`, summaryParams),
                api.get(`${searchUrl}${API_ENDPOINTS.contact}/${resolvedContactId}/group`, summaryParams),
            ]);
            const orgPayload = orgRes?.data || orgRes;
            const grpPayload = grpRes?.data || grpRes;
            setSingleContact(contactData ? {
                ...contactData,
                organizations: orgPayload?.organizations ?? [],
                groups: grpPayload?.groups ?? [],
                organizationsTotal: orgPayload?.page?.totalResults ?? 0,
                groupsTotal: grpPayload?.page?.totalResults ?? 0,
            } : null);
        } catch {
            showCustomToast({
                type: ToastType.Error,
                title: "Failed",
                message: ERROR_MESSAGES.SOMETHINGS_WRONG,
            });
        } finally {
            setLoading(false);
        }
    }, [searchUrl]);

    const showFilteredRes = useCallback(
        async (targetPage: number) => {
            setLoading(true);
            try {
                const initial = getFilters();
                const payload: ApiFilterPayload = {
                    nameList: Object.keys(initial.nameFilter),
                    organizationList: Object.keys(initial.orgFilter),
                    groupList: Object.keys(initial.grpFilter),
                    internalContactList: initial.contactTypeIntFilter,
                    externalContactList: initial.contactTypeExtFilter,
                };

                const url = `${searchUrl}${API_ENDPOINTS.contactFilter}?limit=${rowsPerPage}&page=${targetPage}&globalSearchTerm=${searchTerm}&globalSearchType=${searchType}`;
                const res: any = await api.post(url, payload);
                const responseData = res?.data || res;
                setFilteredTotal(responseData?.page?.totalResults ?? 0);
                setFilteredData(responseData?.contacts ?? []);
            } catch {
                showCustomToast({
                    type: ToastType.Error,
                    title: "Failed",
                    message: ERROR_MESSAGES.SOMETHINGS_WRONG,
                });
            } finally {
                setLoading(false);
            }
        },
        [getFilters, searchTerm, searchType, rowsPerPage]
    );

    const handleContactRefetch = () => {
        if (isFiltering) {
            showFilteredRes(currentPage);
        } else {
            onRefetch?.();
        }
    };

    const handlePageChange = (newPage: number) => {
        onPageChange?.(newPage);
    };

    const handleFiltersApplied = async () => {
        onPageChange?.(0);
        await showFilteredRes(0);
    };

    const handleClearAllActive = useCallback(() => {
        clearRefActive.current?.();
        clearFilters();
        onPageChange?.(0);
        onClearFilter?.();
    }, [clearFilters, onClearFilter, onPageChange]);

    useEffect(() => {
        if (isSingleView && id) {
            fetchSingleContact(id);
        }
    }, [id, isSingleView, fetchSingleContact]);

    useEffect(() => {
        if (isFiltering) {
            showFilteredRes(currentPage);
        }
    }, [currentPage, isFiltering, showFilteredRes]);

    if (loading) return <Loader text="Loading..." />;

    return (
        <div className="view-contact-sec">
            <div className="d-flex flex-row align-items-center">
                <ContactIcon className="contact-icon" />
                <span className="contact-header mx-2">Contacts</span>
            </div>

            <div className="d-flex flex-row searchbar-row align-items-center justify-content-between mt-3">
                {(!id || isDetailPage) && (
                    <div className="d-flex flex-row gap-4">
                        <FilterButton
                            count={appliedActiveCount}
                            onClick={() => setOpenModal(true)}
                            className="filter-button-style"
                            disabled={!isFiltering && displayData?.length === 0}
                        />

                        <SideModal show={openModal} title="Filters" onHide={() => setOpenModal(false)}>
                            <ContactFilters
                                setOpenModal={setOpenModal}
                                onExposeClear={(fn) => (clearRefActive.current = fn)}
                                onFiltersApplied={handleFiltersApplied}
                            />
                        </SideModal>

                        {activeFilteredKeys.length > 0 && (
                            <>
                                <FilteredByBar filters={activeFilteredKeys} />
                                <Button
                                    className="fbb-clear"
                                    type="button"
                                    variant="secondary"
                                    onClick={handleClearAllActive}
                                >
                                    {LABELS.products.CLEAR_ALL}
                                </Button>
                            </>
                        )}
                    </div>
                )}
                {
                    !isSingleView && withDisabledTooltip(
                        <Button variant="add"
                            onClick={() => setShowAddContact(true)}
                            disabled={isEditMode}
                        >
                            <DarkPlusIcon className="add-icon" aria-hidden />
                            Add contact
                        </Button>, "add-contact-tooltip")
                }

                <AddContactModal
                    show={showAddContact}
                    onHide={() => {
                        setShowAddContact(false);
                        handleContactRefetch();
                    }}
                />
            </div>

            {displayData.length > 0 ? (
                <>
                    <div className="mt-4">
                        {displayData.map((contactItem) => (
                            <ContactCards
                                key={contactItem.contactId}
                                data={contactItem}
                                isEdit={isEditMode}
                                idOpen={id != null && !isDetailPage}
                                onRefetch={handleContactRefetch}
                            />
                        ))}
                    </div>

                    {!isSingleView && <PaginationView currentPage={currentPage} rowsPerPage={rowsPerPage} displayTotal={displayTotal} onPageChange={handlePageChange} />}
                </>
            ) : (
                <FailSafePage cardType="noContact" />
            )}
        </div>
    );
};

export default ViewContacts;
