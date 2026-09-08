import api from "@/api/apiService";
import type {
  PostTaskCommentRequest,
  TaskReviewComment,
  TaskReviewCommentsResponse,
} from "@/types/reviewComments";

export const getTaskCommentsUrl = (taskUrl: string, taskId: string): string =>
  `${taskUrl}client-configurations/tasks/${encodeURIComponent(taskId)}/comments`;

export const fetchTaskComments = async (
  taskUrl: string,
  taskId: string,
): Promise<TaskReviewCommentsResponse> => {
  const res: any = await api.get(getTaskCommentsUrl(taskUrl, taskId));
  const payload = res?.data ?? res;

  return {
    taskId: payload?.taskId ?? taskId,
    comments: Array.isArray(payload?.comments) ? payload.comments : [],
  };
};

export const postTaskComment = async (
  taskUrl: string,
  taskId: string,
  body: PostTaskCommentRequest,
): Promise<TaskReviewComment | undefined> => {
  const res: any = await api.post(getTaskCommentsUrl(taskUrl, taskId), body);
  const payload = res?.data ?? res;

  if (payload?.commentId) {
    return payload as TaskReviewComment;
  }

  if (payload?.comment?.commentId) {
    return payload.comment as TaskReviewComment;
  }

  return undefined;
};
