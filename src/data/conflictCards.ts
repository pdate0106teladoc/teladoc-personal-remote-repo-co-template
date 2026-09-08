import {
  getFieldLabel,
  normaliseChangeValue,
  transformChangesToSections,
} from "@/data/fieldLabelRegistry";
import type {
  ArrayChange,
  ChangedFieldRow,
  ScalarChange,
} from "@/data/fieldLabelRegistry";


export type EntityType = "ORGANIZATION" | "GROUP";

export interface PendingTask {
  draftId?: string;
  taskId?: string;
  status?: string;
  plannedLaunchDate?: string | null;
  createdByUsername?: string;
  conflictKind?: "SAME_DATE" | "DIFFERENT_DATE";
  conflicts?: Record<string, ConflictRow>;
}

export interface ConflictResponse {
  draftId?: string;
  entityType?: EntityType;
  taskId?: string;
  status?: string;
  plannedLaunchDate?: string | null;
  createdByUsername?: string;
  production?: ProductionSnapshot;
  pending?: PendingSnapshot;
}

export interface PendingSnapshot {
  hasPendingConflicts?: boolean;
  tasks?: PendingTask[];
}

export interface ConflictRow {
  myChange?: ScalarChange;
  theirChange?: ScalarChange;
  overridable?: boolean;
}

export interface ProductionSnapshot {
  baseProductionId?: string,
  currentProductionId?: string,
  drifted?: boolean;
  refreshed?: boolean;
  taskId: string;
  status?: string;
  plannedLaunchDate?: string | null;
  actualLaunchDate?: string | null;
  createdByUsername?: string;
  changes?: Record<string, ScalarChange | ArrayChange>;
  conflicts?: Record<string, ConflictRow>;
  errors?: string[];
}


export interface ProductionChangeRow {
  key: string;
  label: string;
  sectionTitle: string;
  myValue: string;
  theirValue: string;
  overridable?: boolean;
}

export interface ProductionChangeCard {
  taskId: string;
  status?: string;
  createdByUsername?: string;
  launchDate: string | null;
  rows: ProductionChangeRow[];
}

export interface ProductionDiffResult {
  card: ProductionChangeCard | null;
  fieldCount: number;
  myLaunchDate: string | null;
  unmappedKeys: string[];
}

export interface ProductionConflictCard {
  taskId?: string;
  status?: string;
  createdByUsername?: string;
  launchDate: string | null;
  rows: ProductionChangeRow[];
}

export interface ProductionConflictResult {
  card: ProductionConflictCard | null;
  fieldCount: number;
  myLaunchDate: string | null;
  unmappedKeys: string[];
}

export function transformProductionDiffToRows(
  changes: Record<string, ScalarChange | ArrayChange> | undefined,
): { rows: ProductionChangeRow[]; unmappedKeys: string[] } {
  if (!changes) return { rows: [], unmappedKeys: [] };

  const { sections, arrayChangeSections, unmappedKeys } =
    transformChangesToSections({ changes });

  const toRow = (
    sectionTitle: string,
    row: ChangedFieldRow,
    index: number,
  ): ProductionChangeRow => ({
    key: `${sectionTitle}.${row.field}.${index}`,
    label: row.field,
    sectionTitle,
    myValue: row.previousValue,
    theirValue: row.updatedValue,
  });

  const rows = [
    ...sections.flatMap((section) =>
      section.rows.map((row, i) => toRow(section.title, row, i)),
    ),
    ...arrayChangeSections.flatMap((section) =>
      section.items.flatMap((item) =>
        item.rows.map((row, i) => toRow(section.tabLabel, row, i)),
      ),
    ),
  ];
  return { rows, unmappedKeys };
}

