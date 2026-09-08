import React, { useEffect, useState } from "react";
import "./EditOppurtunities.scss";
import {
  extractDisplayValue,
  FailSafePage,
  Loader,
  showCustomToast,
  SideModal,
} from "@ucc/common-ui";
import { API_ENDPOINTS, ERROR_MESSAGES, ToastType } from "@/constants";
import api from "@/api/apiService";
import { useParams } from "react-router-dom";
import { getSafeString } from "@/utils";
import { OpportunityDetail, OpportunityDetails } from "@/types/search";
import OpportunityDrawer from "@/components/sidebar/OpportunityDrawer";
import { tabData } from "@/pages/search-results/OpportunitiesTable";

interface Opportunity {
  id: string;
  opportunityName: string;
  opportunityGuid: string;
  revenueEffectiveDate: string;
  type: string;
  contractNumber: string;
  closeDate: string;
}

interface OpportunityResponse {
  opportunities: Opportunity[];
}

const OppCard: React.FC<{
  data: Opportunity;
  onClick: () => void;
}> = ({ data, onClick }) => {
  return (
    <div
      className="opp-card d-flex flex-column p-4 gap-2"
      onClick={onClick}
      style={{ cursor: "pointer" }}
    >
      <div className="d-flex flex-column">
        <span className="opp-name">{data?.opportunityName}</span>
        <span className="opp-id">{data?.opportunityGuid}</span>
      </div>
      <div>
        <div className="d-flex info-row mt-2">
          <span className="info-label">GCRM contract number</span>
          <span className="info-value">
            {getSafeString(data?.contractNumber)}
          </span>
        </div>
        <div className="d-flex info-row mt-2">
          <span className="info-label">Effective start date</span>
          <span className="info-value">
            {extractDisplayValue(data?.revenueEffectiveDate, "date").jsx}
          </span>
        </div>
        <div className="d-flex info-row mt-2">
          <span className="info-label">Effective end date</span>
          <span className="info-value">
            {extractDisplayValue(data?.closeDate, "date").jsx}
          </span>
        </div>
        <div className="d-flex info-row mt-2">
          <span className="info-label">Type</span>
          <span className="info-value">{getSafeString(data?.type)}</span>
        </div>
      </div>
    </div>
  );
};

const EditOppurtunities: React.FC = () => {
  const taskURL = import.meta.env.VITE_TASK_URL;
  const [loading, _setLoading] = useState(false);
  const { candidateId } = useParams<{ candidateId: string }>();
  const [opp, setOpp] = useState<Opportunity[] | null>(null);
  const [showId, setShowId] = useState<string | null>(null);
  const [modalData, setModalData] = useState<OpportunityDetail | null>(null);

  const fetchOpportunityDetails = async (guid: string) => {
    try {
      const response = await api.get<OpportunityDetails>(
        `${API_ENDPOINTS.opportunity}/${guid}`,
      );
      setModalData(response?.data || response);
    } catch {
      showCustomToast({
        type: ToastType.Error,
        title: "Failed",
        message: ERROR_MESSAGES.SOMETHINGS_WRONG,
      });
    }
  };

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        _setLoading(true);
        const response: OpportunityResponse = await api.get(
          `${taskURL}client-configurations/tasks/${candidateId}/opportunities`,
        );
        setOpp(response.opportunities);
      } catch {
        showCustomToast({
          type: ToastType.Error,
          title: "Failed to fetch opportunities",
          message: "Something went wrong while fetching opportunities.",
        });
      } finally {
        _setLoading(false);
      }
    };
    if (opp?.length === 0 || opp === null) {
      fetchOpportunities();
    }
  }, [candidateId]);

  if (loading) {
    return <Loader text="Loading..." />;
  }

  return (
    <div className="edit-opportunities-container">
      <div className="edit-opportunities-main">
        <div className="opp-list">
          {opp && opp.length > 0 ? (
            opp.map((opportunity: Opportunity) => {
              return (
                <OppCard
                  key={opportunity.id}
                  data={opportunity}
                  onClick={() => {
                    setShowId(opportunity.opportunityGuid);
                    fetchOpportunityDetails(opportunity.id);
                  }}
                />
              );
            })
          ) : (
            <FailSafePage cardType="noData" />
          )}
        </div>
      </div>
      <SideModal
        show={!!modalData && showId !== null}
        title={modalData?.name ?? ""}
        onHide={() => {
          setShowId(null);
          setModalData(null);
        }}
      >
        <OpportunityDrawer tabs={tabData} data={modalData} />
      </SideModal>
    </div>
  );
};

export default EditOppurtunities;
