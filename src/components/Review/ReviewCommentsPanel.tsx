import React, { useMemo, useState } from "react";
import { LuSend } from "react-icons/lu";
import type { TaskReviewComment } from "@/types/reviewComments";
import { formatRelativeTime, getInitials } from "@/utils";
import "./ReviewCommentsPanel.scss";
import { CustomTextarea } from "@ucc/common-ui";
import { ERROR_MESSAGES } from "@/constants";

interface ReviewCommentsPanelProps {
  comments?: TaskReviewComment[];
  currentUserDisplayName?: string;
  onSendComment?: (message: string) => void | Promise<void>;
  isSubmitting?: boolean;
}

const formatCommentRelativeTime = (dateString: string): string => {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 60) {
    if (diffMins <= 0) return "Just now";
    return diffMins === 1 ? "1 minute ago" : `${diffMins} minutes ago`;
  }

  return formatRelativeTime(dateString, undefined, false);
};

const CommentAvatar: React.FC<{
  displayName: string;
  className?: string;
}> = ({ displayName, className }) => (
  <span className={className} aria-hidden>
    {getInitials(displayName)}
  </span>
);

const ReviewCommentItem: React.FC<{ comment: TaskReviewComment }> = ({
  comment,
}) => (
  <article className="review-comment-item" data-testid="review-comment-item">
    <CommentAvatar
      displayName={comment.authorDisplayName}
      className="review-comment-item__avatar"
    />
    <div className="review-comment-item__content">
      <div className="review-comment-item__header">
        <span className="review-comment-item__author">
          {comment.authorDisplayName}
        </span>
        <time
          className="review-comment-item__timestamp"
          dateTime={comment.createdAt}
        >
          {formatCommentRelativeTime(comment.createdAt)}
        </time>
      </div>
      <p className="review-comment-item__message">{comment.message}</p>
    </div>
  </article>
);

const ReviewCommentsPanel: React.FC<ReviewCommentsPanelProps> = ({
  comments = [],
  currentUserDisplayName,
  onSendComment,
  isSubmitting = false,
}) => {
  const [draftMessage, setDraftMessage] = useState("");
  const [hasError, setHasError] = useState(false);
  const composerName =
    currentUserDisplayName ?? sessionStorage.getItem("name") ?? "";

  const sortedComments = useMemo(
    () =>
      [...comments].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [comments],
  );

  const canSend =
    draftMessage.trim().length > 0 && !isSubmitting && Boolean(onSendComment);

  const handleSend = async () => {
    const message = draftMessage.trim();
    if (!message || !onSendComment) return;
    if (message.length < 10) {
      setHasError(true);
      return;
    }
    await onSendComment(message);
    setDraftMessage("");
    setHasError(false);
  };

  return (
    <aside
      className="review-comments-panel"
      data-testid="review-comments-panel"
    >
      <div className="review-comments-panel__header">
        <h2 className="review-comments-panel__title">
          Comments ({comments.length})
        </h2>

        <div className="review-comments-panel__composer">
          <CommentAvatar
            displayName={composerName || "You"}
            className="review-comments-panel__avatar"
          />
          <div className="review-comments-panel__composer-body">
            <CustomTextarea
              placeholder="Add a comment ..."
              value={draftMessage}
              onChange={(event) => {
                const nextValue = event.target.value;
                setDraftMessage(nextValue);

                const trimmedLength = nextValue.trim().length;
                if (hasError && (trimmedLength === 0 || trimmedLength >= 10)) {
                  setHasError(false);
                }
              }}
              aria-label="Add a comment"
              error={hasError ? ERROR_MESSAGES.COMMENT_TOO_SHORT : undefined}
            />
            <button
              type="button"
              className="review-comments-panel__send-button"
              disabled={!canSend}
              onClick={() => void handleSend()}
            >
              <LuSend aria-hidden />
              Send
            </button>
          </div>
        </div>
      </div>

      <div className="review-comments-panel__list">
        {sortedComments.length === 0 ? (
          <p className="review-comments-panel__empty">No comments yet.</p>
        ) : (
          sortedComments.map((comment) => (
            <ReviewCommentItem key={comment.commentId} comment={comment} />
          ))
        )}
      </div>
    </aside>
  );
};

export default ReviewCommentsPanel;
