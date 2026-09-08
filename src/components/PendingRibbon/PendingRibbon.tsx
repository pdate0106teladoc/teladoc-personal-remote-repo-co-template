import { useState } from "react";
import { FaTriangleExclamation } from "react-icons/fa6";
import "./PendingRibbon.scss";
import { SideModal } from "@ucc/common-ui";
import PendingChangesSidebar from "../sidebar/PendingChangesSidebar";
import { Task } from "@/types/edit";

const PendingRibbon: React.FC<{ data: Task[]}> = ({ data }) => {
    const [showSlider, setShowSlider] = useState(false);
    return (
        <>
            <div className={`validate-ribbon validate-idle`}>
                <div className="validate-ribbon prompt">
                    <div className="message">
                        <FaTriangleExclamation />
                        <strong>There are pending changes for the current organization.</strong>&nbsp;<div className="view-details" onClick={() => setShowSlider(true)}>View details</div>
                    </div>
                </div>
            </div>
            <SideModal show={showSlider} title="Pending changes" onHide={() => setShowSlider(false)}>
                <PendingChangesSidebar data={data} />
            </SideModal>
        </>
    );
};

export default PendingRibbon;
