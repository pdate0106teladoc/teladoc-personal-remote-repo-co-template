import { normalizeTaskStatus, TASK_STATUS } from "@/constants/taskStatus";

interface TaskOwnerDetails {
  assignee?: string;
  updatedBy?: string;
}

const namesMatch = (a?: string | null, b?: string | null): boolean =>
  Boolean(a && b && a.toLowerCase() === b.toLowerCase());

/** Rejected review fix mode uses assignee; edit mode uses updatedBy (last editor). */
export const isTaskOwner = ({
  userName,
  taskDetails,
  isRejectedReviewFixMode,
}: {
  userName: string | null;
  taskDetails?: TaskOwnerDetails;
  isRejectedReviewFixMode: boolean;
}): boolean => {
  const ownerName = isRejectedReviewFixMode
    ? taskDetails?.assignee
    : taskDetails?.updatedBy;
  return namesMatch(userName, ownerName);
};

/**
 * Whether a Task ID may be followed into edit mode.
 *
 * The link opens the task for editing, so it needs both an owner match and a task
 * that is still a draft — once it has moved on (in review, approved, scheduled,
 * completed, on hold, cancelled) it belongs to another step of the workflow and
 * the ID is plain text.
 *
 * @param ownerName - `assignee` or `updatedBy`, whichever the caller treats as owner.
 */
export const canOpenTaskForEdit = ({
  userName,
  ownerName,
  taskStatus,
}: {
  userName: string | null;
  ownerName?: string;
  taskStatus?: string;
}): boolean =>
  namesMatch(userName, ownerName) &&
  normalizeTaskStatus(taskStatus) === TASK_STATUS.DRAFT;
