import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import useEditStore from "@/store/editStore";

/**
 * Custom hook for pages to integrate with global edit mode
 * Provides edit mode state and helpers for form management
 * Mode is determined from URL params (presence of /edit/ in path)
 */
export const useEditMode = () => {
  const location = useLocation();
  const editMode = location.pathname.includes("/edit/") ? "edit" : "view";
  const editMetadata = useEditStore((state) => state.editMetadata);
  const editFormData = useEditStore((state) => state.editFormData);
  const editOriginalData = useEditStore((state) => state.editOriginalData);
  const editErrors = useEditStore((state) => state.editErrors);
  const editHasChanges = useEditStore((state) => state.editHasChanges);

  const setEditMetadata = useEditStore((state) => state.setEditMetadata);
  const setEditFormData = useEditStore((state) => state.setEditFormData);
  const setEditOriginalData = useEditStore((state) => state.setEditOriginalData);
  const setEditErrors = useEditStore((state) => state.setEditErrors);
  const setEditHasChanges = useEditStore((state) => state.setEditHasChanges);
  const updateEditFormField = useEditStore((state) => state.updateEditFormField);
  const updateLiveEntityField = useEditStore((state) => state.updateLiveEntityField);
  const clearEditState = useEditStore((state) => state.clearEditState);
  const liveEntityData = useEditStore((state) => state.liveEntityData);
  const setLiveEntityData = useEditStore((state) => state.setLiveEntityData);

  return {
    // State
    mode: editMode,
    metadata: editMetadata,
    formData: editFormData,
    originalData: editOriginalData,
    errors: editErrors,
    hasChanges: editHasChanges,
    liveEntityData,

    // Actions
    setMetadata: setEditMetadata,
    setFormData: setEditFormData,
    setOriginalData: setEditOriginalData,
    setErrors: setEditErrors,
    setHasChanges: setEditHasChanges,
    updateField: updateEditFormField,
    updateLiveEntityField,
    clearState: clearEditState,
    setLiveEntityData,
  };
};

/**
 * Hook to handle edit mode initialization for a page
 * Fetches metadata when entering edit mode and cleans up on unmount
 */
export const useEditModeInit = (
  fetchMetadata: () => Promise<any>,
  initializeFormData?: (metadata: any) => Record<string, any>
) => {
  const { mode, setMetadata, setFormData, setOriginalData, clearState } = useEditMode();

  useEffect(() => {
    const loadMetadata = async () => {
      if (mode === "edit") {
        try {
          const metadata = await fetchMetadata();
          setMetadata(metadata);

          // Initialize form data from metadata if provided
          if (initializeFormData) {
            const initialData = initializeFormData(metadata);
            setFormData(initialData);
            setOriginalData(initialData);
          }
        } catch (error) {
          console.error("Failed to fetch metadata:", error);
        }
      }
    };

    loadMetadata();
    return () => {
      clearState();
    };
  }, [mode]);

  return useEditMode();
};
