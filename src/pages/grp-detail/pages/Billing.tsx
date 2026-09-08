import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { useOutletContext, useParams } from "react-router-dom";
import RenderAllSections from "@/components/RenderAllSection/RenderAllSection";
import { renderBillingCCM, renderBillingOverview } from "@/data/group/billing";
import useGroupStore from "@/store/useGroupStore";
import { FailSafePage } from "@ucc/common-ui";
import { useEditMode } from "@/hooks/useEditMode";
import { buildChangedPayload, extractFormData } from "@/utils";
import { useEffect, useRef } from "react";
import useEditStore from "@/store/editStore";

interface OutletContext {
  handleSaveChanges: (
    pageName: string,
    changedPayload: Record<string, any>,
  ) => void;
  groupMetadata: Record<string, any> | null;
}

const BillingPageGrp = () => {
  const { id, candidateId } = useParams<{ id: string; candidateId?: string }>();
  const { getBillingData } = useGroupStore();
  const data = id ? getBillingData(id) : null;

  const { handleSaveChanges, groupMetadata } = useOutletContext<OutletContext>();
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

  const prefixedUpdateField = (fieldKey: string, value: any) => {
    updateField(fieldKey, value);
    updateLiveEntityField(`groupBilling.${fieldKey}`, value);
  };

  // After a successful save, reset originalData to current formData
  // so the next diff only captures truly new changes
  useEffect(() => {
    if (!lastSavedAt || isInitializing.current) return;
    setOriginalData(formData);
  }, [lastSavedAt]);

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
        handleSaveChanges("groupBilling", changedPayload);
      }
    }
  }, [formData, originalData, mode, handleSaveChanges]);

  useEffect(() => {
    if (mode === "edit" && data && groupMetadata) {
      isInitializing.current = true;
      setTimeout(() => {
        const metadataResponse = groupMetadata.groupBilling ?? null;
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
  }, [mode, data, groupMetadata, setMetadata, setFormData, setOriginalData]);

  if (!data) return <FailSafePage cardType="noData" />;

  // In edit mode, use liveEntityData so we show the user's in-progress changes (e.g. after switching tabs)
  const sourceData =
    mode === "edit" &&
    liveEntityData?.groupBilling &&
    Object.keys(liveEntityData.groupBilling).length > 0
      ? liveEntityData.groupBilling
      : data;

  const effectiveMetadata = mode === "edit" ? metadata : undefined;

  const billingOverviewData = renderBillingOverview(sourceData, effectiveMetadata);
  const billingCCMData = renderBillingCCM(sourceData, effectiveMetadata);

  return (
    <div>
      <Tabs defaultActiveKey="Overview" id="uncontrolled-tab-example" className={mode === "edit" ? "edit-mode" : ""}>
        <Tab eventKey="Overview" title="Overview">
          <RenderAllSections
            data={billingOverviewData}
            mode={mode}
            onFieldChange={prefixedUpdateField}
            formData={formData}
            errors={errors}
          />
        </Tab>
        <Tab eventKey="CCM" title="CCM">
          <RenderAllSections
            data={billingCCMData}
            mode={mode}
            onFieldChange={prefixedUpdateField}
            formData={formData}
            errors={errors}
          />
        </Tab>
      </Tabs>
    </div>
  );
};

export default BillingPageGrp;