export function transformProductionConflictsToRows(
  conflicts: Record<string, ConflictRow> | undefined,
): { rows: ProductionChangeRow[]; unmappedKeys: string[] } {
  if (!conflicts) return { rows: [], unmappedKeys: [] };

  const rows: ProductionChangeRow[] = [];
  const unmappedKeys: string[] = [];

  for (const [key, conflict] of Object.entries(conflicts)) {
    const meta = getFieldLabel(key);
    if (!meta) {
      unmappedKeys.push(key);
      continue;
    }
    rows.push({
      key,
      label: meta.label,
      sectionTitle: meta.sectionTitle,
      myValue: normaliseChangeValue(conflict.myChange?.newValue, meta.format),
      theirValue: normaliseChangeValue(conflict.theirChange?.newValue, meta.format),
      overridable: true,
    });
  }

  return { rows, unmappedKeys };
}

export function buildProductionDiff(
  response: ConflictResponse | undefined,
): ProductionDiffResult {
  const production = response?.production;
  const { rows, unmappedKeys } = transformProductionDiffToRows(production?.changes);

  return {
    card:
      rows.length > 0
        ? {
          taskId: production?.taskId ?? "",
          status: production?.status,
          createdByUsername: production?.createdByUsername,
          launchDate:
            production?.actualLaunchDate ?? production?.plannedLaunchDate ?? null,
          rows,
        }
        : null,
    fieldCount: rows.length,
    myLaunchDate: response?.plannedLaunchDate ?? null,
    unmappedKeys,
  };
}

export function buildProductionConflicts(
  response: ConflictResponse | undefined,
): ProductionConflictResult {
  const production = response?.production;
  const { rows, unmappedKeys } = transformProductionConflictsToRows(production?.conflicts);

  if (unmappedKeys.length > 0) {
    console.warn("[conflictCards] Unmapped production conflict keys (skipped):", unmappedKeys);
  }

  return {
    card:
      rows.length > 0
        ? {
          taskId: production?.taskId,
          status: production?.status,
          createdByUsername: production?.createdByUsername,
          launchDate:
            production?.actualLaunchDate ?? production?.plannedLaunchDate ?? null,
          rows,
        }
        : null,
    fieldCount: rows.length,
    myLaunchDate: response?.plannedLaunchDate ?? null,
    unmappedKeys,
  };
}

export function hasProductionConflicts(
  response: ConflictResponse | undefined,
): boolean {
  return Object.keys(response?.production?.conflicts ?? {}).length > 0;
}

export function hasPendingConflicts(
  response: ConflictResponse | undefined,
): boolean {
  return Boolean(response?.pending?.hasPendingConflicts);
}

export function hasAnyConflictOrChanges(
  response: ConflictResponse | undefined,
): boolean {
  return hasProductionConflicts(response) || hasPendingConflicts(response);
}

export type ConflictResolution =
  | "TAKE_MINE"
  | "TAKE_THEIRS"
  | "KEEP_BOTH"
  | "CANCEL_THEIRS";

export type WireResolution = Exclude<ConflictResolution, "CANCEL_THEIRS">;

export const toWireResolution = (
  resolution: ConflictResolution,
): WireResolution =>
  resolution === "CANCEL_THEIRS" ? "TAKE_MINE" : resolution;

export const cancelsOtherTask = (resolution: ConflictResolution): boolean =>
  resolution === "CANCEL_THEIRS";

export type ConflictCardKind =
  /** 1. Production moved under us on fields we did not touch. Forced take-theirs. */
  | "PRODUCTION_CHANGE"
  /** 2. Production moved under us on fields we did touch. */
  | "PRODUCTION_CONFLICT"
  /** 3. Pending task already scheduled or approved, so its date cannot be reopened. */
  | "PENDING_LOCKED"
  /** 4. Pending task still in review, landing on a different launch date. */
  | "PENDING_DIFFERENT_DATE"
  /** 5. Pending task still in review, landing on the same launch date. */
  | "PENDING_SAME_DATE";

