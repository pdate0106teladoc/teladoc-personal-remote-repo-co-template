import { useOutletContext, useParams } from "react-router-dom";
import ReportingDetails from "@/components/ReportingPage/ReportingDetails";
import useGroupStore from "@/store/useGroupStore";
import { FailSafePage } from "@ucc/common-ui";
import { useEditMode } from "@/hooks/useEditMode";
import { useAddReporting } from "@/hooks/useAddReporting";
import { withNewReportingFlag } from "@/data/newReportingTemplate";
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

const ReportingPageGrp = () => {
  const { id, candidateId } = useParams<{ id: string; candidateId?: string }>();
  const { getReportingData } = useGroupStore();
  const data = id ? getReportingData(id) : undefined;

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
    updateLiveEntityField(`groupReporting.${fieldKey}`, value);
  };

  // After a successful save, reset originalData to current formData
  // so the next diff only captures truly new changes
  useEffect(() => {
    if (!lastSavedAt || isInitializing.current) return;
    setOriginalData(formData);
  }, [lastSavedAt]);

  useEffect(() => {
    if (mode === "edit" && data && groupMetadata) {
      isInitializing.current = true;

      setTimeout(() => {
        const metadataResponse = groupMetadata.groupReporting ?? null;
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
            "groupReporting",
            isAddingReport
            ? withNewReportingFlag(changedPayload, newReportIndex)
            : changedPayload,
          );
        }
      }
    }, [formData, originalData, mode, handleSaveChanges, isAddingReport, newReportIndex]);

  if (!data) return <FailSafePage cardType="noData" />;

  // In edit mode, use liveEntityData so we show the user's in-progress changes (e.g. after switching tabs)
  const sourceData =
    mode === "edit" &&
    liveEntityData?.groupReporting &&
    Object.keys(liveEntityData.groupReporting).length > 0
      ? liveEntityData.groupReporting
      : data;

  return (
    <ReportingDetails
      data={sourceData}
      isGroup
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

export default ReportingPageGrp;
