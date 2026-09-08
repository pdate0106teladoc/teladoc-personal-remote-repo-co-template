import useGroupStore from "../useGroupStore";
import { act } from "react-dom/test-utils";

describe("useGroupStore", () => {
  beforeEach(() => {
    // Reset the Zustand store before each test
    act(() => {
      useGroupStore.setState({
        generalSettingsCache: {},
        billingCache: {},
        eligibilityCache: {},
        marketingCache: {},
        reportingCache: {},
        productsCache: {},
        productDetailCache: {},
        productBundleDetailCache: {},
      });
    });
  });

  it("sets and retrieves general settings", () => {
    const id = "group1";
    const generalSettings = { setting: "value" } as any;

    act(() => {
      useGroupStore.getState().setGeneralSettings(id, generalSettings);
    });

    const result = useGroupStore.getState().getGeneralSettings(id);
    expect(result).toEqual(generalSettings);
  });

  it("sets and retrieves billing data", () => {
    const id = "group2";
    const billingData = { billingInfo: "value" } as any;

    act(() => {
      useGroupStore.getState().setBillingData(id, billingData);
    });

    const result = useGroupStore.getState().getBillingData(id);
    expect(result).toEqual(billingData);
  });

  it("sets and retrieves eligibility data", () => {
    const id = "group3";
    const eligibilityData = { eligibilityInfo: "value" } as any;

    act(() => {
      useGroupStore.getState().setEligibilityData(id, eligibilityData);
    });

    const result = useGroupStore.getState().getEligibilityData(id);
    expect(result).toEqual(eligibilityData);
  });

  it("sets and retrieves marketing data", () => {
    const id = "group4";
    const marketingData = { campaign: "value" } as any;

    act(() => {
      useGroupStore.getState().setMarketingData(id, marketingData);
    });

    const result = useGroupStore.getState().getMarketingData(id);
    expect(result).toEqual(marketingData);
  });

  it("sets and retrieves reporting data", () => {
    const id = "group5";
    const reportingData = { report: "value" } as any;

    act(() => {
      useGroupStore.getState().setReportingData(id, reportingData);
    });

    const result = useGroupStore.getState().getReportingData(id);
    expect(result).toEqual(reportingData);
  });

  it("sets and retrieves products data", () => {
    const id = "group6";
    const productsData = { product: "value" } as any;

    act(() => {
      useGroupStore.getState().setProductsData(id, productsData);
    });

    const result = useGroupStore.getState().getProductsData(id);
    expect(result).toEqual(productsData);
  });

  it("returns undefined for non-existent general settings", () => {
    const result = useGroupStore
      .getState()
      .getGeneralSettings("non-existent-id");
    expect(result).toBeUndefined();
  });

  it("returns undefined for non-existent billing data", () => {
    const result = useGroupStore.getState().getBillingData("non-existent-id");
    expect(result).toBeUndefined();
  });

  it("returns undefined for non-existent eligibility data", () => {
    const result = useGroupStore
      .getState()
      .getEligibilityData("non-existent-id");
    expect(result).toBeUndefined();
  });

  it("returns undefined for non-existent marketing data", () => {
    const result = useGroupStore.getState().getMarketingData("non-existent-id");
    expect(result).toBeUndefined();
  });

  it("returns undefined for non-existent reporting data", () => {
    const result = useGroupStore.getState().getReportingData("non-existent-id");
    expect(result).toBeUndefined();
  });

  it("returns undefined for non-existent products data", () => {
    const result = useGroupStore.getState().getProductsData("non-existent-id");
    expect(result).toBeUndefined();
  });

  it("sets and retrieves product detail data", () => {
    const id = "group7";
    const productDetailData = [
      { productId: "p1", details: "value1" },
      { productId: "p2", details: "value2" },
    ] as any;

    act(() => {
      useGroupStore.getState().setProductDetailData(id, productDetailData);
    });

    const result = useGroupStore.getState().getProductDetailData(id);
    expect(result).toEqual(productDetailData);
  });

  it("sets and retrieves product bundle detail data", () => {
    const id = "group8";
    const productBundleDetailData = [
      { bundleId: "b1", products: ["p1", "p2"] },
      { bundleId: "b2", products: ["p3", "p4"] },
    ] as any;

    act(() => {
      useGroupStore
        .getState()
        .setProductBundleDetailData(id, productBundleDetailData);
    });

    const result = useGroupStore.getState().getProductBundleDetailData(id);
    expect(result).toEqual(productBundleDetailData);
  });

  it("returns undefined for non-existent product detail data", () => {
    const result = useGroupStore
      .getState()
      .getProductDetailData("non-existent-id");
    expect(result).toBeUndefined();
  });

  it("returns undefined for non-existent product bundle detail data", () => {
    const result = useGroupStore
      .getState()
      .getProductBundleDetailData("non-existent-id");
    expect(result).toBeUndefined();
  });

  it("overwrites existing product detail data with new data", () => {
    const id = "group9";
    const oldData = [{ productId: "old1" }] as any;
    const newData = [{ productId: "new1" }, { productId: "new2" }] as any;

    act(() => {
      useGroupStore.getState().setProductDetailData(id, oldData);
    });

    expect(useGroupStore.getState().getProductDetailData(id)).toEqual(oldData);

    act(() => {
      useGroupStore.getState().setProductDetailData(id, newData);
    });

    expect(useGroupStore.getState().getProductDetailData(id)).toEqual(newData);
  });

  it("overwrites existing product bundle detail data with new data", () => {
    const id = "group10";
    const oldData = [{ bundleId: "old1" }] as any;
    const newData = [{ bundleId: "new1" }, { bundleId: "new2" }] as any;

    act(() => {
      useGroupStore.getState().setProductBundleDetailData(id, oldData);
    });

    expect(useGroupStore.getState().getProductBundleDetailData(id)).toEqual(
      oldData,
    );

    act(() => {
      useGroupStore.getState().setProductBundleDetailData(id, newData);
    });

    expect(useGroupStore.getState().getProductBundleDetailData(id)).toEqual(
      newData,
    );
  });

  it("handles empty arrays for product detail data", () => {
    const id = "group11";
    const emptyData: any[] = [];

    act(() => {
      useGroupStore.getState().setProductDetailData(id, emptyData);
    });

    const result = useGroupStore.getState().getProductDetailData(id);
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it("handles empty arrays for product bundle detail data", () => {
    const id = "group12";
    const emptyData: any[] = [];

    act(() => {
      useGroupStore.getState().setProductBundleDetailData(id, emptyData);
    });

    const result = useGroupStore.getState().getProductBundleDetailData(id);
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it("maintains separate product detail data for different ids", () => {
    const id1 = "group13";
    const id2 = "group14";
    const data1 = [{ productId: "p1" }] as any;
    const data2 = [{ productId: "p2" }] as any;

    act(() => {
      useGroupStore.getState().setProductDetailData(id1, data1);
      useGroupStore.getState().setProductDetailData(id2, data2);
    });

    expect(useGroupStore.getState().getProductDetailData(id1)).toEqual(data1);
    expect(useGroupStore.getState().getProductDetailData(id2)).toEqual(data2);
  });

  it("maintains separate product bundle detail data for different ids", () => {
    const id1 = "group15";
    const id2 = "group16";
    const data1 = [{ bundleId: "b1" }] as any;
    const data2 = [{ bundleId: "b2" }] as any;

    act(() => {
      useGroupStore.getState().setProductBundleDetailData(id1, data1);
      useGroupStore.getState().setProductBundleDetailData(id2, data2);
    });

    expect(useGroupStore.getState().getProductBundleDetailData(id1)).toEqual(
      data1,
    );
    expect(useGroupStore.getState().getProductBundleDetailData(id2)).toEqual(
      data2,
    );
  });
});
