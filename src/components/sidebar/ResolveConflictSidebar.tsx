import React, { useMemo, useState } from "react";
import { BsChevronDown, BsChevronRight } from "react-icons/bs";
import {
  Button,
  CalendarIcon,
  CustomCheckbox,
  CustomTextarea,
  ErrorIcon,
  FailSafePage,
  showCustomToast,
  SideModal,
} from "@ucc/common-ui";
import "./ResolveConflictSidebar.scss";
import "./SubmitUpdateForm.scss";
import "@/views/ConfiguratorDashboard/ConfiguratorDashboard.scss";
import { ExclamationIcon, InfoGreyIcon, OpenIcon } from "@/assets";
import { formatDateLocal, getInitials } from "@/utils";
import {
  ERROR_MESSAGES,
  MODAL_MSSG,
  statusClasses,
  statusTextMap,
  ToastType,
} from "@/constants";
import TaskDetailSidebar from "@/components/sidebar/TaskDetailSidebar";
import {
  buildPendingConflicts,
  buildProductionConflicts,
  buildProductionDiff,
  buildResolutionRequest,
  cardInputsRequired,
  CONFLICT_CARD_POLICY,
  countCardResolutions,
  effectiveFieldResolution,
  getSummaryTilesCount,
  initCardAnswer,
  isCardAnswerComplete,
  type ConflictCardAnswer,
  type ConflictCardKind,
  type ConflictResolution,
  type ConflictResponse,
} from "@/data/conflictCards";
import api from "@/api/apiService";

/** Answer-map keys for the two production cards, which are singletons. */
const PRODUCTION_CHANGE_ID = "production-change";
const PRODUCTION_CONFLICT_ID = "production-conflict";

interface DiffCardView {
  taskId?: string;
  status?: string;
  createdByUsername?: string;
  launchDate: string | null;
  rows: {
    key: string;
    label: string;
    sectionTitle?: string;
    required?: boolean;
    myValue: string;
    theirValue: string;
    overridable?: boolean;
  }[];
}

const formatOrDash = (date: string | null | undefined): string =>
  date ? formatDateLocal(date) : "-";

const CollapsibleSection: React.FC<{
  title: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}> = ({ title, defaultExpanded = true, children }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="rc-section">
      <button
        type="button"
        className="rc-section-header d-flex align-items-center gap-2"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
      >
        {isExpanded ? <BsChevronDown size={14} /> : <BsChevronRight size={14} />}
        <span className="rc-section-title">{title}</span>
      </button>
      {isExpanded && <div className="rc-section-body">{children}</div>}
    </div>
  );
};

const StatusBadge: React.FC<{
  status: string;
}> = ({ status }) => {
  const normalizedInput = status
    .replace(/_/g, " ")
    .toLowerCase() as keyof typeof statusTextMap;
  const displayText = statusTextMap[normalizedInput] || status;
  const statusClass = statusClasses[normalizedInput] || "";
  return <span className={`status status--${statusClass}`}>{displayText}</span>;
};

interface ConflictSummaryTile {
  key: string;
  value: number;
  label: string;
  hint: string;
  variant?: "default" | "danger" | "muted";
}

const ConflictSummary: React.FC<{ tiles: ConflictSummaryTile[] }> = ({
  tiles,
}) => (
  <div className="rc-summary">
    {tiles.map((tile) => (
      <div
        key={tile.key}
        className={`rc-summary-tile rc-summary-tile--${tile.variant ?? "default"}`}
      >
        <div className="rc-summary-value">{tile.value}</div>
        <div className="rc-summary-label">{tile.label}</div>
        <div className="rc-summary-hint">{tile.hint}</div>
      </div>
    ))}
  </div>
);

type BanneredKind = "PENDING_DIFFERENT_DATE" | "PENDING_SAME_DATE";

const hasCardBanner = (kind: ConflictCardKind): kind is BanneredKind =>
  kind === "PENDING_DIFFERENT_DATE" || kind === "PENDING_SAME_DATE";

