import { OrgData } from "@/types/Hierarchy";
import {
  Billing,
  Eligibility,
  GeneralSettings,
  Marketing,
  Reporting,
} from "@/types/OrgView";
import { Opportunity } from "@/types/search";
import { create } from "zustand";

interface Org {
  reportingCahce: Record<string, Reporting>;
  generalSettingCache: Record<string, GeneralSettings | null>;
  billingCache: Record<string, Billing>;
  eligibilityCache: Record<string, Eligibility>;
  markeingCache: Record<string, Marketing>;
  opportunitiesCache: Record<
    string,
    {
      totalResults: number;
      pages: Record<number, Opportunity[]>;
    }
  >;

  hierarchyCache: Record<string, OrgData>;
  setHierarchyCache: (id: string, data: OrgData) => void;
  setOpportunitiesCache: (id: string, data: Opportunity[], page: number, totalResults: number) => void;
  setMarketingData: (id: string, data: Marketing) => void;
  setEligibilityData: (id: string, data: Eligibility) => void;
  setBillingData: (id: string, data: Billing) => void;
  setGeneralSettings: (id: string, data: GeneralSettings | null) => void;
  setReportingData: (id: string, data: Reporting) => void;
  getGeneralSettings: (id: string) => GeneralSettings | null;
  getBillingData: (id: string) => Billing | undefined;
  getEligibilityData: (id: string) => Eligibility | undefined;
  getReportingData: (id: string) => Reporting | undefined;
  getMarketingData: (id: string) => Marketing | undefined;
  getOpportunitiesCache: (id: string, page: number) => { opportunities: Opportunity[] | undefined, totalResults: number };
  getOpportunitiesPageTotal: (id: string) => number;
  getHierarchyCache: (id: string) => OrgData | undefined;
}

const useOrgStore = create<Org>((set, get) => ({
  reportingCahce: {},
  generalSettingCache: {},

  billingCache: {},
  eligibilityCache: {},
  markeingCache: {},
  opportunitiesCache: {},
  hierarchyCache: {},
  setGeneralSettings(id: string, data: GeneralSettings | null) {
    set((state) => ({
      generalSettingCache: {
        ...state.generalSettingCache,
        [id]: data,
      },
    }));
  },
  setBillingData: (id: string, data: Billing) => {
    set((state) => ({
      billingCache: {
        ...state.billingCache,
        [id]: data,
      },
    }));
  },
  setMarketingData: (id: string, data: Marketing) => {
    set((state) => ({
      markeingCache: {
        ...state.markeingCache,
        [id]: data,
      },
    }));
  },
  setEligibilityData: (id: string, data: Eligibility) => {
    set((state) => ({
      eligibilityCache: {
        ...state.eligibilityCache,
        [id]: data,
      },
    }));
  },
  setOpportunitiesCache: (id: string, data: Opportunity[], page: number, totalResults: number) => {
    set((state) => ({
      opportunitiesCache: {
        ...state.opportunitiesCache,
        [id]: {
          totalResults,
          pages: {
            ...(state.opportunitiesCache[id]?.pages || {}),
            [page]: data,
          },
        },
      },
    }));
  },

  setHierarchyCache: (id: string, data: OrgData) => {
    set((state) => ({
      hierarchyCache: {
        ...state.hierarchyCache,
        [id]: data,
      },
    }));
  },
  setReportingData: (id: string, data: Reporting) => {
    set((state) => ({
      reportingCahce: {
        ...state.reportingCahce,
        [id]: data,
      },
    }));
  },
  getReportingData: (id: string) => {
    return get().reportingCahce[id];
  },
  getGeneralSettings: (id: string) => {
    return get().generalSettingCache?.[id];
  },
  getBillingData: (id: string) => {
    return get().billingCache[id];
  },
  getEligibilityData: (id: string) => {
    return get().eligibilityCache[id];
  },
  getMarketingData: (id: string) => {
    return get().markeingCache[id];
  },
  getOpportunitiesCache: (id: string, page: number) => {
    return {
      opportunities: get().opportunitiesCache[id]?.pages?.[page] || null,
      totalResults: get().opportunitiesCache[id]?.totalResults || 0,
    };
  },
  getOpportunitiesPageTotal: (id: string) => {
    return get().opportunitiesCache[id]?.totalResults || 0;
  },
  getHierarchyCache: (id: string) => {
    return get().hierarchyCache[id];
  },
}));

export default useOrgStore;
