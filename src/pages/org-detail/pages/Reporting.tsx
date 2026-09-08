import { useOutletContext, useParams } from "react-router-dom";
import { ERROR_MESSAGES } from "@/constants";
import { useEffect, useState, useRef } from "react";
import ReportingDetails from "@/components/ReportingPage/ReportingDetails";
import useOrgStore from "@/store/useOrgStore";
import useConfigStore from "@/store/configStore";
import { Loader } from "@ucc/common-ui";
import { useEditMode } from "@/hooks/useEditMode";
import { useAddReporting } from "@/hooks/useAddReporting";
import { withNewReportingFlag } from "@/data/newReportingTemplate";
import { buildChangedPayload, extractFormData } from "@/utils";
import useEditStore from "@/store/editStore";

interface OutletContext {
  handleSaveChanges: (
    pageName: string,
    changedPayload: Record<string, any>,
  ) => void;
  orgMetadata: Record<string, any> | null;
}

const ReportingPage = () => {
  const { id, candidateId } = useParams<{ id: string; candidateId?: string }>();
  const { getReportingData } = useOrgStore();
  const data = id ? getReportingData(id) : undefined;
  const setOrg = useConfigStore((state) => state.setOrg);
  const [loading] = useState<boolean>(!data);

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

  const { isAddingReport, newReportIndex, startAddReport, discardNewReport } =
    useAddReporting({
      metadata,
      formData,
      originalData,
      setMetadata,
      setFormData,
      setOriginalData,
      isInitializing,
    });

  const prefixedUpdateField = (fieldKey: string, value: any) => {
    updateField(fieldKey, value);
    // The drafted report is not part of the entity until it saves; mirroring it
    // would leave a phantom card behind if the draft is discarded.
    if (isAddingReport) return;
    updateLiveEntityField(`organizationReporting.${fieldKey}`, value);
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
        handleSaveChanges(
          "organizationReporting",
          isAddingReport
            ? withNewReportingFlag(changedPayload, newReportIndex)
            : changedPayload,
        );
      }
    }
  }, [formData, originalData, mode, handleSaveChanges, isAddingReport, newReportIndex]);

  useEffect(() => {
    if (mode === "edit" && data && orgMetadata) {
      isInitializing.current = true;

      setTimeout(() => {
        const metadataResponse = orgMetadata.organizationReporting ?? null;
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
      updatedAt: data?.updatedAt || ""
    });
  }, [data, id, setOrg]);

  if (loading) return <Loader text="Loading..." />;
  if (!data) return <div>{ERROR_MESSAGES.NO_REPORTING_DATA}</div>;

  // In edit mode, use liveEntityData so we show the user's in-progress changes (e.g. after switching tabs)
  const sourceData =
    mode === "edit" &&
    liveEntityData?.organizationReporting &&
    Object.keys(liveEntityData.organizationReporting).length > 0
      ? liveEntityData.organizationReporting
      : data;

  return (
    <ReportingDetails
      data={sourceData}
      mode={mode}
      metadata={metadata}
      formData={formData}
      errors={errors}
      onFieldChange={prefixedUpdateField}
      isAddingReport={isAddingReport}
      newReportIndex={newReportIndex}
      onAddReport={startAddReport}
      onRemoveNewReport={discardNewReport}
    />
  );
};

export default ReportingPage;