export type PendingCardKind = Extract<
  ConflictCardKind,
  "PENDING_LOCKED" | "PENDING_DIFFERENT_DATE" | "PENDING_SAME_DATE"
>;

export type ConflictCardControl =
  /** Informational only. Outcome is forced, nothing for the user to pick. */
  | "none"
  /** One checkbox per changed row -> ConflictCardAnswer.fieldResolutions. */
  | "field-checkbox"
  /** One radio group for the whole card -> ConflictCardAnswer.cardResolution. */
  | "card-radio";

export interface ConflictCardPolicy {
  control: ConflictCardControl;
  /** Resolutions this card can produce. One entry means the outcome is forced. */
  options: readonly ConflictResolution[];
  /** Pre-selected pick, and the effective answer wherever the user has not chosen. */
  defaultResolution: ConflictResolution;
  comment: "required" | "optional" | "hidden";
  /** Card-level "I have reviewed this conflict" checkbox, separate from the modal-level one. */
  requiresCardConfirmation: boolean;
}

export const CONFLICT_CARD_POLICY: Record<ConflictCardKind, ConflictCardPolicy> = {
  PRODUCTION_CHANGE: {
    control: "none",
    options: ["TAKE_THEIRS"],
    defaultResolution: "TAKE_THEIRS",
    comment: "hidden",
    requiresCardConfirmation: false,
  },
  PRODUCTION_CONFLICT: {
    control: "field-checkbox",
    options: ["TAKE_MINE", "TAKE_THEIRS"],
    defaultResolution: "TAKE_THEIRS",
    comment: "hidden",
    requiresCardConfirmation: false,
  },
  PENDING_LOCKED: {
    control: "field-checkbox",
    options: ["TAKE_MINE", "TAKE_THEIRS"],
    defaultResolution: "TAKE_THEIRS",
    comment: "hidden",
    requiresCardConfirmation: false,
  },
  PENDING_DIFFERENT_DATE: {
    control: "card-radio",
    options: ["KEEP_BOTH", "CANCEL_THEIRS"],
    defaultResolution: "KEEP_BOTH",
    comment: "required",
    requiresCardConfirmation: true,
  },
  PENDING_SAME_DATE: {
    control: "field-checkbox",
    options: ["TAKE_THEIRS"],
    defaultResolution: "TAKE_THEIRS",
    comment: "required",
    requiresCardConfirmation: true,
  },
};

const LOCKED_PENDING_STATUSES = new Set(["scheduled", "completed", "processing"]);

const normaliseStatus = (status: string | undefined): string =>
  (status ?? "").replace(/_/g, " ").trim().toLowerCase();

export function classifyPendingTask(task: PendingTask): PendingCardKind {
  if (LOCKED_PENDING_STATUSES.has(normaliseStatus(task.status))) {
    return "PENDING_LOCKED";
  }
  return task.conflictKind === "SAME_DATE"
    ? "PENDING_SAME_DATE"
    : "PENDING_DIFFERENT_DATE";
}

/** One user decision per card, keyed by card id in the modal. */
export interface ConflictCardAnswer {
  /** Set only when control is "card-radio". */
  cardResolution?: ConflictResolution;
  /** Change path -> pick. Populated only when control is "field-checkbox". */
  fieldResolutions: Record<string, ConflictResolution>;
  comment: string;
  confirmed: boolean;
}

/**
 * Nothing is pre-selected: a card-radio card opens with neither option chosen so
 * the footer count starts at zero and the user has to state a preference.
 * defaultResolution is only the fallback for building the request.
 */
export function initCardAnswer(kind: ConflictCardKind): ConflictCardAnswer {
  return {
    fieldResolutions: {},
    comment: kind === "PENDING_LOCKED" ? "-" : "",
    confirmed: false,
  };
}

