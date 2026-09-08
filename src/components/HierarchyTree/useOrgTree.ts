import { useCallback, useState } from "react";
import api from "@/api/apiService";
import { API_ENDPOINTS, ERROR_MESSAGES, ToastType } from "@/constants";
import { showCustomToast } from "@ucc/common-ui";

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

export function useOrgTree() {
    const [dynamicChildMap, setDynamicChildMap] = useState<
        Record<string, { children?: OrgUnit[]; groups?: Group[] }>
    >({});
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

    const fetchChildrenForOrg = useCallback(async (orgId?: string) => {
        if (!orgId) return;
        // If org is already loaded, return
        if (dynamicChildMap[orgId]) return;

        setLoadingMap((s) => ({ ...s, [orgId]: true }));
        try {
            const res = await api.get<any>(
                `${API_ENDPOINTS.organization}/${orgId}${API_ENDPOINTS.children}`
            );
            const responseData = res?.data || res;
            // server may return array under data -> use first item or payload shape
            const payload = responseData?.[0] ?? responseData ?? null;
            const children = payload?.children ?? [];
            const groups = payload?.groups ?? [];
            setDynamicChildMap((prev) => ({ ...prev, [orgId]: { children, groups } }));
        } catch (error) {
            showCustomToast({
                type: ToastType.Error,
                title: "Failed",
                message: ERROR_MESSAGES.SOMETHINGS_WRONG,
            });
        } finally {
            setLoadingMap((s) => ({ ...s, [orgId]: false }));
        }
    }, [dynamicChildMap]);

    return {
        dynamicChildMap,
        loadingMap,
        fetchChildrenForOrg,
        setDynamicChildMap,
        setLoadingMap,
    };
}
