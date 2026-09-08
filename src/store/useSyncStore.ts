import { checkRefreshStatus, triggerRefresh } from "@/api/syncService";
import { create } from "zustand";

interface SyncJob {
    status: "idle" | "pending" | "success" | "error" | "processing" | "prompt";
    lastSynced?: string;
    operationId?: string;
}

interface SyncStore {
    jobs: Record<string, SyncJob>;
    hydrateJob: (id: string) => void;
    startSync: (type: string, id: string) => Promise<void>;
    updateSyncStatus: (id: string, status: Partial<SyncJob>) => void;
}

const useSyncStore = create<SyncStore>((set, get) => ({
    jobs: {},

    hydrateJob: (id: string) => {
        const stored = localStorage.getItem(`syncJob_${id}`);
        if (stored) {
            const parsed = JSON.parse(stored) as SyncJob;
            set((state) => ({
                jobs: { ...state.jobs, [id]: parsed },
            }));
        } else {
            set((state) => ({
                jobs: { ...state.jobs, [id]: { status: "idle" } },
            }));
        }
    },

    startSync: async (type: string, id: string) => {
        try {
            set((state) => ({
                jobs: { ...state.jobs, [id]: { ...state.jobs[id], status: "pending" } },
            }));

            const operationId = await triggerRefresh(type, id);

            set((state) => ({
                jobs: { ...state.jobs, [id]: { ...state.jobs[id], operationId } },
            }));

            checkRefreshStatus(id, operationId, get, type);
        } catch {
            set((state) => ({
                jobs: { ...state.jobs, [id]: { ...state.jobs[id], status: "error" } },
            }));
        }
    },

    updateSyncStatus: (id, statusUpdate) => {
        set((state) => {
            const newJob = { ...state.jobs[id], ...statusUpdate };
            localStorage.setItem(`syncJob_${id}`, JSON.stringify(newJob));
            return { jobs: { ...state.jobs, [id]: newJob } };
        });
    },
}));

export default useSyncStore;