/** The resolution to send for one changed field, given what the user has picked. */
export function effectiveFieldResolution(
  kind: ConflictCardKind,
  answer: ConflictCardAnswer,
  rowKey: string,
): ConflictResolution {
  const policy = CONFLICT_CARD_POLICY[kind];
  if (policy.control === "card-radio") {
    return answer.cardResolution ?? policy.defaultResolution;
  }
  return answer.fieldResolutions[rowKey] ?? policy.defaultResolution;
}

export function cardInputsRequired(
  kind: ConflictCardKind,
  answer: ConflictCardAnswer,
): boolean {
  const policy = CONFLICT_CARD_POLICY[kind];
  return policy.control !== "card-radio" || Boolean(answer.cardResolution);
}

/** Whether one card has everything it needs for Save to be enabled. */
export function isCardAnswerComplete(
  kind: ConflictCardKind,
  answer: ConflictCardAnswer,
  rowKeys: string[],
): boolean {
  const policy = CONFLICT_CARD_POLICY[kind];
  if (policy.control === "card-radio" && !answer.cardResolution) return true;
  if (policy.comment === "required" && answer.comment.trim() === "") return false;
  if (policy.requiresCardConfirmation && !answer.confirmed) return false;

  if (policy.control === "field-checkbox") {
    const allDecided = rowKeys.every(
      (key) => answer.fieldResolutions[key] !== undefined,
    );
    if (!allDecided) return false;
    if (policy.options.length === 1) {
      return rowKeys.every(
        (key) => answer.fieldResolutions[key] === policy.defaultResolution,
      );
    }
  }

  return true;
}

export function countCardResolutions(
  kind: ConflictCardKind,
  answer: ConflictCardAnswer,
  rowKeys: string[],
): { resolved: number; total: number } {
  const policy = CONFLICT_CARD_POLICY[kind];

  if (policy.control === "none") return { resolved: 0, total: 0 };

  if (policy.control === "card-radio") {
    return {
      resolved: answer.cardResolution ? rowKeys.length : 0,
      total: rowKeys.length,
    };
  }

  const isResolved = (key: string): boolean =>
    policy.options.length === 1
      ? answer.fieldResolutions[key] === policy.defaultResolution
      : answer.fieldResolutions[key] !== undefined;

  return {
    resolved: rowKeys.filter(isResolved).length,
    total: rowKeys.length,
  };
}

export interface PendingConflictCard {
  id: string;
  kind: PendingCardKind;
  taskId?: string;
  draftId?: string;
  status?: string;
  createdByUsername?: string;
  launchDate: string | null;
  rows: ProductionChangeRow[];
}

export interface PendingConflictsResult {
  cards: PendingConflictCard[];
  fieldCount: number;
  myLaunchDate: string | null;
  unmappedKeys: string[];
}

export function buildPendingConflicts(
  response: ConflictResponse | undefined,
): PendingConflictsResult {
  const cards: PendingConflictCard[] = [];
  const unmappedKeys: string[] = [];

  (response?.pending?.tasks ?? []).forEach((task, index) => {
    const { rows, unmappedKeys: taskUnmapped } =
      transformProductionConflictsToRows(task.conflicts);
    unmappedKeys.push(...taskUnmapped);

    if (rows.length === 0) return;

    cards.push({
      id: task.taskId ?? task.draftId ?? `pending-${index}`,
      kind: classifyPendingTask(task),
      taskId: task.taskId,
      draftId: task.draftId,
      status: task.status,
      createdByUsername: task.createdByUsername,
      launchDate: task.plannedLaunchDate ?? null,
      rows,
    });
  });

  if (unmappedKeys.length > 0) {
    console.warn(
      "[conflictCards] Unmapped pending conflict keys (skipped):",
      unmappedKeys,
    );
  }

  return {
    cards,
    fieldCount: cards.reduce((total, card) => total + card.rows.length, 0),
    myLaunchDate: response?.plannedLaunchDate ?? null,
    unmappedKeys,
  };
}

