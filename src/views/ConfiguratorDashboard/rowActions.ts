import { hasPermission } from '@ucc/common-ui';
import { USER_ROLES } from '@/utils';
import { UserKey } from '@/types/user';
import type { ConfiguratorTask } from './ConfiguratorDashboard';

export const ASSIGNABLE_STATUSES = [
  "PENDING_PEER_REVIEW",
  "PEER_REVIEW_IN_PROGRESS",
  "PENDING_QUALITY_REVIEW",
  "QUALITY_REVIEW_IN_PROGRESS",
  "REJECTED_PEER_REVIEW",
  "REJECTED_QUALITY_REVIEW",
  "PENDING_REBUTTAL_REVIEW",
  "REBUTTAL_IN_PROGRESS"
];

export type RowActionKey =
  | "view_details"
  | "view_work_log"
  | "resolve_conflicts"
  | "schedule_for_production"
  | "assign_task"
  | "put_on_hold"
  | "remove_hold"
  | "cancel_task"
  | "revert_to_draft";

export type RowActionContext = {
  row: ConfiguratorTask;
  role: UserKey;
  userName: string;
  permissions: string[];
};

type RowActionDef = {
  key: RowActionKey;
  label: string;
  roles: UserKey[];
  visible?: (ctx: RowActionContext) => boolean;
};

const hasStatus = (row: ConfiguratorTask, status: string) => !!row?.status?.includes(status);
const isTerminal = (row: ConfiguratorTask) => hasStatus(row, "CANCELLED") || hasStatus(row, "COMPLETED");

const ALL_ROLES: UserKey[] = [
  USER_ROLES.ADMINISTRATOR,
  USER_ROLES.CONFIGURATOR,
  USER_ROLES.CONFIGURATOR_MANAGER,
  USER_ROLES.QUALITY_MANAGER,
  USER_ROLES.QUALITY_REVIEWER,
  USER_ROLES.VIEWER,
  USER_ROLES.REQUESTER,
];

/** Only configurators own the draft, so only they may pull a task back into it. */
const REVERT_TO_DRAFT_ROLES: UserKey[] = [
  USER_ROLES.CONFIGURATOR,
  USER_ROLES.CONFIGURATOR_MANAGER,
  USER_ROLES.ADMINISTRATOR,
];

/**
 * Statuses a task may be reverted to Draft from. A non-null value additionally
 * requires the task to sit with that assignee before the option is offered.
 */
export const REVERT_TO_DRAFT_STATUSES: Record<string, string | null> = {
  PENDING_PEER_REVIEW: "Configurator Manager",
  PENDING_QUALITY_REVIEW: "Quality Reviewer Manager",
  APPROVED: null,
  SCHEDULED: null,
};

/** Tolerates label vs code spellings, e.g. "Quality Reviewer Manager" / "QUALITY_REVIEWER_MANAGER". */
const normalizeAssignee = (value?: string) =>
  (value ?? "").trim().toUpperCase().replace(/\s+/g, "_");

const canRevertToDraft = ({ row }: RowActionContext): boolean =>
  (row?.status ?? []).some((status) => {
    if (!Object.prototype.hasOwnProperty.call(REVERT_TO_DRAFT_STATUSES, status)) {
      return false;
    }
    const requiredAssignee = REVERT_TO_DRAFT_STATUSES[status];
    if (!requiredAssignee) return true;
    return normalizeAssignee(row?.assignee) === normalizeAssignee(requiredAssignee);
  });

const MANAGE_ROLES: UserKey[] = [
  USER_ROLES.ADMINISTRATOR,
  USER_ROLES.CONFIGURATOR,
  USER_ROLES.CONFIGURATOR_MANAGER,
  USER_ROLES.QUALITY_MANAGER,
];

export const ROW_ACTIONS: RowActionDef[] = [
  { key: "view_details", label: "View details", roles: ALL_ROLES },
  { key: "view_work_log", label: "View work log", roles: ALL_ROLES },
  {
    key: "resolve_conflicts",
    label: "Resolve conflicts",
    roles: ALL_ROLES,
    visible: ({ row, userName }) => hasStatus(row, "CONFLICT") && row?.createdBy === userName,
  },
  {
    key: "schedule_for_production",
    label: "Schedule for production",
    roles: [USER_ROLES.ADMINISTRATOR, USER_ROLES.CONFIGURATOR, USER_ROLES.CONFIGURATOR_MANAGER],
    visible: ({ row, role, userName }) =>
      hasStatus(row, "APPROVED") && (role !== USER_ROLES.CONFIGURATOR || row?.createdBy === userName),
  },
  {
    key: "assign_task",
    label: "Assign task",
  roles: [USER_ROLES.ADMINISTRATOR, USER_ROLES.CONFIGURATOR_MANAGER, USER_ROLES.QUALITY_MANAGER],
    visible: ({ row, permissions }) =>
      !!row?.status?.some((s) => ASSIGNABLE_STATUSES.includes(s))
      && hasPermission(permissions, "task:assign"),
  },
  {
    key: "remove_hold",
    label: "Remove hold",
    roles: MANAGE_ROLES,
    visible: ({ row }) => !isTerminal(row) && hasStatus(row, "ON_HOLD"),
  },
  {
    key: "put_on_hold",
    label: "Put on hold",
    roles: MANAGE_ROLES,
    visible: ({ row }) => !isTerminal(row) && !hasStatus(row, "ON_HOLD"),
  },
  {
    key: "cancel_task",
    label: "Cancel task",
    roles: MANAGE_ROLES,
    visible: ({ row }) => !isTerminal(row),
  },
  {
    key: "revert_to_draft",
    label: "Revert to draft",
    roles: REVERT_TO_DRAFT_ROLES,
    // The status allow-list already excludes Draft and the terminal statuses.
    visible: canRevertToDraft,
  },
];

export const visibleRowActions = (ctx: RowActionContext): { key: RowActionKey; label: string }[] =>
  ROW_ACTIONS
    .filter((a) => a.roles.includes(ctx.role) && (a.visible?.(ctx) ?? true))
    .map(({ key, label }) => ({ key, label }));
