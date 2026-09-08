import { useState } from "react";
import useSyncStore from "@/store/useSyncStore";
import { SyncModal as UISyncModal } from "@ucc/common-ui";
import { useKillSwitchStore } from "@/store/killSwitchStore";

interface Props {
    id?: string;
    type: "organization" | "group";
    lastUpdatedAt?: string;
    onClose?: () => void;
}

const SyncModal = ({ id, type, lastUpdatedAt, onClose }: Props) => {
    const { killSwitchStatus } = useKillSwitchStore();
    const [show, setShow] = useState(true);
    const { startSync } = useSyncStore();

    // Do not show if no id or no lastUpdatedAt
    if (!show || !id || !lastUpdatedAt) return null;

    const handleSync = () => {
        startSync(type, id);
        setShow(false);
        onClose?.();
    };

    const handleLater = () => {
        setShow(false);
        onClose?.();
    };

    return (
        <UISyncModal
            show={show}
            lastUpdatedAt={lastUpdatedAt}
            onSync={handleSync}
            onClose={handleLater}
            killSwitchStatus={killSwitchStatus}
        />
    );
};

export default SyncModal;
