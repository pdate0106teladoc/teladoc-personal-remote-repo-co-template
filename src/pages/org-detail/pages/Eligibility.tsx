import { AgrMapping, EgrMapping } from "@/types/OrgView";
import { Tab, Tabs } from "react-bootstrap";
import { CustomCards } from "@/components/Cards/CustomCards";
import { CustomTable, FailSafePage, Loader, showCustomToast, SideModal } from "@ucc/common-ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import api from "@/api/apiService";
import {
  API_ENDPOINTS,
  NO_OF_RECORDS_PER_PAGE_INDIVIDUAL,
  ToastType,
  ERROR_MESSAGES,
} from "@/constants";
import { PaginationInfo } from "@/types/OrgView";
import {
  createEgrSideBarColumn,
  createEgrColumn,
  createAgrColumn,
  createAgrSideBarColumn,
} from "./eligibilityColumns";
import { buildChangedPayload, downloadFile, extractFormData } from "@/utils";
import useOrgStore from "@/store/useOrgStore";
import useConfigStore from "@/store/configStore";
import { useEditMode } from "@/hooks/useEditMode";
import useEditStore from "@/store/editStore";
import RenderAllSections from "@/components/RenderAllSection/RenderAllSection";
import { renderEligibilityOverview } from "@/data/organization/eligibility";
import ContactDetails from "@/components/sidebar/ContactDetailsSidebar";
import type { ContactRef } from "@/types";

interface AllowedGroupRelationResponse {
  data: {
    agr: AgrMapping[];
    page: PaginationInfo;
  };
}

interface ExternalGroupRelationResponse {
  data: {
    egr: EgrMapping[];
    page: PaginationInfo;
  };
}

interface OutletContext {
  handleSaveChanges: (
    pageName: string,
    changedPayload: Record<string, any>,
  ) => void;
  orgMetadata: Record<string, any> | null;
}

