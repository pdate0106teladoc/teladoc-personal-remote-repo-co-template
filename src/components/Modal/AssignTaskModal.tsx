import { Modal } from "react-bootstrap";
import "./BasicModal.scss";
import { useMemo, useState } from "react";
import { Button, MultiSelectSearch } from "@ucc/common-ui";
import api from "@/api/apiService";

const AssignModal: React.FC<{
    show: boolean;
    taskId: string;
    createdBy: string | undefined;
    handleClose: () => void;
    handleAssign: (method: "saveAndStart" | "save", id: string) => void;
}> = ({ show, taskId, handleClose, handleAssign, createdBy }) => {
    const [assignee, setAssignee] = useState<Record<string, string>>({});
    const userId = JSON.parse(localStorage.getItem("auth-storage") || "{}").state?.user?.userId;
    const assigneeId = Object.keys(assignee)[0];
    const assigneeName = Object.values(assignee)[0]?.replace(/\s*\(Me\)$/, "");
    const isCreator = !!assigneeName && createdBy === assigneeName;
    const lookupUrl = `${import.meta.env.VITE_TASK_URL}client-configurations/tasks/${taskId}/assigneeLookup`;
    const postApi = useMemo(
        () => ({
            get: async (url: string) => {
                const res: any = await api.get(url);
                return (res?.data ?? []).map((user: any) => ({
                    ...user,
                    id: user.userId,
                    name: user.userId === userId ? `${user.name} (Me)` : user.name
                }));
            },
        }),
        [],
    );


    return (
        <>
            <Modal
                dialogClassName="source-modal"
                show={show}
                onHide={() => { handleClose(); setAssignee({}); }}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Assign task</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="assign-task-modal-body p-5">
                        <MultiSelectSearch
                            label={`Assignee\u00A0`}
                            isRequired={true}
                            placeholder="Search by name."
                            multiSelect={false}
                            onChange={setAssignee}
                            preSelected={assignee}
                            api={postApi}
                            buildSearchParams={(searchTerm: string) => ({
                                searchParam: searchTerm,
                                page: "0",
                                pageSize: "5"
                            })}
                            apiUrl={lookupUrl}
                        />
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <div className="footer w-100 justify-content-between">
                        <Button className="signin-button" onClick={() => { setAssignee({}); handleClose(); }}>
                            Cancel
                        </Button>
                        <div className="d-flex flex-row gap-2">
                            <Button className="signin-button"
                                onClick={() => {
                                    setAssignee({});
                                    handleAssign("saveAndStart", assigneeId);
                                }}
                                disabled={userId !== assigneeId || isCreator}
                            >
                                Save and start
                            </Button>
                            <Button
                                onClick={() => {
                                    setAssignee({});
                                    handleAssign("save", assigneeId);
                                }}
                                disabled={!assigneeId || isCreator}
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default AssignModal;
