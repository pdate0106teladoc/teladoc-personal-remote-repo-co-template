import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./CompareRestoreSidebar.scss";
import { Button, CustomTable, Loader, TableColumn, showCustomToast, ToastType, FailSafePage } from "@ucc/common-ui";
import ExpandCollapse from "../ExpandCollapse/ExpandCollapse";
import RestoreConfirmationModal from "../Modal/RestoreConfirmationModal";
import RoundedLabel from "@/components/RoundedLabel/RoundedLabel";
import { OrgHistory } from "@/types/edit";
import {
    ChangedFieldRow,
    ChangeResponse,
    transformChangesToSections,
} from "@/data/fieldLabelRegistry";
import api from "@/api/apiService";
import { API_ENDPOINTS, ERROR_MESSAGES } from "@/constants";

interface CompareRestoreSidebarProps {
    entityType: "GROUP" | "ORGANIZATION";
    onCancel?: () => void;
    onRestoreSuccess?: () => void;
    selectedRow?: OrgHistory | null;
}

const CHANGED_FIELDS_COLUMNS: TableColumn<ChangedFieldRow>[] = [
    { label: "", field: "field" },
    { label: "Current value", field: "previousValue" },
    { label: "Version value", field: "updatedValue" },
];

const CompareRestoreSidebar: React.FC<CompareRestoreSidebarProps> = ({
    entityType,
    onCancel,
    onRestoreSuccess,
    selectedRow,
}) => {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [changedFieldsData, setChangedFieldsData] = useState<ChangeResponse | undefined>();
    const [changedFieldsLoading, setChangedFieldsLoading] = useState(false);
    const taskUrl = import.meta.env.VITE_TASK_URL;

    const fetchChangedFields = useCallback(async () => {
        if (!selectedRow?.draftId) return;
        try {
            setChangedFieldsLoading(true);
            const res: any = await api.post(
                `${taskUrl}${API_ENDPOINTS.diffLibrary}?draftId=${selectedRow.draftId}&entityType=${entityType}&context=ORG_HISTORY`,
            );
            setChangedFieldsData(res?.data ?? res);
        } catch {
            setChangedFieldsData(undefined);
            showCustomToast({
                type: ToastType.Error,
                title: "Failed",
                message: ERROR_MESSAGES.SOMETHINGS_WRONG,
            });
        } finally {
            setChangedFieldsLoading(false);
        }
    }, [selectedRow?.draftId, entityType, taskUrl]);

    useEffect(() => {
        if (!selectedRow?.draftId) {
            setChangedFieldsData(undefined);
            return;
        }
        void fetchChangedFields();
    }, [selectedRow?.draftId, selectedRow?.versionMongoId, fetchChangedFields]);

    const { sections, arrayChangeSections } = useMemo(
        () => transformChangesToSections(changedFieldsData),
        [changedFieldsData],
    );

    const renderChangedFields = () => {
        if (changedFieldsLoading) return <Loader text="Loading..." />;
        if (sections.length === 0 && arrayChangeSections.length === 0) {
            return <div className="compare-empty-state"><FailSafePage cardType="noData"/></div>;
        }
        return (
            <>
                {sections.map(({ title, rows }) => (
                    <ExpandCollapse
                        key={title}
                        title={title}
                        defaultExpanded={true}
                        data={rows}
                        columns={CHANGED_FIELDS_COLUMNS}
                        contentClassName="changed-fields-table"
                    />
                ))}
                {arrayChangeSections.map(({ tabLabel, items }) => (
                    <div key={tabLabel} className="array-change-section">
                        {items.map((item) => (
                            <div key={item.id} className="array-change-item">
                                <div className="array-change-item-header">
                                    <RoundedLabel text={tabLabel} variant="grey" />
                                    <span className="array-change-item-id">{item.id}</span>
                                </div>
                                <CustomTable
                                    data={item.rows}
                                    columns={CHANGED_FIELDS_COLUMNS}
                                    showPagination={false}
                                />
                            </div>
                        ))}
                    </div>
                ))}
            </>
        );
    };

    return (
        <div className="compare-restore-sidebar">
            <div className="content">
                <div className="changed-fields-wrapper">{renderChangedFields()}</div>
            </div>

            <div className="footer">
                <Button variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={() => setShowConfirmation(true)}>
                    Restore
                </Button>
            </div>

            <RestoreConfirmationModal
                show={showConfirmation}
                handleClose={() => setShowConfirmation(false)}
                onRestoreSuccess={() => { setShowConfirmation(false); onRestoreSuccess?.(); onCancel?.(); }}
                selectedRow={selectedRow}
            />
        </div>
    );
};

export default CompareRestoreSidebar;
