import { describe, it, expect, beforeEach } from "vitest";
import { useContactFilterStore, Filters } from "../useContactFilterStore";

type AppliedMeta = {
  filterApplied: number;
  filteredAppliedKeys: string[];
};
const getState = () => useContactFilterStore.getState();

describe("useContactFilterStore", () => {
  beforeEach(() => {
    useContactFilterStore.setState({
      selectedFilters: {
        filters: {
          nameFilter: {},
          orgFilter: {},
          grpFilter: {},
          contactTypeIntFilter: [],
          contactTypeExtFilter: [],
        },
        applied: { filterApplied: 0, filteredAppliedKeys: [] },
      },
    });
  });

  it("should initialize with empty filters and applied metadata", () => {
    const state = getState();
    const filters = state.getFilters();
    const applied = state.getApplied();

    expect(filters).toEqual({
      nameFilter: {},
      orgFilter: {},
      grpFilter: {},
      contactTypeIntFilter: [],
      contactTypeExtFilter: [],
    });

    expect(applied).toEqual({ filterApplied: 0, filteredAppliedKeys: [] });
  });

  it("should update filters correctly using setFilters", () => {
    const newFilters: Partial<Filters> = {
      nameFilter: { name: "John Doe" },
      orgFilter: { org1: "Organization 1" },
    };

    useContactFilterStore.getState().setFilters(newFilters);

    const filters = getState().getFilters();

    expect(filters.nameFilter).toEqual({ name: "John Doe" });
    expect(filters.orgFilter).toEqual({ org1: "Organization 1" });
  });

  it("should update applied metadata correctly using setApplied", () => {
    const newAppliedMeta: Partial<AppliedMeta> = {
      filterApplied: 3,
      filteredAppliedKeys: ["Name", "Organization", "Group"],
    };

    useContactFilterStore.getState().setApplied(newAppliedMeta);

    const applied = getState().getApplied();

    expect(applied.filterApplied).toBe(3);
    expect(applied.filteredAppliedKeys).toEqual(["Name", "Organization", "Group"]);
  });

  it("should clear filters and applied metadata using clear", () => {
    useContactFilterStore.getState().setFilters({
      nameFilter: { name: "John Doe" },
      contactTypeIntFilter: ["Internal"],
    });
    useContactFilterStore.getState().setApplied({
      filterApplied: 2,
      filteredAppliedKeys: ["Name", "Contact type (internal user)"],
    });

    useContactFilterStore.getState().clear();

    const filters = getState().getFilters();
    const applied = getState().getApplied();

    expect(filters).toEqual({
      nameFilter: {},
      orgFilter: {},
      grpFilter: {},
      contactTypeIntFilter: [],
      contactTypeExtFilter: [],
    });

    expect(applied).toEqual({ filterApplied: 0, filteredAppliedKeys: [] });
  });

  it("should not affect other stores when clear is called", () => {
    useContactFilterStore.getState().setFilters({
      nameFilter: { name: "John Doe" },
      contactTypeIntFilter: ["Internal"],
    });

    useContactFilterStore.getState().clear();

    const filters = getState().getFilters();
    const applied = getState().getApplied();

    expect(filters).toEqual({
      nameFilter: {},
      orgFilter: {},
      grpFilter: {},
      contactTypeIntFilter: [],
      contactTypeExtFilter: [],
    });
    expect(applied).toEqual({ filterApplied: 0, filteredAppliedKeys: [] });
  });

  it("should apply filters and metadata correctly when setFilters and setApplied are used together", () => {
    const newFilters: Partial<Filters> = {
      nameFilter: { name: "Jane Doe" },
      contactTypeExtFilter: ["External"],
    };

    const newAppliedMeta: Partial<AppliedMeta> = {
      filterApplied: 2,
      filteredAppliedKeys: ["Name", "Contact type (external contact)"],
    };

    useContactFilterStore.getState().setFilters(newFilters);
    useContactFilterStore.getState().setApplied(newAppliedMeta);

    const filters = getState().getFilters();
    const applied = getState().getApplied();

    expect(filters.nameFilter).toEqual({ name: "Jane Doe" });
    expect(filters.contactTypeExtFilter).toEqual(["External"]);

    expect(applied.filterApplied).toBe(2);
    expect(applied.filteredAppliedKeys).toEqual(["Name", "Contact type (external contact)"]);
  });
});
