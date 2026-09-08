import api from "@/api/apiService";
import { CustomCards } from "@/components/Cards/CustomCards";
import { OrgTree } from "@/components/HierarchyTree/OrgTree";
import { FailSafePage, showCustomToast, Loader } from "@ucc/common-ui";
import { API_ENDPOINTS, ERROR_MESSAGES, ToastType } from "@/constants";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useOrgStore from "@/store/useOrgStore";
import { OrgData } from "@/types/Hierarchy";

interface HierarchyPageData {
  data: OrgData[];
}

const HierarchyPage = () => {
  const { id } = useParams<{ id: string }>();
  const { getHierarchyCache, setHierarchyCache } = useOrgStore();
  const [apiFailed, setApiFailed] = useState<boolean>(false);
  const data = getHierarchyCache(id!);
  const [loading, setLoading] = useState<boolean>(!data);

  useEffect(() => {
    if (data) return;

    const fetchHierarchy = async () => {
      setLoading(true);
      try {
        const response: HierarchyPageData = await api.get(
          `${API_ENDPOINTS.organization}/${id}${API_ENDPOINTS.hierarchy}`
        );
        const responseData = response?.data || response || [];
        const firstItem = responseData[0];
        setHierarchyCache(id!, firstItem);
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

    fetchHierarchy();
  }, [id, data, setHierarchyCache]);

  if (loading) return <Loader text="Loading..." />;
  if (!data) {
    return <FailSafePage cardType={`${apiFailed ? "dataFailed" : "noData"}`} />;
  }

  return (
    <CustomCards title="" className="card-container-hierarchy">
      <OrgTree data={data} currentOrgId={id} />
    </CustomCards>
  );
};

export default HierarchyPage;
