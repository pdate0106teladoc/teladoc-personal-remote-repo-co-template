import { TASK_STATUS, normalizeTaskStatus } from "@/constants/taskStatus";
import type { UserKey } from "@/types/user";

/** Only the task creator acting in one of these roles may raise a rebuttal. */
export const REBUTTAL_ELIGIBLE_ROLES: readonly UserKey[] = [
  "CONFIGURATOR",
  "CONFIGURATOR_MANAGER",
  "ADMINISTRATOR",
];

interface RebuttalTaskDetails {
  status?: string;
  createdBy?: string;
}

const namesMatch = (a?: string | null, b?: string | null): boolean =>
  Boolean(a && b && a.trim().toLowerCase() === b.trim().toLowerCase());

export const hasRebuttalRole = (userRoles: UserKey[]): boolean =>
  userRoles.some((role) => REBUTTAL_ELIGIBLE_ROLES.includes(role));

/**
 * A task can be rebutted only when quality review rejected it, the backend still
 * allows a rebuttal, and the logged-in user both created it and holds a
 * configurator/admin role.
 *
 * `allowRebuttal` comes from the review API, so it is undefined until that call
 * resolves — treated as not allowed, since offering an irreversible action we may
 * have to withdraw is worse than showing it a moment late.
 */
export const isRebuttalEligible = ({
  userName,
  taskDetails,
  userRoles,
  allowRebuttal,
}: {
  userName: string | null;
  taskDetails?: RebuttalTaskDetails;
  userRoles: UserKey[];
  allowRebuttal?: boolean;
}): boolean => {
  if (!taskDetails) return false;

  if (allowRebuttal !== true) return false;

  const isRejectedByQualityReview =
    normalizeTaskStatus(taskDetails.status) === TASK_STATUS.REJECTED_QUALITY_REVIEW;
  if (!isRejectedByQualityReview) return false;

  if (!namesMatch(userName, taskDetails.createdBy)) return false;

  return hasRebuttalRole(userRoles);
};
