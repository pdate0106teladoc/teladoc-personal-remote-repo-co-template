import * as React from "react";
import { useEffect, useState } from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import { API_ENDPOINTS, ERROR_MESSAGES, SHOW_RECORDS_PER_PAGE_GLOBAL_SEARCH, ToastType } from "@/constants";
import ViewContacts from "@/pages/contacts/ViewContacts";
import { contactSearchResults } from "@/types/search";
import api from "@/api/apiService";
import { contact } from "@/pages/contacts/ContactCards";
import { useContactFilterStore } from "@/store/useContactFilterStore";
import { Loader, showCustomToast } from "@ucc/common-ui";
import { TaskResponse } from "@/types/edit";

interface ContactsProps {
    id?: string;
    entityCounts?: { contacts?: number };
}

const Contacts: React.FC<ContactsProps> = ({ id: propId, entityCounts }) => {
    const searchUrl = import.meta.env.VITE_SEARCH_BASE_URL;
    const taskUrl = import.meta.env.VITE_TASK_URL;
    const params = useParams<{ id: string; candidateId?: string }>();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const isGroupContext = location.pathname.includes("/groups/") ? "group" : "organization";
    const id = propId ?? params.id;
    const candidateId = params.candidateId;
    const [contacts, setContacts] = useState<Array<contact>>([]);
    const page = Number(searchParams.get("page") ?? 0);
    const [loading, setLoading] = useState<boolean>(false);
    const [totalResults, setTotalResults] = useState<number | undefined>(
        entityCounts?.contacts
    );
    const [entityDraftId, setEntityDraftId] = useState<string>("");
    const appliedMeta = useContactFilterStore((s) => s.getApplied());
    const isFiltering = appliedMeta.filterApplied > 0;
    const isEditMode = location.pathname.includes("/edit/");

    useEffect(() => {
        if (!id) return;
        if (isEditMode && !candidateId) return;
        if (isFiltering) return;
        fetchContacts();
    }, [id, page, isEditMode, entityDraftId, isFiltering]);

    useEffect(() => {
        if (!isEditMode || !candidateId) return;
        setLoading(true);
        (async () => {
            try {
                const taskResponse: TaskResponse = await api.get(
                    `${taskUrl}client-configurations/tasks/${candidateId}`
                );
                if (taskResponse?.entities?.length) {
                    setEntityDraftId(taskResponse.entities[0].draftId);
                }
            } catch {
                showCustomToast({ type: ToastType.Error, title: "Failed", message: ERROR_MESSAGES.SOMETHINGS_WRONG });
            } finally {
                setLoading(false);
            }
        })();
    }, [isEditMode, candidateId, taskUrl]);



    async function fetchContacts() {
        if (isFiltering) return;
        const searchId = isEditMode ? entityDraftId : id;
        if (!searchId) return;
        setLoading(true);
        try {
            const finalUrl = `${API_ENDPOINTS.contacts}?searchTerm=${encodeURIComponent(
                String(searchId)
            )}&searchType=${isGroupContext}&page=${page}&limit=${SHOW_RECORDS_PER_PAGE_GLOBAL_SEARCH}`;

            const response = await api.get<contactSearchResults>(
                finalUrl,
                {},
                { baseURL: searchUrl }
            );
            const responseData = response?.data || response;
            setContacts(responseData?.contacts ?? []);
            setTotalResults(responseData?.page?.totalResults);
        } catch {
            showCustomToast({
                type: ToastType.Error,
                title: "Failed",
                message: ERROR_MESSAGES.SOMETHINGS_WRONG,
            });
            setContacts([]);
        } finally {
            setLoading(false);
        }
    }

    const handlePageChange = (newPage: number) => {
        setSearchParams((prev) => {
            const newParams = new URLSearchParams(prev);
            newParams.set("page", String(newPage));
            return newParams;
        });
    };

    if (loading) {
        return <Loader text="Loading..." />;
    }
    return (
        <div>
            <ViewContacts
                totalRecords={totalResults ?? 0}
                pageSize={SHOW_RECORDS_PER_PAGE_GLOBAL_SEARCH}
                showPagination={true}
                page={page}
                data={contacts}
                onPageChange={handlePageChange}
                onClearFilter={() => {
                    setSearchParams((prev) => {
                        const newParams = new URLSearchParams(prev);
                        newParams.set("page", "0");
                        return newParams;
                    });
                }}
                onRefetch={fetchContacts}
                searchTerm={encodeURIComponent(String(isEditMode ? entityDraftId : id))}
                searchType={isGroupContext}
                clearOnUnmount={true}
            />
        </div>
    );
}
export default Contacts;
