import { create } from "zustand";

export type HistoryFilters = {
    fromEffectiveDateRange: string;
    toEffectiveDateRange: string;
    typeOfEdit: string[];
    fromWorkflowStartDate: string;
    toWorkflowStartDate: string;
    workflowId: Record<string, string>;
    opportunityId: Record<string, string>;
    changeRequest: Record<string, string>;
    updatedBy: Record<string, string>;
};

type AppliedMeta = {
    filterApplied: number;
    filteredAppliedKeys: string[];
};

type State = {
    filters: HistoryFilters;
    applied: AppliedMeta;
    setFilters: (filters: Partial<HistoryFilters>) => void;
    setApplied: (meta: Partial<AppliedMeta>) => void;
    clear: () => void;
};

const emptyFilters: HistoryFilters = {
    fromEffectiveDateRange: "",
    toEffectiveDateRange: "",
    typeOfEdit: [],
    fromWorkflowStartDate: "",
    toWorkflowStartDate: "",
    workflowId: {},
    opportunityId: {},
    changeRequest: {},
    updatedBy: {},
};

const emptyApplied: AppliedMeta = { filterApplied: 0, filteredAppliedKeys: [] };

export const useHistoryFilterStore = create<State>()((set) => ({
    filters: { ...emptyFilters },
    applied: { ...emptyApplied },

    setFilters: (partial) =>
        set((state) => ({
            filters: { ...state.filters, ...partial },
        })),

    setApplied: (partial) =>
        set((state) => ({
            applied: { ...state.applied, ...partial },
        })),

    clear: () =>
        set(() => ({
            filters: { ...emptyFilters },
            applied: { ...emptyApplied },
        })),
}));
