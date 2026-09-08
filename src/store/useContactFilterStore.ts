import { create } from "zustand";

export type Filters = {
    nameFilter: Record<string,string>;
    orgFilter: Record<string, string>;
    grpFilter: Record<string, string>;
    contactTypeIntFilter: string[];
    contactTypeExtFilter: string[];
};

type AppliedMeta = {
    filterApplied: number;
    filteredAppliedKeys: string[];
};

type State = {
    selectedFilters: {
        filters: Filters;
        applied: AppliedMeta;
    };
    getFilters: () => Filters;
    getApplied: () => AppliedMeta;
    setFilters: (filters: Partial<Filters>) => void;
    setApplied: (meta: Partial<AppliedMeta>) => void;
    clear: () => void;
};

const emptyFilters: Filters = {
    nameFilter: {},
    orgFilter: {},
    grpFilter: {},
    contactTypeIntFilter: [],
    contactTypeExtFilter: [],
};

const emptyApplied: AppliedMeta = { filterApplied: 0, filteredAppliedKeys: [] };

export const useContactFilterStore = create<State>()((set, get) => ({
    selectedFilters: {
        filters: { ...emptyFilters },
        applied: { ...emptyApplied },
    },

    getFilters: () => get().selectedFilters.filters,
    getApplied: () => get().selectedFilters.applied,

    setFilters: (filters) =>
        set((state) => ({
            selectedFilters: {
                ...state.selectedFilters,
                filters: { ...state.selectedFilters.filters, ...filters },
            },
        })),

    setApplied: (meta) => {
        set((state) => ({
            selectedFilters: {
                ...state.selectedFilters,
                applied: { ...state.selectedFilters.applied, ...meta },
            },
        }));
    },

    clear: () =>
        set(() => ({
            selectedFilters: {
                filters: { ...emptyFilters },
                applied: { ...emptyApplied },
            },
        })),
}));
