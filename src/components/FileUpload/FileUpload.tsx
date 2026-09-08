import React, { useEffect, useRef, useState } from "react";
import "./FileUpload.scss";
import { Cross, ERROR_MESSAGES, showCustomToast, SuccessIcon, ToastType } from "@ucc/common-ui";
import { Spinner } from "react-bootstrap";
import api from "@/api/apiService";
import { DustbinIcon, ExclamationIcon } from "@/assets";
import {
  downloadFile,
  encodeFileLinkWithSize,
  formatFileSize,
  removeTrailingTimestamp,
} from "@/utils";
import { ApiReturnedFile } from "@/types/edit";

type UploadFile = {
  files: File[];
  id?: string;
  status?: "in-progress" | "done" | "error";
  ApifileName?: string;
};

interface fileUploadProps {
  onUpload?: (file: string[]) => void;
  fileList?: ApiReturnedFile[];
}

const FileUpload: React.FC<fileUploadProps> = ({ onUpload, fileList }) => {
  const [disableDelete, setDisableDelete] = useState<boolean>(false);
  const [selectedFiles, setselectedFiles] = useState<UploadFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [wrongFileType, setWrongFileType] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const taskUrl = import.meta.env.VITE_TASK_URL;
  const allowedTypes = ["text/plain", "text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/pdf"];
  const [uploadedFiles, setUploadedFiles] = useState<ApiReturnedFile[]>(fileList ?? []);

  useEffect(() => {
    setUploadedFiles(fileList ?? []);
  }, [fileList]);

  const handleRemove = async (fileObj: ApiReturnedFile) => {
    if (!fileObj.apiReturnedFileName) return;
    setDisableDelete(true);
    try {
      if (fileObj.status === "success") {
        await api.delete(`${taskUrl}client-configurations/file/upload/${fileObj.apiReturnedFileName}`);
      }
      setUploadedFiles((prev) => {
        const updated = prev.filter((file) => file.apiReturnedFileName !== fileObj.apiReturnedFileName);
        // Call onUpload after state update
        if (onUpload) {
          setTimeout(() => {
            onUpload(
              updated
                .filter(
                  (file) =>
                    file.status === "success" && file.apiReturnedFileName,
                )
                .map((file) =>
                  encodeFileLinkWithSize(
                    file.apiReturnedFileName!,
                    file.size ?? 0,
                  ),
                ),
            );
          }, 0);
        }
        return updated;
      });
    } catch (error) {
      showCustomToast({
        type: ToastType.Error,
        title: "Failed",
        message: ERROR_MESSAGES.SOMETHINGS_WRONG,
      });
    }
    finally {
      setDisableDelete(false);
    }
  };

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
    catch (err) {
      showCustomToast({
        type: ToastType.Error,
        title: "Failed",
        message: ERROR_MESSAGES.SOMETHINGS_WRONG,
      });
    }
  }

  const handleRemoveSelectedFile = (batchId: string | undefined, fileToRemove: File) => {
    setselectedFiles(prev =>
      prev
        .map(batch => {
          if (batch.id !== batchId) return batch;

          const updatedFiles = batch.files.filter(
            f => !(f.name === fileToRemove.name && f.size === fileToRemove.size)
          );

          return { ...batch, files: updatedFiles };
        })
        .filter(batch => batch.files.length > 0)
    );
  };

  const fileUploadFun = async (fileBatch: UploadFile) => {
    try {
      const formData = new FormData();
      fileBatch.files.forEach((file) => {
        formData.append("files", file);
      });

      const response: any = await api.post(
        `${taskUrl}client-configurations/file/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response) {
        setselectedFiles((prev) =>
          prev.map((batch) =>
            batch.id === fileBatch.id
              ? { ...batch, status: "done" }
              : batch
          )
        );
        const filesSucceeded: ApiReturnedFile[] = response?.successes?.map((file: any) => ({
          apiReturnedFileName: file.filename,
          url: file.url,
          size: file.sizeBytes,
          status: "success"
        })) || [];
        const filesFailed: ApiReturnedFile[] = response?.failures?.map((file: any) => ({
          apiReturnedFileName: file.filename,
          url: file.url,
          size: file.sizeBytes || 0,
          status: "failure",
          reason: file.reason || "Unknown error"
        })) || [];

        setUploadedFiles((prev) => {
          const updated = [...prev, ...filesSucceeded, ...filesFailed];
          // Call onUpload after state update
          if (onUpload) {
            setTimeout(() => {
              onUpload(
                updated
                  .filter(
                    (file) =>
                      file.status === "success" && file.apiReturnedFileName,
                  )
                  .map((file) =>
                    encodeFileLinkWithSize(
                      file.apiReturnedFileName!,
                      file.size ?? 0,
                    ),
                  ),
              );
            }, 0);
          }
          return updated;
        });
      }
    } catch {
      setselectedFiles((prev) =>
        prev.map((batch) =>
          batch.id === fileBatch.id
            ? { ...batch, status: "error" }
            : batch
        )
      );
      showCustomToast({
        type: ToastType.Error,
        title: "Failed",
        message: ERROR_MESSAGES.SOMETHINGS_WRONG,
      });
    }
  }

  const MAX_FILE_SIZE = 5 * 1024 * 1024;   // 5 MB
  const MAX_BATCH_SIZE = 50 * 1024 * 1024; // 50 MB

  const processFile = (file: FileList | File[]) => {
    const selected = Array.from(file);
    const hasWrongType = selected.some(f => !allowedTypes.includes(f.type));
    const hasLargeFile = selected.some(f => f.size >= MAX_FILE_SIZE);
    const totalSize = selected.reduce((sum, f) => sum + f.size, 0) +
      uploadedFiles.reduce((sum, f) => sum + (f.size ?? 0), 0);
    const exceedsBatchLimit = totalSize > MAX_BATCH_SIZE;
    
    if (hasWrongType || hasLargeFile || exceedsBatchLimit) {
      setWrongFileType(true);
      if (hasWrongType) {
        setErrorMessage("Invalid file type.");
      } else if (hasLargeFile) {
        setErrorMessage("One or more files exceed the 5 MB limit.");
      } else if (exceedsBatchLimit) {
        setErrorMessage("Total file size exceeds 50 MB limit.");
      }
      return;
    }

    setWrongFileType(false);
    setErrorMessage("");

    const fileBatch: UploadFile = {
      files: selected,
      id: crypto.randomUUID(),
      status: "in-progress"
    };

    setselectedFiles(prev => [...prev, fileBatch]);
    fileUploadFun(fileBatch);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
    processFile(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    setWrongFileType(false);
    setErrorMessage("");
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleChooseFilesClick = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWrongFileType(false);
    setErrorMessage("");
    if (!e.target.files || e.target.files.length === 0) return;
    processFile(e.target.files as FileList);
    e.target.value = "";
  };

  return (
    <div className="file-upload">
      <label className="section-label">File (Implementation Acknowledgment Form, etc.)</label>
      <div className="upload-modal-body">
        <span className="modal-message">Upload your file below. The max file size is 5 MB.</span>
        {wrongFileType && (
          <div className="error-dialog d-flex align-items-center justify-content-start gap-2">
            <Cross />
            <span className="bold-text">Upload failed.</span>
            <span className="regular-text">{errorMessage}</span>
          </div>
        )}
        <div
          className={`upload-area ${dragOver ? "drag-over" : ""}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {!dragOver ? (
            <>
              <div className="file-text">Drag and drop or</div>
              <button
                className="upload-button"
                onClick={handleChooseFilesClick}
              >
                choose file
              </button>
              <input
                type="file"
                multiple={true}
                ref={inputRef}
                className="file-input"
                data-testid="file-input"
                onChange={handleFileChange}
              />
            </>
          ) : (
            <span className="drag-text">Drop your file here</span>
          )}
        </div>
        <div className="w-100">
          {selectedFiles.length > 0 &&
            selectedFiles
              .filter(fileBatch => fileBatch.status === "in-progress")
              .map(fileBatch => (
                <div className="d-flex flex-column align-items-start gap-2 w-100" key={fileBatch.id}>
                  {fileBatch.files.map(file => (
                    <div className="d-flex flex-row align-items-center justify-content-between ps-3" key={file.name + file.size}>
                      <div className="file-info">
                        <Spinner className="searching-spinner" />
                        <span className="file-name">
                          {file.name.length > 20
                            ? `${file.name.slice(0, 15)}...${file.name.slice(file.name.lastIndexOf("."))}`
                            : file.name}
                        </span>
                        <span className="file-size">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ))
          }
          {selectedFiles.length > 0 &&
            selectedFiles
              .filter(fileBatch => fileBatch.status === "error")
              .map(fileBatch => (
                <div className="d-flex flex-column align-items-center gap-2 w-100" key={fileBatch.id}>
                  {fileBatch.files.map(file => (
                    <div className="w-100" role="alert" key={file.name + file.size}>
                      <div className="ribbon-content d-flex flex-row justify-content-between align-items-center w-100">
                        <div className="d-flex flex-row gap-2 align-items-center">
                          <ExclamationIcon width={20} />
                          <span className="file-name">{`Couldn't upload ${file.name}`}</span>
                          <span className="file-size">Please try again</span>
                        </div>
                        <button
                          className="ribbon-close"
                          onClick={() => handleRemoveSelectedFile(fileBatch.id, file)}
                          aria-label="Close"
                          disabled={disableDelete}
                        >
                          <DustbinIcon />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))
          }
          {
            uploadedFiles.length > 0 &&
            uploadedFiles
              .map((file, index) =>
              (
                <div key={index} className="w-100">
                  {file.status === "success" ?
                    <div className="ribbon-content d-flex flex-row justify-content-between align-items-center w-100">
                      <div className="d-flex flex-row gap-2 align-items-center">
                        <SuccessIcon width={20} />
                        <span className="file-name" onClick={() => download(file?.apiReturnedFileName)}>{removeTrailingTimestamp(file?.apiReturnedFileName)}</span>&nbsp;
                        <span className="file-size">
                          {formatFileSize(file?.size)}
                        </span>
                      </div>
                      <button disabled={disableDelete} className="ribbon-close" onClick={() => handleRemove(file)} aria-label="Close">
                        <DustbinIcon />
                      </button>
                    </div>
                    :
                    <div className="ribbon-content d-flex flex-row justify-content-between align-items-center w-100">
                      <div className="d-flex flex-row gap-2 align-items-center">
                        <ExclamationIcon width={20} />
                        <span className="file-name">{`Couldn't upload ${file.apiReturnedFileName}`}</span>
                        <span className="file-size">Please try again</span>
                      </div>
                      <button disabled={disableDelete} className="ribbon-close" onClick={() => handleRemove(file)} aria-label="Close">
                        <DustbinIcon />
                      </button>
                    </div>
                  }
                </div>
              ))}
        </div>
      </div>
    </div >
  );
};

export default FileUpload;
