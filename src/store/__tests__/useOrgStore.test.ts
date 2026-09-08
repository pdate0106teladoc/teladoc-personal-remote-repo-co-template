import useOrgStore from "../useOrgStore";
import { act } from "react-dom/test-utils";

describe("useOrgStore", () => {
  beforeEach(() => {
    // Reset the Zustand store before each test
    act(() => {
      useOrgStore.setState({
        reportingCahce: {},
        generalSettingCache: {},
        billingCache: {},
        markeingCache: {},
        opportunitiesCache: {},
        hierarchyCache: {},
      });
    });
  });

  it("sets and retrieves general settings", () => {
    const id = "org1";
    const generalSettings = { setting: "value" } as any;

    act(() => {
      useOrgStore.getState().setGeneralSettings(id, generalSettings);
    });

    const result = useOrgStore.getState().getGeneralSettings(id);
    expect(result).toEqual(generalSettings);
  });

  it("sets and retrieves billing data", () => {
    const id = "org2";
    const billingData = { billingInfo: "value" } as any;

    act(() => {
      useOrgStore.getState().setBillingData(id, billingData);
    });

    const result = useOrgStore.getState().getBillingData(id);
    expect(result).toEqual(billingData);
  });

  it("sets and retrieves marketing data", () => {
    const id = "org3";
    const marketingData = { campaign: "value" } as any;

    act(() => {
      useOrgStore.getState().setMarketingData(id, marketingData);
    });

    const result = useOrgStore.getState().getMarketingData(id);
    expect(result).toEqual(marketingData);
  });

  it("sets and retrieves reporting data", () => {
    const id = "org4";
    const reportingData = { report: "value" } as any;

    act(() => {
      useOrgStore.getState().setReportingData(id, reportingData);
    });

    const result = useOrgStore.getState().getReportingData(id);
    expect(result).toEqual(reportingData);
  });

  it("sets and retrieves opportunities cache per page", () => {
    const id = "org5";
    const page = 1;
    const totalResults = 100;
    const opportunities = [{ opportunity: "value" }] as any[];

    act(() => {
      useOrgStore.getState().setOpportunitiesCache(id, opportunities, page, totalResults);
    });
    const result = useOrgStore.getState().getOpportunitiesCache(id, page);
    expect(result["opportunities"]).toEqual(opportunities);
    const orgCache = useOrgStore.getState().opportunitiesCache[id];
    expect(orgCache.totalResults).toBe(totalResults);
  });


  it("sets and retrieves hierarchy cache", () => {
    const id = "org6";
    const hierarchyData = { hierarchy: "value" } as any;

    act(() => {
      useOrgStore.getState().setHierarchyCache(id, hierarchyData);
    });

    const result = useOrgStore.getState().getHierarchyCache(id);
    expect(result).toEqual(hierarchyData);
  });

  it("returns undefined for non-existent general settings", () => {
    const result = useOrgStore.getState().getGeneralSettings("non-existent-id");
    expect(result).toBeUndefined();
  });

  it("returns undefined for non-existent billing data", () => {
    const result = useOrgStore.getState().getBillingData("non-existent-id");
    expect(result).toBeUndefined();
  });

  it("returns undefined for non-existent marketing data", () => {
    const result = useOrgStore.getState().getMarketingData("non-existent-id");
    expect(result).toBeUndefined();
  });

  it("returns undefined for non-existent reporting data", () => {
    const result = useOrgStore.getState().getReportingData("non-existent-id");
    expect(result).toBeUndefined();
  });

  it("returns null for non-existent opportunities cache", () => {
    const result = useOrgStore
      .getState()
      .getOpportunitiesCache("non-existent-id", 0);
    expect(result["opportunities"]).toBeNull();
  });

  it("returns undefined for non-existent hierarchy cache", () => {
    const result = useOrgStore.getState().getHierarchyCache("non-existent-id");
    expect(result).toBeUndefined();
  });

  it("gets opportunities page total from cache", () => {
    const id = "org7";
    const page = 1;
    const totalResults = 250;
    const opportunities = [
      { id: "opp1", name: "Opportunity 1" },
      { id: "opp2", name: "Opportunity 2" },
    ] as any[];

    act(() => {
      useOrgStore.getState().setOpportunitiesCache(id, opportunities, page, totalResults);
    });

    const result = useOrgStore.getState().getOpportunitiesPageTotal(id);
    expect(result).toBe(totalResults);
  });

  it("returns 0 for non-existent opportunities page total", () => {
    const result = useOrgStore.getState().getOpportunitiesPageTotal("non-existent-id");
    expect(result).toBe(0);
  });

  it("maintains separate opportunities pages for same id", () => {
    const id = "org8";
    const page1 = 1;
    const page2 = 2;
    const totalResults = 100;
    const opportunities1 = [{ id: "opp1" }] as any[];
    const opportunities2 = [{ id: "opp2" }] as any[];

    act(() => {
      useOrgStore.getState().setOpportunitiesCache(id, opportunities1, page1, totalResults);
      useOrgStore.getState().setOpportunitiesCache(id, opportunities2, page2, totalResults);
    });

    const result1 = useOrgStore.getState().getOpportunitiesCache(id, page1);
    const result2 = useOrgStore.getState().getOpportunitiesCache(id, page2);

    expect(result1.opportunities).toEqual(opportunities1);
    expect(result2.opportunities).toEqual(opportunities2);
    expect(result1.totalResults).toBe(totalResults);
    expect(result2.totalResults).toBe(totalResults);
  });

  it("updates total results when setting opportunities cache with different total", () => {
    const id = "org9";
    const page1 = 1;
    const page2 = 2;
    const totalResults1 = 100;
    const totalResults2 = 150;
    const opportunities1 = [{ id: "opp1" }] as any[];
    const opportunities2 = [{ id: "opp2" }] as any[];

    act(() => {
      useOrgStore.getState().setOpportunitiesCache(id, opportunities1, page1, totalResults1);
    });

    expect(useOrgStore.getState().getOpportunitiesPageTotal(id)).toBe(totalResults1);

    act(() => {
      useOrgStore.getState().setOpportunitiesCache(id, opportunities2, page2, totalResults2);
    });

    expect(useOrgStore.getState().getOpportunitiesPageTotal(id)).toBe(totalResults2);
  });

  it("handles null general settings correctly", () => {
    const id = "org10";

    act(() => {
      useOrgStore.getState().setGeneralSettings(id, null);
    });

    const result = useOrgStore.getState().getGeneralSettings(id);
    expect(result).toBeNull();
  });

  it("overwrites opportunities page data when setting same page again", () => {
    const id = "org11";
    const page = 1;
    const totalResults = 50;
    const oldOpportunities = [{ id: "old1" }] as any[];
    const newOpportunities = [{ id: "new1" }, { id: "new2" }] as any[];

    act(() => {
      useOrgStore.getState().setOpportunitiesCache(id, oldOpportunities, page, totalResults);
    });

    expect(useOrgStore.getState().getOpportunitiesCache(id, page).opportunities).toEqual(oldOpportunities);

    act(() => {
      useOrgStore.getState().setOpportunitiesCache(id, newOpportunities, page, totalResults);
    });

    expect(useOrgStore.getState().getOpportunitiesCache(id, page).opportunities).toEqual(newOpportunities);
  });

  it("returns 0 total results when opportunities cache exists but has no totalResults", () => {
    const id = "org12";
    
    const result = useOrgStore.getState().getOpportunitiesCache(id, 1);
    expect(result.totalResults).toBe(0);
  });

  it("maintains opportunities page total across multiple page sets", () => {
    const id = "org13";
    const totalResults = 300;

    act(() => {
      useOrgStore.getState().setOpportunitiesCache(id, [{ id: "opp1" }] as any[], 1, totalResults);
      useOrgStore.getState().setOpportunitiesCache(id, [{ id: "opp2" }] as any[], 2, totalResults);
      useOrgStore.getState().setOpportunitiesCache(id, [{ id: "opp3" }] as any[], 3, totalResults);
    });

    expect(useOrgStore.getState().getOpportunitiesPageTotal(id)).toBe(totalResults);
    expect(useOrgStore.getState().getOpportunitiesCache(id, 1).opportunities).toHaveLength(1);
    expect(useOrgStore.getState().getOpportunitiesCache(id, 2).opportunities).toHaveLength(1);
    expect(useOrgStore.getState().getOpportunitiesCache(id, 3).opportunities).toHaveLength(1);
  });
});
