import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { act } from "@testing-library/react";

let useHistoryFilterStore: any;

beforeAll(async () => {
  const mod = await import("@/store/useHistoryFilterStore");
  useHistoryFilterStore = mod.useHistoryFilterStore;
});

describe("useHistoryFilterStore", () => {
  beforeEach(() => {
    act(() => {
      useHistoryFilterStore.getState().clear();
    });
  });

  it("has the expected initial state", () => {
    const state = useHistoryFilterStore.getState();

    expect(state.filters).toEqual({
      fromEffectiveDateRange: "",
      toEffectiveDateRange: "",
      typeOfEdit: [],
      fromWorkflowStartDate: "",
      toWorkflowStartDate: "",
      workflowId: {},
      opportunityId: {},
      changeRequest: {},
      updatedBy: {},
    });

    expect(state.applied).toEqual({
      filterApplied: 0,
      filteredAppliedKeys: [],
    });
  });

  it("setFilters merges partial filter updates", () => {
    act(() => {
      useHistoryFilterStore.getState().setFilters({
        fromEffectiveDateRange: "2024-01-01",
        typeOfEdit: ["General"],
      });
    });

    const state = useHistoryFilterStore.getState();
    expect(state.filters.fromEffectiveDateRange).toBe("2024-01-01");
    expect(state.filters.typeOfEdit).toEqual(["General"]);
    expect(state.filters.toEffectiveDateRange).toBe("");
  });

  it("multiple setFilters calls accumulate correctly", () => {
    act(() => {
      useHistoryFilterStore.getState().setFilters({
        fromEffectiveDateRange: "2024-01-01",
      });
    });

    act(() => {
      useHistoryFilterStore.getState().setFilters({
        toEffectiveDateRange: "2024-12-31",
      });
    });

    const state = useHistoryFilterStore.getState();
    expect(state.filters.fromEffectiveDateRange).toBe("2024-01-01");
    expect(state.filters.toEffectiveDateRange).toBe("2024-12-31");
  });

  it("setApplied merges partial meta updates", () => {
    act(() => {
      useHistoryFilterStore.getState().setApplied({
        filterApplied: 3,
        filteredAppliedKeys: ["typeOfEdit", "fromEffectiveDateRange", "updatedBy"],
      });
    });

    const state = useHistoryFilterStore.getState();
    expect(state.applied.filterApplied).toBe(3);
    expect(state.applied.filteredAppliedKeys).toEqual([
      "typeOfEdit",
      "fromEffectiveDateRange",
      "updatedBy",
    ]);
  });

  it("clear resets filters and applied to defaults", () => {
    act(() => {
      useHistoryFilterStore.getState().setFilters({
        fromEffectiveDateRange: "2024-01-01",
        typeOfEdit: ["Billing", "Marketing"],
        workflowId: { "WF-1": "WF-1" },
      });
    });

    act(() => {
      useHistoryFilterStore.getState().setApplied({
        filterApplied: 2,
        filteredAppliedKeys: ["typeOfEdit", "workflowId"],
      });
    });

    act(() => {
      useHistoryFilterStore.getState().clear();
    });

    const state = useHistoryFilterStore.getState();
    expect(state.filters.fromEffectiveDateRange).toBe("");
    expect(state.filters.typeOfEdit).toEqual([]);
    expect(state.filters.workflowId).toEqual({});
    expect(state.applied.filterApplied).toBe(0);
    expect(state.applied.filteredAppliedKeys).toEqual([]);
  });
});
