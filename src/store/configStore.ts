import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Org {
  orgName?: string;
  orgId?: string;
  orgUUID?: string;
  updatedAt?: string;   // belongs only to Org
  groupShortId?: string;
  IsOpportunityPage?: boolean;
}

interface OrgState {
  org: Org;
  groupName: string;
  groupId?: string;
  groupShortId: string | null;
  updatedAt: string | null;        // global/org-level updatedAt
  groupUpdatedAt?: string;         // ✅ separate for group
  searchParams: string | undefined;
  breadCrumbVisible: boolean;
  IsOpportunityPage: boolean;

  setBreadCrumbVisible: (visible: boolean) => void;
  setOrg: (org: Partial<Org>) => void;
  setGroupName: (name: string) => void;
  setGroupId: (id: string) => void;
  setGroupShortId: (id: string | null) => void;
  setUpdatedAt: (date: string | null) => void;
  setGroupUpdatedAt: (date: string) => void;
  setSearchParams: (params: string) => void;
  setIsOpportunityPage: (isOppPage: boolean) => void;
}

const useConfigStore = create<OrgState>()(
  persist(
    (set) => ({
      org: { orgName: "", orgId: "", orgUUID: "" },
      groupName: "",
      groupId: "",
      groupShortId: null,
      groupUpdatedAt: "",
      searchParams: "",
      breadCrumbVisible: true,
      updatedAt: null,
      IsOpportunityPage: false,

      setBreadCrumbVisible: (visible: boolean) =>
        set({ breadCrumbVisible: visible }),

      setOrg: (orgUpdate: Partial<Org>) =>
        set((state) => ({
          org: { ...state.org, ...orgUpdate },
        })),

      setGroupName: (name: string) => set({ groupName: name }),
      setGroupId: (id: string) => set({ groupId: id }),
      setGroupShortId: (id) => set({ groupShortId: id }),
      setGroupUpdatedAt: (date: string) => set({ groupUpdatedAt: date }),
      setUpdatedAt: (date) => set({ updatedAt: date }),
      setSearchParams: (params: string) => set({ searchParams: params }),
      setIsOpportunityPage: (isOppPage: boolean) => set({ IsOpportunityPage: isOppPage }),
    }),
    {
      name: "org-store",
      partialize: (state) => ({
        org: state.org,
        groupName: state.groupName,
        groupId: state.groupId,
        groupShortId: state.groupShortId,
        groupUpdatedAt: state.groupUpdatedAt,
        searchParams: state.searchParams,
        breadCrumbVisible: state.breadCrumbVisible,
        IsOpportunityPage: state.IsOpportunityPage,
      }),
    },
  ),
);

export default useConfigStore;
