export interface TaskReviewComment {
  commentId: string;
  authorUserId: string;
  authorDisplayName: string;
  authorRole: string;
  message: string;
  commentType: string;
  createdAt: string;
}

export interface PostTaskCommentRequest {
  message: string;
}

export interface TaskReviewCommentsResponse {
  taskId: string;
  comments: TaskReviewComment[];
}
