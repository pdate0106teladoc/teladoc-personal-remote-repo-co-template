import { create } from "zustand";
import {
  Billing,
  EligibilityAndClaims,
  GeneralSetting,
  Marketing,
  GroupProductResponse,
  ProductDetailResponse,
  ProductBundleResponse,
} from "@/types/GrpView";
import { Reporting } from "@/types/OrgView";

interface Group {
  generalSettingsCache: Record<string, GeneralSetting>;
  billingCache: Record<string, Billing>;
  eligibilityCache: Record<string, EligibilityAndClaims>;
  marketingCache: Record<string, Marketing>;
  reportingCache: Record<string, Reporting>;
  productsCache: Record<string, GroupProductResponse>;
  productDetailCache: Record<string, ProductDetailResponse[]>;
  productBundleDetailCache: Record<string, ProductBundleResponse[]>;

  setGeneralSettings: (id: string, data: GeneralSetting) => void;
  setBillingData: (id: string, data: Billing) => void;
  setEligibilityData: (id: string, data: EligibilityAndClaims) => void;
  setMarketingData: (id: string, data: Marketing) => void;
  setReportingData: (id: string, data: Reporting) => void;
  setProductsData: (id: string, data: GroupProductResponse) => void;
  setProductDetailData: (id: string, data: ProductDetailResponse[]) => void;
  setProductBundleDetailData: (
    id: string,
    data: ProductBundleResponse[],
  ) => void;

  getGeneralSettings: (id: string) => GeneralSetting | undefined;
  getBillingData: (id: string) => Billing | undefined;
  getEligibilityData: (id: string) => EligibilityAndClaims | undefined;
  getMarketingData: (id: string) => Marketing | undefined;
  getReportingData: (id: string) => Reporting | undefined;
  getProductsData: (id: string) => GroupProductResponse | undefined;
  getProductDetailData: (id: string) => ProductDetailResponse[] | undefined;
  getProductBundleDetailData: (
    id: string,
  ) => ProductBundleResponse[] | undefined;
}

const useGroupStore = create<Group>((set, get) => ({
  generalSettingsCache: {},
  billingCache: {},
  eligibilityCache: {},
  marketingCache: {},
  reportingCache: {},
  productsCache: {},
  productDetailCache: {},
  productBundleDetailCache: {},

  setGeneralSettings(id: string, data: GeneralSetting) {
    set((state) => ({
      generalSettingsCache: {
        ...state.generalSettingsCache,
        [id]: data,
      },
    }));
  },

  setBillingData(id: string, data: Billing) {
    set((state) => ({
      billingCache: {
        ...state.billingCache,
        [id]: data,
      },
    }));
  },

  setEligibilityData(id: string, data: EligibilityAndClaims) {
    set((state) => ({
      eligibilityCache: {
        ...state.eligibilityCache,
        [id]: data,
      },
    }));
  },

  setMarketingData(id: string, data: Marketing) {
    set((state) => ({
      marketingCache: {
        ...state.marketingCache,
        [id]: data,
      },
    }));
  },

  setReportingData(id: string, data: Reporting) {
    set((state) => ({
      reportingCache: {
        ...state.reportingCache,
        [id]: data,
      },
    }));
  },

  setProductsData(id: string, data: GroupProductResponse) {
    set((state) => ({
      productsCache: {
        ...state.productsCache,
        [id]: data,
      },
    }));
  },

  setProductDetailData(id: string, data: ProductDetailResponse[]) {
    set((state) => ({
      productDetailCache: {
        ...state.productDetailCache,
        [id]: data,
      },
    }));
  },

  setProductBundleDetailData(id: string, data: ProductBundleResponse[]) {
    set((state) => ({
      productBundleDetailCache: {
        ...state.productBundleDetailCache,
        [id]: data,
      },
    }));
  },

  getGeneralSettings(id: string) {
    return get().generalSettingsCache[id];
  },

  getBillingData(id: string) {
    return get().billingCache[id];
  },

  getEligibilityData(id: string) {
    return get().eligibilityCache[id];
  },

  getMarketingData(id: string) {
    return get().marketingCache[id];
  },

  getReportingData(id: string) {
    return get().reportingCache[id];
  },

  getProductsData(id: string) {
    return get().productsCache[id];
  },
  getProductDetailData(id: string) {
    return get().productDetailCache[id];
  },
  getProductBundleDetailData(id: string) {
    return get().productBundleDetailCache[id];
  },
}));

export default useGroupStore;
