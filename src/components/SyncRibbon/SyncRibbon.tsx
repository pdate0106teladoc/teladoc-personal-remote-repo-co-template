import { useEffect } from "react";
import useSyncStore from "@/store/useSyncStore";
import { SyncRibbon as UISyncRibbon } from "@ucc/common-ui";
import { useKillSwitchStore } from "@/store/killSwitchStore";

interface Props {
    id: string;
    type: "organization" | "group";
    apiLastSynced?: string;
}

const SyncRibbon = ({ id, type, apiLastSynced }: Props) => {
    const { killSwitchStatus } = useKillSwitchStore();
    const { jobs, startSync, hydrateJob, updateSyncStatus } = useSyncStore();
    const job = jobs[id];

    useEffect(() => {
        hydrateJob(id);
    }, [id, hydrateJob]);

    // automatically set prompt if lastSynced > 10 mins
    useEffect(() => {
        if (!job?.lastSynced) return;
        const diffMinutes =
            (new Date().getTime() - new Date(job.lastSynced).getTime()) / 60000;
        if (
            diffMinutes > 10 &&
            job.status !== "processing" &&
            job.status !== "pending"
        ) {
            updateSyncStatus(id, { status: "prompt" });
        }
    }, [job?.lastSynced, job?.status, id, updateSyncStatus]);

    const handleSync = () => {
        startSync(type, id);
    };

    return (
        <UISyncRibbon
            status={job?.status}
            lastSynced={job?.lastSynced}
            apiLastSynced={apiLastSynced}
            onSync={handleSync}
            killSwitchStatus={killSwitchStatus}
        />
    );
};

export default SyncRibbon;
