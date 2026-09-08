import { create } from "zustand";
import { setNestedValue } from "@/utils";

interface EditState {
  // Edit mode state
  editMetadata: Record<string, any>;
  editFormData: Record<string, any>;
  editOriginalData: Record<string, any>;
  editErrors: Record<string, string>;
  editHasChanges: boolean;

  // Live copy of the full entity data — reflects in-progress edits on top of the original API response
  liveEntityData: Record<string, any>;

  // Save payload state - stores nested structure of changed fields per page
  savePayload: Record<string, any>; // { billing: { overview: { ... } }, generalSettings: { ... } }

  // Lookup display names — maps fieldKey to display name so lookup fields
  // show the selected name (not the referenceId) after navigating away and back
  lookupDisplayNames: Record<string, string>;

  // Auto-save state
  isSaving: boolean;
  lastSavedAt: string | null;
  saveTimerId: NodeJS.Timeout | null;

  // Edit mode actions
  setEditMetadata: (metadata: Record<string, any>) => void;
  setEditFormData: (data: Record<string, any>) => void;
  setEditOriginalData: (data: Record<string, any>) => void;
  setEditErrors: (errors: Record<string, string>) => void;
  setEditHasChanges: (hasChanges: boolean) => void;
  updateEditFormField: (fieldKey: string, value: any) => void;
  updateLiveEntityField: (prefixedPath: string, value: any) => void;
  clearEditState: () => void;
  setLiveEntityData: (data: Record<string, any>) => void;

  // Save payload actions
  updateSavePayload: (pageName: string, payload: Record<string, any>) => void;
  clearSavePayload: () => void;

  // Lookup display name actions
  setLookupDisplayName: (fieldKey: string, displayName: string) => void;

  // Auto-save actions
  setIsSaving: (isSaving: boolean) => void;
  setLastSavedAt: (timestamp: string | null) => void;
  setSaveTimerId: (timerId: NodeJS.Timeout | null) => void;
}

const useEditStore = create<EditState>()((set) => ({
  // Edit mode state initialization
  editMetadata: {},
  editFormData: {},
  editOriginalData: {},
  editErrors: {},
  editHasChanges: false,
  liveEntityData: {},
  
  // Save payload initialization
  savePayload: {},

  // Lookup display names initialization
  lookupDisplayNames: {},

  // Auto-save state initialization
  isSaving: false,
  lastSavedAt: null,
  saveTimerId: null,

  // Edit mode actions
  setEditMetadata: (metadata: Record<string, any>) => set({ editMetadata: metadata }),
  setEditFormData: (data: Record<string, any>) => set({ editFormData: data }),
  setEditOriginalData: (data: Record<string, any>) => set({ editOriginalData: data }),
  setEditErrors: (errors: Record<string, string>) => set({ editErrors: errors }),
  setEditHasChanges: (hasChanges: boolean) => set({ editHasChanges: hasChanges }),
  
  updateEditFormField: (fieldKey: string, value: any) =>
    set((state) => {
      return {
        editFormData: { ...state.editFormData, [fieldKey]: value },
        editHasChanges: Object.keys(state.editFormData).some(
          (key) => (key === fieldKey ? value : state.editFormData[key]) !== state.editOriginalData[key]
        ),
      };
    }),

  updateLiveEntityField: (prefixedPath: string, value: any) =>
    set((state) => {
      if (Object.keys(state.liveEntityData).length === 0) return {};
      const updatedLiveEntityData = setNestedValue(state.liveEntityData, prefixedPath, value);
      return { liveEntityData: updatedLiveEntityData };
    }),
  
  clearEditState: () =>
    set(() => ({
      editMetadata: {},
      editFormData: {},
      editOriginalData: {},
      editErrors: {},
      editHasChanges: false,
      liveEntityData: {},
      savePayload: {},
      lookupDisplayNames: {},
      isSaving: false,
      lastSavedAt: null,
      saveTimerId: null,
    })),

  setLiveEntityData: (data: Record<string, any>) => set({ liveEntityData: data }),
  
  // Save payload actions
  updateSavePayload: (pageName: string, payload: Record<string, any>) =>
    set((state) => {
      const newSavePayload = {
        ...state.savePayload,
        [pageName]: payload,
      };
      return { savePayload: newSavePayload };
    }),
  
  clearSavePayload: () => {
    return set({ savePayload: {} });
  },

  // Lookup display name actions
  setLookupDisplayName: (fieldKey: string, displayName: string) =>
    set((state) => ({
      lookupDisplayNames: { ...state.lookupDisplayNames, [fieldKey]: displayName },
    })),

  // Auto-save actions
  setIsSaving: (isSaving: boolean) => set({ isSaving }),
  setLastSavedAt: (timestamp: string | null) => set({ lastSavedAt: timestamp }),
  setSaveTimerId: (timerId: NodeJS.Timeout | null) => set({ saveTimerId: timerId }),
}));

// Helper function to get the current save payload from outside components
export const getSavePayload = (): Record<string, any> => {
  const payload = useEditStore.getState().savePayload;
  return payload;
};

// Helper function to get save payload for a specific page
export const getPageSavePayload = (pageName: string): Record<string, any> | undefined => {
  const payload = useEditStore.getState().savePayload[pageName];
  return payload;
};

export default useEditStore;