const pendingBannerBody = (kind: BanneredKind, card: DiffCardView): string => {
  const owner = card.createdByUsername ?? "Another configurator";
  const lead = `${owner} submitted a pending change effective ${formatOrDash(
    card.launchDate,
  )}${card.taskId ? ` (Task #${card.taskId})` : ""}.`;
  const detail =
    kind === "PENDING_SAME_DATE"
      ? MODAL_MSSG.CONFLICT_PENDING_SAME_DATE
      : MODAL_MSSG.CONFLICT_PENDING_SAME_FIELD;

  return `${lead} ${detail} ${MODAL_MSSG.CONFLICT_SELECT_HOW_TO_PROCEED}`;
};

/** Radio copy for case 4, which needs both launch dates and the other owner's name. */
const resolutionChoices = (
  card: DiffCardView,
  myLaunchDate: string | null,
): { value: ConflictResolution; label: string; description: string }[] => {
  const owner = card.createdByUsername ?? "the other configurator";
  const mine = formatOrDash(myLaunchDate);
  const theirs = formatOrDash(card.launchDate);
  const task = card.taskId ? `Task #${card.taskId}` : "the other task";

  return [
    {
      value: "KEEP_BOTH",
      label: MODAL_MSSG.CONFLICT_KEEP_BOTH_LABEL,
      description: `Proceed with my update effective ${mine}. ${owner}'s change will go into effective ${theirs} as submitted. Both tasks are preserved in the history.`,
    },
    {
      value: "CANCEL_THEIRS",
      label: MODAL_MSSG.CONFLICT_CANCEL_THEIRS_LABEL,
      description: `Proceed with my update effective ${mine} and cancel the other entry. The above change from ${task} will be cancelled and ${owner} will be notified with my comment.`,
    },
  ];
};

const confirmLabelFor = (kind: ConflictCardKind): string =>
  kind === "PENDING_SAME_DATE"
    ? MODAL_MSSG.CONFLICT_CONFIRM_REVIEWED
    : MODAL_MSSG.CONFLICT_CONFIRM_RESOLUTION;

interface ResolveConflictsModalProps {
  show: boolean;
  data: ConflictResponse | undefined;
  onBackToEditing: () => void;
  onSaveConflict: () => void;
}

const ResolveConflictsModal: React.FC<ResolveConflictsModalProps> = ({
  data,
  show,
  onBackToEditing,
  onSaveConflict,
}) => {
  const [answers, setAnswers] = useState<Record<string, ConflictCardAnswer>>({});
  const editBaseUrl = import.meta.env.VITE_EDIT_URL;
  const [confirmed, setConfirmed] = useState(false);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const productionDiff = useMemo(() => buildProductionDiff(data), [data]);
  const productionConflicts = useMemo(
    () => buildProductionConflicts(data),
    [data],
  );
  const pendingConflicts = useMemo(() => buildPendingConflicts(data), [data]);

  const hasProductionCards = Boolean(
    productionConflicts.card || productionDiff.card,
  );
  const hasPendingLockedCards = pendingConflicts.cards.some(
    (card) => card.kind === "PENDING_LOCKED",
  );
  const requiresFinalConfirmation = hasProductionCards || hasPendingLockedCards;
  const hasCards = hasProductionCards || pendingConflicts.cards.length > 0;
  const needsResolutionCount =
    productionConflicts.fieldCount + pendingConflicts.fieldCount;

  const summaryTilesCount = getSummaryTilesCount(data);
  const summaryTiles: ConflictSummaryTile[] = [
    {
      key: "bulk",
      value: summaryTilesCount.totalRecordsInBulk,
      label: "Records in your bulk",
      hint: "Total scope",
      variant: "default",
    },
    {
      key: "records-with-conflict",
      value: summaryTilesCount.totalConflicts,
      label: "Records with conflict",
      hint: "Decision required",
      variant: "danger",
    },
    {
      key: "field-level",
      value: summaryTilesCount.totalFieldsInTasks,
      label: "Field-level conflict",
      hint: `Across ${summaryTilesCount.totalTasks} tasks`,
      variant: "danger",
    },
    {
      key: "synced",
      value: summaryTilesCount.prodChanges,
      label: "Synced from production",
      hint: "No further action",
      variant: "muted",
    },
  ];

  const answerFor = (id: string, kind: ConflictCardKind): ConflictCardAnswer =>
    answers[id] ?? initCardAnswer(kind);

  const patchAnswer = (
    id: string,
    kind: ConflictCardKind,
    patch: Partial<ConflictCardAnswer>,
  ) =>
    setAnswers((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? initCardAnswer(kind)), ...patch },
    }));

  const setFieldResolution = (
    id: string,
    kind: ConflictCardKind,
    rowKey: string,
    takeTheirs: boolean,
  ) =>
    setAnswers((prev) => {
      const current = prev[id] ?? initCardAnswer(kind);
      return {
        ...prev,
        [id]: {
          ...current,
          fieldResolutions: {
            ...current.fieldResolutions,
            [rowKey]: takeTheirs ? "TAKE_THEIRS" : "TAKE_MINE",
          },
        },
      };
    });

  /** Every card that asks the user something, in render order. */
  const decisionCards = useMemo(() => {
    const cards: {
      id: string;
      kind: ConflictCardKind;
      rowKeys: string[];
    }[] = [];

    if (productionConflicts.card) {
      cards.push({
        id: PRODUCTION_CONFLICT_ID,
        kind: "PRODUCTION_CONFLICT",
        rowKeys: productionConflicts.card.rows.map((row) => row.key),
      });
    }
    for (const card of pendingConflicts.cards) {
      cards.push({
        id: card.id,
        kind: card.kind,
        rowKeys: card.rows.map((row) => row.key),
      });
    }
    return cards;
  }, [productionConflicts, pendingConflicts]);

  const { resolved, total } = decisionCards.reduce(
    (acc, card) => {
      const counts = countCardResolutions(
        card.kind,
        answerFor(card.id, card.kind),
        card.rowKeys,
      );
      return {
        resolved: acc.resolved + counts.resolved,
        total: acc.total + counts.total,
      };
    },
    { resolved: 0, total: 0 },
  );

  const allCardsComplete = decisionCards.every((card) =>
    isCardAnswerComplete(
      card.kind,
      answerFor(card.id, card.kind),
      card.rowKeys,
    ),
  );

  const canSave =
    hasCards &&
    allCardsComplete &&
    (!requiresFinalConfirmation || confirmed) &&
    !saving;

  const handleClose = () => {
    setAnswers({});
    setConfirmed(false);
    setOpenTaskId(null);
    onBackToEditing();
  };

  const onSaveAndContinue = async () => {
    setSaving(true);
    try {
      const productionTakeTheirs = Object.fromEntries(
        Object.entries(
          answers[PRODUCTION_CONFLICT_ID]?.fieldResolutions ?? {},
        ).map(([key, resolution]) => [key, resolution === "TAKE_THEIRS"]),
      );

      await api.post(
        `${editBaseUrl}client-configurations/conflicts/submit-resolve-conflict`,
        buildResolutionRequest(data, productionTakeTheirs, answers),
      );
      showCustomToast({
        type: ToastType.Success,
        title: "Success",
        message: MODAL_MSSG.CONFLICTS_RESOLVED,
      });
      onSaveConflict();
      handleClose();
    } catch {
      showCustomToast({
        type: ToastType.Error,
        title: "Failed",
        message: ERROR_MESSAGES.RESOLVE_CONFLICTS_FAILED,
      });
    } finally {
      setSaving(false);
    }
  };

  const renderDiffCard = ({
    id,
    kind,
    card,
    myLaunchDate,
  }: {
    id: string;
    kind: ConflictCardKind;
    card: DiffCardView;
    myLaunchDate: string | null;
  }) => {
    const policy = CONFLICT_CARD_POLICY[kind];
    const answer = answerFor(id, kind);

    const isProdDiff = kind === "PRODUCTION_CHANGE";
    const isProdConflict = kind === "PRODUCTION_CONFLICT";
    const isPending = kind.startsWith("PENDING_");
    const showFieldCheckbox = policy.control === "field-checkbox";

    const overridableKeys = (card?.rows ?? [])
      .filter((row) => row.overridable)
      .map((row) => row.key);
    const allOverridden =
      overridableKeys.length > 0 &&
      overridableKeys.every(
        (key) => answer.fieldResolutions[key] === "TAKE_THEIRS",
      );

    const toggleAll = (checked: boolean) =>
      setAnswers((prev) => {
        const current = prev[id] ?? initCardAnswer(kind);
        return {
          ...prev,
          [id]: {
            ...current,
            fieldResolutions: {
              ...current.fieldResolutions,
              ...Object.fromEntries(
                overridableKeys.map((key) => [
                  key,
                  checked ? "TAKE_THEIRS" : "TAKE_MINE",
                ]),
              ),
            },
          },
        };
      });

    return (
      <div
        className={`rc-conflict-card${isProdDiff ? " rc-conflict-card--prod" : ""}`}
      >
        <div className="rc-card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          {!card?.taskId && (isProdConflict || isProdDiff) ? (
            <span className="rc-conflicting-label">
              {isProdConflict
                ? MODAL_MSSG.CONFLICT_WITH_PRODUCTION_DELTA
                : `${MODAL_MSSG.PRODUCTION_DELTA_UPDATED_ON} ${formatOrDash(card?.launchDate)}`}
            </span>
          ) : (
            <>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <span className="rc-conflicting-label">
                  {isProdDiff ? "Production updated by:" : "Conflicting with:"}
                </span>
                <span
                  className="rc-conflict-link"
                  role="button"
                  tabIndex={0}
                  onClick={() => card?.taskId && setOpenTaskId(card.taskId)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (card?.taskId) setOpenTaskId(card.taskId);
                    }
                  }}
                >
                  {card?.taskId}
                  <OpenIcon />
                </span>
                {card?.status && (
                  <span className="configurator">
                    <StatusBadge status={card.status} />
                  </span>
                )}
              </div>
              {card?.createdByUsername && (
                <div className="d-flex align-items-center gap-2">
                  <span className="rc-by-text">By</span>
                  <span className="rc-avatar">
                    {getInitials(card?.createdByUsername)}
                  </span>
                  <span className="rc-by-name">{card?.createdByUsername}</span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="rc-comparison-body">
          {hasCardBanner(kind) && (
            <div className="rc-error-banner rc-card-banner d-flex align-items-start gap-2">
              <ErrorIcon />
              <div>
                <div className="bold-text">
                  {MODAL_MSSG.CONFLICT_WITH_PENDING_CHANGES}
                </div>
                <div className="regular-text">
                  {pendingBannerBody(kind, card)}
                </div>
              </div>
            </div>
          )}

          <div
            className={`rc-comparison${kind === "PENDING_SAME_DATE" ? " rc-comparison--same-date" : ""
              }`}
          >
            <div className="rc-comparison-header">
              <div className="rc-field-col" />
              <div className="rc-my-col">
                <div className="rc-date-label d-flex align-items-center gap-1">
                  <CalendarIcon />
                  My planned launch date
                </div>
                <div className="rc-date-value">{formatOrDash(myLaunchDate)}</div>
                {kind !== "PENDING_SAME_DATE" && (
                  <div className="rc-col-title">
                    {isProdDiff ? "My previous value" : "My current value"}
                  </div>
                )}
              </div>
              <div className="rc-their-col">
                <div className="rc-date-label d-flex align-items-center gap-1">
                  {isProdDiff ? <CalendarIcon /> : <ExclamationIcon />}
                  {isProdConflict
                    ? "Production updated on"
                    : `Their${isPending ? " planned" : " scheduled"} launch date`}
                </div>
                <div className="rc-date-value">
                  {formatOrDash(card?.launchDate)}
                </div>
                <div className="rc-col-title d-flex align-items-center gap-2">
                  {isProdDiff && "The newest value"}
                  {policy.control === "card-radio" && "Their value"}
                  {showFieldCheckbox && (
                    <>
                      <CustomCheckbox
                        checked={allOverridden}
                        onChange={toggleAll}
                        id={`rc-overwrite-all-${id}`}
                      />
                      Overwrite my values with:
                    </>
                  )}
                </div>
              </div>
            </div>

            {card?.rows?.map((field) => (
              <div key={field.key} className="rc-comparison-row">
                <div className="rc-field-col">
                  <div className="rc-field-label">
                    {field.label}
                    {field.required && <span className="rc-required"> *</span>}
                  </div>
                  {field.sectionTitle && (
                    <div className="rc-field-section">{field.sectionTitle}</div>
                  )}
                </div>
                {kind !== "PENDING_SAME_DATE" ? <div className="rc-my-col">{field.myValue}</div> : <div className="emptybox"></div>}
                <div className="rc-their-col">
                  <div className="rc-radio-label d-flex align-items-center gap-2">
                    {showFieldCheckbox && field.overridable && (
                      <CustomCheckbox
                        checked={
                          effectiveFieldResolution(kind, answer, field.key) ===
                          "TAKE_THEIRS"
                        }
                        onChange={(checked) =>
                          setFieldResolution(id, kind, field.key, checked)
                        }
                        id={`rc-overwrite-${id}-${field.key}`}
                      />
                    )}
                    {field.theirValue}
                  </div>
                </div>
              </div>
            ))}

            <div className="rc-comparison-footer">
              <div className="rc-field-col" />
              {kind !== "PENDING_SAME_DATE" ? <div className="rc-my-col" /> : <div className="emptybox"></div>}
              <div className="rc-their-col">
                {kind === "PENDING_SAME_DATE" && (
                  <span className="rc-overwrite-hint">
                    {MODAL_MSSG.CONFLICT_OVERWRITE_WARNING}
                  </span>
                )}
              </div>
            </div>
          </div>

          {policy.control === "card-radio" && (
            <fieldset className="rc-resolution-choices">
              <legend className="rc-resolution-legend">
                {MODAL_MSSG.CONFLICT_HOW_TO_RESOLVE}
                <span className="rc-required"> *</span>
              </legend>
              {resolutionChoices(card, myLaunchDate).map((choice) => (
                <label
                  key={choice.value}
                  className={`rc-resolution-option${answer.cardResolution === choice.value ? " --selected" : ""
                    }`}
                >
                  <input
                    type="radio"
                    name={`rc-resolution-${id}`}
                    value={choice.value}
                    checked={answer.cardResolution === choice.value}
                    onChange={() =>
                      patchAnswer(id, kind, { cardResolution: choice.value })
                    }
                  />
                  <span className="rc-resolution-text">
                    <span className="rc-resolution-label">{choice.label}</span>
                    <span className="rc-resolution-description">
                      {choice.description}
                    </span>
                  </span>
                </label>
              ))}
            </fieldset>
          )}

          {policy.comment !== "hidden" && (
            <div className="rc-card-comment">
              <CustomTextarea
                id={`rc-comment-${id}`}
                label={MODAL_MSSG.CONFLICT_ADD_COMMENTS}
                required={
                  policy.comment === "required" && cardInputsRequired(kind, answer)
                }
                placeholder={MODAL_MSSG.CONFLICT_COMMENTS_PLACEHOLDER}
                value={answer.comment}
                onChange={(e) =>
                  patchAnswer(id, kind, { comment: e.target.value })
                }
              />
            </div>
          )}

          {policy.requiresCardConfirmation && (
            <div className="rc-card-confirm">
              <div className="rc-confirm-title">
                {MODAL_MSSG.CONFLICT_CONFIRM_REVIEWED_ABOVE}
              </div>
              <div className="d-flex align-items-start gap-2 mt-2">
                <CustomCheckbox
                  checked={answer.confirmed}
                  onChange={(checked) =>
                    patchAnswer(id, kind, { confirmed: checked })
                  }
                  id={`rc-card-confirm-${id}`}
                />
                <label className="rc-confirm-label" htmlFor={`rc-card-confirm-${id}`}>
                  {confirmLabelFor(kind)}{" "}
                  {cardInputsRequired(kind, answer) && (
                    <span className="rc-required">*</span>
                  )}
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <SideModal
        show={show}
        onHide={handleClose}
        title={openTaskId ? "Task information" : "Resolve conflicts"}
        type="lg"
      >
        {openTaskId ? (
          <TaskDetailSidebar
            taskId={openTaskId}
            onBack={() => setOpenTaskId(null)}
            groupsRequired={false}
          />
        ) : (
          <div className="right-modal-basics right-modal-basics-resolve-conflicts">
            <div className="request-form-container rc-sidebar-body">
              {hasCards && <ConflictSummary tiles={summaryTiles} />}
              {!hasCards && <FailSafePage cardType="dataFailed" />}
              {needsResolutionCount > 0 && (
                <CollapsibleSection
                  title={`Needs conflict resolution (${needsResolutionCount})`}
                >
                  {(productionConflicts.card || hasPendingLockedCards) && (
                    <div className="rc-error-banner d-flex align-items-start gap-2">
                      <ErrorIcon />
                      <span className="bold-text">
                        {MODAL_MSSG.CONFLICT_WITH_SCHEDULED_UPDATES}
                      </span>
                      <span className="regular-text">
                        {MODAL_MSSG.CONFLICT_SELECT_VALUE_TO_APPLY}
                      </span>
                    </div>
                  )}
                  {productionConflicts.card &&
                    renderDiffCard({
                      id: PRODUCTION_CONFLICT_ID,
                      kind: "PRODUCTION_CONFLICT",
                      card: productionConflicts.card,
                      myLaunchDate: productionConflicts.myLaunchDate,
                    })}
                  {pendingConflicts.cards.map((card) => (
                    <React.Fragment key={card.id}>
                      {renderDiffCard({
                        id: card.id,
                        kind: card.kind,
                        card,
                        myLaunchDate: pendingConflicts.myLaunchDate,
                      })}
                    </React.Fragment>
                  ))}
                </CollapsibleSection>
              )}

              {productionDiff.card && (
                <CollapsibleSection
                  title={`Updated while you were editing (${productionDiff.fieldCount})`}
                >
                  <div className="rc-info-banner d-flex align-items-start gap-2">
                    <InfoGreyIcon />
                    <span className="bold-text">
                      {MODAL_MSSG.CONFLICT_FIELDS_SYNCED_UP}
                    </span>
                    <span className="regular-text">
                      {MODAL_MSSG.CONFLICT_FIELDS_NOT_EDITED_BY_YOU}
                    </span>
                  </div>
                  {renderDiffCard({
                    id: PRODUCTION_CHANGE_ID,
                    kind: "PRODUCTION_CHANGE",
                    card: productionDiff.card,
                    myLaunchDate: productionDiff.myLaunchDate,
                  })}
                </CollapsibleSection>
              )}

              {requiresFinalConfirmation && (
                <div className="rc-confirm-section">
                  <div className="rc-confirm-title">
                    {MODAL_MSSG.CONFLICT_CONFIRM_SELECTION}
                  </div>
                  <div className="d-flex align-items-start gap-2 mt-2">
                    <CustomCheckbox
                      checked={confirmed}
                      onChange={setConfirmed}
                      size="lg"
                    />
                    <label className="rc-confirm-label">
                      {MODAL_MSSG.CONFLICT_CONFIRM_REVIEWED}{" "}
                      <span className="rc-required">*</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="request-change-footer justify-content-between bottom-0 w-100 d-flex position-absolute">
              <Button className="back-button" onClick={handleClose}>
                Back to editing
              </Button>
              <div className="d-flex align-items-center gap-3">
                {total > 0 && (
                  <span className="rc-resolved-count">
                    {resolved} / {total} field{total === 1 ? "" : "s"} resolved
                  </span>
                )}
                <Button
                  className="continue-button"
                  onClick={onSaveAndContinue}
                  disabled={!canSave}
                >
                  Save and continue
                </Button>
              </div>
            </div>
          </div>
        )}
      </SideModal>
    </>
  );
};

export default ResolveConflictsModal;
