import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/Files.scss";
import {
    CustomTable,
    Loader,
    showCustomToast,
    TableColumn,
    ToastType,
    FailSafePage,
    ERROR_MESSAGES,
} from "@ucc/common-ui";
import api from "@/api/apiService";
import { TaskResponse } from "@/types/edit";
import {
    downloadFile,
    normalizeFileLinkEntry,
    removeTrailingTimestamp,
} from "@/utils";

/** One row per `fileLink` entry: friendly title vs full storage key for download API. */
interface FileRow {
    displayName: string;
    storageName: string;
    sizeBytes: number;
}

interface FilesProps {
    entityId?: string;
    entityType?: "organization" | "group";
}

const TaskFileList: React.FC<FilesProps> = () => {
    const taskUrl = import.meta.env.VITE_TASK_URL;
    const { candidateId } = useParams<{ candidateId?: string }>();
    const [files, setFiles] = useState<FileRow[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const download = async (filename: string) => {
        try {
            const response: any = await api.get(`${taskUrl}client-configurations/file/upload/${filename}`);
            const res = response?.data || response;
            const decoded = atob(res?.content);
            const name = res?.filename ?? "-";
            const lastDotIndex = name?.lastIndexOf('.');
            const type = name?.slice(lastDotIndex + 1);
            downloadFile(name, decoded, type);
        }
        catch {
            showCustomToast({
                type: ToastType.Error,
                title: "Failed",
                message: ERROR_MESSAGES.SOMETHINGS_WRONG,
            });
        }
    }

    const fetchTaskDetails = useCallback(async () => {
        if (!candidateId) {
            setFiles([]);
            return;
        }
        try {
            setLoading(true);
            const response: TaskResponse = await api.get(
                `${taskUrl}client-configurations/tasks/${candidateId}`,
            );
            const links = Array.isArray(response.fileLink)
                ? response.fileLink
                : [];
            setFiles(
                links
                    .map((entry) => {
                        const { storageName, sizeBytes } =
                            normalizeFileLinkEntry(entry);
                        return {
                            displayName: removeTrailingTimestamp(storageName),
                            storageName,
                            sizeBytes,
                        };
                    })
                    .filter((row) => row.storageName),
            );
        } catch {
            showCustomToast({
                type: ToastType.Error,
                title: "Failed",
                message: "Failed to load task files. Please try again.",
            });
            setFiles([]);
        } finally {
            setLoading(false);
        }
    }, [taskUrl, candidateId]);

    useEffect(() => {
        void fetchTaskDetails();
    }, [fetchTaskDetails]);

    const FILES_COLUMNS: TableColumn<FileRow>[] = [
        {
            label: "Title",
            field: "displayName",
            render(value, row) {
                return (
                    <span
                        className="text-blue"
                        role="button"
                        tabIndex={0}
                        onClick={() => download(row.storageName)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                void download(row.storageName);
                            }
                        }}
                    >
                        {value}
                    </span>
                );
            },
        },
        {
            label: "Size",
            field: "sizeBytes",
            render(value) {
                const n = Number(value);
                if (!n || Number.isNaN(n)) return <span>—</span>;
                return <span>{`${(n / 1024).toFixed(2)} Kb`}</span>;
            },
        },
    ];

    return (
        <div className="edit-files-container">
            <div className="edit-files-content">
                {loading ? (
                    <Loader text="Loading files..." />
                ) : files?.length > 0 ? (
                    <CustomTable
                        data={files}
                        columns={FILES_COLUMNS}
                        showPagination={false}
                    />
                ) : (
                    <FailSafePage cardType="noData" />
                )}
            </div>
        </div>
    );
};

export default TaskFileList;
