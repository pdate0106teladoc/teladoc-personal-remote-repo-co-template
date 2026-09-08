import { create } from "zustand";

export type Scope = "active" | "inactive";

type Filters = {
  membershipFilter: string[];
  bundleTypeFilter: string[];
  serviceCategoryFilter: string[];
  minAgeFilter: number;
  fromEffectiveDateRange: string;
  toEffectiveDateRange: string;
  fromTermDateRange: string;
  toTermDateRange: string;
};

type AppliedMeta = {
  filterApplied: number; // count
  filteredAppliedKeys: string[]; // chip labels
};

type State = {
  byScope: Record<Scope, { filters: Filters; applied: AppliedMeta }>;
  // getters
  getFilters: (scope: Scope) => Filters;
  getApplied: (scope: Scope) => AppliedMeta;
  // setters
  setFilters: (scope: Scope, filters: Partial<Filters>) => void;
  setApplied: (scope: Scope, meta: Partial<AppliedMeta>) => void;
  clear: (scope: Scope) => void;
};

// helper for empty filters
const emptyFilters: Filters = {
  membershipFilter: [],
  bundleTypeFilter: [],
  serviceCategoryFilter: [],
  minAgeFilter: 0,
  fromEffectiveDateRange: "",
  toEffectiveDateRange: "",
  fromTermDateRange: "",
  toTermDateRange: "",
};

const emptyApplied: AppliedMeta = { filterApplied: 0, filteredAppliedKeys: [] };

export const useFilterStore = create<State>((set, get) => ({
  byScope: {
    active: { filters: { ...emptyFilters }, applied: { ...emptyApplied } },
    inactive: { filters: { ...emptyFilters }, applied: { ...emptyApplied } },
  },

  getFilters: (scope) => get().byScope[scope].filters,
  getApplied: (scope) => get().byScope[scope].applied,

  setFilters: (scope, partial) =>
    set((s) => ({
      byScope: {
        ...s.byScope,
        [scope]: {
          ...s.byScope[scope],
          filters: { ...s.byScope[scope].filters, ...partial },
        },
      },
    })),

  setApplied: (scope, partial) =>
    set((s) => ({
      byScope: {
        ...s.byScope,
        [scope]: {
          ...s.byScope[scope],
          applied: { ...s.byScope[scope].applied, ...partial },
        },
      },
    })),

  clear: (scope) =>
    set((s) => ({
      byScope: {
        ...s.byScope,
        [scope]: { filters: { ...emptyFilters }, applied: { ...emptyApplied } },
      },
    })),
}));
