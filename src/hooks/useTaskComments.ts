import { useCallback, useEffect, useState } from "react";
import { fetchTaskComments, postTaskComment } from "@/api/taskComments";
import { ERROR_MESSAGES, ToastType } from "@/constants";
import type { TaskReviewComment } from "@/types/reviewComments";
import { showCustomToast } from "@ucc/common-ui";

export const useTaskComments = (taskId?: string) => {
  const taskUrl = import.meta.env.VITE_TASK_URL as string | undefined;
  const [comments, setComments] = useState<TaskReviewComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadComments = useCallback(async () => {
    if (!taskId || !taskUrl) {
      setComments([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetchTaskComments(taskUrl, taskId);
      setComments(response.comments);
    } catch {
      showCustomToast({
        type: ToastType.Error,
        title: "Failed",
        message: ERROR_MESSAGES.SOMETHINGS_WRONG,
      });
    } finally {
      setIsLoading(false);
    }
  }, [taskId, taskUrl]);

  useEffect(() => {
    void loadComments();
  }, [loadComments]);

  const sendComment = useCallback(
    async (message: string) => {
      if (!taskId || !taskUrl) return;

      setIsSubmitting(true);
      try {
        const created = await postTaskComment(taskUrl, taskId, { message });
        if (created) {
          setComments((prev) => [...prev, created]);
          return;
        }

        await loadComments();
      } catch {
        showCustomToast({
          type: ToastType.Error,
          title: "Failed",
          message: ERROR_MESSAGES.SOMETHINGS_WRONG,
        });
        throw new Error("Failed to post comment");
      } finally {
        setIsSubmitting(false);
      }
    },
    [taskId, taskUrl, loadComments],
  );

  return {
    comments,
    isLoading,
    isSubmitting,
    sendComment,
    reloadComments: loadComments,
  };
};
