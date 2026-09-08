import React, { useState, useCallback, useRef, useEffect } from "react";
import "./SubmitUpdateForm.scss";
import Breadcrumb from "@/components/Breadcrumb/CustomBreadcrumb";
import { Button, showCustomToast, ToastType } from "@ucc/common-ui";
import SubmitSettingForm from "./SubmitSettingForm";
import ConfirmationForm from "./ConfirmationForm";
import api from "@/api/apiService";
import { useLocation, useParams } from "react-router-dom";
import { TaskResponse } from "@/types/edit";
import { buildAutoSaveRetryToastMessage } from "@/hooks/useAutoSavePatch";
import { API_ENDPOINTS, ERROR_MESSAGES } from "@/constants";
import { normalizeTaskStatus, TASK_STATUS } from "@/constants/taskStatus";
import { ChangeResponse, normalizeReviewDiffToChangeResponse } from "@/data/fieldLabelRegistry";

type SubmitUpdateFormProps = {
  onSubmitSuccess?: () => void;
  flushPendingSave?: () => Promise<boolean>;
};

const SubmitUpdateForm: React.FC<SubmitUpdateFormProps> = ({
  onSubmitSuccess,
  flushPendingSave,
}) => {
  const [activeIndex, setActiveIndex] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitConfirmed, setSubmitConfirmed] = useState(false);
  const [taskDetails, setTaskDetails] = useState<TaskResponse | undefined>();
  const submitFailureCountRef = useRef(0);
  const { candidateId } = useParams<{
    candidateId?: string;
  }>();
  const location = useLocation();
  const workFlow = import.meta.env.VITE_WORKLOG_URL;
  const taskUrl = import.meta.env.VITE_TASK_URL;
  const entity = location.pathname.includes("/groups/") ? "groups" : "organizations";
  const [diffData, setDiffData] = useState<ChangeResponse | undefined>();
  const [rawDiff, setRawDiff] = useState<any>(undefined);
  const [diffLoading, setDiffLoading] = useState(false);

  const fetchDiffLibrary = useCallback(async () => {
    if (!taskDetails?.entities?.length || !candidateId) return;
    const entityItem = taskDetails.entities[0];
    const entityType = entityItem.type?.toUpperCase() === "GROUP" ? "GROUP" : "ORGANIZATION";
    const isDraft = normalizeTaskStatus(taskDetails.status) === TASK_STATUS.DRAFT;

    try {
      setDiffLoading(true);
      if (isDraft) {
        const res: any = await api.post(
          `${taskUrl}${API_ENDPOINTS.diffLibrary}?draftId=${entityItem.draftId}&entityType=${entityType}&context=SUBMIT`,
        );
        const data = res?.data ?? res;
        setDiffData(data);
        setRawDiff(data);
      } else {
        const res: any = await api.get(
          `${taskUrl}${API_ENDPOINTS.approveTask}/${candidateId}/review`,
        );
        setRawDiff(res?.diff);
        setDiffData(
          normalizeReviewDiffToChangeResponse(res?.diff, {
            scalarStatusFilter: "CORRECTED",
          }),
        );
      }
    } catch {
      setDiffData(undefined);
      setRawDiff(undefined);
    } finally {
      setDiffLoading(false);
    }
  }, [taskDetails, taskUrl, candidateId]);

  useEffect(() => {
    if(taskDetails?.entities && !diffData){
      fetchDiffLibrary()
    }
  },[fetchDiffLibrary, taskDetails, diffData])

  const handleUpdate = useCallback(async (payload: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      if (flushPendingSave) {
        const saved = await flushPendingSave();
        if (!saved) {
          showCustomToast({
            type: ToastType.Error,
            title: "Failed",
            message: "Failed to save pending changes. Please try again.",
          });
          return;
        }
      }

      await api.post(
        `${workFlow}client-configurations/${entity}/${taskDetails?.entities[0]?.draftId}/tasks/${candidateId}/submit`,
        payload,
      );
      submitFailureCountRef.current = 0;
      showCustomToast({
        type: ToastType.Success,
        title: "Success",
        message: "Update submitted successfully.",
      });
      setSubmitConfirmed(false);
      setActiveIndex(1);
      onSubmitSuccess?.();
    } catch {
      submitFailureCountRef.current += 1;
      if (submitFailureCountRef.current === 1) {
        showCustomToast({
          type: ToastType.Error,
          title: "Failed",
          message: buildAutoSaveRetryToastMessage(() => {
            void handleUpdate(payload);
          }, "Failed to update the task."),
        });
      } else {
        showCustomToast({
          type: ToastType.Error,
          title: "Failed",
          message: ERROR_MESSAGES.AUTO_SAVE_RETRY_OR_SERVICE_DESK,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [
    workFlow,
    candidateId,
    entity,
    onSubmitSuccess,
    taskDetails,
    flushPendingSave,
  ]);

  const handleStepOneContinue = () => {
    if (isSubmitting) return;
    setActiveIndex(2);
  };

  const handleFinalSubmit = async () => {
    if (isSubmitting || !submitConfirmed) return;
    await handleUpdate({ diff: rawDiff, acknowledgementConfirmed: true });
  };

  const handleBack = () => {
    setSubmitConfirmed(false);
    setActiveIndex((prev) => Math.max(prev - 1, 1));
  };

  let content;
  if (activeIndex === 1)
    content = (
      <SubmitSettingForm
        onContinue={handleStepOneContinue}
        onTaskDetailsChange={setTaskDetails}
      />
    );
  else if (activeIndex === 2)
    content = (
      <ConfirmationForm
        confirmed={submitConfirmed}
        onConfirmedChange={setSubmitConfirmed}
        taskDetails={taskDetails}
        diffData={diffData}
        loading={diffLoading}
      />
    );

  return (
    <div className="right-modal-basics">
      <div className="request-form-container">
        <div className="request-header">
          <Breadcrumb
            items={["1. Submission setting", "2. Confirmation"]}
            activeIndex={activeIndex - 1}
          />
        </div>
        {content}
      </div>
      <div
        className={`request-change-footer ${activeIndex === 1 ? "justify-content-end" : "justify-content-between"} bottom-0 w-100 d-flex position-absolute`}
      >
        {activeIndex > 1 && (
          <Button
            className="back-button"
            onClick={handleBack}
            disabled={isSubmitting}
          >
            Back
          </Button>
        )}
        {activeIndex > 1 && (
          <Button
            className="continue-button"
            onClick={handleFinalSubmit}
            disabled={
              isSubmitting ||
              (activeIndex === 2 && !submitConfirmed)
            }
          >
            {activeIndex === 2
              ? isSubmitting
                ? "Submitting..."
                : "Submit"
              : "Continue"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default SubmitUpdateForm;
