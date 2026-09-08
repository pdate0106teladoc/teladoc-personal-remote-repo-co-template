import { create } from "zustand";
import type { RebuttalSummary, ReviewSummary } from "@/components/Review/reviewFieldRegistry";

/** Mirrors the review API's rebuttal window fields. */
export interface RebuttalWindow {
  allowRebuttal: boolean;
  daysRemaining: number | null;
}

interface ReviewState {
  failedFields: Set<string>;
  showCompleteReviewModal: boolean;
  showRebuttalModal: boolean;
  showTaskDetailSidebar: boolean;
  latestReviewSummary: ReviewSummary | null;
  /** Rebuttal awaiting the reviewer; reasons already resolved to display labels. */
  latestRebuttalSummary: RebuttalSummary | null;
  /** Backend-owned rebuttal window from the review API; null until it loads. */
  rebuttalWindow: RebuttalWindow | null;
  rejectedUpdateCount: number;
  /** formFieldKey → full API fieldPath for rejected-review correction submit. */
  rejectedReviewFieldPathByFormKey: Record<string, string>;
  /** Fail-checkbox UI key → full API fieldPath for reviewer in-progress view. */
  reviewFieldPathByUiKey: Record<string, string>;

  // Actions
  toggleFieldFail: (fieldKey: string) => void;
  setFieldFail: (fieldKey: string, failed: boolean) => void;
  setFailedFields: (fields: Set<string>) => void;
  clearFailedFields: () => void;
  setShowCompleteReviewModal: (show: boolean) => void;
  setShowRebuttalModal: (show: boolean) => void;
  setShowTaskDetailSidebar: (show: boolean) => void;
  setLatestReviewSummary: (summary: ReviewSummary | null, rejectedCount?: number) => void;
  setLatestRebuttalSummary: (summary: RebuttalSummary | null) => void;
  setRebuttalWindow: (window: RebuttalWindow | null) => void;
  setRejectedReviewFieldPathByFormKey: (map: Record<string, string>) => void;
  setReviewFieldPathByUiKey: (map: Record<string, string>) => void;
  hasFailedItems: () => boolean;
  resetReviewState: () => void;
}

const useReviewStore = create<ReviewState>((set, get) => ({
  failedFields: new Set(),
  showCompleteReviewModal: false,
  showRebuttalModal: false,
  showTaskDetailSidebar: false,
  latestReviewSummary: null,
  latestRebuttalSummary: null,
  rebuttalWindow: null,
  rejectedUpdateCount: 0,
  rejectedReviewFieldPathByFormKey: {},
  reviewFieldPathByUiKey: {},

  toggleFieldFail: (fieldKey) =>
    set((state) => {
      const next = new Set(state.failedFields);
      if (next.has(fieldKey)) {
        next.delete(fieldKey);
      } else {
        next.add(fieldKey);
      }
      return { failedFields: next };
    }),

  setFieldFail: (fieldKey, failed) =>
    set((state) => {
      const next = new Set(state.failedFields);
      if (failed) {
        next.add(fieldKey);
      } else {
        next.delete(fieldKey);
      }
      return { failedFields: next };
    }),

  setFailedFields: (fields) => set({ failedFields: fields }),

  clearFailedFields: () => set({ failedFields: new Set() }),

  setShowCompleteReviewModal: (show) => set({ showCompleteReviewModal: show }),

  setShowRebuttalModal: (show) => set({ showRebuttalModal: show }),

  setShowTaskDetailSidebar: (show) => set({ showTaskDetailSidebar: show }),

  setLatestReviewSummary: (summary, rejectedCount = 0) =>
    set({
      latestReviewSummary: summary,
      rejectedUpdateCount: rejectedCount,
    }),

  setLatestRebuttalSummary: (summary) => set({ latestRebuttalSummary: summary }),

  setRebuttalWindow: (window) => set({ rebuttalWindow: window }),

  setRejectedReviewFieldPathByFormKey: (map) =>
    set({ rejectedReviewFieldPathByFormKey: map }),

  setReviewFieldPathByUiKey: (map) => set({ reviewFieldPathByUiKey: map }),

  hasFailedItems: () => get().failedFields.size > 0,

  resetReviewState: () =>
    set({
      failedFields: new Set(),
      showCompleteReviewModal: false,
      showRebuttalModal: false,
      showTaskDetailSidebar: false,
      latestReviewSummary: null,
      latestRebuttalSummary: null,
      rebuttalWindow: null,
      rejectedUpdateCount: 0,
      rejectedReviewFieldPathByFormKey: {},
      reviewFieldPathByUiKey: {},
    }),
}));

export default useReviewStore;