const Eligibility = () => {
  const { id, candidateId } = useParams<{ id: string; candidateId?: string }>();
  const navigate = useNavigate();
  const { getEligibilityData } = useOrgStore();
  const data = id ? getEligibilityData(id) : undefined;
  const [entityLoading] = useState<boolean>(data === undefined);
  const setOrg = useConfigStore((state) => state.setOrg);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"overview" | "egr" | "agr">("overview");
  const [egrTableData, setEgrTableData] = useState<EgrMapping[]>();
  const [agrTableData, setAgrTableData] = useState<AgrMapping[]>();
  const [egrPage, setEgrPage] = useState<number>(0);
  const [agrPage, setAgrPage] = useState<number>(0);
  const [egrTotalRecords, setEgrTotalRecords] = useState<number>(0);
  const [agrTotalRecords, setAgrTotalRecords] = useState<number>(0);
  const [egrFilters, setEgrFilters] = useState<Record<string, string | string[]>>({});
  const [agrFilters, setAgrFilters] = useState<Record<string, string | string[]>>({});

  const [agrSortOrder, setAgrSortOrder] = useState<string>("asc");
  const [agrSortBy, setAgrSortBy] = useState<string>("");

  const [egrSortOrder, setEgrSortOrder] = useState<string>("asc");
  const [egrSortBy, setEgrSortBy] = useState<string>("");

  const egrColumn = useMemo(() => createEgrColumn(navigate), [navigate]);
  const agrColumn = useMemo(() => createAgrColumn(navigate), [navigate]);
  const agrSideBarColumn = useMemo(() => createAgrSideBarColumn(navigate), [navigate]);
  const egrSideBarColumn = useMemo(() => createEgrSideBarColumn(navigate), [navigate]);

  // AGR/EGR History modal state
  const [egrHistoryBtnClicked, setEgrHistoryBtnClicked] =
    useState<boolean>(false);
  const [agrHistoryBtnClicked, setAgrHistoryBtnClicked] =
    useState<boolean>(false);

  const [egrHistoryData, setEgrHistoryData] = useState<EgrMapping[] | []>([]);
  const [agrHistoryData, setAgrHistoryData] = useState<AgrMapping[] | []>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);

  const [egrHistoryPage, setEgrHistoryPage] = useState<number>(0);
  const [agrHistoryPage, setAgrHistoryPage] = useState<number>(0);

  const [egrTotalHistoryRecords, setEgrTotalHistoryRecords] = useState<number>(0);
  const [agrTotalHistoryRecords, setAgrTotalHistoryRecords] = useState<number>(0);

  const { handleSaveChanges, orgMetadata } = useOutletContext<OutletContext>();
  const mode = candidateId ? "edit" : "view";
  const isInitializing = useRef(true);
  const lastSavedAt = useEditStore((state) => state.lastSavedAt);

  const {
    metadata,
    formData,
    originalData,
    errors,
    updateField,
    updateLiveEntityField,
    setMetadata,
    setFormData,
    setOriginalData,
    liveEntityData,
  } = useEditMode();

  const [contactDrawer, setContactDrawer] = useState<{
    name: string;
    id: string;
    contactId: string;
  } | null>(null);

  const handleContactClick = useCallback(async (selected: ContactRef) => {
    if (!selected.contactId || !selected.id) return;
    setContactDrawer({
      name: selected.displayName ?? "",
      id: selected.id,
      contactId: selected.contactId,
    });
  }, []);

  const prefixedUpdateField = (fieldKey: string, value: any) => {
    updateField(fieldKey, value);
    updateLiveEntityField(`organizationEligibility.${fieldKey}`, value);
  };

  useEffect(() => {
    if (!lastSavedAt || isInitializing.current) return;
    setOriginalData(formData);
  }, [lastSavedAt, formData, setOriginalData]);

  useEffect(() => {
    if (isInitializing.current) {
      return;
    }

    if (
      mode === "edit" &&
      Object.keys(formData).length > 0 &&
      Object.keys(originalData).length > 0
    ) {
      const changedPayload = buildChangedPayload(formData, originalData);

      if (Object.keys(changedPayload).length > 0) {
        handleSaveChanges("organizationEligibility", changedPayload);
      }
    }
  }, [formData, originalData, mode, handleSaveChanges]);

  useEffect(() => {
    if (mode === "edit" && data !== undefined && orgMetadata) {
      isInitializing.current = true;

      setTimeout(() => {
        const metadataResponse = orgMetadata.organizationEligibility ?? null;
        setMetadata(metadataResponse);
        const initialFormData = metadataResponse
          ? extractFormData(metadataResponse)
          : {};
        setFormData(initialFormData);
        setOriginalData(initialFormData);

        setTimeout(() => {
          isInitializing.current = false;
        }, 100);
      }, 500);
    }

    return () => {
      isInitializing.current = true;
    };
  }, [mode, data, orgMetadata, setMetadata, setFormData, setOriginalData]);

  useEffect(() => {
    setOrg({
      updatedAt: data?.updatedAt || "",
    });
  }, [data, id, setOrg]);

  const buildFilterQuery = (filters: Record<string, string | string[]>) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => { if (v) params.append(key, v); });
      } else if (value) {
        params.append(key, value);
      }
    });
    return params.toString();
  };

  const fetchAllowedGroupRelations = useCallback(
    async (page: number, filters: Record<string, string | string[]> = {}) => {
      setTableLoading(true);
      try {
        const sortQuery =
          agrSortBy.length > 0
            ? `&sortBy=${agrSortBy}&sortDir=${agrSortOrder}`
            : "";

        const filterQuery = buildFilterQuery(filters);
        const filterPart = filterQuery ? `&${filterQuery}` : "";

        const response: AllowedGroupRelationResponse = await api.get(
          `${API_ENDPOINTS.organization}/${id}${API_ENDPOINTS.agr}?page=${page}&limit=${NO_OF_RECORDS_PER_PAGE_INDIVIDUAL}${sortQuery}${filterPart}`,
        );

        const agrData = response?.data || response || {};
        setAgrTableData(agrData.agr || []);
        setAgrTotalRecords(agrData.page?.totalResults || 0);
      } catch {
        showCustomToast({
          type: ToastType.Error,
          title: "Failed to fetch Allowed Group Relations",
          message: ERROR_MESSAGES.SOMETHINGS_WRONG,
        });
      } finally {
        setTableLoading(false);
      }
    },
    [id, agrSortBy, agrSortOrder],
  );

  const fetchExternalGroupRelation = useCallback(
    async (page: number, filters: Record<string, string | string[]> = {}) => {
      setTableLoading(true);
      try {
        const sortQuery =
          egrSortBy.length > 0
            ? `&sortBy=${egrSortBy}&sortDir=${egrSortOrder}`
            : "";

        const filterQuery = buildFilterQuery(filters);
        const filterPart = filterQuery ? `&${filterQuery}` : "";

        const response: ExternalGroupRelationResponse = await api.get(
          `${API_ENDPOINTS.organization}/${id}${API_ENDPOINTS.egr}?page=${page}&limit=${NO_OF_RECORDS_PER_PAGE_INDIVIDUAL}${sortQuery}${filterPart}`,
        );

        const egrData = response?.data || response || {};
        setEgrTableData(egrData.egr || []);
        setEgrTotalRecords(egrData.page?.totalResults || 0);
      } catch {
        showCustomToast({
          type: ToastType.Error,
          title: "Failed to fetch External Group Relations",
          message: ERROR_MESSAGES.SOMETHINGS_WRONG,
        });
      } finally {
        setTableLoading(false);
      }
    },
    [id, egrSortBy, egrSortOrder],
  );

  // fetch EGR when its page / filters / sort-related callback changes
  useEffect(() => {
    fetchExternalGroupRelation(egrPage, egrFilters);
  }, [fetchExternalGroupRelation, egrPage, egrFilters]);

  // fetch AGR when its page / filters / sort-related callback changes
  useEffect(() => {
    fetchAllowedGroupRelations(agrPage, agrFilters);
  }, [fetchAllowedGroupRelations, agrPage, agrFilters]);
  // Apply sorting
  const handleSortChange = (
    sortBy: string | null,
    sortOrder: boolean,
    type?: "egr" | "agr",
  ) => {
    if (type === "egr") {
      setEgrSortBy(sortBy || "");
      setEgrSortOrder(sortOrder ? "asc" : "desc");
      setEgrPage(0);
      setActiveTab("egr");
    } else {
      setAgrSortBy(sortBy || "");
      setAgrSortOrder(sortOrder ? "asc" : "desc");
      setAgrPage(0);
      setActiveTab("agr");
    }
  };

  // Page change handlers
  const handleEgrPageChange = useCallback(
    (newPage: number) => {
      setEgrPage(newPage);
    },
    [fetchExternalGroupRelation, egrFilters],
  );

  const handleAgrPageChange = useCallback(
    (newPage: number) => {
      setAgrPage(newPage);
    },
    [fetchAllowedGroupRelations, agrFilters],
  );

  // fetch history data for modal
  const fetchHistoryPage = useCallback(
    async (page: number, type: string, modal: "egr" | "agr") => {
      if (!id) return;
      setHistoryLoading(true);
      try {
        const url = `${API_ENDPOINTS.organization}/${id}/${type}/history?page=${page}&limit=${NO_OF_RECORDS_PER_PAGE_INDIVIDUAL}`;
        const res: any = await api.get(url);
        const payload = res?.data ?? (res || {});
        if (modal === "egr") {
          const data = Array.isArray(payload.egr) ? payload.egr : Array.isArray(payload) ? payload : [];
          setEgrHistoryData(data);
          setEgrTotalHistoryRecords(payload.page?.totalResults || 0);
        } else {
          const data = Array.isArray(payload.agr) ? payload.agr : Array.isArray(payload) ? payload : [];
          setAgrHistoryData(data);
          setAgrTotalHistoryRecords(payload.page?.totalResults || 0);
        }
      } catch {
        showCustomToast({
          type: ToastType.Error,
          title: "Failed",
          message: ERROR_MESSAGES.SOMETHINGS_WRONG,
        });
      } finally {
        setHistoryLoading(false);
      }
    },
    [id],
  );

  // modal table page-change handlers that reuse fetchHistoryPage
  const handleEgrHistoryPageChange = useCallback(
    (newPage: number) => {
      setEgrHistoryPage(newPage);
      fetchHistoryPage(newPage, "external-group-relations", "egr");
    },
    [fetchHistoryPage],
  );

  const handleAgrHistoryPageChange = useCallback(
    (newPage: number) => {
      setAgrHistoryPage(newPage);
      fetchHistoryPage(newPage, "allowed-group-relations", "agr");
    },
    [fetchHistoryPage],
  );

  const downloadCSV = async (type: string, history: boolean) => {
    if (!id) return;
    try {
      // determine if AGR or EGR and pick current sort/filter state
      const isAgr = type.includes("allowed");
      const sortBy = isAgr ? agrSortBy : egrSortBy;
      const sortDir = isAgr ? agrSortOrder : egrSortOrder;
      const filters = isAgr ? agrFilters : egrFilters;

      const params = new URLSearchParams();
      if (sortBy) params.append("sortBy", sortBy);
      if (sortDir) params.append("sortDir", sortDir);
      Object.entries(filters || {}).forEach(([k, v]) => {
        if (Array.isArray(v)) {
          v.forEach((val) => { if (val !== undefined && val !== null && String(val).trim() !== "") params.append(k, val); });
        } else if (v !== undefined && v !== null && String(v).trim() !== "") {
          params.append(k, v);
        }
      });

      // use same base path as fetchers (org + egr/agr)
      const base = isAgr
        ? `${API_ENDPOINTS.organization}/${id}${API_ENDPOINTS.agr}`
        : `${API_ENDPOINTS.organization}/${id}${API_ENDPOINTS.egr}`;

      const url = `${base}${history ? "/history" : ""}/export?${params.toString()}`;

      const res: any = await api.get(url);
      const { content, filename } = res?.data || res || {};
      const decodedContent = atob(content);
      downloadFile(filename, decodedContent);
    } catch (error) {
      showCustomToast({
        type: ToastType.Error,
        title: "Failed",
        message: ERROR_MESSAGES.SOMETHINGS_WRONG,
      });
    }
  };

  const sourceData =
    mode === "edit" &&
    liveEntityData?.organizationEligibility &&
    Object.keys(liveEntityData.organizationEligibility).length > 0
      ? liveEntityData.organizationEligibility
      : data;

  const eligibilityOverviewData = renderEligibilityOverview(
    sourceData ?? {},
    mode === "edit" ? metadata : undefined,
    handleContactClick,
  );

  return (
    <div className="sticky-tabs">
      {tableLoading && (activeTab === "egr" || activeTab === "agr") && (
        <div className="eligibility-loader-overlay" aria-hidden>
          <Loader text="Loading..." />
        </div>
      )}
      <Tabs
        id="uncontrolled-tab-example"
        className={mode === "edit" ? "edit-mode" : ""}
        activeKey={activeTab}
        onSelect={(k) =>
          setActiveTab((k as "overview" | "egr" | "agr") || "overview")
        }
      >
        <Tab eventKey="overview" title="Overview">
          {entityLoading ? (
            <Loader text="Loading..." />
          ) : data === undefined ? (
            <FailSafePage cardType="noData" />
          ) : (
            <RenderAllSections
              data={eligibilityOverviewData}
              mode={mode}
              onFieldChange={prefixedUpdateField}
              formData={formData}
              errors={errors}
            />
          )}
        </Tab>
        <Tab eventKey="egr" title="EGR mapping">
          <CustomCards
            title="External Group Relations mapping (EGRs)"
            btn1="View history"
            btn2="Download CSV"
            className="agr-egr-card"
            onBtn1Click={() => {
              setEgrHistoryPage(0);
              fetchHistoryPage(0, "external-group-relations", "egr");
              setEgrHistoryBtnClicked(true);
            }}
            onBtn2Click={() => downloadCSV("external-group-relations", false)}
            disabledBtn2={(egrTableData?.length ?? 0) === 0}
          >
            <CustomTable
              data={egrTableData || []}
              columns={egrColumn}
              showPagination
              totalRecords={egrTotalRecords}
              page={egrPage}
              rowsPerPage={NO_OF_RECORDS_PER_PAGE_INDIVIDUAL}
              onPageChange={handleEgrPageChange}
              serverSideFiltering
              controlledServerFilters={egrFilters}
              onChangeSortParams={(sortBy, sortOrder) =>
                handleSortChange(sortBy, sortOrder, "egr")
              }
              onServerFilterChange={(filters) => {
                const normalized: Record<string, string[]> = Object.fromEntries(
                  Object.entries(filters).map(([k, v]) => [k, Array.isArray(v) ? v : [v]])
                );
                setEgrFilters(normalized);
                setEgrPage(0);
                fetchExternalGroupRelation(0, normalized);
              }}
            />
          </CustomCards>
        </Tab>
        <Tab eventKey="agr" title="AGR mapping">
          <CustomCards
            title="Allowed Group Relations mapping (AGRs)"
            btn1="View history"
            btn2="Download CSV"
            className="agr-egr-card"
            onBtn1Click={() => {
              setAgrHistoryPage(0);
              fetchHistoryPage(0, "allowed-group-relations", "agr");
              setAgrHistoryBtnClicked(true);
            }}
            onBtn2Click={() => downloadCSV("allowed-group-relations", false)}
            disabledBtn2={(agrTableData?.length ?? 0) === 0}
          >
            <CustomTable
              data={agrTableData || []}
              columns={agrColumn}
              showPagination
              totalRecords={agrTotalRecords}
              page={agrPage}
              rowsPerPage={NO_OF_RECORDS_PER_PAGE_INDIVIDUAL}
              onPageChange={handleAgrPageChange}
              serverSideFiltering
              controlledServerFilters={agrFilters}
              onChangeSortParams={(sortBy, sortOrder) =>
                handleSortChange(sortBy, sortOrder, "agr")
              }
              onServerFilterChange={(filters) => {
                const normalized: Record<string, string[]> = Object.fromEntries(
                  Object.entries(filters).map(([k, v]) => [k, Array.isArray(v) ? v : [v]])
                );
                setAgrFilters(normalized);
                setAgrPage(0);
                fetchAllowedGroupRelations(0, normalized);
              }}
            />
          </CustomCards>
        </Tab>
      </Tabs>
      <SideModal
        title="View history"
        show={egrHistoryBtnClicked}
        onHide={() => setEgrHistoryBtnClicked(false)}
        type="lg"
      >
        <CustomCards
          title="External Group Relations mapping (EGRs)"
          btn2="Download history"
          onBtn2Click={() => downloadCSV("external-group-relations", true)}
          disabledBtn2={(egrHistoryData?.length ?? 0) === 0}
        >
          {historyLoading ? (
            <Loader text="Loading..." />
          ) : (
            <CustomTable
              data={egrHistoryData || []}
              columns={egrSideBarColumn}
              showPagination
              page={egrHistoryPage}
              rowsPerPage={NO_OF_RECORDS_PER_PAGE_INDIVIDUAL}
              onPageChange={handleEgrHistoryPageChange}
              totalRecords={egrTotalHistoryRecords}
              customClassName="scroll-table"
              verticalScrollTable={true}
            />)}
        </CustomCards>
      </SideModal>
      <SideModal
        title="View history"
        show={agrHistoryBtnClicked}
        onHide={() => setAgrHistoryBtnClicked(false)}
        type="lg"
      >
        <CustomCards
          title="Allowed Group Relations mapping (AGRs)"
          btn2="Download history"
          onBtn2Click={() => downloadCSV("allowed-group-relations", true)}
          disabledBtn2={(agrHistoryData?.length ?? 0) === 0}
        >
          {historyLoading ? (
            <Loader text="Loading..." />
          ) : (
            <CustomTable
              data={agrHistoryData || []}
              columns={agrSideBarColumn}
              showPagination
              page={agrHistoryPage}
              rowsPerPage={NO_OF_RECORDS_PER_PAGE_INDIVIDUAL}
              onPageChange={handleAgrHistoryPageChange}
              totalRecords={agrTotalHistoryRecords}
              customClassName="scroll-table"
              verticalScrollTable={true}
            />)}
        </CustomCards>
      </SideModal>
      <SideModal
        title={contactDrawer?.name ?? ""}
        show={contactDrawer !== null}
        onHide={() => setContactDrawer(null)}
      >
        {contactDrawer && (
          <ContactDetails
            tabKey="contactInfo"
            mongoId={contactDrawer.id}
            contactId={contactDrawer.contactId}
          />
        )}
      </SideModal>
    </div>
  );
};

export default Eligibility;
