import api from "@/api/apiService";
import { showCustomToast } from "@ucc/common-ui";
import { API_ENDPOINTS, ToastType } from "@/constants";
import { GRP_DETAIL_PATH, ORG_DETAIL_PATH } from "@/router/routes";
import { capitalizeFirstLetter } from "@/utils";
import useSyncStore from "@/store/useSyncStore";
import useConfigStore from "@/store/configStore";
import { CountdownToast } from "./CountdownToast";

export async function triggerRefresh(
    type: string,
    id: string,
): Promise<string> {
    const res: any = await api.get(
        `${API_ENDPOINTS.sync}?entityType=${type}&entityId=${id}`,
    );
    const responseData = res?.data || res;
    return responseData;
}

export async function checkRefreshStatus(
    id: string,
    operationId: string,
    getStore: any,
    type: string
) {
    const { startSync } = useSyncStore.getState();
    let completed = false;

    const handleSync = () => {
        startSync(type, id);
    };
    const org = useConfigStore.getState().org;
    while (!completed) {
        try {
            const res: any = await api.get(
                `${API_ENDPOINTS.syncStatus}?operationId=${operationId}&timeout=60000`,
            );
            const responseData = res?.data || res;
            const rawStatus: string = responseData?.status ?? "";
            const status = rawStatus.toLowerCase(); // normalize
            if (status === "completed") {
                const now = new Date().toISOString();

                getStore().updateSyncStatus(id, {
                    status: "success",
                    lastSynced: now,
                });

                // ✅ also update configStore
                if (type === "organization") {
                    useConfigStore.getState().setOrg({ updatedAt: now });
                } else if (type === "group") {
                    useConfigStore.getState().setGroupUpdatedAt(now);
                }

                const currentPath = window.location.pathname;
                const isSamePage =
                    (type === "organization" &&
                        currentPath.includes(`${ORG_DETAIL_PATH}/${responseData.id}`)) ||
                    (type === "group" &&
                        currentPath.includes(`${GRP_DETAIL_PATH}/${responseData.id}`));

                const url = type === "organization" ? `${ORG_DETAIL_PATH}/${responseData.id}` : `${GRP_DETAIL_PATH}/${responseData.id}`;

                if (isSamePage) {
                    // show countdown toast then redirect after 3..2..1
                    showCustomToast({
                        type: ToastType.Success,
                        duration: Infinity,
                        title: (
                            <>
                                {capitalizeFirstLetter(type === "organization" ? "org" : type)} successfully synced.
                            </>
                        ),
                        message: (closeToast: () => void) => (
                            <CountdownToast
                                name={responseData.name}
                                url={url}
                                closeToast={closeToast}
                            />
                        )
                    });


                } else {
                    showCustomToast({
                        type: ToastType.Success,
                        title: (
                            <>
                                {capitalizeFirstLetter(type === "organization" ? "org" : type)} successfully synced.
                            </>
                        ),

                        message: (closeToast: () => void) => (
                            <div>
                                <div>{responseData.name}</div>
                                <a
                                    href={url}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        closeToast();
                                        window.location.href = url;
                                    }}
                                    className="text-primary ellipsis-cell toast-link"
                                >
                                    View
                                </a>
                            </div>
                        )
                    });
                }

                completed = true; // exit loop
            } else if (status === "failed") {
                getStore().updateSyncStatus(id, { status: "error" });
                showCustomToast({
                    type: ToastType.Error,
                    title: "Sync failed",
                    message: (closeToast: () => void) => (
                        <div>
                            <div>{responseData.name}</div>
                            <button
                                type="button"
                                onClick={() => {
                                    handleSync();
                                    closeToast(); // closes toast immediately
                                }}
                                className="text-primary ellipsis-cell toast-link"
                            >
                                Sync again
                            </button>
                        </div>
                    ),
                });
                completed = true; // exit loop
            }
        } catch {
            getStore().updateSyncStatus(id, { status: "error" });
            showCustomToast({
                type: ToastType.Error,
                title: "Sync failed",
                message: (closeToast: () => void) => (
                    <div>
                        <div>{org.orgName}</div>
                        <button
                            type="button"
                            onClick={() => {
                                handleSync();
                                closeToast(); // closes toast immediately
                            }}
                            className="text-primary ellipsis-cell toast-link"
                        >
                            Sync again
                        </button>
                    </div>
                )
            });

            completed = true;
        }
    }
}