export interface PendingTaskResolution {
  otherTaskId?: string;
  otherDraftId?: string;
  resolutions: Record<string, WireResolution>;
  cancelOtherTask: boolean;
  comment?: string;
}

export interface ConflictResolutionRequest {
  draftId?: string;
  entityType?: EntityType;
  baseProductionId?: string;
  currentProductionId?: string;
  production: {
    changePaths: string[];
    resolutions: Record<string, WireResolution>;
  };
  pending: {
    tasks: PendingTaskResolution[];
  };
}

function buildPendingTaskResolutions(
  cards: PendingConflictCard[],
  answers: Record<string, ConflictCardAnswer>,
): PendingTaskResolution[] {
  return cards.flatMap((card) => {
    const answer = answers[card.id] ?? initCardAnswer(card.kind);
    const policy = CONFLICT_CARD_POLICY[card.kind];
    const resolutions: Record<string, WireResolution> = {};

    if (policy.control === "card-radio") {
      if (!answer.cardResolution) return [];
      for (const row of card.rows) {
        resolutions[row.key] = toWireResolution(answer.cardResolution);
      }
    } else {
      for (const row of card.rows) {
        resolutions[row.key] = toWireResolution(
          effectiveFieldResolution(card.kind, answer, row.key),
        );
      }
    }

    const comment = answer.comment.trim();

    return {
      otherTaskId: card.taskId,
      otherDraftId: card.draftId,
      resolutions,
      cancelOtherTask: cancelsOtherTask(
        answer.cardResolution ?? CONFLICT_CARD_POLICY[card.kind].defaultResolution,
      ),
      ...(comment ? { comment } : {}),
    };
  });
}

export function buildResolutionRequest(
  response: ConflictResponse | undefined,
  takeTheirs: Record<string, boolean>,
  pendingAnswers: Record<string, ConflictCardAnswer> = {},
): ConflictResolutionRequest {
  const production = response?.production;
  const resolutions: Record<string, WireResolution> = {};

  for (const key of Object.keys(production?.changes ?? {})) {
    resolutions[key] = "TAKE_THEIRS";
  }

  for (const key of Object.keys(production?.conflicts ?? {})) {
    resolutions[key] = takeTheirs[key] ? "TAKE_THEIRS" : "TAKE_MINE";
  }

  return {
    draftId: response?.draftId,
    entityType: response?.entityType,
    baseProductionId: response?.production?.baseProductionId,
    currentProductionId: response?.production?.currentProductionId,
    production: {
      changePaths: Object.keys(resolutions),
      resolutions,
    },
    pending: {
      tasks: buildPendingTaskResolutions(
        buildPendingConflicts(response).cards,
        pendingAnswers,
      ),
    },
  };
}

interface SummaryTilesCount {
  totalRecordsInBulk: number;
  totalConflicts: number;
  totalFieldsInTasks: number;
  totalTasks: number;
  prodChanges: number;
}

export const getSummaryTilesCount = (data: ConflictResponse | undefined): SummaryTilesCount => {
  const taskConflictsCount = Number(data?.pending?.tasks?.length ?? 0);
  const conflictsExceptSoft = Number((data?.pending?.tasks ?? []).filter(
    (task) => classifyPendingTask(task) !== "PENDING_DIFFERENT_DATE",
  ).length + Number(Object.keys(data?.production?.conflicts ?? {}).length > 0 ? 1 : 0));
  const taskConflictsFieldCount = (data?.pending?.tasks ?? []).reduce(
    (sum, task) => sum + Object.keys(task?.conflicts ?? {}).length,
    0,
  );
  const prodChangesFieldCount = Object.keys(data?.production?.changes ?? {}).length;

  return {
    totalRecordsInBulk: 1,
    totalConflicts: conflictsExceptSoft,
    totalFieldsInTasks: taskConflictsFieldCount,
    totalTasks: taskConflictsCount,
    prodChanges: prodChangesFieldCount,
  }
}
