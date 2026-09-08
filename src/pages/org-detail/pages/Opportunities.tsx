import { CustomCards } from "@/components/Cards/CustomCards";
import { Opportunity } from "@/types/search";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import api from "@/api/apiService";
import {
  API_ENDPOINTS,
  ERROR_MESSAGES,
  NO_OF_RECORDS_PER_PAGE_INDIVIDUAL,
  ToastType,
} from "@/constants";
import { FailSafePage, OppIcon, showCustomToast } from "@ucc/common-ui";
import "@/pages/search-results/SearchResults.scss";
import { Loader } from "@ucc/common-ui";
import OpportunitiesTable from "@/pages/search-results/OpportunitiesTable";
import { ORG_DETAIL_PATH } from "../../../router/routes";
import useOrgStore from "@/store/useOrgStore";
import useConfigStore from "@/store/configStore";

interface OpportunitiesPageData {
  data: {
    opportunities: Opportunity[];
    page: {
      totalResults: number;
    };
  };
}

const OpportunitiesPage = () => {
  const [page, setPage] = useState<number>(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const [apiFailed, setApiFailed] = useState<boolean>(false);

  const onPageChange = (newPage: number) => {
    setPage(newPage);
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("page", String(newPage));
      return newParams;
    });
  };

  const navigate = useNavigate();
  const { id, opportunityId } = useParams<{
    id: string;
    opportunityId?: string;
  }>();
  const prevIdRef = useRef<string | undefined>(id);
  const { getOpportunitiesCache, setOpportunitiesCache } = useOrgStore();
  const totalData = getOpportunitiesCache(id!, page);
  const data = totalData?.opportunities || null;
  const totalRecords = totalData?.totalResults || 0;
  const [loading, setLoading] = useState<boolean>(!data);
  const setOrg = useConfigStore((state) => state.setOrg);
  const setIsOpportunityPage = useConfigStore((state) => state.setIsOpportunityPage);
  const isOpportunityPage = useConfigStore((state) => state.IsOpportunityPage);

  if (prevIdRef.current !== id) {
    prevIdRef.current = id;
    if (page !== 0) {
      setPage(0);
    }
  }

  useEffect(() => {
    if (data) return;
    const fetchOpportunities = async () => {
      setLoading(true);
      try {
        const response: OpportunitiesPageData = await api.get(
          `${API_ENDPOINTS.organization}/${id}${API_ENDPOINTS.opportunities}?page=${page}&limit=${NO_OF_RECORDS_PER_PAGE_INDIVIDUAL}`,
        );
        const responseData = response?.data || response || {};
        const opportunities = responseData?.opportunities || [];
        setOpportunitiesCache(
          id!,
          opportunities,
          page,
          responseData?.page?.totalResults,
        );
      } catch {
        showCustomToast({
          type: ToastType.Error,
          title: "Failed",
          message: ERROR_MESSAGES.SOMETHINGS_WRONG,
        });
        setApiFailed(true);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, [searchParams, page, data, setOpportunitiesCache]);

  useEffect(() => {
    if (isOpportunityPage) {
      setOrg({
        orgName: data?.[0]?.organizationName || "",
        orgId: data?.[0]?.organizationId || "",
      });
    }
    return () => setIsOpportunityPage(false);
  }, [data, searchParams]);

  if (loading) return <Loader text="Loading..." />;
  if (!data || data.length === 0) {
    return <FailSafePage cardType={`${apiFailed ? "dataFailed" : "noData"}`} />;
  }

  const handleModalClose = () => {
    navigate(`${ORG_DETAIL_PATH}/${id}/opportunities`, { replace: true });
  };

  return (
    <CustomCards
      title={`Opportunities: ${totalRecords} results`}
      icon={<OppIcon />}
    >
      <OpportunitiesTable
        opportunities={data}
        pageSize={NO_OF_RECORDS_PER_PAGE_INDIVIDUAL}
        showPagination={true}
        totalRecords={totalRecords}
        page={page}
        onPageChange={onPageChange}
        searchPage={false}
        oppIdToOpen={opportunityId}
        onModalClose={handleModalClose}
      />
    </CustomCards>
  );
};

export default OpportunitiesPage;
