import { describe, it, expect, beforeEach } from "vitest";
import { useFilterStore } from "../filterStore";
import type { Scope } from "../filterStore";

describe("useFilterStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    const { clear } = useFilterStore.getState();
    clear("active");
    clear("inactive");
  });

  describe("Initial State", () => {
    it("should initialize with empty filters for both scopes", () => {
      const { getFilters } = useFilterStore.getState();
      
      const activeFilters = getFilters("active");
      const inactiveFilters = getFilters("inactive");

      expect(activeFilters).toEqual({
        membershipFilter: [],
        bundleTypeFilter: [],
        serviceCategoryFilter: [],
        minAgeFilter: 0,
        fromEffectiveDateRange: "",
        toEffectiveDateRange: "",
        fromTermDateRange: "",
        toTermDateRange: "",
      });

      expect(inactiveFilters).toEqual({
        membershipFilter: [],
        bundleTypeFilter: [],
        serviceCategoryFilter: [],
        minAgeFilter: 0,
        fromEffectiveDateRange: "",
        toEffectiveDateRange: "",
        fromTermDateRange: "",
        toTermDateRange: "",
      });
    });

    it("should initialize with empty applied meta for both scopes", () => {
      const { getApplied } = useFilterStore.getState();
      
      expect(getApplied("active")).toEqual({
        filterApplied: 0,
        filteredAppliedKeys: [],
      });

      expect(getApplied("inactive")).toEqual({
        filterApplied: 0,
        filteredAppliedKeys: [],
      });
    });
  });

  describe("setFilters", () => {
    it("should update filters for active scope", () => {
      const { setFilters, getFilters } = useFilterStore.getState();

      setFilters("active", {
        membershipFilter: ["Monthly", "Annual"],
        minAgeFilter: 18,
      });

      const filters = getFilters("active");
      expect(filters.membershipFilter).toEqual(["Monthly", "Annual"]);
      expect(filters.minAgeFilter).toBe(18);
      expect(filters.bundleTypeFilter).toEqual([]); // unchanged
    });

    it("should update filters for inactive scope", () => {
      const { setFilters, getFilters } = useFilterStore.getState();

      setFilters("inactive", {
        serviceCategoryFilter: ["Health", "Wellness"],
        fromEffectiveDateRange: "2023-01-01",
      });

      const filters = getFilters("inactive");
      expect(filters.serviceCategoryFilter).toEqual(["Health", "Wellness"]);
      expect(filters.fromEffectiveDateRange).toBe("2023-01-01");
    });

    it("should not affect other scope when updating one scope", () => {
      const { setFilters, getFilters } = useFilterStore.getState();

      setFilters("active", { minAgeFilter: 25 });
      
      const activeFilters = getFilters("active");
      const inactiveFilters = getFilters("inactive");

      expect(activeFilters.minAgeFilter).toBe(25);
      expect(inactiveFilters.minAgeFilter).toBe(0); // unchanged
    });

    it("should merge partial updates with existing filters", () => {
      const { setFilters, getFilters } = useFilterStore.getState();

      setFilters("active", { membershipFilter: ["Monthly"] });
      setFilters("active", { bundleTypeFilter: ["Premium"] });

      const filters = getFilters("active");
      expect(filters.membershipFilter).toEqual(["Monthly"]);
      expect(filters.bundleTypeFilter).toEqual(["Premium"]);
    });

    it("should handle all filter types", () => {
      const { setFilters, getFilters } = useFilterStore.getState();

      setFilters("active", {
        membershipFilter: ["Type1"],
        bundleTypeFilter: ["Bundle1"],
        serviceCategoryFilter: ["Category1"],
        minAgeFilter: 30,
        fromEffectiveDateRange: "2023-01-01",
        toEffectiveDateRange: "2023-12-31",
        fromTermDateRange: "2024-01-01",
        toTermDateRange: "2024-12-31",
      });

      const filters = getFilters("active");
      expect(filters).toEqual({
        membershipFilter: ["Type1"],
        bundleTypeFilter: ["Bundle1"],
        serviceCategoryFilter: ["Category1"],
        minAgeFilter: 30,
        fromEffectiveDateRange: "2023-01-01",
        toEffectiveDateRange: "2023-12-31",
        fromTermDateRange: "2024-01-01",
        toTermDateRange: "2024-12-31",
      });
    });

    it("should overwrite existing array values", () => {
      const { setFilters, getFilters } = useFilterStore.getState();

      setFilters("active", { membershipFilter: ["Old1", "Old2"] });
      setFilters("active", { membershipFilter: ["New1"] });

      expect(getFilters("active").membershipFilter).toEqual(["New1"]);
    });

    it("should handle empty arrays", () => {
      const { setFilters, getFilters } = useFilterStore.getState();

      setFilters("active", { membershipFilter: ["Value"] });
      setFilters("active", { membershipFilter: [] });

      expect(getFilters("active").membershipFilter).toEqual([]);
    });

    it("should handle zero as minAgeFilter", () => {
      const { setFilters, getFilters } = useFilterStore.getState();

      setFilters("active", { minAgeFilter: 50 });
      setFilters("active", { minAgeFilter: 0 });

      expect(getFilters("active").minAgeFilter).toBe(0);
    });
  });

  describe("setApplied", () => {
    it("should update applied meta for active scope", () => {
      const { setApplied, getApplied } = useFilterStore.getState();

      setApplied("active", {
        filterApplied: 3,
        filteredAppliedKeys: ["Age", "Membership", "Date"],
      });

      const applied = getApplied("active");
      expect(applied.filterApplied).toBe(3);
      expect(applied.filteredAppliedKeys).toEqual(["Age", "Membership", "Date"]);
    });

    it("should update applied meta for inactive scope", () => {
      const { setApplied, getApplied } = useFilterStore.getState();

      setApplied("inactive", {
        filterApplied: 2,
        filteredAppliedKeys: ["Category", "Bundle"],
      });

      const applied = getApplied("inactive");
      expect(applied.filterApplied).toBe(2);
      expect(applied.filteredAppliedKeys).toEqual(["Category", "Bundle"]);
    });

    it("should not affect other scope when updating one scope", () => {
      const { setApplied, getApplied } = useFilterStore.getState();

      setApplied("active", { filterApplied: 5 });
      
      expect(getApplied("active").filterApplied).toBe(5);
      expect(getApplied("inactive").filterApplied).toBe(0);
    });

    it("should merge partial updates with existing applied meta", () => {
      const { setApplied, getApplied } = useFilterStore.getState();

      setApplied("active", { filterApplied: 2 });
      setApplied("active", { filteredAppliedKeys: ["Key1", "Key2"] });

      const applied = getApplied("active");
      expect(applied.filterApplied).toBe(2);
      expect(applied.filteredAppliedKeys).toEqual(["Key1", "Key2"]);
    });

    it("should handle only filterApplied update", () => {
      const { setApplied, getApplied } = useFilterStore.getState();

      setApplied("active", { filterApplied: 10 });

      expect(getApplied("active")).toEqual({
        filterApplied: 10,
        filteredAppliedKeys: [],
      });
    });

    it("should handle only filteredAppliedKeys update", () => {
      const { setApplied, getApplied } = useFilterStore.getState();

      setApplied("active", { filteredAppliedKeys: ["A", "B", "C"] });

      expect(getApplied("active")).toEqual({
        filterApplied: 0,
        filteredAppliedKeys: ["A", "B", "C"],
      });
    });

    it("should handle zero count", () => {
      const { setApplied, getApplied } = useFilterStore.getState();

      setApplied("active", { filterApplied: 5 });
      setApplied("active", { filterApplied: 0 });

      expect(getApplied("active").filterApplied).toBe(0);
    });

    it("should handle empty keys array", () => {
      const { setApplied, getApplied } = useFilterStore.getState();

      setApplied("active", { filteredAppliedKeys: ["Key1"] });
      setApplied("active", { filteredAppliedKeys: [] });

      expect(getApplied("active").filteredAppliedKeys).toEqual([]);
    });
  });

  describe("clear", () => {
    it("should reset active scope to empty state", () => {
      const { setFilters, setApplied, clear, getFilters, getApplied } = useFilterStore.getState();

      // Set some data
      setFilters("active", {
        membershipFilter: ["Monthly"],
        minAgeFilter: 25,
      });
      setApplied("active", {
        filterApplied: 3,
        filteredAppliedKeys: ["Key1"],
      });

      // Clear
      clear("active");

      // Verify reset
      expect(getFilters("active")).toEqual({
        membershipFilter: [],
        bundleTypeFilter: [],
        serviceCategoryFilter: [],
        minAgeFilter: 0,
        fromEffectiveDateRange: "",
        toEffectiveDateRange: "",
        fromTermDateRange: "",
        toTermDateRange: "",
      });
      expect(getApplied("active")).toEqual({
        filterApplied: 0,
        filteredAppliedKeys: [],
      });
    });

    it("should reset inactive scope to empty state", () => {
      const { setFilters, setApplied, clear, getFilters, getApplied } = useFilterStore.getState();

      setFilters("inactive", { bundleTypeFilter: ["Premium"] });
      setApplied("inactive", { filterApplied: 5 });

      clear("inactive");

      expect(getFilters("inactive")).toEqual({
        membershipFilter: [],
        bundleTypeFilter: [],
        serviceCategoryFilter: [],
        minAgeFilter: 0,
        fromEffectiveDateRange: "",
        toEffectiveDateRange: "",
        fromTermDateRange: "",
        toTermDateRange: "",
      });
      expect(getApplied("inactive")).toEqual({
        filterApplied: 0,
        filteredAppliedKeys: [],
      });
    });

    it("should not affect other scope when clearing one scope", () => {
      const { setFilters, clear, getFilters } = useFilterStore.getState();

      setFilters("active", { minAgeFilter: 20 });
      setFilters("inactive", { minAgeFilter: 30 });

      clear("active");

      expect(getFilters("active").minAgeFilter).toBe(0);
      expect(getFilters("inactive").minAgeFilter).toBe(30);
    });

    it("should be idempotent when called multiple times", () => {
      const { setFilters, clear, getFilters } = useFilterStore.getState();

      setFilters("active", { minAgeFilter: 40 });
      clear("active");
      clear("active");
      clear("active");

      expect(getFilters("active").minAgeFilter).toBe(0);
    });
  });

  describe("getFilters", () => {
    it("should return current filters for active scope", () => {
      const { setFilters, getFilters } = useFilterStore.getState();

      setFilters("active", { membershipFilter: ["Test"] });
      
      const filters = getFilters("active");
      expect(filters.membershipFilter).toEqual(["Test"]);
    });

    it("should return current filters for inactive scope", () => {
      const { setFilters, getFilters } = useFilterStore.getState();

      setFilters("inactive", { minAgeFilter: 21 });
      
      const filters = getFilters("inactive");
      expect(filters.minAgeFilter).toBe(21);
    });

    it("should return independent copies for different scopes", () => {
      const { setFilters, getFilters } = useFilterStore.getState();

      setFilters("active", { minAgeFilter: 10 });
      setFilters("inactive", { minAgeFilter: 20 });

      expect(getFilters("active").minAgeFilter).toBe(10);
      expect(getFilters("inactive").minAgeFilter).toBe(20);
    });
  });

  describe("getApplied", () => {
    it("should return current applied meta for active scope", () => {
      const { setApplied, getApplied } = useFilterStore.getState();

      setApplied("active", { filterApplied: 7 });
      
      expect(getApplied("active").filterApplied).toBe(7);
    });

    it("should return current applied meta for inactive scope", () => {
      const { setApplied, getApplied } = useFilterStore.getState();

      setApplied("inactive", { filteredAppliedKeys: ["X", "Y"] });
      
      expect(getApplied("inactive").filteredAppliedKeys).toEqual(["X", "Y"]);
    });

    it("should return independent copies for different scopes", () => {
      const { setApplied, getApplied } = useFilterStore.getState();

      setApplied("active", { filterApplied: 1 });
      setApplied("inactive", { filterApplied: 2 });

      expect(getApplied("active").filterApplied).toBe(1);
      expect(getApplied("inactive").filterApplied).toBe(2);
    });
  });

  describe("Complex Scenarios", () => {
    it("should handle multiple operations on same scope", () => {
      const { setFilters, setApplied, getFilters, getApplied } = useFilterStore.getState();

      setFilters("active", { membershipFilter: ["A"] });
      setApplied("active", { filterApplied: 1 });
      setFilters("active", { minAgeFilter: 15 });
      setApplied("active", { filteredAppliedKeys: ["Key"] });

      expect(getFilters("active").membershipFilter).toEqual(["A"]);
      expect(getFilters("active").minAgeFilter).toBe(15);
      expect(getApplied("active").filterApplied).toBe(1);
      expect(getApplied("active").filteredAppliedKeys).toEqual(["Key"]);
    });

    it("should handle operations on both scopes simultaneously", () => {
      const { setFilters, getFilters } = useFilterStore.getState();

      setFilters("active", { minAgeFilter: 10 });
      setFilters("inactive", { minAgeFilter: 20 });
      setFilters("active", { membershipFilter: ["Active"] });
      setFilters("inactive", { membershipFilter: ["Inactive"] });

      expect(getFilters("active")).toEqual({
        membershipFilter: ["Active"],
        bundleTypeFilter: [],
        serviceCategoryFilter: [],
        minAgeFilter: 10,
        fromEffectiveDateRange: "",
        toEffectiveDateRange: "",
        fromTermDateRange: "",
        toTermDateRange: "",
      });

      expect(getFilters("inactive")).toEqual({
        membershipFilter: ["Inactive"],
        bundleTypeFilter: [],
        serviceCategoryFilter: [],
        minAgeFilter: 20,
        fromEffectiveDateRange: "",
        toEffectiveDateRange: "",
        fromTermDateRange: "",
        toTermDateRange: "",
      });
    });

    it("should maintain data integrity after clear and set", () => {
      const { setFilters, clear, getFilters } = useFilterStore.getState();

      setFilters("active", { minAgeFilter: 30 });
      clear("active");
      setFilters("active", { minAgeFilter: 40 });

      expect(getFilters("active").minAgeFilter).toBe(40);
      expect(getFilters("active").membershipFilter).toEqual([]);
    });

    it("should handle date range filters", () => {
      const { setFilters, getFilters } = useFilterStore.getState();

      setFilters("active", {
        fromEffectiveDateRange: "2023-01-01",
        toEffectiveDateRange: "2023-06-30",
        fromTermDateRange: "2024-01-01",
        toTermDateRange: "2024-12-31",
      });

      const filters = getFilters("active");
      expect(filters.fromEffectiveDateRange).toBe("2023-01-01");
      expect(filters.toEffectiveDateRange).toBe("2023-06-30");
      expect(filters.fromTermDateRange).toBe("2024-01-01");
      expect(filters.toTermDateRange).toBe("2024-12-31");
    });

    it("should handle array filters with multiple values", () => {
      const { setFilters, getFilters } = useFilterStore.getState();

      setFilters("active", {
        membershipFilter: ["Monthly", "Annual", "Quarterly"],
        bundleTypeFilter: ["Premium", "Basic", "Enterprise"],
        serviceCategoryFilter: ["Health", "Wellness", "Mental"],
      });

      const filters = getFilters("active");
      expect(filters.membershipFilter).toHaveLength(3);
      expect(filters.bundleTypeFilter).toHaveLength(3);
      expect(filters.serviceCategoryFilter).toHaveLength(3);
    });

    it("should handle large filter count", () => {
      const { setApplied, getApplied } = useFilterStore.getState();

      const keys = Array.from({ length: 100 }, (_, i) => `Key${i}`);
      setApplied("active", {
        filterApplied: 100,
        filteredAppliedKeys: keys,
      });

      const applied = getApplied("active");
      expect(applied.filterApplied).toBe(100);
      expect(applied.filteredAppliedKeys).toHaveLength(100);
    });
  });

  describe("Type Safety", () => {
    it("should work with Scope type active", () => {
      const scope: Scope = "active";
      const { setFilters, getFilters } = useFilterStore.getState();

      setFilters(scope, { minAgeFilter: 25 });
      expect(getFilters(scope).minAgeFilter).toBe(25);
    });

    it("should work with Scope type inactive", () => {
      const scope: Scope = "inactive";
      const { setFilters, getFilters } = useFilterStore.getState();

      setFilters(scope, { minAgeFilter: 35 });
      expect(getFilters(scope).minAgeFilter).toBe(35);
    });
  });
});
